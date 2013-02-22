ngGridDirectives.directive('ngViewport', [function() {
    return function($scope, elm) {
        var isMouseWheelActive = false;
        var prevScollLeft = 0;
        var prevScollTop = 0;
        elm.bind('scroll', function(evt) {
            var scrollLeft = evt.target.scrollLeft,
                scrollTop = evt.target.scrollTop;
            if ($scope.$headerContainer) {
                $scope.$headerContainer.scrollLeft(scrollLeft);
            }
            $scope.adjustScrollLeft(scrollLeft);
            $scope.adjustScrollTop(scrollTop);
            if (!$scope.$root.$$phase) {
                $scope.$digest();
            }
            if ($scope.enableCellSelection && (document.activeElement == null || document.activeElement.className.indexOf('ngViewport') == -1) && !isMouseWheelActive) {
                $scope.domAccessProvider.focusCellElement($scope);
            }
            prevScollLeft = scrollLeft;
            prevScollTop = prevScollTop;
            isMouseWheelActive = false;
            return true;
        });
        elm.bind("mousewheel DOMMouseScroll", function(evt) {
            isMouseWheelActive = true;
            return true;
        });
        if (!$scope.enableCellSelection) {
            $scope.domAccessProvider.selectionHandlers($scope, elm);
        }
    };
}]);