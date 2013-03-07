ngGridDirectives.directive('ngHeaderRow', ['$compile', '$templateCache', function ($compile, $templateCache) {
    var ngHeaderRow = {
        scope: false,
        compile: function() {
            return {
                pre: function($scope, iElement) {
                    if (iElement.children().length === 0) {
                        iElement.append($compile($templateCache.get('headerRowTemplate.html'))($scope));
                    }
                }
            };
        }
    };
    return ngHeaderRow;
}]);