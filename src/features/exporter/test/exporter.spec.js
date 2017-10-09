describe('ui.grid.exporter uiGridExporterService', function () {
  var uiGridExporterService;
  var uiGridSelectionService;
  var uiGridExporterConstants;
  var uiGridSelectionConstants;
  var gridClassFactory;
  var grid;
  var $compile;
  var $scope;
  var $document;

  beforeEach(module('ui.grid.exporter', 'ui.grid.selection', 'ui.grid.pinning'));


  beforeEach(inject(function (_uiGridExporterService_, _uiGridSelectionService_, _uiGridPinningService_, _gridClassFactory_, _uiGridExporterConstants_,
                              _uiGridPinningConstants_,
                              _$compile_, _$rootScope_, _$document_, _uiGridSelectionConstants_) {
    uiGridExporterService = _uiGridExporterService_;
    uiGridSelectionService = _uiGridSelectionService_;
    uiGridExporterConstants = _uiGridExporterConstants_;
    gridClassFactory = _gridClassFactory_;
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
    $document = _$document_;
    uiGridSelectionConstants = _uiGridSelectionConstants_;

    grid = gridClassFactory.createGrid({});
    grid.options.columnDefs = [
        {field: 'col1', name: 'col1', displayName: 'Col1', width: 50, pinnedLeft: true},
        {field: 'col2', name: 'col2', displayName: 'Col2', width: '*', type: 'number', cellFilter: 'uppercase'},
        {field: 'col3', name: 'col3', displayName: 'Col3', width: 100},
        {field: 'col4', name: 'col4', displayName: 'Col4', width: 200}
    ];

    _uiGridExporterService_.initializeGrid(grid);
    _uiGridSelectionService_.initializeGrid(grid);
    _uiGridPinningService_.initializeGrid(grid);
    var data = [];
    for (var i = 0; i < 3; i++) {
        data.push({col1:'a_'+i, col2:'b_'+i, col3:'c_'+i, col4:'d_'+i});
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

  }));


  describe('defaultGridOptions', function() {
    var options;
    beforeEach(function() {
      options = {};
    });

    it('set all options to default', function() {
      uiGridExporterService.defaultGridOptions(options);
      expect( options ).toEqual({
        exporterSuppressMenu: false,
        exporterMenuLabel: 'Export',
        exporterCsvColumnSeparator: ',',
        exporterCsvFilename: 'download.csv',
        exporterPdfFilename: 'download.pdf',
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
        exporterFieldCallback: jasmine.any(Function),
        exporterAllDataFn: null,
        exporterSuppressColumns: [],
        exporterMenuItemOrder: 200
      });
    });

    it('set all options to non-default, including using deprecated exporterAllDataPromise', function() {
      var callback = function() {};
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
        exporterPdfHeader: "My Header",
        exporterPdfFooter: "My Footer",
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
        exporterFieldCallback: callback,
        exporterAllDataPromise: callback,
        exporterSuppressColumns: [ 'buttons' ],
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
        exporterPdfHeader: "My Header",
        exporterPdfFooter: "My Footer",
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
        exporterFieldCallback: callback,
        exporterAllDataFn: callback,
        exporterAllDataPromise: callback,
        exporterSuppressColumns: [ 'buttons' ],
        exporterMenuItemOrder: 75
      });
    });
  });


  describe('getColumnHeaders', function() {
    it('gets visible headers', function() {
      expect(uiGridExporterService.getColumnHeaders(grid, uiGridExporterConstants.VISIBLE)).toEqual([
        {name: 'col1', displayName: 'Col1', width: 50, align: 'left'},
        {name: 'col2', displayName: 'Col2', width: '*', align: 'right'},
        {name: 'col4', displayName: 'Col4', width: 200, align: 'left'}
      ]);
    });

    it('gets all headers', function() {
      expect(uiGridExporterService.getColumnHeaders(grid, uiGridExporterConstants.ALL)).toEqual([
        {name: 'col1', displayName: 'Col1', width: 50, align: 'left'},
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
      grid.options.exporterHeaderFilter = function( displayName ){ return "mapped_" + displayName; };

      expect(uiGridExporterService.getColumnHeaders(grid, uiGridExporterConstants.ALL)).toEqual([
        {name: 'col1', displayName: 'mapped_Col1', width: 50, align: 'left'},
        {name: 'col2', displayName: 'mapped_Col2', width: '*', align: 'right'},
        {name: 'col3', displayName: 'mapped_Col3', width: 100, align: 'left'},
        {name: 'col4', displayName: 'mapped_Col4', width: 200, align: 'left'}
      ]);
    });

    it('gets all headers using headerFilter, passing name not displayName', function() {
      grid.options.exporterHeaderFilterUseName = true;
      grid.options.exporterHeaderFilter = function( name ){ return "mapped_" + name; };

      expect(uiGridExporterService.getColumnHeaders(grid, uiGridExporterConstants.ALL)).toEqual([
        {name: 'col1', displayName: 'mapped_col1', width: 50, align: 'left'},
        {name: 'col2', displayName: 'mapped_col2', width: '*', align: 'right'},
        {name: 'col3', displayName: 'mapped_col3', width: 100, align: 'left'},
        {name: 'col4', displayName: 'mapped_col4', width: 200, align: 'left'}
      ]);
    });
  });


  describe('getData', function() {
    it('gets all rows and columns', function() {
      expect(uiGridExporterService.getData(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.ALL)).toEqual([
        [ {value: 'a_0'}, {value: 'b_0'}, {value: 'c_0'}, {value: 'd_0'} ],
        [ {value: 'a_1'}, {value: 'b_1'}, {value: 'c_1'}, {value: 'd_1'} ],
        [ {value: 'a_2'}, {value: 'b_2'}, {value: 'c_2'}, {value: 'd_2'} ]
      ]);
    });

    it('ignores selection row header column', function() {
      grid.columns[0].colDef.exporterSuppressExport = true;
      expect(uiGridExporterService.getData(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.ALL)).toEqual([
        [ {value: 'b_0'}, {value: 'c_0'}, {value: 'd_0'} ],
        [ {value: 'b_1'}, {value: 'c_1'}, {value: 'd_1'} ],
        [ {value: 'b_2'}, {value: 'c_2'}, {value: 'd_2'} ]
      ]);
    });

    it('ignores suppressed column', function() {
      grid.options.exporterSuppressColumns = [ 'col1' ];
      expect(uiGridExporterService.getData(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.ALL)).toEqual([
        [ {value: 'b_0'}, {value: 'c_0'}, {value: 'd_0'} ],
        [ {value: 'b_1'}, {value: 'c_1'}, {value: 'd_1'} ],
        [ {value: 'b_2'}, {value: 'c_2'}, {value: 'd_2'} ]
      ]);
    });

    it('ignores disabled row', function() {
      grid.rows[1].exporterEnableExporting = false;
      expect(uiGridExporterService.getData(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.ALL)).toEqual([
        [ {value: 'a_0'}, {value: 'b_0'}, {value: 'c_0'}, {value: 'd_0'} ],
        [ {value: 'a_2'}, {value: 'b_2'}, {value: 'c_2'}, {value: 'd_2'} ]
      ]);
    });

    it('gets visible rows and columns', function() {
      expect(uiGridExporterService.getData(grid, uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE)).toEqual([
        [ {value: 'a_0'}, {value: 'b_0'}, {value: 'd_0'} ],
        [ {value: 'a_2'}, {value: 'b_2'}, {value: 'd_2'} ]
      ]);
    });

    it('gets selected rows and visible columns', function() {
      expect(uiGridExporterService.getData(grid, uiGridExporterConstants.SELECTED, uiGridExporterConstants.VISIBLE)).toEqual([
        [ {value: 'a_0'}, {value: 'b_0'}, {value: 'd_0'} ]
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
      grid.options.exporterFieldCallback = function( grid, row, col, value ){
        if ( col.name === 'col2' ){
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
      var columnHeaders = [];
      var data = [];
      var separator = ',';

      expect(uiGridExporterService.formatAsCsv(columnHeaders, data, separator)).toEqual(
        ""
      );
    });

    it('formats a mix of data as a csv', function() {
      var columnHeaders = [
        {name: 'col1', displayName: 'Col1', width: 50, align: 'left'},
        {name: 'col2', displayName: 'Col2', width: '*', align: 'left'},
        {name: 'col3', displayName: 'Col3', width: 100, align: 'left'},
        {name: 'x', displayName: '12345234', width: 200, align: 'left'}
      ];

      var date = new Date(2014, 11, 12, 0, 0, 0, 0);

      var data = [
        [ {value: 'a string'}, {value: 'a string'}, {value: 'A string'}, {value: 'a string'} ],
        [ {value: ''}, {value: '45'}, {value: 'A string'}, {value: false} ],
        [ {value: date}, {value: 45}, {value: 'A string'}, {value: true} ]
      ];

      var separator = ',';

      expect(uiGridExporterService.formatAsCsv(columnHeaders, data, separator)).toEqual(
        '"Col1","Col2","Col3","12345234"\n"a string","a string","A string","a string"\n"","45","A string",FALSE\n"' + date.toISOString() + '",45,"A string",TRUE'
      );
    });

    it('formats a mix of data as a csv with custom separator', function() {
      var columnHeaders = [
        {name: 'col1', displayName: 'Col1', width: 50, align: 'left'},
        {name: 'col2', displayName: 'Col2', width: '*', align: 'left'},
        {name: 'col3', displayName: 'Col3', width: 100, align: 'left'},
        {name: 'x', displayName: '12345234', width: 200, align: 'left'}
      ];

      var date = new Date(2014, 11, 12, 0, 0, 0, 0);

      var data = [
        [ {value: 'a string'}, {value: 'a string'}, {value: 'A string'}, {value: 'a string'} ],
        [ {value: ''}, {value: '45'}, {value: 'A string'}, {value: false} ],
        [ {value: date}, {value: 45}, {value: 'A string'}, {value: true} ]
      ];

      var separator = ';';

      expect(uiGridExporterService.formatAsCsv(columnHeaders, data, separator)).toEqual(
        '"Col1";"Col2";"Col3";"12345234"\n"a string";"a string";"A string";"a string"\n"";"45";"A string";FALSE\n"' + date.toISOString() + '";45;"A string";TRUE'
      );
    });
  });

  describe( 'prepareAsPdf', function() {
    it( 'prepares standard grid using defaults', function() {
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
      ];

      var date = new Date(2014, 11, 12, 0, 0, 0, 0);

      var data = [
        [ {value: 'a string'}, {value: 'a string'}, {value: 'A string'}, {value: 'a string'} ],
        [ {value: ''}, {value: '45'}, {value: 'A string'}, {value: false} ],
        [ {value: date}, {value: 45}, {value: 'A string'}, {value: true} ]
      ];

      var result = uiGridExporterService.prepareAsPdf(grid, columnHeaders, data);
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
              [ 'a string', 'a string', 'A string', 'a string' ],
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

    it( 'prepares standard grid using overrides', function() {
      /*
       * Note that you can test the results from prepareAsPdf using
       * http://pdfmake.org/playground.html#, which verifies
       * that it creates a genuine pdf
       */

      grid.options.exporterPdfDefaultStyle = {fontSize: 10};
      grid.options.exporterPdfTableStyle = {margin: [30, 30, 30, 30]};
      grid.options.exporterPdfTableHeaderStyle = {fontSize: 11, bold: true, italic: true};
      grid.options.exporterPdfHeader = "My Header";
      grid.options.exporterPdfFooter = "My Footer";
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
      ];

      var date = new Date(2014, 12, 12, 0, 0, 0, 0);

      var data = [
        [ {value: 'a string', alignment: 'right'}, {value: 'a string', alignment: 'center'}, {value: 'A string', alignment: 'left'}, {value: 'a string'} ],
        [ {value: '', alignment: 'right'}, {value: '45', alignment: 'center'}, {value: 'A string', alignment: 'left'}, {value: false} ],
        [ {value: date, alignment: 'right'}, {value: 45, alignment: 'center'}, {value: 'A string', alignment: 'left'}, {value: true} ]
      ];

      var result = uiGridExporterService.prepareAsPdf(grid, columnHeaders, data);
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
        header : "My Header",
        footer : "My Footer",
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

  describe( 'calculatePdfHeaderWidths', function() {
    it( 'calculates mix of widths', function() {
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


      expect(uiGridExporterService.calculatePdfHeaderWidths( grid, headers)).toEqual(
        [60, '*', 75, 100, 75, 50]
      );
    });
  });

});
