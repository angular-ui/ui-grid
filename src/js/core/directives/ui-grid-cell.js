angular.module('ui.grid').directive('uiGridCell', ['$compile', '$log', '$parse', 'gridUtil', 'uiGridConstants', function ($compile, $log, $parse, gridUtil, uiGridConstants) {
  var uiGridCell = {
    priority: 0,
    scope: false,
    require: '?^uiGrid',
    compile: function() {
      return {
        pre: function($scope, $elm, $attrs, uiGridCtrl) {
          // If the grid controller is present, use it to get the compiled cell template function
          if (uiGridCtrl) {
            var compiledElementFn = $scope.col.compiledElementFn;

            $scope.getCellValue = uiGridCtrl.getCellValue;

            compiledElementFn($scope, function(clonedElement, scope) {
              $elm.append(clonedElement);
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

