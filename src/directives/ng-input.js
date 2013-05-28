ngGridDirectives.directive('ngInput',['$parse', function($parse) {
  return function ($scope, elm, attrs) {
    
    // Strip the $eval off of the ng-input tag, we want WHERE to put the edited values, not the actual edited/displayed value itself
    var inputter = attrs.ngInput.replace(/.+?\((.+?)\)/, '$1');

    var evaled = $scope.$eval(inputter);
    var getter = $parse(evaled);
		var setter = getter.assign;
		var oldCellValue = getter($scope);

		elm.val(oldCellValue);

    elm.bind('keyup', function() {
        var newVal = elm.val();
        // dump(newVal);
        if (!$scope.$root.$$phase) {
          $scope.$apply(function(){
            setter($scope, newVal);
          });
        }
    });

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
						$scope.$apply(function(){
							setter($scope, oldCellValue);
							elm.val(oldCellValue);
							elm.blur();
						});
					}
        case 13: // Enter (apply new value)
          if (!$scope.$root.$$phase) {
            $scope.$apply(function(){
              setter($scope, elm.val());
              elm.blur();
            });
          }
				default:
					break;
			}
			return true;
		});
  };
}]);