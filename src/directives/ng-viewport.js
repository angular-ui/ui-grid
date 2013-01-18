ngGridDirectives.directive('ngViewport',['DomUtilityService',
  function (domUtilityService) {
	return function (scope, elm, attrs) {
		var changeUserSelect = function(elm,value,evt){
			elm.css({
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
		elm.bind('scroll', function(evt) {
			var scrollLeft = evt.target.scrollLeft,
				scrollTop = evt.target.scrollTop;
			scope.adjustScrollLeft(scrollLeft);
			scope.adjustScrollTop(scrollTop);
			return true;
		});
		var doingKeyDown = false;
		elm.bind('keydown', function(evt) {
			if(evt.keyCode == 16){ //shift key
				changeUserSelect(elm,'none',evt);
				return true;
			} else if (!doingKeyDown) {
				doingKeyDown = true;
				var ret = ng.moveSelectionHandler(scope, elm, evt);
				doingKeyDown = false;
				return ret;
			}
			return false;
		});
		elm.bind('keyup', function(evt) {
			if(evt.keyCode == 16){ //shift key
				changeUserSelect(elm,'text',evt);
			}
			return true;
		});
	}
  }]);