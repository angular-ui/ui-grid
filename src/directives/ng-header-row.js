ngGridDirectives.directive('ngHeaderRow', ['$compile', function($compile) {
    var ngHeaderRow = {
        scope: false,
        compile: function() {
            return {
                pre: function($scope, iElement) {
                    if (iElement.children().length === 0) {
                       iElement.append($compile($scope.headerRowTemplate)($scope));
                    }
                }
            };
        }
    };
    return ngHeaderRow;
}]);