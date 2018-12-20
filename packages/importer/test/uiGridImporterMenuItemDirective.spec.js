describe('ui.grid.importer uiGridImporterMenuItem', function() {
	'use strict';

	var $compile, $templateCache, $rootScope, $scope, gridUtil, uiGridImporterService,
		fileChooser, uiGridImporterMenuItem;

	function compileImporterMenuItem(elem) {
		uiGridImporterMenuItem = angular.element(elem);
		$compile(uiGridImporterMenuItem)($scope);
		$scope.$apply();

		fileChooser = uiGridImporterMenuItem[0].querySelectorAll('.ui-grid-importer-file-chooser');
	}

	beforeEach(function() {
		module('ui.grid');
		module('ui.grid.importer');

		inject(function(_$compile_, _$rootScope_, _$templateCache_, _gridUtil_, _uiGridImporterService_) {
			$compile = _$compile_;
			$rootScope = _$rootScope_;
			$templateCache = _$templateCache_;
			gridUtil = _gridUtil_;
			uiGridImporterService = _uiGridImporterService_;
		});

		spyOn(gridUtil, 'logError').and.callFake(angular.noop);
		spyOn(uiGridImporterService, 'importThisFile').and.callFake(angular.noop);

		$scope = $rootScope.$new();

		compileImporterMenuItem('<div ui-grid-importer-menu-item></div>');
	});
	afterEach(function() {
		gridUtil.logError.calls.reset();
		uiGridImporterService.importThisFile.calls.reset();
	});
	it('should compile the menu item', function() {
		expect(uiGridImporterMenuItem.hasClass('ui-grid-menu-item')).toBe(true);
	});
	it('should do nothing when a change event is fired and there are no files selected', function() {
		var event = document.createEvent('HTMLEvents'); // DOM event must be used for IE

		event.initEvent('change', false, true);
		fileChooser[0].dispatchEvent(event);

		expect(gridUtil.logError).not.toHaveBeenCalled();
		expect(uiGridImporterService.importThisFile).not.toHaveBeenCalled();
	});
	it('should log an error if more than one file choosers are present on the menu item', function() {
		$templateCache.put('ui-grid/importerMenuItem', '<div class="ui-grid-menu-item"><span class="ui-grid-importer-file-chooser"></span>' +
			'<span class="ui-grid-importer-file-chooser"></span></div>');
		compileImporterMenuItem('<div ui-grid-importer-menu-item></div>');

		expect(gridUtil.logError).toHaveBeenCalledWith('Found > 1 or < 1 file choosers within the menu item, error, cannot continue');
	});
});
