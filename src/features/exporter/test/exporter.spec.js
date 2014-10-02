describe('ui.grid.exporter uiGridExporterService', function () {
  var uiGridExporterService;
  var uiGridSelectionService;
  var uiGridExporterConstants;
  var gridClassFactory;
  var grid;
  var $compile;
  var $scope;
  var $document;

  beforeEach(module('ui.grid.exporter', 'ui.grid.selection'));


  beforeEach(inject(function (_uiGridExporterService_, _uiGridSelectionService_, _gridClassFactory_, _uiGridExporterConstants_,
                              _$compile_, _$rootScope_, _$document_) {
    uiGridExporterService = _uiGridExporterService_;
    uiGridSelectionService = _uiGridSelectionService_;
    uiGridExporterConstants = _uiGridExporterConstants_;
    gridClassFactory = _gridClassFactory_;
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
    $document = _$document_;

    grid = gridClassFactory.createGrid({});
    grid.options.columnDefs = [
        {field: 'col1', name: 'col1', displayName: 'Col1', width: 50},
        {field: 'col2', name: 'col2', displayName: 'Col2', width: '*', type: 'number'},
        {field: 'col3', name: 'col3', displayName: 'Col3', width: 100},
        {field: 'col4', name: 'col4', displayName: 'Col4', width: 200},
    ];

    _uiGridExporterService_.initializeGrid(grid);
    _uiGridSelectionService_.initializeGrid(grid);
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
        exporterSuppressButton: false,
        exporterLinkTemplate: 'ui-grid/csvLink',
        exporterHeaderTemplate: 'ui-grid/exporterHeader',
        exporterLinkLabel: 'Download CSV',
        exporterButtonLabel: 'Export',
        exporterPdfDefaultStyle : { fontSize : 11 },
        exporterPdfTableStyle : { margin : [ 0, 5, 0, 15 ] },
        exporterPdfTableHeaderStyle : { bold : true, fontSize : 12, color : 'black' },
        exporterPdfOrientation : 'landscape',
        exporterPdfPageSize : 'A4',
        exporterPdfMaxGridWidth : 720
      });
    });

    it('set all options to non-default', function() {
      options = {
        exporterSuppressButton: true,
        exporterLinkTemplate: 'myCsvLink',
        exporterHeaderTemplate: 'myExporterHeader',
        exporterLinkLabel: 'special download label',
        exporterButtonLabel: 'custom export button',
        exporterPdfDefaultStyle : { fontSize : 12 },
        exporterPdfTableStyle : { margin : [ 15, 5, 15, 15 ] },
        exporterPdfTableHeaderStyle : { bold : false, fontSize : 12, color : 'green' },
        exporterPdfOrientation : 'portrait',
        exporterPdfPageSize : 'LETTER',
        exporterPdfMaxGridWidth : 670
      };
      uiGridExporterService.defaultGridOptions(options);
      expect( options ).toEqual({
        exporterSuppressButton: true,
        exporterLinkTemplate: 'myCsvLink',
        exporterHeaderTemplate: 'myExporterHeader',
        exporterLinkLabel: 'special download label',
        exporterButtonLabel: 'custom export button',
        exporterPdfDefaultStyle : { fontSize : 12 },
        exporterPdfTableStyle : { margin : [ 15, 5, 15, 15 ] },
        exporterPdfTableHeaderStyle : { bold : false, fontSize : 12, color : 'green' },
        exporterPdfOrientation : 'portrait',
        exporterPdfPageSize : 'LETTER',
        exporterPdfMaxGridWidth : 670
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
  });


  describe('getData', function() {
    it('gets all rows and columns', function() {
      expect(uiGridExporterService.getData(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.ALL)).toEqual([
        [ 'a_0', 'b_0', 'c_0', 'd_0' ],
        [ 'a_1', 'b_1', 'c_1', 'd_1' ],
        [ 'a_2', 'b_2', 'c_2', 'd_2' ]
      ]);
    });

    it('gets visible rows and columns', function() {
      expect(uiGridExporterService.getData(grid, uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE)).toEqual([
        [ 'a_0', 'b_0', 'd_0' ],
        [ 'a_2', 'b_2', 'd_2' ]
      ]);
    });

    it('gets selected rows and visible columns', function() {
      expect(uiGridExporterService.getData(grid, uiGridExporterConstants.SELECTED, uiGridExporterConstants.VISIBLE)).toEqual([
        [ 'a_0', 'b_0', 'd_0' ]
      ]);
    });    
  });


  describe('formatAsCsv', function() {
    it('formats empty data as a csv', function() {
      var columnHeaders = [];
      var data = [];
      
      expect(uiGridExporterService.formatAsCsv(columnHeaders, data)).toEqual(
        "\n"
      );
    });

    it('formats a mix of data as a csv', function() {
      var columnHeaders = [
        {name: 'col1', displayName: 'Col1', width: 50, align: 'left'},
        {name: 'col2', displayName: 'Col2', width: '*', align: 'left'},
        {name: 'col3', displayName: 'Col3', width: 100, align: 'left'},
        {name: 'x', displayName: '12345234', width: 200, align: 'left'}
      ];
      var data = [
        [ 'a string', 'a string', 'A string', 'a string' ],
        [ '', '45', 'A string', false ],
        [ new Date('2014-12-12'), 45, 'A string', true ]
      ];

      expect(uiGridExporterService.formatAsCsv(columnHeaders, data)).toEqual(
        '"Col1","Col2","Col3","12345234"\n"a string","a string","A string","a string"\n"","45","A string",FALSE\n"2014-12-12T00:00:00.000Z",45,"A string",TRUE'
      );
    });
  });
  
/*  
  describe('renderCSVLink', function() {
    var csvContent;
    var elm;
    beforeEach(function() {
      csvContent = '"Col1","Col2","Col3","12345234"\n"a string","a string","A string","a string"\n"","45","A string",FALSE\n"2014-12-12T00:00:00.000Z",45,"A string",TRUE';

      elm = angular.element('<div class="ui-grid-exporter-header"><button class="ui-grid-exporter-menu-button" ng-if="showButton" ng-click="showExportMenu()"></button><div class="ui-grid-exporter-menu" ui-grid-exporter-menu ui-grid-menu menu-items="menuItems"></div><span class="ui-grid-exporter-csv-link"></span></div><div ui-grid></dev>');
      
      $compile(elm)($scope);
      $document[0].body.appendChild(elm[0]);

      $scope.$digest();
      
      grid.exporter.headerElm = elm;
    });

    it('render a link with no extra options', function() {
      uiGridExporterService.renderCSVLink( grid, csvContent );
      
    });

    it('', function() {
      
    });

    it('', function() {
      
    });
  });
*/

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
      var data = [
        [ 'a string', 'a string', 'A string', 'a string' ],
        [ '', '45', 'A string', false ],
        [ new Date('2014-12-12'), 45, 'A string', true ]
      ];
      
      var result = uiGridExporterService.prepareAsPdf(grid, columnHeaders, data);
      expect(result).toEqual({
        pageOrientation : 'landscape', 
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
              [ "2014-12-12T00:00:00.000Z", '45', 'A string', 'TRUE' ] 
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
      grid.options.exporterPdfOrientation = 'portrait';
      grid.options.exporterPdfPageSize = 'LETTER';
      grid.options.exporterPdfMaxGridWidth = 500;
      
      var columnHeaders = [
        {name: 'col1', displayName: 'Col1', width: 100, align: 'left'},
        {name: 'col2', displayName: 'Col2', width: '*', align: 'left'},
        {name: 'col3', displayName: 'Col3', width: 100, align: 'left'},
        {name: 'x', displayName: '12345234', width: 200, align: 'left'}
      ];
      var data = [
        [ 'a string', 'a string', 'A string', 'a string' ],
        [ '', '45', 'A string', false ],
        [ new Date('2014-12-12'), 45, 'A string', true ]
      ];
      
      var result = uiGridExporterService.prepareAsPdf(grid, columnHeaders, data);
      expect(result).toEqual({
        pageOrientation : 'portrait', 
        content : [ { 
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
              [ 'a string', 'a string', 'A string', 'a string' ], 
              [ '', '45', 'A string', 'FALSE' ], 
              [ '2014-12-12T00:00:00.000Z', '45', 'A string', 'TRUE' ] 
            ] 
          } 
        } ], 
        styles : { 
          tableStyle : { 
            margin : [ 30, 30, 30, 30 ] 
          }, 
          tableHeader : { 
            fontSize : 11, bold : true, italic : true 
          } 
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