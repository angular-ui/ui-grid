(function() {
	'use strict';

	angular.module('ui.grid').directive('uiGridGridFooter', ['$templateCache', '$compile', 'uiGridConstants', 'gridUtil',
		function($templateCache, $compile, uiGridConstants, gridUtil) {
			return {
				restrict: 'EA',
				replace: true,
				require: '^uiGrid',
				scope: true,
				compile: function() {
					return {
						pre: function($scope, $elm, $attrs, uiGridCtrl) {
							$scope.grid = uiGridCtrl.grid;

							var footerTemplate = $scope.grid.options.gridFooterTemplate;

							gridUtil.getTemplate(footerTemplate)
								.then(function(contents) {
									var template = angular.element(contents),
										newElm = $compile(template)($scope);

									$elm.append(newElm);
								}).catch(angular.noop);
						}
					};
				}
			};
		}]);
})();
