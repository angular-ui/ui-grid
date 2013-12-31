(function(){
'use strict';

var app = angular.module('ui.grid.header', ['ui.grid.util']);

app.directive('uiGridHeader', ['$log', '$templateCache', '$compile', 'GridUtil', function($log, $templateCache, $compile, GridUtil) {
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

      // Need to refresh the canvas size when the columnDefs change
      scope.$watch('options.columnDefs', function(n, o) {
        uiGridCtrl.refreshCanvas();
      });
    }
  };
}]);

})();