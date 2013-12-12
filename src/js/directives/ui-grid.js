(function(){
'use strict';

var app = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body', 'ui.virtual-repeat']);

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
  function postLink(scope, elm, attrs, controller) {
    $log.debug('grid postlink scope', scope.$id);
  }

  return {
    restrict: 'EA',
    // templateUrl: 'ui-grid/ui-grid',
    // transclude: true,
    priority: 1000,
    scope: {
      uiGrid: '=',
      tableClass: '@uiGridTableClass',
      options: '@uiGridOptions'
    },
    compile: function (elm, attrs) {
      // If the contents of the grid element are empty, use the default grid template
      var tmpl;
      if (elm.html() === '' || /^\s*$/.test(elm.html())) {
        tmpl = $templateCache.get('ui-grid/ui-grid');
      }

      var preLink = function (scope, elm, attrs) {
        scope.blah = 'test1';

        $log.debug('grid prelink scope', scope.$id);

        if (tmpl) {
          elm.append(tmpl);
          $compile(elm.contents())(scope);
        }
      };

      return {
        pre: preLink,
        post: postLink
      };
    },
    controller: ['$scope','$element','$attrs', function($scope, $element, $attrs) {
      $log.debug('controller scope', $scope.$id);
      $log.debug('controller running');

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