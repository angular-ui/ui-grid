(function () {
  'use strict';

  var module = angular.module('ui.grid.pinning', ['ui.grid']);

  module.directive('uiGridColumnMenu', ['$log', function ($log) {
    return {
      scope: false,
      priority: 10,
      require: 'uiGridColumnMenu',
      link: function ($scope, $elm, $attrs, colMenuCtrl) {
        $scope.$watch(function () { return colMenuCtrl.menuItems; }, function (n, o) {
          $log.debug('menu items', n);
        });
      }
    };
  }]);

})();