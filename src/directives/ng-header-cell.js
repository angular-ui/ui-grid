ngGridDirectives.directive('ngHeaderCell', ['$compile', function ($compile) {
    var ngHeaderCell = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    if ($scope.col.headerCellTemplate.then) {
                        $scope.col.headerCellTemplate.then(function (resp) {
                            iElement.html($compile(resp.data)($scope));
                        });
                    } else {
                        iElement.html($compile($scope.col.headerCellTemplate)($scope));
                    }
                }
            };
        }
    };
    return ngHeaderCell;
}]);