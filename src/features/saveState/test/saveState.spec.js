describe('ui.grid.saveState uiGridSaveStateService', function () {
  var uiGridSaveStateService;
  var uiGridSaveStateConstants;
  var uiGridSelectionService;
  var uiGridCellNavService;
  var uiGridGroupingService;
  var uiGridTreeViewService;
  var uiGridPinningService;
  var gridClassFactory;
  var grid;
  var $compile;
  var $scope;
  var $document;
  var $timeout;

  beforeEach(module('ui.grid.saveState'));


  beforeEach(inject(function (_uiGridSaveStateService_, _gridClassFactory_, _uiGridSaveStateConstants_,
                              _$compile_, _$rootScope_, _$document_, _uiGridSelectionService_,
                              _uiGridCellNavService_, _uiGridGroupingService_, _uiGridTreeViewService_,
                              _uiGridPinningService_, _$timeout_) {
    uiGridSaveStateService = _uiGridSaveStateService_;
    uiGridSaveStateConstants = _uiGridSaveStateConstants_;
    uiGridSelectionService = _uiGridSelectionService_;
    uiGridCellNavService = _uiGridCellNavService_;
    uiGridGroupingService = _uiGridGroupingService_;
    uiGridTreeViewService = _uiGridTreeViewService_;
    uiGridPinningService = _uiGridPinningService_;
    gridClassFactory = _gridClassFactory_;
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
    $document = _$document_;
    $timeout = _$timeout_;

    grid = gridClassFactory.createGrid({});
    grid.options.columnDefs = [
        {field: 'col1', name: 'col1', displayName: 'Col1', width: 50, pinnedLeft:true },
        {field: 'col2', name: 'col2', displayName: 'Col2', width: '*', type: 'number'},
        {field: 'col3', name: 'col3', displayName: 'Col3', width: 100},
        {field: 'col4', name: 'col4', displayName: 'Col4', width: 200, pinnedRight:true }
    ];

    _uiGridSaveStateService_.initializeGrid(grid);

    var data = [];
    for (var i = 0; i < 4; i++) {
        data.push({col1:'a_'+i, col2:'b_'+i, col3:'c_'+i, col4:'d_'+i});
    }
    grid.options.data = data;

    $timeout(function () {
      grid.addRowHeaderColumn({name: 'header'});
    });
    $timeout.flush();
    expect(grid.columns.length).toBe(5);



    grid.modifyRows(grid.options.data);
    grid.rows[1].visible = false;
    grid.getOnlyDataColumns()[2].visible = false;
    grid.setVisibleRows(grid.rows);
    grid.setVisibleColumns(grid.columns);

    grid.gridWidth = 500;
    grid.getOnlyDataColumns()[0].drawnWidth = 50;
    grid.getOnlyDataColumns()[1].drawnWidth = '*';
    grid.getOnlyDataColumns()[2].drawnWidth = 100;
    grid.getOnlyDataColumns()[3].drawnWidth = 200;
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
        saveSelection: true,
        saveGrouping: true,
        saveGroupingExpandedStates: false,
        saveTreeView: true,
        savePinning: true
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
        saveSelection: false,
        saveGrouping: false,
        saveGroupingExpandedStates: true,
        saveTreeView: false,
        savePinning: false
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
        saveSelection: false,
        saveGrouping: false,
        saveGroupingExpandedStates: true,
        saveTreeView: false,
        savePinning: false
      });
    });
  });


  describe('saveColumns', function() {
    it('save columns', function() {
      expect( uiGridSaveStateService.saveColumns( grid ) ).toEqual([
        { name: 'col1', visible: true, width: 50, sort: [], filters: [ {} ] },
        { name: 'col2', visible: true, width: '*', sort: [], filters: [ {} ] },
        { name: 'col3', visible: false, width: 100, sort: [], filters: [ {} ] },
        { name: 'col4', visible: true, width: 200, sort: [], filters: [ {} ] }
      ]);
    });

    it('save columns with most options turned off', function() {
      grid.options.saveWidths = false;
      grid.options.saveVisible = false;
      grid.options.saveSort = false;
      grid.options.saveFilter = false;

      expect( uiGridSaveStateService.saveColumns( grid ) ).toEqual([
        { name: 'col1' },
        { name: 'col2' },
        { name: 'col3' },
        { name: 'col4' }
      ]);
    });

    describe('pinning enabled', function() {

      beforeEach(function(){
        uiGridPinningService.initializeGrid(grid);
        grid.buildColumns();
        grid.getOnlyDataColumns()[2].visible = false;
        grid.setVisibleColumns(grid.columns);
      });

      it('save columns', function() {
        expect( uiGridSaveStateService.saveColumns( grid ) ).toEqual([
          { name: 'col1', visible: true, width: 50, sort: [], filters: [ {} ], pinned: 'left' },
          { name: 'col2', visible: true, width: '*', sort: [], filters: [ {} ], pinned: '' },
          { name: 'col3', visible: false, width: 100, sort: [], filters: [ {} ], pinned: '' },
          { name: 'col4', visible: true, width: 200, sort: [], filters: [ {} ], pinned: 'right' }
        ]);
      });

      it('save columns with most options turned off', function() {
        grid.options.saveWidths = false;
        grid.options.saveVisible = false;
        grid.options.saveSort = false;
        grid.options.saveFilter = false;
        grid.options.savePinning = false;

        expect( uiGridSaveStateService.saveColumns( grid ) ).toEqual([
          { name: 'col1' },
          { name: 'col2' },
          { name: 'col3' },
          { name: 'col4' }
        ]);
      });
    });
  });


  describe('saveScrollFocus', function() {
    it('does nothing when no cellNav module initialized', function() {
      expect( uiGridSaveStateService.saveScrollFocus( grid ) ).toEqual( {} );
    });

    it('save focus, no focus present, tries to save scroll instead', function() {
      uiGridCellNavService.initializeGrid(grid);

      expect( uiGridSaveStateService.saveScrollFocus( grid ) ).toEqual( { focus: false } );
    });

    it('save focus, focus present, no row identity', function() {
      uiGridCellNavService.initializeGrid(grid);

      spyOn( grid.api.cellNav, 'getFocusedCell' ).andCallFake( function() {
        return { row: grid.rows[2], col: grid.getOnlyDataColumns()[3] };
      });

      expect( uiGridSaveStateService.saveScrollFocus( grid ) ).toEqual( { focus: true, colName: 'col4', rowVal: { identity: false, row: 1 } } );
    });

    it('save focus, focus present, no col', function() {
      uiGridCellNavService.initializeGrid(grid);

      spyOn( grid.api.cellNav, 'getFocusedCell' ).andCallFake( function() {
        return { row: grid.rows[2], col: null };
      });

      expect( uiGridSaveStateService.saveScrollFocus( grid ) ).toEqual( { focus: true, rowVal: { identity: false, row: 1 } } );
    });

    it('save focus, focus present, no row', function() {
      uiGridCellNavService.initializeGrid(grid);

      spyOn( grid.api.cellNav, 'getFocusedCell' ).andCallFake( function() {
        return { row: null, col: grid.getOnlyDataColumns()[3] };
      });

      expect( uiGridSaveStateService.saveScrollFocus( grid ) ).toEqual( { focus: true, colName: 'col4' } );
    });

    it('save focus, focus present, row identity present', function() {
      uiGridCellNavService.initializeGrid(grid);

      grid.options.saveRowIdentity = function ( rowEntity ){
        return rowEntity.col1;
      };

      spyOn( grid.api.cellNav, 'getFocusedCell' ).andCallFake( function() {
        return { row: grid.rows[2], col: grid.getOnlyDataColumns()[3] };
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
    it('restore columns, all options turned on', function() {
      grid.options.saveWidths = true;
      grid.options.saveOrder = true;
      grid.options.saveVisible = true;
      grid.options.saveSort = true;
      grid.options.saveFilter = true;

      var colVisChangeCount = 0;
      var colFilterChangeCount = 0;
      var colSortChangeCount = 0;
      var onSortChangedHook = jasmine.createSpy('onSortChangedHook');

      grid.api.core.on.columnVisibilityChanged( $scope, function( column ) {
        colVisChangeCount++;
      });

      grid.api.core.on.filterChanged( $scope, function() {
        colFilterChangeCount++;
      });

      grid.api.core.on.sortChanged( $scope, onSortChangedHook );

      uiGridSaveStateService.restoreColumns( grid, [
        { name: 'col2', visible: false, width: 90, sort: [ {blah: 'blah'} ], filters: [ {} ] },
        { name: 'col1', visible: true, width: '*', sort: [], filters: [ {'blah': 'blah'} ] },
        { name: 'col4', visible: false, width: 120, sort: { direction: 'asc', priority: 1 }, filters: [ {} ] },
        { name: 'col3', visible: true, width: 220, sort: { direction: 'asc', priority: 0 }, filters: [ {} ] }
      ]);

      expect( grid.getOnlyDataColumns()[0].name ).toEqual('col2', 'column 0 name should be col2');
      expect( grid.getOnlyDataColumns()[1].name ).toEqual('col1', 'column 1 name should be col1');
      expect( grid.getOnlyDataColumns()[2].name ).toEqual('col4', 'column 2 name should be col4');
      expect( grid.getOnlyDataColumns()[3].name ).toEqual('col3', 'column 3 name should be col3');

      expect( grid.getOnlyDataColumns()[0].visible ).toEqual(false, 'column 0 visible should be false');
      expect( grid.getOnlyDataColumns()[1].visible ).toEqual(true, 'column 1 visible should be true');
      expect( grid.getOnlyDataColumns()[2].visible ).toEqual(false, 'column 2 visible should be false');
      expect( grid.getOnlyDataColumns()[3].visible ).toEqual(true, 'column 3 visible should be true');

      expect( grid.getOnlyDataColumns()[0].colDef.visible ).toEqual(false, 'coldef 0 visible should be false');
      expect( grid.getOnlyDataColumns()[1].colDef.visible ).toEqual(true, 'coldef 1 visible should be true');
      expect( grid.getOnlyDataColumns()[2].colDef.visible ).toEqual(false, 'coldef 2 visible should be false');
      expect( grid.getOnlyDataColumns()[3].colDef.visible ).toEqual(true, 'coldef 3 visible should be true');

      expect( grid.getOnlyDataColumns()[0].width ).toEqual(90);
      expect( grid.getOnlyDataColumns()[1].width ).toEqual('*');
      expect( grid.getOnlyDataColumns()[2].width ).toEqual(120);
      expect( grid.getOnlyDataColumns()[3].width ).toEqual(220);

      expect( grid.getOnlyDataColumns()[0].sort ).toEqual([ { blah: 'blah' } ]);
      expect( grid.getOnlyDataColumns()[1].sort ).toEqual([]);
      expect( grid.getOnlyDataColumns()[2].sort ).toEqual({ direction: 'asc', priority: 1 });
      expect( grid.getOnlyDataColumns()[3].sort ).toEqual({ direction: 'asc', priority: 0 });

      expect( grid.getOnlyDataColumns()[0].filters ).toEqual([ {} ]);
      expect( grid.getOnlyDataColumns()[1].filters ).toEqual([ { blah: 'blah' } ]);
      expect( grid.getOnlyDataColumns()[2].filters ).toEqual([ {} ]);
      expect( grid.getOnlyDataColumns()[3].filters ).toEqual([ {} ]);

      expect( colVisChangeCount ).toEqual( 4, '4 columns changed visibility');
      expect( colFilterChangeCount ).toEqual( 1, '1 columns changed filter');

      expect( onSortChangedHook.calls.length ).toEqual( 1 );

      expect( onSortChangedHook ).toHaveBeenCalledWith( 
        grid, 
        [ grid.getOnlyDataColumns()[3], grid.getOnlyDataColumns()[2] ] 
      );
    });

    it('restore columns, all options turned off', function() {
      grid.options.saveWidths = false;
      grid.options.saveOrder = false;
      grid.options.saveVisible = false;
      grid.options.saveSort = false;
      grid.options.saveFilter = false;

      var colVisChangeCount = 0;
      var colFilterChangeCount = 0;
      var colSortChangeCount = 0;

      grid.api.core.on.columnVisibilityChanged( $scope, function( column ) {
        colVisChangeCount++;
      });

      grid.api.core.on.filterChanged( $scope, function() {
        colFilterChangeCount++;
      });

      grid.api.core.on.sortChanged( $scope, function() {
        colSortChangeCount++;
      });

      uiGridSaveStateService.restoreColumns( grid, [
        { name: 'col2', visible: false, width: 90, sort: [ {blah: 'blah'} ], filters: [ {} ] },
        { name: 'col1', visible: true, width: '*', sort: [], filters: [ {'blah': 'blah'} ] },
        { name: 'col4', visible: false, width: 120, sort: [], filters: [ {} ] },
        { name: 'col3', visible: true, width: 220, sort: [], filters: [ {} ] }
      ]);

      expect( grid.getOnlyDataColumns()[0].name ).toEqual('col1', 'column 0 name should be col1');
      expect( grid.getOnlyDataColumns()[1].name ).toEqual('col2', 'column 1 name should be col2');
      expect( grid.getOnlyDataColumns()[2].name ).toEqual('col3', 'column 2 name should be col3');
      expect( grid.getOnlyDataColumns()[3].name ).toEqual('col4', 'column 3 name should be col4');

      expect( grid.getOnlyDataColumns()[0].visible ).toEqual(true, 'column 0 visible should be true');
      expect( grid.getOnlyDataColumns()[1].visible ).toEqual(true, 'column 1 visible should be true');
      expect( grid.getOnlyDataColumns()[2].visible ).toEqual(false, 'column 2 visible should be false');
      expect( grid.getOnlyDataColumns()[3].visible ).toEqual(true, 'column 3 visible should be true');

      expect( grid.getOnlyDataColumns()[0].colDef.visible ).toEqual(undefined, 'coldef 0 visible should be undefined');
      expect( grid.getOnlyDataColumns()[1].colDef.visible ).toEqual(undefined, 'coldef 1 visible should be undefined');
      expect( grid.getOnlyDataColumns()[2].colDef.visible ).toEqual(undefined, 'coldef 2 visible should be undefined');
      expect( grid.getOnlyDataColumns()[3].colDef.visible ).toEqual(undefined, 'coldef 3 visible should be undefined');

      expect( grid.getOnlyDataColumns()[0].width ).toEqual(50);
      expect( grid.getOnlyDataColumns()[1].width ).toEqual('*');
      expect( grid.getOnlyDataColumns()[2].width ).toEqual(100);
      expect( grid.getOnlyDataColumns()[3].width ).toEqual(200);

      expect( grid.getOnlyDataColumns()[0].sort ).toEqual([]);
      expect( grid.getOnlyDataColumns()[1].sort ).toEqual([]);
      expect( grid.getOnlyDataColumns()[2].sort ).toEqual([]);
      expect( grid.getOnlyDataColumns()[3].sort ).toEqual([]);

      expect( grid.getOnlyDataColumns()[0].filters ).toEqual([ {} ]);
      expect( grid.getOnlyDataColumns()[1].filters ).toEqual([ {} ]);
      expect( grid.getOnlyDataColumns()[2].filters ).toEqual([ {} ]);
      expect( grid.getOnlyDataColumns()[3].filters ).toEqual([ {} ]);

      expect( colVisChangeCount ).toEqual( 0, '0 columns changed visibility');
      expect( colFilterChangeCount ).toEqual( 0, '0 columns changed filter');
      expect( colSortChangeCount ).toEqual( 0, '0 columns changed sort');
    });
  });


  describe('restoreScrollFocus', function() {
    it('does nothing when no cellNav module initialized', function() {
      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: false, colName: 'col4', rowVal: { identity: true, row: 'a_2'} } );
    });

    it('restores no row/col, without identity function', function() {
      uiGridCellNavService.initializeGrid(grid);
      spyOn( grid.api.core, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );

      uiGridSaveStateService.restoreScrollFocus( grid, $scope, {} );

      expect( grid.api.core.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).not.toHaveBeenCalled();
    });

    it('restores focus row only, without identity function', function() {
      uiGridCellNavService.initializeGrid(grid);
      spyOn( grid.api.core, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );

      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: true, rowVal: { identity: false, row: 2 } } );

      expect( grid.api.core.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( grid.rows[3].entity, undefined );
    });

    it('restores focus row only, with identity function', function() {
      uiGridCellNavService.initializeGrid(grid);

      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };

      spyOn( grid.api.core, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );

      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: true, rowVal: { identity: true, row: 'a_3' } } );

      expect( grid.api.core.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( grid.rows[3].entity, undefined );
    });

    it('restores focus col only, without identity function', function() {
      uiGridCellNavService.initializeGrid(grid);
      spyOn( grid.api.core, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );

      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: true, colName: 'col2' } );

      expect( grid.api.core.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( null, grid.options.columnDefs[1] );
    });

    it('restores focus col only, with identity function', function() {
      uiGridCellNavService.initializeGrid(grid);

      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };

      spyOn( grid.api.core, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );

      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: true, colName: 'col2' } );

      expect( grid.api.core.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( null, grid.options.columnDefs[1] );
    });

    it('restores focus col and row, without identity function', function() {
      uiGridCellNavService.initializeGrid(grid);
      spyOn( grid.api.core, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );

      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: true, colName: 'col2', rowVal: { identity: false, row: 2 } } );

      expect( grid.api.core.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( grid.rows[3].entity, grid.options.columnDefs[1] );
    });

    it('restores focus col and row, with identity function', function() {
      uiGridCellNavService.initializeGrid(grid);

      grid.options.saveRowIdentity = function( rowEntity ){
        return rowEntity.col1;
      };

      spyOn( grid.api.core, 'scrollTo' );
      spyOn( grid.api.cellNav, 'scrollToFocus' );

      uiGridSaveStateService.restoreScrollFocus( grid, $scope, { focus: true, colName: 'col2', rowVal: { identity: true, row: 'a_3' } } );

      expect( grid.api.core.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( grid.rows[3].entity, grid.options.columnDefs[1] );
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

  describe('restoreGrouping', function() {
    beforeEach( function() {
      grid.api.grouping = { setGrouping: function() {}};
      spyOn( grid.api.grouping, 'setGrouping' ).andCallFake(function() {});
    });

    it( 'calls setGrouping with config', function() {
      uiGridSaveStateService.restoreGrouping( grid, { grouping: [], aggregations: [] });

      expect(grid.api.grouping.setGrouping).toHaveBeenCalledWith( { grouping: [], aggregations: [] });
    });

    it( 'doesn\'t call setGrouping when config missing', function() {
      uiGridSaveStateService.restoreGrouping( grid, undefined);

      expect(grid.api.grouping.setGrouping).not.toHaveBeenCalled();
    });
  });

  describe('restoreTreeView', function() {
    beforeEach( function() {
      grid.api.treeView = { setTreeView: function() {}};
      spyOn( grid.api.treeView, 'setTreeView' ).andCallFake(function() {});
    });

    it( 'calls setTreeView with config', function() {
      uiGridSaveStateService.restoreTreeView( grid, { test: 'test' });

      expect(grid.api.treeView.setTreeView).toHaveBeenCalledWith( { test: 'test' });
    });

    it( 'doesn\'t call setTreeView when config missing', function() {
      uiGridSaveStateService.restoreTreeView( grid, undefined);

      expect(grid.api.treeView.setTreeView).not.toHaveBeenCalled();
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
        return { row: grid.rows[2], col: grid.getOnlyDataColumns()[3] };
      });

      spyOn( grid.api.core, 'scrollTo' );
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
      expect( grid.api.core.scrollTo ).not.toHaveBeenCalled();
      expect( grid.api.cellNav.scrollToFocus ).toHaveBeenCalledWith( grid.rows[2].entity, grid.options.columnDefs[3] );
    });
  });
});
