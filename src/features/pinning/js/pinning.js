(function () {
  'use strict';

  var module = angular.module('ui.grid.pinning', ['ui.grid']);

  module.directive('uiGrid', ['$log', 'GridRenderContainer', function ($log, GridRenderContainer) {
    return {
      priority: 0,
      require: 'uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {

            var pinColumnLeftAction = {
              title: 'Pin Left',
              action: function() {
                //alert(this.context.col.displayName);
                this.context.col.renderContainer = 'left';

                uiGridCtrl.refreshRows();
                // this.hideMenu();
              }
            };

            var pinColumnRightAction = {
              title: 'Pin Right',
              action: function() {
                //alert(this.context.col.displayName);
                this.context.col.renderContainer = 'right';
                
                uiGridCtrl.refreshRows();
                // this.hideMenu();
              }
            };

            function pinnableColumnBuilder(colDef, col, gridOptions) {
              col.enablePinning = (typeof(colDef.enablePinning) !== 'undefined' && colDef.enablePinning) ? colDef.enablePinning : gridOptions.enablePinning;

              col.menuItems.push(pinColumnLeftAction);
              col.menuItems.push(pinColumnRightAction);
            }

            // Register a column builder to add new menu items for pinning left and right
            uiGridCtrl.grid.registerColumnBuilder(pinnableColumnBuilder);

            uiGridCtrl.grid.renderContainers.left = new GridRenderContainer(uiGridCtrl.grid);
            uiGridCtrl.grid.renderContainers.right = new GridRenderContainer(uiGridCtrl.grid);
          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
          }
        };
      }
    };
  }]);

  // module.directive('uiGridColumnMenu', ['$log', function ($log) {
  //   return {
  //     scope: false,
  //     priority: 10,
  //     require: 'uiGridColumnMenu',
  //     link: function ($scope, $elm, $attrs, colMenuCtrl) {
  //       $scope.$watch(function () { return colMenuCtrl.menuItems; }, function (n, o) {
  //         $log.debug('menu items', n);
  //       });
  //     }
  //   };
  // }]);

})();