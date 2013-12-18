(function(){
'use strict';

var app = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body', 'ui.grid.style', 'ui.virtual-repeat']);

/**
 *  @ngdoc directive
 *  @name ui.grid.directive:uiGrid
 *  @element div
 *  @restrict EA
 *  @param {array} uiGrid Array of rows to display in the grid
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
app.directive('uiGrid',
  [
    '$compile',
    '$templateCache',
    '$log',
    'GridUtil',
  function(
    $compile,
    $templateCache,
    $log,
    GridUtil
  ) {

    function preLink(scope, elm, attrs) {
      var options = scope.uiGrid;

      // Create an ID for this grid
      scope.gridId = GridUtil.newId();

      // Get the grid dimensions from the element

      // Initialize the grid

      // Get the column definitions
        // Put a watch on them

      console.log('gridId', scope.gridId);

      elm.on('$destroy', function() {
        // Remove columnDefs watch
      });
    }
    
    return {
      templateUrl: 'ui-grid/ui-grid',
      scope: {
        uiGrid: '='
      },
      compile: function () {
        return {
          pre: preLink
        };
      },
      controller: function ($scope, $element, $attrs) {
        
      }
    };
  }
]);

})();