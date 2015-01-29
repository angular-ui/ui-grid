describe('uiGridHeaderCell', function () {
  var grid, $scope, $compile, $document, $timeout, $window, recompile, $animate, uiGridConstants, gridUtil, columnDefs;

  var downEvent, upEvent, clickEvent;

  var data = [
    { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
    { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
    { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
    { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
  ];
  
  columnDefs = [
    { name: 'name', headerCellClass: 'testClass' },
    { name: 'gender', headerCellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
        if ( col.colDef.noClass ){
          return '';
        } else {
          return 'funcCellClass';
        }
      }
    },
    { name: 'company' }
  ];

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$compile_, $rootScope, _$document_, _$timeout_, _$window_, _$animate_, _uiGridConstants_, _gridUtil_) {
    $scope = $rootScope;
    $compile = _$compile_;
    $document = _$document_;
    $timeout = _$timeout_;
    $window = _$window_;
    $animate = _$animate_;
    uiGridConstants = _uiGridConstants_;
    gridUtil = _gridUtil_;

    // Decide whether to use mouse or touch events based on which capabilities the browser has
    if (gridUtil.isTouchEnabled()) {
      downEvent = 'touchstart';
      upEvent = 'touchend';
      clickEvent = 'touchstart';
    }
    else {
      downEvent = 'mousedown';
      upEvent = 'mouseup';
      clickEvent = 'click';
    }

    $scope.gridOpts = {
      enableSorting: true,
      columnDefs: columnDefs,
      data: data,
      showGridFooter: false,
      onRegisterApi: function( gridApi ){ $scope.gridApi = gridApi; }
    };

    $scope.extScope = 'test';

    recompile = function () {
      grid = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts"></div>');
      
      $compile(grid)($scope);
      $document[0].body.appendChild(grid[0]);

      $scope.$digest();
    };

    recompile();
  }));

  afterEach(function() {
    grid.remove();
  });

  describe('column menu', function (){
    var headerCell1,
        headerCell2,
        menu;

    beforeEach(function () {
      headerCell1 = $(grid).find('.ui-grid-header-cell:nth(0) .ui-grid-cell-contents');
      headerCell2 = $(grid).find('.ui-grid-header-cell:nth(1) .ui-grid-cell-contents');
      
      menu = $(grid).find('.ui-grid-column-menu');
    });

    function openMenu() {
      headerCell1.trigger(downEvent);
      $scope.$digest();
      $timeout.flush();
      $scope.$digest();
    }

    describe('showing a menu with long-click', function () {
      it('should open the menu', inject(function () {
        openMenu();
        expect(menu.find('.ui-grid-menu-inner').length).toEqual(1, 'column menu is visible (the inner is present)');
      }));
    });

    describe('right click', function () {
      it('should do nothing', inject(function() {
        expect(menu.find('.ui-grid-menu-inner').length).toEqual(0, 'column menu is not initially visible');

        headerCell1.trigger({ type: downEvent, button: 3 });

        $timeout.flush();
        $scope.$digest();

        expect(menu.find('.ui-grid-menu-inner').length).toEqual(0, 'column menu is not visible');
      }));
    });

    describe('clicking outside visible menu', function () {
      it('should close the menu', inject(function() {
        openMenu();
        expect(menu.find('.ui-grid-menu-inner').length).toEqual(1, 'column menu is visible');

        $document.trigger(clickEvent);

        $timeout.flush();
        $scope.$digest();
        
        expect(menu.find('.ui-grid-menu-inner').length).toEqual(0, 'column menu is not visible');
      }));
    });

    describe('when window is resized', function () {
      it('should hide an open menu', function () {
        openMenu();
        expect(menu.find('.ui-grid-menu-inner').length).toEqual(1, 'column menu is visible');
        
        $(window).trigger('resize');
        $scope.$digest();

        $timeout.flush();
        $scope.$digest();

        expect(menu.find('.ui-grid-menu-inner').length).toEqual(0, 'column menu is not visible');
      });
    });

    describe('with enableColumnMenu off', function() {
      it('should not be present', function () {
        $scope.gridOpts.enableColumnMenus = false;
        recompile();

        menu = $(grid).find('.ui-grid-column-menu .ui-grid-menu-inner');

        expect(menu[0]).toBeUndefined('menu is undefined');
        
        var headers = $(grid).find('.ui-grid-column-menu-button');
        expect(headers.length).toEqual(0);
      });
    });

    describe('with colDef.enableColumnMenu false', function() {
      it('should not be present', function () {
        $scope.gridOpts.columnDefs[0].enableColumnMenu = false;
        recompile();

        var headers = $(grid).find('.ui-grid-column-menu-button');
        expect(headers.length).toEqual(2);
      });
    });
    // TODO(c0bra): Allow extra items to be added to a column menu through columnDefs
  });

  describe('headerCellClass', function () {
    var headerCell1,
        headerCell2;

    beforeEach(function () {
      headerCell1 = $(grid).find('.ui-grid-header-cell:nth(0)');
      headerCell2 = $(grid).find('.ui-grid-header-cell:nth(1)');
    });

    it('should have the headerCellClass class, from string', inject(function () {
      expect(headerCell1.hasClass('testClass')).toBe(true);
    }));

    it('should get cellClass from function, and remove it when data changes', inject(function () {
      expect(headerCell2.hasClass('funcCellClass')).toBe(true);
      columnDefs[1].noClass = true;
      $scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
      expect(headerCell2.hasClass('funcCellClass')).toBe(false);
    }));
  });

  describe('externalScope', function() {
    it('should be present', function () {
      var elm = recompile();

      var header = $(grid).find('.ui-grid-header-cell:nth(0)');
      expect(header).toBeDefined();
      expect(header.scope().grid.appScope).toBeDefined();
      expect(header.scope().grid.appScope.extScope).toBe('test');
    });
  });

});