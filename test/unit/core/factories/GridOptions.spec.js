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
        maxVisibleRowCount: 200,
        minRowsToShow: 10,
        showFooter: false,
        footerRowHeight: 30,
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
        rowTemplate: 'ui-grid/ui-grid-row'
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
        maxVisibleRowCount: 20,
        minRowsToShow: 15,
        showFooter: true,
        footerRowHeight: 50,
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
        rowTemplate: 'testRow',
        extraOption: 'testExtraOption'
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
        maxVisibleRowCount: 20,
        minRowsToShow: 15,
        showFooter: true,
        footerRowHeight: 50,
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
        rowTemplate: 'testRow',
        extraOption: 'testExtraOption'
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
        maxVisibleRowCount: 20,
        minRowsToShow: 15,
        showFooter: false,
        footerRowHeight: 50,
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
        headerRowHeight: 40,
        rowHeight: 40,
        maxVisibleRowCount: 20,
        minRowsToShow: 15,
        showFooter: false,
        footerRowHeight: 50,
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
        rowTemplate: 'testRow',
        extraOption: 'testExtraOption'
      });
    });
  });
});

