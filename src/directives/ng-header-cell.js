ngGridDirectives.directive('ngHeaderCell', ['$compile', function ($compile) {
    var ngHeaderCell = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    var html = $scope.col.headerCellTemplate;
                    iElement.html(html);
                    $compile(iElement.children())($scope);
                }
            };
        }
    };
    return ngHeaderCell;
}]);