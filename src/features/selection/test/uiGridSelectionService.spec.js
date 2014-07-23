describe('ui.grid.selectition uiGridSelectionService', function () {
  var uiGridSelectionService;
  var gridClassFactory;
  var grid;

  beforeEach(module('ui.grid.selection'));

  beforeEach(inject(function (_uiGridSelectionService_,_gridClassFactory_, $templateCache, _uiGridSelectionConstants_) {
    uiGridSelectionService = _uiGridSelectionService_;
    gridClassFactory = _gridClassFactory_;

    $templateCache.put('ui-grid/uiGridCell', '<div/>');
    $templateCache.put('ui-grid/editableCell', '<div editable_cell_directive></div>');

    grid = gridClassFactory.createGrid({});
    grid.options.columnDefs = [
      {field: 'col1', enableCellEdit: true}
    ];

    _uiGridSelectionService_.initializeGrid(grid);
    grid.options.data = [{col1:'a'},{col1:'b'}];

    grid.buildColumns();
    grid.modifyRows(grid.options.data);
  }));


  describe('toggleSelection function', function () {
    it('should toggle selected', function () {
      uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], true);
      expect(grid.rows[0].isSelected).toBe(true);

      uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], true);
      expect(grid.rows[0].isSelected).toBe(false);
    });

    it('should toggle selected', function () {
      uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], false);
      expect(grid.rows[0].isSelected).toBe(true);

      uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], false);
      expect(grid.rows[0].isSelected).toBe(false);
      expect(grid.rows[1].isSelected).toBe(true);
    });

    it('should clear selected', function () {
      uiGridSelectionService.toggleRowSelection(grid, grid.rows[0]);
      expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(1);
      uiGridSelectionService.clearSelectedRows(grid);
      expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(0);
    });

    it('should utilize public apis', function () {
      grid.api.selection.toggleRowSelection(grid.rows[0].entity);
      expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(1);
      grid.api.selection.clearSelectedRows();
      expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(0);
    });
  });

});