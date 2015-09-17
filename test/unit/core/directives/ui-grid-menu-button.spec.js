describe('ui-grid-menu-button uiGridGridMenuService', function () {
  var uiGridGridMenuService;
  var gridClassFactory;
  var grid;
  var $rootScope;
  var $scope;
  var gridUtil;
  var $q;

  beforeEach(module('ui.grid'));

  beforeEach( inject(function (_uiGridGridMenuService_, _gridClassFactory_, _$rootScope_, _gridUtil_, _$q_) {
    uiGridGridMenuService = _uiGridGridMenuService_;
    gridClassFactory = _gridClassFactory_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    gridUtil = _gridUtil_;
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
    grid.setVisibleRows(grid.rows);
    grid.setVisibleColumns(grid.columns);
  }));

  describe('initialisation: ', function () {
    it('api is registered', function () {
      uiGridGridMenuService.initialize( $scope, grid );

      expect( grid.gridMenuScope ).toEqual( $scope );
      expect( $scope.grid ).toEqual( grid );
      expect( grid.api.core.addToGridMenu ).toEqual( jasmine.any(Function) );
      expect( grid.api.core.removeFromGridMenu ).toEqual( jasmine.any(Function) );
    });

    it('api calls expected methods', function () {
      spyOn( uiGridGridMenuService, 'addToGridMenu' ).andCallFake( function() {});
      spyOn( uiGridGridMenuService, 'removeFromGridMenu' ).andCallFake( function() {});
      uiGridGridMenuService.initialize( $scope, grid );

      grid.api.core.addToGridMenu();
      expect( uiGridGridMenuService.addToGridMenu).toHaveBeenCalled();

      grid.api.core.removeFromGridMenu();
      expect( uiGridGridMenuService.removeFromGridMenu).toHaveBeenCalled();
    });
  });


  describe('addToGridMenu and removeFromGridMenu: ', function () {
    beforeEach( function() {
      uiGridGridMenuService.initialize( $scope, grid );
    });

    it('error if no array passed', function () {
      spyOn(gridUtil, 'logError').andCallFake( function() {});

      uiGridGridMenuService.addToGridMenu( grid, grid );

      expect( gridUtil.logError ).toHaveBeenCalled();
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

    it('nothing in any config should have one element (ClearFilters)', function () {
      grid.options.gridMenuShowHideColumns = false;

      var menuItems = uiGridGridMenuService.getMenuItems( $scope );

      expect( menuItems.length ).toEqual( 1);
    });

    it('grab bag of stuff', function () {
      grid.options.gridMenuCustomItems = [ { title: 'z', order: 11 }, { title: 'a', order: 12 }];
      grid.options.gridMenuTitleFilter = function( title ) {return 'fn_' + title;};
      var registeredMenuItems = [ { id: 'customItem1', title: 'x', order: 1 }, { id: 'customItem2', title: 'y', order: 2 } ];
      grid.options.columnDefs[1].enableHiding = false;

      uiGridGridMenuService.addToGridMenu( grid, registeredMenuItems );

      var menuItems = uiGridGridMenuService.getMenuItems( $scope );

      expect( menuItems.length ).toEqual(12, 'Should be 12 items, 2 from customItems, 2 from registered, 1 columns header, and 2x3 columns that allow hiding');
      expect( menuItems[0].title ).toEqual('x', 'Menu item 0 should be from register');
      expect( menuItems[1].title ).toEqual('y', 'Menu item 1 should be from register');
      expect( menuItems[2].title ).toEqual('z', 'Menu item 2 should be from customItem');
      expect( menuItems[3].title ).toEqual('a', 'Menu item 3 should be from customItem');

      //expect( menuItems[4].title ).toEqual('Columns:', 'Menu item 4 should be header');
      expect( menuItems[4].title ).toEqual('Clear all filters', 'Menu item 4 Clear all filters');
      expect( menuItems[5].title ).toEqual('Columns:', 'Menu item 5 should be header');
      expect( menuItems[6].title.toLowerCase() ).toEqual('fn_col1', 'Menu item 5 should be col1');
      expect( menuItems[7].title.toLowerCase() ).toEqual('fn_col1', 'Menu item 6 should be col1');
      expect( menuItems[8].title.toLowerCase() ).toEqual('fn_col3', 'Menu item 7 should be col3');
      expect( menuItems[9].title.toLowerCase() ).toEqual('fn_col3', 'Menu item 8 should be col3');
      expect( menuItems[10].title.toLowerCase() ).toEqual('fn_col4', 'Menu item 9 should be col4');
      expect( menuItems[11].title.toLowerCase() ).toEqual('fn_col4', 'Menu item 10 should be col4');

      expect( menuItems[6].context.gridCol ).toEqual( grid.columns[0], 'column hide/show menus should have gridCol');
      expect( menuItems[7].context.gridCol ).toEqual( grid.columns[0], 'column hide/show menus should have gridCol');
      expect( menuItems[8].context.gridCol ).toEqual( grid.columns[2], 'column hide/show menus should have gridCol');
      expect( menuItems[9].context.gridCol ).toEqual( grid.columns[2], 'column hide/show menus should have gridCol');
      expect( menuItems[10].context.gridCol ).toEqual( grid.columns[3], 'column hide/show menus should have gridCol');
      expect( menuItems[11].context.gridCol ).toEqual( grid.columns[3], 'column hide/show menus should have gridCol');

    });

    it('gridMenuTitleFilter returns a promise', function () {
      var promises = [];
      grid.options.gridMenuTitleFilter = function( title ) {
        var deferred = $q.defer();
        promises.push(deferred);
        return deferred.promise;
      };

      var menuItems = uiGridGridMenuService.getMenuItems( $scope );

      expect( menuItems.length ).toEqual(10, 'Should be 10 items, 1 columns header, 2x4 columns that allow hiding and clear all filters');
      expect( menuItems[0].title ).toEqual('Clear all filters', 'Menu item 0 should be Clear all filters');
      expect( menuItems[1].title ).toEqual('Columns:', 'Menu item 1 should be header');
      expect( menuItems[2].title ).toEqual('', 'Promise not resolved');
      expect( menuItems[3].title ).toEqual('', 'Promise not resolved');
      expect( menuItems[4].title ).toEqual('', 'Promise not resolved');
      expect( menuItems[5].title ).toEqual('', 'Promise not resolved');
      expect( menuItems[6].title ).toEqual('', 'Promise not resolved');
      expect( menuItems[7].title ).toEqual('', 'Promise not resolved');
      expect( menuItems[8].title ).toEqual('', 'Promise not resolved');
      expect( menuItems[9].title ).toEqual('', 'Promise not resolved');

      promises.forEach( function( promise, index ) {
        promise.resolve('resolve_' + index);
      });
      $scope.$digest();

      expect( menuItems.length ).toEqual(10, 'Should be 10 items, 1 columns header, 2x4 columns that allow hiding and Clean all filters');
      expect( menuItems[0].title ).toEqual('Clear all filters', 'Menu item 0 should be Clear all filters');
      expect( menuItems[1].title ).toEqual('Columns:', 'Menu item 0 should be header');
      expect( menuItems[2].title ).toEqual('resolve_0', 'Promise now resolved');
      expect( menuItems[3].title ).toEqual('resolve_1', 'Promise now resolved');
      expect( menuItems[4].title ).toEqual('resolve_2', 'Promise now resolved');
      expect( menuItems[5].title ).toEqual('resolve_3', 'Promise now resolved');
      expect( menuItems[6].title ).toEqual('resolve_4', 'Promise now resolved');
      expect( menuItems[7].title ).toEqual('resolve_5', 'Promise now resolved');
      expect( menuItems[8].title ).toEqual('resolve_6', 'Promise now resolved');
      expect( menuItems[9].title ).toEqual('resolve_7', 'Promise now resolved');
    });
  });

});
