describe('ui-grid-column-menu uiGridColumnMenuService', function () {
  var uiGridColumnMenuService;
  var gridClassFactory;
  var grid;
  var $rootScope;
  var $scope;

  beforeEach(module('ui.grid'));

  beforeEach( inject(function (_uiGridColumnMenuService_, _gridClassFactory_, _$rootScope_) {
    uiGridColumnMenuService = _uiGridColumnMenuService_;
    gridClassFactory = _gridClassFactory_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

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
      $scope.col = { uid: 'ui-grid-01x', suppressRemoveSort: true };

      expect( uiGridColumnMenuService.suppressRemoveSort( $scope ) ).toEqual( true );
    });

    it('not set: is not suppressed', function () {
      $scope.col = { uid: 'ui-grid-01x' };

      expect( uiGridColumnMenuService.suppressRemoveSort( $scope ) ).toEqual( false );
    });
  });


  describe('hideable: ', function () {
    it('everything present: is not hideable', function () {
      $scope.col = { uid: 'ui-grid-01x', colDef: { enableHiding: false } };

      expect( uiGridColumnMenuService.hideable( $scope ) ).toEqual( false );
    });

    it('colDef missing: is  hideable', function () {
      $scope.col = { uid: 'ui-grid-01x' };

      expect( uiGridColumnMenuService.hideable( $scope ) ).toEqual( true );
    });
  });
});
