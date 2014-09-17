describe('ui.grid.edit uiGridCellNavService', function () {
  var uiGridCellNavService;
  var gridClassFactory;
  var grid;
  var uiGridConstants;
  var uiGridCellNavConstants;
  var $rootScope;

  beforeEach(module('ui.grid.cellNav'));

  beforeEach(inject(function (_uiGridCellNavService_, _gridClassFactory_, $templateCache, _uiGridConstants_, _uiGridCellNavConstants_, _$rootScope_) {
    uiGridCellNavService = _uiGridCellNavService_;
    gridClassFactory = _gridClassFactory_;
    uiGridConstants = _uiGridConstants_;
    uiGridCellNavConstants = _uiGridCellNavConstants_;
    $rootScope = _$rootScope_;

    $templateCache.put('ui-grid/uiGridCell', '<div/>');

    grid = gridClassFactory.createGrid();
    grid.options.columnDefs = [
      {name: 'col0', allowCellFocus: true},
      {name: 'col1', allowCellFocus: false},
      {name: 'col2'}
    ];

    grid.options.data = [
      {col0: 'row0col0', col1: 'row0col1', col2: 'row0col2'},
      {col0: 'row1col0', col1: 'row1col1', col2: 'row1col2'},
      {col0: 'row2col0', col1: 'row2col1', col2: 'row2col2'}
    ];

    uiGridCellNavService.initializeGrid(grid);
    grid.modifyRows(grid.options.data);
  }));


  describe('public Apis function', function () {
    beforeEach(function(){
      grid.buildColumns();
    });

    it('should have getFocusedCell', function () {
      expect(grid.api.cellNav.getFocusedCell()).toBeDefined();
      expect(grid.api.cellNav.getFocusedCell()).toBe(null);
      grid.cellNav.lastRowCol = 'mockRowCol';
      expect(grid.api.cellNav.getFocusedCell()).toBe('mockRowCol');
    });

  });


  describe('cellNavColumnBuilder function', function () {
    beforeEach(function(){
      grid.buildColumns();
    });

    it('should populate allowCellFocus with defaults', function () {
      var colDef = grid.options.columnDefs[0];
      var col = grid.columns[0];
      uiGridCellNavService.cellNavColumnBuilder(colDef, col, grid.options);
      expect(col.colDef.allowCellFocus).toBe(true);

      colDef = grid.options.columnDefs[1];
      col = grid.columns[1];
      uiGridCellNavService.cellNavColumnBuilder(colDef, col, grid.options);
      expect(col.colDef.allowCellFocus).toBe(false);

      colDef = grid.options.columnDefs[2];
      col = grid.columns[2];
      uiGridCellNavService.cellNavColumnBuilder(colDef, col, grid.options);
      expect(col.colDef.allowCellFocus).toBe(true);
    });
  });

  describe('getDirection(evt)', function () {
    beforeEach(function(){
      grid.registerColumnBuilder(uiGridCellNavService.cellNavColumnBuilder);
      grid.buildColumns();
    });
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

  describe('navigate left', function () {
    beforeEach(function(){
      grid.registerColumnBuilder(uiGridCellNavService.cellNavColumnBuilder);
      grid.buildColumns();
    });
    it('should navigate to col left from unfocusable column', function () {
      var col = grid.columns[1];
      var row = grid.rows[0];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.LEFT, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[0].colDef.name);
    });

    it('should navigate up one row and far right column', function () {
      var col = grid.columns[0];
      var row = grid.rows[1];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.LEFT, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

    it('should stay on same row and go to far right', function () {
      var col = grid.columns[0];
      var row = grid.rows[0];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.LEFT, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

    it('should skip col that is not focusable', function () {
      var col = grid.columns[2];
      var row = grid.rows[0];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.LEFT, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[0].colDef.name);
    });
  });

  describe('navigate right', function () {
    beforeEach(function(){
      grid.registerColumnBuilder(uiGridCellNavService.cellNavColumnBuilder);
      grid.buildColumns();
    });
    it('should navigate to col right from unfocusable column', function () {
      var col = grid.columns[1];
      var row = grid.rows[0];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.RIGHT, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

    it('should navigate down one row and far left column', function () {
      var col = grid.columns[2];
      var row = grid.rows[0];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.RIGHT, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[1]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[0].colDef.name);
    });

    it('should stay on same row and go to far left', function () {
      var col = grid.columns[2];
      var row = grid.rows[2];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.RIGHT, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[2]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[0].colDef.name);
    });

    it('should skip col that is not focusable', function () {
      var col = grid.columns[0];
      var row = grid.rows[0];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.RIGHT, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });
  });

  describe('navigate down', function () {
    beforeEach(function(){
      grid.registerColumnBuilder(uiGridCellNavService.cellNavColumnBuilder);
      grid.buildColumns();
    });
    it('should navigate to col right from unfocusable column', function () {
      var col = grid.columns[1];
      var row = grid.rows[0];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.DOWN, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[1]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

    it('should navigate down one row and same column', function () {
      var col = grid.columns[2];
      var row = grid.rows[0];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.DOWN, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[1]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

    it('should stay on same row and same column', function () {
      var col = grid.columns[2];
      var row = grid.rows[2];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.DOWN, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[2]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

  });

  describe('navigate up', function () {
    beforeEach(function(){
      grid.registerColumnBuilder(uiGridCellNavService.cellNavColumnBuilder);
      grid.buildColumns();
    });
    it('should navigate to col right from unfocusable column', function () {
      var col = grid.columns[1];
      var row = grid.rows[2];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.UP, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[1]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

    it('should navigate up one row and same column', function () {
      var col = grid.columns[2];
      var row = grid.rows[2];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.UP, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[1]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

    it('should stay on same row and same column', function () {
      var col = grid.columns[2];
      var row = grid.rows[0];
      var rowCol = uiGridCellNavService.getNextRowCol(uiGridCellNavConstants.direction.UP, grid, row, col);
      expect(rowCol.row).toBe(grid.rows[0]);
      expect(rowCol.col.colDef.name).toBe(grid.columns[2].colDef.name);
    });

  });

  describe('scrollTo', function () {
    var evt;
    var args;
    var $scope;
    
    beforeEach(function(){
      grid.registerColumnBuilder(uiGridCellNavService.cellNavColumnBuilder);
      grid.buildColumns();
      grid.setVisibleColumns(grid.columns);
      grid.setVisibleRows(grid.rows);
      $scope = $rootScope.$new();
      
      evt = null;
      args = null;
      $scope.$on(uiGridConstants.events.GRID_SCROLL, function( receivedEvt, receivedArgs ){
        evt = receivedEvt;
        args = receivedArgs;
      });
      grid.columns[0].drawnWidth = 100;
      grid.columns[1].drawnWidth = 200;
      grid.columns[2].drawnWidth = 300;
    });

    it('should request scroll to row and column', function () {
      uiGridCellNavService.scrollTo( grid, $scope, grid.options.data[2], grid.columns[1].colDef);
      
      expect(args).toEqual( { y : { percentage : 2/3 }, x : { percentage :  300/600 } });
    });

    it('should request scroll to row only', function () {
      uiGridCellNavService.scrollTo( grid, $scope, grid.options.data[2], null);
      
      expect(args).toEqual( { y : { percentage : 2/3 } });
    });

    it('should request scroll to column only', function () {
      uiGridCellNavService.scrollTo( grid, $scope, null, grid.columns[1].colDef);
      
      expect(args).toEqual( { x : { percentage :  300/600 } });
    });

    it('should request no scroll as no row or column', function () {
      uiGridCellNavService.scrollTo( grid, $scope, null, null );
      
      expect(args).toEqual(null);
    });
  });
});