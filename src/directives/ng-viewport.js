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
            $scope.adjustScrollLeft(scrollLeft);
            $scope.adjustScrollTop(scrollTop);
            if (!$scope.$root.$$phase) {
                $scope.$digest();
            }
            prevScollLeft = scrollLeft;
            prevScollTop = prevScollTop;
            isMouseWheelActive = false;
            return true;
        });
        elm.bind("mousewheel DOMMouseScroll", function(evt) {
            isMouseWheelActive = true;
			elm.focus();
            return true;
        });
        if (!$scope.enableCellSelection) {
            $scope.domAccessProvider.selectionHandlers($scope, elm);
        }
    };
}]);