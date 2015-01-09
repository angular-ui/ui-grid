describe('ui.grid.selection uiGridSelectionService', function () {
  var uiGridSelectionService;
  var gridClassFactory;
  var grid;
  var $rootScope;
  var $scope;

  beforeEach(module('ui.grid.selection'));

  beforeEach(inject(function (_uiGridSelectionService_,_gridClassFactory_, $templateCache, _uiGridSelectionConstants_,
                              _$rootScope_) {
    uiGridSelectionService = _uiGridSelectionService_;
    gridClassFactory = _gridClassFactory_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    $templateCache.put('ui-grid/uiGridCell', '<div/>');
    $templateCache.put('ui-grid/editableCell', '<div editable_cell_directive></div>');

    grid = gridClassFactory.createGrid({showGridFooter:true});
    grid.options.columnDefs = [
      {field: 'col1', enableCellEdit: true}
    ];

    _uiGridSelectionService_.initializeGrid(grid);
    var data = [];
    for (var i = 0; i < 10; i++) {
      data.push({col1:'a_' + i});
    }
    grid.options.data = data;

    grid.buildColumns();
    grid.modifyRows(grid.options.data);
  }));


  describe('toggleSelection function', function () {
    it('should toggle selected with multiselect', function () {
      uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true);
      expect(grid.rows[0].isSelected).toBe(true);

      uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true);
      expect(grid.rows[0].isSelected).toBe(false);
    });

    it('should toggle selected without multiselect', function () {
      uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, false);
      expect(grid.rows[0].isSelected).toBe(true);

      uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, false);
      expect(grid.rows[0].isSelected).toBe(false);
      expect(grid.rows[1].isSelected).toBe(true);
    });

    it('should not toggle selected with enableSelection: false', function () {
      grid.rows[0].enableSelection = false;
      uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true);
      expect(grid.rows[0].isSelected).toBe(undefined);
    });

    it('should toggle selected with noUnselect', function () {
      uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, false, true);
      expect(grid.rows[0].isSelected).toBe(true, 'row should be selected, noUnselect doesn\'t stop rows being selected');

      uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, false, true);
      expect(grid.rows[0].isSelected).toBe(true, 'row should still be selected, noUnselect prevents unselect');

      uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, false, true);
      expect(grid.rows[0].isSelected).toBe(false, 'row should not be selected, noUnselect doesn\'t stop other rows being selected');
      expect(grid.rows[1].isSelected).toBe(true, 'new row should be selected');
    });

    it('should remain selected', function () {
      uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], null, true);
      uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, true);
      expect(grid.rows[0].isSelected).toBe(true);
      expect(grid.rows[1].isSelected).toBe(true);

      uiGridSelectionService.toggleRowSelection(grid, grid.rows[1], null, false);
      expect(grid.rows[0].isSelected).toBe(false, 'row should not be selected, last row selection was not a multiselect selection');
      expect(grid.rows[1].isSelected).toBe(true, 'row should be selected, multiple rows was selected before the selection');
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
    beforeEach(function() {
      grid.setVisibleRows(grid.rows);
    });

    it('should select rows in between using shift key', function () {
      grid.api.selection.toggleRowSelection(grid.rows[2].entity);
      uiGridSelectionService.shiftSelect(grid, grid.rows[5], null, true);
      expect(grid.rows[2].isSelected).toBe(true);
      expect(grid.rows[3].isSelected).toBe(true);
      expect(grid.rows[4].isSelected).toBe(true);
      expect(grid.rows[5].isSelected).toBe(true);
      expect(grid.selection.selectedCount).toBe(4);
    });

    it('should skip non-selectable rows', function () {
      grid.rows[4].enableSelection = false;
      grid.api.selection.toggleRowSelection(grid.rows[2].entity);
      uiGridSelectionService.shiftSelect(grid, grid.rows[5], null, true);
      expect(grid.rows[2].isSelected).toBe(true);
      expect(grid.rows[3].isSelected).toBe(true);
      expect(grid.rows[4].isSelected).toBe(undefined);
      expect(grid.rows[5].isSelected).toBe(true);
    });

    it('should reverse selection order if from is bigger then to', function () {
      grid.api.selection.toggleRowSelection(grid.rows[5].entity);
      uiGridSelectionService.shiftSelect(grid, grid.rows[2], null, true);
      expect(grid.rows[2].isSelected).toBe(true);
      expect(grid.rows[3].isSelected).toBe(true);
      expect(grid.rows[4].isSelected).toBe(true);
      expect(grid.rows[5].isSelected).toBe(true);
    });

    it('should return if multiSelect is false', function () {
      uiGridSelectionService.shiftSelect(grid, grid.rows[2], null, false);
      expect(uiGridSelectionService.getSelectedRows(grid).length).toBe(0);
    });
  });

  describe('selectRow and unselectRow functions', function() {
    it('select then unselect rows, including selecting rows already selected and unselecting rows not selected', function () {
      grid.api.selection.selectRow(grid.rows[4].entity);
      expect(grid.rows[4].isSelected).toBe(true);

      grid.api.selection.selectRow(grid.rows[6].entity);
      expect(grid.rows[4].isSelected).toBe(true);
      expect(grid.rows[6].isSelected).toBe(true);

      grid.api.selection.selectRow(grid.rows[4].entity);
      expect(grid.rows[4].isSelected).toBe(true);
      expect(grid.rows[6].isSelected).toBe(true);

      grid.api.selection.unSelectRow(grid.rows[4].entity);
      expect(grid.rows[4].isSelected).toBe(false);
      expect(grid.rows[6].isSelected).toBe(true);

      grid.api.selection.unSelectRow(grid.rows[4].entity);
      expect(grid.rows[4].isSelected).toBe(false);
      expect(grid.rows[6].isSelected).toBe(true);

      grid.api.selection.unSelectRow(grid.rows[6].entity);
      expect(grid.rows[4].isSelected).toBe(false);
      expect(grid.rows[6].isSelected).toBe(false);
      
      grid.rows[4].enableSelection = false;
      grid.api.selection.selectRow(grid.rows[4].entity);
      expect(grid.rows[4].isSelected).toBe(false);
    });
  });

  describe('selectAllRows and clearSelectedRows functions', function() {
    it('should select all rows, and select all rows when already all selected, then unselect again', function () {
      grid.api.selection.selectRow(grid.rows[4].entity);
      expect(grid.rows[4].isSelected).toBe(true);
      expect(grid.selection.selectAll).toBe(false);

      grid.api.selection.selectRow(grid.rows[6].entity);
      expect(grid.rows[4].isSelected).toBe(true);
      expect(grid.rows[6].isSelected).toBe(true);
      expect(grid.selection.selectAll).toBe(false);

      grid.api.selection.selectAllRows();
      for (var i = 0; i < 10; i++) {
        expect(grid.rows[i].isSelected).toBe(true);
      }
      expect(grid.selection.selectAll).toBe(true);

      grid.api.selection.selectAllRows();
      for (i = 0; i < 10; i++) {
        expect(grid.rows[i].isSelected).toBe(true);
      }
      expect(grid.selection.selectAll).toBe(true);

      grid.api.selection.clearSelectedRows();
      for (i = 0; i < 10; i++) {
        expect(grid.rows[i].isSelected).toBe(false);
      }
      expect(grid.selection.selectAll).toBe(false);
      
      grid.rows[8].enableSelection = false;
      grid.api.selection.selectAllRows();
      expect(grid.rows[7].isSelected).toBe(true);
      expect(grid.rows[8].isSelected).toBe(false);
    });
  });

  describe('toggle selected clears selectAll', function() {
    it('should select all rows, toggle selection for one row removes selectAll', function () {
      grid.api.selection.selectAllRows();
      for (var i = 0; i < 10; i++) {
        expect(grid.rows[i].isSelected).toBe(true);
      }
      expect(grid.selection.selectAll).toBe(true);

      uiGridSelectionService.toggleRowSelection(grid, grid.rows[0], false);
      expect(grid.selection.selectAll).toBe(false);
    });
  });

  describe('selectAllVisibleRows function', function() {
    it('should select all visible rows', function () {
      grid.api.selection.selectRow(grid.rows[4].entity);
      expect(grid.rows[4].isSelected).toBe(true);

      grid.api.selection.selectRow(grid.rows[6].entity);
      expect(grid.rows[4].isSelected).toBe(true);
      expect(grid.rows[6].isSelected).toBe(true);

      grid.rows[3].visible = true;
      grid.rows[4].visible = true;
      grid.rows[6].visible = false;
      grid.rows[7].visible = true;
      grid.rows[8].enableSelection = false;
      grid.rows[9].visible = true;
      expect(grid.selection.selectAll).toBe(false);

      grid.api.selection.selectAllVisibleRows();
      expect(grid.rows[3].isSelected).toBe(true);
      expect(grid.rows[4].isSelected).toBe(true);
      expect(grid.rows[6].isSelected).toBe(false);
      expect(grid.rows[7].isSelected).toBe(true);
      expect(grid.rows[8].isSelected).toBe(undefined);
      expect(grid.rows[9].isSelected).toBe(true);
      expect(grid.selection.selectAll).toBe(true);
      expect(grid.selection.selectedCount).toBe(8);
    });
  });

  describe('selectRowByVisibleIndex function', function() {
    it('should select specified row', function () {
      grid.rows[1].visible = false;
      grid.setVisibleRows(grid.rows);

      grid.api.selection.selectRowByVisibleIndex(0);
      expect(grid.rows[0].isSelected).toBe(true);

      grid.api.selection.selectRowByVisibleIndex(1);
      expect(grid.rows[2].isSelected).toBe(true);
      
      grid.rows[3].enableSelection = false;
      grid.api.selection.selectRowByVisibleIndex(2);
      expect(grid.rows[3].isSelected).toBe(undefined);
    });
  });

  describe('selectionChanged events', function(){
    var selectionFunctions = {};
    var singleCalls;
    var batchCalls;
    beforeEach( function() {
      // can't use spy as the callback hits the function directly
      singleCalls = [];
      batchCalls = [];

      // row 5 isn't visible
      // row 6 is already selected
      // row 7 isn't visible and is already selected
      grid.rows[5].visible = false;
      grid.rows[7].visible = false;
      grid.api.selection.toggleRowSelection( grid.rows[6].entity );
      grid.api.selection.toggleRowSelection( grid.rows[7].entity );
      selectionFunctions.single = function( row, evt ){ singleCalls.push({row: row, evt: evt}); };
      selectionFunctions.batch = function( rows, evt ) { batchCalls.push({rows: rows, evt: evt});};
      grid.api.selection.on.rowSelectionChanged( $scope, selectionFunctions.single );
      grid.api.selection.on.rowSelectionChangedBatch( $scope, selectionFunctions.batch );
    });

    it('select all rows, batch', function() {
      grid.api.selection.selectAllRows();
      expect( singleCalls.length ).toEqual( 0 );
      expect( batchCalls.length ).toEqual( 1 );
      expect( batchCalls[0].rows.length ).toEqual( 8, "2 rows already selected" );
    });

    it('select all rows, not batch', function() {
      grid.options.enableSelectionBatchEvent = false;
      grid.api.selection.selectAllRows();
      expect( singleCalls.length ).toEqual( 8, "2 rows already selected" );
      expect( batchCalls.length ).toEqual( 0 );
    });

    it('select all visible rows, batch', function() {
      grid.api.selection.selectAllVisibleRows();
      expect( singleCalls.length ).toEqual( 0 );
      expect( batchCalls.length ).toEqual( 1 );
      expect( batchCalls[0].rows.length ).toEqual( 8, "8 visible rows, one already selected, one invisible row deselected" );
    });

    it('select all visible rows, not batch', function() {
      grid.options.enableSelectionBatchEvent = false;
      grid.api.selection.selectAllVisibleRows();
      expect( singleCalls.length ).toEqual( 8, "8 visible rows, one already selected, one invisible row deselected" );
      expect( batchCalls.length ).toEqual( 0 );
    });

    // not testing toggle - simple
    // not testing shift select - too messy and same logic as others

    it('clear selected rows, batch', function() {
      grid.api.selection.clearSelectedRows();
      expect( singleCalls.length ).toEqual( 0 );
      expect( batchCalls.length ).toEqual( 1 );
      expect( batchCalls[0].rows.length ).toEqual( 2, "2 selected rows" );
    });

    it('clear selected rows, not batch', function() {
      grid.options.enableSelectionBatchEvent = false;
      grid.api.selection.clearSelectedRows();
      expect( singleCalls.length ).toEqual( 2, "2 selected rows" );
      expect( batchCalls.length ).toEqual( 0 );
    });

    it('should pass event object, batch', function () {
      var mockEvent = {currentTarget: 'test clearSelectedRows'};
      grid.setVisibleRows(grid.rows);
      grid.api.selection.clearSelectedRows(mockEvent);
      expect( batchCalls.length ).toEqual( 1 );
      expect( batchCalls[0].evt.currentTarget ).toEqual( 'test clearSelectedRows' );
      mockEvent = {currentTarget: 'test shiftSelect'};
      uiGridSelectionService.shiftSelect(grid, grid.rows[3], mockEvent, true);
      expect( batchCalls.length ).toEqual( 2 );
      expect( batchCalls[1].evt.currentTarget ).toEqual( 'test shiftSelect' );
      mockEvent = {currentTarget: 'test selectAllRows'};
      grid.api.selection.selectAllRows(mockEvent);
      expect( batchCalls.length ).toEqual( 3 );
      expect( batchCalls[2].evt.currentTarget ).toEqual( 'test selectAllRows' );
    });

    it('should pass event object, not batch', function () {
      grid.options.enableSelectionBatchEvent = false;
      var mockEvent = {currentTarget: 'test'};
      grid.api.selection.selectRow(grid.rows[4].entity, mockEvent);
      expect( singleCalls.length ).toEqual( 1 );
      expect( singleCalls[0].evt.currentTarget ).toEqual( 'test' );
    });
  });
});