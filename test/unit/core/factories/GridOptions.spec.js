describe('GridOptions factory', function () {
  var GridOptions;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_GridOptions_) {
    GridOptions = _GridOptions_;
  }));


 describe('initialize', function() {
    it('defaults all options', function() {
      var options = {};
      expect( GridOptions.initialize(options) ).toEqual({
        onRegisterApi: undefined,
        data: [],
        columnDefs: [],
        excludeProperties: [ '$$hashKey' ],
        enableRowHashing: true,
        rowIdentity: jasmine.any(Function),
        getRowIdentity: jasmine.any(Function),
        headerRowHeight: 30,
        rowHeight: 30,
        minRowsToShow: 10,
        showHeader: true,
        showGridFooter: false,
        showColumnFooter: false,
        columnFooterHeight: 30,
        gridFooterHeight: 30,
        columnWidth: 50,
        maxVisibleColumnCount: 200,
        virtualizationThreshold: 20,
        columnVirtualizationThreshold: 10,
        excessRows: 4,
        scrollThreshold: 4,
        excessColumns: 4,
        horizontalScrollThreshold: 2,
        scrollThrottle: 70,
        enableSorting: true,
        enableFiltering: false,
        enableColumnMenus: true,
        enableVerticalScrollbar: 1,
        enableHorizontalScrollbar: 1,
        minimumColumnSize: 10,
        rowEquality: jasmine.any(Function),
        headerTemplate: null,
        footerTemplate: null,
        menuTemplate: null,
        menuItemTemplate: null,
        rowTemplate: 'ui-grid/ui-grid-row',
        appScopeProvider: null
      });
    });

    it('true and values', function() {
      var testFunction = function() {};
      var options = {
        onRegisterApi: testFunction,
        data: [ { name: 'x' } ],
        columnDefs: [ { name: 'y' }],
        excludeProperties: [ 'y' ],
        enableRowHashing: true,
        rowIdentity: testFunction,
        getRowIdentity: testFunction,
        headerRowHeight: 40,
        rowHeight: 40,
        minRowsToShow: 15,
        showHeader: true,
        showGridFooter: true,
        showColumnFooter: true,
        columnFooterHeight: 50,
        gridFooterHeight: 50,
        columnWidth: 60,
        maxVisibleColumnCount: 25,
        virtualizationThreshold: 27,
        columnVirtualizationThreshold: 12,
        excessRows: 5,
        scrollThreshold: 6,
        excessColumns: 7,
        horizontalScrollThreshold: 3,
        scrollThrottle: 75,
        enableSorting: true,
        enableFiltering: true,
        enableColumnMenus: true,
        enableVerticalScrollbar: 1,
        enableHorizontalScrollbar: 1,
        minimumColumnSize: 20,
        rowEquality: testFunction,
        headerTemplate: 'testHeader',
        footerTemplate: 'testFooter',
        menuTemplate: 'testMenu',
        menuItemTemplate: 'testMenuItem',
        rowTemplate: 'testRow',
        extraOption: 'testExtraOption',
        appScopeProvider : 'anotherRef'
      };
      expect( GridOptions.initialize(options) ).toEqual({
        onRegisterApi: testFunction,
        data: [ { name: 'x' } ],
        columnDefs: [ { name: 'y' }],
        excludeProperties: [ 'y' ],
        enableRowHashing: true,
        rowIdentity: testFunction,
        getRowIdentity: testFunction,
        headerRowHeight: 40,
        rowHeight: 40,
        minRowsToShow: 15,
        showHeader: true,
        showGridFooter: true,
        showColumnFooter: true,
        columnFooterHeight: 50,
        gridFooterHeight: 50,
        columnWidth: 60,
        maxVisibleColumnCount: 25,
        virtualizationThreshold: 27,
        columnVirtualizationThreshold: 12,
        excessRows: 5,
        scrollThreshold: 6,
        excessColumns: 7,
        horizontalScrollThreshold: 3,
        scrollThrottle: 75,
        enableSorting: true,
        enableFiltering: true,
        enableColumnMenus: true,
        enableVerticalScrollbar: 1,
        enableHorizontalScrollbar: 1,
        minimumColumnSize: 20,
        rowEquality: testFunction,
        headerTemplate: 'testHeader',
        footerTemplate: 'testFooter',
        menuTemplate: 'testMenu',
        menuItemTemplate: 'testMenuItem',
        rowTemplate: 'testRow',
        extraOption: 'testExtraOption',
        appScopeProvider : 'anotherRef'
      });
    });

    it('false and values', function() {
      var testFunction = function() {};
      var options = {
        onRegisterApi: testFunction,
        data: [ { name: 'x' } ],
        columnDefs: [ { name: 'y' }],
        excludeProperties: [ 'y' ],
        enableRowHashing: false,
        rowIdentity: testFunction,
        getRowIdentity: testFunction,
        headerRowHeight: 40,
        rowHeight: 40,
        minRowsToShow: 15,
        showHeader: false,
        showGridFooter: false,
        showColumnFooter: false,
        columnFooterHeight: 50,
        gridFooterHeight: 50,
        columnWidth: 60,
        maxVisibleColumnCount: 25,
        virtualizationThreshold: 27,
        columnVirtualizationThreshold: 12,
        excessRows: 5,
        scrollThreshold: 6,
        excessColumns: 7,
        horizontalScrollThreshold: 3,
        scrollThrottle: 75,
        enableFiltering: false,
        enableSorting: false,
        enableColumnMenus: false,
        enableVerticalScrollbar: 0,
        enableHorizontalScrollbar: 0,
        minimumColumnSize: 10,
        rowEquality: testFunction,
        headerTemplate: 'testHeader',
        footerTemplate: 'testFooter',
        menuTemplate: 'testMenu',
        menuItemTemplate: 'testMenuItem',
        rowTemplate: 'testRow',
        extraOption: 'testExtraOption'
      };
      expect( GridOptions.initialize(options) ).toEqual({
        onRegisterApi: testFunction,
        data: [ { name: 'x' } ],
        columnDefs: [ { name: 'y' }],
        excludeProperties: [ 'y' ],
        enableRowHashing: false,
        rowIdentity: testFunction,
        getRowIdentity: testFunction,
        headerRowHeight: 0, // Because of showHeader: false
        rowHeight: 40,
        minRowsToShow: 15,
        showHeader: false,
        showGridFooter: false,
        showColumnFooter: false,
        columnFooterHeight: 50,
        gridFooterHeight: 50,
        columnWidth: 60,
        maxVisibleColumnCount: 25,
        virtualizationThreshold: 27,
        columnVirtualizationThreshold: 12,
        excessRows: 5,
        scrollThreshold: 6,
        excessColumns: 7,
        horizontalScrollThreshold: 3,
        scrollThrottle: 75,
        enableSorting: false,
        enableFiltering: false,
        enableColumnMenus: false,
        enableVerticalScrollbar: 0,
        enableHorizontalScrollbar: 0,
        minimumColumnSize: 10,
        rowEquality: testFunction,
        headerTemplate: 'testHeader',
        footerTemplate: 'testFooter',
        menuTemplate: 'testMenu',
        menuItemTemplate: 'testMenuItem',
        rowTemplate: 'testRow',
        extraOption: 'testExtraOption',
        appScopeProvider : null
      });
    });
  });
});

