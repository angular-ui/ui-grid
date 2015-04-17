(function () {
  'use strict';

  var module = angular.module('ui.grid');
  
  module.directive('uiGridRenderContainer', ['$timeout', '$document', 'uiGridConstants', 'gridUtil', 'ScrollEvent',
    function($timeout, $document, uiGridConstants, gridUtil, ScrollEvent) {
    return {
      replace: true,
      transclude: true,
      templateUrl: 'ui-grid/uiGridRenderContainer',
      require: ['^uiGrid', 'uiGridRenderContainer'],
      scope: {
        containerId: '=',
        rowContainerName: '=',
        colContainerName: '=',
        bindScrollHorizontal: '=',
        bindScrollVertical: '=',
        enableVerticalScrollbar: '=',
        enableHorizontalScrollbar: '='
      },
      controller: 'uiGridRenderContainer as RenderContainer',
      compile: function () {
        return {
          pre: function prelink($scope, $elm, $attrs, controllers) {

            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];
            var grid = $scope.grid = uiGridCtrl.grid;

            // Verify that the render container for this element exists
            if (!$scope.rowContainerName) {
              throw "No row render container name specified";
            }
            if (!$scope.colContainerName) {
              throw "No column render container name specified";
            }

            if (!grid.renderContainers[$scope.rowContainerName]) {
              throw "Row render container '" + $scope.rowContainerName + "' is not registered.";
            }
            if (!grid.renderContainers[$scope.colContainerName]) {
              throw "Column render container '" + $scope.colContainerName + "' is not registered.";
            }

            var rowContainer = $scope.rowContainer = grid.renderContainers[$scope.rowContainerName];
            var colContainer = $scope.colContainer = grid.renderContainers[$scope.colContainerName];
            
            containerCtrl.containerId = $scope.containerId;
            containerCtrl.rowContainer = rowContainer;
            containerCtrl.colContainer = colContainer;
          },
          post: function postlink($scope, $elm, $attrs, controllers) {

            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            var grid = uiGridCtrl.grid;
            var rowContainer = containerCtrl.rowContainer;
            var colContainer = containerCtrl.colContainer;
            var scrollTop = null;
            var scrollLeft = null;


            var renderContainer = grid.renderContainers[$scope.containerId];

            // Put the container name on this element as a class
            $elm.addClass('ui-grid-render-container-' + $scope.containerId);

            // Scroll the render container viewport when the mousewheel is used
            gridUtil.on.mousewheel($elm, function (event) {
              var scrollEvent = new ScrollEvent(grid, rowContainer, colContainer, ScrollEvent.Sources.RenderContainerMouseWheel);
              if (event.deltaY !== 0) {
                var scrollYAmount = event.deltaY * -1 * event.deltaFactor;

                scrollTop = containerCtrl.viewport[0].scrollTop;
                // Get the scroll percentage
                var scrollYPercentage = (scrollTop + scrollYAmount) / rowContainer.getVerticalScrollLength();

                // Keep scrollPercentage within the range 0-1.
                if (scrollYPercentage < 0) { scrollYPercentage = 0; }
                else if (scrollYPercentage > 1) { scrollYPercentage = 1; }

                scrollEvent.y = { percentage: scrollYPercentage, pixels: scrollYAmount };
              }
              if (event.deltaX !== 0) {
                var scrollXAmount = event.deltaX * event.deltaFactor;

                // Get the scroll percentage
                scrollLeft = gridUtil.normalizeScrollLeft(containerCtrl.viewport, grid);
                var scrollXPercentage = (scrollLeft + scrollXAmount) / (colContainer.getCanvasWidth() - colContainer.getViewportWidth());

                // Keep scrollPercentage within the range 0-1.
                if (scrollXPercentage < 0) { scrollXPercentage = 0; }
                else if (scrollXPercentage > 1) { scrollXPercentage = 1; }

                scrollEvent.x = { percentage: scrollXPercentage, pixels: scrollXAmount };
              }

              // Let the parent container scroll if the grid is already at the top/bottom
              if (scrollEvent.atTop(scrollTop) ||
                scrollEvent.atBottom(scrollTop) ||
                scrollEvent.atLeft(scrollLeft) ||
                scrollEvent.atRight(scrollLeft)) {
                //parent controller scrolls
              }
              else {
                event.preventDefault();
                scrollEvent.fireThrottledScrollingEvent('', scrollEvent);
              }

            });

            $elm.bind('$destroy', function() {
              $elm.unbind('keydown');

              ['touchstart', 'touchmove', 'touchend','keydown', 'wheel', 'mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'].forEach(function (eventName) {
                $elm.unbind(eventName);
              });
            });
            
            // TODO(c0bra): Handle resizing the inner canvas based on the number of elements
            function update() {
              var ret = '';

              var canvasWidth = colContainer.canvasWidth;
              var viewportWidth = colContainer.getViewportWidth();

              var canvasHeight = rowContainer.getCanvasHeight();

              //add additional height for scrollbar on left and right container
              if ($scope.containerId !== 'body') {
                canvasHeight += grid.scrollbarHeight;
              }

              var viewportHeight = rowContainer.getViewportHeight();

              var headerViewportWidth = colContainer.getHeaderViewportWidth();
              var footerViewportWidth = colContainer.getHeaderViewportWidth();
              
              // Set canvas dimensions
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-canvas { width: ' + canvasWidth + 'px; height: ' + canvasHeight + 'px; }';

              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-header-canvas { width: ' + (canvasWidth + grid.scrollbarWidth) + 'px; }';

              if (renderContainer.explicitHeaderCanvasHeight) {
                ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-header-canvas { height: ' + renderContainer.explicitHeaderCanvasHeight + 'px; }';
              }
              
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-viewport { width: ' + viewportWidth + 'px; height: ' + viewportHeight + 'px; }';
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-header-viewport { width: ' + headerViewportWidth + 'px; }';

              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-footer-canvas { width: ' + (canvasWidth + grid.scrollbarWidth) + 'px; }';
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-footer-viewport { width: ' + footerViewportWidth + 'px; }';

              return ret;
            }
            
            uiGridCtrl.grid.registerStyleComputation({
              priority: 6,
              func: update
            });
          }
        };
      }
    };

  }]);

  module.controller('uiGridRenderContainer', ['$scope', 'gridUtil', function ($scope, gridUtil) {
    
  }]);

})();
