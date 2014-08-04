(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridBody', ['$log', '$document', '$timeout', 'uiGridConstants', 'gridUtil',
    function($log, $document, $timeout, uiGridConstants, GridUtil) {
    return {
      replace: true,
      transclude: true,
      // priority: 1000,
      templateUrl: 'ui-grid/ui-grid-body',
      require: '?^uiGrid',
      scope: false,
      link: function($scope, $elm, $attrs, uiGridCtrl) {
        if (uiGridCtrl === undefined) {
          throw new Error('[ui-grid-body] uiGridCtrl is undefined!');
        }

        $log.debug('ui-grid-body link');

        // Disable animations on the grid body so ngAnimate, if present, doesn't ruin performance by toggling classes on all the elements
        GridUtil.disableAnimations($elm);

        // Store the body in the controller
        uiGridCtrl.body = $elm;

        // Stick the canvas in the controller
        uiGridCtrl.canvas = angular.element( $elm[0].getElementsByClassName('ui-grid-canvas')[0] );
        // uiGridCtrl.viewport = elm; //angular.element( elm[0].getElementsByClassName('ui-grid-viewport')[0] );
        uiGridCtrl.viewport = angular.element( $elm[0].getElementsByClassName('ui-grid-viewport')[0] );

        uiGridCtrl.viewportOuterHeight = GridUtil.outerElementHeight(uiGridCtrl.viewport[0]);
        uiGridCtrl.viewportOuterWidth = GridUtil.outerElementWidth(uiGridCtrl.viewport[0]);

        // Explicitly set the viewport scrollTop to 0; Firefox apparently caches it
        uiGridCtrl.viewport[0].scrollTop = 0;
        uiGridCtrl.viewport[0].scrollLeft = 0;

        uiGridCtrl.prevScrollTop = 0;
        uiGridCtrl.prevScrolltopPercentage = 0;
        uiGridCtrl.prevScrollLeft = 0;
        uiGridCtrl.prevRowScrollIndex = 0;
        uiGridCtrl.prevColumnScrollIndex = 0;
        uiGridCtrl.currentTopRow = 0;
        uiGridCtrl.currentFirstColumn = 0;

        uiGridCtrl.adjustScrollVertical = function (scrollTop, scrollPercentage, force) {
          if (uiGridCtrl.prevScrollTop === scrollTop && !force) {
            return;
          }

          scrollTop = uiGridCtrl.grid.getCanvasHeight() * scrollPercentage;

          uiGridCtrl.adjustRows(scrollTop, scrollPercentage);

          uiGridCtrl.prevScrollTop = scrollTop;
          uiGridCtrl.prevScrolltopPercentage = scrollPercentage;

          $scope.grid.refreshCanvas();
        };

        uiGridCtrl.adjustRows = function(scrollTop, scrollPercentage) {
          var minRows = uiGridCtrl.grid.minRowsToRender();
          // var maxRowIndex = uiGridCtrl.grid.visibleRowCache.length - minRows;

          var rowCache = uiGridCtrl.grid.renderContainers.body.visibleRowCache;

          var maxRowIndex = rowCache.length - minRows;
          uiGridCtrl.maxRowIndex = maxRowIndex;

          var curRowIndex = uiGridCtrl.prevRowScrollIndex;

          // Calculate the scroll percentage according to the scrollTop location, if no percentage was provided
          if ((typeof(scrollPercentage) === 'undefined' || scrollPercentage === null) && scrollTop) {
            scrollPercentage = scrollTop / uiGridCtrl.grid.getCanvasHeight();
          }
          
          var rowIndex = Math.ceil(Math.min(maxRowIndex, maxRowIndex * scrollPercentage));

          // Define a max row index that we can't scroll past
          if (rowIndex > maxRowIndex) {
            rowIndex = maxRowIndex;
          }
          
          var newRange = [];
          if (rowCache.length > uiGridCtrl.grid.options.virtualizationThreshold) {
            // Have we hit the threshold going down?
            if (uiGridCtrl.prevScrollTop < scrollTop && rowIndex < uiGridCtrl.prevRowScrollIndex + uiGridCtrl.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }
            //Have we hit the threshold going up?
            if (uiGridCtrl.prevScrollTop > scrollTop && rowIndex > uiGridCtrl.prevRowScrollIndex - uiGridCtrl.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }

            var rangeStart = Math.max(0, rowIndex - uiGridCtrl.grid.options.excessRows);
            var rangeEnd = Math.min(rowCache.length, rowIndex + minRows + uiGridCtrl.grid.options.excessRows);

            newRange = [rangeStart, rangeEnd];
          }
          else {
            var maxLen = uiGridCtrl.grid.rows.length;
            newRange = [0, Math.max(maxLen, minRows + uiGridCtrl.grid.options.excessRows)];
          }
          
          updateViewableRowRange(newRange);
          uiGridCtrl.prevRowScrollIndex = rowIndex;
        };

        uiGridCtrl.redrawRows = function redrawRows() {
          uiGridCtrl.adjustRows(uiGridCtrl.prevScrollTop, uiGridCtrl.prevScrolltopPercentage);
        };

        uiGridCtrl.redrawColumns = function redrawColumns() {
          uiGridCtrl.adjustColumns(uiGridCtrl.prevScrollLeft, uiGridCtrl.prevScrollleftPercentage);
        };

        uiGridCtrl.redraw = function redraw() {
          uiGridCtrl.redrawRows();
          uiGridCtrl.redrawColumns();
        };

        // Virtualization for horizontal scrolling
        uiGridCtrl.adjustScrollHorizontal = function (scrollLeft, scrollPercentage, force) {
          if (uiGridCtrl.prevScrollLeft === scrollLeft && !force) {
            return;
          }

          // scrollLeft = uiGridCtrl.canvas[0].scrollWidth * scrollPercentage;
          scrollLeft = uiGridCtrl.grid.getCanvasWidth() * scrollPercentage;

          uiGridCtrl.adjustColumns(scrollLeft, scrollPercentage);

          uiGridCtrl.prevScrollLeft = scrollLeft;
          uiGridCtrl.prevScrollleftPercentage = scrollPercentage;

          $scope.grid.refreshCanvas();
        };

        uiGridCtrl.adjustColumns = function(scrollLeft, scrollPercentage) {
          var minCols = uiGridCtrl.grid.minColumnsToRender();

          var columnCache = uiGridCtrl.grid.renderContainers.body.visibleColumnCache;
          var maxColumnIndex = columnCache.length - minCols;

          uiGridCtrl.maxColumnIndex = maxColumnIndex;

          // Calculate the scroll percentage according to the scrollTop location, if no percentage was provided
          if ((typeof(scrollPercentage) === 'undefined' || scrollPercentage === null) && scrollLeft) {
            scrollPercentage = scrollLeft / uiGridCtrl.grid.getCanvasWidth();
          }

          var colIndex = Math.ceil(Math.min(maxColumnIndex, maxColumnIndex * scrollPercentage));

          // Define a max row index that we can't scroll past
          if (colIndex > maxColumnIndex) {
            colIndex = maxColumnIndex;
          }
          
          var newRange = [];
          if (columnCache.length > uiGridCtrl.grid.options.columnVirtualizationThreshold && uiGridCtrl.grid.getCanvasWidth() > uiGridCtrl.grid.getViewportWidth()) {
            // Have we hit the threshold going down?
            if (uiGridCtrl.prevScrollLeft < scrollLeft && colIndex < uiGridCtrl.prevColumnScrollIndex + uiGridCtrl.grid.options.horizontalScrollThreshold && colIndex < maxColumnIndex) {
              return;
            }
            //Have we hit the threshold going up?
            if (uiGridCtrl.prevScrollLeft > scrollLeft && colIndex > uiGridCtrl.prevColumnScrollIndex - uiGridCtrl.grid.options.horizontalScrollThreshold && colIndex < maxColumnIndex) {
              return;
            }

            var rangeStart = Math.max(0, colIndex - uiGridCtrl.grid.options.excessColumns);
            var rangeEnd = Math.min(columnCache.length, colIndex + minCols + uiGridCtrl.grid.options.excessColumns);

            newRange = [rangeStart, rangeEnd];
          }
          else {
            var maxLen = uiGridCtrl.grid.columns.length;
            newRange = [0, Math.max(maxLen, minCols + uiGridCtrl.grid.options.excessColumns)];
          }
          
          updateViewableColumnRange(newRange);
          uiGridCtrl.prevColumnScrollIndex = colIndex;
        };

        // Listen for scroll events
        var scrollUnbinder = $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
          // GridUtil.requestAnimationFrame(function() {
            uiGridCtrl.prevScrollArgs = args;

            // Vertical scroll
            if (args.y) {
              var scrollLength = (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

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

            // Horizontal scroll
            if (args.x) {
              var scrollWidth = (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());

              var oldScrollLeft = uiGridCtrl.viewport[0].scrollLeft;

              var scrollXPercentage;
              if (typeof(args.x.percentage) !== 'undefined' && args.x.percentage !== undefined) {
                scrollXPercentage = args.x.percentage;
              }
              else if (typeof(args.x.pixels) !== 'undefined' && args.x.pixels !== undefined) {
                scrollXPercentage = args.x.percentage = (oldScrollLeft + args.x.pixels) / scrollWidth;
                // $log.debug('x.percentage', args.x.percentage);
              }
              else {
                throw new Error("No percentage or pixel value provided for scroll event X axis");
              }

              var newScrollLeft = Math.max(0, scrollXPercentage * scrollWidth);
              
              // uiGridCtrl.adjustScrollHorizontal(newScrollLeft, scrollXPercentage);

              uiGridCtrl.viewport[0].scrollLeft = newScrollLeft;

              if (uiGridCtrl.headerViewport) {
                uiGridCtrl.headerViewport.scrollLeft = newScrollLeft;
              }

              uiGridCtrl.grid.options.offsetLeft = newScrollLeft;

              uiGridCtrl.prevScrollArgs.x.pixels = newScrollLeft - oldScrollLeft;
            }
          // });
        });

        // Scroll the viewport when the mousewheel is used
        $elm.bind('wheel mousewheel DomMouseScroll MozMousePixelScroll', function(evt) {
          // use wheelDeltaY
          evt.preventDefault();

          var newEvent = GridUtil.normalizeWheelEvent(evt);

          var args = { target: $elm };
          if (newEvent.deltaY !== 0) {
            var scrollYAmount = newEvent.deltaY * -120;

            // Get the scroll percentage
            var scrollYPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollYAmount) / (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

            // Keep scrollPercentage within the range 0-1.
            if (scrollYPercentage < 0) { scrollYPercentage = 0; }
            else if (scrollYPercentage > 1) { scrollYPercentage = 1; }

            args.y = { percentage: scrollYPercentage, pixels: scrollYAmount };
          }
          if (newEvent.deltaX !== 0) {
            var scrollXAmount = newEvent.deltaX * -120;

            // Get the scroll percentage
            var scrollXPercentage = (uiGridCtrl.viewport[0].scrollLeft + scrollXAmount) / (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());

            // Keep scrollPercentage within the range 0-1.
            if (scrollXPercentage < 0) { scrollXPercentage = 0; }
            else if (scrollXPercentage > 1) { scrollXPercentage = 1; }

            args.x = { percentage: scrollXPercentage, pixels: scrollXAmount };
          }

          // $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);

          uiGridCtrl.fireScrollingEvent(args);
        });

        
        var startY = 0,
            startX = 0,
            scrollTopStart = 0,
            scrollLeftStart = 0,
            directionY = 1,
            directionX = 1,
            moveStart;
        function touchmove(event) {
          if (event.originalEvent) {
            event = event.originalEvent;
          }

          event.preventDefault();

          var deltaX, deltaY, newX, newY;
          newX = event.targetTouches[0].screenX;
          newY = event.targetTouches[0].screenY;
          deltaX = -(newX - startX);
          deltaY = -(newY - startY);

          directionY = (deltaY < 1) ? -1 : 1;
          directionX = (deltaX < 1) ? -1 : 1;

          deltaY *= 2;
          deltaX *= 2;

          var args = { target: event.target };

          if (deltaY !== 0) {
            var scrollYPercentage = (scrollTopStart + deltaY) / (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

            if (scrollYPercentage > 1) { scrollYPercentage = 1; }
            else if (scrollYPercentage < 0) { scrollYPercentage = 0; }

            args.y = { percentage: scrollYPercentage, pixels: deltaY };
          }
          if (deltaX !== 0) {
            var scrollXPercentage = (scrollLeftStart + deltaX) / (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());

            if (scrollXPercentage > 1) { scrollXPercentage = 1; }
            else if (scrollXPercentage < 0) { scrollXPercentage = 0; }

            args.x = { percentage: scrollXPercentage, pixels: deltaX };
          }

          $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);
        }
        
        function touchend(event) {
          if (event.originalEvent) {
            event = event.originalEvent;
          }

          event.preventDefault();

          $document.unbind('touchmove', touchmove);
          $document.unbind('touchend', touchend);
          $document.unbind('touchcancel', touchend);

          // Get the distance we moved on the Y axis
          var scrollTopEnd = uiGridCtrl.viewport[0].scrollTop;
          var scrollLeftEnd = uiGridCtrl.viewport[0].scrollTop;
          var deltaY = Math.abs(scrollTopEnd - scrollTopStart);
          var deltaX = Math.abs(scrollLeftEnd - scrollLeftStart);

          // Get the duration it took to move this far
          var moveDuration = (new Date()) - moveStart;

          // Scale the amount moved by the time it took to move it (i.e. quicker, longer moves == more scrolling after the move is over)
          var moveYScale = deltaY / moveDuration;
          var moveXScale = deltaX / moveDuration;

          var decelerateInterval = 63; // 1/16th second
          var decelerateCount = 8; // == 1/2 second
          var scrollYLength = 120 * directionY * moveYScale;
          var scrollXLength = 120 * directionX * moveXScale;

          function decelerate() {
            $timeout(function() {
              var args = { target: event.target };

              if (scrollYLength !== 0) {
                var scrollYPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollYLength) / (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

                args.y = { percentage: scrollYPercentage, pixels: scrollYLength };
              }

              if (scrollXLength !== 0) {
                var scrollXPercentage = (uiGridCtrl.viewport[0].scrollLeft + scrollXLength) / (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());
                args.x = { percentage: scrollXPercentage, pixels: scrollXLength };
              }

              $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);

              decelerateCount = decelerateCount -1;
              scrollYLength = scrollYLength / 2;
              scrollXLength = scrollXLength / 2;

              if (decelerateCount > 0) {
                decelerate();
              }
              else {
                uiGridCtrl.scrollbars.forEach(function (sbar) {
                  sbar.removeClass('ui-grid-scrollbar-visible');
                  sbar.removeClass('ui-grid-scrolling');
                });
              }
            }, decelerateInterval);
          }

          decelerate();
        }

        if (GridUtil.isTouchEnabled()) {
          $elm.bind('touchstart', function (event) {
            if (event.originalEvent) {
              event = event.originalEvent;
            }

            event.preventDefault();

            uiGridCtrl.scrollbars.forEach(function (sbar) {
              sbar.addClass('ui-grid-scrollbar-visible');
              sbar.addClass('ui-grid-scrolling');
            });

            moveStart = new Date();
            startY = event.targetTouches[0].screenY;
            startX = event.targetTouches[0].screenX;
            scrollTopStart = uiGridCtrl.viewport[0].scrollTop;
            scrollLeftStart = uiGridCtrl.viewport[0].scrollLeft;
            
            $document.on('touchmove', touchmove);
            $document.on('touchend touchcancel', touchend);
          });
        }

        // TODO(c0bra): Scroll the viewport when the up and down arrow keys are used? This would interfere with cell navigation
        // $elm.bind('keydown', function(evt, args) {

        // });

        // Unbind all $watches and events on $destroy
        $elm.bind('$destroy', function() {
          scrollUnbinder();
          $elm.unbind('keydown');

          ['touchstart', 'touchmove', 'touchend','keydown', 'wheel', 'mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'].forEach(function (eventName) {
            $elm.unbind(eventName);
          });
        });



        var setRenderedRows = function (newRows) {
          uiGridCtrl.grid.setRenderedRows(newRows);
        };

        var setRenderedColumns = function (newColumns) {
          uiGridCtrl.grid.setRenderedColumns(newColumns);
          updateColumnOffset();
        };

        // Method for updating the visible rows
        var updateViewableRowRange = function(renderedRange) {
          // Slice out the range of rows from the data
          // var rowArr = uiGridCtrl.grid.rows.slice(renderedRange[0], renderedRange[1]);
          var rowArr = uiGridCtrl.grid.renderContainers.body.visibleRowCache.slice(renderedRange[0], renderedRange[1]);

          // Define the top-most rendered row
          uiGridCtrl.currentTopRow = renderedRange[0];

          setRenderedRows(rowArr);
        };

        // Method for updating the visible columns
        var updateViewableColumnRange = function(renderedRange) {
          // Slice out the range of rows from the data
          // var columnArr = uiGridCtrl.grid.columns.slice(renderedRange[0], renderedRange[1]);
          var columnArr = uiGridCtrl.grid.renderContainers.body.visibleColumnCache.slice(renderedRange[0], renderedRange[1]);

          // Define the left-most rendered columns
          uiGridCtrl.currentFirstColumn = renderedRange[0];

          setRenderedColumns(columnArr);
        };

        $scope.rowStyle = function (index) {
          var styles = {};

          if (index === 0 && uiGridCtrl.currentTopRow !== 0) {
            // The row offset-top is just the height of the rows above the current top-most row, which are no longer rendered
            var hiddenRowWidth = (uiGridCtrl.currentTopRow) * uiGridCtrl.grid.options.rowHeight;

            // return { 'margin-top': hiddenRowWidth + 'px' };
            styles['margin-top'] = hiddenRowWidth + 'px';
          }

          if (uiGridCtrl.currentFirstColumn !== 0) {
            styles['margin-left'] = uiGridCtrl.columnOffset + 'px';
          }

          return styles;
        };
        
        var updateColumnOffset = function() {
          // Calculate the width of the columns on the left side that are no longer rendered.
          //  That will be the offset for the columns as we scroll horizontally.
          var hiddenColumnsWidth = 0;
          for (var i = 0; i < uiGridCtrl.currentFirstColumn; i++) {
            hiddenColumnsWidth += uiGridCtrl.grid.renderContainers.body.visibleColumnCache[i].drawnWidth;
          }

          uiGridCtrl.columnOffset = hiddenColumnsWidth;
        };

        $scope.columnStyle = function (index) {
          if (index === 0 && uiGridCtrl.currentFirstColumn !== 0) {
            var offset = uiGridCtrl.columnOffset;

            return { 'margin-left': offset + 'px' };
          }

          return null;
        };

        uiGridCtrl.fireEvent('body-post-link');
      }
    };
  }]);

})();