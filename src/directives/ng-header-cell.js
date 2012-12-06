ngGridDirectives.directive('ngHeaderCell', ['$compile', function ($compile) {
    var ngHeaderCell = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    if ($scope.col.headerCellTemplate.then) {
                        $scope.col.headerCellTemplate.then(function (resp) {
                            iElement.html(resp.data);
                            $compile(iElement.children())($scope);
                        });
                    } else {
                        iElement.html($scope.col.headerCellTemplate);
                        $compile(iElement.children())($scope);
                    }
                }
            };
        }
    };
    return ngHeaderCell;
}]);