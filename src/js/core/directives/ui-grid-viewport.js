(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridViewport', ['gridUtil','ScrollEvent','uiGridConstants',
    function(gridUtil, ScrollEvent, uiGridConstants) {
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

              if (xDiff > 0) { grid.scrollDirection = uiGridConstants.scrollDirection.RIGHT; }
              if (xDiff < 0) { grid.scrollDirection = uiGridConstants.scrollDirection.LEFT; }

              var horizScrollLength = (colContainer.getCanvasWidth() - colContainer.getViewportWidth());
              if (horizScrollLength !== 0) {
                horizScrollPercentage = newScrollLeft / horizScrollLength;
              }
              else {
                horizScrollPercentage = 0;
              }

              colContainer.adjustScrollHorizontal(newScrollLeft, horizScrollPercentage);
            }

            if (newScrollTop !== rowContainer.prevScrollTop) {
              grid.flagScrollingVertically();
              var yDiff = newScrollTop - rowContainer.prevScrollTop;

              if (yDiff > 0 ) { grid.scrollDirection = uiGridConstants.scrollDirection.DOWN; }
              if (yDiff < 0 ) { grid.scrollDirection = uiGridConstants.scrollDirection.UP; }

              var vertScrollLength = rowContainer.getVerticalScrollLength();

              vertScrollPercentage = newScrollTop / vertScrollLength;

              if (vertScrollPercentage > 1) { vertScrollPercentage = 1; }
              if (vertScrollPercentage < 0) { vertScrollPercentage = 0; }
              
              rowContainer.adjustScrollVertical(newScrollTop, vertScrollPercentage);
            }

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
          });
        },
        controller: ['$scope', function ($scope) {
          this.rowStyle = function (index) {
            var rowContainer = $scope.rowContainer;
            var colContainer = $scope.colContainer;

            var styles = {};

            if (index === 0 && rowContainer.currentTopRow !== 0) {
              // The row offset-top is just the height of the rows above the current top-most row, which are no longer rendered
              var hiddenRowWidth = (rowContainer.currentTopRow) * rowContainer.grid.options.rowHeight;

              // return { 'margin-top': hiddenRowWidth + 'px' };
              styles['margin-top'] = hiddenRowWidth + 'px';
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