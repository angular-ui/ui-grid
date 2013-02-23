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
            var hscroll = prevScollLeft != scrollLeft;
            var goingRight = prevScollLeft < scrollLeft;
            var vscroll = prevScollTop != scrollTop;
            var aeScope = angular.element(document.activeElement.parentElement).scope().$parent;
            $scope.adjustScrollLeft(scrollLeft);
            $scope.adjustScrollTop(scrollTop);
            if (!$scope.$root.$$phase) {
                $scope.$digest();
            }
            if ($scope.enableCellSelection && (document.activeElement == null || document.activeElement.className.indexOf('ngViewport') == -1) && !isMouseWheelActive) {
                if (vscroll) $scope.domAccessProvider.focusCellElement($scope);
                if (hscroll && aeScope) {
                    var index = aeScope.$index + (goingRight ? 1 : -1);
                    $scope.domAccessProvider.focusCellElement($scope, index);
                }
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