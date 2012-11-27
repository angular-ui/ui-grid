ngGridDirectives.directive('ngHeaderRow', ['$compile', function($compile) {
    var ngHeaderRow = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    if (iElement.children().length == 0) {
                        var html = $scope.headerRowTemplate;
                        iElement.append($compile(html)($scope));
                    }
                }
            };
        }
    };
    return ngHeaderRow;
}]);