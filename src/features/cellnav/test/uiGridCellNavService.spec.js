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


  describe('scrollTo', function () {
    /*
     * We have 11 rows (10 visible) and 11 columns (10 visible).  The column widths are 
     * 100 for the first 5, and 200 for the second 5.  Column 2 and row 2 are invisible.
     */
    var evt;
    var args;
    var $scope;
    
    beforeEach(function(){
      var i, j, row;
      grid.options.columnDefs = [];
      for ( i = 0; i < 11; i++ ){
        grid.options.columnDefs.push({name: 'col' + i});
      }
  
      grid.options.data = [];
      for ( i = 0; i < 11; i++ ){
        row = {};
        for ( j = 0; j < 11; j++ ){
          row['col' + j] = 'test data ' + i + '_' + j;
        }
        grid.options.data.push( row );
      }
      
      uiGridCellNavService.initializeGrid(grid);
      grid.modifyRows(grid.options.data);      
      
      grid.registerColumnBuilder(uiGridCellNavService.cellNavColumnBuilder);
      grid.buildColumns();
      
      grid.columns[2].visible = false;
      grid.rows[2].visible = false;
      
      grid.setVisibleColumns(grid.columns);
      grid.setVisibleRows(grid.rows);
      
      for ( i = 0; i < 11; i++ ){
        grid.columns[i].drawnWidth = i < 6 ? 100 : 200;
      }
      
      $scope = $rootScope.$new();
      
      evt = null;
      args = null;
      $scope.$on(uiGridConstants.events.GRID_SCROLL, function( receivedEvt, receivedArgs ){
        evt = receivedEvt;
        args = receivedArgs;
      });
      
    });

    it('should request scroll to row and column', function () {
      uiGridCellNavService.scrollTo( grid, $scope, grid.options.data[4], grid.columns[4].colDef);
      
      expect(args).toEqual( { y : { percentage : (3 + 3/9 ) / 10 }, x : { percentage :  (300 + 100 * 4/10)/1500 } });
    });

    it('should request scroll to row only - first row', function () {
      uiGridCellNavService.scrollTo( grid, $scope, grid.options.data[0], null);
      
      expect(args).toEqual( { y : { percentage : 0 } });
    });

    it('should request scroll to row only - last row', function () {
      uiGridCellNavService.scrollTo( grid, $scope, grid.options.data[10], null);
      
      expect(args).toEqual( { y : { percentage : 1 } });
    });

    it('should request scroll to row only - row 4', function () {
      uiGridCellNavService.scrollTo( grid, $scope, grid.options.data[5], null);
      
      expect(args).toEqual( { y : { percentage : ( 4 + 4/9 ) / 10 } });
    });

    it('should request scroll to column only - first column', function () {
      uiGridCellNavService.scrollTo( grid, $scope, null, grid.columns[0].colDef);
      
      expect(args).toEqual( { x : { percentage :  0 } });
    });

    it('should request scroll to column only - last column', function () {
      uiGridCellNavService.scrollTo( grid, $scope, null, grid.columns[10].colDef);
      
      expect(args).toEqual( { x : { percentage :  1 } });
    });

    it('should request scroll to column only - column 7', function () {
      uiGridCellNavService.scrollTo( grid, $scope, null, grid.columns[8].colDef);
      
      expect(args).toEqual( { x : { percentage :  (900 + 200 * 8/10) / 1500 } });
    });

    it('should request no scroll as no row or column', function () {
      uiGridCellNavService.scrollTo( grid, $scope, null, null );
      
      expect(args).toEqual(null);
    });
  });
});