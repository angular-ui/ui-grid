(function(){
'use strict';

var app = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body', 'ui.grid.row', 'ui.grid.style', 'ui.virtual-repeat']);

/**
 *  @ngdoc directive
 *  @name ui.grid.directive:uiGrid
 *  @element div
 *  @restrict EA
 *  @param {Object} uiGrid Options for the grid to use
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
          <div ui-grid="{ data: data }"></div>
        </div>
      </file>
    </example>
 */
app.directive('uiGrid',
  [
    '$log',
    '$compile',
    '$templateCache',
    'GridUtil',
  function(
    $log,
    $compile,
    $templateCache,
    GridUtil
  ) {

    function preLink(scope, elm, attrs, uiGridCtrl) {
      $log.debug('ui-grid prelink');

      var options = scope.options = {
        data: [],

        /**
        * @property {Array} columnDefs
        */
        columnDefs: null,

        // Height of the header row in
        headerRowHeight: 30,

        rowHeight: 30,

        maxVisibleRowCount: 50
      };
      uiGridCtrl.grid = { options: scope.options };

      angular.extend(options, scope.uiGrid);

      // Create an ID for this grid
      scope.gridId = GridUtil.newId();

      // Initialize the grid

      // Get the column definitions
      //   If no columnDefs were supplied, generate them ourself
      if (! options.columnDefs || options.columnDefs.length === 0) {
        options.columnDefs = GridUtil.getColumnsFromData(options.data);

        // TOD: Put a watch on them
      }

      scope.renderedRows = options.data;

      elm.on('$destroy', function() {
        // Remove columnDefs watch
      });
    }
    
    return {
      templateUrl: 'ui-grid/ui-grid',
      scope: {
        uiGrid: '='
      },
      replace: true,
      compile: function () {
        return {
          pre: preLink,
          post: function (scope, elm, attrs, uiGridCtrl) {
            $log.debug('ui-grid postlink');

            // Get the grid dimensions from the element
            // uiGridCtrl.grid.gridWidth = scope.gridWidth = GridUtil.elementWidth(elm);
            // uiGridCtrl.grid.gridHeight = scope.gridHeight = GridUtil.elementHeight(elm);
            uiGridCtrl.grid.gridWidth = scope.gridWidth = elm[0].clientWidth;
            uiGridCtrl.grid.gridHeight = scope.gridHeight = elm[0].clientHeight;

            scope.visibleRowCount = scope.options.data.length;

            uiGridCtrl.buildStyles();
          }
        };
      },
      controller: function ($scope, $element, $attrs) {
        $log.debug('ui-grid controller');
      }
    };
  }
]);

})();