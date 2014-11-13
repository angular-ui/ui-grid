(function () {
  'use strict';

  angular.module('ui.grid').controller('uiGridController', ['$scope', '$element', '$attrs', 'gridUtil', '$q', 'uiGridConstants',
                    '$templateCache', 'gridClassFactory', '$timeout', '$parse', '$compile',
    function ($scope, $elm, $attrs, gridUtil, $q, uiGridConstants,
              $templateCache, gridClassFactory, $timeout, $parse, $compile) {
      // gridUtil.logDebug('ui-grid controller');

      var self = this;

      // Extend options with ui-grid attribute reference
      self.grid = gridClassFactory.createGrid($scope.uiGrid);
      $elm.addClass('grid' + self.grid.id);
      self.grid.rtl = gridUtil.getStyles($elm[0])['direction'] === 'rtl';


      //add optional reference to externalScopes function to controller
      //so it can be retrieved in lower elements that have isolate scope
      self.getExternalScopes = $scope.getExternalScopes;

      // angular.extend(self.grid.options, );

      //all properties of grid are available on scope
      $scope.grid = self.grid;

      if ($attrs.uiGridColumns) {
        $attrs.$observe('uiGridColumns', function(value) {
          self.grid.options.columnDefs = value;
          self.grid.buildColumns()
            .then(function(){
              self.grid.preCompileCellTemplates();

              self.grid.refreshCanvas(true);
            });
        });
      }


      var dataWatchCollectionDereg;
      if (angular.isString($scope.uiGrid.data)) {
        dataWatchCollectionDereg = $scope.$parent.$watchCollection($scope.uiGrid.data, dataWatchFunction);
      }
      else {
        dataWatchCollectionDereg = $scope.$parent.$watchCollection(function() { return $scope.uiGrid.data; }, dataWatchFunction);
      }

      var columnDefWatchCollectionDereg = $scope.$parent.$watchCollection(function() { return $scope.uiGrid.columnDefs; }, columnDefsWatchFunction);

      function columnDefsWatchFunction(n, o) {
        if (n && n !== o) {
          self.grid.options.columnDefs = n;
          self.grid.buildColumns()
            .then(function(){

              self.grid.preCompileCellTemplates();

              self.grid.callDataChangeCallbacks(uiGridConstants.dataChange.COLUMN);
            });
        }
      }

      function dataWatchFunction(newData) {
        // gridUtil.logDebug('dataWatch fired');
        var promises = [];
        
        if (newData) {
          if (
            // If we have no columns (i.e. columns length is either 0 or equal to the number of row header columns, which don't count because they're created automatically)
            self.grid.columns.length === (self.grid.rowHeaderColumns ? self.grid.rowHeaderColumns.length : 0) &&
            // ... and we don't have a ui-grid-columns attribute, which would define columns for us
            !$attrs.uiGridColumns &&
            // ... and we have no pre-defined columns
            self.grid.options.columnDefs.length === 0 &&
            // ... but we DO have data
            newData.length > 0
          ) {
            // ... then build the column definitions from the data that we have
            self.grid.buildColumnDefsFromData(newData);
          }

          // If we either have some columns defined, or some data defined
          if (self.grid.options.columnDefs.length > 0 || newData.length > 0) {
            // Build the column set, then pre-compile the column cell templates
            promises.push(self.grid.buildColumns()
              .then(function() {
                self.grid.preCompileCellTemplates();
              }));
          }

          $q.all(promises).then(function() {
            self.grid.modifyRows(newData)
              .then(function () {
                // if (self.viewport) {
                  self.grid.redrawInPlace();
                // }

                $scope.$evalAsync(function() {
                  self.grid.refreshCanvas(true);
                  self.grid.callDataChangeCallbacks(uiGridConstants.dataChange.ROW);
                });
              });
          });
        }
      }


      $scope.$on('$destroy', function() {
        dataWatchCollectionDereg();
        columnDefWatchCollectionDereg();
      });

      $scope.$watch(function () { return self.grid.styleComputations; }, function() {
        self.grid.refreshCanvas(true);
      });


      /* Event Methods */

      self.fireScrollingEvent = gridUtil.throttle(function(args) {
        $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);
      }, self.grid.options.scrollThrottle, {trailing: true});

      self.fireEvent = function(eventName, args) {
        // Add the grid to the event arguments if it's not there
        if (typeof(args) === 'undefined' || args === undefined) {
          args = {};
        }

        if (typeof(args.grid) === 'undefined' || args.grid === undefined) {
          args.grid = self.grid;
        }

        $scope.$broadcast(eventName, args);
      };

      self.innerCompile = function innerCompile(elm) {
        $compile(elm)($scope);
      };

    }]);

/**
 *  @ngdoc directive
 *  @name ui.grid.directive:uiGrid
 *  @element div
 *  @restrict EA
 *  @param {Object} uiGrid Options for the grid to use
 *  @param {Object=} external-scopes Add external-scopes='someScopeObjectYouNeed' attribute so you can access
 *            your scopes from within any custom templatedirective.  You access by $scope.getExternalScopes() function
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
    '$compile',
    '$templateCache',
    'gridUtil',
    '$window',
    function(
      $compile,
      $templateCache,
      gridUtil,
      $window
      ) {
      return {
        templateUrl: 'ui-grid/ui-grid',
        scope: {
          uiGrid: '=',
          getExternalScopes: '&?externalScopes' //optional functionwrapper around any needed external scope instances
        },
        replace: true,
        transclude: true,
        controller: 'uiGridController',
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              // gridUtil.logDebug('ui-grid postlink');

              var grid = uiGridCtrl.grid;

              // Initialize scrollbars (TODO: move to controller??)
              uiGridCtrl.scrollbars = [];

              //todo: assume it is ok to communicate that rendering is complete??
              grid.renderingComplete();

              grid.element = $elm;

              grid.gridWidth = $scope.gridWidth = gridUtil.elementWidth($elm);

              // Default canvasWidth to the grid width, in case we don't get any column definitions to calculate it from
              grid.canvasWidth = uiGridCtrl.grid.gridWidth;

              grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

              // If the grid isn't tall enough to fit a single row, it's kind of useless. Resize it to fit a minimum number of rows
              if (grid.gridHeight < grid.options.rowHeight) {
                // Figure out the new height
                var contentHeight = grid.options.minRowsToShow * grid.options.rowHeight;
                var headerHeight = grid.options.hideHeader ? 0 : grid.options.headerRowHeight;
                var footerHeight = grid.options.showFooter ? grid.options.footerRowHeight : 0;
                var scrollbarHeight = grid.options.enableScrollbars ? gridUtil.getScrollbarWidth() : 0;

                var maxNumberOfFilters = 0;
                // Calculates the maximum number of filters in the columns
                angular.forEach(grid.options.columnDefs, function(col) {
                  if (col.hasOwnProperty('filter')) {
                    if (maxNumberOfFilters < 1) {
                        maxNumberOfFilters = 1;
                    }
                  }
                  else if (col.hasOwnProperty('filters')) {
                    if (maxNumberOfFilters < col.filters.length) {
                        maxNumberOfFilters = col.filters.length;
                    }
                  }
                });
                var filterHeight = maxNumberOfFilters * headerHeight;

                var newHeight = headerHeight + contentHeight + footerHeight + scrollbarHeight + filterHeight;

                $elm.css('height', newHeight + 'px');

                grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);
              }

              // Run initial canvas refresh
              grid.refreshCanvas();

              //add pinned containers for row headers support
              //moved from pinning feature
              var left = angular.element('<div ng-if="grid.hasLeftContainer()" style="width: 0" ui-grid-pinned-container="\'left\'"></div>');
              $elm.prepend(left);
              uiGridCtrl.innerCompile(left);

              var right = angular.element('<div  ng-if="grid.hasRightContainer()" style="width: 0" ui-grid-pinned-container="\'right\'"></div>');
              $elm.append(right);
              uiGridCtrl.innerCompile(right);


              //if we add a left container after render, we need to watch and react
              $scope.$watch(function () { return grid.hasLeftContainer();}, function (newValue, oldValue) {
                if (newValue === oldValue) {
                  return;
                }

                //todo: remove this code.  it was commented out after moving from pinning because body is already float:left
//                var bodyContainer = angular.element($elm[0].querySelectorAll('[container-id="body"]'));
//                if (newValue){
//                  bodyContainer.attr('style', 'float: left; position: inherit');
//                }
//                else {
//                  bodyContainer.attr('style', 'float: left; position: relative');
//                }

                grid.refreshCanvas(true);
              });

              //if we add a right container after render, we need to watch and react
              $scope.$watch(function () { return grid.hasRightContainer();}, function (newValue, oldValue) {
                if (newValue === oldValue) {
                  return;
                }
                grid.refreshCanvas(true);
              });


              // Resize the grid on window resize events
              function gridResize($event) {
                grid.gridWidth = $scope.gridWidth = gridUtil.elementWidth($elm);
                grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

                grid.queueRefresh();
              }

              angular.element($window).on('resize', gridResize);

              // Unbind from window resize events when the grid is destroyed
              $elm.on('$destroy', function () {
                angular.element($window).off('resize', gridResize);
              });
            }
          };
        }
      };
    }
  ]);

})();
