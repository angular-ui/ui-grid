(function () {
// 'use strict';

  angular.module('ui.grid').directive('uiGridNativeScrollbar', ['$timeout', '$document', 'uiGridConstants', 'gridUtil',
    function ($timeout, $document, uiGridConstants, gridUtil) {
    var scrollBarWidth = gridUtil.getScrollbarWidth();

    // scrollBarWidth = scrollBarWidth > 0 ? scrollBarWidth : 17;
    if (!angular.isNumber(scrollBarWidth)) {
      scrollBarWidth = 0;
    }

    // If the browser is IE, add 1px to the scrollbar container, otherwise scroll events won't work right (in IE11 at least)
    var browser = gridUtil.detectBrowser();
    if (browser === 'ie') {
      scrollBarWidth = scrollBarWidth + 1;
    }

    return {
      scope: {
        type: '@'
      },
      require: ['^uiGrid', '^uiGridRenderContainer'],
      link: function ($scope, $elm, $attrs, controllers) {
        var uiGridCtrl = controllers[0];
        var containerCtrl = controllers[1];
        var rowContainer = containerCtrl.rowContainer;
        var colContainer = containerCtrl.colContainer;
        var grid = uiGridCtrl.grid;

        var contents = angular.element('<div class="contents">&nbsp;</div>');

        $elm.addClass('ui-grid-native-scrollbar');

        var previousScrollPosition;

        var elmMaxScroll = 0;

        if ($scope.type === 'vertical') {
          // Update the width based on native scrollbar width
          $elm.css('width', scrollBarWidth + 'px');

          $elm.addClass('vertical');

          grid.verticalScrollbarWidth = grid.options.enableVerticalScrollbar === uiGridConstants.scrollbars.WHEN_NEEDED ? 0 : scrollBarWidth;
          colContainer.verticalScrollbarWidth = grid.verticalScrollbarWidth;

          // Save the initial scroll position for use in scroll events
          previousScrollPosition = $elm[0].scrollTop;
        }
        else if ($scope.type === 'horizontal') {
          // Update the height based on native scrollbar height
          $elm.css('height', scrollBarWidth + 'px');

          $elm.addClass('horizontal');

          // Save this scrollbar's dimension in the grid properties
          grid.horizontalScrollbarHeight = grid.options.enableHorizontalScrollbar === uiGridConstants.scrollbars.WHEN_NEEDED ? 0 : scrollBarWidth;
          rowContainer.horizontalScrollbarHeight = grid.horizontalScrollbarHeight;

          // Save the initial scroll position for use in scroll events
          previousScrollPosition = gridUtil.normalizeScrollLeft($elm);
        }

        // Save the contents elm inside the scrollbar elm so it sizes correctly
        $elm.append(contents);

        // Get the relevant element dimension now that the contents are in it
        if ($scope.type === 'vertical') {
          elmMaxScroll = gridUtil.elementHeight($elm);
        }
        else if ($scope.type === 'horizontal') {
          elmMaxScroll = gridUtil.elementWidth($elm);
        }

        function updateNativeVerticalScrollbar() {
          // Get the height that the scrollbar should have
          var height = rowContainer.getViewportHeight();

          // Update the vertical scrollbar's content height so it's the same as the canvas
          var contentHeight = rowContainer.getCanvasHeight();

          // TODO(c0bra): set scrollbar `top` by height of header row
          // var headerHeight = gridUtil.outerElementHeight(containerCtrl.header);
          var headerHeight = colContainer.headerHeight ? colContainer.headerHeight : grid.headerHeight;

          // gridUtil.logDebug('headerHeight in scrollbar', headerHeight);

          var ondemand  = grid.options.enableVerticalScrollbar === uiGridConstants.scrollbars.WHEN_NEEDED ? "overflow-y:auto;" : "";
          // var ret = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-native-scrollbar.vertical .contents { height: ' + h + 'px; }';
          var ret = '.grid' + grid.id + ' .ui-grid-render-container-' + containerCtrl.containerId + ' .ui-grid-native-scrollbar.vertical .contents { height: ' + contentHeight + 'px; }';
          ret += '\n .grid' + grid.id + ' .ui-grid-render-container-' + containerCtrl.containerId + ' .ui-grid-native-scrollbar.vertical { height: ' + height + 'px; top: ' + headerHeight + 'px;' +ondemand +'}';

          elmMaxScroll = contentHeight;

          return ret;
        }

        // Get the grid's bottom border height (TODO(c0bra): need to account for footer here!)
        var gridElm = gridUtil.closestElm($elm, '.ui-grid');
        var gridBottomBorder = gridUtil.getBorderSize(gridElm, 'bottom');

        function updateNativeHorizontalScrollbar() {
          var w = colContainer.getCanvasWidth();

          var bottom = gridBottomBorder;
          if (grid.options.showFooter) {
            bottom -= 1;
          }
          var ondemand = grid.options.enableHorizontalScrollbar === uiGridConstants.scrollbars.WHEN_NEEDED ? "overflow-x:auto" : "";
          var ret = '.grid' + grid.id + ' .ui-grid-render-container-' + containerCtrl.containerId + ' .ui-grid-native-scrollbar.horizontal { bottom: ' + bottom + 'px;' +ondemand + ' }';
          ret += '.grid' + grid.id + ' .ui-grid-render-container-' + containerCtrl.containerId + ' .ui-grid-native-scrollbar.horizontal .contents { width: ' + w + 'px; }';

          elmMaxScroll = w;

          return ret;
        }

        // NOTE: priority 6 so they run after the column widths update, which in turn update the canvas width
        if ($scope.type === 'vertical') {
          grid.registerStyleComputation({
            priority: 6,
            func: updateNativeVerticalScrollbar
          });
        }
        else if ($scope.type === 'horizontal') {
          grid.registerStyleComputation({
            priority: 6,
            func: updateNativeHorizontalScrollbar
          });
        }


        $scope.scrollSource = null;

        function scrollEvent(evt) {
          if ($scope.type === 'vertical') {
            grid.flagScrollingVertically();
            var newScrollTop = $elm[0].scrollTop;

            var yDiff = previousScrollPosition - newScrollTop;

            var vertScrollLength = (rowContainer.getCanvasHeight() - rowContainer.getViewportHeight());

            // Subtract the h. scrollbar height from the vertical length if it's present
            if (grid.horizontalScrollbarHeight && grid.horizontalScrollbarHeight > 0) {
              vertScrollLength = vertScrollLength - uiGridCtrl.grid.horizontalScrollbarHeight;
            }

            var vertScrollPercentage = newScrollTop / vertScrollLength;

            if (vertScrollPercentage > 1) {
              vertScrollPercentage = 1;
            }
            if (vertScrollPercentage < 0) {
              vertScrollPercentage = 0;
            }

            var yArgs = {
              target: $elm,
              y: {
                percentage: vertScrollPercentage
              }
            };

            // If the source of this scroll is defined (i.e., not us, then don't fire the scroll event because we'll be re-triggering)
            if (!$scope.scrollSource) {
              uiGridCtrl.fireScrollingEvent(yArgs);
            }
            else {
              // Reset the scroll source for the next scroll event
              $scope.scrollSource = null;
            }

            previousScrollPosition = newScrollTop;
          }
          else if ($scope.type === 'horizontal') {
            grid.flagScrollingHorizontally();
            // var newScrollLeft = $elm[0].scrollLeft;
            var newScrollLeft = gridUtil.normalizeScrollLeft($elm);

            var xDiff = previousScrollPosition - newScrollLeft;

            var horizScrollLength = (colContainer.getCanvasWidth() - colContainer.getViewportWidth());
            var horizScrollPercentage = newScrollLeft / horizScrollLength;

            var xArgs = {
              target: $elm,
              x: {
                percentage: horizScrollPercentage
              }
            };

            // If the source of this scroll is defined (i.e., not us, then don't fire the scroll event because we'll be re-triggering)
            if (!$scope.scrollSource) {
              uiGridCtrl.fireScrollingEvent(xArgs);
            }
            else {
              // Reset the scroll source for the next scroll event
              $scope.scrollSource = null;
            }

            previousScrollPosition = newScrollLeft;
          }
        }

        $elm.on('scroll', scrollEvent);

        $elm.on('$destroy', function () {
          $elm.off('scroll');
        });

        function gridScroll(evt, args) {
          // Don't listen to our own scroll event!
          if (args.target && (args.target === $elm || angular.element(args.target).hasClass('ui-grid-native-scrollbar'))) {
            return;
          }

          // Set the source of the scroll event in our scope so it's available in our 'scroll' event handler
          $scope.scrollSource = args.target;

          if ($scope.type === 'vertical') {
            if (args.y && typeof(args.y.percentage) !== 'undefined' && args.y.percentage !== undefined) {
              grid.flagScrollingVertically();
              var vertScrollLength = (rowContainer.getCanvasHeight() - rowContainer.getViewportHeight());

              var newScrollTop = Math.max(0, args.y.percentage * vertScrollLength);

              $elm[0].scrollTop = newScrollTop;


            }
          }
          else if ($scope.type === 'horizontal') {
            if (args.x && typeof(args.x.percentage) !== 'undefined' && args.x.percentage !== undefined) {
              grid.flagScrollingHorizontally();
              var horizScrollLength = (colContainer.getCanvasWidth() - colContainer.getViewportWidth());

              var newScrollLeft = Math.max(0, args.x.percentage * horizScrollLength);

              // $elm[0].scrollLeft = newScrollLeft;
              $elm[0].scrollLeft = gridUtil.denormalizeScrollLeft($elm, newScrollLeft);
            }
          }
        }

        var gridScrollDereg = $scope.$on(uiGridConstants.events.GRID_SCROLL, gridScroll);
        $scope.$on('$destroy', gridScrollDereg);



      }
    };
  }]);
})();