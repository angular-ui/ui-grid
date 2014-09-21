(function(){

angular.module('ui.grid')
.directive('uiGridMenuButton', ['$log', 'gridUtil', 'uiGridConstants', 
function ($log, gridUtil, uiGridConstants) {

  return {
    priority: 0,
    scope: true,
    require: ['?^uiGrid'],
    templateUrl: 'ui-grid/ui-grid-menu-button',
    replace: true,
    link: function ($scope, $elm, $attrs, controllers) {
      var uiGridCtrl = controllers[0];

      $scope.showMenu = function () {
        $scope.menuItems = [
          { title: 'fred'}
        ];
        $scope.$broadcast('openGridMenu');
      };

      // need to set == options.menuItems, then the watch will work
/*      $scope.$watch('menuItems', function (n, o) {
        if (typeof(n) !== 'undefined' && n && angular.isArray(n)) {
          n.forEach(function (item) {
            if (typeof(item.context) === 'undefined' || !item.context) {
              item.context = {};
            }
            item.context.col = $scope.col;
          });

          $scope.menuItems = defaultMenuItems.concat(n);
        }
        else {
          $scope.menuItems = defaultMenuItems;
        }
      });*/
      
    }
  };

}])
.directive('uiGridMenuHandler', ['$log', 'gridUtil', 'uiGridConstants', '$timeout', 
function ($log, gridUtil, uiGridConstants, $timeout) {

  return {
    priority: 0,
    require: ['?^uiGrid', 'uiGridMenu'],
    link: function ($scope, $elm, $attrs, controllers) {
      var uiGridCtrl = controllers[0];
      var uiGridMenuCtrl = controllers[1];

      $scope.$on('openGridMenu', function () {
        uiGridMenuCtrl.showMenu();
        
        $timeout(function () {
          var grid = uiGridCtrl.grid;
          var width = gridUtil.elementWidth(grid, true);

          // Put the menu inside the right of the grid
          $elm.css('right', width + 'px');

          // Put the menu at the top of the grid but adjust for the border
          $elm.css('top', '-1px');
        });
      });      
    }
  };

}]);

})();