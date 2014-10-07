describe('ui-grid-menu', function() {
  var $scope, $compile, menu, inner, recompile;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$compile_, $rootScope) {
    $scope = $rootScope;
    $compile = _$compile_;

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

    // $scope.isShown = true;

    recompile = function () {
      menu = angular.element('<div ui-grid-menu menu-items="items"></div>');
      $compile(menu)($scope);
      $scope.$digest();
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
});