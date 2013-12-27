(function(){
'use strict';

var app = angular.module('ui.grid.row', []);

app.directive('uiGridRow', ['$log', 'GridUtil', function($log, GridUtil) {
  return {
    replace: true,
    priority: 1000,
    templateUrl: 'ui-grid/ui-grid-row',
    require: ['?^uiGrid', '?^ngRepeat'],
    scope: {
      row: '=uiGridRow',
      rowIndex: '='
    },
    link: function(scope, elm, attrs, controllers) {
      var uiGridCtrl   = controllers[0];
      var ngRepeatCtrl = controllers[1];

      if (uiGridCtrl === undefined) {
        $log.warn('[ui-grid-row] uiGridCtrl is undefined!');
      }

      scope.options = uiGridCtrl.grid.options;
    }
  };
}]);

})();