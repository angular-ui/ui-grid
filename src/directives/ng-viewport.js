ngGridDirectives.directive('ngViewport', ['DomUtilityService', function (domUtilityService) {
    return function(scope, elm) {
        elm.bind('scroll', function(evt) {
            var scrollLeft = evt.target.scrollLeft,
                scrollTop = evt.target.scrollTop;
            scope.adjustScrollLeft(scrollLeft);
            scope.adjustScrollTop(scrollTop);
			if(scope.enableCellSelection){
				domUtilityService.focusCellElement(scope);
			}
            return true;
        });
    };
}]);