describe('ui.grid.edit uiGridCellNavService', function () {
  var UiGridCellNav;
  var uiGridCellNavService;
  var gridClassFactory;
  var grid;
  var uiGridConstants;
  var uiGridCellNavConstants;
  var $rootScope;
  var $timeout;
  var colDef0,colDef1,colDef2;

  beforeEach(module('ui.grid.cellNav'));

  beforeEach(inject(function (_uiGridCellNavFactory_, _uiGridCellNavService_, _gridClassFactory_, $templateCache, _uiGridConstants_, _uiGridCellNavConstants_, _$rootScope_, _$timeout_) {
    UiGridCellNav = _uiGridCellNavFactory_;
    uiGridCellNavService = _uiGridCellNavService_;
    gridClassFactory = _gridClassFactory_;
    uiGridConstants = _uiGridConstants_;
    uiGridCellNavConstants = _uiGridCellNavConstants_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;

    $templateCache.put('ui-grid/uiGridCell', '<div/>');

    colDef0 = {name: 'col0', allowCellFocus: true};
    colDef1 = {name: 'col1', allowCellFocus: false};
    colDef2 = {name: 'col2'};

    var options = {columnDefs: [
      colDef0,
      colDef1,
      colDef2
    ]};

    options.data = [
      {col0: 'row0col0', col1: 'row0col1', col2: 'row0col2'},
      {col0: 'row1col0', col1: 'row1col1', col2: 'row1col2'},
      {col0: 'row2col0', col1: 'row2col1', col2: 'row2col2'}
    ];

    grid = gridClassFactory.createGrid(options);

    uiGridCellNavService.initializeGrid(grid);
    grid.modifyRows(grid.options.data);
    $timeout(function () {
      grid.buildColumns().then(function () {
        grid.setVisibleColumns(grid.columns);
      });
    });
    $timeout.flush();

  }));

  describe('navigate Left', function () {
    beforeEach(function () {
    });

    it('should navigate to col left from unfocusable column', function () {
      var row = grid.rows[0];
      var col = grid.columns[1];

      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.LEFT, row, col);

      expect(rowCol.row).toBe(row);
      expect(rowCol.col.name).toBe(colDef0.name);
    });

    it('should navigate up one row and far right column', function () {
      var col = grid.columns[0];
      var row = grid.rows[1];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.LEFT, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.name).toBe(colDef2.name);
    });

    it('should stay on same row and go to far right', function () {
      var col = grid.columns[0];
      var row = grid.rows[0];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.LEFT, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });


    it('should skip col that is not focusable', function () {
      var col = grid.columns[2];
      var row = grid.rows[0];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.LEFT, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[0].colDef.name);
    });

    it('should skip row that is not focusable', function () {
      var col = grid.columns[2];
      var row = grid.rows[0];
      grid.rows[1].allowCellFocus = false;
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.DOWN, row, col);
      expect(rowCol.row).toBe(grid.rows[2]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });
  });


  describe('navigate right', function () {
    beforeEach(function () {

    });
    it('should navigate to col right from unfocusable column', function () {
      var col = grid.columns[1];
      var row = grid.rows[0];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.RIGHT, row, col);

      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

    it('should navigate down one row and far left column', function () {
      var col = grid.columns[2];
      var row = grid.rows[0];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.RIGHT, row, col);
      expect(rowCol.row).toBe(grid.rows[1]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[0].colDef.name);
    });

    it('should stay on same row and go to far left', function () {
      var col = grid.columns[2];
      var row = grid.rows[2];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.RIGHT, row, col);

      expect(rowCol.row).toBe(grid.rows[2]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[0].colDef.name);
    });

    it('should skip col that is not focusable', function () {
      var col = grid.columns[0];
      var row = grid.rows[0];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.RIGHT, row, col);

      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });
  });

  describe('navigate down', function () {
    beforeEach(function () {
      grid.registerColumnBuilder(uiGridCellNavService.cellNavColumnBuilder);
      grid.buildColumns();
    });
    it('should navigate to col 0 from unfocusable column', function () {
      var col = grid.columns[1];
      var row = grid.rows[0];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.DOWN, row, col);
      expect(rowCol.row).toBe(grid.rows[1]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[0].colDef.name);
    });

    it('should navigate down one row and same column', function () {
      var col = grid.columns[2];
      var row = grid.rows[0];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.DOWN, row, col);
      expect(rowCol.row).toBe(grid.rows[1]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

    it('should stay on same row and same column', function () {
      var col = grid.columns[2];
      var row = grid.rows[2];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.DOWN, row, col);
      expect(rowCol.row).toBe(grid.rows[2]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

  });

  describe('navigate up', function () {
    beforeEach(function () {
      grid.registerColumnBuilder(uiGridCellNavService.cellNavColumnBuilder);
      grid.buildColumns();
    });
    it('should navigate to first col from unfocusable column', function () {
      var col = grid.columns[1];
      var row = grid.rows[2];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.UP, row, col);
      expect(rowCol.row).toBe(grid.rows[1]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[0].colDef.name);
    });

    it('should navigate up one row and same column', function () {
      var col = grid.columns[2];
      var row = grid.rows[2];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.UP, row, col);
      expect(rowCol.row).toBe(grid.rows[1]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

    it('should stay on same row and same column', function () {
      var col = grid.columns[2];
      var row = grid.rows[0];
      var cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, null, null);
      var rowCol = cellNav.getNextRowCol(uiGridCellNavConstants.direction.UP, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

  });

});