(function () {
  'use strict';
  var module = angular.module('ui.grid.cellNav', ['ui.grid', 'ui.grid.util']);

  function RowCol(row, col) {
    this.row = row;
    this.col = col;
  }

  /**
   *  @ngdoc object
   *  @name ui.grid.cellNav.constant:uiGridEditConstants
   *
   *  @description constants available in cellNav
   */
  module.constant('uiGridCellNavConstants', {
    direction: {LEFT: 0, RIGHT: 1, UP: 2, DOWN: 3}
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.cellNav.service:uiGridNavService
   *
   *  @description Services for editing features. If you don't like the key maps we use,
   *  override with a service decorator (see angular docs)
   */
  module.service('uiGridCellNavService', ['$log', 'uiGridConstants', 'uiGridCellNavConstants', '$q',
    function ($log, uiGridConstants, uiGridCellNavConstants, $q) {

      var service = {
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
            (evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey)) {
            return  uiGridCellNavConstants.direction.UP;
          }

          if (evt.keyCode === uiGridConstants.keymap.DOWN ||
            evt.keyCode === uiGridConstants.keymap.ENTER) {
            return  uiGridCellNavConstants.direction.DOWN;
          }

          return null;
        },

        getNextRowCol: function (direction, grid, curRow, curCol) {

          switch (direction) {
            case uiGridCellNavConstants.direction.LEFT:
              return service.getRowColLeft(grid, curRow, curCol);
            case uiGridCellNavConstants.direction.RIGHT:
              break;
            case uiGridCellNavConstants.direction.UP:
              break;
            case uiGridCellNavConstants.direction.DOWN:
              break;
          }
        },

        getRowColLeft: function (grid, curRow, curCol) {
          //todo: all columns must be filtered by allowCellFocus
          if (curCol.index === 0) {
            if (curRow.index === 0) {
              return new RowCol(curRow, curCol); //return same row and col
            }
            else {
              //up one row and far right column
              return new RowCol(grid.rows[curRow.index - 1], grid.columns[grid.columns.length - 1]);
            }
          }
          else {
            return new RowCol(curRow, grid.columns[curCol.index - 1]);
          }
        },

        /**
         * @ngdoc service
         * @name cellNavColumnBuilder
         * @methodOf ui.grid.edit.service:uiGridEditService
         * @description columnBuilder function that adds cell navigation properties to grid column
         * @returns {promise} promise that will load any needed templates when resolved
         */
        cellNavColumnBuilder: function (colDef, col, gridOptions) {
          var promises = [];

          col.allowCellFocus = colDef.allowCellFocus !== undefined ?
            colDef.allowCellFocus : true;

          return $q.all(promises);
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
   *  @description Adds editing features to the ui-grid directive.
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
        {field: 'name',
        {field: 'title'}
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
  module.directive('uiGridCellnav', ['$log', 'uiGridCellNavService',
    function ($log, uiGridCellNavService) {
      return {
        replace: true,
        priority: -150,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              //  $log.debug('uiGridEdit preLink');
              uiGridCtrl.grid.registerColumnBuilder(uiGridCellNavService.cellNavColumnBuilder);

            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
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
  module.directive('uiGridCell', ['uiGridCellNavService',
    function (uiGridCellNavService) {
      return {
        priority: -150, // run after default uiGridCell directive and ui.grid.edit uiGridCell
        restrict: 'A',
        require: '^uiGrid',
        scope: false,
        link: function ($scope, $elm, $attrs, uiGridCtrl) {
          if ($scope.col.allowCellFocus) {
            $elm.find('div').attr("tabindex", 0);
          }

          $elm.on('keydown', function (evt) {
            var direction = uiGridCellNavService.getDirection(evt);
            if (direction === null) {
              return true;
            }

            var rowCol = uiGridCellNavService.getNextRowCol(direction, $scope.grid, $scope.row, $scope.col);


            return false;
          });

        }
      };
    }]);

})();