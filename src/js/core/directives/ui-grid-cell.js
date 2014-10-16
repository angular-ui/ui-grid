angular.module('ui.grid').directive('uiGridCell', ['$compile', '$parse', 'gridUtil', 'uiGridConstants', function ($compile, $parse, gridUtil, uiGridConstants) {
  var uiGridCell = {
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
            if ( uiGridCtrl && !$scope.col.compiledElementFn ){
              // gridUtil.logError('Render has been called before precompile.  Please log a ui-grid issue');  

              $scope.col.getCompiledElementFn()
                .then(function (compiledElementFn) {
                  compiledElementFn($scope, function(clonedElement, scope) {
                    $elm.append(clonedElement);
                  });
                });
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
        post: function($scope, $elm, $attrs, uiGridCtrl) {
          $elm.addClass($scope.col.getColClass(false));

          var classAdded;
          var updateClass = function( grid ){
            var contents = $elm;
            if ( classAdded ){
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
          };

          if ($scope.col.cellClass) {
            updateClass();
          }
          
          // Register a data change watch that would get triggered whenever someone edits a cell or modifies column defs
          var watchUid = $scope.grid.registerDataChangeCallback( updateClass, [uiGridConstants.dataChange.COLUMN, uiGridConstants.dataChange.EDIT]);
          
          var deregisterFunction = function() {
           $scope.grid.deregisterDataChangeCallback( watchUid ); 
          };
          
          $scope.$on( '$destroy', deregisterFunction );
        }
      };
    }
  };

  return uiGridCell;
}]);

