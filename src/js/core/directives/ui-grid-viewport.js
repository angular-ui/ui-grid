(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridViewport', ['gridUtil','ScrollEvent',
    function(gridUtil, ScrollEvent) {
      return {
        replace: true,
        scope: {},
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

          $elm.on('scroll', function (evt) {
            var newScrollTop = $elm[0].scrollTop;
            // var newScrollLeft = $elm[0].scrollLeft;
            var newScrollLeft = gridUtil.normalizeScrollLeft($elm);
            var horizScrollPercentage = -1;
            var vertScrollPercentage = -1;

            // Handle RTL here

            if (newScrollLeft !== colContainer.prevScrollLeft) {
              grid.flagScrollingHorizontally();
              var xDiff = newScrollLeft - colContainer.prevScrollLeft;

              var horizScrollLength = (colContainer.getCanvasWidth() - colContainer.getViewportWidth());
              horizScrollPercentage = newScrollLeft / horizScrollLength;

              colContainer.adjustScrollHorizontal(newScrollLeft, horizScrollPercentage);
            }

            if (newScrollTop !== rowContainer.prevScrollTop) {
              grid.flagScrollingVertically();
              var yDiff = newScrollTop - rowContainer.prevScrollTop;

              // uiGridCtrl.fireScrollingEvent({ y: { pixels: diff } });
              var vertScrollLength = rowContainer.getVerticalScrollLength();
              // var vertScrollPercentage = (uiGridCtrl.prevScrollTop + yDiff) / vertScrollLength;
              vertScrollPercentage = newScrollTop / vertScrollLength;

              if (vertScrollPercentage > 1) { vertScrollPercentage = 1; }
              if (vertScrollPercentage < 0) { vertScrollPercentage = 0; }
              
              rowContainer.adjustScrollVertical(newScrollTop, vertScrollPercentage);
            }

        //    if ( !$scope.grid.isScrollingVertically && !$scope.grid.isScrollingHorizontally ){
              // viewport scroll that didn't come from fireScrollEvent, so fire a scroll to keep
              // the header in sync
              var scrollEvent = new ScrollEvent(grid, rowContainer, colContainer, ScrollEvent.Sources.ViewPortScroll);
              scrollEvent.newScrollLeft = newScrollLeft;
              scrollEvent.newScrollTop = newScrollTop;
              if ( horizScrollPercentage > -1 ){
                scrollEvent.x = { percentage: horizScrollPercentage };
              }

              if ( vertScrollPercentage > -1 ){
                scrollEvent.y = { percentage: vertScrollPercentage };
              }
              scrollEvent.fireScrollingEvent();
       //     }
          });
        }
      };
    }
  ]);

})();