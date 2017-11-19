/* global _ */
(function() {
	'use strict';

	describe('ui.grid.edit uiGridViewport directive', function() {
		var $compile, $rootScope, $scope, element, uiGridEditConstants, uiGridCtrl;

		function compileGrid(template) {
			element = angular.element(template);

			$compile(element)($scope);
			$scope.$apply();

			uiGridCtrl = element.controller('uiGrid');
			uiGridCtrl.focus = jasmine.createSpy('focus');
		}
		beforeEach(function() {
			module('ui.grid');
			module('ui.grid.edit');
			module('ui.grid.cellNav');
			module('ui.grid.pinning');

			inject(function(_$compile_, _$rootScope_, _uiGridEditConstants_) {
				$compile = _$compile_;
				$rootScope = _$rootScope_;
				uiGridEditConstants = _uiGridEditConstants_;
			});

			$scope = $rootScope.$new();

			$scope.gridOpts = {
				cellEditableCondition: true,
				enableCellEditOnFocus: true,
				modifierKeysToMultiSelectCells: true,
				keyDownOverrides: [],
				columnDefs: [
					{field: 'name', pinnedLeft: true},
					{field: 'age'}
				],
				data: [{name: 'Bob', age: '18'}, {name: 'Mathias', age: '19'}, {name: 'Fred', age: '20'}]
			};
		});

		describe('when neither edit not cellnav are enabled on the grid', function() {
			beforeEach(function() {
				compileGrid('<div ui-grid="gridOpts" ui-grid-pinning></div>');
			});
			afterEach(function() {
				uiGridCtrl.focus.calls.reset();
			});
			it('should not refocus on the grid when cell edit is canceled', function() {
				$scope.$broadcast(uiGridEditConstants.events.CANCEL_CELL_EDIT);
				expect(uiGridCtrl.focus).not.toHaveBeenCalled();
			});
			it('should not refocus on the grid when cell edit ends', function() {
				$scope.$broadcast(uiGridEditConstants.events.END_CELL_EDIT);
				expect(uiGridCtrl.focus).not.toHaveBeenCalled();
			});
		});

		describe('when edit is enabled on the grid, but cellnav is not', function() {
			beforeEach(function() {
				compileGrid('<div ui-grid="gridOpts" ui-grid-pinning ui-grid-edit></div>');
			});
			afterEach(function() {
				uiGridCtrl.focus.calls.reset();
			});
			it('should not refocus on the grid when cell edit is canceled', function() {
				$scope.$broadcast(uiGridEditConstants.events.CANCEL_CELL_EDIT);
				expect(uiGridCtrl.focus).not.toHaveBeenCalled();
			});
			it('should not refocus on the grid when cell edit ends', function() {
				$scope.$broadcast(uiGridEditConstants.events.END_CELL_EDIT);
				expect(uiGridCtrl.focus).not.toHaveBeenCalled();
			});
		});

		describe('when cellnav is enabled on the grid, but edit is not', function() {
			beforeEach(function() {
				compileGrid('<div ui-grid="gridOpts" ui-grid-pinning ui-grid-cellnav></div>');
			});
			afterEach(function() {
				uiGridCtrl.focus.calls.reset();
			});
			it('should not refocus on the grid when cell edit is canceled', function() {
				$scope.$broadcast(uiGridEditConstants.events.CANCEL_CELL_EDIT);
				expect(uiGridCtrl.focus).not.toHaveBeenCalled();
			});
			it('should not refocus on the grid when cell edit ends', function() {
				$scope.$broadcast(uiGridEditConstants.events.END_CELL_EDIT);
				expect(uiGridCtrl.focus).not.toHaveBeenCalled();
			});
		});

		describe('when both edit and cellNav are enabled on the grid', function() {
			beforeEach(function() {
				compileGrid('<div ui-grid="gridOpts" ui-grid-pinning ui-grid-edit ui-grid-cellnav></div>');
			});
			afterEach(function() {
				uiGridCtrl.focus.calls.reset();
			});
			it('should refocus on the grid when cell edit is canceled', function() {
				$scope.$broadcast(uiGridEditConstants.events.CANCEL_CELL_EDIT);
				expect(uiGridCtrl.focus).toHaveBeenCalled();
			});
			it('should refocus on the grid when cell edit ends', function() {
				$scope.$broadcast(uiGridEditConstants.events.END_CELL_EDIT);
				expect(uiGridCtrl.focus).toHaveBeenCalled();
			});
		});
	});
})();
