ngGridDirectives.directive('ngCell', ['$compile', function($compile) {
    var ngCell = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    if ($scope.col.cellTemplate.then) {
                        $scope.col.cellTemplate.then(function (resp) {
                            iElement.html(resp.data);
                            $compile(iElement.children())($scope);
                        });
                    } else {
                        iElement.html($scope.col.cellTemplate);
                        $compile(iElement.children())($scope);
                    }
                }
            };
        }
    };
    return ngCell;
}]);