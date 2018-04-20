describe('ui.grid.treeBase uiGridTreeBaseRowHeaderButtons', function () {
	var $compile, $templateCache, $rootScope, $scope, uiGridTreeBaseService,
		uiGridTreeBaseRowHeaderButtons;

	function compileTreeBaseRowHeaderButton(elem) {
		uiGridTreeBaseRowHeaderButtons = angular.element(elem);
		$compile(uiGridTreeBaseRowHeaderButtons)($scope);
		$scope.$apply();
	}

	beforeEach(function() {
		module('ui.grid');
		module('ui.grid.treeBase');
		module('ui.grid.treeView');

		inject(function(_$compile_, _$rootScope_, _$templateCache_, _uiGridTreeBaseService_) {
			$compile = _$compile_;
			$rootScope = _$rootScope_;
			$templateCache = _$templateCache_;
			uiGridTreeBaseService = _uiGridTreeBaseService_;
		});

		$scope = $rootScope.$new();
		$scope.gridOptions = {
			showHeader: false,
			data: [
				{name: 'Dynamic 1', gender: 'female', age: 53, company: 'Griddable grids', balance: 38000, $$treeLevel: 0}
			]
		};

		compileTreeBaseRowHeaderButton('<div ui-grid="gridOptions" ui-grid-tree-view></div>');
	});
	afterEach(function() {
		uiGridTreeBaseRowHeaderButtons = null;
	});
	it('should compile the menu item', function() {
		expect(uiGridTreeBaseRowHeaderButtons.find('.ui-grid-tree-base-row-header-buttons').length).toBe(1);
	});
	describe('on tree button click', function() {
		var event;

		beforeEach(function() {
			event = $.Event('click');

			spyOn(event, 'stopPropagation').and.callThrough();
			spyOn(uiGridTreeBaseService, 'toggleRowTreeState').and.callFake(angular.noop);

			uiGridTreeBaseRowHeaderButtons.find('.ui-grid-tree-base-row-header-buttons').trigger(event);
		});
		afterEach(function() {
			event.stopPropagation.calls.reset();
			uiGridTreeBaseService.toggleRowTreeState.calls.reset();
		});
		it('should stop event propagation', function() {
			expect(event.stopPropagation).toHaveBeenCalled();
		});
		it('should toggle the row tree state', function() {
			expect(uiGridTreeBaseService.toggleRowTreeState).toHaveBeenCalled();
		});
	});
});
