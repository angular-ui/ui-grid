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
    var data = [];
      for (var i = 0; i < 10; i++) {
            data.push({col1:'a'});
      }
      grid.options.data = data;

    grid.buildColumns();
    grid.modifyRows(grid.options.data);
      grid.setVisibleRows(grid.rows);

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

  describe('shiftSelect function', function() {
      it('should select rows in between using shift key', function () {
          grid.api.selection.toggleRowSelection(grid.rows[2].entity);
          uiGridSelectionService.shiftSelect(grid, grid.rows[5], true);
          expect(grid.rows[2].isSelected).toBe(true);
          expect(grid.rows[3].isSelected).toBe(true);
          expect(grid.rows[4].isSelected).toBe(true);
          expect(grid.rows[5].isSelected).toBe(true);
      });

      it('should reverse selection order if from is bigger then to', function () {
          grid.api.selection.toggleRowSelection(grid.rows[5].entity);
          uiGridSelectionService.shiftSelect(grid, grid.rows[2], true);
          expect(grid.rows[2].isSelected).toBe(true);
          expect(grid.rows[3].isSelected).toBe(true);
          expect(grid.rows[4].isSelected).toBe(true);
          expect(grid.rows[5].isSelected).toBe(true);
      });

      it('should return if multiSelect is false', function () {
          uiGridSelectionService.shiftSelect(grid, grid.rows[2], false);
          expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(0);
      });
  });


});