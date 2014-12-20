describe('ui.grid.saveState uiGridSaveStateService', function () {
  var uiGridSaveStateService;
  var uiGridSaveStateConstants;
  var uiGridSelectionService;
  var uiGridCellNavService;
  var gridClassFactory;
  var grid;
  var $compile;
  var $scope;
  var $document;

  beforeEach(module('ui.grid.saveState'));


  beforeEach(inject(function (_uiGridSaveStateService_, _gridClassFactory_, _uiGridSaveStateConstants_,
                              _$compile_, _$rootScope_, _$document_, _uiGridSelectionService_,
                              _uiGridCellNavService_ ) {
    uiGridSaveStateService = _uiGridSaveStateService_;
    uiGridSaveStateConstants = _uiGridSaveStateConstants_;
    uiGridSelectionService = _uiGridSelectionService_;
    uiGridCellNavService = _uiGridCellNavService_;
    gridClassFactory = _gridClassFactory_;
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
    $document = _$document_;

    grid = gridClassFactory.createGrid({});
    grid.options.columnDefs = [
        {field: 'col1', name: 'col1', displayName: 'Col1', width: 50},
        {field: 'col2', name: 'col2', displayName: 'Col2', width: '*', type: 'number'},
        {field: 'col3', name: 'col3', displayName: 'Col3', width: 100},
        {field: 'col4', name: 'col4', displayName: 'Col4', width: 200}
    ];

    _uiGridSaveStateService_.initializeGrid(grid);
    
    var data = [];
    for (var i = 0; i < 4; i++) {
        data.push({col1:'a_'+i, col2:'b_'+i, col3:'c_'+i, col4:'d_'+i});
    }
    grid.options.data = data;

    grid.buildColumns();
    grid.modifyRows(grid.options.data);
    grid.rows[1].visible = false;
    grid.columns[2].visible = false;
    grid.setVisibleRows(grid.rows);
    grid.setVisibleColumns(grid.columns);

    grid.gridWidth = 500;
    grid.columns[0].drawnWidth = 50; 
    grid.columns[1].drawnWidth = '*'; 
    grid.columns[2].drawnWidth = 100; 
    grid.columns[3].drawnWidth = 200;
  }));
  

  describe('defaultGridOptions', function() {
    var options;
    beforeEach(function() {
      options = {};
    });
    
    it('set all options to default', function() {
      uiGridSaveStateService.defaultGridOptions(options);
      expect( options ).toEqual({
        saveWidths: true,
        saveOrder: true,
        saveScroll: false,
        saveFocus: true,
        saveVisible: true,
        saveSort: true,
        saveFilter: true,
        saveSelection: true
      });
    });

    it('set all options to non-default', function() {
      var callback = function() {};
      options = {
        saveWidths: false,
        saveOrder: false,
        saveScroll: true,
        // saveFocus: false,   -- leave undefined, should default based on presence of saveScroll
        saveVisible: false,
        saveSort: false,
        saveFilter: false,
        saveSelection: false
      };
      uiGridSaveStateService.defaultGridOptions(options);
      expect( options ).toEqual({
        saveWidths: false,
        saveOrder: false,
        saveScroll: true,
        saveFocus: false,
        saveVisible: false,
        saveSort: false,
        saveFilter: false,
        saveSelection: false
      });
    });    
  });


  describe('saveColumns', function() {
    it('save columns', function() {
      expect( uiGridSaveStateService.saveColumns( grid ) ).toEqual([
        { name: 'col1', visible: true, width: 50, sort: [], filters: [] },
        { name: 'col2', visible: true, width: '*', sort: [], filters: [] },
        { name: 'col3', visible: false, width: 100, sort: [], filters: [] },
        { name: 'col4', visible: true, width: 200, sort: [], filters: [] }
      ]);
    });
  });
  
  
  describe('saveScrollFocus', function() {
    it('does nothing when no cellNav module initialized', function() {
      expect( uiGridSaveStateService.saveScrollFocus( grid ) ).toEqual( {} );
    });

    it('save focus, no focus present', function() {
      uiGridCellNavService.initializeGrid(grid);
      
      expect( uiGridSaveStateService.saveScrollFocus( grid ) ).toEqual( { focus: true } );
    });

    it('save focus, focus present, no row identity', function() {
      uiGridCellNavService.initializeGrid(grid);
      
      spyOn( grid.api.cellNav, 'getFocusedCell' ).andCallFake( function() {
        return { row: grid.rows[2], col: grid.columns[3] };
      });
      
      expect( uiGridSaveStateService.saveScrollFocus( grid ) ).toEqual( { focus: true, colName: 'col4', rowVal: { identity: false, row: 1 } } );
    });

    it('save focus, focus present, row identity present', function() {
      uiGridCellNavService.initializeGrid(grid);
      
      grid.options.saveRowIdentity = function ( rowEntity ){
        return rowEntity.col1;
      };
      
      spyOn( grid.api.cellNav, 'getFocusedCell' ).andCallFake( function() {
        return { row: grid.rows[2], col: grid.columns[3] };
      });
      
      expect( uiGridSaveStateService.saveScrollFocus( grid ) ).toEqual( { focus: true, colName: 'col4', rowVal: { identity: true, row: 'a_2' } } );
    });
    
    it('save scroll, no prevscroll', function() {
      uiGridCellNavService.initializeGrid(grid);
      grid.options.saveFocus = false;
      grid.options.saveScroll = true;

      grid.renderContainers.body.grid.renderContainers.body.prevColScrollIndex = undefined;
      grid.renderContainers.body.grid.renderContainers.body.prevRowScrollIndex = undefined;
      
      expect( uiGridSaveStateService.saveScrollFocus( grid ) ).toEqual( { focus: false } );
    });
    
    it('save scroll, no row identity', function() {
      uiGridCellNavService.initializeGrid(grid);
      grid.options.saveFocus = false;
      grid.options.saveScroll = true;

      grid.renderContainers.body.grid.renderContainers.body.prevColScrollIndex = 2;
      grid.renderContainers.body.grid.renderContainers.body.prevRowScrollIndex = 2;
      
      expect( uiGridSaveStateService.saveScrollFocus( grid ) ).toEqual( { focus: false, colName: 'col4', rowVal: { identity: false, row: 2 } } );
    });
    
    it('save scroll, row identity present', function() {
      uiGridCellNavService.initializeGrid(grid);
      grid.options.saveFocus = false;
      grid.options.saveScroll = true;
      grid.options.saveRowIdentity = function ( rowEntity ){
        return rowEntity.col1;
      };
      
      grid.renderContainers.body.grid.renderContainers.body.prevColScrollIndex = 2;
      grid.renderContainers.body.grid.renderContainers.body.prevRowScrollIndex = 2;
      
      expect( uiGridSaveStateService.saveScrollFocus( grid ) ).toEqual( { focus: false, colName: 'col4', rowVal: { identity: true, row: 'a_3' } } );
    });
  });


  describe('saveSelection', function() {
    it('does nothing when no selection module initialized', function() {
      expect( uiGridSaveStateService.saveSelection( grid ) ).toEqual( {} );
    });
    
    it('saves no selection, without identity function', function() {
      uiGridSelectionService.initializeGrid(grid);
      
      expect( uiGridSaveStateService.saveSelection( grid ) ).toEqual( [] );
    });

    it('saves no selection, with identity function', function() {
      uiGridSelectionService.initializeGrid(grid);

      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };
      
      expect( uiGridSaveStateService.saveSelection( grid ) ).toEqual( [] );
    });
    
    it('saves selected rows, without identity function', function() {
      uiGridSelectionService.initializeGrid(grid);
      
      grid.api.selection.selectRow(grid.options.data[0]);
      grid.api.selection.selectRow(grid.options.data[3]);  // note that row 1 is not visible, so this will be visible row 2
      
      expect( uiGridSaveStateService.saveSelection( grid ) ).toEqual( [ { identity: false, row: 0 }, { identity: false, row: 2 } ] );
    });

    it('saves selected rows, with identity function', function() {
      uiGridSelectionService.initializeGrid(grid);

      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };

      grid.api.selection.selectRow(grid.options.data[0]);
      grid.api.selection.selectRow(grid.options.data[3]);
      
      expect( uiGridSaveStateService.saveSelection( grid ) ).toEqual( [ { identity: true, row: 'a_0' }, { identity: true, row: 'a_3' } ] );
    });
  });


  describe( 'get rowVal', function() {
    it( 'null gridRow', function() {
      expect( uiGridSaveStateService.getRowVal( grid, null )).toEqual(null);
    });

    it( 'gridRow, not visible', function() {
      expect( uiGridSaveStateService.getRowVal( grid, grid.rows[1] )).toEqual( { identity: false, row: -1 });
    });
    
    it( 'gridRow, visible', function() {
      expect( uiGridSaveStateService.getRowVal( grid, grid.rows[2] )).toEqual( { identity: false, row: 1 });
    });
    
  });


  describe('restoreColumns', function() {
    it('restore columns', function() {
      uiGridSaveStateService.restoreColumns( grid, [
        { name: 'col2', visible: false, width: 90, sort: [ {blah: 'blah'} ], filters: [] },
        { name: 'col1', visible: true, width: '*', sort: [], filters: [ {'blah': 'blah'} ] },
        { name: 'col4', visible: false, width: 120, sort: [], filters: [] },
        { name: 'col3', visible: true, width: 220, sort: [], filters: [] }
      ]);
      
      expect( grid.columns[0].name ).toEqual('col2');
      expect( grid.columns[1].name ).toEqual('col1');
      expect( grid.columns[2].name ).toEqual('col4');
      expect( grid.columns[3].name ).toEqual('col3');

      expect( grid.columns[0].visible ).toEqual(false);
      expect( grid.columns[1].visible ).toEqual(true);
      expect( grid.columns[2].visible ).toEqual(false);
      expect( grid.columns[3].visible ).toEqual(true);

      expect( grid.columns[0].colDef.visible ).toEqual(false);
      expect( grid.columns[1].colDef.visible ).toEqual(true);
      expect( grid.columns[2].colDef.visible ).toEqual(false);
      expect( grid.columns[3].colDef.visible ).toEqual(true);

      expect( grid.columns[0].width ).toEqual(90);
      expect( grid.columns[1].width ).toEqual('*');
      expect( grid.columns[2].width ).toEqual(120);
      expect( grid.columns[3].width ).toEqual(220);

      expect( grid.columns[0].sort ).toEqual([ { blah: 'blah' } ]);
      expect( grid.columns[1].sort ).toEqual([]);
      expect( grid.columns[2].sort ).toEqual([]);
      expect( grid.columns[3].sort ).toEqual([]);

      expect( grid.columns[0].filters ).toEqual([]);
      expect( grid.columns[1].filters ).toEqual([ { blah: 'blah' } ]);
      expect( grid.columns[2].filters ).toEqual([]);
      expect( grid.columns[3].filters ).toEqual([]);
    });
  });
  

  describe('restoreScrollFocus', function() {
    it('does nothing when no cellNav module initialized', function() {
      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: false, colName: 'col4', rowVal: { identity: true, row: 'a_2'} } );
    });

    it('restores no row/col, without identity function', function() {
      uiGridCellNavService.initializeGrid(grid);
      spyOn( grid.api.cellNav, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );
      
      uiGridSaveStateService.restoreScrollFocus( grid, $scope, {} );
      
      expect( grid.api.cellNav.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).not.toHaveBeenCalled();
    });

    it('restores focus row only, without identity function', function() {
      uiGridCellNavService.initializeGrid(grid);
      spyOn( grid.api.cellNav, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );
      
      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: true, rowVal: { identity: false, row: 2 } } );
      
      expect( grid.api.cellNav.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( $scope, grid.rows[3].entity, undefined );
    });

    it('restores focus row only, with identity function', function() {
      uiGridCellNavService.initializeGrid(grid);

      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };
      
      spyOn( grid.api.cellNav, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );
      
      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: true, rowVal: { identity: true, row: 'a_3' } } );
      
      expect( grid.api.cellNav.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( $scope, grid.rows[3].entity, undefined );
    });

    it('restores focus col only, without identity function', function() {
      uiGridCellNavService.initializeGrid(grid);
      spyOn( grid.api.cellNav, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );
      
      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: true, colName: 'col2' } );
      
      expect( grid.api.cellNav.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( $scope, null, grid.options.columnDefs[1] );
    });

    it('restores focus col only, with identity function', function() {
      uiGridCellNavService.initializeGrid(grid);

      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };
      
      spyOn( grid.api.cellNav, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );
      
      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: true, colName: 'col2' } );
      
      expect( grid.api.cellNav.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( $scope, null, grid.options.columnDefs[1] );
    });

    it('restores focus col and row, without identity function', function() {
      uiGridCellNavService.initializeGrid(grid);
      spyOn( grid.api.cellNav, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );
      
      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: true, colName: 'col2', rowVal: { identity: false, row: 2 } } );
      
      expect( grid.api.cellNav.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( $scope, grid.rows[3].entity, grid.options.columnDefs[1] );
    });

    it('restores focus col and row, with identity function', function() {
      uiGridCellNavService.initializeGrid(grid);

      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };
      
      spyOn( grid.api.cellNav, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );
      
      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: true, colName: 'col2', rowVal: { identity: true, row: 'a_3' } } );
      
      expect( grid.api.cellNav.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( $scope, grid.rows[3].entity, grid.options.columnDefs[1] );
    });

  });
    

  describe('restoreSelection', function() {
    it('does nothing when no selection module initialized', function() {
      uiGridSaveStateService.restoreSelection( grid, [ { identity: false, row: 0 } ] );
    });
    
    it('restores no selection, without identity function', function() {
      uiGridSelectionService.initializeGrid(grid);
      
      uiGridSaveStateService.restoreSelection( grid, [] );
      
      expect( grid.api.selection.getSelectedGridRows.length ).toEqual( 0 );
    });

    it('restores no selection, with identity function', function() {
      uiGridSelectionService.initializeGrid(grid);

      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };
      
      uiGridSaveStateService.restoreSelection( grid, [ ] );
      
      expect( grid.api.selection.getSelectedGridRows.length ).toEqual( 0 );
    });
    
    it('restores selected rows, without identity function', function() {
      uiGridSelectionService.initializeGrid(grid);
      
      uiGridSaveStateService.restoreSelection( grid, [ { identity: false, row: 0 }, { identity: false, row: 2 } ] );
      
      expect( grid.api.selection.getSelectedGridRows().length ).toEqual( 2 );

      // row 1 is not visible, so visible row 2 is actually grid row 3
      expect( grid.api.selection.getSelectedGridRows() ).toEqual( [ grid.rows[0], grid.rows[3] ] );
    });

    it('restores selected rows, with identity function', function() {
      uiGridSelectionService.initializeGrid(grid);

      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };

      uiGridSaveStateService.restoreSelection( grid, [ { identity: true, row: 'a_0' }, {identity: true, row: 'a_3' } ] );

      expect( grid.api.selection.getSelectedGridRows().length ).toEqual( 2 );

      expect( grid.api.selection.getSelectedGridRows() ).toEqual( [ grid.rows[0], grid.rows[3] ] );
    });

    it('restores invisible row, without identity function', function() {
      uiGridSelectionService.initializeGrid(grid);
      
      uiGridSaveStateService.restoreSelection( grid, [ { identity: false, row: -1 } ] );
      
      expect( grid.api.selection.getSelectedGridRows().length ).toEqual( 0 );
    });

    it('restores selected rows that aren\'t found, with identity function', function() {
      uiGridSelectionService.initializeGrid(grid);

      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };

      uiGridSaveStateService.restoreSelection( grid, [ { identity: true, row: 'x_0' } ] );

      expect( grid.api.selection.getSelectedGridRows().length ).toEqual( 0 );
    });
  });


  describe('findRowByIdentity', function() {
    it('no row identity', function() {
      expect( uiGridSaveStateService.findRowByIdentity( grid, { identity: true, row: 'a_2' } ) ).toEqual(null);
    });

    it('row found', function() {
      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };
      
      expect( uiGridSaveStateService.findRowByIdentity( grid, { identity: true, row: 'a_2' } ) ).toEqual(grid.rows[2]);
    });

    it('row not found', function() {
      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };
      
      expect( uiGridSaveStateService.findRowByIdentity( grid, { identity: true, row: 'a_9' } ) ).toEqual(null);
    });
  });

  describe( 'string test - save then restore', function() {
    it( 'some of everything', function() {
      uiGridSelectionService.initializeGrid(grid);
      uiGridCellNavService.initializeGrid(grid);

      spyOn( grid.api.cellNav, 'getFocusedCell' ).andCallFake( function() {
        return { row: grid.rows[2], col: grid.columns[3] };
      });

      spyOn( grid.api.cellNav, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );
      
      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };

      grid.api.selection.selectRow(grid.options.data[0]);
      grid.api.selection.selectRow(grid.options.data[3]);
      
      var state = grid.api.saveState.save();
      
      grid.api.selection.clearSelectedRows();
      grid.api.selection.selectRow(grid.options.data[2]);
      
      grid.api.saveState.restore( $scope, state );
      
      expect( grid.api.selection.getSelectedGridRows() ).toEqual( [ grid.rows[0], grid.rows[3] ] );
      expect( grid.api.cellNav.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( $scope, grid.rows[2].entity, grid.options.columnDefs[3] );
    });
  }); 
});