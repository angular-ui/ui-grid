describe('ui.grid.edit uiGridEditService', function () {
  var uiGridEditService;
  var gridClassFactory;



  beforeEach(module('ui.grid.edit'));

  beforeEach(inject(function (_uiGridEditService_,_gridClassFactory_, $templateCache) {
    uiGridEditService = _uiGridEditService_;
    gridClassFactory = _gridClassFactory_;

    $templateCache.put('ui-grid/uiGridCell', '<div/>');
    $templateCache.put('ui-grid/cellEditor', '<div ui-grid-editor></div>');


  }));

  describe('editColumnBuilder function', function () {

    it('should default gridOptions', inject(function ($timeout) {

      var options = {};
      uiGridEditService.defaultGridOptions(options);
      expect(options.enableCellEdit).toBe(undefined);
      expect(options.cellEditableCondition).toBe(true);
      expect(options.enableCellEditOnFocus).toBe(false);

      options.enableCellEdit = false;
      uiGridEditService.defaultGridOptions(options);
      expect(options.enableCellEdit).toBe(false);

      function myFunc(){}
      options.cellEditableCondition = myFunc;
      uiGridEditService.defaultGridOptions(options);
      expect(options.cellEditableCondition).toBe(myFunc);

      options.cellEditableCondition = false;
      uiGridEditService.defaultGridOptions(options);
      expect(options.cellEditableCondition).toBe(false);

      options.enableCellEditOnFocus = true;
      uiGridEditService.defaultGridOptions(options);
      expect(options.enableCellEditOnFocus).toBe(true);

    }));

    it('should create additional edit properties', inject(function ($timeout) {
      var  grid = gridClassFactory.createGrid();
      grid.options.columnDefs = [
        {field: 'col1', enableCellEdit: true}
      ];
      $timeout(function(){
        uiGridEditService.defaultGridOptions(grid.options);
        grid.buildColumns();
      });
      $timeout.flush();

      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      $timeout(function(){
        uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      });
      $timeout.flush();

       expect(col.colDef.enableCellEdit).toBe(true);
      expect(col.editableCellTemplate).toBeDefined();
    }));

    it('should not create additional edit properties if edit is not enabled for a column', function () {
      var  grid = gridClassFactory.createGrid();
      grid.options.columnDefs = [
        {field: 'col1', enableCellEdit: false}
      ];
      grid.buildColumns();


      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      expect(col.colDef.enableCellEdit).toBe(false);
      expect(col.editableCellTemplate).not.toBeDefined();
    });

    it('should create additional edit properties if global enableCellEdit is true', inject(function ($timeout) {
      var  grid = gridClassFactory.createGrid();
      grid.options.enableCellEdit = true;
      grid.options.columnDefs = [
        {field: 'col1'}
      ];
      grid.buildColumns();

      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      $timeout(function(){
        uiGridEditService.defaultGridOptions(grid.options);
        uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      });
      $timeout.flush();
      expect(col.colDef.enableCellEdit).toBe(true);
      expect(col.colDef.editableCellTemplate).toBeDefined();
    }));

    it('should not create additional edit properties if global enableCellEdit is false', function () {
      var  grid = gridClassFactory.createGrid();
      grid.options.enableCellEdit = false;
      grid.options.columnDefs = [
        {field: 'col1'}
      ];
      grid.buildColumns();

      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      expect(col.colDef.enableCellEdit).toBe(false);
      expect(col.colDef.editableCellTemplate).not.toBeDefined();
    });

    it('should not create additional edit properties for column of type object', function () {
      var  grid = gridClassFactory.createGrid();
      grid.options.columnDefs = [
        {field: 'col1', type: 'object'}
      ];
      grid.buildColumns();

      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      expect(col.colDef.enableCellEdit).toBe(false);
      expect(col.colDef.editableCellTemplate).not.toBeDefined();
    });

    it('should override enableCellEdit for each coldef if global enableCellEdit is false', inject(function ($timeout) {
      var  grid = gridClassFactory.createGrid();
      grid.options.enableCellEdit = false;
      grid.options.columnDefs = [
        {field: 'col1', enableCellEdit:true},
        {field: 'col2', enableCellEdit:false}
      ];
      grid.buildColumns();

      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      $timeout(function(){
        uiGridEditService.defaultGridOptions(grid.options);
        uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      });
      $timeout.flush();
      expect(col.colDef.enableCellEdit).toBe(true);
      expect(col.editableCellTemplate).toBeDefined();

      colDef = grid.options.columnDefs[1];
      col = grid.columns[1];
      uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      expect(col.colDef.enableCellEdit).toBe(false);
      expect(col.editableCellTemplate).not.toBeDefined();
    }));

    it('should override enableCellEdit for each coldef if global enableCellEdit is true', inject(function($timeout) {
      var  grid = gridClassFactory.createGrid();
      grid.options.enableCellEdit = true;
      grid.options.columnDefs = [
        {field: 'col1', enableCellEdit:false},
        {field: 'col2', enableCellEdit:true}
      ];
      grid.buildColumns();

      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      $timeout(function(){
        uiGridEditService.defaultGridOptions(grid.options);
        uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      });
      $timeout.flush();
      expect(col.colDef.enableCellEdit).toBe(false);
      expect(col.editableCellTemplate).not.toBeDefined();

      colDef = grid.options.columnDefs[1];
      col = grid.columns[1];
      $timeout(function(){
        uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      });
      $timeout.flush();
      expect(col.colDef.enableCellEdit).toBe(true);
      expect(col.editableCellTemplate).toBeDefined();
    }));

  });

});