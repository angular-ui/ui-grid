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
      grid.registerRowsProcessor(testObj.proc1, 70);
      grid.registerRowsProcessor(testObj.proc2, 80);
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
        }, 70);
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
        grid.registerRowsProcessor('blah', 70);
      }).toThrow();
    });
  });
  
  describe('row builder', function () {
    function testObj () { }
    
    it('should return a defined gridOptions', function () {
      var testRowBuilder = function (row, gridOptions) {
        expect(gridOptions).toBeDefined();
      };
      var row = new GridRow({str:'abc'}, 0, grid);
      testObj.testRowBuilder = jasmine.createSpy('testRowBuilder').andCallFake(testRowBuilder);
      grid.registerRowBuilder(testObj.testRowBuilder);  
      grid.processRowBuilders(row);
      expect(testObj.testRowBuilder).toHaveBeenCalled();
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

    describe('when adding the same field multiple times', function () {
      var grid;

      beforeEach(function () {
        grid = new Grid({ id: 1 });
        grid.options.columnDefs = [{ field: 'a' }];
        grid.buildColumns();
      });

      it('should not throw an exception', function () {
        expect(function () {
          for (var i = 1; i<=4; i++) {
            grid.options.columnDefs.push({ field: 'a' });
            grid.buildColumns();
          }
        }).not.toThrow();
      });

      it('should create incremental displayNames', function () {
        for (var i = 1; i<=4; i++) {
          grid.options.columnDefs.push({ field: 'a' });
        }
        grid.buildColumns();

        expect(grid.columns[0].displayName).toEqual('A');
        expect(grid.columns[1].displayName).toEqual('A2');
        expect(grid.columns[2].displayName).toEqual('A3');
        expect(grid.columns[3].displayName).toEqual('A4');
        expect(grid.columns[4].displayName).toEqual('A5');
      });
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
    
    /*
     * No longer trying to keep order of sort - we run rowsProcessors
     * immediately after anyway, which will resort.
     *
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
    */
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
        arrayProp: ['arrayPropValue'],
        dateProp:  new Date('2015-07-01T13:25:00+00:00') // Wednesday in July
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

      expect(grid.getCellDisplayValue(row,grid.getColumn('simpleProp'))).toBe('simplePropValue');
      expect(grid.getCellDisplayValue(row,grid.getColumn('complexProp'))).toBe('complexPropValue');
      expect(grid.getCellDisplayValue(row,grid.getColumn('functionProp'))).toBe('functionPropValue');
      expect(grid.getCellDisplayValue(row,grid.getColumn('arrayProp'))).toBe('arrayPropValue');
      expect(grid.getCellDisplayValue(row,grid.getColumn('weirdProp'))).toBe('weirdPropValue');

    });

    it('should apply angularjs filters', function(){
      var colDefs = [
        {displayName:'date', field:'dateProp', cellFilter: 'date:"yyyy-MM-dd"'},
        {displayName:'weekday', field:'dateProp', cellFilter: 'date:"EEEE" | uppercase'}
      ];
      var grid = new Grid({ id: 1, columnDefs:colDefs });
      var rows = [
        new GridRow(entity,1,grid)
      ];
      grid.buildColumns();
      grid.modifyRows([entity]);

      var row = grid.rows[0];
      expect(grid.getCellDisplayValue(row,grid.columns[0])).toEqual("2015-07-01");
      expect(grid.getCellDisplayValue(row,grid.columns[1])).toEqual("WEDNESDAY");
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
    
    it( 'if sort is currently null, then should toggle to ASC, and reset priority', function() {
      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(uiGridConstants.ASC);
      expect( column.sort.priority ).toEqual(1);
    });

    it( 'if sort is currently ASC, then should toggle to DESC, and reset priortiy', function() {
      column.sort = {direction: uiGridConstants.ASC, priority: 2};
      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(uiGridConstants.DESC);
      expect( column.sort.priority ).toEqual(1);
    });

    it( 'if sort is currently DESC, and suppressRemoveSort is undefined, then should toggle to null, and remove priority', function() {
      column.sort = {direction: uiGridConstants.DESC, priority: 1};
      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(null);
      expect( column.sort.priority ).toEqual(null);
    });

    it( 'if sort is currently DESC, and suppressRemoveSort is null, then should toggle to null, and remove priority', function() {
      column.sort = {direction: uiGridConstants.DESC, priority: 1, suppressRemoveSort: null};
      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(null);
      expect( column.sort.priority ).toEqual(null);
    });

    it( 'if sort is currently DESC, and suppressRemoveSort is false, then should toggle to null, and remove priority', function() {
      column.sort = {direction: uiGridConstants.DESC, priority: 1, suppressRemoveSort: false};
      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(null);
      expect( column.sort.priority ).toEqual(null);
    });

    it( 'if sort is currently DESC, and suppressRemoveSort is true, then should toggle to ASC, and reset priority', function() {
      column.sort = {direction: uiGridConstants.DESC, priority: 2};
      column.suppressRemoveSort = true;
      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(uiGridConstants.ASC);
      expect( column.sort.priority ).toEqual(1);
    });

    it( 'if another column has a sort, that sort should be removed', function() {
      var priorColumn = new GridColumn({ name: 'b', sort: { direction: uiGridConstants.ASC } }, 0, grid);
      grid.columns.push( priorColumn );

      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(uiGridConstants.ASC);
      expect( column.sort.priority ).toEqual(1);
      expect( priorColumn.sort ).toEqual({});
    });

    it( 'if another column has a sort, and add is set to true, then that sort should not be removed', function() {
      var priorColumn = new GridColumn({ name: 'b', sort: { direction: uiGridConstants.ASC, priority: 1 } }, 0, grid);
      grid.columns.push( priorColumn );

      grid.sortColumn( column, true );
      
      expect( column.sort.direction ).toEqual(uiGridConstants.ASC);
      expect( column.sort.priority ).toEqual(2);
      expect( priorColumn.sort ).toEqual({ direction: uiGridConstants.ASC, priority: 1});
    });

    it( 'if another column has a sort, and add is set to false, but that other column has suppressRemoveSort, then it shouldn\'t be removed', function() {
      var priorColumn = new GridColumn({ name: 'b', sort: { direction: uiGridConstants.ASC, priority: 1 }, suppressRemoveSort: true }, 0, grid);
      grid.columns.push( priorColumn );

      grid.sortColumn( column, false );
      
      expect( column.sort.direction ).toEqual(uiGridConstants.ASC);
      expect( column.sort.priority ).toEqual(2);
      expect( priorColumn.sort ).toEqual({ direction: uiGridConstants.ASC, priority: 1});
    });

    it( 'if sortDirectionCycle is null-DESC-ASC, and sort is currently null, then should toggle to DESC, and reset priority', function() {
      column.sort = {};
      column.sortDirectionCycle = [null, uiGridConstants.DESC, uiGridConstants.ASC];

      grid.sortColumn( column, false );

      expect( column.sort.direction ).toEqual(uiGridConstants.DESC);
      expect( column.sort.priority ).toEqual(1);
    });

    it( 'if sortDirectionCycle is null-DESC-ASC, and sort is currently ASC, then should toggle to null, and remove priority', function() {
      column.sort = {direction: uiGridConstants.ASC, priority: 1};
      column.sortDirectionCycle = [null, uiGridConstants.DESC, uiGridConstants.ASC];

      grid.sortColumn( column, false );

      expect( column.sort.direction ).toEqual(null);
      expect( column.sort.priority ).toEqual(null);
    });

    it( 'if sortDirectionCycle is DESC, and sort is currently DESC, then should not change the sort', function() {
      column.sort = {direction: uiGridConstants.DESC, priority: 1};
      column.sortDirectionCycle = [uiGridConstants.DESC];

      grid.sortColumn( column, false );

      expect( column.sort.direction ).toEqual(uiGridConstants.DESC);
      expect( column.sort.priority ).toEqual(1);
    });

    it( 'if sortDirectionCycle is DESC-null-ASC, and sort is currently DESC, and suppressRemoveSort is true, then should toggle to ASC, and reset priority', function() {
      column.sort = {direction: uiGridConstants.DESC, priority: 1};
      column.sortDirectionCycle = [uiGridConstants.DESC, null, uiGridConstants.ASC];
      column.suppressRemoveSort = true;

      grid.sortColumn( column, false );

      expect( column.sort.direction ).toEqual(uiGridConstants.ASC);
      expect( column.sort.priority ).toEqual(1);
    });
  });
  
  
  describe( 'data change callbacks', function() {
    it( 'register then deregister data change callback', function() {
      var countCallbacks = function(){
        var i = 0;
        angular.forEach(grid.dataChangeCallbacks, function(callback, key){
          i++;
        });
        return i;
      };
      
      var prevCount = countCallbacks();
      var deregFunction = grid.registerDataChangeCallback( function() {});
      expect( countCallbacks() ).toEqual( prevCount + 1 );
      
      deregFunction();
      expect( countCallbacks() ).toEqual( prevCount );
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
        grid.api.core.notifyDataChange( constants.COLUMN );
        expect( called ).toEqual( [ constants.ALL, constants.COLUMN, constants.COLUMN + constants.EDIT ]);
      });
    });
  });

  describe('clearAllFilters', function() {
    it('should clear all filter terms from all columns', function() {
      grid.columns = [
        {filters: [{term: 'A'}, {term: 'B'}]},
        {filters: [{term: 'C'}]},
        {filters: []}
      ];

      grid.clearAllFilters();

      expect(grid.columns[0].filters).toEqual([{}, {}]);
      expect(grid.columns[1].filters).toEqual([{}]);
      expect(grid.columns[2].filters).toEqual([]);
    });

    it('should call grid.refreshRows() if the refreshRows parameter is true', function() {
      spyOn(grid, 'refreshRows');

      grid.clearAllFilters(true);

      expect(grid.refreshRows).toHaveBeenCalled();
    });

    it('should not call grid.refreshRows() if the refreshRows parameter is false', function() {
      spyOn(grid, 'refreshRows');

      grid.clearAllFilters(false);

      expect(grid.refreshRows).not.toHaveBeenCalled();
    });

    it('should clear filter conditions from all columns if the clearConditions parameter is true', function() {
      grid.columns = [
        {filters: [{condition: 'a value'}]}
      ];

      grid.clearAllFilters(undefined, true, undefined);

      expect(grid.columns[0].filters[0].condition).toBeUndefined();
    });

    it('should not clear filter conditions from any column if the clearConditions parameter is false', function() {
      grid.columns = [
        {filters: [{condition: 'a value'}]}
      ];

      grid.clearAllFilters(undefined, false, undefined);

      expect(grid.columns[0].filters[0].condition).toBe('a value');
    });

    it('should clear filter flags from all columns if the clearFlags parameter is true', function() {
      grid.columns = [
        {filters: [{flags: 'a value'}]}
      ];

      grid.clearAllFilters(undefined, undefined, true);

      expect(grid.columns[0].filters[0].flags).toBeUndefined();
    });

    it('should not clear filter flags from any column if the clearFlags parameter is false', function() {
      grid.columns = [
        {filters: [{flags: 'a value'}]}
      ];

      grid.clearAllFilters(undefined, undefined, false);

      expect(grid.columns[0].filters[0].flags).toBe('a value');
    });
  });
});
