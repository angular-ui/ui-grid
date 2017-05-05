describe('ui-grid-menu', function() {
  var $scope, $compile, $controller, menu, inner, recompile, isolateScope;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$compile_, $rootScope, _$controller_) {
    $scope = $rootScope;
    $compile = _$compile_;
    $controller = _$controller_;

    $scope.foo = null;

    $scope.items = [
      {
        title: 'Blah 1',
        action: jasmine.createSpy('item-action'),
        icon: 'ui-grid-icon-close',
        active: function () { return true; }
      },
      {
        title: 'Blah 2',
        action: function () {
          $scope.foo = 'blah';
        }
      },
      {
        title: 'Blah 3'
      },
      {
        title: 'Blah 4',
        shown: function () { return false; }
      }
    ];

    recompile = function () {
      menu = angular.element('<div ui-grid-menu menu-items="items"></div>');
      menu = $compile(menu)($scope);
      $scope.$digest();
      isolateScope = menu.isolateScope();
    };

    recompile();
  }));

  describe( 'basic show/hide', function() {

    it('should hide the menu by default', function () {
      expect(menu.find('.ui-grid-menu-inner').length).toEqual(0);
    });

    // TODO(c0bra): Change to test hide-menu & show-menu events
    // it('should be shown when the shown property is a true boolean', function () {
    //   $scope.isShown = true;
    //   $scope.$digest();

    //   expect(inner.hasClass('ng-hide')).toBe(false);
    // });

    // it('should be shown when the shown property is a function that returns true', function () {
    //   $scope.isShown = function() { return true; };
    //   $scope.$digest();

    //   expect(inner.hasClass('ng-hide')).toBe(false);
    // });


  });

  describe( 'dynamic height', function () {
    it('should set $scope.dynamicStyles to empty string if there is not uiGridCtrl', function () {
      expect(isolateScope.dynamicStyles).toEqual('');
    });

    it('should set $scope.dynamicStyles to a style that limits the height of ui-grid-menu-mid', function () {
      $scope.gridOptions = {
        data: []
      };
      compileWithGrid();

      $scope.$broadcast('show-menu');

      expect(isolateScope.dynamicStyles).toBeDefined();
      expect(isolateScope.dynamicStyles).toContain('.grid1234 .ui-grid-menu-mid { max-height: 350px; }');
    });

    function compileWithGrid () {
      var grid = angular.element('<div><div id="test-grid-menu" ui-grid-menu menu-items="items"></div></div>');
      grid.data('$uiGridController', $controller(function ($scope) {
        this.grid = {
          gridHeight: 400,
          headerHeight: 30,
          id: '1234',
          api: {
            core: {
              on: {
                scrollBegin: angular.noop,
                gridDimensionChanged: function($scope, fxn) {
                  fxn(100, 100, 400, 200);
                }
              }
            }
          }
        };
      }, { $scope: $scope.$new() }));
      grid = $compile(grid)($scope);
      menu = grid.find('#test-grid-menu');
      $scope.$digest();
      isolateScope = menu.isolateScope();
    }
  });

  describe( 'actions with menu displayed', function() {
    beforeEach( function() {
      $scope.$broadcast('show-menu');
      $scope.$digest();
      expect(menu.find('.ui-grid-menu-inner').length).toEqual(1);
    });

    it('should create a list of menu items from the menuItems attribute', function() {
      var items = menu.find('.ui-grid-menu-item');

      expect(items.length).toEqual($scope.items.length);
    });

    it("should obey menu item's 'shown' property", function() {
      $scope.items[0].shown = function () { return false; };
      recompile();

      $scope.$broadcast('show-menu');
      $scope.$digest();
      expect(menu.find('.ui-grid-menu-inner').length).toEqual(1);

      var item = menu.find('.ui-grid-menu-item').first();
      expect(item.hasClass('ng-hide')).toBe(true);
    });

    it("should run an item's action when it's clicked", function() {
      var item = menu.find('.ui-grid-menu-item').first();
      item.trigger('click');
      $scope.$digest();

      expect($scope.items[0].action).toHaveBeenCalled();
    });

    it("should run an item's action when it's clicked (part 2)", function() {
      var item2 = menu.find('.ui-grid-menu-item:nth(1)').first();
      item2.trigger('click');
      $scope.$digest();

      expect($scope.foo).toEqual('blah');
    });

    it('when an item has no action and is clicked, should do nothing', function() {
      var item = menu.find('.ui-grid-menu-item:nth(2)').first();

      expect(function(){
        item.trigger('click');
        $scope.$digest();
      }).not.toThrow();
    });

    it('should show an icon for a menu item', function() {
      var icon = menu.find('.ui-grid-menu-item:nth(0) i').first();
      expect(icon.hasClass('ui-grid-icon-close')).toBe(true);
    });

    it('should add the active class if the item is active', function() {
      var item = menu.find('.ui-grid-menu-item:nth(0)').first();

      expect(item.hasClass('ui-grid-menu-item-active')).toBe(true, 'item gets active class');
    });

    it('should add the active class if the active property is a function that returns true', function() {
      var item = menu.find('.ui-grid-menu-item:nth(0)').first();

      $scope.items[0].active = function() { return true; };
      $scope.$digest();

      expect(item.hasClass('ui-grid-menu-item-active')).toBe(true);
    });

    it('should hide a menu item based on its shown property', function() {
      var item = menu.find('.ui-grid-menu-item:nth(3)').first();

      expect(item.hasClass('ng-hide')).toBe(true);
    });
/*
 PaulL: commented out as seems to be the cause of the intermittent unit test failures
 Will wait to see if they're genuinely gone, then work out why this test causes that

    it("should throw an exception when an item's 'shown' property is not a function", function () {
      $scope.items[0].shown = 'shown goobers';

      expect(function() {
        recompile();
      }).toThrow();
    });

    it("should throw an exception when an item's 'active' property is not a function", function () {
      $scope.items[0].active = 'active goobers';

      expect(function() {
        recompile();
      }).toThrow();
    });
*/
  });


  describe("with a menu item that has no 'shown' property", function () {
    beforeEach(inject(function (_$compile_, $rootScope) {
      $scope = $rootScope;
      $compile = _$compile_;

      $scope.items = [
        {
          title: 'Blah 1'
        }
      ];

      menu = angular.element('<div ui-grid-menu menu-items="items"></div>');
      $compile(menu)($scope);
      $scope.$digest();

      $scope.$broadcast('show-menu');
      $scope.$digest();

      inner = $(menu).find('.ui-grid-menu-inner').first();
      expect(inner.length).toEqual(1);
    }));

    it("should display a menu item by default if no 'shown' property is passed", function() {
      var item = menu.find('.ui-grid-menu-item').first();

      expect(item.hasClass('ng-hide')).toBe(false);
    });
  });


  describe('keyUp and keyDown actions', function() {
    var timeout, menuItemButtons;
    beforeEach(inject(function ($timeout) {
      timeout = $timeout;
    }));
    beforeEach( function() {
      $scope.$broadcast('show-menu');
      $scope.$digest();
      timeout.flush();
    });

    it('should focus on the first menu item after tabbing from the last menu item', function() {
      menuItemButtons = menu.find('button');
      var e = $.Event("keydown");
      e.keyCode = 9;
      var focusSpy = jasmine.createSpy('focusSpy');
      focusSpy(menuItemButtons[0],'focus');
      //mock has 4 items, last one his hidden
      $(menuItemButtons[2]).trigger(e);
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should call hideMenu if ESC is pressed', function() {
      var hideSpy = jasmine.createSpy('hideMenuSpy');
      hideSpy(isolateScope, 'hideMenu');
      var e = $.Event("keyup");
      e.keyCode = 27;
      $(menu).trigger(e);
      expect(hideSpy).toHaveBeenCalled();
    });
  });

  describe('custom gridMenu templates', function () {
    var $timeout;
    var customGridMenu = '<div ui-grid-menu-custom menu-items="items"></div>';

    beforeEach(inject(function (_$timeout_) {
      $timeout = _$timeout_;
    }));
    beforeEach( function() {
      recompile = function () {
        var element = angular.element('<div ui-grid="gridOptions"></div>');
        $scope.gridOptions = {};
        $scope.gridOptions.gridMenuTemplate = customGridMenu;
        $scope.gridOptions.onRegisterApi = function(gridApi) {
          $scope.grid = gridApi.grid;
        };
        $timeout(function () {
          $compile(element)($scope);
        });
        $timeout.flush();
      };

      recompile();
    });

    it('should have gridMenuTemplate defined in grid options', function() {
      expect($scope.grid.options.gridMenuTemplate).toEqual(customGridMenu);
    });
  });
});
