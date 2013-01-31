ngGridDirectives.directive('ngCell', ['$compile', 'DomUtilityService', function($compile, domUtilityService) {
	var changeUserSelect = function(elem, value) {
		elem.css({
			'-webkit-touch-callout': value,
			'-webkit-user-select': value,
			'-khtml-user-select': value,
			'-moz-user-select': value == 'none'
				? '-moz-none'
				: value,
			'-ms-user-select': value,
			'user-select': value
		});
	};
    var ngCell = {
        scope: false,
        compile: function() {
            return {
                pre: function($scope, iElement) {
                    var html = $scope.col.cellTemplate;
                    html = html.replace(COL_FIELD, 'row.entity.' + $scope.col.field);
					var cellElement = $compile(html)($scope);
					if($scope.enableCellSelection && cellElement[0].className.indexOf('ngSelectionCell') == -1){
						cellElement[0].setAttribute('tabindex', 0);
						cellElement.addClass('focusedCellElement');
					}
                    iElement.append(cellElement);
                },
				post: function($scope, iElement){				
					var doingKeyDown = false;
					iElement.bind('keydown', function(evt) {
						if (evt.keyCode == 16) { //shift key
							changeUserSelect(iElement, 'none', evt);
							return true;
						} else if (!doingKeyDown) {
							doingKeyDown = true;
							var ret = ng.moveSelectionHandler($scope, iElement, evt, domUtilityService);
							doingKeyDown = false;
							return ret;
						}
						return false;
					});
					iElement.bind('keyup', function(evt) {
						if (evt.keyCode == 16) { //shift key
							changeUserSelect(iElement, 'text', evt);
						}
						return true;
					});
				}
            };
        }
    };
    return ngCell;
}]);