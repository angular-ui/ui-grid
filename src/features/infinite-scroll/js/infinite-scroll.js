(function() {
  'use strict';
  /**
   *  @ngdoc overview
   *  @name ui.grid.infiniteScroll
   *
   *  @description
   *
   *   #ui.grid.infiniteScroll
   * This module provides infinite scroll functionality to ui-grid
   *
   */
  var module = angular.module('ui.grid.infiniteScroll', ['ui.grid']);
  /**
   *  @ngdoc service
   *  @name ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
   *
   *  @description Service for infinite scroll features
   */
  module.service('uiGridInfiniteScrollService', ['gridUtil', '$compile', '$timeout', function (gridUtil, $compile, $timeout) {

    var service = {

      /**
       * @ngdoc function
       * @name initializeGrid
       * @methodOf ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
       * @description This method register events and methods into grid public API
       */

      initializeGrid: function(grid) {
        service.defaultGridOptions(grid.options);

        /**
         *  @ngdoc object
         *  @name ui.grid.infiniteScroll.api:PublicAPI
         *
         *  @description Public API for infinite scroll feature
         */
        var publicApi = {
          events: {
            infiniteScroll: {

              /**
               * @ngdoc event
               * @name needLoadMoreData
               * @eventOf ui.grid.infiniteScroll.api:PublicAPI
               * @description This event fires when scroll reached bottom percentage of grid
               * and needs to load data
               */

              needLoadMoreData: function ($scope, fn) {
              }
            }
          },
          methods: {
            infiniteScroll: {

              /**
               * @ngdoc function
               * @name dataLoaded
               * @methodOf ui.grid.infiniteScroll.api:PublicAPI
               * @description This function is used as a promise when data finished loading.
               * See infinite_scroll ngdoc for example of usage
               */

              dataLoaded: function() {
                grid.options.loadTimout = false;
              }
            }
          }
        };
        grid.options.loadTimout = false;
        grid.api.registerEventsFromObject(publicApi.events);
        grid.api.registerMethodsFromObject(publicApi.methods);
      },
      defaultGridOptions: function (gridOptions) {
        //default option to true unless it was explicitly set to false
        /**
         *  @ngdoc object
         *  @name ui.grid.infiniteScroll.api:GridOptions
         *
         *  @description GridOptions for infinite scroll feature, these are available to be
         *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
         */

        /**
         *  @ngdoc object
         *  @name enableInfiniteScroll
         *  @propertyOf  ui.grid.infiniteScroll.api:GridOptions
         *  @description Enable infinite scrolling for this grid
         *  <br/>Defaults to true
         */
        gridOptions.enableInfiniteScroll = gridOptions.enableInfiniteScroll !== false;
      },


      /**
       * @ngdoc function
       * @name loadData
       * @methodOf ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
       * @description This function fires 'needLoadMoreData' event
       */

      loadData: function (grid) {
		grid.options.loadTimout = true;
        grid.api.infiniteScroll.raise.needLoadMoreData();        
      },

      /**
       * @ngdoc function
       * @name checkScroll
       * @methodOf ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
       * @description This function checks scroll position inside grid and
       * calls 'loadData' function when scroll reaches 'infiniteScrollPercentage'
       */

      checkScroll: function(grid, scrollTop) {

        /* Take infiniteScrollPercentage value or use 20% as default */
        var infiniteScrollPercentage = grid.options.infiniteScrollPercentage ? grid.options.infiniteScrollPercentage : 20;

        if (!grid.options.loadTimout && scrollTop <= infiniteScrollPercentage) {
          this.loadData(grid);
          return true;
        }
        return false;
      }
      /**
       * @ngdoc property
       * @name infiniteScrollPercentage
       * @propertyOf ui.grid.class:GridOptions
       * @description This setting controls at what percentage of the scroll more data
       * is requested by the infinite scroll
       */
    };
    return service;
  }]);
  /**
   *  @ngdoc directive
   *  @name ui.grid.infiniteScroll.directive:uiGridInfiniteScroll
   *  @element div
   *  @restrict A
   *
   *  @description Adds infinite scroll features to grid
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.infiniteScroll']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Alex', car: 'Toyota' },
            { name: 'Sam', car: 'Lexus' }
      ];

      $scope.columnDefs = [
        {name: 'name'},
        {name: 'car'}
      ];
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="{ data: data, columnDefs: columnDefs }" ui-grid-infinite-scroll="20"></div>
   </div>
   </file>
   </example>
   */

  module.directive('uiGridInfiniteScroll', ['uiGridInfiniteScrollService',
    function (uiGridInfiniteScrollService) {
      return {
        priority: -200,
        scope: false,
        require: '^uiGrid',
        compile: function($scope, $elm, $attr){
          return {
            pre: function($scope, $elm, $attr, uiGridCtrl) {
              uiGridInfiniteScrollService.initializeGrid(uiGridCtrl.grid);
            },
            post: function($scope, $elm, $attr) {
            }
          };
        }
      };
    }]);

  module.directive('uiGridViewport',
    ['$compile', 'gridUtil', 'uiGridInfiniteScrollService', 'uiGridConstants',
      function ($compile, gridUtil, uiGridInfiniteScrollService, uiGridConstants) {
        return {
          priority: -200,
          scope: false,
          link: function ($scope, $elm, $attr){
            if ($scope.grid.options.enableInfiniteScroll) {
              $scope.$on(uiGridConstants.events.GRID_SCROLL, function (evt, args) {
                if (args.y) {
                  var percentage = 100 - (args.y.percentage * 100);
                  uiGridInfiniteScrollService.checkScroll($scope.grid, percentage);
                }
              });
            }
          }
        };
      }]);
})();