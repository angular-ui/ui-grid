describe('Grid factory', function () {
  var $timeout, $q, $scope, grid, Grid, GridRow, GridColumn, rows, returnedRows, column, uiGridConstants;
  var gridClassFactory;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$timeout_, _$q_, _$rootScope_, _Grid_, _GridRow_, _GridColumn_, _uiGridConstants_, _gridClassFactory_) {
    $timeout = _$timeout_;
    $q = _$q_;
    $scope = _$rootScope_;
    Grid = _Grid_;
    GridRow = _GridRow_;
    GridColumn = _GridColumn_;
    uiGridConstants = _uiGridConstants_;
    gridClassFactory = _gridClassFactory_;

    grid = new Grid({ id: 1 });
    rows = [
      new GridRow({ a: 'one' }, 0, grid),
      new GridRow({ a: 'two' }, 1, grid)
    ];


    column = new GridColumn({ name: 'a' }, 0, grid);


    grid.rows = rows;
    grid.columns = [column];

    returnedRows = null;
  }));

  function runProcs () {
    grid.processRowsProcessors(grid.rows)
      .then(function (newRows) {
        returnedRows = newRows;
      });

    $scope.$digest();
  }

  describe('constructor', function() {
    it('should throw an exception if no id is provided', function() {
      expect(function() {
        var grid = new Grid();
      }).toThrow(new Error('No ID provided. An ID must be given when creating a grid.'));
    });

    it('should throw an exception if the provided id is invalid', function() {
      expect(function() {
        var grid = new Grid({ id: 'blah blah' });
      }).toThrow();
    });

    it("should say a grid ID is invalid when it doesn't follow CSS selector rules", function() {
      try {
        var grid = new Grid({ id: 'blah blah' });
      }
      catch (e) {
        expect(e).toMatch(/It must follow CSS selector syntax rules/);
      }
    });
  });

  describe('row processors', function () {
    var proc1, proc2, returnedRows;

    // Stub for adding function spies to
    function testObj() {

    }

    /* Actual rows processors */
    proc1 = function (rows) {
      rows.forEach(function (r) {
        r.c = 'foo';
      });

      return rows;
    };

    proc2 = function (rows) {
      var p = $q.defer();

      rows.forEach(function (r) {
        r.d = 'bar';
      });

      p.resolve(rows);

      return p.promise;
    };

    beforeEach(function () {
      // Create function spies but also call real functions
      testObj.proc1 = jasmine.createSpy('proc1').andCallFake(proc1);
      testObj.proc2 = jasmine.createSpy('proc2').andCallFake(proc2);

      // Register the two spies as rows processors
      grid.registerRowsProcessor(testObj.proc1);
      grid.registerRowsProcessor(testObj.proc2);
    });

    it('should call both processors', function() {
      runs(runProcs);

      runs(function () {
        expect(testObj.proc1).toHaveBeenCalled();
        expect(testObj.proc2).toHaveBeenCalled();
      });
    });

    it('should actually process the rows', function () {
      runs(runProcs);

      runs(function () {
        expect(rows[0].grid).toEqual(grid);
        expect(rows[0].c).toEqual('foo');
        expect(rows[0].d).toEqual('bar');
        expect(rows[1].c).toEqual('foo');
        expect(rows[1].d).toEqual('bar');
      });
    });

    describe(', when deregistered, ', function () {
      it('should not be run', function () {
        grid.removeRowsProcessor(testObj.proc1);

        runs(runProcs);

        runs(function () {
          expect(testObj.proc1).not.toHaveBeenCalled();
          expect(testObj.proc2).toHaveBeenCalled();
        });
      });
    });
    
    describe(', when one is broken and does not return an array, ', function () {
      beforeEach(function () {
        grid.removeRowsProcessor(testObj.proc1);
        grid.removeRowsProcessor(testObj.proc2);

        grid.registerRowsProcessor(function (blargh) {
          return "goobers!";
        });
      });

      it('should throw an exception', function () {
        expect(function () {
          runProcs();
        }).toThrow();
      });
    });
  });

  describe('with no rows processors', function () {
    it('should have none registered', function () {
      expect(grid.rowsProcessors.length).toEqual(0);
    });

    it('processRowsProcessors should return a shallow copy of grid.rows', function () {
      runs(runProcs);

      runs(function() {
        expect(returnedRows).toEqual(grid.rows);
      });
    });
  });

  describe('registering a non-function as a rows processor', function () {
    it('should error', function () {
      expect(function () {
        grid.registerRowsProcessor('blah');
      }).toThrow();
    });
  });

  describe('renderContainers', function () {
    it('should have a body render container', function () {
      expect(grid.renderContainers.body).toBeDefined();
    });

    it('should create a left render container', function () {
      expect(grid.renderContainers.left).not.toBeDefined();
      grid.createLeftContainer();
      expect(grid.renderContainers.left).toBeDefined();
      var left = grid.renderContainers.left;
      //creating twice does nothing
      grid.createLeftContainer();
      expect(grid.renderContainers.left).toBe(left);
    });
    
    it('should create a right render container', function () {
      expect(grid.renderContainers.right).not.toBeDefined();
      grid.createRightContainer();
      expect(grid.renderContainers.right).toBeDefined();
      var right = grid.renderContainers.right;
      //creating twice does nothing
      grid.createRightContainer();
      expect(grid.renderContainers.right).toBe(right);
    });


  });
  
  

  describe('buildColumns', function() {
    it('guess correct column types when not specified', function() {
      var dataRow = {str:'abc', num:123, dat:new Date(), bool:true, obj:{}, nll:null, negNum:-1, posNum:+1 };
      var grid = new Grid({ id: 1 });
      var rows = [
        new GridRow(dataRow,1,grid)
      ];


      grid.buildColumnDefsFromData([dataRow]);
      grid.buildColumns();
      grid.modifyRows([dataRow]);


      expect(grid.getColumn('str').colDef.type).toBe('string');
      expect(grid.getColumn('num').colDef.type).toBe('number');
      expect(grid.getColumn('negNum').colDef.type).toBe('number');
      expect(grid.getColumn('posNum').colDef.type).toBe('number');
      expect(grid.getColumn('dat').colDef.type).toBe('date');
      expect(grid.getColumn('bool').colDef.type).toBe('boolean');
      expect(grid.getColumn('obj').colDef.type).toBe('object');
      expect(grid.getColumn('nll').colDef.type).toBe('object');
    });

    it('not overwrite column types specified in options', function() {

      var grid1 = new Grid({ id: 3 });

      grid1.options.columnDefs = [
        {name:'str',type:'string'},
        {name:'num', type:'number'},
        {name:'dat', type:'date'},
        {name:'bool', type:'boolean'},
        {name:'obj', type:'object'}
      ];
      grid1.buildColumns();


      expect(grid1.getColumn('str').colDef.type).toBe('string');
      expect(grid1.getColumn('num').colDef.type).toBe('number');
      expect(grid1.getColumn('dat').colDef.type).toBe('date');
      expect(grid1.getColumn('bool').colDef.type).toBe('boolean');
      expect(grid1.getColumn('obj').colDef.type).toBe('object');
    });
    
    it('add columns at the correct position - middle', function() {
      var grid1 = new Grid({ id: 3 });

      grid1.options.columnDefs = [
        {name:'1'},
        {name:'2'},
        {name:'3'},
        {name:'4'},
        {name:'5'}
      ];
      grid1.buildColumns();
      
      expect(grid1.columns[0].name).toEqual('1');
      expect(grid1.columns[1].name).toEqual('2');
      expect(grid1.columns[2].name).toEqual('3');
      expect(grid1.columns[3].name).toEqual('4');
      expect(grid1.columns[4].name).toEqual('5');
      
      grid1.options.columnDefs.splice(3, 0, {name: '3.5'});
      grid1.buildColumns();

      expect(grid1.columns[0].name).toEqual('1');
      expect(grid1.columns[1].name).toEqual('2');
      expect(grid1.columns[2].name).toEqual('3');
      expect(grid1.columns[3].name).toEqual('3.5');
      expect(grid1.columns[4].name).toEqual('4');
      expect(grid1.columns[5].name).toEqual('5');      
    });

    it('should respect the row header', function() {
      var columnDefs =  [
        {name:'1'},
        {name:'2'},
        {name:'3'},
        {name:'4'},
        {name:'5'}
      ];

      var grid1 =  gridClassFactory.createGrid({columnDefs:columnDefs});


      $timeout(function(){
        grid1.addRowHeaderColumn({name:'rowHeader'});
      });
      $timeout.flush();

      $timeout(function(){
        grid1.buildColumns();
      });
      $timeout.flush();


      expect(grid1.columns[0].name).toEqual('rowHeader');
      expect(grid1.columns[1].name).toEqual('1');
      expect(grid1.columns[2].name).toEqual('2');
      expect(grid1.columns[3].name).toEqual('3');
      expect(grid1.columns[4].name).toEqual('4');
      expect(grid1.columns[5].name).toEqual('5');

      grid1.options.columnDefs.splice(3, 0, {name: '3.5'});

      $timeout(function(){
        grid1.buildColumns();
      });
      $timeout.flush();

      expect(grid1.columns[1].name).toEqual('1');
      expect(grid1.columns[2].name).toEqual('2');
      expect(grid1.columns[3].name).toEqual('3');
      expect(grid1.columns[4].name).toEqual('3.5');
      expect(grid1.columns[5].name).toEqual('4');
      expect(grid1.columns[6].name).toEqual('5');
    });

    it('add columns at the correct position - start', function() {
      var grid1 = new Grid({ id: 3 });

      grid1.options.columnDefs = [
        {name:'1'},
        {name:'2'},
        {name:'3'},
        {name:'4'},
        {name:'5'}
      ];
      grid1.buildColumns();
      
      expect(grid1.columns[0].name).toEqual('1');
      expect(grid1.columns[1].name).toEqual('2');
      expect(grid1.columns[2].name).toEqual('3');
      expect(grid1.columns[3].name).toEqual('4');
      expect(grid1.columns[4].name).toEqual('5');
      
      grid1.options.columnDefs.unshift({name: '0.5'});
      grid1.buildColumns();

      expect(grid1.columns[0].name).toEqual('0.5');
      expect(grid1.columns[1].name).toEqual('1');
      expect(grid1.columns[2].name).toEqual('2');
      expect(grid1.columns[3].name).toEqual('3');
      expect(grid1.columns[4].name).toEqual('4');
      expect(grid1.columns[5].name).toEqual('5');      
    });

    it('add columns at the correct position - end', function() {
      var grid1 = new Grid({ id: 3 });

      grid1.options.columnDefs = [
        {name:'1'},
        {name:'2'},
        {name:'3'},
        {name:'4'},
        {name:'5'}
      ];
      grid1.buildColumns();
      
      expect(grid1.columns[0].name).toEqual('1');
      expect(grid1.columns[1].name).toEqual('2');
      expect(grid1.columns[2].name).toEqual('3');
      expect(grid1.columns[3].name).toEqual('4');
      expect(grid1.columns[4].name).toEqual('5');
      
      grid1.options.columnDefs.push({name: '5.5'});
      grid1.buildColumns();

      expect(grid1.columns[0].name).toEqual('1');
      expect(grid1.columns[1].name).toEqual('2');
      expect(grid1.columns[2].name).toEqual('3');
      expect(grid1.columns[3].name).toEqual('4');
      expect(grid1.columns[4].name).toEqual('5');
      expect(grid1.columns[5].name).toEqual('5.5');      
    });
  });

  describe('follow source array', function() {
    it('should insert it on position 0', function() {
      var dataRows = [{str:'abc'}];
      var grid = new Grid({ id: 1 });

      grid.modifyRows(dataRows);


      expect(grid.rows.length).toBe(1);
      expect(grid.rows[0].entity.str).toBe('abc');
      
      dataRows.splice(0,0,{str:'cba'});
      grid.modifyRows(dataRows);
      
      expect(grid.rows.length).toBe(2);
      expect(grid.rows[0].entity.str).toBe('cba');
    });
    
    it('should swap', function() {
        var dataRows = [{str:'abc'},{str:'cba'}];
        var grid = new Grid({ id: 1 });

        grid.modifyRows(dataRows);

        expect(grid.rows[0].entity.str).toBe('abc');
        expect(grid.rows[1].entity.str).toBe('cba');

        var tmpRow = dataRows[0];
        dataRows[0] = dataRows[1];
        dataRows[1] = tmpRow;
        grid.modifyRows(dataRows);
        
        expect(grid.rows[0].entity.str).toBe('cba');
        expect(grid.rows[1].entity.str).toBe('abc');
      });
    it('should delete and insert new in the middle', function() {
        var dataRows = [{str:'abc'},{str:'cba'},{str:'bac'}];
        var grid = new Grid({ id: 1 });

        grid.modifyRows(dataRows);

        expect(grid.rows.length).toBe(3);
        expect(grid.rows[0].entity.str).toBe('abc');
        expect(grid.rows[1].entity.str).toBe('cba');
        expect(grid.rows[2].entity.str).toBe('bac');

        dataRows[1] = {str:'xyz'};
        grid.modifyRows(dataRows);
        
        expect(grid.rows.length).toBe(3);
        expect(grid.rows[0].entity.str).toBe('abc');
        expect(grid.rows[1].entity.str).toBe('xyz');
        expect(grid.rows[2].entity.str).toBe('bac');
      });
    it('should keep the order of the sort', function() {
        var dataRows = [{str:'abc'},{str:'cba'},{str:'bac'}];
        var grid = new Grid({ id: 1 });
        grid.options.columnDefs = [{name:'1',type:'string'}];
        grid.buildColumns();
        grid.modifyRows(dataRows);

        expect(grid.rows.length).toBe(3);
        expect(grid.rows[0].entity.str).toBe('abc');
        expect(grid.rows[1].entity.str).toBe('cba');
        expect(grid.rows[2].entity.str).toBe('bac');

        grid.sortColumn(grid.columns[0]);
        
        dataRows.splice(0,0,{str:'xyz'});
        grid.modifyRows(dataRows);
        expect(grid.rows.length).toBe(4);
        expect(grid.rows[0].entity.str).toBe('abc');
        expect(grid.rows[3].entity.str).toBe('xyz');
      });
  });

  describe('binding', function() {
    var entity;

    beforeEach(function(){
      entity = {
        simpleProp: 'simplePropValue',
        complexProp: { many: { paths: 'complexPropValue'}},
        functionProp: function () {
          return 'functionPropValue';
        },
        arrayProp: ['arrayPropValue']
      };
      entity['\"!weird-pro\'p'] = 'weirdPropValue';

    });

    it('should replace constants in template', inject(function ($timeout) {

      var colDefs = [
        {name:'simpleProp', cellTemplate:'<div ng-model="MODEL_COL_FIELD"/>'}
      ];
      var grid =  gridClassFactory.createGrid({columnDefs:colDefs });
      var rows = [
        new GridRow(entity,1,grid)
      ];

      $timeout(function () {
        grid.buildColumns();
      });
      $timeout.flush();
      grid.modifyRows([entity]);
      grid.preCompileCellTemplates();

      var row = grid.rows[0];
      expect(grid.getColumn('simpleProp').compiledElementFn).toBeDefined();

    }));

    it('should bind correctly to simple prop', function() {

      var colDefs = [
        {name:'simpleProp'},
        {name:'complexProp', field:'complexProp.many.paths'},
        {name:'functionProp', field:'functionProp()'},
        {name:'arrayProp', field:'arrayProp[0]'},
        {name:'weirdProp', field:'\"!weird-pro\'p'}
      ];
      var grid = new Grid({ id: 1, columnDefs:colDefs });
      var rows = [
        new GridRow(entity,1,grid)
      ];


      grid.buildColumns();
      grid.modifyRows([entity]);

      var row = grid.rows[0];
      expect(grid.getCellValue(row,grid.getColumn('simpleProp'))).toBe('simplePropValue');
      expect(grid.getCellValue(row,grid.getColumn('complexProp'))).toBe('complexPropValue');
      expect(grid.getCellValue(row,grid.getColumn('functionProp'))).toBe('functionPropValue');
      expect(grid.getCellValue(row,grid.getColumn('arrayProp'))).toBe('arrayPropValue');
      expect(grid.getCellValue(row,grid.getColumn('weirdProp'))).toBe('weirdPropValue');

    });

    it('not overwrite column types specified in options', function() {

      var grid1 = new Grid({ id: 3 });

      grid1.options.columnDefs = [
        {name:'str',type:'string'},
        {name:'num', type:'number'},
        {name:'dat', type:'date'},
        {name:'bool', type:'boolean'},
        {name:'obj', type:'object'}
      ];
      grid1.buildColumns();


      expect(grid1.getColumn('str').colDef.type).toBe('string');
      expect(grid1.getColumn('num').colDef.type).toBe('number');
      expect(grid1.getColumn('dat').colDef.type).toBe('date');
      expect(grid1.getColumn('bool').colDef.type).toBe('boolean');
      expect(grid1.getColumn('obj').colDef.type).toBe('object');
    });
  });

  describe('row header', function() {


    beforeEach(function(){


    });


    it('should create left container for left row header', inject(function(gridClassFactory, $timeout) {
      var colDefs = [
        {name:'col1'}
      ];
      var grid = new gridClassFactory.createGrid({ columnDefs:colDefs });

      spyOn( grid, "preCompileCellTemplates").andCallFake(function() {});
      spyOn( grid, "handleWindowResize").andCallFake(function() {});

      $timeout(function () {
        grid.addRowHeaderColumn({name: 'rowHeader', cellTemplate: "<div/>"});
      });
      $timeout.flush();
      expect(grid.hasLeftContainer()).toBe(true);
      expect(grid.hasRightContainer()).toBe(false);

      grid.buildColumns();
      expect(grid.columns.length).toBe(2);

    }));


    it('should create right container when RTL', inject(function(gridClassFactory, $timeout) {

      var colDefs = [
        {name:'col1'}
      ];
      var grid = new gridClassFactory.createGrid({columnDefs:colDefs });
      grid.rtl = true;

      spyOn( grid, "preCompileCellTemplates").andCallFake(function() {});
      spyOn( grid, "handleWindowResize").andCallFake(function() {});

      $timeout(function () {
        grid.addRowHeaderColumn({name: 'rowHeader', cellTemplate: "<div/>"});
      });
      $timeout.flush();
      expect(grid.hasLeftContainer()).toBe(false);
      expect(grid.hasRightContainer()).toBe(true);


      $timeout(function () {
        grid.buildColumns();
      });
      $timeout.flush();

      expect(grid.columns.length).toBe(2);

      //test calling build columns twice to assure we don't get duplicate headers
      $timeout(function () {
        grid.buildColumns();
      });
      $timeout.flush();
      expect(grid.columns.length).toBe(2);

    }));

  });

  describe('sortColumn', function() {
    it('should throw an exception if no column parameter is provided', function() {
      expect(function () {
        grid.sortColumn();
      }).toThrow();

      try {
        grid.sortColumn();
      }
      catch (e) {
        expect(e.message).toContain('No column parameter provided', 'exception contains column name');
      }
    });
    
    it( 'if sort is currently null, then should toggle to ASC', function() {
      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(uiGridConstants.ASC);
    });

    it( 'if sort is currently ASC, then should toggle to DESC', function() {
      column.sort = {direction: uiGridConstants.ASC};
      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(uiGridConstants.DESC);
    });

    it( 'if sort is currently DESC, and suppressRemoveSort is undefined, then should toggle to null', function() {
      column.sort = {direction: uiGridConstants.DESC};
      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(null);
    });

    it( 'if sort is currently DESC, and suppressRemoveSort is null, then should toggle to null', function() {
      column.sort = {direction: uiGridConstants.DESC};
      column.colDef = { suppressRemoveSort: null };
      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(null);
    });

    it( 'if sort is currently DESC, and suppressRemoveSort is false, then should toggle to null', function() {
      column.sort = {direction: uiGridConstants.DESC};
      column.colDef = { suppressRemoveSort: false };
      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(null);
    });

    it( 'if sort is currently DESC, and suppressRemoveSort is true, then should toggle to ASC', function() {
      column.sort = {direction: uiGridConstants.DESC};
      column.colDef = { suppressRemoveSort: true };
      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(uiGridConstants.ASC);
    });
  });
  
  
  describe( 'data change callbacks', function() {
    it( 'register then deregister data change callback', function() {
      var uid = grid.registerDataChangeCallback( function() {});
      expect( grid.dataChangeCallbacks[uid]).toEqual( { callback: jasmine.any(Function), types: [ uiGridConstants.dataChange.ALL ] } );
      
      grid.deregisterDataChangeCallback( uid );
      expect( grid.dataChangeCallbacks[uid] ).toEqual( undefined );
    });

    describe( 'mix of callbacks being called', function() {
      var called;
      var constants;
      
      beforeEach( function() {
        called = [];
        constants = uiGridConstants.dataChange;
        
        // this function will push it's type into the called array when it's called
        var createCallbackFunction = function( type ){
          return function( grid ){
            called.push( type );
          };
        };
        
        grid.registerDataChangeCallback( createCallbackFunction( constants.ALL ), [constants.ALL] );
        grid.registerDataChangeCallback( createCallbackFunction( constants.ROW ), [constants.ROW] );
        grid.registerDataChangeCallback( createCallbackFunction( constants.EDIT ), [constants.EDIT] );
        grid.registerDataChangeCallback( createCallbackFunction( constants.COLUMN ), [constants.COLUMN] );
        grid.registerDataChangeCallback( createCallbackFunction( constants.COLUMN + constants.EDIT ), [constants.COLUMN, constants.EDIT] );
      });
      
      it( 'call of type ALL', function() {
        grid.callDataChangeCallbacks( constants.ALL );
        expect( called ).toEqual( [ constants.ALL, constants.ROW, constants.EDIT, constants.COLUMN, constants.COLUMN + constants.EDIT]);
      });

      it( 'call of type ROW', function() {
        grid.callDataChangeCallbacks( constants.ROW );
        expect( called ).toEqual( [ constants.ALL, constants.ROW ]);
      });

      it( 'call of type EDIT', function() {
        grid.callDataChangeCallbacks( constants.EDIT );
        expect( called ).toEqual( [ constants.ALL, constants.EDIT, constants.COLUMN + constants.EDIT ]);
      });

      it( 'call of type COLUMN', function() {
        grid.callDataChangeCallbacks( constants.COLUMN );
        expect( called ).toEqual( [ constants.ALL, constants.COLUMN, constants.COLUMN + constants.EDIT ]);
      });
      
      it( 'call works via api', function() {
        grid.api.core.notifyDataChange( grid, constants.COLUMN );
        expect( called ).toEqual( [ constants.ALL, constants.COLUMN, constants.COLUMN + constants.EDIT ]);
      });
    });
  });
});
