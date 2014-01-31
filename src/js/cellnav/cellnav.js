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
    direction: {LEFT: 0, RIGHT: 1, UP: 2, DOWN: 3}
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.cellNav.service:uiGridCellNavService
   *
   *  @description Services for cell navigation features. If you don't like the key maps we use,
   *  or the direction cells navigation, override with a service decorator (see angular docs)
   */
  module.service('uiGridCellNavService', ['$log', 'uiGridConstants', 'uiGridCellNavConstants', '$q',
    function ($log, uiGridConstants, uiGridCellNavConstants, $q) {

      var service = {
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
            (evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey)) {
            return  uiGridCellNavConstants.direction.UP;
          }

          if (evt.keyCode === uiGridConstants.keymap.DOWN ||
            evt.keyCode === uiGridConstants.keymap.ENTER) {
            return  uiGridCellNavConstants.direction.DOWN;
          }

          return null;
        },

        /**
         * @ngdoc service
         * @name getNextRowCol
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @description  returns the next row and column for a given direction
         * columns that are not focusable are skipped
         * @param {object} direction navigation direction
         * @param {Grid} grid current grid
         * @param {GridRow} curRow Gridrow
         * @param {GridCol} curCol Gridcol
         * @returns {uiGridCellNavConstants.direction} rowCol object
         */
        getNextRowCol: function (direction, grid, curRow, curCol) {
          switch (direction) {
            case uiGridCellNavConstants.direction.LEFT:
              return service.getRowColLeft(grid.rows, grid.columns, curRow, curCol);
            case uiGridCellNavConstants.direction.RIGHT:
              return service.getRowColRight(grid.rows, grid.columns, curRow, curCol);
            case uiGridCellNavConstants.direction.UP:
              return service.getRowColUp(grid.rows, grid.columns, curRow, curCol);
            case uiGridCellNavConstants.direction.DOWN:
              return service.getRowColDown(grid.rows, grid.columns, curRow, curCol);
          }
        },

        getRowColLeft: function (rows, cols, curRow, curCol) {
          var colIndex = service.getNextColIndexLeft(cols, curCol);

          if (colIndex > curCol.index) {
            if (curRow.index === 0) {
              return new RowCol(curRow, cols[colIndex]); //return same row
            }
            else {
              //up one row and far right column
              return new RowCol(rows[curRow.index - 1], cols[colIndex]);
            }
          }
          else {
            return new RowCol(curRow, cols[colIndex]);
          }
        },

        getRowColRight: function (rows, cols, curRow, curCol) {
          var colIndex = service.getNextColIndexRight(cols, curCol);

          if (colIndex < curCol.index) {
            if (curRow.index === rows.length - 1) {
              return new RowCol(curRow, cols[colIndex]); //return same row
            }
            else {
              //down one row and far left column
              return new RowCol(rows[curRow.index + 1], cols[colIndex]);
            }
          }
          else {
            return new RowCol(curRow, cols[colIndex]);
          }
        },

        getNextColIndexLeft: function (cols, curCol) {
          //start with next col to the left or the end of the array if curCol is the first col
          var i = curCol.index === 0 ? cols.length - 1 : curCol.index - 1;

          //find first focusable column to the left
          //circle around to the end of the array if no col is found
          while (i !== curCol.index) {
            if (cols[i].allowCellFocus) {
              break;
            }
            i--;
            //go to end of array if at the beginning
            if (i === -1) {
              i = cols.length - 1;
            }
          }

          return i;
        },

        getNextColIndexRight: function (cols, curCol) {
          //start with next col to the right or the beginning of the array if curCol is the last col
          var i = curCol.index === cols.length - 1 ? 0 : curCol.index + 1;

          //find first focusable column to the right
          //circle around to the beginning of the array if no col is found
          while (i !== curCol.index) {
            if (cols[i].allowCellFocus) {
              break;
            }
            i++;
            //go to end of array if at the beginning
            if (i > cols.length - 1) {
              i = 0;
            }
          }

          return i;
        },

        getRowColUp: function (rows, cols, curRow, curCol) {
          //if curCol is not focusable, then we need to find a focusable column to the right
          //this shouldn't ever happen in the grid, but we handle it anyway
          var colIndex = curCol.allowCellFocus ? curCol.index : service.getNextColIndexRight(cols, curCol);


          if (curRow.index === 0) {
            return new RowCol(curRow,  cols[colIndex]); //return same row
          }
          else {
            //up one row
            return new RowCol(rows[curRow.index - 1], cols[colIndex]);
          }
        },

        getRowColDown: function (rows, cols, curRow, curCol) {
          //if curCol is not focusable, then we need to find a focusable column to the right
          //this shouldn't ever happen in the grid, but we handle it anyway
          var colIndex = curCol.allowCellFocus ? curCol.index : service.getNextColIndexRight(cols, curCol);


          if (curRow.index === rows.length - 1) {
            return new RowCol(curRow, cols[colIndex]); //return same row
          }
          else {
            //down one row
            return new RowCol(rows[curRow.index + 1], cols[colIndex]);
          }
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
  module.directive('uiGridCell', ['uiGridCellNavService', '$log',
    function (uiGridCellNavService, $log) {
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

            //todo: issue # 926
            //uiGridCtrl.setFocus(rowCol.row, rowCol.col);
            $log.debug('next row ' + rowCol.row.index + ' next Col ' + rowCol.col.colDef.name );

            return false;
          });

        }
      };
    }]);

})();