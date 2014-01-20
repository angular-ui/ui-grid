(function(){
  'use strict';

  var app = angular.module('ui.grid.body', []);

  app.directive('uiGridBody', ['$log', '$document', '$timeout', 'uiGridConstants', 'gridUtil', function($log, $document, $timeout, uiGridConstants, GridUtil) {
    return {
      replace: true,
      // priority: 1000,
      templateUrl: 'ui-grid/ui-grid-body',
      require: '?^uiGrid',
      scope: false,
      link: function($scope, $elm, $attrs, uiGridCtrl) {
        if (uiGridCtrl === undefined) {
          throw new Error('[ui-grid-body] uiGridCtrl is undefined!');
        }

        $log.debug('ui-grid-body link');

        // Stick the canvas in the controller
        uiGridCtrl.canvas = angular.element( $elm[0].getElementsByClassName('ui-grid-canvas')[0] );
        // uiGridCtrl.viewport = elm; //angular.element( elm[0].getElementsByClassName('ui-grid-viewport')[0] );
        uiGridCtrl.viewport = angular.element( $elm[0].getElementsByClassName('ui-grid-viewport')[0] );
        uiGridCtrl.viewportOuterHeight = GridUtil.outerElementHeight(uiGridCtrl.viewport[0]);

        // Explicitly set the viewport scrollTop to 0; Firefox apparently caches it
        uiGridCtrl.viewport[0].scrollTop = 0;

        uiGridCtrl.prevScrollTop = 0;
        uiGridCtrl.currentTopRow = 0;

        uiGridCtrl.adjustScrollVertical = function (scrollTop, scrollPercentage, force) {
          if (uiGridCtrl.prevScrollTop === scrollTop && !force) {
            return;
          }

          if (scrollTop > 0 && uiGridCtrl.canvas[0].scrollHeight - scrollTop <= uiGridCtrl.viewportOuterHeight) {
            // $scope.$emit('ngGridEventScroll');
          }

          // $log.debug('scrollPercentage', scrollPercentage);

          // var rowIndex = Math.floor(scrollTop / uiGridCtrl.grid.options.rowHeight);
          // $log.debug(uiGridCtrl.grid.options.data.length + ' * (' + scrollTop + ' / ' + uiGridCtrl.grid.options.canvasHeight + ')');
          // var rowIndex = Math.floor(uiGridCtrl.grid.options.data.length * scrollTop / uiGridCtrl.grid.options.canvasHeight);
          // scrollTop = Math.floor(uiGridCtrl.canvas[0].scrollHeight * scrollPercentage);
          scrollTop = uiGridCtrl.canvas[0].scrollHeight * scrollPercentage;

          var minRows = uiGridCtrl.grid.minRowsToRender();
          var maxRowIndex = uiGridCtrl.grid.rows.length - minRows;
          uiGridCtrl.maxRowIndex = maxRowIndex;

          // var rowIndex = Math.ceil(Math.min(uiGridCtrl.grid.options.data.length, uiGridCtrl.grid.options.data.length * scrollPercentage));
          var rowIndex = Math.ceil(Math.min(maxRowIndex, maxRowIndex * scrollPercentage));
          // $log.debug('rowIndex', rowIndex);

          // Define a max row index that we can't scroll past
          if (rowIndex > maxRowIndex) {
            rowIndex = maxRowIndex;
          }

          // $log.debug('newScrollTop', scrollTop);
          // $log.debug('rowIndex', rowIndex);
          // $log.debug('data.length', uiGridCtrl.grid.options.data.length);
          var newRange = [];
          if (uiGridCtrl.grid.rows.length > uiGridCtrl.grid.options.virtualizationThreshold) {
            // Have we hit the threshold going down?
            if (uiGridCtrl.prevScrollTop < scrollTop && rowIndex < uiGridCtrl.prevScrollIndex + uiGridCtrl.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }
            //Have we hit the threshold going up?
            if (uiGridCtrl.prevScrollTop > scrollTop && rowIndex > uiGridCtrl.prevScrollIndex - uiGridCtrl.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }

            // $log.debug('rowIndex | maxRowIndex | minRows', rowIndex, maxRowIndex, minRows);

            var rangeStart = Math.max(0, rowIndex - uiGridCtrl.grid.options.excessRows);
            var rangeEnd = Math.min(uiGridCtrl.grid.rows.length, rowIndex + minRows + uiGridCtrl.grid.options.excessRows);

            // if (rangeEnd - rangeStart < minRows) {
            //   $log.debug('range too small', rangeStart);
            //   rangeStart = rangeEnd - minRows - uiGridCtrl.grid.options.excessRows; //rangeStart - (minRows - (rangeEnd - rangeStart));
            //   $log.debug('new start of range', rangeStart);
            // }

            // Check to make sure the range isn't too long
            // var rangeLength = rangeEnd - rangeStart;
            // if (rowIndex === maxRowIndex && (uiGridCtrl.grid.options.offsetTop + (uiGridCtrl.grid.options.rowHeight * rangeLength) > uiGridCtrl.grid.options.canvasHeight)) {
            //   $log.debug('range too big!', uiGridCtrl.grid.options.offsetTop, uiGridCtrl.grid.options.rowHeight * rangeLength, uiGridCtrl.grid.options.canvasHeight);

            //   var removeRange = Math.floor( (uiGridCtrl.grid.options.offsetTop + (uiGridCtrl.grid.options.rowHeight * rangeLength) - uiGridCtrl.grid.options.canvasHeight) / uiGridCtrl.grid.options.rowHeight);
            //   $log.debug('remove range', removeRange);

            //   rangeStart = rangeStart + removeRange;
            // }

            newRange = [rangeStart, rangeEnd];
          }
          else {
            var maxLen = uiGridCtrl.grid.rows.length;
            newRange = [0, Math.max(maxLen, minRows + uiGridCtrl.grid.options.excessRows)];
          }

          uiGridCtrl.prevScrollTop = scrollTop;
          updateViewableRange(newRange);
          uiGridCtrl.prevScrollIndex = rowIndex;
        };

        // Listen for scroll events
        var scrollUnbinder = $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
          // Vertical scroll
          if (args.y) {
            var scrollLength = (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

            var scrollYPercentage = args.y.percentage;
            var newScrollTop = Math.max(0, scrollYPercentage * scrollLength);
            
            uiGridCtrl.adjustScrollVertical(newScrollTop, scrollYPercentage);

            uiGridCtrl.viewport[0].scrollTop = newScrollTop;
            uiGridCtrl.grid.options.offsetTop = newScrollTop;
          }

          // Horizontal scroll
          if (args.x) {
            var scrollWidth = (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());

            var scrollXPercentage = args.x.percentage;
            var newScrollLeft = Math.max(0, scrollXPercentage * scrollWidth);
            
            // TODO(c0bra): add adjustScrollHorizontal() method
            // uiGridCtrl.adjustScrollHorizontal(newScrollTop, scrollXPercentage);

            uiGridCtrl.viewport[0].scrollLeft = newScrollLeft;
            uiGridCtrl.grid.options.offsetLeft = newScrollLeft;
          }

          uiGridCtrl.fireScrollingEvent();
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
            if (scrollYPercentage > 1) { scrollYPercentage = 1; }

            args.y = { percentage: scrollYPercentage, pixels: scrollYAmount };
          }
          if (newEvent.deltaX !== 0) {
            var scrollXAmount = newEvent.deltaX * -120;

            // Get the scroll percentage
            var scrollXPercentage = (uiGridCtrl.viewport[0].scrollLeft + scrollXAmount) / (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());

            // Keep scrollPercentage within the range 0-1.
            if (scrollXPercentage < 0) { scrollXPercentage = 0; }
            if (scrollXPercentage > 1) { scrollXPercentage = 1; }

            args.x = { percentage: scrollXPercentage, pixels: scrollXAmount };
          }

          $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);
        });

        
        var startY = 0,
            startX = 0,
            scrollTopStart = 0,
            scrollLeftStart = 0,
            directionY = 1,
            directionX = 1,
            moveStart;
        function touchmove(event) {
          event.preventDefault();

          // $log.debug('touchmove', event);

          var deltaX, deltaY, newX, newY;
          newX = event.targetTouches[0].pageX;
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
            args.y = { percentage: scrollYPercentage, pixels: deltaY };
          }
          if (deltaX !== 0) {
            var scrollXPercentage = (scrollLeftStart + deltaX) / (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());
            args.x = { percentage: scrollXPercentage, pixels: deltaX };
          }

          $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);
        }

        // TODO(c0bra): handle X axis
        function touchend(event) {
          // $log.debug('touchend!');
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

          var decelerateInterval = 125; // 1/8th second
          var decelerateCount = 4; // == 1/2 second
          var scrollYLength = 60 * directionY * moveYScale;
          var scrollXLength = 60 * directionX * moveXScale;

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

              if (decelerateCount > 0) {
                decelerate();
              }
            }, decelerateInterval);
          }
          decelerate();
        }

        if (GridUtil.isTouchEnabled()) {
          $elm.bind('touchstart', function (event) {
            event.preventDefault();
            // $log.debug('touchstart', event);

            moveStart = new Date();
            startY = event.targetTouches[0].screenY;
            scrollTopStart = uiGridCtrl.viewport[0].scrollTop;
            
            $document.on('touchmove', touchmove);
            $document.on('touchend touchcancel', touchend);
          });
        }

        // TODO(c0bra): Scroll the viewport when the up and down arrow keys are used
        $elm.bind('keydown', function(evt, args) {

        });

        // Unbind all $watches and events on $destroy
        $elm.bind('$destroy', function() {
          scrollUnbinder();
          $elm.unbind('keydown');

          ['touchstart', 'touchmove', 'touchend','keydown', 'wheel', 'mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'].forEach(function (eventName) {
            $elm.unbind(eventName);
          });
        });



        var setRenderedRows = function (newRows) {
          // NOTE: without the $evalAsync the new rows don't show up
          $scope.$evalAsync(function() {
            uiGridCtrl.grid.setRenderedRows(newRows);
          });
        };

        // Method for updating the visible rows
        var updateViewableRange = function(renderedRange) {
          // Slice out the range of rows from the data
          var rowArr = uiGridCtrl.grid.rows.slice(renderedRange[0], renderedRange[1]);

          // Define the top-most rendered row
          uiGridCtrl.currentTopRow = renderedRange[0];

          setRenderedRows(rowArr);
        };

        $scope.rowStyle = function (index) {
          if (index === 0 && uiGridCtrl.currentTopRow !== 0) {
            // Here we need to add an extra bit on to our offset. We are calculating the offset below based on the number of rows
            //   that will fit into the viewport. If it's not an even amount there will be a remainder and the viewport will not scroll far enough.
            //   We add the remainder on by using the offset-able height's (canvas - viewport) modulus of the row height, and then we multiply
            //   by the percentage of the index of the row we're scrolled to so the modulus is added increasingly the further on we scroll
            var rowPercent = (uiGridCtrl.prevScrollIndex / uiGridCtrl.maxRowIndex);
            var mod = Math.ceil( ((uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight()) % uiGridCtrl.grid.options.rowHeight) * rowPercent);

            // We need to add subtract a row from the offset at the beginning to prevent a "jump/snap" effect where the grid moves down an extra rowHeight of pixels, then
            //   add it back until the offset is fully there are the bottom. Basically we add a percentage of a rowHeight back as we scroll down, from 0% at the top to 100%
            //   at the bottom
            var extraRowOffset = (1 - rowPercent);

            var offset = (uiGridCtrl.grid.options.offsetTop) - (uiGridCtrl.grid.options.rowHeight * (uiGridCtrl.grid.options.excessRows - extraRowOffset)) - mod;

            return { 'margin-top': offset + 'px' };
          }

          return null;
        };
      }
    };
  }]);

})();