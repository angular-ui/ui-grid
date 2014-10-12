describe('ui.grid.importer uiGridImporterService', function () {
  var uiGridImporterService;
  var uiGridRowEditService;
  var uiGridEditService;
  var uiGridSelectionService;
  var uiGridImporterConstants;
  var gridClassFactory;
  var grid;
  var $scope;
  var $window;
  var $interval;
  var $compile;
  var $log;

  beforeEach(module('ui.grid.importer', 'ui.grid.rowEdit'));


  beforeEach(inject(function (_uiGridImporterService_, _gridClassFactory_, _uiGridImporterConstants_,
                              _uiGridRowEditService_, _uiGridEditService_, _$interval_,
                               _$rootScope_, _$window_, _$compile_, _$log_ ) {
    uiGridImporterService = _uiGridImporterService_;
    uiGridRowEditService = _uiGridRowEditService_;
    uiGridEditService = _uiGridEditService_;
    uiGridImporterConstants = _uiGridImporterConstants_;
    gridClassFactory = _gridClassFactory_;
    $scope = _$rootScope_.$new();
    $window = _$window_;
    $interval = _$interval_;
    $compile = _$compile_;
    $log = _$log_;

    grid = gridClassFactory.createGrid({});
    grid.ptions = {};
    grid.options.columnDefs = [
        {field: 'col1', name: 'col1', displayName: 'Col1', width: 50},
        {field: 'col2', name: 'col2', displayName: 'Col2', width: '*', type: 'number'},
        {field: 'col3', name: 'col3', displayName: 'Col3', width: 100},
        {field: 'col4', name: 'col4', displayName: 'Col4', width: 200}
    ];

    var data = [];
    for (var i = 0; i < 3; i++) {
        data.push({col1:'a_'+i, col2:'b_'+i, col3:'c_'+i, col4:'d_'+i});
    }
    grid.options.data = data;
    
    _uiGridImporterService_.initializeGrid(grid);
    grid.buildColumns();
    grid.modifyRows(grid.options.data);
    grid.rows[1].visible = false;
    grid.columns[2].visible = false;
    grid.setVisibleRows(grid.rows);

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
      uiGridImporterService.defaultGridOptions(options);
      expect( options ).toEqual({
        enableImporter: true,
        importerProcessHeaders: uiGridImporterService.processHeaders,
        importerNewObject: undefined,
        importerShowMenu: false
      });
    });

    it('disable importer', function() {
      var testFunction = function() {};
      var testObject = {};
      
      options = {
        enableImporter: false,
        importerProcessHeaders: testFunction,
        importerNewObject: testObject,
        importerShowMenu: true,
        importerErrorCallback: 'test'
      };
      
      uiGridImporterService.defaultGridOptions(options);
      
      expect( options ).toEqual({
        enableImporter: false,
        importerProcessHeaders: testFunction,
        importerNewObject: testObject,
        importerShowMenu: true,
        importerErrorCallback: undefined
        
      });
    });
    
    it('enable importer', function() {
      var testFunction = function() {};
      var testObject = {};
      
      options = {
        enableImporter: true,
        importerProcessHeaders: testFunction,
        importerNewObject: testObject,
        importerShowMenu: true,
        importerErrorCallback: function () {}   
      };
      
      uiGridImporterService.defaultGridOptions(options);
      
      expect( options ).toEqual({
        enableImporter: true,
        importerProcessHeaders: testFunction,
        importerNewObject: testObject,
        importerShowMenu: false,
        importerErrorCallback: jasmine.any(Function)
      });
    });        
  });
  
  
  describe( 'importThisFile', function() {
    // not tested as yet, mocking files is annoying
  });


  describe( 'importJsonClosure', function() {
    it( 'imports a valid file', function() {
      var testFile = {target: {result: '[{"field":"some data","field2":"some more data"}]'}};
      uiGridImporterService.importJsonClosure( grid )( testFile );
      expect( grid.options.data.length ).toEqual(4);
      expect( grid.options.data[3].field ).toEqual( 'some data' );
    });
   
    it( 'with rowEdit, sets rows dirty', function() {
      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );

      grid.renderingComplete();    

      var testFile = {target: {result: '[{"field":"some data","field2":"some more data"},{"field":"2some data","field2":"2some more data"}]'}};
      uiGridImporterService.importJsonClosure( grid )( testFile );
      expect( grid.options.data.length ).toEqual(5);
      expect( grid.options.data[3].field ).toEqual( 'some data' );
      
      $scope.$digest();
      $interval.flush();
      expect( grid.rows.length ).toEqual(5);
      expect( grid.rows[3].isDirty ).toEqual( true );
      expect( grid.rows[4].isDirty ).toEqual( true );
      expect( grid.rowEditDirtyRows.length).toEqual(2);
    });  
  });


  describe( 'parseJson', function() {
    it( 'imports a valid file', function() {
      var testFile = {target: {result: '[{"field":"some data","field2":"some more data"}]'}};
      expect( uiGridImporterService.parseJson(grid, testFile) ).toEqual( [ { field: 'some data', field2: 'some more data'} ]);
    });
    
    it( 'errors on an invalid file', function() {
      var testFile = {target: {result: '[{"field""some data","field2":"some more data"}]'}};
      spyOn( uiGridImporterService, 'alertError' ).andCallFake( function() {});
      uiGridImporterService.parseJson(grid, testFile);
      expect( uiGridImporterService.alertError).toHaveBeenCalled();
    });

    it( 'errors on valid json that isn\'t an array', function() {
      var testFile = {target: {result: '{"field""some data","field2":"some more data"}'}};
      spyOn( uiGridImporterService, 'alertError' ).andCallFake( function() {});
      uiGridImporterService.parseJson(grid, testFile);
      expect( uiGridImporterService.alertError).toHaveBeenCalled();
    });
  });
  
  
  describe( 'importCsvClosure', function() {
    it( 'imports a valid file', function() {
      var testFile = {target: {result: '"col1", "col2"\n"some data","some more data"\n"2some data", "2some more data"'}};
      uiGridImporterService.importCsvClosure( grid )( testFile );
      expect( grid.options.data.length ).toEqual(5);
      expect( grid.options.data[3].col1 ).toEqual( 'some data' );
    });
   
    it( 'with rowEdit, sets rows dirty', function() {
      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );

      grid.renderingComplete();    

      var testFile = {target: {result: '"col1", "col2"\n"some data","some more data"\n"2some data", "2some more data"'}};
      uiGridImporterService.importCsvClosure( grid )( testFile );
      expect( grid.options.data.length ).toEqual(5);
      expect( grid.options.data[3].col1 ).toEqual( 'some data' );
      
      $scope.$digest();
      $interval.flush();
      expect( grid.rows.length ).toEqual(5);
      expect( grid.rows[3].isDirty ).toEqual( true );
      expect( grid.rows[4].isDirty ).toEqual( true );
      expect( grid.rowEditDirtyRows.length).toEqual(2);
    }); 
  });
  

  describe( 'createCsvObjects', function() {
    it( 'header not provided', function() {
      var fakeArray = [ [], ["data 1", "data 2", "data 3"], ["data 4", "data 5", "data 6"]];
      spyOn( uiGridImporterService, 'alertError' ).andCallFake( function() {});
      
      expect( uiGridImporterService.createCsvObjects( grid, fakeArray )).toEqual([]);
      expect( uiGridImporterService.alertError).toHaveBeenCalled();
    });

    it( 'standard headers processed, objects created with new column defs', function() {
      // this messes up the grid - OK for this test, but don't chain onto it
      grid.options.columnDefs = [];
      var fakeArray = [ ["col1", "col2", "col 3"], ["data 1", "data 2", "data 3"], ["data 4", "data 5", "data 6"]];
      
      expect( uiGridImporterService.createCsvObjects( grid, fakeArray )).toEqual([
        { col1: "data 1", col2: "data 2", col_3: "data 3"}, 
        { col1: "data 4", col2: "data 5", col_3: "data 6"} 
      ]);
    });

    it( 'standard headers processed, objects matched to column defs', function() {
      var fakeArray = [ ["col1", "col2", "col 3"], ["data 1", "data 2", "data 3"], ["data 4", "data 5", "data 6"]];
      
      expect( uiGridImporterService.createCsvObjects( grid, fakeArray )).toEqual([
        { col1: "data 1", col2: "data 2"}, 
        { col1: "data 4", col2: "data 5"} 
      ]);
    });


    it( 'custom processHeader function, maps "col 3" to "col4"', function() {
      var fakeArray = [ ["col1", "col2", "col 3"], ["data 1", "data 2", "data 3"], ["data 4", "data 5", "data 6"]];
      grid.options.importerProcessHeaders = function( theGrid, headerRow ) {
        return ["col1", "col2", "col4"];
      };
      
      expect( uiGridImporterService.createCsvObjects( grid, fakeArray )).toEqual([
        { col1: "data 1", col2: "data 2", col4: "data 3"}, 
        { col1: "data 4", col2: "data 5", col4: "data 6"} 
      ]);
    });
  });
  
  
  describe( 'parseCsv', function() {
    it( 'imports a valid file', function() {
      var testFile = {target: {result: '"field","field2"\n"some data","some more data"'}};
      expect( uiGridImporterService.parseCsv(testFile) ).toEqual( [ ["field", "field2"], ["some data", "some more data"] ]);
    });

    it( 'imports a valid file with commas in the text', function() {
      var testFile = {target: {result: '"field","field2"\n"some, data","some more data"'}};
      expect( uiGridImporterService.parseCsv(testFile) ).toEqual( [ ["field", "field2"], ["some, data", "some more data"] ]);
    });
  });
  
  
  describe( 'processHeaders', function() {
    it( 'no columnDefs, create columns', function() {
      var fakeGrid = {options: {}};
      var fakeHeaders = ["Field one","Field@#$%two","Field12  ^&* 34"];
      
      expect( uiGridImporterService.processHeaders( fakeGrid, fakeHeaders )).toEqual(
        [ "Field_one", "Field____two", "Field12______34" ]
      );
    });

    it( 'columnDefs empty, create columns', function() {
      var fakeGrid = {options: {columnDefs: []}};
      var fakeHeaders = ["Field one","Field@#$%two","Field12  ^&* 34"];
      
      expect( uiGridImporterService.processHeaders( fakeGrid, fakeHeaders )).toEqual(
        [ "Field_one", "Field____two", "Field12______34" ]
      );
    });

    it( 'columnDefs empty, create columns, different values', function() {
      var fakeGrid = {options: {columnDefs: []}};
      var fakeHeaders = ["col1","col2","col 3"];
      
      expect( uiGridImporterService.processHeaders( fakeGrid, fakeHeaders )).toEqual(
        [ "col1", "col2", "col_3" ]
      );
    });

    it( 'columnDefs, match columns', function() {
      var fakeGrid = {options: {columnDefs: [
        {name: 'gender'},
        {field: 'company'},
        {displayName: 'First Name', field: 'firstName'}
      ]}};
      
      var fakeHeaders = ["gender","company","Field12", "First Name"];
      
      expect( uiGridImporterService.processHeaders( fakeGrid, fakeHeaders )).toEqual(
        [ "gender", "company", null, "firstName" ]
      );
    });
    
    it( 'empty array, no column defs, returns empty array', function() {
      var fakeGrid = {options: {}};
      
      var fakeHeaders = [];
      
      expect( uiGridImporterService.processHeaders( fakeGrid, fakeHeaders )).toEqual(
        []
      );
    });    
  });
  
  
  describe( 'flattenColumnDefs', function() {
    it( 'creates the hash as expected for differing columnDefs', function() {
      var fakeColumnDefs = [
        { name: 'test1' },
        { field: 'test2', name: 'should_use_field' },
        { displayName: 'Test 3', field: 'test3'}
      ];
      
      expect( uiGridImporterService.flattenColumnDefs( fakeColumnDefs ) ).toEqual({
        test1: "test1",
        test2: "test2",
        should_use_field: "test2",
        "Test 3": "test3",
        test3: "test3"
      });
    });
  });
  
  
  describe( 'addObjects', function() {
    it( 'adds objects without rowEdit', function() {
      var objects = [ { name: 'Fred', gender: 'male'}, { name: 'Jane', gender: 'female' } ];
      uiGridImporterService.addObjects( grid, objects );
      expect( grid.options.data.length ).toEqual(5);
      expect( grid.options.data[3].name ).toEqual( 'Fred' );
    });
   
    it( 'with rowEdit, sets rows dirty', function() {
      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );

      grid.renderingComplete();    

      var objects = [ { name: 'Fred', gender: 'male'}, { name: 'Jane', gender: 'female' } ];
      uiGridImporterService.addObjects( grid, objects );
      expect( grid.options.data.length ).toEqual(5);
      expect( grid.options.data[3].name ).toEqual( 'Fred' );
      
      $scope.$digest();
      $interval.flush();
      expect( grid.rows.length ).toEqual(5);
      expect( grid.rows[3].isDirty ).toEqual( true );
      expect( grid.rows[4].isDirty ).toEqual( true );
      expect( grid.rowEditDirtyRows.length).toEqual(2);
    });  
  });
  
  
  describe( 'alertError', function() {
    it( 'raises an alert and writes a console log', function() {
      spyOn( $window, "alert" ).andCallFake( function() {});
      spyOn( $log, "error" ).andCallFake( function() {});

      uiGridImporterService.alertError( grid, 'importer.noHeaders', 'A message', ["test", "test2"]);

      // this will need adjusting whenever the En translation for this element changes, but is needed to 
      // check i18n is working
      expect($window.alert).toHaveBeenCalledWith( 'Column names were unable to be derived, does the file have a header?' );
      expect($log.error).toHaveBeenCalledWith( 'A message' + ["test", "test2"]);
    });
    
    it( 'calls custom error logging function if available', function() {
      grid.options.importerErrorCallback = function (){};
      spyOn( grid.options, 'importerErrorCallback' ).andCallFake( function() {} ); 
      
      uiGridImporterService.alertError( grid, 'importer.noHeaders', 'A message', ["test", "test2"]);
      expect( grid.options.importerErrorCallback ).toHaveBeenCalledWith( grid, 'importer.noHeaders', 'A message', ["test", "test2"]);  
    });
  });
});