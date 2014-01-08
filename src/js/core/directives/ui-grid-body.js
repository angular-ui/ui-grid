(function(){
  'use strict';

  var app = angular.module('ui.grid.body', []);

  app.directive('uiGridBody', ['$log', 'gridUtil', function($log, GridUtil) {
    return {
      replace: true,
      // priority: 1000,
      templateUrl: 'ui-grid/ui-grid-body',
      require: '?^uiGrid',
      scope: false,
      link: function(scope, elm, attrs, uiGridCtrl) {
        if (uiGridCtrl === undefined) {
          $log.warn('[ui-grid-body] uiGridCtrl is undefined!');
        }

        $log.debug('ui-grid-body link');

        // Stick the canvas in the controller
        uiGridCtrl.canvas = angular.element( elm[0].getElementsByClassName('ui-grid-canvas')[0] );
        // uiGridCtrl.viewport = elm; //angular.element( elm[0].getElementsByClassName('ui-grid-viewport')[0] );
        uiGridCtrl.viewport = angular.element( elm[0].getElementsByClassName('ui-grid-viewport')[0] );
        uiGridCtrl.viewportOuterHeight = GridUtil.outerElementHeight(uiGridCtrl.viewport[0]);

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

          // var rowIndex = Math.floor(scrollTop / scope.options.rowHeight);
          // $log.debug(scope.options.data.length + ' * (' + scrollTop + ' / ' + scope.options.canvasHeight + ')');
          // var rowIndex = Math.floor(scope.options.data.length * scrollTop / scope.options.canvasHeight);
          // scrollTop = Math.floor(uiGridCtrl.canvas[0].scrollHeight * scrollPercentage);
          scrollTop = uiGridCtrl.canvas[0].scrollHeight * scrollPercentage;

          var minRows = uiGridCtrl.minRowsToRender();
          var maxRowIndex = scope.options.data.length - minRows;
          uiGridCtrl.maxRowIndex = maxRowIndex;

          // var rowIndex = Math.ceil(Math.min(scope.options.data.length, scope.options.data.length * scrollPercentage));
          var rowIndex = Math.ceil(Math.min(maxRowIndex, maxRowIndex * scrollPercentage));
          // $log.debug('rowIndex', rowIndex);

          // Define a max row index that we can't scroll past
          if (rowIndex > maxRowIndex) {
            rowIndex = maxRowIndex;
          }

          // $log.debug('newScrollTop', scrollTop);
          // $log.debug('rowIndex', rowIndex);
          // $log.debug('data.length', scope.options.data.length);
          var newRange = [];
          if (scope.options.data.length > scope.options.virtualizationThreshold) {
            // Have we hit the threshold going down?
            if (uiGridCtrl.prevScrollTop < scrollTop && rowIndex < uiGridCtrl.prevScrollIndex + scope.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }
            //Have we hit the threshold going up?
            if (uiGridCtrl.prevScrollTop > scrollTop && rowIndex > uiGridCtrl.prevScrollIndex - scope.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }

            // $log.debug('rowIndex | maxRowIndex | minRows', rowIndex, maxRowIndex, minRows);

            var rangeStart = Math.max(0, rowIndex - scope.options.excessRows);
            var rangeEnd = Math.min(scope.options.data.length, rowIndex + minRows + scope.options.excessRows);

            // if (rangeEnd - rangeStart < minRows) {
            //   $log.debug('range too small', rangeStart);
            //   rangeStart = rangeEnd - minRows - scope.options.excessRows; //rangeStart - (minRows - (rangeEnd - rangeStart));
            //   $log.debug('new start of range', rangeStart);
            // }

            // Check to make sure the range isn't too long
            // var rangeLength = rangeEnd - rangeStart;
            // if (rowIndex === maxRowIndex && (scope.options.offsetTop + (scope.options.rowHeight * rangeLength) > scope.options.canvasHeight)) {
            //   $log.debug('range too big!', scope.options.offsetTop, scope.options.rowHeight * rangeLength, scope.options.canvasHeight);

            //   var removeRange = Math.floor( (scope.options.offsetTop + (scope.options.rowHeight * rangeLength) - scope.options.canvasHeight) / scope.options.rowHeight);
            //   $log.debug('remove range', removeRange);

            //   rangeStart = rangeStart + removeRange;
            // }

            newRange = [rangeStart, rangeEnd];
          }
          else {
            var maxLen = scope.options.data.length;
            newRange = [0, Math.max(maxLen, minRows + scope.options.excessRows)];
          }

          uiGridCtrl.prevScrollTop = scrollTop;
          uiGridCtrl.updateViewableRange(newRange);
          uiGridCtrl.prevScrollIndex = rowIndex;
        };

        // Listen for scroll events
        var scrollUnbinder = scope.$on('uiGridScrollVertical', function(evt, args) {
          // $log.debug('scroll', args.scrollPercentage, scope.options.canvasHeight, args.scrollPercentage * scope.options.canvasHeight);

          var scrollLength = (scope.options.canvasHeight - scope.options.viewportHeight);

          // $log.debug('scrollLength', scrollLength, scrollLength % scope.options.rowHeight);
          var newScrollTop = Math.max(0, args.scrollPercentage * scrollLength);
          // $log.debug('mod', (scrollLength % scope.options.rowHeight));
          // newScrollTop = newScrollTop + (scrollLength % scope.options.rowHeight);

          // $log.debug('uiGridCtrl.canvas[0].scrollHeight', uiGridCtrl.canvas[0].scrollHeight);

          // var scrollMultiplier = (scope.options.canvasHeight / (scope.options.rowHeight * scope.options.data.length)) * 100;
          var scrollMultiplier = 1; // (scope.options.rowHeight * scope.options.data.length) / scope.options.canvasHeight;
          // $log.debug('scrollMultiplier', scrollMultiplier);
          // newScrollTop = newScrollTop * scrollMultiplier;

          var scrollPercentage = args.scrollPercentage * scrollMultiplier;

          // $log.debug('newScrollTop', newScrollTop);
          // $log.debug('scrollPercentage - newScrollTop', scrollPercentage, newScrollTop);

          // Prevent scroll top from going over the maximum (canvas height - viewport height)
          // if (newScrollTop > scope.options.canvasHeight - scope.options.viewportHeight) {
          //   $log.debug('too high!');
          //   newScrollTop = scope.options.canvasHeight - scope.options.viewportHeight;
          // }

          uiGridCtrl.adjustScrollVertical(newScrollTop, scrollPercentage);
          uiGridCtrl.viewport[0].scrollTop = newScrollTop;
          scope.options.offsetTop = newScrollTop;

          // scope.$evalAsync(function() {

          // });
        });

        // Scroll the viewport when the mousewheel is used
        elm.bind('wheel mousewheel DomMouseScroll MozMousePixelScroll', function(evt) {
          // use wheelDeltaY
          evt.preventDefault();

          // $log.debug('evt', evt);
          // $log.debug('evt.wheelDeltaY', evt.wheelDeltaY);

          var newEvent = GridUtil.normalizeWheelEvent(evt);

          var scrollAmount = newEvent.deltaY * -120;

          // Get the scroll percentage
          // var scrollPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollAmount) / (uiGridCtrl.viewport[0].scrollHeight - scope.options.viewportHeight);
          var scrollPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollAmount) / (scope.options.canvasHeight - scope.options.viewportHeight);

          // TODO(c0bra): Keep scrollPercentage within the range 0-1.
          if (scrollPercentage < 0) { scrollPercentage = 0; }
          if (scrollPercentage > 1) { scrollPercentage = 1; }

          // $log.debug('scrollPercentage', scrollPercentage);

          // $log.debug('new scrolltop', uiGridCtrl.canvas[0].scrollTop + scrollAmount);
          // uiGridCtrl.canvas[0].scrollTop = uiGridCtrl.canvas[0].scrollTop + scrollAmount;
          // $log.debug('new scrolltop', uiGridCtrl.canvas[0].scrollTop);

          scope.$broadcast('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: elm });
        });

        // TODO(c0bra): Scroll the viewport when the up and down arrow keys are used
        elm.bind('keyDown', function(evt, args) {

        });

        // Unbind all $watches and events on $destroy
        elm.bind('$destroy', function() {
          scrollUnbinder();
          elm.unbind('keyDown');

          ['wheel', 'mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'].forEach(function (eventName) {
            elm.unbind(eventName);
          });
        });

        uiGridCtrl.setRenderedRows = function (newRows) {
          // NOTE: without the $evalAsync the new rows don't show up
          scope.$evalAsync(function() {
            for (var i = 0; i < newRows.length; i++) {
              scope.renderedRows.length = newRows.length;

              scope.renderedRows[i] = newRows[i];
            }
          });
        };

        // Method for updating the visible rows
        uiGridCtrl.updateViewableRange = function(renderedRange) {
          // Slice out the range of rows from the data
          var rowArr = scope.options.data.slice(renderedRange[0], renderedRange[1]);

          // Define the top-most rendered row
          uiGridCtrl.currentTopRow = renderedRange[0];

          uiGridCtrl.setRenderedRows(rowArr);
        };

        scope.rowStyle = function (index) {
          if (index === 0 && uiGridCtrl.currentTopRow !== 0) {
            // Here we need to add an extra bit on to our offset. We are calculating the offset below based on the number of rows
            //   that will fit into the viewport. If it's not an even amount there will be a remainder and the viewport will not scroll far enough.
            //   We add the remainder on by using the offset-able height's (canvas - viewport) modulus of the row height, and then we multiply
            //   by the percentage of the index of the row we're scrolled to so the modulus is added increasingly the further on we scroll
            var rowPercent = (uiGridCtrl.prevScrollIndex / uiGridCtrl.maxRowIndex);
            var mod = Math.ceil( ((scope.options.canvasHeight - scope.options.viewportHeight) % scope.options.rowHeight) * rowPercent);

            // We need to add subtract a row from the offset at the beginning to prevent a "jump/snap" effect where the grid moves down an extra rowHeight of pixels, then
            //   add it back until the offset is fully there are the bottom. Basically we add a percentage of a rowHeight back as we scroll down, from 0% at the top to 100%
            //   at the bottom
            var extraRowOffset = (1 - rowPercent);

            var offset = (scope.options.offsetTop) - (scope.options.rowHeight * (scope.options.excessRows - extraRowOffset)) - mod;

            return { 'margin-top': offset + 'px' };
          }

          return null;
        };
      }
    };
  }]);

})();