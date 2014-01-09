(function(){
'use strict';

  //class definitions

  /**
   * @description Grid defines a logical grid.  Any non-dom properties and elements needed by the grid should
   *              be defined in this class
   * @param id
   * @constructor
   */
  var Grid = function(id){
    this.id = id;
    this.options = new OptionsInstance();
    this.headerHeight = this.options.headerRowHeight;
    this.gridHeight = 0;
    this.gridWidth = 0;
    this.columnsProcessors = [];
    this.styleComputations = [];
    this.renderedRows = [];
  };

  Grid.prototype.registerColumnsProcessor = function(columnsProcessor){
    this.columnsProcessors.push(columnsProcessor);
  };

  Grid.prototype.registerStyleComputation = function(styleComputation){
    this.styleComputations.push(styleComputation);
  };

  Grid.prototype.setRenderedRows = function(newRows){
    for (var i = 0; i < newRows.length; i++) {
      this.renderedRows.length = newRows.length;

      this.renderedRows[i] = newRows[i];
    }
  };

  Grid.prototype.buildStyles = function($scope) {
    var self = this;
    self.styleComputations.forEach(function(comp) {
        comp.call(self, $scope);
      });
  };

  Grid.prototype.minRowsToRender = function() {
    return Math.ceil(this.getViewportHeight() / this.options.rowHeight);
  };

  // NOTE: viewport drawable height is the height of the grid minus the header row height (including any border)
  // TODO(c0bra): account for footer height
  Grid.prototype.getViewportHeight = function(){
    return this.gridHeight - this.headerHeight;
  };

  Grid.prototype.getCanvasHeight = function(){
    return this.options.rowHeight * this.options.data.length;
  };

  Grid.prototype.getTotalRowHeight = function(){
     return this.options.rowHeight * this.options.data.length;
  };


  //Grid Options defaults
  var OptionsInstance = function(){
    this.data = [];
    this.columnDefs = [];
    this.headerRowHeight = 30;
    this.rowHeight = 30;
    this.maxVisibleRowCount = 200;

    // Turn virtualization on when number of data elements goes over this number
    this.virtualizationThreshold = 50;

    // Extra rows to to render outside of the viewport
    this.excessRows = 4;

    this.scrollThreshold = 4;
  };


var module = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body', 'ui.grid.row', 'ui.grid.style', 'ui.grid.scrollbar','ui.grid.util']);

  module.controller('ui.grid.controller',['$scope', '$element', '$attrs','$log','gridUtil',
    function ($scope, $elm, $attrs,$log,gridUtil) {
      $log.debug('ui-grid controller');

      var self = this;

      self.grid = new Grid(gridUtil.newId);
      //extend options with ui-grid attribute reference
      angular.extend(self.grid.options, $scope.uiGrid);

      //all properties of grid are available on scope
      $scope.grid = self.grid;

      //use gridOptions.columns or ui-grid-columns attribute json or get the columns from the data
      if (self.grid.options.columnDefs.length === 0) {
        self.grid.options.columnDefs =  $scope.$eval($attrs.uiGridColumns) || gridUtil.getColumnsFromData($scope.uiGrid);
      }

      // Need to refresh the canvas size when the columnDefs change
      $scope.$watch('grid.options.columnDefs', function () {
        self.refreshCanvas();
      });

      function dataWatchFunction(n, o) {
        // $log.debug('watch fired!', n, o);
        if (n) {
          if (self.grid.options.columnDefs.length <= 0) {
            self.grid.options.columnDefs = gridUtil.getColumnsFromData(n);
          }

          self.grid.options.data = n;

          self.grid.buildStyles();

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


      $scope.$watch(function () { return self.grid.styleComputations; }, function() {
        self.grid.buildStyles($scope);
      });



      // Refresh the canvas drawable size
      self.refreshCanvas = function() {
        self.grid.buildStyles($scope);
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