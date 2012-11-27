ngGridDirectives.directive('ngCell', ['$compile', function($compile) {
    var ngCell = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    var html = $scope.col.cellTemplate;
                    iElement.append($compile(html)($scope));
                }
            };
        }
    };
    return ngCell;
}]);