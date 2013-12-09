(function(){
'use strict';

var app = angular.module('ui.grid.body', []);

app.directive('uiGridBody', ['$log', 'GridUtil', function($log, GridUtil) {
  return {
    templateUrl: 'ui-grid/ui-grid-body',
    replace: true,
    require: '?^uiGrid',
    scope: {
      tableClass: '=uiGridTableClass'
    },
    link: function(scope, elm, attrs, uiGridCtrl) {
      if (!uiGridCtrl) {
        $log.warn('[ui-grid-body] uiGridCtrl is undefined!');
      }

      if (uiGridCtrl && typeof(uiGridCtrl.columns) !== 'undefined' && uiGridCtrl.columns) {
        scope.columns = uiGridCtrl.columns;
      }
      if (uiGridCtrl && typeof(uiGridCtrl.gridData) !== 'undefined' && uiGridCtrl.gridData) {
        scope.gridData = uiGridCtrl.gridData;
      }
    }
  };
}]);

})();