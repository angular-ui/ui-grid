(function() {
	angular.module('ui.grid')
		.directive('uiGridVisible', function uiGridVisibleAction() {
			return function($scope, $elm, $attr) {
				$scope.$watch($attr.uiGridVisible, function(visible) {
					$elm[visible ? 'removeClass' : 'addClass']('ui-grid-invisible');
				});
			};
		});
})();
