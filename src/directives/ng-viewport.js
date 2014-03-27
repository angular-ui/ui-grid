ngGridDirectives.directive('ngViewport', ['$rtlUtilityService', function(rtlUtilityService) {
    return function($scope, elm) {
        var isMouseWheelActive;
        var prevScollLeft;
        var prevScollTop = 0;
        elm.bind('scroll', function(evt) {
            var scrollLeft = evt.target.scrollLeft,
                scrollTop = evt.target.scrollTop;
            if ($scope.$headerContainer) {
		if(rtlUtilityService.isRtl && !rtlUtilityService.isAxisFlipped && $scope.renderedRows.length === 0){
			// scroll back to the right so we can show some column headers
			$scope.$headerContainer.scrollLeft($scope.headerScrollerDim().outerWidth);
                } else {
                    $scope.$headerContainer.scrollLeft(scrollLeft);
                }
            }
            $scope.adjustScrollLeft(scrollLeft);
            $scope.adjustScrollTop(scrollTop);
            if (!$scope.$root.$$phase) {
                $scope.$digest();
            }
            prevScollLeft = scrollLeft;
            prevScollTop = scrollTop;
            isMouseWheelActive = false;
            return true;
        });
        elm.bind("mousewheel DOMMouseScroll", function() {
            isMouseWheelActive = true;
            if (elm.focus) { elm.focus(); }
            return true;
        });
        if (!$scope.enableCellSelection) {
            $scope.domAccessProvider.selectionHandlers($scope, elm);
        }
    };
}]);
