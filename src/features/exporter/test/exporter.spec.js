describe('ui.grid.exporter', function() {
  'use strict';

  var uiGridExporterService, uiGridSelectionService, uiGridExporterConstants, uiGridSelectionConstants, uiGridPinningService,
    gridClassFactory, grid, $compile, $scope, $document, $rootScope;

  beforeEach(function() {
    module('ui.grid');
    module('ui.grid.exporter', 'ui.grid.selection', 'ui.grid.pinning');

    inject(function (_uiGridExporterService_, _uiGridSelectionService_, _uiGridPinningService_, _gridClassFactory_, _uiGridExporterConstants_,
      _uiGridPinningConstants_, _$compile_, _$rootScope_, _$document_, _uiGridSelectionConstants_) {
      uiGridExporterService = _uiGridExporterService_;
      uiGridSelectionService = _uiGridSelectionService_;
      uiGridExporterConstants = _uiGridExporterConstants_;
      uiGridPinningService = _uiGridPinningService_;
      gridClassFactory = _gridClassFactory_;
      $compile = _$compile_;
      $document = _$document_;
      $rootScope = _$rootScope_;
      uiGridSelectionConstants = _uiGridSelectionConstants_;
    });
  });

  describe('uiGridExporterService', function() {
    var i18nService, publicEvents, publicMethods;

    beforeEach(function() {
      inject(function(_i18nService_) {
        i18nService = _i18nService_;
      });

      $scope = $rootScope.$new();

      grid = gridClassFactory.createGrid({});
      grid.options.columnDefs = [
        {field: 'col1', name: 'col1', displayName: 'Col1', width: 50, headerCellFilter: 'uppercase', pinnedLeft: true},
        {field: 'col2', name: 'col2', displayName: 'Col2', width: '*', type: 'number', cellFilter: 'uppercase'},
        {field: 'col3', name: 'col3', displayName: 'Col3', width: 100},
        {field: 'col4', name: 'col4', displayName: 'Col4', width: 200}
      ];
      grid.api.core.addToGridMenu = angular.noop;

      uiGridExporterService.initializeGrid(grid);
      uiGridSelectionService.initializeGrid(grid);
      uiGridPinningService.initializeGrid(grid);
      var data = [];
      for (var i = 0; i < 3; i++) {
        data.push({col1: 'a_'+i, col2: 'b_'+i, col3: 'c_'+i, col4: 'd_'+i});
      }
      grid.options.data = data;

      grid.buildColumns();
      grid.modifyRows(grid.options.data);
      grid.rows[1].visible = false;
      grid.columns[2].visible = false;
      grid.setVisibleRows(grid.rows);
      grid.setVisibleColumns(grid.columns);

      grid.api.selection.clearSelectedRows();
      grid.api.selection.selectRow(grid.rows[0].entity);

      grid.gridWidth = 500;
      grid.columns[0].drawnWidth = 50;
      grid.columns[1].drawnWidth = '*';
      grid.columns[2].drawnWidth = 100;
      grid.columns[3].drawnWidth = 200;
    });

    describe('initializeGrid', function() {
      beforeEach(function() {
        grid.api.registerEventsFromObject = jasmine.createSpy('registerEventsFromObject').and.callFake(function(events) {
          publicEvents = events;
        });
        grid.api.registerMethodsFromObject = jasmine.createSpy('registerMethodsFromObject').and.callFake(function(methods) {
          publicMethods = methods;
        });
        uiGridExporterService.initializeGrid(grid);
      });
      afterEach(function() {
        grid.api.registerEventsFromObject.calls.reset();
        grid.api.registerMethodsFromObject.calls.reset();
      });
      describe('public events', function() {
        it('should define exporter public events as an empty object', function () {
          expect(publicEvents.exporter).toEqual({});
        });
      });

      describe('public methods', function() {
        it('should define exporter public methods', function() {
          expect(publicMethods.exporter).toBeDefined();
          expect(angular.isFunction(publicMethods.exporter.csvExport)).toBe(true);
          expect(angular.isFunction(publicMethods.exporter.pdfExport)).toBe(true);
          expect(angular.isFunction(publicMethods.exporter.excelExport)).toBe(true);
        });
        it('csvExport should call uiGridExporterService.csvExport', function() {
          spyOn(uiGridExporterService, 'csvExport').and.callFake(angular.noop);
          publicMethods.exporter.csvExport();
          expect(uiGridExporterService.csvExport).toHaveBeenCalled();
          uiGridExporterService.csvExport.calls.reset();
        });
        it('pdfExport should call uiGridExporterService.pdfExport', function() {
          spyOn(uiGridExporterService, 'pdfExport').and.callFake(angular.noop);
          publicMethods.exporter.pdfExport();
          expect(uiGridExporterService.pdfExport).toHaveBeenCalled();
          uiGridExporterService.pdfExport.calls.reset();
        });
        it('excelExport should call uiGridExporterService.excelExport', function() {
          spyOn(uiGridExporterService, 'excelExport').and.callFake(angular.noop);
          publicMethods.exporter.excelExport();
          expect(uiGridExporterService.excelExport).toHaveBeenCalled();
          uiGridExporterService.excelExport.calls.reset();
        });
      });
    });

    describe('defaultGridOptions', function() {
      var options;

      beforeEach(function() {
        options = {};
      });

      it('set all options to default', function () {
        uiGridExporterService.defaultGridOptions(options);
        expect(options).toEqual({
          exporterSuppressMenu: false,
          exporterMenuLabel: 'Export',
          exporterCsvColumnSeparator: ',',
          exporterCsvFilename: 'download.csv',
          exporterPdfFilename: 'download.pdf',
          exporterExcelFilename: 'download.xlsx',
          exporterExcelSheetName: 'Sheet1',
          exporterOlderExcelCompatibility: false,
          exporterIsExcelCompatible: false,
          exporterPdfDefaultStyle: {fontSize: 11},
          exporterPdfTableStyle: {margin: [0, 5, 0, 15]},
          exporterPdfTableHeaderStyle: {bold: true, fontSize: 12, color: 'black'},
          exporterPdfHeader: null,
          exporterPdfFooter: null,
          exporterPdfOrientation: 'landscape',
          exporterPdfPageSize: 'A4',
          exporterPdfMaxGridWidth: 720,
          exporterPdfCustomFormatter: jasmine.any(Function),
          exporterHeaderFilterUseName: false,
          exporterMenuAllData: true,
          exporterMenuVisibleData: true,
          exporterMenuSelectedData: true,
          exporterMenuCsv: true,
          exporterMenuPdf: true,
          exporterMenuExcel: true,
          exporterFieldCallback: jasmine.any(Function),
          exporterFieldFormatCallback: jasmine.any(Function),
          exporterExcelCustomFormatters: jasmine.any(Function),
          exporterExcelHeader: jasmine.any(Function),
          exporterColumnScaleFactor: 3.5,
          exporterFieldApplyFilters: false,
          exporterAllDataFn: null,
          exporterSuppressColumns: [],
          exporterMenuItemOrder: 200
        });
      });
    });

    describe('defaultGridOptions', function() {
      var options;

      beforeEach(function() {
        options = {};
      });

      it('should set all options to default', function() {
        uiGridExporterService.defaultGridOptions(options);
        expect(options).toEqual({
          exporterSuppressMenu: false,
          exporterMenuLabel: 'Export',
          exporterCsvColumnSeparator: ',',
          exporterCsvFilename: 'download.csv',
          exporterPdfFilename: 'download.pdf',
          exporterExcelFilename: 'download.xlsx',
          exporterExcelSheetName: 'Sheet1',
          exporterOlderExcelCompatibility: false,
          exporterIsExcelCompatible: false,
          exporterPdfDefaultStyle : { fontSize : 11 },
          exporterPdfTableStyle : { margin : [ 0, 5, 0, 15 ] },
          exporterPdfTableHeaderStyle : { bold : true, fontSize : 12, color : 'black' },
          exporterPdfHeader: null,
          exporterPdfFooter: null,
          exporterPdfOrientation : 'landscape',
          exporterPdfPageSize : 'A4',
          exporterPdfMaxGridWidth : 720,
          exporterPdfCustomFormatter: jasmine.any(Function),
          exporterHeaderFilterUseName: false,
          exporterMenuAllData: true,
          exporterMenuVisibleData: true,
          exporterMenuSelectedData: true,
          exporterMenuCsv: true,
          exporterMenuPdf: true,
          exporterMenuExcel: true,
          exporterFieldCallback: jasmine.any(Function),
          exporterFieldFormatCallback: jasmine.any(Function),
          exporterExcelCustomFormatters: jasmine.any(Function),
          exporterExcelHeader: jasmine.any(Function),
          exporterColumnScaleFactor: 3.5,
          exporterFieldApplyFilters: false,
          exporterAllDataFn: null,
          exporterSuppressColumns: [],
          exporterMenuItemOrder: 200
        });
      });

      it('should set all options to non-default, including using deprecated exporterAllDataPromise', function() {
        var callback = angular.noop;

        options = {
          exporterSuppressMenu: true,
          exporterMenuLabel: 'custom export button',
          exporterCsvColumnSeparator: ';',
          exporterCsvFilename: 'myfile.csv',
          exporterPdfFilename: 'myfile.pdf',
          exporterOlderExcelCompatibility: true,
          exporterIsExcelCompatible: true,
          exporterPdfDefaultStyle : { fontSize : 12 },
          exporterPdfTableStyle : { margin : [ 15, 5, 15, 15 ] },
          exporterPdfTableHeaderStyle : { bold : false, fontSize : 12, color : 'green' },
          exporterPdfHeader: 'My Header',
          exporterPdfFooter: 'My Footer',
          exporterPdfOrientation : 'portrait',
          exporterPdfPageSize : 'LETTER',
          exporterPdfMaxGridWidth : 670,
          exporterPdfCustomFormatter: callback,
          exporterHeaderFilterUseName: true,
          exporterMenuAllData: false,
          exporterMenuVisibleData: false,
          exporterMenuSelectedData: false,
          exporterMenuCsv: false,
          exporterMenuPdf: false,
          exporterMenuExcel: false,
          exporterFieldCallback: callback,
          exporterFieldFormatCallback: callback,
          exporterExcelCustomFormatters: callback,
          exporterFieldApplyFilters: false,
          exporterAllDataPromise: callback,
          exporterSuppressColumns: [ 'buttons' ],
          exporterExcelFilename: 'myFile.xlsx',
          exporterExcelSheetName: 'Sheet1',
          exporterExcelHeader: 'My Header',
          exporterExcelFooter: 'My Footer',
          exporterColumnScaleFactor: 3.5,
          exporterMenuItemOrder: 75
        };
        uiGridExporterService.defaultGridOptions(options);
        expect( options ).toEqual({
          exporterSuppressMenu: true,
          exporterMenuLabel: 'custom export button',
          exporterCsvColumnSeparator: ';',
          exporterCsvFilename: 'myfile.csv',
          exporterPdfFilename: 'myfile.pdf',
          exporterOlderExcelCompatibility: true,
          exporterIsExcelCompatible: true,
          exporterPdfDefaultStyle : { fontSize : 12 },
          exporterPdfTableStyle : { margin : [ 15, 5, 15, 15 ] },
          exporterPdfTableHeaderStyle : { bold : false, fontSize : 12, color : 'green' },
          exporterPdfHeader: 'My Header',
          exporterPdfFooter: 'My Footer',
          exporterPdfOrientation : 'portrait',
          exporterPdfPageSize : 'LETTER',
          exporterPdfMaxGridWidth : 670,
          exporterPdfCustomFormatter: callback,
          exporterHeaderFilterUseName: true,
          exporterMenuAllData: false,
          exporterMenuVisibleData: false,
          exporterMenuSelectedData: false,
          exporterMenuCsv: false,
          exporterMenuPdf: false,
          exporterMenuExcel: false,
          exporterFieldCallback: callback,
          exporterFieldFormatCallback: callback,
          exporterFieldApplyFilters: false,
          exporterAllDataPromise: callback,
          exporterSuppressColumns: [ 'buttons' ],
          exporterExcelCustomFormatters: callback,
          exporterExcelFilename: 'myFile.xlsx',
          exporterExcelSheetName: 'Sheet1',
          exporterExcelHeader: 'My Header',
          exporterExcelFooter: 'My Footer',
          exporterColumnScaleFactor: 3.5,
          exporterMenuItemOrder: 75,
          exporterAllDataFn: callback
        });
      });

      it('should prefer exporterAllDataFn over using deprecated exporterAllDataPromise', function() {
        options = {
          exporterAllDataFn: 'exporterAllDataFn',
          exporterAllDataPromise: 'exporterAllDataPromise'
        };
        uiGridExporterService.defaultGridOptions(options);

        expect(options.exporterAllDataFn).toEqual('exporterAllDataFn');
      });
    });

    describe('addToMenu', function() {
      var menu;

      beforeEach(function() {
        spyOn(i18nService, 'getSafeText').and.callFake(function(propertyKey) {
          return propertyKey;
        });
        grid.api.core.addToGridMenu = jasmine.createSpy('addToGridMenu').and.callFake(function(gridObj, menuItems) {
          menu = menuItems;
        });
        grid.options.exporterMenuItemOrder = 0;
        uiGridExporterService.addToMenu(grid);
      });
      afterEach(function() {
        i18nService.getSafeText.calls.reset();
        grid.api.core.addToGridMenu.calls.reset();
      });

      it('should call addToGridMenu on the grid API', function() {
        expect(grid.api.core.addToGridMenu).toHaveBeenCalledWith(grid, jasmine.any(Array));
      });
      describe('exporterAllAsCsv', function() {
        it('should add the exporterAllAsCsv menu item to the grid', function() {
          expect(menu[0].title).toEqual('gridMenu.exporterAllAsCsv');
        });
        it('should set its order to be the same as the one set by exporterMenuItemOrder option', function() {
          expect(menu[0].order).toEqual(grid.options.exporterMenuItemOrder);
        });
        describe('shown', function() {
          it('should return true when exporterMenuCsv and exporterMenuAllData are both true', function() {
            grid.options.exporterMenuAllData = true;
            grid.options.exporterMenuCsv = true;
            expect(menu[0].shown()).toBe(true);
          });
          it('should return false when exporterMenuCsv is false', function() {
            grid.options.exporterMenuAllData = true;
            grid.options.exporterMenuCsv = false;
            expect(menu[0].shown()).toBe(false);
          });
          it('should return false when exporterMenuAllData is false', function() {
            grid.options.exporterMenuAllData = false;
            grid.options.exporterMenuCsv = true;
            expect(menu[0].shown()).toBe(false);
          });
          it('should return false when exporterMenuCsv and exporterMenuAllData are both false', function() {
            grid.options.exporterMenuAllData = false;
            grid.options.exporterMenuCsv = false;
            expect(menu[0].shown()).toBe(false);
          });
        });
        describe('action', function() {
          beforeEach(function() {
            grid.api.exporter.csvExport = jasmine.createSpy('csvExport');
            menu[0].action();
          });
          afterEach(function() {
            grid.api.exporter.csvExport.calls.reset();
          });
          it('should trigger csvExport on action', function() {
            expect(grid.api.exporter.csvExport).toHaveBeenCalledWith(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
          });
        });
      });
      describe('exporterVisibleAsCsv', function() {
        it('should add the exporterVisibleAsCsv menu item to the grid', function() {
          expect(menu[1].title).toEqual('gridMenu.exporterVisibleAsCsv');
        });
        it('should set its order to be the same as the one set by exporterMenuItemOrder option + 1', function() {
          expect(menu[1].order).toEqual(grid.options.exporterMenuItemOrder + 1);
        });
        describe('shown', function() {
          it('should return true when exporterMenuCsv and exporterMenuVisibleData are both true', function() {
            grid.options.exporterMenuCsv = true;
            grid.options.exporterMenuVisibleData = true;
            expect(menu[1].shown()).toBe(true);
          });
          it('should return false when exporterMenuVisibleData is false', function() {
            grid.options.exporterMenuCsv = true;
            grid.options.exporterMenuVisibleData = false;
            expect(menu[1].shown()).toBe(false);
          });
          it('should return false when exporterMenuCsv is false', function() {
            grid.options.exporterMenuCsv = false;
            grid.options.exporterMenuVisibleData = true;
            expect(menu[1].shown()).toBe(false);
          });
          it('should return false when exporterMenuCsv and exporterMenuVisibleData are both false', function() {
            grid.options.exporterMenuCsv = false;
            grid.options.exporterMenuVisibleData = false;
            expect(menu[1].shown()).toBe(false);
          });
        });
        describe('action', function() {
          beforeEach(function() {
            grid.api.exporter.csvExport = jasmine.createSpy('csvExport');
            menu[1].action();
          });
          afterEach(function() {
            grid.api.exporter.csvExport.calls.reset();
          });
          it('should trigger csvExport on action', function() {
            expect(grid.api.exporter.csvExport).toHaveBeenCalledWith(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE);
          });
        });
      });
      describe('exporterSelectedAsCsv', function() {
        it('should add the exporterSelectedAsCsv menu item to the grid', function() {
          expect(menu[2].title).toEqual('gridMenu.exporterSelectedAsCsv');
        });
        it('should set its order to be the same as the one set by exporterMenuItemOrder option + 2', function() {
          expect(menu[2].order).toEqual(grid.options.exporterMenuItemOrder + 2);
        });
        describe('shown', function() {
          it('should return true when exporterMenuCsv and exporterMenuSelectedData are both true, and there are selected rows', function() {
            grid.options.exporterMenuSelectedData = true;
            grid.options.exporterMenuCsv = true;
            grid.api.selection.getSelectedRows = jasmine.createSpy('getSelectedRows').and.returnValue([1]);
            expect(menu[2].shown()).toBe(true);
            grid.api.selection.getSelectedRows.calls.reset();
          });
          it('should return false when exporterMenuCsv and exporterMenuSelectedData are both true, but there are no selected rows', function() {
            grid.options.exporterMenuSelectedData = true;
            grid.options.exporterMenuCsv = true;
            grid.api.selection.getSelectedRows = jasmine.createSpy('getSelectedRows').and.returnValue([]);
            expect(menu[2].shown()).toBe(false);
            grid.api.selection.getSelectedRows.calls.reset();
          });
          it('should return false when exporterMenuCsv is false', function() {
            grid.options.exporterMenuSelectedData = true;
            grid.options.exporterMenuCsv = false;
            expect(menu[2].shown()).toBe(false);
          });
          it('should return false when exporterMenuSelectedData is false', function() {
            grid.options.exporterMenuSelectedData = false;
            grid.options.exporterMenuCsv = true;
            expect(menu[2].shown()).toBe(false);
          });
          it('should return false when exporterMenuCsv and exporterMenuSelectedData are both false', function() {
            grid.options.exporterMenuSelectedData = false;
            grid.options.exporterMenuCsv = false;
            expect(menu[2].shown()).toBe(false);
          });
        });
        describe('action', function() {
          beforeEach(function() {
            grid.api.exporter.csvExport = jasmine.createSpy('csvExport');
            menu[2].action();
          });
          afterEach(function() {
            grid.api.exporter.csvExport.calls.reset();
          });
          it('should trigger csvExport on action', function() {
            expect(grid.api.exporter.csvExport).toHaveBeenCalledWith(uiGridExporterConstants.SELECTED, uiGridExporterConstants.VISIBLE);
          });
        });
      });
      describe('exporterAllAsPdf', function() {
        it('should add the exporterAllAsPdf menu item to the grid', function() {
          expect(menu[3].title).toEqual('gridMenu.exporterAllAsPdf');
        });
        it('should set its order to be the same as the one set by exporterMenuItemOrder option + 3', function() {
          expect(menu[3].order).toEqual(grid.options.exporterMenuItemOrder + 3);
        });
        describe('shown', function() {
          it('should return true when exporterMenuPdf and exporterMenuAllData are both true', function() {
            grid.options.exporterMenuAllData = true;
            grid.options.exporterMenuPdf = true;
            expect(menu[3].shown()).toBe(true);
          });
          it('should return false when exporterMenuPdf is false', function() {
            grid.options.exporterMenuAllData = true;
            grid.options.exporterMenuPdf = false;
            expect(menu[3].shown()).toBe(false);
          });
          it('should return false when exporterMenuAllData is false', function() {
            grid.options.exporterMenuAllData = false;
            grid.options.exporterMenuPdf = true;
            expect(menu[3].shown()).toBe(false);
          });
          it('should return false when exporterMenuPdf and exporterMenuAllData are both false', function() {
            grid.options.exporterMenuAllData = false;
            grid.options.exporterMenuPdf = false;
            expect(menu[3].shown()).toBe(false);
          });
        });
        describe('action', function() {
          beforeEach(function() {
            grid.api.exporter.pdfExport = jasmine.createSpy('pdfExport');
            menu[3].action();
          });
          afterEach(function() {
            grid.api.exporter.pdfExport.calls.reset();
          });
          it('should trigger pdfExport on action', function() {
            expect(grid.api.exporter.pdfExport).toHaveBeenCalledWith(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
          });
        });
      });
      describe('exporterVisibleAsPdf', function() {
        it('should add the exporterVisibleAsPdf menu item to the grid', function() {
          expect(menu[4].title).toEqual('gridMenu.exporterVisibleAsPdf');
        });
        it('should set its order to be the same as the one set by exporterMenuItemOrder option + 4', function() {
          expect(menu[4].order).toEqual(grid.options.exporterMenuItemOrder + 4);
        });
        describe('shown', function() {
          it('should return true when exporterMenuPdf and exporterMenuVisibleData are both true', function() {
            grid.options.exporterMenuVisibleData = true;
            grid.options.exporterMenuPdf = true;
            expect(menu[4].shown()).toBe(true);
          });
          it('should return false when exporterMenuPdf is false', function() {
            grid.options.exporterMenuVisibleData = true;
            grid.options.exporterMenuPdf = false;
            expect(menu[4].shown()).toBe(false);
          });
          it('should return false when exporterMenuVisibleData is false', function() {
            grid.options.exporterMenuVisibleData = false;
            grid.options.exporterMenuPdf = true;
            expect(menu[4].shown()).toBe(false);
          });
          it('should return false when exporterMenuPdf and exporterMenuVisibleData are both false', function() {
            grid.options.exporterMenuVisibleData = false;
            grid.options.exporterMenuPdf = false;
            expect(menu[4].shown()).toBe(false);
          });
        });
        describe('action', function() {
          beforeEach(function() {
            grid.api.exporter.pdfExport = jasmine.createSpy('pdfExport');
            menu[4].action();
          });
          afterEach(function() {
            grid.api.exporter.pdfExport.calls.reset();
          });
          it('should trigger pdfExport on action', function() {
            expect(grid.api.exporter.pdfExport).toHaveBeenCalledWith(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE);
          });
        });
      });
      describe('exporterSelectedAsPdf', function() {
        it('should add the exporterSelectedAsPdf menu item to the grid', function() {
          expect(menu[5].title).toEqual('gridMenu.exporterSelectedAsPdf');
        });
        it('should set its order to be the same as the one set by exporterMenuItemOrder option + 5', function() {
          expect(menu[5].order).toEqual(grid.options.exporterMenuItemOrder + 5);
        });
        describe('shown', function() {
          it('should return true when exporterMenuPdf and exporterMenuSelectedData are both true, and there are selected rows', function() {
            grid.options.exporterMenuSelectedData = true;
            grid.options.exporterMenuPdf = true;
            grid.api.selection.getSelectedRows = jasmine.createSpy('getSelectedRows').and.returnValue([1]);
            expect(menu[5].shown()).toBe(true);
            grid.api.selection.getSelectedRows.calls.reset();
          });
          it('should return false when exporterMenuPdf and exporterMenuSelectedData are both true, but there are no selected rows', function() {
            grid.options.exporterMenuSelectedData = true;
            grid.options.exporterMenuPdf = true;
            grid.api.selection.getSelectedRows = jasmine.createSpy('getSelectedRows').and.returnValue([]);
            expect(menu[5].shown()).toBe(false);
            grid.api.selection.getSelectedRows.calls.reset();
          });
          it('should return false when exporterMenuPdf is false', function() {
            grid.options.exporterMenuSelectedData = true;
            grid.options.exporterMenuPdf = false;
            expect(menu[5].shown()).toBe(false);
          });
          it('should return false when exporterMenuSelectedData is false', function() {
            grid.options.exporterMenuSelectedData = false;
            grid.options.exporterMenuPdf = true;
            expect(menu[5].shown()).toBe(false);
          });
          it('should return false when exporterMenuPdf and exporterMenuSelectedData are both false', function() {
            grid.options.exporterMenuSelectedData = false;
            grid.options.exporterMenuPdf = false;
            expect(menu[5].shown()).toBe(false);
          });
        });
        describe('action', function() {
          beforeEach(function() {
            grid.api.exporter.pdfExport = jasmine.createSpy('pdfExport');
            menu[5].action();
          });
          afterEach(function() {
            grid.api.exporter.pdfExport.calls.reset();
          });
          it('should trigger csvExport on action', function() {
            expect(grid.api.exporter.pdfExport).toHaveBeenCalledWith(uiGridExporterConstants.SELECTED, uiGridExporterConstants.VISIBLE);
          });
        });
      });
      describe('exporterAllAsExcel', function() {
        it('should add the exporterAllAsExcel menu item to the grid', function() {
          expect(menu[6].title).toEqual('gridMenu.exporterAllAsExcel');
        });
        it('should set its order to be the same as the one set by exporterMenuItemOrder option + 6', function() {
          expect(menu[6].order).toEqual(grid.options.exporterMenuItemOrder + 6);
        });
        describe('shown', function() {
          it('should return true when exporterMenuExcel and exporterMenuAllData are both true', function() {
            grid.options.exporterMenuAllData = true;
            grid.options.exporterMenuExcel = true;
            expect(menu[6].shown()).toBe(true);
          });
          it('should return false when exporterMenuExcel is false', function() {
            grid.options.exporterMenuAllData = true;
            grid.options.exporterMenuExcel = false;
            expect(menu[6].shown()).toBe(false);
          });
          it('should return false when exporterMenuAllData is false', function() {
            grid.options.exporterMenuAllData = false;
            grid.options.exporterMenuExcel = true;
            expect(menu[6].shown()).toBe(false);
          });
          it('should return false when exporterMenuExcel and exporterMenuAllData are both false', function() {
            grid.options.exporterMenuAllData = false;
            grid.options.exporterMenuExcel = false;
            expect(menu[6].shown()).toBe(false);
          });
        });
        describe('action', function() {
          beforeEach(function() {
            grid.api.exporter.excelExport = jasmine.createSpy('excelExport');
            menu[6].action();
          });
          afterEach(function() {
            grid.api.exporter.excelExport.calls.reset();
          });
          it('should trigger excelExport on action', function() {
            expect(grid.api.exporter.excelExport).toHaveBeenCalledWith(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
          });
        });
      });
      describe('exporterVisibleAsExcel', function() {
        it('should add the exporterVisibleAsExcel menu item to the grid', function() {
          expect(menu[7].title).toEqual('gridMenu.exporterVisibleAsExcel');
        });
        it('should set its order to be the same as the one set by exporterMenuItemOrder option + 7', function() {
          expect(menu[7].order).toEqual(grid.options.exporterMenuItemOrder + 7);
        });
        describe('shown', function() {
          it('should return true when exporterMenuExcel and exporterMenuVisibleData are both true', function() {
            grid.options.exporterMenuVisibleData = true;
            grid.options.exporterMenuExcel = true;
            expect(menu[7].shown()).toBe(true);
          });
          it('should return false when exporterMenuExcel is false', function() {
            grid.options.exporterMenuVisibleData = true;
            grid.options.exporterMenuExcel = false;
            expect(menu[7].shown()).toBe(false);
          });
          it('should return false when exporterMenuVisibleData is false', function() {
            grid.options.exporterMenuVisibleData = false;
            grid.options.exporterMenuExcel = true;
            expect(menu[7].shown()).toBe(false);
          });
          it('should return false when exporterMenuExcel and exporterMenuVisibleData are both false', function() {
            grid.options.exporterMenuVisibleData = false;
            grid.options.exporterMenuExcel = false;
            expect(menu[7].shown()).toBe(false);
          });
        });
        describe('action', function() {
          beforeEach(function() {
            grid.api.exporter.excelExport = jasmine.createSpy('excelExport');
            menu[7].action();
          });
          afterEach(function() {
            grid.api.exporter.excelExport.calls.reset();
          });
          it('should trigger excelExport on action', function() {
            expect(grid.api.exporter.excelExport).toHaveBeenCalledWith(uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE);
          });
        });
      });
      describe('exporterSelectedAsExcel', function() {
        it('should add the exporterSelectedAsExcel menu item to the grid', function() {
          expect(menu[8].title).toEqual('gridMenu.exporterSelectedAsExcel');
        });
        it('should set its order to be the same as the one set by exporterMenuItemOrder option + 8', function() {
          expect(menu[8].order).toEqual(grid.options.exporterMenuItemOrder + 8);
        });
        describe('shown', function() {
          it('should return true when exporterMenuExcel and exporterMenuSelectedData are both true, and there are selected rows', function() {
            grid.options.exporterMenuSelectedData = true;
            grid.options.exporterMenuExcel = true;
            grid.api.selection.getSelectedRows = jasmine.createSpy('getSelectedRows').and.returnValue([1]);
            expect(menu[8].shown()).toBe(true);
            grid.api.selection.getSelectedRows.calls.reset();
          });
          it('should return false when exporterMenuExcel and exporterMenuSelectedData are both true, but there are no selected rows', function() {
            grid.options.exporterMenuSelectedData = true;
            grid.options.exporterMenuExcel = true;
            grid.api.selection.getSelectedRows = jasmine.createSpy('getSelectedRows').and.returnValue([]);
            expect(menu[8].shown()).toBe(false);
            grid.api.selection.getSelectedRows.calls.reset();
          });
          it('should return false when exporterMenuExcel is false', function() {
            grid.options.exporterMenuSelectedData = true;
            grid.options.exporterMenuExcel = false;
            expect(menu[8].shown()).toBe(false);
          });
          it('should return false when exporterMenuSelectedData is false', function() {
            grid.options.exporterMenuSelectedData = false;
            grid.options.exporterMenuExcel = true;
            expect(menu[8].shown()).toBe(false);
          });
          it('should return false when exporterMenuExcel and exporterMenuSelectedData are both false', function() {
            grid.options.exporterMenuSelectedData = false;
            grid.options.exporterMenuExcel = false;
            expect(menu[8].shown()).toBe(false);
          });
        });
        describe('action', function() {
          beforeEach(function() {
            grid.api.exporter.excelExport = jasmine.createSpy('excelExport');
            menu[8].action();
          });
          afterEach(function() {
            grid.api.exporter.excelExport.calls.reset();
          });
          it('should trigger excelExport on action', function() {
            expect(grid.api.exporter.excelExport).toHaveBeenCalledWith(uiGridExporterConstants.SELECTED, uiGridExporterConstants.VISIBLE);
          });
        });
      });
    });

    describe('csvExport', function() {
      beforeEach(function() {
        spyOn(uiGridExporterService, 'downloadFile').and.callFake(angular.noop);
        spyOn(uiGridExporterService, 'loadAllDataIfNeeded').and.returnValue({
          then: function(callback) {
            callback();
          }
        });
        uiGridExporterService.csvExport(grid, uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE);
      });
      afterEach(function() {
        uiGridExporterService.downloadFile.calls.reset();
        uiGridExporterService.loadAllDataIfNeeded.calls.reset();
      });
      it('calls loadAllDataIfNeeded', function() {
        expect(uiGridExporterService.loadAllDataIfNeeded).toHaveBeenCalled();
      });
      it('calls downloadFile', function() {
        expect(uiGridExporterService.downloadFile).toHaveBeenCalled();
      });
    });

    describe('loadAllDataIfNeeded', function() {
      beforeEach(function() {
        grid.modifyRows = jasmine.createSpy('modifyRows');
        grid.options.exporterAllDataFn = jasmine.createSpy('exporterAllDataFn').and.returnValue({
          then: function(callback) {
            callback();
          }
        });
      });
      afterEach(function() {
        grid.options.exporterAllDataFn.calls.reset();
        grid.modifyRows.calls.reset();
      });
      describe('when rowType is set to all, not all rows are loaded and exporterAllDataFn is defined', function() {
        beforeEach(function() {
          grid.options.totalItems = grid.rows.length + 1;
          uiGridExporterService.loadAllDataIfNeeded(grid, uiGridExporterConstants.ALL);
        });
        it('calls exporterAllDataFn', function() {
          expect(grid.options.exporterAllDataFn).toHaveBeenCalled();
        });
        it('calls exporterAllDataFn', function() {
          expect(grid.modifyRows).toHaveBeenCalled();
        });
      });
      describe('when rowType is set to all, but all rows are loaded', function() {
        it('should return a promise', function() {
          grid.options.totalItems = grid.rows.length;
          expect(uiGridExporterService.loadAllDataIfNeeded(grid, uiGridExporterConstants.ALL).then).toBeDefined();
        });
      });
      describe('when rowType is not set to all', function() {
        it('should return a promise', function() {
          expect(uiGridExporterService.loadAllDataIfNeeded(grid, uiGridExporterConstants.VISIBLE).then).toBeDefined();
        });
      });
    });

    describe('getColumnHeaders', function() {
      it('gets visible headers', function() {
        expect(uiGridExporterService.getColumnHeaders(grid, uiGridExporterConstants.VISIBLE)).toEqual([
          {name: 'col1', displayName: 'COL1', width: 50, align: 'left'},
          {name: 'col2', displayName: 'Col2', width: '*', align: 'right'},
          {name: 'col4', displayName: 'Col4', width: 200, align: 'left'}
        ]);
      });

      it('gets all headers', function() {
        expect(uiGridExporterService.getColumnHeaders(grid, uiGridExporterConstants.ALL)).toEqual([
          {name: 'col1', displayName: 'COL1', width: 50, align: 'left'},
          {name: 'col2', displayName: 'Col2', width: '*', align: 'right'},
          {name: 'col3', displayName: 'Col3', width: 100, align: 'left'},
          {name: 'col4', displayName: 'Col4', width: 200, align: 'left'}
        ]);
      });

      it('ignores suppressed columns', function() {
        grid.columns[0].colDef.exporterSuppressExport = true;
        expect(uiGridExporterService.getColumnHeaders(grid, uiGridExporterConstants.ALL)).toEqual([
          {name: 'col2', displayName: 'Col2', width: '*', align: 'right'},
          {name: 'col3', displayName: 'Col3', width: 100, align: 'left'},
          {name: 'col4', displayName: 'Col4', width: 200, align: 'left'}
        ]);
      });

      it('ignores suppressed header', function() {
        grid.options.exporterSuppressColumns = [ 'col1'];
        expect(uiGridExporterService.getColumnHeaders(grid, uiGridExporterConstants.ALL)).toEqual([
          {name: 'col2', displayName: 'Col2', width: '*', align: 'right'},
          {name: 'col3', displayName: 'Col3', width: 100, align: 'left'},
          {name: 'col4', displayName: 'Col4', width: 200, align: 'left'}
        ]);
      });

      it('gets all headers using headerFilter', function() {
        grid.options.exporterHeaderFilter = function( displayName ) { return 'mapped_' + displayName; };

        expect(uiGridExporterService.getColumnHeaders(grid, uiGridExporterConstants.ALL)).toEqual([
          {name: 'col1', displayName: 'mapped_Col1', width: 50, align: 'left'},
          {name: 'col2', displayName: 'mapped_Col2', width: '*', align: 'right'},
          {name: 'col3', displayName: 'mapped_Col3', width: 100, align: 'left'},
          {name: 'col4', displayName: 'mapped_Col4', width: 200, align: 'left'}
        ]);
      });

      it('gets all headers using headerFilter, passing name not displayName', function() {
        grid.options.exporterHeaderFilterUseName = true;
        grid.options.exporterHeaderFilter = function( name ) { return 'mapped_' + name; };

        expect(uiGridExporterService.getColumnHeaders(grid, uiGridExporterConstants.ALL)).toEqual([
          {name: 'col1', displayName: 'mapped_col1', width: 50, align: 'left'},
          {name: 'col2', displayName: 'mapped_col2', width: '*', align: 'right'},
          {name: 'col3', displayName: 'mapped_col3', width: 100, align: 'left'},
          {name: 'col4', displayName: 'mapped_col4', width: 200, align: 'left'}
        ]);
      });
    });

    describe('getRowsFromNode', function() {
      var aNode;

      beforeEach(function() {
        aNode = {
          children: [
            {children: [{col1: 'a_1', col2: 'b_1', col3: 'c_1', children: []}]},
            {col1: 'a_2', col2: 'b_2', col3: 'c_2', children: []},
            {col1: 'a_3', col2: 'b_3', col3: 'c_3', children: []},
            {col1: 'a_4', col2: 'b_4', col3: 'c_4', children: []}
          ]
        };
      });
      it('should return rows from the node passed in', function() {
        expect(uiGridExporterService.getRowsFromNode(aNode)).toEqual([
          {col1: 'a_1', col2: 'b_1', col3: 'c_1', children: []},
          {col1: 'a_2', col2: 'b_2', col3: 'c_2', children: []},
          {col1: 'a_3', col2: 'b_3', col3: 'c_3', children: []},
          {col1: 'a_4', col2: 'b_4', col3: 'c_4', children: []}
        ]);
      });
    });

    describe('getDataSorted', function() {
      it('should return the grid rows when treeBase is not defined', function() {
        grid.treeBase = null;
        expect(uiGridExporterService.getDataSorted(grid)).toEqual(grid.rows);
      });
      it('should return the grid rows when treeBase number levels is zero', function() {
        grid.treeBase = {numberLevels: 0};
        expect(uiGridExporterService.getDataSorted(grid)).toEqual(grid.rows);
      });
      it('should return rows from a node when treeBase number levels greater than zero', function() {
        grid.treeBase = {
          numberLevels: 1,
          tree: [{
            children: [
              {children: [{row: 'a_1', children: []}]},
              {row: 'a_2', children: []},
              {row: 'a_3', children: []},
              {row: 'a_4', children: []}
            ]
          }]
        };
        expect(uiGridExporterService.getDataSorted(grid)).toEqual(['a_1', 'a_2', 'a_3', 'a_4']);
      });
    });

    describe('getData', function() {
      it('gets all rows and columns', function() {
        expect(uiGridExporterService.getData(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.ALL)).toEqual([
          [ {value: 'a_0'}, {value: 'B_0'}, {value: 'c_0'}, {value: 'd_0'} ],
          [ {value: 'a_1'}, {value: 'B_1'}, {value: 'c_1'}, {value: 'd_1'} ],
          [ {value: 'a_2'}, {value: 'B_2'}, {value: 'c_2'}, {value: 'd_2'} ]
        ]);
      });

      it('ignores selection row header column', function() {
        grid.columns[0].colDef.exporterSuppressExport = true;
        expect(uiGridExporterService.getData(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.ALL)).toEqual([
          [ {value: 'B_0'}, {value: 'c_0'}, {value: 'd_0'} ],
          [ {value: 'B_1'}, {value: 'c_1'}, {value: 'd_1'} ],
          [ {value: 'B_2'}, {value: 'c_2'}, {value: 'd_2'} ]
        ]);
      });

      it('ignores suppressed column', function() {
        grid.options.exporterSuppressColumns = [ 'col1' ];
        expect(uiGridExporterService.getData(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.ALL)).toEqual([
          [ {value: 'B_0'}, {value: 'c_0'}, {value: 'd_0'} ],
          [ {value: 'B_1'}, {value: 'c_1'}, {value: 'd_1'} ],
          [ {value: 'B_2'}, {value: 'c_2'}, {value: 'd_2'} ]
        ]);
      });

      it('ignores disabled row', function() {
        grid.rows[1].exporterEnableExporting = false;
        expect(uiGridExporterService.getData(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.ALL)).toEqual([
          [ {value: 'a_0'}, {value: 'B_0'}, {value: 'c_0'}, {value: 'd_0'} ],
          [ {value: 'a_2'}, {value: 'B_2'}, {value: 'c_2'}, {value: 'd_2'} ]
        ]);
      });

      it('gets visible rows and columns', function() {
        expect(uiGridExporterService.getData(grid, uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE)).toEqual([
          [ {value: 'a_0'}, {value: 'B_0'}, {value: 'd_0'} ],
          [ {value: 'a_2'}, {value: 'B_2'}, {value: 'd_2'} ]
        ]);
      });

      it('gets selected rows and visible columns', function() {
        expect(uiGridExporterService.getData(grid, uiGridExporterConstants.SELECTED, uiGridExporterConstants.VISIBLE)).toEqual([
          [ {value: 'a_0'}, {value: 'B_0'}, {value: 'd_0'} ]
        ]);
      });

      it('gets the rows display values', function() {
        expect(uiGridExporterService.getData(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.ALL, true)).toEqual([
          [ {value: 'a_0'}, {value: 'B_0'}, {value: 'c_0'}, {value: 'd_0'} ],
          [ {value: 'a_1'}, {value: 'B_1'}, {value: 'c_1'}, {value: 'd_1'} ],
          [ {value: 'a_2'}, {value: 'B_2'}, {value: 'c_2'}, {value: 'd_2'} ]
        ]);
      });

      it('maps data using objectCallback', function() {
        grid.options.exporterFieldCallback = function( grid, row, col, value ) {
          if ( col.name === 'col2' ) {
            return 'translated';
          } else {
            return value;
          }
        };

        expect(uiGridExporterService.getData(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.ALL)).toEqual([
          [ { value: 'a_0' }, { value: 'translated' }, { value: 'c_0' }, { value: 'd_0' } ],
          [ { value: 'a_1' }, { value: 'translated' }, { value: 'c_1' }, { value: 'd_1' } ],
          [ { value: 'a_2' }, { value: 'translated' }, { value: 'c_2' }, { value: 'd_2' } ]
        ]);
      });
    });

    describe('formatAsCsv', function() {
      it('formats empty data as a csv', function() {
        var columnHeaders = [],
          data = [],
          separator = ',';

        expect(uiGridExporterService.formatAsCsv(columnHeaders, data, separator)).toEqual('');
      });

      it('formats a mix of data as a csv', function() {
        var columnHeaders = [
            {name: 'col1', displayName: 'Col1', width: 50, align: 'left'},
            {name: 'col2', displayName: 'Col2', width: '*', align: 'left'},
            {name: 'col3', displayName: 'Col3', width: 100, align: 'left'},
            {name: 'x', displayName: '12345234', width: 200, align: 'left'}
          ],
          date = new Date(2014, 11, 12, 0, 0, 0, 0),
          data = [
            [ {value: null}, {value: 'a string'}, {value: 'A string'}, {value: 'a string'} ],
            [ {value: ''}, {value: '45'}, {value: 'A string'}, {value: false} ],
            [ {value: date}, {value: 45}, {value: 'A string'}, {value: true} ]
          ],
          separator = ',';

        expect(uiGridExporterService.formatAsCsv(columnHeaders, data, separator)).toEqual(
          '"Col1","Col2","Col3","12345234"\n,"a string","A string","a string"\n"","45","A string",FALSE\n"' + date.toISOString() + '",45,"A string",TRUE'
        );
      });

      it('formats a mix of data as a csv with custom separator', function() {
        var columnHeaders = [
            {name: 'col1', displayName: 'Col1', width: 50, align: 'left'},
            {name: 'col2', displayName: 'Col2', width: '*', align: 'left'},
            {name: 'col3', displayName: 'Col3', width: 100, align: 'left'},
            {name: 'x', displayName: '12345234', width: 200, align: 'left'}
          ],
          date = new Date(2014, 11, 12, 0, 0, 0, 0),
          data = [
            [ {value: 'a string'}, {value: 'a string'}, {value: 'A string'}, {value: 'a string'} ],
            [ {value: ''}, {value: '45'}, {value: 'A string'}, {value: false} ],
            [ {value: date}, {value: 45}, {value: 'A string'}, {value: true} ]
          ],
          separator = ';';

        expect(uiGridExporterService.formatAsCsv(columnHeaders, data, separator)).toEqual(
          '"Col1";"Col2";"Col3";"12345234"\n"a string";"a string";"A string";"a string"\n"";"45";"A string";FALSE\n"' + date.toISOString() + '";45;"A string";TRUE'
        );
      });
    });

    describe('isIE', function() {
      it('should return whether or not the current browser is equivalent tp IE', function() {
        expect(uiGridExporterService.isIE()).toEqual(navigator.userAgent.search(/(?:Edge|MSIE|Trident\/.*; rv:)/) !== -1);
      });
    });

    describe('pdfExport', function() {
      it('calls loadAllDataIfNeeded', function() {
        spyOn(uiGridExporterService, 'loadAllDataIfNeeded').and.returnValue({
          then: angular.noop
        });
        uiGridExporterService.pdfExport(grid, uiGridExporterConstants.ALL);
        expect(uiGridExporterService.loadAllDataIfNeeded).toHaveBeenCalled();
      });
    });

    describe('prepareAsPdf', function() {
      it('prepares standard grid using defaults', function() {
        /*
         * Note that you can test the results from prepareAsPdf using
         * http://pdfmake.org/playground.html#, which verifies
         * that it creates a genuine pdf
         */
        var columnHeaders = [
            {name: 'col1', displayName: 'Col1', width: 50, align: 'left'},
            {name: 'col2', displayName: 'Col2', width: '*', align: 'left'},
            {name: 'col3', displayName: 'Col3', width: 100, align: 'left'},
            {name: 'x', displayName: '12345234', width: 200, align: 'left'}
          ],
          date = new Date(2014, 11, 12, 0, 0, 0, 0),
          data = [
            [ {value: null}, {value: {foo: 'bar'}}, {value: 'A string'}, {value: 'a string'} ],
            [ {value: ''}, {value: '45'}, {value: 'A string'}, {value: false} ],
            [ {value: date}, {value: 45}, {value: 'A string'}, {value: true} ]
          ],
          result = uiGridExporterService.prepareAsPdf(grid, columnHeaders, data);

        expect(result).toEqual({
          pageOrientation : 'landscape',
          pageSize: 'A4',
          content : [{
            style : 'tableStyle',
            table : {
              headerRows : 1,
              widths: [50 * 720/450, '*', 100 * 720/450, 200 * 720/450],
              body : [
                [
                  { text : 'Col1', style : 'tableHeader' },
                  { text : 'Col2', style : 'tableHeader' },
                  { text : 'Col3', style : 'tableHeader' },
                  { text : '12345234', style : 'tableHeader' }
                ],
                [ '', {foo: 'bar'}, 'A string', 'a string' ],
                [ '', '45', 'A string', 'FALSE' ],
                [ date.toISOString(), '45', 'A string', 'TRUE' ]
              ]
            }
          }],
          styles : {
            tableStyle : {
              margin : [ 0, 5, 0, 15 ]
            },
            tableHeader : {
              bold : true, fontSize : 12, color : 'black'
            }
          },
          defaultStyle : {
            fontSize : 11
          }
        });
      });

      it('prepares standard grid using overrides', function() {
        /*
         * Note that you can test the results from prepareAsPdf using
         * http://pdfmake.org/playground.html#, which verifies
         * that it creates a genuine pdf
         */

        grid.options.exporterPdfDefaultStyle = {fontSize: 10};
        grid.options.exporterPdfTableStyle = {margin: [30, 30, 30, 30]};
        grid.options.exporterPdfTableHeaderStyle = {fontSize: 11, bold: true, italic: true};
        grid.options.exporterPdfHeader = 'My Header';
        grid.options.exporterPdfFooter = 'My Footer';
        grid.options.exporterPdfCustomFormatter = function ( docDefinition ) {
          docDefinition.styles.headerStyle = { fontSize: 10 };
          return docDefinition;
        };
        grid.options.exporterPdfOrientation = 'portrait';
        grid.options.exporterPdfPageSize = 'LETTER';
        grid.options.exporterPdfMaxGridWidth = 500;

        var columnHeaders = [
            {name: 'col1', displayName: 'Col1', width: 100, exporterPdfAlign: 'right'},
            {name: 'col2', displayName: 'Col2', width: '*', exporterPdfAlign: 'left'},
            {name: 'col3', displayName: 'Col3', width: 100, exporterPdfAlign: 'center'},
            {name: 'x', displayName: '12345234', width: 200, align: 'left'}
          ],
          date = new Date(2014, 12, 12, 0, 0, 0, 0),
          data = [
            [ {value: 'a string', alignment: 'right'}, {value: 'a string', alignment: 'center'}, {value: 'A string', alignment: 'left'}, {value: 'a string'} ],
            [ {value: '', alignment: 'right'}, {value: '45', alignment: 'center'}, {value: 'A string', alignment: 'left'}, {value: false} ],
            [ {value: date, alignment: 'right'}, {value: 45, alignment: 'center'}, {value: 'A string', alignment: 'left'}, {value: true} ]
          ],
          result = uiGridExporterService.prepareAsPdf(grid, columnHeaders, data);

        expect(result).toEqual({
          pageOrientation : 'portrait',
          pageSize: 'LETTER',
          content : [
            {
              style : 'tableStyle',
              table : {
                headerRows : 1,
                widths : [ 100, '*', 100, 200 ],
                body : [
                  [
                    { text : 'Col1', style : 'tableHeader' },
                    { text : 'Col2', style : 'tableHeader' },
                    { text : 'Col3', style : 'tableHeader' },
                    { text : '12345234', style : 'tableHeader' }
                  ],
                  [ {text: 'a string', alignment: 'right'}, { text: 'a string', alignment: 'center'}, { text: 'A string', alignment: 'left'}, 'a string' ],
                  [ {text: '', alignment: 'right'}, {text: '45', alignment: 'center'}, {text: 'A string', alignment: 'left'}, 'FALSE' ],
                  [ {text: date.toISOString(), alignment: 'right'}, {text: '45', alignment: 'center'}, {text: 'A string', alignment: 'left'}, 'TRUE' ]
                ]
              }
            }
          ],
          header : 'My Header',
          footer : 'My Footer',
          styles : {
            tableStyle : {
              margin : [ 30, 30, 30, 30 ]
            },
            tableHeader : {
              fontSize : 11, bold : true, italic : true
            },
            headerStyle: { fontSize: 10 }
          },
          defaultStyle : {
            fontSize : 10
          }
        });
      });
    });

    describe('calculatePdfHeaderWidths', function() {
      it('calculates mix of widths', function() {
        var headers = [
          { width: '20%' },
          { width: '*' },
          { width: 150 },
          { width: 200 },
          { width: 150 },
          { width: 100 }
        ];

        grid.options.exporterPdfMaxGridWidth = 410;

        // baseGridWidth = 600
        // extra 120 for 20%
        // extra 100 for '*'
        // total gridWidth 820

        expect(uiGridExporterService.calculatePdfHeaderWidths( grid, headers)).toEqual([60, '*', 75, 100, 75, 50]);
      });
    });

    describe('formatAsExcel', function() {
      it('should return the header and data as excel', function() {
        var docDefinition = {
            styles: {
              headerCenter: {
                id: 'center'
              },
              headerRight: {
                id: 'right'
              }
            }
          },
          exportColumnHeaders = angular.copy(grid.options.columnDefs);

        exportColumnHeaders[0].align = 'center';
        exportColumnHeaders[1].align = 'right';

        expect(uiGridExporterService.formatAsExcel(exportColumnHeaders, grid.options.data, {}, [], docDefinition)).toEqual([
          [
            { value: 'Col1', metadata: {style: 'center'} },
            { value: 'Col2', metadata: {style: 'right'} },
            { value: 'Col3', metadata: null },
            { value: 'Col4', metadata: null }
          ], [], [], []
        ]);
      });
    });

    describe('formatRowAsExcel', function() {
      var formatRowFn;

      beforeEach(function() {
        formatRowFn = uiGridExporterService.formatRowAsExcel(uiGridExporterService, [],[]);
      });
      it('should return a function', function() {
        expect(angular.isFunction(formatRowFn)).toBe(true);
      });
      describe('formatRowFn', function() {
        it('should return an array of formatted rows', function() {
          expect(formatRowFn([
            {value: null, metadata: {row: 1}},
            {value: 1, metadata: {row: 1}},
            {value: true, metadata: {row: 1}}
          ])).toEqual([
            {value: '', metadata: {row: 1}},
            {value: 1, metadata: {row: 1}},
            {value: 'TRUE', metadata: {row: 1}}
          ]);
        });
      });
    });

    describe('formatFieldAsExcel', function() {
      it('should an empty string when the field value is null', function() {
        expect(uiGridExporterService.formatFieldAsExcel({value: null})).toEqual('');
      });
      it('should the field value when the type of the field value is number', function() {
        expect(uiGridExporterService.formatFieldAsExcel({value: 1})).toEqual(1);
      });
      it('should "TRUE" when the type of the field value is boolean and truthy', function() {
        expect(uiGridExporterService.formatFieldAsExcel({value: true})).toEqual('TRUE');
      });
      it('should "FALSE" when the type of the field value is boolean', function() {
        expect(uiGridExporterService.formatFieldAsExcel({value: false})).toEqual('FALSE');
      });
      it('should double the amount of double quotes when the type of the field value is string', function() {
        expect(uiGridExporterService.formatFieldAsExcel({value: '"test"'})).toEqual('""test""');
      });
      it('should transform the field value into a string when the type of the field value is anything else', function() {
        expect(uiGridExporterService.formatFieldAsExcel({value: {foo: 'bar'}})).toEqual('{"foo":"bar"}');
      });
    });

    describe('prepareAsExcel', function() {
      it('should return an object with styles', function() {
        grid.options.exporterExcelCustomFormatters = false;
        grid.options.exporterExcelHeader = false;
        expect(uiGridExporterService.prepareAsExcel(grid)).toEqual({styles: {}});
      });
      describe('when exporterExcelCustomFormatters is defined', function() {
        it('should return whatever object exporterExcelCustomFormatters returns', function() {
          grid.options.exporterExcelCustomFormatters = function() {
            return {
              styles: {},
              header: {}
            };
          };
          expect(uiGridExporterService.prepareAsExcel(grid)).toEqual(grid.options.exporterExcelCustomFormatters());
        });
      });
      describe('when exporterExcelHeader is truthy', function() {
        beforeEach(function() {
          grid.options.exporterExcelCustomFormatters = function() {
            return {
              styles: {
                label: {
                  id: 'label'
                }
              }
            };
          };
        });
        it('calls exporterExcelHeader when it is a function', function() {
          grid.options.exporterExcelHeader = jasmine.createSpy('exporterExcelHeader');
          uiGridExporterService.prepareAsExcel(grid);
          expect(grid.options.exporterExcelHeader).toHaveBeenCalled();
          grid.options.exporterExcelHeader.calls.reset();
        });
        it('updates the sheet data when exporterExcelHeader is an object', function() {
          var sheet = {data: []};

          grid.options.exporterExcelHeader = {text: 'headerText', style: 'label'};
          uiGridExporterService.prepareAsExcel(grid, {}, sheet);
          expect(sheet.data).toEqual([[{value: 'headerText', metadata: {style: 'label'}}]]);
        });
      });
    });

    describe('excelExport', function() {
      it('calls loadAllDataIfNeeded', function() {
        spyOn(uiGridExporterService, 'loadAllDataIfNeeded').and.returnValue({
          then: angular.noop
        });
        uiGridExporterService.excelExport(grid, uiGridExporterConstants.ALL);
        expect(uiGridExporterService.loadAllDataIfNeeded).toHaveBeenCalled();
      });
    });
  });

  describe('uiGridExporter directive', function() {
    var element;

    beforeEach(function() {
      $scope = $rootScope.$new();

      $scope.gridOpts = {
        data: [{ name: 'Bob' }, {name: 'Mathias'}, {name: 'Fred'}]
      };

      element = angular.element('<div ui-grid="gridOpts" ui-grid-exporter></div>');
      spyOn(uiGridExporterService, 'initializeGrid').and.callThrough();

      $compile(element)($scope);
      $scope.$apply();
    });
    afterEach(function() {
      uiGridExporterService.initializeGrid.calls.reset();
    });
    it('should trigger initializeGrid on the uiGridExporterService', function() {
      expect(uiGridExporterService.initializeGrid).toHaveBeenCalled();
    });
  });
});
