angular.module('ui.grid').directive('uiGridCell', ['$compile', '$log', '$parse', 'gridUtil', 'uiGridConstants', function ($compile, $log, $parse, gridUtil, uiGridConstants) {
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
              $elm.empty().append(clonedElement);
            });
          }

          // If the grid controller is present, use it to get the compiled cell template function
          if (uiGridCtrl) {
            $scope.getCellValue = uiGridCtrl.getCellValue;

            compileTemplate();

            $scope.$watch('col.cellTemplate', function (n, o) {
              if (n !== o) {
                compileTemplate();
              }
            });
          }
          // No controller, compile the element manually
          else {
            var html = $scope.col.cellTemplate
              .replace(uiGridConstants.COL_FIELD, 'getCellValue(row, col)');
            var cellElement = $compile(html)($scope);
            $elm.append(cellElement);
          }
        }
        //post: function($scope, $elm, $attrs) {}
      };
    }
  };

  return uiGridCell;
}]);

