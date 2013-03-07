ngGridDirectives.directive('ngInput',['$parse', function($parse) {
    return function ($scope, elm, attrs) {
        var getter = $parse($scope.$eval(attrs.ngInput));
		var setter = getter.assign;
		var oldCellValue = getter($scope.row.entity);
		elm.val(oldCellValue);
        elm.bind('keyup', function() {
            var newVal = elm.val();
            if (!$scope.$root.$$phase) {
                $scope.$apply(function(){setter($scope.row.entity,newVal); });
            }
        });
		elm.bind('keydown', function(evt){
			switch(evt.keyCode){
				case 37:
				case 38:
				case 39:
				case 40:
					evt.stopPropagation();
					break;
				case 27:
					if (!$scope.$root.$$phase) {
						$scope.$apply(function(){
							setter($scope.row.entity,oldCellValue);
							elm.val(oldCellValue);
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