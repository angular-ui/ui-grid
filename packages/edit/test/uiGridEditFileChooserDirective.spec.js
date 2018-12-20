describe('ui.grid.edit uiGridEditFileChooser', function() {
	'use strict';

	var $compile, $rootScope, $scope, gridUtil, uiGridConstants, uiGridEditConstants,
		compiledElement, fileChooser, fileChooserScope;

	beforeEach(function() {
		module('ui.grid.edit');

		inject(function(_$compile_, _$rootScope_, _gridUtil_, _uiGridConstants_, _uiGridEditConstants_) {
			$compile = _$compile_;
			$rootScope = _$rootScope_;
			gridUtil = _gridUtil_;
			uiGridConstants = _uiGridConstants_;
			uiGridEditConstants = _uiGridEditConstants_;
		});

		spyOn(gridUtil, 'logError').and.callFake(angular.noop);

		$scope = $rootScope.$new();
		$scope.col = {colDef: {}};

		fileChooser = angular.element('<input type="text" value="File Chooser" ui-grid-edit-file-chooser />');
		compiledElement = $compile(fileChooser)($scope);
		$scope.$apply();

		fileChooserScope = compiledElement.isolateScope();
	});
	afterEach(function() {
		gridUtil.logError.calls.reset();
	});
	describe('on file select', function() {
		beforeEach(function() {
			spyOn($scope, '$emit').and.callThrough();
		});
		afterEach(function() {
			$scope.$emit.calls.reset();
		});
		function testNegativeScenario() {
			it('should emit a cancel cell edit event', function() {
				expect($scope.$emit).toHaveBeenCalledWith(uiGridEditConstants.events.CANCEL_CELL_EDIT);
			});
		}
		describe('when no target exists', function() {
			beforeEach(function() {
				var event = document.createEvent('HTMLEvents');

				event.initEvent('change', false, true);
				fileChooser[0].dispatchEvent(event);
			});
			testNegativeScenario();
		});
		describe('when no target files exists', function() {
			beforeEach(function() {
				var event = document.createEvent('HTMLEvents');

				event.initEvent('change', false, true);
				fileChooser[0].dispatchEvent(event);
			});
			testNegativeScenario();
		});
		describe('when there are 0 target files', function() {
			beforeEach(function() {
				var event = document.createEvent('HTMLEvents');

				event.initEvent('change', false, true);
				fileChooser[0].dispatchEvent(event);
			});
			testNegativeScenario();
		});
	});
	describe('on begin cell edit', function() {
		beforeEach(function() {
			spyOn(fileChooser[0], 'focus').and.callFake(angular.noop);
			spyOn(fileChooser[0], 'select').and.callFake(angular.noop);
			$scope.$broadcast(uiGridEditConstants.events.BEGIN_CELL_EDIT);
		});
		afterEach(function() {
			fileChooser[0].focus.calls.reset();
			fileChooser[0].select.calls.reset();
		});
		it('should focus on the file chooser', function() {
			expect(fileChooser[0].focus).toHaveBeenCalled();
		});
		it('should select the file chooser', function() {
			expect(fileChooser[0].select).toHaveBeenCalled();
		});
		it('should emit an end cell edit event on blur', function() {
			var event = document.createEvent('HTMLEvents');

			event.initEvent('blur', false, true);
			spyOn($scope, '$emit').and.callFake(angular.noop);
			fileChooser.triggerHandler(event);

			expect($scope.$emit).toHaveBeenCalledWith(uiGridEditConstants.events.END_CELL_EDIT);
			$scope.$emit.calls.reset();
		});
	});
});
