(function(){
'use strict';

  //class definitions
  var Grid = function(id){
    this.gridId = id;
    this.options = new OptionsInstance();
    this.columnsProcessors = [];
  };

  Grid.prototype.registerColumnsProcessor = function(columnsProcessor){
    this.columnsProcessors.push(columnsProcessor);
  };

  //Grid Options defaults
  var OptionsInstance = function(){
    this.data = [];
    this.columnDefs = null;
    this.headerRowHeight = 30;
    this.rowHeight = 30;
    this.maxVisibleRowCount = 200;

    // Turn virtualization on when number of data elements goes over this number
    this.virtualizationThreshold = 50;

    // Extra rows to to render outside of the viewport
    this.excessRows = 4;

    this.scrollThreshold = 4;
  };


var module = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body', 'ui.grid.row', 'ui.grid.style', 'ui.grid.scrollbar']);

  module.controller('ui.grid.controller',['$scope', '$element', '$attrs','$log','gridUtil',
    function ($scope, $elm, $attrs,$log,gridUtil) {
      $log.debug('ui-grid controller');

      var self = this;
      self.styleComputions = [];

      self.grid = new Grid(gridUtil.newId);


      var options = $scope.options = self.grid.options;

      angular.extend(options, $scope.uiGrid);

      // add Id to scope
      $scope.gridId = self.grid.gridId;

      // Initialize the rendered rows
      $scope.renderedRows = [];

      // Get the column definitions
      //   If no columnDefs were supplied, generate them ourself
      if (! options.columnDefs || options.columnDefs.length === 0) {
        options.columnDefs = gridUtil.getColumnsFromData(options.data);

        // Need to refresh the canvas size when the columnDefs change
        $scope.$watch('options.columnDefs', function(n, o) {
          self.refreshCanvas();
        });
      }

      if (typeof($scope.options.data) !== 'undefined' && $scope.options.data !== undefined && $scope.options.data.length) {
        $scope.visibleRowCount = $scope.options.data.length;
      }

      function dataWatchFunction(n, o) {
        // $log.debug('watch fired!', n, o);
        if (n) {
          if ($scope.options.columnDefs.length <= 0) {
            $scope.options.columnDefs = gridUtil.getColumnsFromData(n);
          }

          $scope.options.data = n;
          // scope.renderedRows = scope.options.data;

          self.buildStyles();

          var scrollTop = self.viewport[0].scrollTop;
          self.adjustScrollVertical(scrollTop, null, true);

          $scope.$evalAsync(function() {
            self.refreshCanvas();
          });
        }
      }

      var dataWatchDereg;
      if (angular.isString($scope.uiGrid.data)) {
        dataWatchDereg = $scope.$parent.$watch($scope.uiGrid.data, dataWatchFunction);
      }
      else {
        dataWatchDereg = $scope.$parent.$watch(function() { return $scope.uiGrid.data; }, dataWatchFunction);
      }


      $scope.$on('$destroy', dataWatchDereg);


      self.buildStyles = function() {
        // uiGridCtrl.buildColumnStyles();
        // uiGridCtrl.buildRowStyles();

        self.styleComputions.forEach(function(comp) {
          comp.call(self, $scope);
        });
      };

      $scope.$watch(function () { return self.styleComputions; }, function() {
        self.buildStyles();
      });

      self.minRowsToRender = function() {
        return Math.ceil($scope.options.viewportHeight / $scope.options.rowHeight);
      };

      // Refresh the canvas drawable size
      self.refreshCanvas = function() {
        // Default to the configured header row height, then calculate it once the header is linked
        var headerHeight = $scope.options.headerRowHeight;

        if (self.header) {
          headerHeight = gridUtil.outerElementHeight(self.header);
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
    }]);

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
module.directive('uiGrid',
  [
    '$log',
    '$compile',
    '$templateCache',
    'gridUtil',
    function(
      $log,
      $compile,
      $templateCache,
      gridUtil
      ) {
      return {
        templateUrl: 'ui-grid/ui-grid',
        scope: {
          uiGrid: '='
        },
        replace: true,
        controller: 'ui.grid.controller',
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              $log.debug('ui-grid postlink');

              // Get the grid dimensions from the element
              // uiGridCtrl.grid.gridWidth = scope.gridWidth = gridUtil.elementWidth(elm);
              // uiGridCtrl.grid.gridHeight = scope.gridHeight = gridUtil.elementHeight(elm);
              uiGridCtrl.grid.gridWidth = $scope.gridWidth = $elm[0].clientWidth;
              uiGridCtrl.grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

              uiGridCtrl.refreshCanvas();




            }
          };
        }
      };
    }
  ]);

})();