ngGridDirectives.directive('ngCellHasFocus', ['DomUtilityService', '$timeout',
	function (domUtilityService, $timeout) {
		var focusOnInputElement = function($scope, elm){
			$scope.isFocused = true;
			domUtilityService.digest($scope);	
			var inputElement = angular.element(elm[0].children).filter(function() { return this.nodeType != 8 });//Remove html comments for IE8
			if(inputElement.length > 0){
				angular.element(inputElement[0]).focus();
				angular.element(inputElement[0]).bind('blur', function(evt){	
					$scope.isFocused = false;	
					domUtilityService.digest($scope);
					return true;
				});	
			}
		};
		return function($scope, elm) {
			$scope.isFocused = false;
			elm.bind('mousedown', function(evt){
				evt.preventDefault();
				$scope.$parent.row.toggleSelected(evt);
				domUtilityService.digest($scope.$parent.$parent);
				focusOnInputElement($scope, elm);
				return true;
			});			
			elm.bind('focus', function(evt){
				focusOnInputElement($scope, elm);
				return true;
			});
		};
	}]);