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
  module.service('uiGridInfiniteScrollService', ['gridUtil', '$compile', '$timeout', 'uiGridConstants', 'ScrollEvent', function (gridUtil, $compile, $timeout, uiGridConstants, ScrollEvent) {

    var service = {

      /**
       * @ngdoc function
       * @name initializeGrid
       * @methodOf ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
       * @description This method register events and methods into grid public API
       */

      initializeGrid: function(grid, $scope) {
        service.defaultGridOptions(grid.options);
        grid.infiniteScroll = { dataLoading: false, scrollUp: grid.options.infiniteScrollUp, scrollDown: grid.options.infiniteScrollDown };

        if ( grid.options.infiniteScrollUp){
          grid.suppressParentScrollUp = true;
        }

        if ( grid.options.infiniteScrollDown){
          grid.suppressParentScrollDown = true;
        }

        if (grid.options.enableInfiniteScroll) {
          grid.api.core.on.scrollEnd($scope, service.handleScroll);
        }
        
        // tweak the scroll for infinite scroll up (if enabled)
        service.adjustScroll(grid);

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
               * @description This event fires when scroll reaches bottom percentage of grid
               * and needs to load data
               */

              needLoadMoreData: function ($scope, fn) {
              },

              /**
               * @ngdoc event
               * @name needLoadMoreDataTop
               * @eventOf ui.grid.infiniteScroll.api:PublicAPI
               * @description This event fires when scroll reaches top percentage of grid
               * and needs to load data
               */

              needLoadMoreDataTop: function ($scope, fn) {
              }
            }
          },
          methods: {
            infiniteScroll: {

              /**
               * @ngdoc function
               * @name dataLoaded
               * @methodOf ui.grid.infiniteScroll.api:PublicAPI
               * @description Call this function when you have loaded the additional data
               * requested.  You can set noMoreDataTop or noMoreDataBottom to indicate
               * that we've reached the end of your data set, we won't fire any more events
               * for scroll in that direction.
               * See infinite_scroll tutorial for example of usage
               * @param {boolean} noMoreDataTop flag that there are no more pages upwards, so don't fire
               * any more infinite scroll events upward
               * @param {boolean} noMoreDataBottom flag that there are no more pages downwards, so don't 
               * fire any more infinite scroll events downward 
               */

              dataLoaded: function( noMoreDataTop, noMoreDataBottom ) {
                grid.infiniteScroll.dataLoading = false;
                
                if ( noMoreDataTop === true ){
                  grid.infiniteScroll.scrollUp = false;
                  grid.suppressParentScrollUp = false;
                }

                if ( noMoreDataBottom === true ){
                  grid.infiniteScroll.scrollDown = false;
                  grid.suppressParentScrollDown = false;
                }
                
                service.adjustScroll(grid);
              }
            }
          }
        };
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

        /**
         * @ngdoc property
         * @name infiniteScrollPercentage
         * @propertyOf ui.grid.class:GridOptions
         * @description This setting controls at what percentage remaining more data
         * is requested by the infinite scroll, whether scrolling up or down.
         * 
         * TODO: it would be nice if this were percentage of a page, not percentage of the
         * total scroll - as you get more and more data, the needMoreData event is triggered
         * further and further away from the end (in terms of number of rows)
         * <br> Defaults to 20
         */
        gridOptions.infiniteScrollPercentage = gridOptions.infiniteScrollPercentage || 20;

        /**
         * @ngdoc property
         * @name infiniteScrollUp
         * @propertyOf ui.grid.class:GridOptions
         * @description Whether you allow infinite scroll up, implying that the first page of data
         * you have displayed is in the middle of your data set.  If set to true then we trigger the
         * needMoreDataTop event when the user hits the top of the scrollbar.  
         * <br> Defaults to false
         */
        gridOptions.infiniteScrollUp = gridOptions.infiniteScrollUp === true;

        /**
         * @ngdoc property
         * @name infiniteScrollDown
         * @propertyOf ui.grid.class:GridOptions
         * @description Whether you allow infinite scroll down, implying that the first page of data
         * you have displayed is in the middle of your data set.  If set to true then we trigger the
         * needMoreData event when the user hits the bottom of the scrollbar.  
         * <br> Defaults to true
         */
        gridOptions.infiniteScrollDown = gridOptions.infiniteScrollDown !== false;
      },


      /**
       * @ngdoc function
       * @name handleScroll
       * @methodOf ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
       * @description Called whenever the grid scrolls, determines whether the scroll should
       * trigger an infinite scroll request for more data
       * @param {object} args the args from the event
       */
      handleScroll:  function (args) {
        // don't request data if already waiting for data, or if source is coming from ui.grid.adjustInfiniteScrollPosition() function
        if ( args.grid.infiniteScroll && args.grid.infiniteScroll.dataLoading || args.source === 'ui.grid.adjustInfiniteScrollPosition' ){
          return;
        }

        if (args.y) {
          var percentage;
          if (args.grid.scrollDirection === uiGridConstants.scrollDirection.UP ) {
            percentage = args.y.percentage;
            if (percentage <= args.grid.options.infiniteScrollPercentage / 100){
              service.loadData(args.grid);
            }
          } else if (args.grid.scrollDirection === uiGridConstants.scrollDirection.DOWN) {
            percentage = 1 - args.y.percentage;
            if (percentage <= args.grid.options.infiniteScrollPercentage / 100){
              service.loadData(args.grid);
            }
          }
        }
      },


      /**
       * @ngdoc function
       * @name loadData
       * @methodOf ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
       * @description This function fires 'needLoadMoreData' or 'needLoadMoreDataTop' event based on scrollDirection
       * and whether there are more pages upwards or downwards
       * @param {Grid} grid the grid we're working on
       */
      loadData: function (grid) {
        // save number of currently visible rows to calculate new scroll position later - we know that we want 
        // to be at approximately the row we're currently at
        grid.infiniteScroll.previousVisibleRows = grid.renderContainers.body.visibleRowCache.length;
        grid.infiniteScroll.direction = grid.scrollDirection;
        
        if (grid.scrollDirection === uiGridConstants.scrollDirection.UP && grid.infiniteScroll.scrollUp ) {
          grid.infiniteScroll.dataLoading = true;
          grid.api.infiniteScroll.raise.needLoadMoreDataTop();
        } else if (grid.scrollDirection === uiGridConstants.scrollDirection.DOWN && grid.infiniteScroll.scrollDown ) {
          grid.infiniteScroll.dataLoading = true;
          grid.api.infiniteScroll.raise.needLoadMoreData();
        }
      },
      
      
      /**
       * @ngdoc function
       * @name adjustScroll
       * @methodOf ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
       * @description Once we are informed that data has been loaded, adjust the scroll position to account for that
       * addition and to make things look clean.  
       * 
       * If we're scrolling up we scroll to the first row of the old data set - 
       * so we're assuming that you would have gotten to the top of the grid (from the 20% need more data trigger) by
       * the time the data comes back.  If we're scrolling down we scoll to the last row of the old data set - so we're
       * assuming that you would have gotten to the bottom of the grid (from the 80% need more data trigger) by the time
       * the data comes back.  
       * 
       * Neither of these are good assumptions, but making this a smoother experience really requires
       * that trigger to not be a percentage, and to be much closer to the end of the data (say, 5 rows off the end).  Even then
       * it'd be better still to actually run into the end.  But if the data takes a while to come back, they may have scrolled
       * somewhere else in the mean-time, in which case they'll get a jump back to the new data.  Anyway, this will do for
       * now, until someone wants to do better.
       * @param {Grid} grid the grid we're working on
       */
      adjustScroll: function(grid){
        $timeout(function () {
          var percentage;
          
          if ( grid.infiniteScroll.direction === undefined ){
            // called from initialize, tweak our scroll up a little
            service.adjustInfiniteScrollPosition(grid, 0);
          }

          var newVisibleRows = grid.renderContainers.body.visibleRowCache.length;
          if ( grid.infiniteScroll.direction === uiGridConstants.scrollDirection.UP ){
            percentage = ( newVisibleRows - grid.infiniteScroll.previousVisibleRows ) / newVisibleRows;
            service.adjustInfiniteScrollPosition(grid, percentage);  
          }

          if ( grid.infiniteScroll.direction === uiGridConstants.scrollDirection.DOWN ){
            percentage = grid.infiniteScroll.previousVisibleRows / newVisibleRows;            
            service.adjustInfiniteScrollPosition(grid, percentage);  
          }
        }, 0);
      },
 
 
      /**
       * @ngdoc function
       * @name adjustInfiniteScrollPosition
       * @methodOf ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
       * @description This function fires 'needLoadMoreData' or 'needLoadMoreDataTop' event based on scrollDirection
       * @param {Grid} grid the grid we're working on
       * @param {number} percentage the percentage through the grid that we want to scroll to
       */
      adjustInfiniteScrollPosition: function (grid, percentage) {
        var scrollEvent = new ScrollEvent(grid, null, null, 'ui.grid.adjustInfiniteScrollPosition');

        //for infinite scroll, if there are pages upwards then never allow it to be at the zero position so the up button can be active
        if ( percentage === 0 && grid.infiniteScroll.scrollUp ) {
          scrollEvent.y = {pixels: 1};
        }
        else {
          scrollEvent.y = {percentage: percentage};
        }
        scrollEvent.fireScrollingEvent();
      }

      


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
              uiGridInfiniteScrollService.initializeGrid(uiGridCtrl.grid, $scope);
            },
            post: function($scope, $elm, $attr) {
            }
          };
        }
      };
    }]);

})();