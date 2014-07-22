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
    //available public events; listed here for convenience and IDE's use it for smart completion
    publicEvents: {
      selection: {
        rowSelectionChanged: function (scope, row) {
        }
      }
    }
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.selection.service:uiGridSelectionService
   *
   *  @description Services for selection features
   */
  module.service('uiGridSelectionService', ['$log', '$q', '$templateCache', 'uiGridConstants', 'gridUtil',
    function ($log, $q, $templateCache, uiGridConstants, gridUtil) {

      var service = {

        defaultGridOptions: function (gridOptions) {
          //default option to true unless it was explicitly set to false
          gridOptions.enableRowSelection = gridOptions.enableRowSelection !== false;
          gridOptions.multiSelect = gridOptions.multiSelect !== false;
        },

        /**
         * @ngdoc function
         * @name toggleRowSelection
         * @methodOf  ui.grid.selection.service:uiGridSelectionService
         * @description Toggles row as selected or unselected
         * @param {Grid} grid grid object
         * @param {GridRow} row row to select or deselect
         * @param {bool} multiSelect if false, only one row at time can be selected
         */
        toggleRowSelection: function (grid, row, multiSelect) {
          var selected = row.isSelected;
          if (!multiSelect && !selected) {
            service.clearSelectedRows(grid);
          }
          row.isSelected = !selected;
          grid.events.selection.rowSelectionChanged(row);
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
          service.getSelectedRows(grid).forEach(function (row) {
            row.isSelected = false;
            grid.events.selection.rowSelectionChanged(row);
          });
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
   var app = angular.module('app', ['ui.grid', 'ui.grid.edit']);

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
  module.directive('uiGridSelection', ['$log', 'uiGridSelectionConstants', 'uiGridSelectionService',
    function ($log, uiGridSelectionConstants, uiGridSelectionService) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              uiGridSelectionService.defaultGridOptions(uiGridCtrl.grid.options);
              uiGridCtrl.grid.events.registerEventsFromObject(uiGridSelectionConstants.publicEvents);
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
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
    ['$compile', 'uiGridConstants', 'uiGridSelectionConstants', '$log', '$parse', 'uiGridSelectionService',
      function ($compile, uiGridConstants, uiGridSelectionConstants, $log, $parse, uiGridSelectionService) {
        return {
          priority: -200, // run after default  directive
          scope: false,
          compile: function ($elm, $attrs) {
            var rowRepeatDiv = angular.element($elm.children().children()[0]);
            rowRepeatDiv.removeClass('ui-grid-row');
            rowRepeatDiv.attr("ng-class", "{'ui-grid-row-selected': row.isSelected, 'ui-grid-row' : !row.isSelected }");
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
    ['$compile', 'uiGridConstants', 'uiGridSelectionConstants', '$log', '$parse', 'uiGridSelectionService',
      function ($compile, uiGridConstants, uiGridSelectionConstants, $log, $parse, uiGridSelectionService) {
        return {
          priority: -200, // run after default uiGridCell directive
          restrict: 'A',
          scope: false,
          link: function ($scope, $elm, $attrs) {
            if ($scope.grid.options.enableRowSelection) {
              registerRowSelectionEvents();
            }

            function registerRowSelectionEvents() {
              $elm.on('click', function () {
                uiGridSelectionService.toggleRowSelection($scope.grid, $scope.row, $scope.grid.options.multiSelect);
                $scope.$apply();
              });
            }
          }
        };
      }]);

})();