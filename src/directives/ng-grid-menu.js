ngGridDirectives.directive('ngGridMenu', ['$compile', '$templateCache', function ($compile, $templateCache) {
    var ngGridMenu = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    if (iElement.children().length === 0) {
                        iElement.append($compile($templateCache.get($scope.gridId + 'menuTemplate.html'))($scope));
                    }
                }
            };
        }
    };
    return ngGridMenu;
}]);