(function(){
'use strict';

var app = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body']);

app.directive('uiGrid', ['$compile', '$templateCache', '$log', 'GridUtil', function($compile, $templateCache, $log, GridUtil) {
  function linkFn(scope, elm, attrs, controller) {
    console.log(scope.tableClass);

    
  }

  return {
    templateUrl: 'ui-grid/ui-grid',
    // transclude: true,
    scope: {
      uiGrid: '=',
      tableClass: '@uiGridTableClass'
    },
    // compile: function (elm, attrs) {
    //   // If the contents of the grid element are empty, use the default grid template
    //   var newContent;
    //   if (/^\s*$/.test(elm.html())) {
    //     newContent = $templateCache.get('ui-grid/ui-grid');
    //   }

    //   var linker = function (scope, elm, attrs) {
    //     if (newContent) {
    //       elm.replaceWith($compile(newContent)(scope));
    //     }
    //   };

    //   return {
    //     pre: linker,
    //     post: linkFn
    //   };
    // },
    controller: ['$scope', function($scope) {
      this.gridData = $scope.uiGrid;
      // $log.debug('grid Data', this.gridData);

      this.columns = GridUtil.getColumnsFromData($scope.uiGrid);
    }]
  };
}]);

})();