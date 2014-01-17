describe('ui.grid.edit uiGridCellNavService', function () {
  var uiGridCellNavService;
  var gridClassFactory;
  var grid;
  var uiGridConstants;
  var uiGridCellNavConstants;

  beforeEach(module('ui.grid.cellNav'));

  beforeEach(inject(function (_uiGridCellNavService_, _gridClassFactory_, $templateCache, _uiGridConstants_, _uiGridCellNavConstants_) {
    uiGridCellNavService = _uiGridCellNavService_;
    gridClassFactory = _gridClassFactory_;
    uiGridConstants = _uiGridConstants_;
    uiGridCellNavConstants = _uiGridCellNavConstants_;

    $templateCache.put('ui-grid/uiGridCell', '<div/>');

    grid = gridClassFactory.createGrid();
    grid.options.columnDefs = [
      {name: 'col1', allowCellFocus: true},
      {name: 'col2', allowCellFocus: false},
      {name: 'col3'}
    ];

    grid.options.data = [
      {col1: 'row0col0', col2: 'row0col1', col3: 'row0col2'},
      {col1: 'row1col0', col2: 'row1col1', col3: 'row1col2'},
      {col1: 'row2col0', col2: 'row2col1', col3: 'row2col2'}
    ];

    grid.buildColumns();
    grid.modifyRows(grid.options.data);
  }));

  describe('cellNavColumnBuilder function', function () {

    it('should populate allowCellFocus with defaults', function () {
      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      uiGridCellNavService.cellNavColumnBuilder(colDef, col, grid.options);
      expect(col.allowCellFocus).toBe(true);

      colDef = grid.options.columnDefs[1];
      col = grid.columns[1];
      uiGridCellNavService.cellNavColumnBuilder(colDef, col, grid.options);
      expect(col.allowCellFocus).toBe(false);

      colDef = grid.options.columnDefs[2];
      col = grid.columns[2];
      uiGridCellNavService.cellNavColumnBuilder(colDef, col, grid.options);
      expect(col.allowCellFocus).toBe(true);
    });
  });

  describe('getDirection(evt)', function () {
    it('should navigate right on tab', function () {
      var evt = jQuery.Event("keydown");
      evt.keyCode = uiGridConstants.keymap.TAB;
      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      var direction = uiGridCellNavService.getDirection(evt);
      expect(direction).toBe(uiGridCellNavConstants.direction.RIGHT);
    });

    it('should navigate right on right arrow', function () {
      var evt = jQuery.Event("keydown");
      evt.keyCode = uiGridConstants.keymap.RIGHT;
      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      var direction = uiGridCellNavService.getDirection(evt);
      expect(direction).toBe(uiGridCellNavConstants.direction.RIGHT);
    });

    it('should navigate left on shift tab', function () {
      var evt = jQuery.Event("keydown");
      evt.keyCode = uiGridConstants.keymap.TAB;
      evt.shiftKey = true;
      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      var direction = uiGridCellNavService.getDirection(evt);
      expect(direction).toBe(uiGridCellNavConstants.direction.LEFT);
    });

    it('should navigate left on left arrow', function () {
      var evt = jQuery.Event("keydown");
      evt.keyCode = uiGridConstants.keymap.LEFT;
      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      var direction = uiGridCellNavService.getDirection(evt);
      expect(direction).toBe(uiGridCellNavConstants.direction.LEFT);
    });

    it('should navigate down on enter', function () {
      var evt = jQuery.Event("keydown");
      evt.keyCode = uiGridConstants.keymap.ENTER;
      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      var direction = uiGridCellNavService.getDirection(evt);
      expect(direction).toBe(uiGridCellNavConstants.direction.DOWN);
    });

    it('should navigate down on down arrow', function () {
      var evt = jQuery.Event("keydown");
      evt.keyCode = uiGridConstants.keymap.DOWN;
      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      var direction = uiGridCellNavService.getDirection(evt);
      expect(direction).toBe(uiGridCellNavConstants.direction.DOWN);
    });

    it('should navigate up on shift enter', function () {
      var evt = jQuery.Event("keydown");
      evt.keyCode = uiGridConstants.keymap.ENTER;
      evt.shiftKey = true;
      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      var direction = uiGridCellNavService.getDirection(evt);
      expect(direction).toBe(uiGridCellNavConstants.direction.UP);
    });

    it('should navigate up on up arrow', function () {
      var evt = jQuery.Event("keydown");
      evt.keyCode = uiGridConstants.keymap.UP;
      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      var direction = uiGridCellNavService.getDirection(evt);
      expect(direction).toBe(uiGridCellNavConstants.direction.UP);
    });


  });

  describe('navigate', function () {

    it('should navigate to col left', function () {
      var col = grid.columns[1];
      var row = grid.rows[0];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.LEFT, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col).toBe(grid.columns[0]);
    });

    it('should navigate to up one row and far right column', function () {
      var col = grid.columns[0];
      var row = grid.rows[1];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.LEFT, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col).toBe(grid.columns[2]);
    });

    it('should not navigate', function () {
      var col = grid.columns[0];
      var row = grid.rows[0];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.LEFT, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col).toBe(grid.columns[0]);
    });
  });

});