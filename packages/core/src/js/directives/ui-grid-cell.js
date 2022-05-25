angular.module('ui.grid').directive('uiGridCell', ['$compile', '$parse', 'gridUtil', 'uiGridConstants', function ($compile, $parse, gridUtil, uiGridConstants) {
  return {
    priority: 0,
    scope: false,
    require: '?^uiGrid',
    compile: function() {
      return {
        pre: function($scope, $elm, $attrs, uiGridCtrl) {
          function compileTemplate() {
            var compiledElementFn = $scope.col.compiledElementFn;

            compiledElementFn($scope, function(clonedElement, scope) {
              $elm.append(clonedElement);
            });
          }

          // If the grid controller is present, use it to get the compiled cell template function
          if (uiGridCtrl && $scope.col.compiledElementFn) {
             compileTemplate();
          }

          // No controller, compile the element manually (for unit tests)
          else {
            if ( uiGridCtrl && !$scope.col.compiledElementFn ) {
              $scope.col.getCompiledElementFn()
                .then(function (compiledElementFn) {
                  compiledElementFn($scope, function(clonedElement, scope) {
                    $elm.append(clonedElement);
                  });
                }).catch(angular.noop);
            }
            else {
              var html = $scope.col.cellTemplate
                .replace(uiGridConstants.MODEL_COL_FIELD, 'row.entity.' + gridUtil.preEval($scope.col.field))
                .replace(uiGridConstants.COL_FIELD, 'grid.getCellValue(row, col)');

              var cellElement = $compile(html)($scope);
              $elm.append(cellElement);
            }
          }
        },
        post: function($scope, $elm) {
          var initColClass = $scope.col.getColClass(false),
            classAdded;

          $elm.addClass(initColClass);

          function updateClass( grid ) {
            var contents = $elm;

            if ( classAdded ) {
              contents.removeClass( classAdded );
              classAdded = null;
            }

            if (angular.isFunction($scope.col.cellClass)) {
              classAdded = $scope.col.cellClass($scope.grid, $scope.row, $scope.col, $scope.rowRenderIndex, $scope.colRenderIndex);
            }
            else {
              classAdded = $scope.col.cellClass;
            }
            contents.addClass(classAdded);
          }

          if ($scope.col.cellClass) {
            updateClass();
          }

          // Register a data change watch that would get triggered whenever someone edits a cell or modifies column defs
          var dataChangeDereg = $scope.grid.registerDataChangeCallback( updateClass, [uiGridConstants.dataChange.COLUMN, uiGridConstants.dataChange.EDIT]);

          // watch the col and row to see if they change - which would indicate that we've scrolled or sorted or otherwise
          // changed the row/col that this cell relates to, and we need to re-evaluate cell classes and maybe other things
          function cellChangeFunction( n, o ) {
            if ( n !== o ) {
              if ( classAdded || $scope.col.cellClass ) {
                updateClass();
              }

              // See if the column's internal class has changed
              var newColClass = $scope.col.getColClass(false);

              if (newColClass !== initColClass) {
                $elm.removeClass(initColClass);
                $elm.addClass(newColClass);
                initColClass = newColClass;
              }
            }
          }

          // TODO(c0bra): Turn this into a deep array watch
          var rowWatchDereg = $scope.$watch( 'row', cellChangeFunction );

          function deregisterFunction() {
            dataChangeDereg();
            rowWatchDereg();
          }

          $scope.$on('$destroy', deregisterFunction);
          $elm.on('$destroy', deregisterFunction);
        }
      };
    }
  };
}]);
