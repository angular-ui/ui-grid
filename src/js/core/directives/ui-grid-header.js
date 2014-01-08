(function(){
  'use strict';

  var app = angular.module('ui.grid.header', ['ui.grid']);

  app.directive('uiGridHeader', ['$log', '$templateCache', '$compile', 'gridUtil', function($log, $templateCache, $compile, gridUtil) {
    return {
      restrict: 'EA',
      templateUrl: 'ui-grid/ui-grid-header',
      replace: true,
      // priority: 1000,
      require: '?^uiGrid',
      scope: false,
      link: function (scope, elm, attrs, uiGridCtrl) {
        if (uiGridCtrl === undefined) {
          $log.warn('[ui-grid-header] uiGridCtrl is undefined!');
        }
        $log.debug('ui-grid-header link');

        if (uiGridCtrl) {
          uiGridCtrl.header = elm;
        }
      }
    };
  }]);

})();