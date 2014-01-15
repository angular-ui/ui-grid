describe('ui.grid.edit uiGridEditService', function () {
  var uiGridEditService;
  var gridClassFactory;



  beforeEach(module('ui.grid.edit'));

  beforeEach(inject(function (_uiGridEditService_,_gridClassFactory_, $templateCache) {
    uiGridEditService = _uiGridEditService_;
    gridClassFactory = _gridClassFactory_;

    $templateCache.put('ui-grid/uiGridCell', '<div/>');
    $templateCache.put('ui-grid/edit/editableCell', '<div editable_cell_directive></div>');



  }));

  describe('editColumnBuilder function', function () {

    it('should create additional edit properties', function () {
      var  grid = gridClassFactory.createGrid();
      grid.options.columnDefs = [
        {field: 'col1', enableCellEdit: true}
      ];
      grid.buildColumns();

      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      expect(col.enableCellEdit).toBe(true);
      expect(col.editableCellTemplate).toBeDefined();
      expect(col.editableCellDirective).toBeDefined();
    });

    it('should not create additional edit properties if edit is not enabled for a column', function () {
      var  grid = gridClassFactory.createGrid();
      grid.options.columnDefs = [
        {field: 'col1', enableCellEdit: false}
      ];
      grid.buildColumns();


      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      expect(col.enableCellEdit).toBe(false);
      expect(col.editableCellTemplate).not.toBeDefined();
      expect(col.editableCellDirective).not.toBeDefined();
    });

    it('should not create additional edit properties if global enableCellEdit is true', function () {
      var  grid = gridClassFactory.createGrid();
      grid.options.enableCellEdit = true;
      grid.options.columnDefs = [
        {field: 'col1'}
      ];
      grid.buildColumns();

      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      expect(col.enableCellEdit).toBe(true);
      expect(col.editableCellTemplate).toBeDefined();
      expect(col.editableCellDirective).toBeDefined();
    });

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
      expect(col.enableCellEdit).toBe(false);
      expect(col.editableCellTemplate).not.toBeDefined();
      expect(col.editableCellDirective).not.toBeDefined();
    });

    it('should override enableCellEdit for each coldef if global enableCellEdit is false', function () {
      var  grid = gridClassFactory.createGrid();
      grid.options.enableCellEdit = false;
      grid.options.columnDefs = [
        {field: 'col1', enableCellEdit:true},
        {field: 'col2', enableCellEdit:false}
      ];
      grid.buildColumns();

      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      expect(col.enableCellEdit).toBe(true);
      expect(col.editableCellTemplate).toBeDefined();
      expect(col.editableCellDirective).toBeDefined();

      colDef = grid.options.columnDefs[1];
      col = grid.columns[1];
      uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      expect(col.enableCellEdit).toBe(false);
      expect(col.editableCellTemplate).not.toBeDefined();
      expect(col.editableCellDirective).not.toBeDefined();
    });

    it('should override enableCellEdit for each coldef if global enableCellEdit is true', function () {
      var  grid = gridClassFactory.createGrid();
      grid.options.enableCellEdit = true;
      grid.options.columnDefs = [
        {field: 'col1', enableCellEdit:false},
        {field: 'col2', enableCellEdit:true}
      ];
      grid.buildColumns();

      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      expect(col.enableCellEdit).toBe(false);
      expect(col.editableCellTemplate).not.toBeDefined();
      expect(col.editableCellDirective).not.toBeDefined();

      colDef = grid.options.columnDefs[1];
      col = grid.columns[1];
      uiGridEditService.editColumnBuilder(colDef,col,grid.options);
      expect(col.enableCellEdit).toBe(true);
      expect(col.editableCellTemplate).toBeDefined();
      expect(col.editableCellDirective).toBeDefined();
    });

  });

});