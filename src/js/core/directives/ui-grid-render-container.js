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
      link: function ($scope, $elm, $attrs, controllers) {
        var uiGridCtrl = controllers[0];
        var containerCtrl = controllers[1];

        // Verify that the render container for this element exists
        if (!$scope.containerName) {
          throw "No render container name specified";
        }

        if (!uiGridCtrl.grid.renderContainers[$scope.containerName]) {
          throw "Render container '" + $scope.containerName + "' is not registered.";
        }

        var grid = $scope.grid = uiGridCtrl.grid;
        var container = grid.renderContainers[$scope.containerName];

        containerCtrl.container = container;
        containerCtrl.containerName = $scope.containerName;

        // Bind to left/right-scroll events
        if ($scope.bindScrollHorizontal || $scope.bindScrollVertical) {
          $scope.$on(uiGridConstants.events.GRID_SCROLL, scrollHandler);
        }

        function scrollHandler (evt, args) {
          container.prevScrollArgs = args;

          // Vertical scroll
          if (args.y) {
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

            containerCtrl.prevScrollArgs.y.pixels = newScrollTop - oldScrollTop;
          }

          // Horizontal scroll
          if (args.x) {
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
        
        // TODO(c0bra): Handle resizing the inner canvas based on the number of elements
        function update() {
          // TODO(c0bra): set canvas width based on sum of columnCache widths

          // TODO(c0bra): set viewport vidth based on sum of visibleColumnCache widths, up to max-width or uiGridCtrl.gridWidth, whichever is lower

          // TODO(c0bra): set canvas height based on sum of rowCache heights

          // TODO(c0bra): set viewport height based on sum of rowCache heights, , up to max-height or uiGridCtrl.gridHeight, whichever is lower
        }
        
        uiGridCtrl.grid.registerStyleComputation({
          priority: 6,
          func: update
        });
      }
    };

  }]);

  module.controller('uiGridRenderContainer', ['$scope', function ($scope) {
    var self = this;
    

  }]);

})();