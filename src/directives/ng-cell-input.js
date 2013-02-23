ngGridDirectives.directive('ngCellInput',
	function () {
		return function($scope, elm) {
			elm.bind('keydown', function(evt){
				switch(evt.keyCode){
					case 37:
					case 38:
					case 39:
					case 40:
					    evt.stopPropagation();
					    console.log("stop prop");
						break;
					default:
						break;
				}
				return true;
			});
		};
	});