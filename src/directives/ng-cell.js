ngGridDirectives.directive('ngCell', ['$compile', function($compile) {
    var ngCell = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    if ($scope.col.cellTemplate.then) {
                        $scope.col.cellTemplate.then(function (resp) {
                            iElement.html($compile(resp.data)($scope));
                        });
                    } else {
                        iElement.html($compile($scope.col.cellTemplate)($scope));
                    }
                }
            };
        }
    };
    return ngCell;
}]);