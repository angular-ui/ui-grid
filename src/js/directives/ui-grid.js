(function(){
'use strict';

var app = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body', 'ui.grid.row', 'ui.grid.style', 'ui.grid.scrollbar']);

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

        maxVisibleRowCount: 200,

        // Turn virtualization on when number of data elements goes over this number
        virtualizationThreshold: 50,

        // Extra rows to to render outside of the viewport
        excessRows: 4,

        scrollThreshold: 4
      };
      uiGridCtrl.grid = { options: scope.options };

      angular.extend(options, scope.uiGrid);

      // Create an ID for this grid
      scope.gridId = GridUtil.newId();

      // Initialize the grid
      scope.renderedRows = [];

      // Get the column definitions
      //   If no columnDefs were supplied, generate them ourself
      if (! options.columnDefs || options.columnDefs.length === 0) {
        options.columnDefs = GridUtil.getColumnsFromData(options.data);

        // TODO(c0bra): Put a watch on them
      }

      // if (angular.isArray(options.data)) {
      //   scope.renderedRows = options.data;
      // }

      // scope.$evalAsync(function() {
      //   uiGridCtrl.refreshCanvas();
      // });

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
            uiGridCtrl.grid.gridHeight = scope.gridHeight = GridUtil.elementHeight(elm);
            
            uiGridCtrl.refreshCanvas();

            if (typeof(scope.options.data) !== 'undefined' && scope.options.data !== undefined && scope.options.data.length) {
              scope.visibleRowCount = scope.options.data.length;
            }

            function watchFunction(n, o) {
              // $log.debug('watch fired!', n, o);
              if (n) {
                if (scope.options.columnDefs.length <= 0) {
                  scope.options.columnDefs = GridUtil.getColumnsFromData(n);
                }

                scope.options.data = n;
                // scope.renderedRows = scope.options.data;

                uiGridCtrl.buildStyles();

                var scrollTop = uiGridCtrl.viewport[0].scrollTop;
                uiGridCtrl.adjustScrollVertical(scrollTop, null, true);

                scope.$evalAsync(function() {
                  uiGridCtrl.refreshCanvas();
                });
              }
            }
            
            var dataWatchDereg;
            if (angular.isString(scope.uiGrid.data)) {
              dataWatchDereg = scope.$parent.$watch(scope.uiGrid.data, watchFunction);
            }
            else {
              dataWatchDereg = scope.$parent.$watch(function() { return scope.uiGrid.data; }, watchFunction);
            }

            elm.on('$destroy', dataWatchDereg);
          }
        };
      },
      controller: function ($scope, $element, $attrs) {
        $log.debug('ui-grid controller');

        var self = this;
        self.styleComputions = [];

        self.buildStyles = function() {
          // uiGridCtrl.buildColumnStyles();
          // uiGridCtrl.buildRowStyles();

          angular.forEach(self.styleComputions, function(comp) {
            comp.call(self, $scope);
          });
        };

        $scope.$watch(function () { return self.styleComputions; }, function() {
          self.buildStyles();
        });

        self.minRowsToRender = function() {
          return Math.floor($scope.options.viewportHeight / $scope.options.rowHeight);
        };

        // Refresh the canvas drawable size 
        self.refreshCanvas = function() {
          // Default to the configured header row height, then calculate it once the header is linked
          var headerHeight = $scope.options.headerRowHeight;

          if (self.header) {
            headerHeight = GridUtil.outerElementHeight(self.header);
          }
          
          // TODO(c0bra): account for footer height
          // NOTE: viewport drawable height is the height of the grid minus the header row height (including any border)
          // self.grid.options.canvasHeight = $scope.gridHeight - headerHeight;
          $scope.options.viewportHeight = $scope.gridHeight - headerHeight;
          $scope.options.canvasHeight = $scope.options.rowHeight * $scope.options.data.length;

          // Calculate the height of all the displayable rows
          if (self.canvas && self.grid.options.data.length) {
            self.grid.options.totalRowHeight = self.grid.options.rowHeight * self.grid.options.data.length;
          }

          self.buildStyles();
        }; 
      }
    };
  }
]);

})();