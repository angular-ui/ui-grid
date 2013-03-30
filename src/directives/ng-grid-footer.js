ngGridDirectives.directive('ngGridFooter', ['$compile', '$templateCache', function ($compile, $templateCache) {
    var ngGridFooter = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    if (iElement.children().length === 0) {
                        iElement.append($compile($templateCache.get($scope.gridId + 'footerTemplate.html'))($scope));
                    }
                }
            };
        }
    };
    return ngGridFooter;
}]);