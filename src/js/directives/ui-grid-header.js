(function(){
'use strict';

var app = angular.module('ui.grid.header', ['ui.grid.util']);

app.directive('uiGridHeader', ['GridUtil', function(GridUtil) {
  return {
    templateUrl: 'ui-grid/ui-grid-header',
    replace: true,
    require: '?^uiGrid',
    scope: {
      tableClass: '=uiGridTableClass'
    },
    link: function(scope, elm, attrs, uiGridCtrl) {
      // Build the column defs automatically
      if (uiGridCtrl && typeof(uiGridCtrl.columns) !== 'undefined' && uiGridCtrl.columns) {
        scope.columns = uiGridCtrl.columns;
      }
    }
  };
}]);

})();