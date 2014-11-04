(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.selection
   * @description
   *
   *  # ui.grid.selection
   * This module provides row selection
   * <br/>
   * <br/>
   *
   * <div doc-module-components="ui.grid.selection"></div>
   */

  var module = angular.module('ui.grid.selection', ['ui.grid']);

  /**
   *  @ngdoc object
   *  @name ui.grid.selection.constant:uiGridSelectionConstants
   *
   *  @description constants available in selection module
   */
  module.constant('uiGridSelectionConstants', {
    featureName: "selection",
    selectionRowHeaderColName: 'selectionRowHeaderCol'
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.selection.service:uiGridSelectionService
   *
   *  @description Services for selection features
   */
  module.service('uiGridSelectionService', ['$q', '$templateCache', 'uiGridSelectionConstants', 'gridUtil',
    function ($q, $templateCache, uiGridSelectionConstants, gridUtil) {

      var service = {

        initializeGrid: function (grid) {

          //add feature namespace and any properties to grid for needed state
          grid.selection = {};
          grid.selection.lastSelectedRow = null;
          grid.selection.selectAll = false;

          service.defaultGridOptions(grid.options);

          /**
           *  @ngdoc object
           *  @name ui.grid.selection.api:PublicApi
           *
           *  @description Public Api for selection feature
           */
          var publicApi = {
            events: {
              selection: {
                /**
                 * @ngdoc event
                 * @name rowSelectionChanged
                 * @eventOf  ui.grid.selection.api:PublicApi
                 * @description  is raised after the row.isSelected state is changed
                 * @param {GridRow} row the row that was selected/deselected
                 */
                rowSelectionChanged: function (scope, row) {
                },
                /**
                 * @ngdoc event
                 * @name rowSelectionChangedBatch
                 * @eventOf  ui.grid.selection.api:PublicApi
                 * @description  is raised after the row.isSelected state is changed
                 * in bulk, if the `enableSelectionBatchEvent` option is set to true
                 * (which it is by default).  This allows more efficient processing 
                 * of bulk events.
                 * @param {array} rows the rows that were selected/deselected
                 */
                rowSelectionChangedBatch: function (scope, rows) {
                }
              }
            },
            methods: {
              selection: {
                /**
                 * @ngdoc function
                 * @name toggleRowSelection
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Toggles data row as selected or unselected
                 * @param {object} rowEntity gridOptions.data[] array instance
                 */
                toggleRowSelection: function (rowEntity) {
                  var row = grid.getRow(rowEntity);
                  if (row !== null) {
                    service.toggleRowSelection(grid, row, grid.options.multiSelect, grid.options.noUnselect);
                  }
                },
                /**
                 * @ngdoc function
                 * @name selectRow
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Select the data row
                 * @param {object} rowEntity gridOptions.data[] array instance
                 */
                selectRow: function (rowEntity) {
                  var row = grid.getRow(rowEntity);
                  if (row !== null && !row.isSelected) {
                    service.toggleRowSelection(grid, row, grid.options.multiSelect, grid.options.noUnselect);
                  }
                },
                /**
                 * @ngdoc function
                 * @name selectRowByVisibleIndex
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Select the specified row by visible index (i.e. if you
                 * specify row 0 you'll get the first visible row selected).  In this context
                 * visible means of those rows that are theoretically visible (i.e. not filtered),
                 * rather than rows currently rendered on the screen.
                 * @param {number} index index within the rowsVisible array
                 */
                selectRowByVisibleIndex: function ( rowNum ) {
                  var row = grid.renderContainers.body.visibleRowCache[rowNum];
                  if (row !== null && !row.isSelected) {
                    service.toggleRowSelection(grid, row, grid.options.multiSelect, grid.options.noUnselect);
                  }
                },
                /**
                 * @ngdoc function
                 * @name unSelectRow
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description UnSelect the data row
                 * @param {object} rowEntity gridOptions.data[] array instance
                 */
                unSelectRow: function (rowEntity) {
                  var row = grid.getRow(rowEntity);
                  if (row !== null && row.isSelected) {
                    service.toggleRowSelection(grid, row, grid.options.multiSelect, grid.options.noUnselect);
                  }
                },
                /**
                 * @ngdoc function
                 * @name selectAllRows
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Selects all rows.  Does nothing if multiSelect = false
                 */
                selectAllRows: function () {
                  if (grid.options.multiSelect === false) {
                    return;
                  }

                  var changedRows = [];
                  grid.rows.forEach(function (row) {
                    if ( !row.isSelected ){
                      row.isSelected = true;
                      service.decideRaiseSelectionEvent( grid, row, changedRows );
                    }
                  });
                  service.decideRaiseSelectionBatchEvent( grid, changedRows );
                },
                /**
                 * @ngdoc function
                 * @name selectAllVisibleRows
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Selects all visible rows.  Does nothing if multiSelect = false
                 */
                selectAllVisibleRows: function () {
                  if (grid.options.multiSelect === false) {
                    return;
                  }

                  var changedRows = [];
                  grid.rows.forEach(function (row) {
                    if (row.visible) {
                      if (!row.isSelected){
                        row.isSelected = true;
                        service.decideRaiseSelectionEvent( grid, row, changedRows );
                      }
                    } else {
                      if (row.isSelected){
                        row.isSelected = false;
                        service.decideRaiseSelectionEvent( grid, row, changedRows );
                      }
                    }
                  });
                  service.decideRaiseSelectionBatchEvent( grid, changedRows );
                },
                /**
                 * @ngdoc function
                 * @name clearSelectedRows
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Unselects all rows
                 */
                clearSelectedRows: function () {
                  service.clearSelectedRows(grid);
                },
                /**
                 * @ngdoc function
                 * @name getSelectedRows
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description returns all selectedRow's entity references
                 */
                getSelectedRows: function () {
                  return service.getSelectedRows(grid).map(function (gridRow) {
                    return gridRow.entity;
                  });
                },
                /**
                 * @ngdoc function
                 * @name getSelectedGridRows
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description returns all selectedRow's as gridRows
                 */
                getSelectedGridRows: function () {
                  return service.getSelectedRows(grid);
                },
                /**
                 * @ngdoc function
                 * @name setMultiSelect
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Sets the current gridOption.multiSelect to true or false
                 * @param {bool} multiSelect true to allow multiple rows
                 */
                setMultiSelect: function (multiSelect) {
                  grid.options.multiSelect = multiSelect;
                },
                /**
                 * @ngdoc function
                 * @name setModifierKeysToMultiSelect
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Sets the current gridOption.modifierKeysToMultiSelect to true or false
                 * @param {bool} modifierKeysToMultiSelect true to only allow multiple rows when using ctrlKey or shiftKey is used
                 */
                setModifierKeysToMultiSelect: function (modifierKeysToMultiSelect) {
                  grid.options.modifierKeysToMultiSelect = modifierKeysToMultiSelect;
                },
                /**
                 * @ngdoc function
                 * @name getSelectAllState
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Returns whether or not the selectAll checkbox is currently ticked.  The
                 * grid doesn't automatically select rows when you add extra data - so when you add data
                 * you need to explicitly check whether the selectAll is set, and then call setVisible rows
                 * if it is
                 * @param {bool} modifierKeysToMultiSelect true to only allow multiple rows when using ctrlKey or shiftKey is used
                 */
                getSelectAllState: function (grid) {
                  return grid.selection.selectAll;
                }
                
              }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);

          grid.api.registerMethodsFromObject(publicApi.methods);

        },

        defaultGridOptions: function (gridOptions) {
          //default option to true unless it was explicitly set to false
          /**
           *  @ngdoc object
           *  @name ui.grid.selection.api:GridOptions
           *
           *  @description GridOptions for selection feature, these are available to be  
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           *  @ngdoc object
           *  @name enableRowSelection
           *  @propertyOf  ui.grid.selection.api:GridOptions
           *  @description Enable row selection for entire grid.
           *  <br/>Defaults to true
           */
          gridOptions.enableRowSelection = gridOptions.enableRowSelection !== false;
          /**
           *  @ngdoc object
           *  @name multiSelect
           *  @propertyOf  ui.grid.selection.api:GridOptions
           *  @description Enable multiple row selection for entire grid
           *  <br/>Defaults to true
           */
          gridOptions.multiSelect = gridOptions.multiSelect !== false;
          /**
           *  @ngdoc object
           *  @name noUnselect
           *  @propertyOf  ui.grid.selection.api:GridOptions
           *  @description Prevent a row from being unselected.  Works in conjunction
           *  with `multiselect = false` and `gridApi.selection.selectRow()` to allow
           *  you to create a single selection only grid - a row is always selected, you
           *  can only select different rows, you can't unselect the row.
           *  <br/>Defaults to false
           */
          gridOptions.noUnselect = gridOptions.noUnselect === true;
          /**
           *  @ngdoc object
           *  @name modifierKeysToMultiSelect
           *  @propertyOf  ui.grid.selection.api:GridOptions
           *  @description Enable multiple row selection only when using the ctrlKey or shiftKey. Requires multiSelect to be true.
           *  <br/>Defaults to false
           */
          gridOptions.modifierKeysToMultiSelect = gridOptions.modifierKeysToMultiSelect === true;
          /**
           *  @ngdoc object
           *  @name enableRowHeaderSelection
           *  @propertyOf  ui.grid.selection.api:GridOptions
           *  @description Enable a row header to be used for selection
           *  <br/>Defaults to true
           */
          gridOptions.enableRowHeaderSelection = gridOptions.enableRowHeaderSelection !== false;
          /**
           *  @ngdoc object
           *  @name enableSelectAll
           *  @propertyOf  ui.grid.selection.api:GridOptions
           *  @description Enable the select all checkbox at the top of the selectionRowHeader
           *  <br/>Defaults to true
           */
          gridOptions.enableSelectAll = gridOptions.enableSelectAll !== false;
          /**
           *  @ngdoc object
           *  @name enableSelectionBatchEvent
           *  @propertyOf  ui.grid.selection.api:GridOptions
           *  @description If selected rows are changed in bulk, either via the API or
           *  via the selectAll checkbox, then a separate event is fired.  Setting this
           *  option to false will cause the rowSelectionChanged event to be called multiple times
           *  instead  
           *  <br/>Defaults to true
           */
          gridOptions.enableSelectionBatchEvent = gridOptions.enableSelectionBatchEvent !== false;
        },

        /**
         * @ngdoc function
         * @name toggleRowSelection
         * @methodOf  ui.grid.selection.service:uiGridSelectionService
         * @description Toggles row as selected or unselected
         * @param {Grid} grid grid object
         * @param {GridRow} row row to select or deselect
         * @param {bool} multiSelect if false, only one row at time can be selected
         * @param {bool} noUnselect if true then rows cannot be unselected
         */
        toggleRowSelection: function (grid, row, multiSelect, noUnselect) {
          var selected = row.isSelected;

          if (!multiSelect && !selected) {
            service.clearSelectedRows(grid);
          } else if (!multiSelect && selected) {
            var selectedRows = service.getSelectedRows(grid);
            if (selectedRows.length > 1) {
              selected = false; // Enable reselect of the row
              service.clearSelectedRows(grid);
            }
          }
          
          if (selected && noUnselect){
            // don't deselect the row 
          } else {
            row.isSelected = !selected;
            if (row.isSelected === true) {
              grid.selection.lastSelectedRow = row;
            }
            grid.api.selection.raise.rowSelectionChanged(row);
          }
        },
        /**
         * @ngdoc function
         * @name shiftSelect
         * @methodOf  ui.grid.selection.service:uiGridSelectionService
         * @description selects a group of rows from the last selected row using the shift key
         * @param {Grid} grid grid object
         * @param {GridRow} clicked row
         * @param {bool} multiSelect if false, does nothing this is for multiSelect only
         */
        shiftSelect: function (grid, row, multiSelect) {
          if (!multiSelect) {
            return;
          }
          var selectedRows = service.getSelectedRows(grid);
          var fromRow = selectedRows.length > 0 ? grid.renderContainers.body.visibleRowCache.indexOf(grid.selection.lastSelectedRow) : 0;
          var toRow = grid.renderContainers.body.visibleRowCache.indexOf(row);
          //reverse select direction
          if (fromRow > toRow) {
            var tmp = fromRow;
            fromRow = toRow;
            toRow = tmp;
          }
          
          var changedRows = [];
          for (var i = fromRow; i <= toRow; i++) {
            var rowToSelect = grid.renderContainers.body.visibleRowCache[i];
            if (rowToSelect) {
              if ( !rowToSelect.isSelected ){
                rowToSelect.isSelected = true;
                grid.selection.lastSelectedRow = rowToSelect;
                service.decideRaiseSelectionEvent( grid, rowToSelect, changedRows );
              }
            }
          }
          service.decideRaiseSelectionBatchEvent( grid, changedRows );
        },
        /**
         * @ngdoc function
         * @name getSelectedRows
         * @methodOf  ui.grid.selection.service:uiGridSelectionService
         * @description Returns all the selected rows
         * @param {Grid} grid grid object
         */
        getSelectedRows: function (grid) {
          return grid.rows.filter(function (row) {
            return row.isSelected;
          });
        },

        /**
         * @ngdoc function
         * @name clearSelectedRows
         * @methodOf  ui.grid.selection.service:uiGridSelectionService
         * @description Clears all selected rows
         * @param {Grid} grid grid object
         */
        clearSelectedRows: function (grid) {
          var changedRows = [];
          service.getSelectedRows(grid).forEach(function (row) {
            if ( row.isSelected ){
              row.isSelected = false;
              service.decideRaiseSelectionEvent( grid, row, changedRows );
            }
          });
          service.decideRaiseSelectionBatchEvent( grid, changedRows );
        },
        
        /**
         * @ngdoc function
         * @name decideRaiseSelectionEvent
         * @methodOf  ui.grid.selection.service:uiGridSelectionService
         * @description Decides whether to raise a single event or a batch event
         * @param {Grid} grid grid object
         * @param {GridRow} row row that has changed
         * @param {array} changedRows an array to which we can append the changed
         * row if we're doing batch events
         */
        decideRaiseSelectionEvent: function( grid, row, changedRows ){
          if ( !grid.options.enableSelectionBatchEvent ){
            grid.api.selection.raise.rowSelectionChanged(row);
          } else {
            changedRows.push(row);
          }
        },
        
        /**
         * @ngdoc function
         * @name raiseSelectionEvent
         * @methodOf  ui.grid.selection.service:uiGridSelectionService
         * @description Decides whether we need to raise a batch event, and 
         * raises it if we do.
         * @param {Grid} grid grid object
         * @param {array} changedRows an array of changed rows, only populated
         * if we're doing batch events
         */
        decideRaiseSelectionBatchEvent: function( grid, changedRows ){
          if ( changedRows.length > 0 ){
            grid.api.selection.raise.rowSelectionChangedBatch(changedRows);
          }
        }        
      };

      return service;

    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.selection.directive:uiGridSelection
   *  @element div
   *  @restrict A
   *
   *  @description Adds selection features to grid
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.selection']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
      ];

      $scope.columnDefs = [
        {name: 'name', enableCellEdit: true},
        {name: 'title', enableCellEdit: true}
      ];
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="{ data: data, columnDefs: columnDefs }" ui-grid-selection></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridSelection', ['uiGridSelectionConstants', 'uiGridSelectionService', '$templateCache',
    function (uiGridSelectionConstants, uiGridSelectionService, $templateCache) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              uiGridSelectionService.initializeGrid(uiGridCtrl.grid);
              if (uiGridCtrl.grid.options.enableRowHeaderSelection) {
                var selectionRowHeaderDef = {
                  name: uiGridSelectionConstants.selectionRowHeaderColName,
                  displayName: '',
                  width: 40,
                  cellTemplate: 'ui-grid/selectionRowHeader',
                  headerCellTemplate: 'ui-grid/selectionHeaderCell',
                  enableColumnResizing: false,
                  enableColumnMenu: false
                };

                uiGridCtrl.grid.addRowHeaderColumn(selectionRowHeaderDef);
              }
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {

            }
          };
        }
      };
    }]);

  module.directive('uiGridSelectionRowHeaderButtons', ['$templateCache', 'uiGridSelectionService',
    function ($templateCache, uiGridSelectionService) {
      return {
        replace: true,
        restrict: 'E',
        template: $templateCache.get('ui-grid/selectionRowHeaderButtons'),
        scope: true,
        require: '^uiGrid',
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var self = uiGridCtrl.grid;
          $scope.selectButtonClick = function(row, evt) {
            if (evt.shiftKey) {
              uiGridSelectionService.shiftSelect(self, row, self.options.multiSelect);
            }
            else if (evt.ctrlKey || evt.metaKey) {
              uiGridSelectionService.toggleRowSelection(self, row, self.options.multiSelect, self.options.noUnselect); 
            }
            else {
              uiGridSelectionService.toggleRowSelection(self, row, (self.options.multiSelect && !self.options.modifierKeysToMultiSelect), self.options.noUnselect);
            }
          };
        }
      };
    }]);

  module.directive('uiGridSelectionSelectAllButtons', ['$templateCache', 'uiGridSelectionService',
    function ($templateCache, uiGridSelectionService) {
      return {
        replace: true,
        restrict: 'E',
        template: $templateCache.get('ui-grid/selectionSelectAllButtons'),
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var self = $scope.col.grid;
          
          $scope.headerButtonClick = function(row, evt) {
            if ( self.selection.selectAll ){
              uiGridSelectionService.clearSelectedRows(self);
              if ( self.options.noUnselect ){
                self.api.selection.selectRowByVisibleIndex(0);
              }
              self.selection.selectAll = false;
            } else {
              if ( self.options.multiSelect ){
                self.api.selection.selectAllVisibleRows();
                self.selection.selectAll = true;
              }
            }
          };
        }
      };
    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.selection.directive:uiGridViewport
   *  @element div
   *
   *  @description Stacks on top of ui.grid.uiGridViewport to alter the attributes used
   *  for the grid row
   */
  module.directive('uiGridViewport',
    ['$compile', 'uiGridConstants', 'uiGridSelectionConstants', 'gridUtil', '$parse', 'uiGridSelectionService',
      function ($compile, uiGridConstants, uiGridSelectionConstants, gridUtil, $parse, uiGridSelectionService) {
        return {
          priority: -200, // run after default  directive
          scope: false,
          compile: function ($elm, $attrs) {
            var rowRepeatDiv = angular.element($elm.children().children()[0]);

            var existingNgClass = rowRepeatDiv.attr("ng-class");
            var newNgClass = '';
            if ( existingNgClass ) {
              newNgClass = existingNgClass.slice(0, -1) + ",'ui-grid-row-selected': row.isSelected}";
            } else {
              newNgClass = "{'ui-grid-row-selected': row.isSelected}";
            }
            rowRepeatDiv.attr("ng-class", newNgClass);

            return {
              pre: function ($scope, $elm, $attrs, controllers) {

              },
              post: function ($scope, $elm, $attrs, controllers) {
              }
            };
          }
        };
      }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.selection.directive:uiGridCell
   *  @element div
   *  @restrict A
   *
   *  @description Stacks on top of ui.grid.uiGridCell to provide selection feature
   */
  module.directive('uiGridCell',
    ['$compile', 'uiGridConstants', 'uiGridSelectionConstants', 'gridUtil', '$parse', 'uiGridSelectionService',
      function ($compile, uiGridConstants, uiGridSelectionConstants, gridUtil, $parse, uiGridSelectionService) {
        return {
          priority: -200, // run after default uiGridCell directive
          restrict: 'A',
          scope: false,
          link: function ($scope, $elm, $attrs) {

            if ($scope.grid.options.enableRowSelection && !$scope.grid.options.enableRowHeaderSelection) {
              $elm.addClass('ui-grid-disable-selection');
              registerRowSelectionEvents();
            }

            function registerRowSelectionEvents() {
              var touchStartTime = 0;
              var touchTimeout = 300;
              var selectCells = function(evt){
                if (evt.shiftKey) {
                  uiGridSelectionService.shiftSelect($scope.grid, $scope.row, $scope.grid.options.multiSelect);
                }
                else if (evt.ctrlKey || evt.metaKey) {
                  uiGridSelectionService.toggleRowSelection($scope.grid, $scope.row, $scope.grid.options.multiSelect, $scope.grid.options.noUnselect);
                }
                else {
                  uiGridSelectionService.toggleRowSelection($scope.grid, $scope.row, ($scope.grid.options.multiSelect && !$scope.grid.options.modifierKeysToMultiSelect), $scope.grid.options.noUnselect);
                }
                $scope.$apply();
              };

              $elm.on('touchstart', function(event) {
                touchStartTime = (new Date()).getTime();
              });

              $elm.on('touchend', function (evt) {
                var touchEndTime = (new Date()).getTime();
                var touchTime = touchEndTime - touchStartTime;

                if (touchTime < touchTimeout ) {
                  // short touch
                  selectCells(evt);
                }
              });

              $elm.on('click', function (evt) {
                selectCells(evt);
              });
            }
          }
        };
      }]);

})();
