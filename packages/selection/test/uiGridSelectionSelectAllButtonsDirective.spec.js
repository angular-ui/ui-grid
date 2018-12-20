describe('ui.grid.selection uiGridSelectionSelectAllButtons', function() {
	'use strict';

	var $compile, $rootScope, $scope, uiGridSelectionService,
		selectAllButton;

	function compileSelectAllButton(parentScope) {
		var elm = angular.element('<ui-grid-selection-select-all-buttons></ui-grid-selection-select-all-buttons>');

		$compile(elm)(parentScope);
		parentScope.$apply();

		return elm;
	}

	beforeEach(function() {
		module('ui.grid.selection');

		inject(function(_$compile_, _$rootScope_, _uiGridSelectionService_) {
			$compile = _$compile_;
			$rootScope = _$rootScope_;
			uiGridSelectionService = _uiGridSelectionService_;
		});

		spyOn(uiGridSelectionService, 'clearSelectedRows').and.callFake(angular.noop);

		$scope = $rootScope.$new();
		$scope.col = {
			grid: {
				api: {
					selection: {
						selectRowByVisibleIndex: jasmine.createSpy('selectRowByVisibleIndex'),
						selectAllVisibleRows: jasmine.createSpy('selectAllVisibleRows')
					}
				},
				options: {
					noUnselect: true,
					multiSelect: true
				},
				selection: {
					selectAll: true
				}
			}
		};
		selectAllButton = compileSelectAllButton($scope);
	});
	afterEach(function() {
		uiGridSelectionService.clearSelectedRows.calls.reset();
		$scope.col.grid.api.selection.selectAllVisibleRows.calls.reset();
		$scope.col.grid.api.selection.selectRowByVisibleIndex.calls.reset();
	});

	it('should render the select all button', function() {
		expect(selectAllButton.hasClass('ui-grid-selection-row-header-buttons')).toBe(true);
		expect(selectAllButton.hasClass('ui-grid-icon-ok')).toBe(true);
		expect(selectAllButton.attr('role')).toBe('button');
	});
	function testHeaderButtonAction(triggerAction) {
		describe('when all of the rows are already selected', function() {
			beforeEach(function() {
				$scope.col.grid.selection.selectAll = true;
				$scope.$apply();

				triggerAction();
			});
			it('should clear selected rows', function() {
				expect(uiGridSelectionService.clearSelectedRows).toHaveBeenCalled();
			});
			it('should update selectAll to be false', function() {
				expect($scope.col.grid.selection.selectAll).toBe(false);
			});
			describe('when noUnselect is true', function() {
				it('should select row by visible index', function() {
					$scope.col.grid.api.selection.selectRowByVisibleIndex.calls.reset();
					$scope.col.grid.selection.selectAll = true;
					$scope.col.grid.options.noUnselect = true;
					$scope.$apply();

					triggerAction();

					expect($scope.col.grid.api.selection.selectRowByVisibleIndex).toHaveBeenCalled();
				});
			});
			describe('when noUnselect is false', function() {
				it('should not select row by visible index', function() {
					$scope.col.grid.api.selection.selectRowByVisibleIndex.calls.reset();
					$scope.col.grid.selection.selectAll = true;
					$scope.col.grid.options.noUnselect = false;
					$scope.$apply();

					triggerAction();

					expect($scope.col.grid.api.selection.selectRowByVisibleIndex).not.toHaveBeenCalled();
				});
			});
		});
		describe('when the rows are not selected and multiSelect is enabled', function() {
			beforeEach(function() {
				$scope.col.grid.selection.selectAll = false;
				$scope.col.grid.options.multiSelect = true;
				$scope.$apply();

				triggerAction();
			});
			it('should select all visible rows', function() {
				expect($scope.col.grid.selection.selectAll).toEqual(true);
				expect($scope.col.grid.api.selection.selectAllVisibleRows).toHaveBeenCalled();
			});
		});
		describe('when the rows are not selected and multiSelect is disabled', function() {
			beforeEach(function() {
				$scope.col.grid.selection.selectAll = false;
				$scope.col.grid.options.multiSelect = false;
				$scope.$apply();

				triggerAction();
			});
			it('should not select all rows', function() {
				expect($scope.col.grid.selection.selectAll).toEqual(false);
			});
		});
	}
	describe('when the select all button is clicked', function() {
		testHeaderButtonAction(function triggerClick() {
			selectAllButton[0].click();
		});
	});
	describe('on key down', function() {
		var event;

		beforeEach(function() {
			event = {
				preventDefault: jasmine.createSpy('preventDefault')
			};
		});
		afterEach(function() {
			event.preventDefault.calls.reset();
		});

		describe('when the enter key is pressed', function() {
			testHeaderButtonAction(function triggerEnter() {
				event.keyCode = 13;
				$scope.headerButtonKeyDown(event);
			});
		});
		describe('when the space key is pressed', function() {
			testHeaderButtonAction(function triggerEnter() {
				event.keyCode = 32;
				$scope.headerButtonKeyDown(event);
			});
		});
		describe('when any other key is pressed', function() {
			beforeEach(function() {
				event.keyCode = 31;
				$scope.headerButtonKeyDown(event);
			});
			it('should do nothing', function() {
				expect(event.preventDefault).not.toHaveBeenCalled();
			});
		});
	});
});
