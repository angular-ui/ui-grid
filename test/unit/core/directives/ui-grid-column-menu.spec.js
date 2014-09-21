describe('ui-grid-column-menu uiGridColumnMenuService', function () {
  var uiGridColumnMenuService;
  var gridClassFactory;
  var grid; 
  var $rootScope;
  var $scope;
  var $log;
  
  beforeEach(module('ui.grid'));

  beforeEach( inject(function (_uiGridColumnMenuService_, _gridClassFactory_, _$rootScope_, _$log_) {
    uiGridColumnMenuService = _uiGridColumnMenuService_;
    gridClassFactory = _gridClassFactory_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $log = _$log_;

    grid = gridClassFactory.createGrid( { id: 1234 });
    grid.options.columnDefs = [
      {name: 'col1'},
      {name: 'col2'},
      {name: 'col3'},
      {name: 'col4'},
    ];
    grid.options.data = [
      {col1: '1_1', col2: '1_2', col3: '1_3', col4: '1_4'},
      {col1: '2_1', col2: '2_2', col3: '2_3', col4: '2_4'},
      {col1: '3_1', col2: '3_2', col3: '3_3', col4: '3_4'},
      {col1: '4_1', col2: '4_2', col3: '4_3', col4: '4_4'},
    ];
    
    grid.buildColumns();
    grid.modifyRows(grid.options.data);
    grid.setVisibleRows(grid.rows);
    grid.setVisibleColumns(grid.columns);
  }));

  describe('initialisation: ', function () {
    it('variables set', function () {
      var uiGridCtrlMock = { grid: grid };
      uiGridColumnMenuService.initialize( $scope, uiGridCtrlMock );

      expect( uiGridCtrlMock.columnMenuScope ).toEqual( $scope );      
      expect( $scope.grid ).toEqual( grid );
      expect( $scope.menuShown ).toEqual( false );
    });
  }); 


  describe('setColMenuItemWatch: ', function () {
    it('sets the watch, col.menuItems added and noticed by the watch', function () {
      $scope.col = { uid: 'ui-grid-01x' };
      $scope.defaultMenuItems = [ 
        { title: 'a menu item' } 
      ];
      
      uiGridColumnMenuService.setColMenuItemWatch( $scope );
      
      expect( $scope.menuItems ).toEqual( undefined );
      
      $scope.col.menuItems = [ 
        { title: 'a different menu item'} 
      ];
      
      $scope.$digest();
      
      expect( $scope.menuItems ).toEqual( [
        { title: 'a menu item' }, 
        { title: 'a different menu item', context: jasmine.any(Object) } 
      ] );
    });
  }); 


  describe('sortable: ', function () {
    it('everything present: sortable', function () {
      $scope.col = { uid: 'ui-grid-01x', enableSorting: true };
      $scope.grid = {options: { enableSorting: true } };
      
      expect( uiGridColumnMenuService.sortable( $scope ) ).toEqual( true );
    });

    it('grid.options missing', function () {
      $scope.col = { uid: 'ui-grid-01x', enableSorting: true };
      $scope.grid = {options: { } };
      
      expect( uiGridColumnMenuService.sortable( $scope ) ).toEqual( false );
    });

    it('col missing', function () {
      $scope.grid = {options: { enableSorting: true } };
      
      expect( uiGridColumnMenuService.sortable( $scope ) ).toEqual( false );
    });

    it('col enable sorting false', function () {
      $scope.col = { uid: 'ui-grid-01x', enableSorting: false };
      $scope.grid = {options: { enableSorting: true } };
      
      expect( uiGridColumnMenuService.sortable( $scope ) ).toEqual( false );
    });
  }); 


  describe('isActiveSort: ', function () {
    it('everything present: is active', function () {
      $scope.col = { uid: 'ui-grid-01x', sort: { direction: 'asc'} };
      
      expect( uiGridColumnMenuService.isActiveSort( $scope, 'asc' ) ).toEqual( true );
    });

    it('everything present: is not active', function () {
      $scope.col = { uid: 'ui-grid-01x', sort: { direction: 'asc'} };
      
      expect( uiGridColumnMenuService.isActiveSort( $scope, 'desc' ) ).toEqual( false );
    });

    it('direction missing', function () {
      $scope.col = { uid: 'ui-grid-01x', sort: { } };
      
      expect( uiGridColumnMenuService.isActiveSort( $scope, 'desc' ) ).toEqual( false );
    });

    it('sort missing', function () {
      $scope.col = { uid: 'ui-grid-01x' };
      
      expect( uiGridColumnMenuService.isActiveSort( $scope, 'desc' ) ).toEqual( false );
    });

    it('col missing', function () {
      expect( uiGridColumnMenuService.isActiveSort( $scope, 'desc' ) ).toEqual( false );
    });
  });
  
  
  describe('suppressRemoveSort: ', function () {
    it('everything present: is suppressed', function () {
      $scope.col = { uid: 'ui-grid-01x', colDef: { suppressRemoveSort: true } };
      
      expect( uiGridColumnMenuService.suppressRemoveSort( $scope ) ).toEqual( true );
    });  

    it('not set: is not suppressed', function () {
      $scope.col = { uid: 'ui-grid-01x', colDef: {  } };
      
      expect( uiGridColumnMenuService.suppressRemoveSort( $scope ) ).toEqual( false );
    });  
  });
  

  describe('hideable: ', function () {
    it('everything present: is not hideable', function () {
      $scope.col = { uid: 'ui-grid-01x', colDef: { disableHiding: true } };
      
      expect( uiGridColumnMenuService.hideable( $scope ) ).toEqual( false );
    });  

    it('colDef missing: is  hideable', function () {
      $scope.col = { uid: 'ui-grid-01x' };
      
      expect( uiGridColumnMenuService.hideable( $scope ) ).toEqual( true );
    });  
  });


/*
  describe('addToGridMenu and removeFromGridMenu: ', function () {
    beforeEach( function() {
      uiGridGridMenuService.initialize( $scope, grid );
    });
    
    it('error if no array passed', function () {
      spyOn($log, 'error').andCallFake( function() {});
      
      uiGridGridMenuService.addToGridMenu( grid, grid );
      
      expect( $log.error ).toHaveBeenCalled();
      expect( grid.gridMenuScope.registeredMenuItems ).toEqual( [] );
    });

    it('adds array to registered menu items, removes those items again', function () {
      var menuItems = [ { id: 'customItem1', title: 'x' }, { id: 'customItem2', title: 'y' } ];
      uiGridGridMenuService.addToGridMenu( grid, menuItems );
      
      expect( grid.gridMenuScope.registeredMenuItems ).toEqual( menuItems, 'both menu items present' );
      
      uiGridGridMenuService.removeFromGridMenu( grid, 'customItem1' );
      expect( grid.gridMenuScope.registeredMenuItems ).toEqual( [{ id: 'customItem2', title: 'y' }], 'only one menu item present' );

      // no error when remove item that is not present
      uiGridGridMenuService.removeFromGridMenu( grid, 'customItem1' );
      expect( grid.gridMenuScope.registeredMenuItems ).toEqual( [{ id: 'customItem2', title: 'y' }], 'only one menu item present' );
      
      uiGridGridMenuService.removeFromGridMenu( grid, 'customItem2' );
      expect( grid.gridMenuScope.registeredMenuItems ).toEqual( [], 'no menu items present' );
    });
  }); 


  describe('getMenuItems: ', function () {
    beforeEach( function() {
      uiGridGridMenuService.initialize( $scope, grid );
    });
    
    it('nothing in any config', function () {
      grid.options.gridMenuShowHideColumns = false;
      
      var menuItems = uiGridGridMenuService.getMenuItems( $scope );
      
      expect( menuItems ).toEqual( [] );
    });

    it('grab bag of stuff', function () {
      grid.options.gridMenuCustomItems = [ { title: 'z' }, { title: 'a' }];
      var registeredMenuItems = [ { id: 'customItem1', title: 'x' }, { id: 'customItem2', title: 'y' } ];
      grid.options.columnDefs[1].disableHiding = true;

      uiGridGridMenuService.addToGridMenu( grid, registeredMenuItems );
      
      var menuItems = uiGridGridMenuService.getMenuItems( $scope );
      
      expect( menuItems.length ).toEqual(11, 'Should be 11 items, 2 from customItems, 2 from registered, 1 columns header, and 2x3 columns that allow hiding');
      expect( menuItems[0].title ).toEqual('z', 'Menu item 0 should be from customItem');
      expect( menuItems[1].title ).toEqual('a', 'Menu item 1 should be from customItem');
      expect( menuItems[2].title ).toEqual('x', 'Menu item 2 should be from register');
      expect( menuItems[3].title ).toEqual('y', 'Menu item 3 should be from register');

      expect( menuItems[4].title ).toEqual('Columns:', 'Menu item 4 should be header');
      expect( menuItems[5].title ).toEqual('col1', 'Menu item 5 should be col1');
      expect( menuItems[6].title ).toEqual('col1', 'Menu item 6 should be col1');
      expect( menuItems[7].title ).toEqual('col3', 'Menu item 7 should be col3');
      expect( menuItems[8].title ).toEqual('col3', 'Menu item 8 should be col3');
      expect( menuItems[9].title ).toEqual('col4', 'Menu item 9 should be col4');
      expect( menuItems[10].title ).toEqual('col4', 'Menu item 10 should be col4');
      
      expect( menuItems[5].context.gridCol ).toEqual( grid.columns[0], 'column hide/show menus should have gridCol');
      expect( menuItems[6].context.gridCol ).toEqual( grid.columns[0], 'column hide/show menus should have gridCol');
      expect( menuItems[7].context.gridCol ).toEqual( grid.columns[2], 'column hide/show menus should have gridCol');
      expect( menuItems[8].context.gridCol ).toEqual( grid.columns[2], 'column hide/show menus should have gridCol');
      expect( menuItems[9].context.gridCol ).toEqual( grid.columns[3], 'column hide/show menus should have gridCol');
      expect( menuItems[10].context.gridCol ).toEqual( grid.columns[3], 'column hide/show menus should have gridCol');
      
    });
  }); 
*/
});
