(function () {
  'use strict';
  var module = angular.module('ui.grid.cellNav', ['ui.grid']);

  function RowCol(row, col) {
    this.row = row;
    this.col = col;
  }

  /**
   *  @ngdoc object
   *  @name ui.grid.cellNav.constant:uiGridCellNavConstants
   *
   *  @description constants available in cellNav
   */
  module.constant('uiGridCellNavConstants', {
    FEATURE_NAME: 'gridCellNav',
    CELL_NAV_EVENT: 'cellNav',
    direction: {LEFT: 0, RIGHT: 1, UP: 2, DOWN: 3, PG_UP: 4, PG_DOWN: 5},
    EVENT_TYPE: {
      KEYDOWN: 0,
      CLICK: 1,
      CLEAR: 2
    }
  });


  module.factory('uiGridCellNavFactory', ['gridUtil', 'uiGridConstants', 'uiGridCellNavConstants', '$q',
    function (gridUtil, uiGridConstants, uiGridCellNavConstants, $q) {
      /**
       *  @ngdoc object
       *  @name ui.grid.cellNav.object:CellNav
       *  @description returns a CellNav prototype function
       *  @param {object} rowContainer container for rows
       *  @param {object} colContainer parent column container
       *  @param {object} leftColContainer column container to the left of parent
       *  @param {object} rightColContainer column container to the right of parent
       */
      var UiGridCellNav = function UiGridCellNav(rowContainer, colContainer, leftColContainer, rightColContainer) {
        this.rows = rowContainer.visibleRowCache;
        this.columns = colContainer.visibleColumnCache;
        this.leftColumns = leftColContainer ? leftColContainer.visibleColumnCache : [];
        this.rightColumns = rightColContainer ? rightColContainer.visibleColumnCache : [];
        this.bodyContainer = rowContainer;
      };

      /** returns focusable columns of all containers */
      UiGridCellNav.prototype.getFocusableCols = function () {
        var allColumns = this.leftColumns.concat(this.columns, this.rightColumns);

        return allColumns.filter(function (col) {
          return col.colDef.allowCellFocus;
        });
      };

      /**
       *  @ngdoc object
       *  @name ui.grid.cellNav.api:GridRow
       *
       *  @description GridRow settings for cellNav feature, these are available to be
       *  set only internally (for example, by other features)
       */

      /**
       *  @ngdoc object
       *  @name allowCellFocus
       *  @propertyOf  ui.grid.cellNav.api:GridRow
       *  @description Enable focus on a cell within this row.  If set to false then no cells
       *  in this row can be focused - group header rows as an example would set this to false.
       *  <br/>Defaults to true
       */
      /** returns focusable rows */
      UiGridCellNav.prototype.getFocusableRows = function () {
        return this.rows.filter(function(row) {
          return row.allowCellFocus !== false;
        });
      };

      UiGridCellNav.prototype.getNextRowCol = function (direction, curRow, curCol) {
        switch (direction) {
          case uiGridCellNavConstants.direction.LEFT:
            return this.getRowColLeft(curRow, curCol);
          case uiGridCellNavConstants.direction.RIGHT:
            return this.getRowColRight(curRow, curCol);
          case uiGridCellNavConstants.direction.UP:
            return this.getRowColUp(curRow, curCol);
          case uiGridCellNavConstants.direction.DOWN:
            return this.getRowColDown(curRow, curCol);
          case uiGridCellNavConstants.direction.PG_UP:
            return this.getRowColPageUp(curRow, curCol);
          case uiGridCellNavConstants.direction.PG_DOWN:
            return this.getRowColPageDown(curRow, curCol);
        }

      };

      UiGridCellNav.prototype.initializeSelection = function () {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        if (focusableCols.length === 0 || focusableRows.length === 0) {
          return null;
        }

        var curRowIndex = 0;
        var curColIndex = 0;
        return new RowCol(focusableRows[0], focusableCols[0]); //return same row
      };

      UiGridCellNav.prototype.getRowColLeft = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 1
        if (curColIndex === -1) {
          curColIndex = 1;
        }

        var nextColIndex = curColIndex === 0 ? focusableCols.length - 1 : curColIndex - 1;

        //get column to left
        if (nextColIndex > curColIndex) {
          // On the first row
          // if (curRowIndex === 0 && curColIndex === 0) {
          //   return null;
          // }
          if (curRowIndex === 0) {
            return new RowCol(curRow, focusableCols[nextColIndex]); //return same row
          }
          else {
            //up one row and far right column
            return new RowCol(focusableRows[curRowIndex - 1], focusableCols[nextColIndex]);
          }
        }
        else {
          return new RowCol(curRow, focusableCols[nextColIndex]);
        }
      };



      UiGridCellNav.prototype.getRowColRight = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }
        var nextColIndex = curColIndex === focusableCols.length - 1 ? 0 : curColIndex + 1;

        if (nextColIndex < curColIndex) {
          if (curRowIndex === focusableRows.length - 1) {
            return new RowCol(curRow, focusableCols[nextColIndex]); //return same row
          }
          else {
            //down one row and far left column
            return new RowCol(focusableRows[curRowIndex + 1], focusableCols[nextColIndex]);
          }
        }
        else {
          return new RowCol(curRow, focusableCols[nextColIndex]);
        }
      };

      UiGridCellNav.prototype.getRowColDown = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }

        if (curRowIndex === focusableRows.length - 1) {
          return new RowCol(curRow, focusableCols[curColIndex]); //return same row
        }
        else {
          //down one row
          return new RowCol(focusableRows[curRowIndex + 1], focusableCols[curColIndex]);
        }
      };

      UiGridCellNav.prototype.getRowColPageDown = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }

        var pageSize = this.bodyContainer.minRowsToRender();
        if (curRowIndex >= focusableRows.length - pageSize) {
          return new RowCol(focusableRows[focusableRows.length - 1], focusableCols[curColIndex]); //return last row
        }
        else {
          //down one page
          return new RowCol(focusableRows[curRowIndex + pageSize], focusableCols[curColIndex]);
        }
      };

      UiGridCellNav.prototype.getRowColUp = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }

        if (curRowIndex === 0) {
          return new RowCol(curRow, focusableCols[curColIndex]); //return same row
        }
        else {
          //up one row
          return new RowCol(focusableRows[curRowIndex - 1], focusableCols[curColIndex]);
        }
      };

      UiGridCellNav.prototype.getRowColPageUp = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }

        var pageSize = this.bodyContainer.minRowsToRender();
        if (curRowIndex - pageSize < 0) {
          return new RowCol(focusableRows[0], focusableCols[curColIndex]); //return first row
        }
        else {
          //up one page
          return new RowCol(focusableRows[curRowIndex - pageSize], focusableCols[curColIndex]);
        }
      };
      return UiGridCellNav;
    }]);

  /**
   *  @ngdoc service
   *  @name ui.grid.cellNav.service:uiGridCellNavService
   *
   *  @description Services for cell navigation features. If you don't like the key maps we use,
   *  or the direction cells navigation, override with a service decorator (see angular docs)
   */
  module.service('uiGridCellNavService', ['gridUtil', 'uiGridConstants', 'uiGridCellNavConstants', '$q', 'uiGridCellNavFactory', 'ScrollEvent',
    function (gridUtil, uiGridConstants, uiGridCellNavConstants, $q, UiGridCellNav, ScrollEvent) {

      var service = {

        initializeGrid: function (grid) {
          grid.registerColumnBuilder(service.cellNavColumnBuilder);


          /**
           *  @ngdoc object
           *  @name ui.grid.cellNav:Grid.cellNav
           * @description cellNav properties added to grid class
           */
          grid.cellNav = {};
          grid.cellNav.lastRowCol = null;
          grid.cellNav.focusedCells = [];

          service.defaultGridOptions(grid.options);

          /**
           *  @ngdoc object
           *  @name ui.grid.cellNav.api:PublicApi
           *
           *  @description Public Api for cellNav feature
           */
          var publicApi = {
            events: {
              cellNav: {
                /**
                 * @ngdoc event
                 * @name navigate
                 * @eventOf  ui.grid.cellNav.api:PublicApi
                 * @description raised when the active cell is changed
                 * <pre>
                 *      gridApi.cellNav.on.navigate(scope,function(newRowcol, oldRowCol){})
                 * </pre>
                 * @param {object} newRowCol new position
                 * @param {object} oldRowCol old position
                 */
                navigate: function (newRowCol, oldRowCol) {},
                /**
                 * @ngdoc event
                 * @name viewPortKeyDown
                 * @eventOf  ui.grid.cellNav.api:PublicApi
                 * @description  is raised when the viewPort receives a keyDown event. Cells never get focus in uiGrid
                 * due to the difficulties of setting focus on a cell that is not visible in the viewport.  Use this
                 * event whenever you need a keydown event on a cell
                 * <br/>
                 * @param {object} event keydown event
                 * @param {object} rowCol current rowCol position
                 */
                viewPortKeyDown: function (event, rowCol) {}
              }
            },
            methods: {
              cellNav: {
                /**
                 * @ngdoc function
                 * @name scrollToFocus
                 * @methodOf  ui.grid.cellNav.api:PublicApi
                 * @description brings the specified row and column into view, and sets focus
                 * to that cell
                 * @param {object} rowEntity gridOptions.data[] array instance to make visible and set focus
                 * @param {object} colDef to make visible and set focus
                 * @returns {promise} a promise that is resolved after any scrolling is finished
                 */
                scrollToFocus: function (rowEntity, colDef) {
                  return service.scrollToFocus(grid, rowEntity, colDef);
                },

                /**
                 * @ngdoc function
                 * @name getFocusedCell
                 * @methodOf  ui.grid.cellNav.api:PublicApi
                 * @description returns the current (or last if Grid does not have focus) focused row and column
                 * <br> value is null if no selection has occurred
                 */
                getFocusedCell: function () {
                  return grid.cellNav.lastRowCol;
                },

                /**
                 * @ngdoc function
                 * @name getCurrentSelection
                 * @methodOf  ui.grid.cellNav.api:PublicApi
                 * @description returns an array containing the current selection
                 * <br> array is empty if no selection has occurred
                 */
                getCurrentSelection: function () {
                  return grid.cellNav.focusedCells;
                },

                /**
                 * @ngdoc function
                 * @name rowColSelectIndex
                 * @methodOf  ui.grid.cellNav.api:PublicApi
                 * @description returns the index in the order in which the RowCol was selected, returns -1 if the RowCol
                 * isn't selected
                 * @param {object} rowCol the rowCol to evaluate
                 */
                rowColSelectIndex: function (rowCol) {
                  //return gridUtil.arrayContainsObjectWithProperty(grid.cellNav.focusedCells, 'col.uid', rowCol.col.uid) &&
                  var index = -1;
                  for (var i = 0; i < grid.cellNav.focusedCells.length; i++) {
                    if (grid.cellNav.focusedCells[i].col.uid === rowCol.col.uid &&
                      grid.cellNav.focusedCells[i].row.uid === rowCol.row.uid) {
                      index = i;
                      break;
                    }
                  }
                  return index;
                }
              }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);

          grid.api.registerMethodsFromObject(publicApi.methods);

        },

        defaultGridOptions: function (gridOptions) {
          /**
           *  @ngdoc object
           *  @name ui.grid.cellNav.api:GridOptions
           *
           *  @description GridOptions for cellNav feature, these are available to be
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           *  @ngdoc object
           *  @name modifierKeysToMultiSelectCells
           *  @propertyOf  ui.grid.cellNav.api:GridOptions
           *  @description Enable multiple cell selection only when using the ctrlKey or shiftKey.
           *  <br/>Defaults to false
           */
          gridOptions.modifierKeysToMultiSelectCells = gridOptions.modifierKeysToMultiSelectCells === true;

        },

        /**
         * @ngdoc service
         * @name decorateRenderContainers
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @description  decorates grid renderContainers with cellNav functions
         */
        decorateRenderContainers: function (grid) {

          var rightContainer = grid.hasRightContainer() ? grid.renderContainers.right : null;
          var leftContainer = grid.hasLeftContainer() ? grid.renderContainers.left : null;

          if (leftContainer !== null) {
            grid.renderContainers.left.cellNav = new UiGridCellNav(grid.renderContainers.body, leftContainer, rightContainer, grid.renderContainers.body);
          }
          if (rightContainer !== null) {
            grid.renderContainers.right.cellNav = new UiGridCellNav(grid.renderContainers.body, rightContainer, grid.renderContainers.body, leftContainer);
          }

          grid.renderContainers.body.cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, leftContainer, rightContainer);
        },

        /**
         * @ngdoc service
         * @name getDirection
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @description  determines which direction to for a given keyDown event
         * @returns {uiGridCellNavConstants.direction} direction
         */
        getDirection: function (evt) {
          if (evt.keyCode === uiGridConstants.keymap.LEFT ||
            (evt.keyCode === uiGridConstants.keymap.TAB && evt.shiftKey)) {
            return uiGridCellNavConstants.direction.LEFT;
          }
          if (evt.keyCode === uiGridConstants.keymap.RIGHT ||
            evt.keyCode === uiGridConstants.keymap.TAB) {
            return uiGridCellNavConstants.direction.RIGHT;
          }

          if (evt.keyCode === uiGridConstants.keymap.UP ||
            (evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey) ) {
            return uiGridCellNavConstants.direction.UP;
          }

          if (evt.keyCode === uiGridConstants.keymap.PG_UP){
            return uiGridCellNavConstants.direction.PG_UP;
          }

          if (evt.keyCode === uiGridConstants.keymap.DOWN ||
            evt.keyCode === uiGridConstants.keymap.ENTER) {
            return uiGridCellNavConstants.direction.DOWN;
          }

          if (evt.keyCode === uiGridConstants.keymap.PG_DOWN){
            return uiGridCellNavConstants.direction.PG_DOWN;
          }

          return null;
        },

        /**
         * @ngdoc service
         * @name cellNavColumnBuilder
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @description columnBuilder function that adds cell navigation properties to grid column
         * @returns {promise} promise that will load any needed templates when resolved
         */
        cellNavColumnBuilder: function (colDef, col, gridOptions) {
          var promises = [];

          /**
           *  @ngdoc object
           *  @name ui.grid.cellNav.api:ColumnDef
           *
           *  @description Column Definitions for cellNav feature, these are available to be
           *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
           */

          /**
           *  @ngdoc object
           *  @name allowCellFocus
           *  @propertyOf  ui.grid.cellNav.api:ColumnDef
           *  @description Enable focus on a cell within this column.
           *  <br/>Defaults to true
           */
          colDef.allowCellFocus = colDef.allowCellFocus === undefined ? true : colDef.allowCellFocus;

          return $q.all(promises);
        },

        /**
         * @ngdoc method
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @name scrollToFocus
         * @description Scroll the grid such that the specified
         * row and column is in view, and set focus to the cell in that row and column
         * @param {Grid} grid the grid you'd like to act upon, usually available
         * from gridApi.grid
         * @param {object} rowEntity gridOptions.data[] array instance to make visible and set focus to
         * @param {object} colDef to make visible and set focus to
         * @returns {promise} a promise that is resolved after any scrolling is finished
         */
        scrollToFocus: function (grid, rowEntity, colDef) {
          var gridRow = null, gridCol = null;

          if (typeof(rowEntity) !== 'undefined' && rowEntity !== null) {
            gridRow = grid.getRow(rowEntity);
          }

          if (typeof(colDef) !== 'undefined' && colDef !== null) {
            gridCol = grid.getColumn(colDef.name ? colDef.name : colDef.field);
          }
          return grid.api.core.scrollToIfNecessary(gridRow, gridCol).then(function () {
            var rowCol = { row: gridRow, col: gridCol };

            // Broadcast the navigation
            grid.cellNav.broadcastCellNav(rowCol);
          });



        },


        /**
         * @ngdoc method
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @name getLeftWidth
         * @description Get the current drawn width of the columns in the
         * grid up to the numbered column, and add an apportionment for the
         * column that we're on.  So if we are on column 0, we want to scroll
         * 0% (i.e. exclude this column from calc).  If we're on the last column
         * we want to scroll to 100% (i.e. include this column in the calc). So
         * we include (thisColIndex / totalNumberCols) % of this column width
         * @param {Grid} grid the grid you'd like to act upon, usually available
         * from gridApi.grid
         * @param {gridCol} upToCol the column to total up to and including
         */
        getLeftWidth: function (grid, upToCol) {
          var width = 0;

          if (!upToCol) {
            return width;
          }

          var lastIndex = grid.renderContainers.body.visibleColumnCache.indexOf( upToCol );

          // total column widths up-to but not including the passed in column
          grid.renderContainers.body.visibleColumnCache.forEach( function( col, index ) {
            if ( index < lastIndex ){
              width += col.drawnWidth;
            }
          });

          // pro-rata the final column based on % of total columns.
          var percentage = lastIndex === 0 ? 0 : (lastIndex + 1) / grid.renderContainers.body.visibleColumnCache.length;
          width += upToCol.drawnWidth * percentage;

          return width;
        }
      };

      return service;
    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.cellNav.directive:uiCellNav
   *  @element div
   *  @restrict EA
   *
   *  @description Adds cell navigation features to the grid columns
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.cellNav']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
      ];

      $scope.columnDefs = [
        {name: 'name'},
        {name: 'title'}
      ];
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="{ data: data, columnDefs: columnDefs }" ui-grid-cellnav></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridCellnav', ['gridUtil', 'uiGridCellNavService', 'uiGridCellNavConstants', 'uiGridConstants', '$timeout',
    function (gridUtil, uiGridCellNavService, uiGridCellNavConstants, uiGridConstants, $timeout) {
      return {
        replace: true,
        priority: -150,
        require: '^uiGrid',
        scope: false,
        controller: function () {},
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              var _scope = $scope;

              var grid = uiGridCtrl.grid;
              uiGridCellNavService.initializeGrid(grid);

              uiGridCtrl.cellNav = {};

              uiGridCtrl.cellNav.getActiveCell = function () {
                var elms = $elm[0].getElementsByClassName('ui-grid-cell-focus');
                if (elms.length > 0){
                  return elms[0];
                }

                return undefined;
              };

              uiGridCtrl.cellNav.broadcastCellNav = grid.cellNav.broadcastCellNav = function (newRowCol, modifierDown) {
                modifierDown = !(modifierDown === undefined || !modifierDown);
                uiGridCtrl.cellNav.broadcastFocus(newRowCol, modifierDown);
                _scope.$broadcast(uiGridCellNavConstants.CELL_NAV_EVENT, newRowCol, modifierDown);
              };

              uiGridCtrl.cellNav.clearFocus = grid.cellNav.clearFocus = function () {
                _scope.$broadcast(uiGridCellNavConstants.CELL_NAV_EVENT, { eventType: uiGridCellNavConstants.EVENT_TYPE.CLEAR });
              };

              uiGridCtrl.cellNav.broadcastFocus = function (rowCol, modifierDown) {
                modifierDown = !(modifierDown === undefined || !modifierDown);

                var row = rowCol.row,
                  col = rowCol.col;

                var rowColSelectIndex = uiGridCtrl.grid.api.cellNav.rowColSelectIndex(rowCol);

                if (grid.cellNav.lastRowCol === null || rowColSelectIndex === -1) {
                  var newRowCol = new RowCol(row, col);

                  grid.api.cellNav.raise.navigate(newRowCol, grid.cellNav.lastRowCol);
                  grid.cellNav.lastRowCol = newRowCol;
                  if (uiGridCtrl.grid.options.modifierKeysToMultiSelectCells && modifierDown) {
                    grid.cellNav.focusedCells.push(rowCol);
                  } else {
                    grid.cellNav.focusedCells = [rowCol];
                  }
                } else if (grid.options.modifierKeysToMultiSelectCells && modifierDown &&
                  rowColSelectIndex >= 0) {

                  grid.cellNav.focusedCells.splice(rowColSelectIndex, 1);
                }
              };

              uiGridCtrl.cellNav.handleKeyDown = function (evt) {
                var direction = uiGridCellNavService.getDirection(evt);
                if (direction === null) {
                  return null;
                }

                var containerId = 'body';
                if (evt.uiGridTargetRenderContainerId) {
                  containerId = evt.uiGridTargetRenderContainerId;
                }

                // Get the last-focused row+col combo
                var lastRowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
                if (lastRowCol) {
                  // Figure out which new row+combo we're navigating to
                  var rowCol = uiGridCtrl.grid.renderContainers[containerId].cellNav.getNextRowCol(direction, lastRowCol.row, lastRowCol.col);
                  var focusableCols = uiGridCtrl.grid.renderContainers[containerId].cellNav.getFocusableCols();

                  // Shift+tab on top-left cell should exit cellnav on render container
                  if (
                    // Navigating left
                    direction === uiGridCellNavConstants.direction.LEFT &&
                    // New col is last col (i.e. wrap around)
                    rowCol.col === focusableCols[focusableCols.length - 1] &&
                    // Staying on same row, which means we're at first row
                    rowCol.row === lastRowCol.row &&
                    evt.keyCode === uiGridConstants.keymap.TAB &&
                    evt.shiftKey
                  ) {
                    uiGridCtrl.cellNav.clearFocus();
                    return true;
                  }
                  // Tab on bottom-right cell should exit cellnav on render container
                  else if (
                    direction === uiGridCellNavConstants.direction.RIGHT &&
                    // New col is first col (i.e. wrap around)
                    rowCol.col === focusableCols[0] &&
                    // Staying on same row, which means we're at first row
                    rowCol.row === lastRowCol.row &&
                    evt.keyCode === uiGridConstants.keymap.TAB &&
                    !evt.shiftKey
                  ) {
                    uiGridCtrl.cellNav.clearFocus();
                    return true;
                  }

                  // Scroll to the new cell, if it's not completely visible within the render container's viewport
                  grid.scrollToIfNecessary(rowCol.row, rowCol.col).then(function () {
                    uiGridCtrl.cellNav.broadcastCellNav(rowCol);
                  });


                  evt.stopPropagation();
                  evt.preventDefault();

                  return false;
                }
              };
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }]);

  module.directive('uiGridRenderContainer', ['$timeout', '$document', 'gridUtil', 'uiGridConstants', 'uiGridCellNavService', 'uiGridCellNavConstants','$log',
    function ($timeout, $document, gridUtil, uiGridConstants, uiGridCellNavService, uiGridCellNavConstants, $log) {
      return {
        replace: true,
        priority: -99999, //this needs to run very last
        require: ['^uiGrid', 'uiGridRenderContainer', '?^uiGridCellnav'],
        scope: false,
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0],
                 renderContainerCtrl = controllers[1];

              // Skip attaching cell-nav specific logic if the directive is not attached above us
              if (!uiGridCtrl.grid.api.cellNav) { return; }

              var containerId = renderContainerCtrl.containerId;

              var grid = uiGridCtrl.grid;

              // Needs to run last after all renderContainers are built
              uiGridCellNavService.decorateRenderContainers(grid);

              ////enable tabbing to renderContainer
              //$elm.attr("tabindex", -1);
              //
              //$elm.on('focus', function (evt) {
              //  var rowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
              //  if (!rowCol) {
              //    rowCol = grid.renderContainers.body.cellNav.initializeSelection();
              //    uiGridCtrl.cellNav.broadcastCellNav(rowCol);
              //  }
              //});

            }
          };
        }
      };
    }]);

  module.directive('uiGridViewport', ['$timeout', '$document', 'gridUtil', 'uiGridConstants', 'uiGridCellNavService', 'uiGridCellNavConstants','$log',
    function ($timeout, $document, gridUtil, uiGridConstants, uiGridCellNavService, uiGridCellNavConstants, $log) {
      return {
        replace: true,
        priority: -99999, //this needs to run very last
        require: ['^uiGrid', '^uiGridRenderContainer', '?^uiGridCellnav'],
        scope: false,
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0],
                renderContainerCtrl = controllers[1];

              // Skip attaching cell-nav specific logic if the directive is not attached above us
              if (!uiGridCtrl.grid.api.cellNav) { return; }

              var containerId = renderContainerCtrl.containerId;

              var grid = uiGridCtrl.grid;


              // Let the render container be focus-able
              $elm.attr("tabindex", -1);

              // Bind to keydown events in the render container
              $elm.on('keydown', function (evt) {
                evt.uiGridTargetRenderContainerId = containerId;
                var rowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
                var result = uiGridCtrl.cellNav.handleKeyDown(evt);
                if (result === null) {
                  uiGridCtrl.grid.api.cellNav.raise.viewPortKeyDown(evt, rowCol);
                }
              });

              grid.api.core.on.scrollBegin($scope, function (args) {

                // Skip if there's no currently-focused cell
                var lastRowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
                if (lastRowCol == null) {
                  return;
                }

                //if not in my container, move on
                //todo: worry about horiz scroll
                if (!renderContainerCtrl.colContainer.containsColumn(lastRowCol.col)) {
                  return;
                }

                //clear dom of focused cell

                var elements = $elm[0].getElementsByClassName('ui-grid-cell-focus');
                Array.prototype.forEach.call(elements,function(e){angular.element(e).removeClass('ui-grid-cell-focus');});

              });

              grid.api.core.on.scrollEnd($scope, function (args) {
                // Skip if there's no currently-focused cell
                var lastRowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
                if (lastRowCol == null) {
                  return;
                }

                //if not in my container, move on
                //todo: worry about horiz scroll
                if (!renderContainerCtrl.colContainer.containsColumn(lastRowCol.col)) {
                  return;
                }

                uiGridCtrl.cellNav.broadcastCellNav(lastRowCol);

              });

              grid.api.cellNav.on.navigate($scope, function () {
                //focus the viewport because this can sometimes be lost
                $elm[0].focus();
              });

            }
          };
        }
      };
    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.cellNav.directive:uiGridCell
   *  @element div
   *  @restrict A
   *  @description Stacks on top of ui.grid.uiGridCell to provide cell navigation
   */
  module.directive('uiGridCell', ['$timeout', '$document', 'uiGridCellNavService', 'gridUtil', 'uiGridCellNavConstants', 'uiGridConstants',
    function ($timeout, $document, uiGridCellNavService, gridUtil, uiGridCellNavConstants, uiGridConstants) {
      return {
        priority: -150, // run after default uiGridCell directive and ui.grid.edit uiGridCell
        restrict: 'A',
        require: '^uiGrid',
        scope: false,
        link: function ($scope, $elm, $attrs, uiGridCtrl) {
          // Skip attaching cell-nav specific logic if the directive is not attached above us
          if (!uiGridCtrl.grid.api.cellNav) { return; }

          if (!$scope.col.colDef.allowCellFocus) {
            return;
          }

          // When a cell is clicked, broadcast a cellNav event saying that this row+col combo is now focused
          $elm.find('div').on('click', function (evt) {
            uiGridCtrl.cellNav.broadcastCellNav(new RowCol($scope.row, $scope.col), evt.ctrlKey || evt.metaKey);

            evt.stopPropagation();
            $scope.$apply();
          });

          $elm.find('div').on('focus', function (evt) {
            uiGridCtrl.cellNav.broadcastCellNav(new RowCol($scope.row, $scope.col), evt.ctrlKey || evt.metaKey);
          });

          // This event is fired for all cells.  If the cell matches, then focus is set
          $scope.$on(uiGridCellNavConstants.CELL_NAV_EVENT, function (evt, rowCol, modifierDown) {
            if (evt.eventType === uiGridCellNavConstants.EVENT_TYPE.CLEAR) {
              clearFocus();
              return;
            }

            if (rowCol.row === $scope.row &&
              rowCol.col === $scope.col) {
              if (uiGridCtrl.grid.options.modifierKeysToMultiSelectCells && modifierDown &&
                uiGridCtrl.grid.api.cellNav.rowColSelectIndex(rowCol) === -1) {
                clearFocus();
              } else {
                setFocused();
              }

             // // This cellNav event came from a keydown event so we can safely refocus
             // if (rowCol.hasOwnProperty('eventType') && rowCol.eventType === uiGridCellNavConstants.EVENT_TYPE.KEYDOWN) {
             ////   $elm.find('div')[0].focus();
             // }
            }
            else if (!(uiGridCtrl.grid.options.modifierKeysToMultiSelectCells && modifierDown)) {
              clearFocus();
            }
          });

          function setFocused() {
            var div = $elm.find('div');
            div.addClass('ui-grid-cell-focus');
          }

          function clearFocus() {
            var div = $elm.find('div');
            div.removeClass('ui-grid-cell-focus');
          }

          $scope.$on('$destroy', function () {
            $elm.find('div').off('click');
          });
        }
      };
    }]);

})();
