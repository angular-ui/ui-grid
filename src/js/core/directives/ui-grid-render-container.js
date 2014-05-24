(function () {
  'use strict';
  
  angular.module('ui.grid').directive('uiGridRenderContainer', ['$log', '$document', '$timeout', 'uiGridConstants', 'gridUtil',
    function($log, $document, $timeout, uiGridConstants, GridUtil) {
    return {
      replace: true,
      templateUrl: 'ui-grid/uiGridRenderContainer',
      require: '?^uiGrid',
      scope: {
        container: '=uiGridRenderContainer',
        bindScrollLeft: '=',
        bindScrollRight: '='
      },
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        // Verify that the render container for this element exists
        if (!$scope.container) {
          throw "No render container specified";
        }

        if (!uiGridCtrl.grid.renderContainers[$scope.container]) {
          throw "Render container '" + $scope.container + "' is not registered.";
        }

        var grid = uiGridCtrl.grid;
        var container = uiGridCtrl.grid.renderContainers[$scope.container];

        // Bind to left-scroll events
        if ($scope.bindScrollLeft) {
          
        }

        var scrollUnbinder = $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
          // GridUtil.requestAnimationFrame(function() {
          container.prevScrollArgs = args;

          // Vertical scroll
          if (args.y) {
            var scrollLength = (grid.getCanvasHeight() - grid.getViewportHeight());

            // Add the height of the native horizontal scrollbar, if it's there. Otherwise it will mask over the final row
            if (uiGridCtrl.grid.horizontalScrollbarHeight && uiGridCtrl.grid.horizontalScrollbarHeight > 0) {
              scrollLength = scrollLength + uiGridCtrl.grid.horizontalScrollbarHeight;
            }

            var oldScrollTop = uiGridCtrl.viewport[0].scrollTop;
            
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
            
            // NOTE: uiGridBody catches this in its 'scroll' event handler. setting scrollTop fires a scroll event
            // uiGridCtrl.adjustScrollVertical(newScrollTop, scrollYPercentage);

            uiGridCtrl.viewport[0].scrollTop = newScrollTop;
            
            uiGridCtrl.grid.options.offsetTop = newScrollTop;

            uiGridCtrl.prevScrollArgs.y.pixels = newScrollTop - oldScrollTop;
          }
        });

        function update() {

        }

        // TODO(c0bra): Handle resizing the inner canvas based on the number of elements
        uiGridCtrl.grid.registerStyleComputation({
          priority: 6,
          func: update
        });
      }
    };

  }]);

})();