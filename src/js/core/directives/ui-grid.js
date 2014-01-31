(function () {
  'use strict';

  angular.module('ui.grid').controller('uiGridController', ['$scope', '$element', '$attrs', '$log', 'gridUtil', '$q', 'uiGridConstants',
                    '$templateCache', 'gridClassFactory', '$timeout', '$parse',
    function ($scope, $elm, $attrs, $log, gridUtil, $q, uiGridConstants,
              $templateCache, gridClassFactory, $timeout, $parse) {
      $log.debug('ui-grid controller');

      var self = this;

      self.grid = gridClassFactory.createGrid();

      // Extend options with ui-grid attribute reference
      angular.extend(self.grid.options, $scope.uiGrid);

      //all properties of grid are available on scope
      $scope.grid = self.grid;

      if ($attrs.uiGridColumns) {
        $attrs.$observe('uiGridColumns', function(value) {
          self.grid.options.columnDefs = value;
          self.grid.buildColumns()
            .then(function(){
              // self.columnSizeCalculated = false;
              // self.renderedColumns = self.grid.columns;
              self.refreshCanvas();
            });
        });
      }
      else {
        if (self.grid.options.columnDefs.length > 0) {
        //   self.grid.buildColumns();
        }
      }


      var dataWatchCollectionDereg;
      if (angular.isString($scope.uiGrid.data)) {
        dataWatchCollectionDereg = $scope.$parent.$watchCollection($scope.uiGrid.data, dataWatchFunction);
      }
      else {
        dataWatchCollectionDereg = $scope.$parent.$watchCollection(function() { return $scope.uiGrid.data; }, dataWatchFunction);
      }

      var columnDefWatchDereg = $scope.$parent.$watchCollection(function() { return $scope.uiGrid.columnDefs; }, function(n, o) {
        if (n && n !== o) {
          self.grid.options.columnDefs = n;
          self.grid.buildColumns()
            .then(function(){
              // self.columnSizeCalculated = false;
              // self.renderedColumns = self.grid.columns;
              self.refreshCanvas();
            });
        }
      });

      function dataWatchFunction(n) {
        $log.debug('dataWatch fired');
        var promises = [];

        if (n) {
          //load columns if needed
          if (!$attrs.uiGridColumns && self.grid.options.columnDefs.length === 0) {
              self.grid.options.columnDefs =  gridUtil.getColumnsFromData(n);
          }
          promises.push(self.grid.buildColumns());

          $q.all(promises).then(function() {
            //wrap data in a gridRow
            $log.debug('Modifying rows');
            self.grid.modifyRows(n);

            //todo: move this to the ui-body-directive and define how we handle ordered event registration
            if (self.viewport) {
              var scrollTop = self.viewport[0].scrollTop;
              var scrollLeft = self.viewport[0].scrollLeft;
              self.adjustScrollVertical(scrollTop, 0, true);
              self.adjustScrollHorizontal(scrollLeft, 0, true);
            }

            $scope.$evalAsync(function() {
              self.refreshCanvas();
            });
          });
        }
      }


      $scope.$on('$destroy', function() {
        dataWatchCollectionDereg();
        columnDefWatchDereg();
      });


      $scope.$watch(function () { return self.grid.styleComputations; }, function() {
        self.refreshCanvas();
      });

      // Refresh the canvas drawable size
      $scope.grid.refreshCanvas = self.refreshCanvas = function() {
        // if (self.header) {
        //   // If we haven't calculated the sizes of the columns, calculate them!
        //   if (! self.columnSizeCalculated) {
        //     // Total width of header
        //     var totalWidth = 0;

        //     // All the header cell elements
        //     var headerColumnElms = self.header[0].getElementsByClassName('ui-grid-header-cell');
            
        //     if (headerColumnElms.length > 0) {
        //       // Go through all the header column elements
        //       for (var i = 0; i < headerColumnElms.length; i++) {
        //         var columnElm = headerColumnElms[i];

        //         // Get the related column definition
        //         var column = angular.element(columnElm).scope().col;

        //         // Save the width so we can reset it
        //         var savedWidth = columnElm.style.width;

        //         // Change the width to 'auto' so it will expand out
        //         columnElm.style.width = 'auto';

        //         // Get the "drawn" width
        //         var drawnWidth = gridUtil.outerElementWidth(columnElm);

        //         // Save it in the columns defs
        //         column.drawnWidth = drawnWidth;

        //         // Reset the column width
        //         columnElm.style.width = savedWidth;

        //         // Increment the total header width by this column's drawn width
        //         totalWidth = totalWidth + drawnWidth;
        //       }

        //       // If the total width of the header would be larger than the viewport, use it as the canvas width
        //       if (totalWidth > self.grid.getViewportWidth()) {
        //         self.grid.canvasWidth = totalWidth;

        //         // Tell the grid to use the column drawn widths, if available
        //         self.grid.useColumnDrawnWidths = true;
        //       }
        //       else {
        //         self.grid.canvasWidth = self.grid.getViewportWidth();
        //       }

        //       // Evaluate all the stylings in another digest cycle
        //       $scope.$evalAsync(function() {
        //         self.grid.buildStyles($scope);
        //       });

        //       self.columnSizeCalculated = true;
        //     }
        //   }
        // }

        self.grid.buildStyles($scope);

        if (self.header) {
          // Putting in a timeout as it's not calculating after the grid element is rendered and filled out
          $timeout(function() {
            self.grid.headerHeight = gridUtil.outerElementHeight(self.header);
          }, 0);
        }
      };

      var cellValueGetterCache = {};
      self.getCellValue = function(row,col){
        if(!cellValueGetterCache[col.colDef.name]){
          cellValueGetterCache[col.colDef.name] = $parse(row.getEntityQualifiedColField(col));
        }
        return cellValueGetterCache[col.colDef.name](row);
      };

      //todo: throttle this event?
      self.fireScrollingEvent = function() {
        $scope.$broadcast(uiGridConstants.events.GRID_SCROLLING);
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
angular.module('ui.grid').directive('uiGrid',
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
        controller: 'uiGridController',
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              $log.debug('ui-grid postlink');

              uiGridCtrl.grid.element = $elm;

              uiGridCtrl.grid.gridWidth = $scope.gridWidth = gridUtil.elementWidth($elm);

              // Default canvasWidth to the grid width, in case we don't get any column definitions to calculate it from
              uiGridCtrl.grid.canvasWidth = uiGridCtrl.grid.gridWidth;

              uiGridCtrl.grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

              uiGridCtrl.refreshCanvas();
            }
          };
        }
      };
    }
  ]);

  //todo: move to separate file once Brian has finished committed work in progress
  angular.module('ui.grid').directive('uiGridCell', ['$compile', 'uiGridConstants', '$log', '$parse', function ($compile, uiGridConstants, $log, $parse) {
    var uiGridCell = {
      priority: 0,
      scope: false,
      compile: function() {
        return {
          pre: function($scope, $elm) {
            // $log.debug('uiGridCell pre-link');
            var html = $scope.col.cellTemplate
              .replace(uiGridConstants.COL_FIELD, 'getCellValue(row,col)');
            var cellElement = $compile(html)($scope);
            $elm.append(cellElement);
          },
          post: function($scope, $elm, $attrs) {

          }
        };
      }
    };

    return uiGridCell;
  }]);

})();