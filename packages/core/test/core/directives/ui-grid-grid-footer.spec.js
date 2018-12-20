(function() {
	'use strict';

	describe('uiGridGridFooter', function() {
		var $compile, $document, $rootScope, $scope, data, grid;

		function recompile(template) {
			grid = angular.element(template);

			$compile(grid)($scope);
			$document[0].body.appendChild(grid[0]);

			$scope.$apply();
		}

		beforeEach(function() {
			module('ui.grid');
			module('ui.grid.treeView');

			inject(function(_$compile_, _$document_, _$rootScope_) {
				$compile = _$compile_;
				$document = _$document_;
				$rootScope = _$rootScope_;
			});

			$scope = $rootScope.$new();

			data = [
				{name: 'Bob', age: 35},
				{name: 'Bill', age: 25},
				{name: 'Sam', age: 17},
				{name: 'Jane', age: 19}
			];

			$scope.gridOpts = {
				showGridFooter: true,
				data: data
			};
		});

		it('should compile the grid footer', function() {
			recompile('<div style="width: 500px; height: 300px" ui-grid="gridOpts"></div>');
			expect(grid.find('.ui-grid-grid-footer').length).toEqual(1);
			grid.remove();
		});
		it('should display the total number of rows in the grid', function() {
			recompile('<div style="width: 500px; height: 300px" ui-grid="gridOpts"></div>');
			expect(grid.find('.ui-grid-grid-footer').text()).toContain('Total Items: ' + $scope.gridOpts.data.length);
			grid.remove();
		});
		describe('when tree view is enabled', function() {
			beforeEach(function() {
				$scope.gridOpts.showTreeExpandNoChildren = true;
				for (var i = 1; i <= $scope.gridOpts.data.length; i ++) {
					data[i-1].$$treeLevel = i%2 === 0 ? 1 : 0;
				}
				recompile('<div style="width: 500px; height: 300px" ui-grid="gridOpts" ui-grid-tree-view></div>');
			});
			afterEach(function() {
				grid.remove();
			});
			it('should display how many items are showing', function() {
				expect(grid.find('.ui-grid-grid-footer').text()).toContain('(Showing Items: ' + $scope.gridOpts.data.length/2 + ')');
			});
		});
	});
})();
