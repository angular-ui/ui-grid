describe('ui.grid.edit uiGridRowEditService', function () {
  var uiGridRowEditService;
  var uiGridEditService;
  var uiGridCellNavService;
  var gridClassFactory;
  var grid; 
  var $rootScope;
  var $scope;
  var $interval;
  var $q;
  
  beforeEach(module('ui.grid.rowEdit'));

  beforeEach(inject(function (_uiGridRowEditService_, _uiGridEditService_, _uiGridCellNavService_, 
                              _gridClassFactory_, $templateCache, 
                              _$rootScope_, _$interval_, _$q_) {
    uiGridRowEditService = _uiGridRowEditService_;
    uiGridEditService = _uiGridEditService_;    
    uiGridCellNavService = _uiGridCellNavService_;    
    gridClassFactory = _gridClassFactory_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $interval = _$interval_;
    $q = _$q_;

    grid = gridClassFactory.createGrid( { id: 1234 });
    grid.options.columnDefs = [
      {name: 'col1'},
      {name: 'col2'},
      {name: 'col3'},
      {name: 'col4'}
    ];
    grid.options.data = [
      {col1: '1_1', col2: '1_2', col3: '1_3', col4: '1_4'},
      {col1: '2_1', col2: '2_2', col3: '2_3', col4: '2_4'},
      {col1: '3_1', col2: '3_2', col3: '3_3', col4: '3_4'},
      {col1: '4_1', col2: '4_2', col3: '4_3', col4: '4_4'}
    ];
    
    grid.buildColumns();
    grid.modifyRows(grid.options.data);
    
//    $templateCache.put('ui-grid/uiGridCell', '<div/>');
//    $templateCache.put('ui-grid/cellEditor', '<div ui-grid-editor></div>');


  }));

  describe('initialisation: ', function () {

    it('register api, rowEdit methods and events are registered', function () {

      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );
      
      grid.renderingComplete();    
      
      expect( grid.api.rowEdit.on.saveRow ).toEqual( jasmine.any(Function) );
      expect( grid.api.rowEdit.getDirtyRows ).toEqual( jasmine.any(Function) );
      expect( grid.api.rowEdit.getErrorRows ).toEqual( jasmine.any(Function) );
      expect( grid.api.rowEdit.flushDirtyRows ).toEqual( jasmine.any(Function) );
      expect( grid.api.rowEdit.setRowsDirty ).toEqual( jasmine.any(Function) );
      expect( grid.api.rowEdit.setRowsClean ).toEqual( jasmine.any(Function) );

    });

    it('register api, listener in place on edit events', function () {

      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );
      
      spyOn( uiGridRowEditService, 'endEditCell' ).andCallFake( function() {} );
      spyOn( uiGridRowEditService, 'beginEditCell' ).andCallFake( function() {} );
      spyOn( uiGridRowEditService, 'cancelEditCell' ).andCallFake( function() {} );
      
      grid.renderingComplete();    

      grid.api.edit.raise.afterCellEdit( );
      grid.api.edit.raise.beginCellEdit( );
      grid.api.edit.raise.cancelCellEdit( );

      expect( uiGridRowEditService.endEditCell ).toHaveBeenCalled();
      expect( uiGridRowEditService.beginEditCell ).toHaveBeenCalled();
      expect( uiGridRowEditService.cancelEditCell ).toHaveBeenCalled();

    });

  });
  
  describe( 'beginEditCell: ', function() {
    beforeEach( function() {
      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );
      grid.renderingComplete();      
    });
    
    it( 'no edit timer in place', function() {
      grid.api.edit.raise.beginCellEdit( grid.options.data[0], grid.options.columnDefs[0] );
      
      expect( grid.rows[0].rowEditSaveTimer ).toEqual( undefined );
    });

    it( 'edit timer in place is cancelled', function() {
      var called = false;
      
      grid.rows[0].rowEditSaveTimer = $interval( function() { called = true; }, 1000, 2 );
      $interval.flush(1500);
      expect( called ).toEqual( true );

      called = false;
      grid.api.edit.raise.beginCellEdit( grid.options.data[0], grid.options.columnDefs[0] );
      
      $interval.flush(1500);
      expect( called ).toEqual( false );
      expect( grid.rows[0].rowEditSaveTimer ).toEqual( undefined );
    });
  });

  describe( 'endEditCell: ', function() {
    beforeEach( function() {
      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );
      grid.renderingComplete();      
    });
    
    it( 'no change to cell value, nothing done', function() {
      var called = false;
      spyOn( uiGridRowEditService, 'saveRow' ).andCallFake( function() {
        return function() { called = true;};
      });
      
      expect( grid.rows[0].rowEditSaveTimer ).toEqual( undefined );
      
      grid.api.edit.raise.afterCellEdit( grid.options.data[0], grid.options.columnDefs[0], '1', '1' );
      expect( uiGridRowEditService.saveRow ).not.toHaveBeenCalled();
      expect( grid.rows[0].isDirty ).toEqual( undefined );
      expect( grid.rowEdit.dirtyRows ).toEqual( undefined );
      
      expect( grid.rows[0].rowEditSaveTimer ).toEqual( undefined );
    });
       
    it( 'timer is not present beforehand, interval triggered at 2000ms', function() {
      var called = false;
      spyOn( uiGridRowEditService, 'saveRow' ).andCallFake( function() {
        return function() { called = true;};
      });
      
      expect( grid.rows[0].rowEditSaveTimer ).toEqual( undefined );
      
      grid.api.edit.raise.afterCellEdit( grid.options.data[0], grid.options.columnDefs[0], '1', '2' );
      expect( uiGridRowEditService.saveRow ).toHaveBeenCalledWith( grid, grid.rows[0] );
      expect( grid.rows[0].isDirty ).toEqual( true );
      expect( grid.rowEdit.dirtyRows.length ).toEqual( 1 );
      
      expect( grid.rows[0].rowEditSaveTimer ).not.toEqual( undefined );
      
      $interval.flush(1900);
      expect( called ).toEqual(false);

      $interval.flush(200);
      expect( called ).toEqual(true);
    });

    it( 'row already dirty so even though value not changed, interval triggered at 2000ms', function() {
      var called = false;
      spyOn( uiGridRowEditService, 'saveRow' ).andCallFake( function() {
        return function() { called = true;};
      });
      grid.rows[0].isDirty = true;
      grid.rowEdit.dirtyRows = [ grid.rows[0] ];
      
      expect( grid.rows[0].rowEditSaveTimer ).toEqual( undefined );
      
      grid.api.edit.raise.afterCellEdit( grid.options.data[0], grid.options.columnDefs[0], '1', '1' );
      expect( uiGridRowEditService.saveRow ).toHaveBeenCalledWith( grid, grid.rows[0] );
      expect( grid.rows[0].isDirty ).toEqual( true );
      expect( grid.rowEdit.dirtyRows.length ).toEqual( 1 );
      
      expect( grid.rows[0].rowEditSaveTimer ).not.toEqual( undefined );
      
      $interval.flush(1900);
      expect( called ).toEqual(false);

      $interval.flush(200);
      expect( called ).toEqual(true);
    });    

    it( 'timer is not present beforehand, timer interval set to -1 so not created', function() {
      var called = false;
      grid.options.rowEditWaitInterval = -1;
      spyOn( uiGridRowEditService, 'saveRow' ).andCallFake( function() {
        return function() { called = true;};
      });
      
      expect( grid.rows[0].rowEditSaveTimer ).toEqual( undefined );
      
      grid.api.edit.raise.afterCellEdit( grid.options.data[0], grid.options.columnDefs[0], '1', '2' );
      expect( uiGridRowEditService.saveRow ).not.toHaveBeenCalled();
      expect( grid.rows[0].isDirty ).toEqual( true );
      expect( grid.rowEdit.dirtyRows.length ).toEqual( 1 );
      
      expect( grid.rows[0].rowEditSaveTimer ).toEqual( undefined );
      
      $interval.flush(1900);
      expect( called ).toEqual(false);

      $interval.flush(200);
      expect( called ).toEqual(false);
    });
    
    it( 'edit timer is in place beforehand and is cancelled, a new one is created and triggered at non-standard 4000ms', function() {
      var called = false;
      spyOn( uiGridRowEditService, 'saveRow' ).andCallFake( function() {
        return function() { called = true;};
      });
      grid.options.rowEditWaitInterval = 4000;
      
      grid.rows[0].rowEditSaveTimer = $interval( function() { called = true; }, 1000 );
      $interval.flush(900);
      expect( called ).toEqual( false );

      grid.api.edit.raise.afterCellEdit( grid.options.data[0], grid.options.columnDefs[0], '1', '2' );
      expect( uiGridRowEditService.saveRow ).toHaveBeenCalledWith( grid, grid.rows[0] );
      expect( grid.rows[0].isDirty ).toEqual( true );
      expect( grid.rowEdit.dirtyRows.length ).toEqual( 1 );
      
      // old interval not called
      $interval.flush(200);
      expect( called ).toEqual( false );
      
      // only 2.1 seconds, new interval not called yet
      $interval.flush(1900);
      expect( called ).toEqual(false);
      
      // 4.1 seconds, now should be called
      $interval.flush(2000);
      expect( called ).toEqual(true);
    });
  });
  

  describe( 'cancelEditCell: ', function() {
    beforeEach( function() {
      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );
      grid.renderingComplete();      
    });
  
    it( 'do nothing if row not previously dirty', function() {
      grid.api.edit.raise.cancelCellEdit( grid.options.data[0], grid.options.columnDefs[0] );
      
      expect( grid.rows[0].rowEditSaveTimer ).toEqual( undefined );
    });

    it( 'reinstate timer if row was previously dirty', function() {
      grid.rows[0].isDirty = true;
      
      grid.api.edit.raise.cancelCellEdit( grid.options.data[0], grid.options.columnDefs[0] );
      
      expect( grid.rows[0].rowEditSaveTimer ).not.toEqual( undefined );
    });
  });


  describe( 'navigate: ', function() {
    var oldCell;
    var newCell;
    
    beforeEach( function() {
      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );
      uiGridCellNavService.initializeGrid( grid );
      grid.renderingComplete();
      
      oldCell = { row: grid.rows[2], col: grid.columns[2] };      
      newCell = { row: grid.rows[1], col: grid.columns[1] };      
    });
  
    it( 'new row dirty, had a timer, timer cancelled', function() {
      grid.rows[1].rowEditSaveTimer = $interval( function() {}, 1000 );
      grid.rows[1].isDirty = true;
      
      grid.api.cellNav.raise.navigate( newCell, oldCell );
      
      expect( grid.rows[1].rowEditSaveTimer ).toEqual( undefined );
    });

    it( 'new row dirty, but is saving, timer not cancelled', function() {
      grid.rows[1].rowEditSaveTimer = $interval( function() {}, 1000 );
      grid.rows[1].isDirty = true;
      grid.rows[1].isSaving = true;
      
      grid.api.cellNav.raise.navigate( newCell, oldCell );
      
      expect( grid.rows[1].rowEditSaveTimer ).not.toEqual( undefined );
    });

    it( 'old row clean, no timer created', function() {
      grid.api.cellNav.raise.navigate( newCell, oldCell );
      
      expect( grid.rows[2].rowEditSaveTimer ).toEqual( undefined );
    });

    it( 'old row dirty, timer created', function() {
      grid.rows[2].isDirty = true;
      
      grid.api.cellNav.raise.navigate( newCell, oldCell );
      
      expect( grid.rows[2].rowEditSaveTimer ).not.toEqual( undefined );
    });

    it( 'old row saving, no timer created', function() {
      grid.rows[2].isSaving = true;
      grid.api.cellNav.raise.navigate( newCell, oldCell );
      
      expect( grid.rows[2].rowEditSaveTimer ).toEqual( undefined );
    });
  });


  describe( 'saveRow and promises: ', function() {
    beforeEach( function() {
      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );
      grid.renderingComplete();      
    });
  
    it( 'saveRow on previously errored row, promise resolved successfully', function() {
      var promise = $q.defer();
      
      grid.rows[0].isDirty = true;
      grid.rows[0].isError = true;
      grid.rowEdit.dirtyRows = [ grid.rows[0] ];
      grid.rowEdit.errorRows = [ grid.rows[0] ];
      grid.api.rowEdit.on.saveRow( $scope, function(){
        grid.api.rowEdit.setSavePromise( grid.options.data[0], promise.promise); 
      });
      
      uiGridRowEditService.saveRow( grid, grid.rows[0] )();
      expect( grid.rows[0].isSaving ).toEqual(true);
      expect( grid.rows[0].isDirty ).toEqual(true);
      expect( grid.rows[0].isError ).toEqual(true);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(1);
      expect( grid.rowEdit.errorRows.length ).toEqual(1);

      $rootScope.$apply();
      expect( grid.rows[0].rowEditSavePromise ).not.toEqual(undefined, 'save promise should be set');
      
      promise.resolve(1);
      $rootScope.$apply();
      
      expect( grid.rows[0].isSaving ).toEqual(undefined);
      expect( grid.rows[0].isDirty ).toEqual(undefined);
      expect( grid.rows[0].isError ).toEqual(undefined);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(0);
      expect( grid.rowEdit.errorRows.length ).toEqual(0);
      expect( grid.rowEdit.rowEditSavePromise ).toEqual(undefined);
    });

    it( 'saveRow on dirty row, promise rejected so goes to error state', function() {
      var promise = $q.defer();
      
      grid.rows[0].isDirty = true;
      grid.rowEdit.dirtyRows = [ grid.rows[0] ];
      grid.api.rowEdit.on.saveRow( $scope, function(){
        grid.api.rowEdit.setSavePromise( grid.options.data[0], promise.promise); 
      });
      
      uiGridRowEditService.saveRow( grid, grid.rows[0] )();
      expect( grid.rows[0].isSaving ).toEqual(true);
      expect( grid.rows[0].isDirty ).toEqual(true);
      expect( grid.rows[0].isError ).toEqual(undefined);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(1);
      expect( grid.rowEdit.errorRows ).toEqual(undefined);

      $rootScope.$apply();
      expect( grid.rows[0].rowEditSavePromise ).not.toEqual(undefined, 'save promise should be set');
      
      promise.reject();
      $rootScope.$apply();
      
      expect( grid.rows[0].isSaving ).toEqual(undefined);
      expect( grid.rows[0].isDirty ).toEqual(true);
      expect( grid.rows[0].isError ).toEqual(true);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(1);
      expect( grid.rowEdit.errorRows.length ).toEqual(1);
      expect( grid.rowEdit.rowEditSavePromise ).toEqual(undefined);
    });  
  });
  

  describe( 'flushDirtyRows: ', function() {
    beforeEach( function() {
      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );
      grid.renderingComplete();      
    });
  
    it( 'three dirty rows, all save successfully', function() {
      var promises = [$q.defer(), $q.defer(), $q.defer()];
      var promiseCounter = 0;
      var success = false;
      var failure = false;
      
      grid.rows[0].isDirty = true;
      grid.rows[2].isDirty = true;
      grid.rows[3].isDirty = true;

      grid.rowEdit.dirtyRows = [ grid.rows[0], grid.rows[2], grid.rows[3] ];
      
      grid.api.rowEdit.on.saveRow( $scope, function( rowEntity ){
        grid.api.rowEdit.setSavePromise( rowEntity, promises[promiseCounter].promise);
        promiseCounter++; 
      });
      
      var overallPromise = uiGridRowEditService.flushDirtyRows( grid );
      overallPromise.then( function() { success = true; }, function() { failure = true; });
      
      expect( grid.rows[0].isSaving ).toEqual(true);
      expect( grid.rows[1].isSaving ).toEqual(undefined);
      expect( grid.rows[2].isSaving ).toEqual(true);
      expect( grid.rows[3].isSaving ).toEqual(true);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(3);
      
      promises[0].resolve(1);
      $rootScope.$apply();
      
      expect( grid.rows[0].isSaving ).toEqual(undefined);
      expect( grid.rows[0].isDirty ).toEqual(undefined);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(2);
      expect( success ).toEqual(false);
      
      promises[1].resolve(1);
      promises[2].resolve(1);
      $rootScope.$apply();

      expect( grid.rows[2].isSaving ).toEqual(undefined);
      expect( grid.rows[2].isDirty ).toEqual(undefined);
      expect( grid.rows[3].isSaving ).toEqual(undefined);
      expect( grid.rows[3].isDirty ).toEqual(undefined);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(0);
      expect( success ).toEqual(true);
      expect( failure ).toEqual(false);
    });

    it( 'one dirty rows, already saving, doesn\'t call save again', function() {
      var promises = [$q.defer()];
      var promiseCounter = 0;
      var success = false;
      var failure = false;
      
      grid.rows[0].isDirty = true;

      grid.rowEdit.dirtyRows = [ grid.rows[0] ];
      
      grid.api.rowEdit.on.saveRow( $scope, function( rowEntity ){
        grid.api.rowEdit.setSavePromise( rowEntity, promises[promiseCounter].promise);
        promiseCounter++;
      });
      
      // set row saving
      uiGridRowEditService.saveRow( grid, grid.rows[0] )();
      
      expect( grid.rows[0].isSaving ).toEqual(true);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(1);
      expect( promiseCounter ).toEqual(1);

      // flush dirty rows, expect no new promise
      var overallPromise = uiGridRowEditService.flushDirtyRows( grid );
      overallPromise.then( function() { success = true; }, function() { failure = true; });
      
      expect( grid.rows[0].isSaving ).toEqual(true);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(1);
      expect( promiseCounter ).toEqual(1);
      
      promises[0].resolve(1);
      $rootScope.$apply();
      
      expect( grid.rows[0].isSaving ).toEqual(undefined);
      expect( grid.rows[0].isDirty ).toEqual(undefined);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(0);
      expect( success ).toEqual(true);
    });
    
    it( 'three dirty rows, one save fails', function() {
      var promises = [$q.defer(), $q.defer(), $q.defer()];
      var promiseCounter = 0;
      var success = false;
      var failure = false;
      
      grid.rows[0].isDirty = true;
      grid.rows[2].isDirty = true;
      grid.rows[3].isDirty = true;

      grid.rowEdit.dirtyRows = [ grid.rows[0], grid.rows[2], grid.rows[3] ];
      
      grid.api.rowEdit.on.saveRow( $scope, function( rowEntity ){
        grid.api.rowEdit.setSavePromise( rowEntity, promises[promiseCounter].promise);
        promiseCounter++; 
      });
      
      var overallPromise = uiGridRowEditService.flushDirtyRows( grid );
      overallPromise.then( function() { success = true; }, function() { failure = true; });
      
      expect( grid.rows[0].isSaving ).toEqual(true);
      expect( grid.rows[1].isSaving ).toEqual(undefined);
      expect( grid.rows[2].isSaving ).toEqual(true);
      expect( grid.rows[3].isSaving ).toEqual(true);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(3);
      
      promises[0].resolve(1);
      $rootScope.$apply();
      
      expect( grid.rows[0].isSaving ).toEqual(undefined);
      expect( grid.rows[0].isDirty ).toEqual(undefined);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(2);
      expect( success ).toEqual(false);
      
      promises[1].reject();
      promises[2].resolve(1);
      $rootScope.$apply();

      expect( grid.rows[2].isSaving ).toEqual(undefined);
      expect( grid.rows[2].isDirty ).toEqual(true);
      expect( grid.rows[2].isError ).toEqual(true);
      expect( grid.rows[3].isSaving ).toEqual(undefined);
      expect( grid.rows[3].isDirty ).toEqual(undefined);
      expect( grid.rowEdit.dirtyRows.length ).toEqual(1);
      expect( grid.rowEdit.errorRows.length ).toEqual(1);
      expect( success ).toEqual(false);
      expect( failure ).toEqual(true);
    });
    
    it( 'no dirty rows, no error is thrown', function() {
      expect(function() {
        uiGridRowEditService.flushDirtyRows( grid );
      }).not.toThrow();
    });
  });
  
  
  describe( 'setRowsDirty', function() {
    it( 'rows are set dirty', function() {
      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );
      grid.renderingComplete();

      grid.api.rowEdit.setRowsDirty( [ grid.options.data[0], grid.options.data[1] ]);
      expect( grid.rows[0].isDirty ).toEqual( true );
      expect( grid.rows[0].rowEditSaveTimer ).not.toEqual( undefined );
      expect( grid.rows[1].isDirty ).toEqual( true );
      expect( grid.rows[1].rowEditSaveTimer ).not.toEqual( undefined );
    });
  });


  describe( 'setRowsClean', function() {
    it( 'rows are set clean', function() {
      uiGridRowEditService.initializeGrid( $scope, grid );
      uiGridEditService.initializeGrid( grid );
      grid.renderingComplete();

      grid.api.rowEdit.setRowsDirty( [ grid.options.data[0], grid.options.data[1] ]);
      expect( grid.rows[0].isDirty ).toEqual( true );
      expect( grid.rows[0].rowEditSaveTimer ).not.toEqual( undefined );
      expect( grid.rows[1].isDirty ).toEqual( true );
      expect( grid.rows[1].rowEditSaveTimer ).not.toEqual( undefined );
      expect( grid.rowEdit.dirtyRows.length).toEqual(2);

      grid.rows[0].isError = true;
      grid.rowEdit.errorRows = [];
      grid.rowEdit.errorRows.push( grid.rows[0] );
      expect( grid.rowEdit.errorRows.length).toEqual(1);

      grid.api.rowEdit.setRowsClean( [ grid.options.data[0], grid.options.data[1] ]);

      expect( grid.rows[0].isDirty ).toEqual( undefined );
      expect( grid.rows[0].rowEditSaveTimer ).toEqual( undefined );
      expect( grid.rows[1].isDirty ).toEqual( undefined );
      expect( grid.rows[1].rowEditSaveTimer ).toEqual( undefined );
      expect( grid.rowEdit.dirtyRows.length).toEqual(0);
      expect( grid.rowEdit.errorRows.length).toEqual(0);
    });
  });
});
