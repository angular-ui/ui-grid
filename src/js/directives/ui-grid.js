(function(){
'use strict';

var app = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body']);

app.directive('uiGrid', ['$compile', '$templateCache', '$log', 'GridUtil', function($compile, $templateCache, $log, GridUtil) {
  function linkFn(scope, elm, attrs, controller) { }

  return {
    templateUrl: 'ui-grid/ui-grid',
    // transclude: true,
    scope: {
      uiGrid: '=',
      tableClass: '@uiGridTableClass',
      options: '@uiGridOptions'
    },
    compile: function (elm, attrs) {
      // If the contents of the grid element are empty, use the default grid template
      var newContent;
      if (/^\s*$/.test(elm.html())) {
        newContent = $templateCache.get('ui-grid/ui-grid');
      }

      var linker = function (scope, elm, attrs) {
        if (newContent) {
          elm.replaceWith($compile(newContent)(scope));
        }
      };

      return {
        pre: linker,
        post: linkFn
      };
    },
    controller: ['$scope','$element','$attrs', function($scope, $element, $attrs) {
        this.gridData = $scope.uiGrid;

        $scope.gridOptions = {};
        
        //use parent scope options if specified
        if ($scope.options) {
            if (!$scope.$parent[$scope.options]) {
                throw new Error($scope.options + ' was not defined in parent scope');
            }
            $scope.gridOptions = $scope.$parent[$scope.options];
        }

        //use gridOptions.columns or ui-grid-columns attribute json or get the columns from the data
        this.columns = $scope.gridOptions.columnDefs || $scope.$eval($attrs.uiGridColumns) || GridUtil.getColumnsFromData($scope.uiGrid);

        $scope.gridOptions.columnDefs = $scope.gridOptions.columnDefs || this.columns;
    }]
  };
}]);

})();