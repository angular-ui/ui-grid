describe('ui.grid.treeView uiGridTreeViewService', function () {
  var uiGridTreeViewService;
  var uiGridTreeViewConstants;
  var gridClassFactory;
  var grid;
  var $rootScope;
  var $scope;
  var GridRow;

  beforeEach(module('ui.grid.treeView'));

  beforeEach(inject(function (_uiGridTreeViewService_,_gridClassFactory_, $templateCache, _uiGridTreeViewConstants_,
                              _$rootScope_, _GridRow_) {
    uiGridTreeViewService = _uiGridTreeViewService_;
    uiGridTreeViewConstants = _uiGridTreeViewConstants_;
    gridClassFactory = _gridClassFactory_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    GridRow = _GridRow_;

    $templateCache.put('ui-grid/uiGridCell', '<div/>');
    $templateCache.put('ui-grid/editableCell', '<div editable_cell_directive></div>');

    grid = gridClassFactory.createGrid({});
    grid.options.columnDefs = [
      {field: 'col0'},
      {field: 'col1'},
      {field: 'col2'},
      {field: 'col3'}
    ];

    _uiGridTreeViewService_.initializeGrid(grid, $scope);
    var data = [];
    for (var i = 0; i < 10; i++) {
      data.push({col0: 'a_' + Math.floor(i/4), col1: 'b_' + Math.floor(i/2), col2: 'c_' + i, col3: 'd_' + i});
    }
    data[0].$$treeLevel = 0;
    data[1].$$treeLevel = 1;
    data[3].$$treeLevel = 1;
    data[4].$$treeLevel = 2;
    data[7].$$treeLevel = 0;
    data[9].$$treeLevel = 1;

    grid.options.data = data;

    grid.buildColumns();
    grid.modifyRows(grid.options.data);
  }));

  describe( 'treeRows', function() {
    it( 'tree the rows', function() {
      spyOn(gridClassFactory, 'rowTemplateAssigner').andCallFake( function() {});

      var treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 2, 'only the level 0 rows are visible' );
      
      expect( grid.treeView.numberLevels).toEqual(2);
    });

    it( 'expandAll', function() {
      spyOn(gridClassFactory, 'rowTemplateAssigner').andCallFake( function() {});
      
      var expandCount = 0;
      grid.api.treeView.on.rowExpanded( $scope, function(row){
        expandCount++;
      });

      var treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 2, 'only the level 0 rows are visible' );
      
      grid.api.treeView.expandAllRows();
      grid.rows.forEach(function( row ){
        row.visible = true;
      });
      treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 10, 'all rows are visible' );
      expect( expandCount ).toEqual(6);
    });

    it( 'expandRow', function() {
      spyOn(gridClassFactory, 'rowTemplateAssigner').andCallFake( function() {});

      var expandCount = 0;
      grid.api.treeView.on.rowExpanded( $scope, function(row){
        expandCount++;
      });

      var treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 2, 'only the level 0 rows are visible' );
      
      grid.api.treeView.expandRow(grid.rows[0]);
      grid.rows.forEach(function( row ){
        row.visible = true;
      });
      treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 4, 'children of row 0 are also visible' );

      expect( expandCount ).toEqual(1);
    });

    it( 'expandRowChildren', function() {
      spyOn(gridClassFactory, 'rowTemplateAssigner').andCallFake( function() {});

      var expandCount = 0;
      grid.api.treeView.on.rowExpanded( $scope, function(row){
        expandCount++;
      });

      var treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 2, 'only the level 0 rows are visible' );
      
      grid.api.treeView.expandRowChildren(grid.rows[0]);
      grid.rows.forEach(function( row ){
        row.visible = true;
      });
      treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 8, 'all children of row 0 are also visible' );

      expect( expandCount ).toEqual(4, 'called for row 0, 1, 3 and 4');
    });

    it( 'collapseRow', function() {
      spyOn(gridClassFactory, 'rowTemplateAssigner').andCallFake( function() {});

      var collapseCount = 0;
      grid.api.treeView.on.rowCollapsed( $scope, function(row){
        collapseCount++;
      });

      var treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 2, 'only the level 0 rows are visible' );
      
      grid.api.treeView.expandAllRows();
      grid.api.treeView.collapseRow(grid.rows[7]);
      grid.rows.forEach(function( row ){
        row.visible = true;
      });
      treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 8, 'children of row 7 are hidden' );
      expect( collapseCount ).toEqual( 1 );
    });

    it( 'collapseRowChildren', function() {
      spyOn(gridClassFactory, 'rowTemplateAssigner').andCallFake( function() {});

      var collapseCount = 0;
      grid.api.treeView.on.rowCollapsed( $scope, function(row){
        collapseCount++;
      });

      var treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 2, 'only the level 0 rows are visible' );
      
      grid.api.treeView.expandAllRows();
      grid.api.treeView.collapseRowChildren(grid.rows[0]);
      grid.rows.forEach(function( row ){
        row.visible = true;
      });
      treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 4, 'children of row 0 are hidden' );
      expect( collapseCount ).toEqual( 4 );
    });

    it( 'collapseAllRows', function() {
      spyOn(gridClassFactory, 'rowTemplateAssigner').andCallFake( function() {});

      var collapseCount = 0;
      grid.api.treeView.on.rowCollapsed( $scope, function(row){
        collapseCount++;
      });

      var treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 2, 'only the level 0 rows are visible' );
      
      grid.api.treeView.expandAllRows();
      grid.rows.forEach(function( row ){
        row.visible = true;
      });
      treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 10, 'all rows visible' );

      grid.api.treeView.collapseAllRows();
      grid.rows.forEach(function( row ){
        row.visible = true;
      });
      treeRows = uiGridTreeViewService.treeRows.call( grid, grid.rows.slice(0) );
      expect( treeRows.length ).toEqual( 2, 'only level 0 is visible' );
      expect( collapseCount ).toEqual( 6 );
    });
  });

  
  
});