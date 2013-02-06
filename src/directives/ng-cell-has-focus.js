ngGridDirectives.directive('ngCellHasFocus', ['DomUtilityService',
	function (domUtilityService) {
		var focusOnInputElement = function($scope, elm){
			$scope.isFocused = true;
			domUtilityService.digest($scope);	
			var elementWithoutComments = angular.element(elm[0].children).filter(function() { return this.nodeType != 8 });//Remove html comments for IE8
			var inputElement = angular.element(elementWithoutComments[0].children[0]); 
			if(inputElement.length > 0){
				angular.element(inputElement).focus();
				angular.element(inputElement).select();
				angular.element(inputElement).bind('blur', function(evt){	
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