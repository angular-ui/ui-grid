ngGridDirectives.directive('ngHeaderCell', ['$compile', function($compile) {
    var ngHeaderCell = {
        scope: false,
        compile: function() {
            return {
                pre: function($scope, iElement) {
                    iElement.append($compile($scope.col.headerCellTemplate)($scope));
                    // put $scope back on the element so element.scope() works even when
                    // $compileProvider.debugInfoEnabled(false);
                    iElement.data('$scope', $scope);
                }
            };
        }
    };
    return ngHeaderCell;
}]);
