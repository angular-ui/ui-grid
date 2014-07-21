(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.selection
   * @description
   *
   *  # ui.grid.selection
   * This module provides row, column, or cell selection
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
   *  @name ui.grid.selection.service:uiGridEditService
   *
   *  @description Services for selection features
   */
  module.service('uiGridSelectionService', ['$log', '$q', '$templateCache', 'uiGridConstants', 'gridUtil',
    function ($log, $q, $templateCache, uiGridConstants, gridUtil) {

      var service = {
        /**
         * @ngdoc function
         * @name toggleRowSelection
         * @methodOf ui.grid.class:Grid
         * @description Toggles row as selected or unselected
         * @param {GridRow} row row to select or deselect
         */
        toggleRowSelection: function (grid, row) {
          row.isSelected = !row.isSelected;
          grid.events.selection.rowSelectionChanged(row);
        },

        /**
         * @ngdoc function
         * @name getSelectedRows
         * @methodOf ui.grid.class:Grid
         * @description Returns all the selected rows
         */
        getSelectedRows: function (grid) {
          return grid.rows.filter(function (row) {
            return row.isSelected;
          });
        },


        /**
         * @ngdoc function
         * @name clearSelectedRows
         * @methodOf ui.grid.class:Grid
         * @description Clears all selected rows
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
   *  @description Adds editing features to the ui-grid directive.
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
   <div ui-grid="{ data: data, columnDefs: columnDefs }" ui-grid-edit></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridSelection', ['$log', 'uiGridSelectionConstants', function ($log, uiGridSelectionConstants) {
    return {
      replace: true,
      priority: 0,
      require: '^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            //  uiGridCtrl.grid.registerColumnBuilder(uiGridEditService.editColumnBuilder);
            uiGridCtrl.grid.events.registerEventsFromObject(uiGridSelectionConstants.publicEvents);
          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
          }
        };
      }
    };
  }]);

  module.directive('uiGridRenderCanvas',
    ['$compile', 'uiGridConstants', 'uiGridSelectionConstants', '$log', '$parse', 'uiGridSelectionService',
      function ($compile, uiGridConstants, uiGridSelectionConstants, $log, $parse, uiGridSelectionService) {
        return {
          priority: 2000, // run before default  directive
          restrict: 'A',
          scope: false,
          compile: function() {
            return {
              pre: function($scope, $elm, $attrs, controllers) {
                  $elm.removeClass('ui-grid-row');
                  $elm.attr("ng-class", "{'ui-grid-row-selected': row.isSelected, 'ui-grid-row' : !row.isSelected }");
              },
              post: function($scope, $elm, $attrs, controllers) {
              }
            };
          }
        };
      }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:uiGridCell
   *  @element div
   *  @restrict A
   *
   *  @description Stacks on top of ui.grid.uiGridCell to provide in-line editing capabilities to the cell
   *  Editing Actions.
   *
   *  Binds edit start events to the uiGridCell element.  When the events fire, the gridCell element is appended
   *  with the columnDef.editableCellTemplate element ('cellTextEditor.html' by default).
   *
   *  The editableCellTemplate should respond to uiGridEditConstants.events.BEGIN\_CELL\_EDIT angular event
   *  and do the initial steps needed to edit the cell (setfocus on input element, etc).
   *
   *  When the editableCellTemplate recognizes that the editing is ended (blur event, Enter key, etc.)
   *  it should emit the uiGridEditConstants.events.END\_CELL\_EDIT event.
   *
   *  If editableCellTemplate recognizes that the editing has been cancelled (esc key)
   *  it should emit the uiGridEditConstants.events.CANCEL\_CELL\_EDIT event.  The original value
   *  will be set back on the model by the uiGridCell directive.
   *
   *  Events that invoke editing:
   *    - dblclick
   *    - F2 keydown (when using cell selection)
   *
   *  Events that end editing:
   *    - Dependent on the specific editableCellTemplate
   *    - Standards should be blur and enter keydown
   *
   *  Events that cancel editing:
   *    - Dependent on the specific editableCellTemplate
   *    - Standards should be Esc keydown
   *
   *  Grid Events that end editing:
   *    - uiGridConstants.events.GRID_SCROLL
   *
   */
  module.directive('uiGridCell',
    ['$compile', 'uiGridConstants', 'uiGridSelectionConstants', '$log', '$parse', 'uiGridSelectionService',
      function ($compile, uiGridConstants, uiGridSelectionConstants, $log, $parse, uiGridSelectionService) {
        return {
          priority: -200, // run after default uiGridCell directive
          restrict: 'A',
          scope: false,
          link: function ($scope, $elm, $attrs) {
            registerRowSelectionEvents();

            function registerRowSelectionEvents() {
              $elm.on('click', function () {
                uiGridSelectionService.toggleRowSelection($scope.grid, $scope.row);
                $scope.$apply();
              });
            }
          }
        };
      }]);

})();