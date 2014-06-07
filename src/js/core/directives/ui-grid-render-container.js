(function () {
  'use strict';

  var module = angular.module('ui.grid');
  
  module.directive('uiGridRenderContainer', ['$log', '$timeout', 'uiGridConstants', 'gridUtil',
    function($log, $timeout, uiGridConstants, GridUtil) {
    return {
      replace: true,
      transclude: true,
      templateUrl: 'ui-grid/uiGridRenderContainer',
      require: ['^uiGrid', 'uiGridRenderContainer'],
      scope: {
        containerName: '=containerName',
        bindScrollHorizontal: '=',
        bindScrollVertical: '='
      },
      controller: 'uiGridRenderContainer',
      compile: function () {
        return {
          pre: function prelink($scope, $elm, $attrs, controllers) {
            $log.debug('render container pre-link');

            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            var grid = $scope.grid = uiGridCtrl.grid;

            // Verify that the render container for this element exists
            if (!$scope.containerName) {
              throw "No render container name specified";
            }

            if (!grid.renderContainers[$scope.containerName]) {
              throw "Render container '" + $scope.containerName + "' is not registered.";
            }

            var container = grid.renderContainers[$scope.containerName];

            containerCtrl.container = container;
            containerCtrl.containerName = $scope.containerName;
          },
          post: function postlink($scope, $elm, $attrs, controllers) {
            $log.debug('render container post-link');

            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            var grid = uiGridCtrl.grid;
            var container = containerCtrl.container;

            // Put the container name on this element as a class
            $elm.addClass('ui-grid-render-container-' + $scope.containerName);

            // Bind to left/right-scroll events
            if ($scope.bindScrollHorizontal || $scope.bindScrollVertical) {
              $scope.$on(uiGridConstants.events.GRID_SCROLL, scrollHandler);
            }

            function scrollHandler (evt, args) {
              container.prevScrollArgs = args;

              // Vertical scroll
              if (args.y && $scope.bindScrollVertical) {
                var scrollLength = (container.getCanvasHeight() - container.getViewportHeight());

                // Add the height of the native horizontal scrollbar, if it's there. Otherwise it will mask over the final row
                if (grid.horizontalScrollbarHeight && grid.horizontalScrollbarHeight > 0) {
                  scrollLength = scrollLength + grid.horizontalScrollbarHeight;
                }

                var oldScrollTop = containerCtrl.viewport[0].scrollTop;
                
                var scrollYPercentage;
                if (typeof(args.y.percentage) !== 'undefined' && args.y.percentage !== undefined) {
                  scrollYPercentage = args.y.percentage;
                }
                else if (typeof(args.y.pixels) !== 'undefined' && args.y.pixels !== undefined) {
                  scrollYPercentage = args.y.percentage = (oldScrollTop + args.y.pixels) / scrollLength;
                  // $log.debug('y.percentage', args.y.percentage);
                }
                else {
                  throw new Error("No percentage or pixel value provided for scroll event Y axis");
                }

                var newScrollTop = Math.max(0, scrollYPercentage * scrollLength);

                containerCtrl.viewport[0].scrollTop = newScrollTop;
                
                // TOOD(c0bra): what's this for?
                // grid.options.offsetTop = newScrollTop;

                container.prevScrollArgs.y.pixels = newScrollTop - oldScrollTop;
              }

              // Horizontal scroll
              if (args.x && $scope.bindScrollHorizontal) {
                var scrollWidth = (container.getCanvasWidth() - container.getViewportWidth());

                var oldScrollLeft = containerCtrl.viewport[0].scrollLeft;

                var scrollXPercentage;
                if (typeof(args.x.percentage) !== 'undefined' && args.x.percentage !== undefined) {
                  scrollXPercentage = args.x.percentage;
                }
                else if (typeof(args.x.pixels) !== 'undefined' && args.x.pixels !== undefined) {
                  scrollXPercentage = args.x.percentage = (oldScrollLeft + args.x.pixels) / scrollWidth;
                }
                else {
                  throw new Error("No percentage or pixel value provided for scroll event X axis");
                }

                var newScrollLeft = Math.max(0, scrollXPercentage * scrollWidth);
                
                // uiGridCtrl.adjustScrollHorizontal(newScrollLeft, scrollXPercentage);

                containerCtrl.viewport[0].scrollLeft = newScrollLeft;

                if (containerCtrl.headerViewport) {
                  containerCtrl.headerViewport.scrollLeft = newScrollLeft;
                }

                // uiGridCtrl.grid.options.offsetLeft = newScrollLeft;

                container.prevScrollArgs.x.pixels = newScrollLeft - oldScrollLeft;
              }
            }

            // Scroll the render container viewport when the mousewheel is used
            $elm.bind('wheel mousewheel DomMouseScroll MozMousePixelScroll', function(evt) {
              // use wheelDeltaY
              evt.preventDefault();

              var newEvent = GridUtil.normalizeWheelEvent(evt);

              var args = { target: $elm };
              if (newEvent.deltaY !== 0) {
                var scrollYAmount = newEvent.deltaY * -120;

                // Get the scroll percentage
                var scrollYPercentage = (containerCtrl.viewport[0].scrollTop + scrollYAmount) / (container.getCanvasHeight() - container.getViewportHeight());

                // Keep scrollPercentage within the range 0-1.
                if (scrollYPercentage < 0) { scrollYPercentage = 0; }
                else if (scrollYPercentage > 1) { scrollYPercentage = 1; }

                args.y = { percentage: scrollYPercentage, pixels: scrollYAmount };
              }
              if (newEvent.deltaX !== 0) {
                var scrollXAmount = newEvent.deltaX * -120;

                // Get the scroll percentage
                var scrollXPercentage = (containerCtrl.viewport[0].scrollLeft + scrollXAmount) / (container.getCanvasWidth() - container.getViewportWidth());

                // Keep scrollPercentage within the range 0-1.
                if (scrollXPercentage < 0) { scrollXPercentage = 0; }
                else if (scrollXPercentage > 1) { scrollXPercentage = 1; }

                args.x = { percentage: scrollXPercentage, pixels: scrollXAmount };
              }

              // $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);

              uiGridCtrl.fireScrollingEvent(args);
            });
            
            // TODO(c0bra): Handle resizing the inner canvas based on the number of elements
            function update() {
              var ret = '';

              var canvasWidth = container.getCanvasWidth();
              var viewportWidth = container.getViewportWidth();

              var canvasHeight = container.getCanvasHeight();
              var viewportHeight = container.getViewportHeight();

              var headerViewportWidth = container.getHeaderViewportWidth();
              
              // Set canvas dimensions
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerName + ' .ui-grid-canvas { width: ' + canvasWidth + 'px; height: ' + canvasHeight + 'px; }';
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerName + ' .ui-grid-header-canvas { width: ' + canvasWidth + 'px; }';
              
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerName + ' .ui-grid-viewport { width: ' + viewportWidth + 'px; height: ' + viewportHeight + 'px; }';
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerName + ' .ui-grid-header-viewport { width: ' + headerViewportWidth + 'px; }';

              // Update 

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

  module.controller('uiGridRenderContainer', ['$scope', function ($scope) {
    var self = this;
  }]);

})();