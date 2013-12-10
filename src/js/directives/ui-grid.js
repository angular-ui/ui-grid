(function(){
'use strict';

var app = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body']);

/**
 *  @ngdoc directive
 *  @name ui.grid.directive:uiGrid
 *  @element div
 *  
 *  @description Create a very basic grid.
 *
 *  @example
    <example module="app">
      <file name="app.js">
        var app = angular.module('app', ['ui.grid']);

        app.controller('MainCtrl', ['$scope', function ($scope) {
          $scope.data = [
            { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
          ];
        }]);
      </file>
      <file name="index.html">
        <div ng-controller="MainCtrl">
          <div ui-grid="data"></div>
        </div>
      </file>
    </example>
 */
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
    controller: ['$scope','$element','$attrs', function($scope, $element, $attrs) {
        this.gridData = $scope.uiGrid;

        $scope.gridOptions = {};
        
        //use parent scope options if specified
        if ($scope.options) {add
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