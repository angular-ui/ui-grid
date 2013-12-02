(function(){
'use strict';

var app = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body']);

app.directive('uiGrid', ['GridUtil', function(GridUtil) {
  return {
    templateUrl: 'ui-grid/ui-grid',
    // transclude: true,
    scope: {
      uiGrid: '=',
      tableClass: '@uiGridTableClass'
    },
    link: function(scope, elm, attrs) {
      
    },
    controller: ['$scope', function($scope) {
      this.gridData = $scope.uiGrid;

      this.columns = GridUtil.getColumnsFromData($scope.uiGrid);
    }]
  };
}]);

})();