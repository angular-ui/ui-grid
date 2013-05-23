ngGridDirectives.directive('ngInput',['$parse', function($parse) {
  return function ($scope, elm, attrs) {
    var field = attrs.ngInput;
    var getter = $parse(field);
    var setter = getter.assign;
      
    var oldCellValue = $scope.$eval(field);
     
    elm.bind('keydown', function(evt){
			switch(evt.keyCode){
				case 37: // Left arrow
				case 38: // Up arrow
				case 39: // Right arrow
				case 40: // Down arrow
					evt.stopPropagation();
					break;
				case 27: // Esc (reset to old value)
					if (!$scope.$root.$$phase) {
						$scope.$apply(function() {
						    setter($scope, oldCellValue);
							elm.val(oldCellValue);
							elm.blur();
						});
					}
			    case 13: // Enter (Leave Field)
			        elm.blur();
				default:
					break;
			}
			return true;
		});
  };
}]);