(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridViewport', ['gridUtil','ScrollEvent','uiGridConstants', '$log',
    function(gridUtil, ScrollEvent, uiGridConstants, $log) {
      return {
        replace: true,
        scope: {},
        controllerAs: 'Viewport',
        templateUrl: 'ui-grid/uiGridViewport',
        require: ['^uiGrid', '^uiGridRenderContainer'],
        link: function($scope, $elm, $attrs, controllers) {
          // gridUtil.logDebug('viewport post-link');

          var uiGridCtrl = controllers[0];
          var containerCtrl = controllers[1];

          $scope.containerCtrl = containerCtrl;

          var rowContainer = containerCtrl.rowContainer;
          var colContainer = containerCtrl.colContainer;

          var grid = uiGridCtrl.grid;

          $scope.grid = uiGridCtrl.grid;

          // Put the containers in scope so we can get rows and columns from them
          $scope.rowContainer = containerCtrl.rowContainer;
          $scope.colContainer = containerCtrl.colContainer;

          // Register this viewport with its container
          containerCtrl.viewport = $elm;

          /**
           * @ngdoc function
           * @name customScroller
           * @methodOf ui.grid.class:GridOptions
           * @description (optional) uiGridViewport.on('scroll', scrollHandler) by default.
           * A function that allows you to provide your own scroller function. It is particularly helpful if you want to use third party scrollers
           * as this allows you to do that.
           *
           * <div class="alert alert-info" role="alert"> <strong>NOTE:</strong> It is important to remember to always pass in an event object to
           * the scrollHandler as the grid scrolling behavior will break without it.</div>
           * <h5>Example</h5>
           * <pre>
           *   $scope.gridOptions = {
           *       customScroller: function myScrolling(uiGridViewport, scrollHandler) {
           *           uiGridViewport.on('scroll', function myScrollingOverride(event) {
           *               // Do something here
           *
           *               scrollHandler(event);
           *           });
           *       }
           *   };
           * </pre>
           * @param {object} uiGridViewport Element being scrolled. (this gets passed in by the grid).
           * @param {function} scrollHandler Function that needs to be called when scrolling happens. (this gets passed in by the grid).
           */
          if (grid && grid.options && grid.options.customScroller) {
            grid.options.customScroller($elm, scrollHandler);
          } else {
            $elm.on('scroll', scrollHandler);
          }

          var ignoreScroll = false;

          function scrollHandler(evt) {
            //Leaving in this commented code in case it can someday be used
            //It does improve performance, but because the horizontal scroll is normalized,
            //  using this code will lead to the column header getting slightly out of line with columns
            //
            //if (ignoreScroll && (grid.isScrollingHorizontally || grid.isScrollingHorizontally)) {
            //  //don't ask for scrollTop if we just set it
            //  ignoreScroll = false;
            //  return;
            //}
            //ignoreScroll = true;

            var newScrollTop = $elm[0].scrollTop;
            var newScrollLeft = gridUtil.normalizeScrollLeft($elm, grid);

            var vertScrollPercentage = rowContainer.scrollVertical(newScrollTop);
            var horizScrollPercentage = colContainer.scrollHorizontal(newScrollLeft);

            var scrollEvent = new ScrollEvent(grid, rowContainer, colContainer, ScrollEvent.Sources.ViewPortScroll);
            scrollEvent.newScrollLeft = newScrollLeft;
            scrollEvent.newScrollTop = newScrollTop;
            if ( horizScrollPercentage > -1 ){
              scrollEvent.x = { percentage: horizScrollPercentage };
            }

            if ( vertScrollPercentage > -1 ){
              scrollEvent.y = { percentage: vertScrollPercentage };
            }

            grid.scrollContainers($scope.$parent.containerId, scrollEvent);
          }

          if ($scope.$parent.bindScrollVertical) {
            grid.addVerticalScrollSync($scope.$parent.containerId, syncVerticalScroll);
          }

          if ($scope.$parent.bindScrollHorizontal) {
            grid.addHorizontalScrollSync($scope.$parent.containerId, syncHorizontalScroll);
            grid.addHorizontalScrollSync($scope.$parent.containerId + 'header', syncHorizontalHeader);
            grid.addHorizontalScrollSync($scope.$parent.containerId + 'footer', syncHorizontalFooter);
          }

          function syncVerticalScroll(scrollEvent){
            containerCtrl.prevScrollArgs = scrollEvent;
            var newScrollTop = scrollEvent.getNewScrollTop(rowContainer,containerCtrl.viewport);
            $elm[0].scrollTop = newScrollTop;

          }

          function syncHorizontalScroll(scrollEvent){
            containerCtrl.prevScrollArgs = scrollEvent;
            var newScrollLeft = scrollEvent.getNewScrollLeft(colContainer, containerCtrl.viewport);
            $elm[0].scrollLeft =  gridUtil.denormalizeScrollLeft(containerCtrl.viewport,newScrollLeft, grid);
          }

          function syncHorizontalHeader(scrollEvent){
            var newScrollLeft = scrollEvent.getNewScrollLeft(colContainer, containerCtrl.viewport);
            if (containerCtrl.headerViewport) {
              containerCtrl.headerViewport.scrollLeft = gridUtil.denormalizeScrollLeft(containerCtrl.viewport,newScrollLeft, grid);
            }
          }

          function syncHorizontalFooter(scrollEvent){
            var newScrollLeft = scrollEvent.getNewScrollLeft(colContainer, containerCtrl.viewport);
            if (containerCtrl.footerViewport) {
              containerCtrl.footerViewport.scrollLeft =  gridUtil.denormalizeScrollLeft(containerCtrl.viewport,newScrollLeft, grid);
            }
          }

          $scope.$on('$destroy', function unbindEvents() {
            $elm.off();
          });
        },
        controller: ['$scope', function ($scope) {
          this.rowStyle = function (index) {
            var rowContainer = $scope.rowContainer;
            var colContainer = $scope.colContainer;

            var styles = {};

            if (rowContainer.currentTopRow !== 0){
              //top offset based on hidden rows count
              var translateY = "translateY("+ (rowContainer.currentTopRow * rowContainer.grid.options.rowHeight)  +"px)";
              styles['transform'] = translateY;
              styles['-webkit-transform'] = translateY;
              styles['-ms-transform'] = translateY;
            }

            if (colContainer.currentFirstColumn !== 0) {
              if (colContainer.grid.isRTL()) {
                styles['margin-right'] = colContainer.columnOffset + 'px';
              }
              else {
                styles['margin-left'] = colContainer.columnOffset + 'px';
              }
            }

            return styles;
          };
        }]
      };
    }
  ]);

})();
