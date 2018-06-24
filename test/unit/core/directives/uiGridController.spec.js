describe('ui.grid.controller', function() {
	var gridUtil,
		uiGridController,
		scope;

	beforeEach(module('ui.grid'));

	describe('no columns. data in options', function() {
		beforeEach(inject(function($rootScope, $controller, _gridUtil_, $templateCache) {
			gridUtil = _gridUtil_;

			$templateCache.put('ui-grid/uiGridCell', '<div></div>');
			$templateCache.put('ui-grid/uiGridHeaderCell', '<div></div>');

			scope = $rootScope.$new();
			scope.options = {};
			scope.options.data = [
				{col1: 'row1'},
				{col1: 'row2'}
			];
			scope.uiGrid = {data: scope.options.data};
			var element = angular.element('<div ui-grid="options"</div>');
			uiGridController = $controller('uiGridController', {$scope: scope, $element: element, $attrs: ''});
			scope.$apply();
		}));

		describe('newGrid', function() {
			it('has column definitions', function() {
				expect(uiGridController.grid.options.columnDefs).toBeDefined();
				expect(uiGridController.grid.options.columnDefs.length).toBe(1);
			});
			it('has 1 column builder', function() {
				expect(uiGridController.grid.columnBuilders.length).toBe(1);
			});
			it('has 2 rows', function() {
				expect(uiGridController.grid.rows.length).toBe(2);
			});
			it('has columns', function() {
				expect(uiGridController.grid.columns.length).toBeDefined(1);
				expect(uiGridController.grid.getColumn('col1')).not.toBeNull();
			});
			it('has grid data', function() {
				expect(uiGridController.grid.options.data).toBeDefined();
				expect(uiGridController.grid.options.data.length).toBe(2);
			});
		});

		describe('respond to data modifications', function() {
			it('has 3 rows after add', function() {
				scope.options.data.push({col1: 'row3'});
				scope.$apply();
				expect(uiGridController.grid.rows.length).toBe(3);
			});

			it('has 1 rows after delete', function() {
				scope.options.data.splice(1, 1);
				scope.$apply();
				expect(uiGridController.grid.rows.length).toBe(1);
			});

			it('has data options referenced changed', function() {
				scope.options.data = [
					{col1: 'row1Swapped'},
					{col1: 'row2Swapped'},
					{col1: 'row3Swapped'},
					{col1: 'row4Swapped'}
				];
				scope.uiGrid = {data: scope.options.data};
				scope.$apply();
				expect(uiGridController.grid.rows.length).toBe(4);
				// dump('r', uiGridController.grid.rows[3]);
				expect(uiGridController.grid.rows[0].entity.col1).toBe('row1Swapped');
			});
		});
	});
});
