(function(){
'use strict';

var app = angular.module('ui.grid.body', []);

app.directive('uiGridBody', ['$log', 'GridUtil', function($log, GridUtil) {
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
        scrollTop = Math.floor(uiGridCtrl.canvas[0].scrollHeight * scrollPercentage);
        var rowIndex = Math.min(scope.options.data.length, scope.options.data.length * scrollPercentage);

        // Define a max row index that we can't scroll past
        var maxRowIndex = scope.options.data.length - 1 - uiGridCtrl.minRowsToRender();
        if (rowIndex > maxRowIndex) {
          rowIndex = maxRowIndex;
        }

        // $log.debug('newScrollTop', scrollTop);
        // $log.debug('rowIndex', rowIndex);
        // $log.debug('data.length', scope.options.data.length);
        var newRange = [];
        if (scope.options.data.length > scope.options.virtualizationThreshold) {
            // Have we hit the threshold going down?
            if (uiGridCtrl.prevScrollTop < scrollTop && rowIndex < uiGridCtrl.prevScrollIndex + scope.options.scrollThreshold) {
              return;
            }
            //Have we hit the threshold going up?
            if (uiGridCtrl.prevScrollTop > scrollTop && rowIndex > uiGridCtrl.prevScrollIndex - scope.options.scrollThreshold) {
              return;
            }

            var minRows = uiGridCtrl.minRowsToRender();
            var rangeStart = Math.floor(Math.max(0, rowIndex - scope.options.excessRows));
            var rangeEnd = Math.floor(Math.min(scope.options.data.length, rowIndex + minRows + scope.options.excessRows));

            // if (rangeEnd - rangeStart < minRows) {
            //   $log.debug('range too small', rangeStart);
            //   rangeStart = rangeEnd - minRows - scope.options.excessRows; //rangeStart - (minRows - (rangeEnd - rangeStart));
            //   $log.debug('new start of range', rangeStart);
            // }

            newRange = [rangeStart, rangeEnd];
        }
        else {
          var maxLen = scope.options.data.length;
          newRange = [0, Math.max(maxLen, uiGridCtrl.minRowsToRender() + scope.options.excessRows)];
        }

        uiGridCtrl.prevScrollTop = scrollTop;
        uiGridCtrl.updateViewableRange(newRange);
        uiGridCtrl.prevScrollIndex = rowIndex;
      };

      // Listen for scroll events
      var scrollUnbinder = scope.$on('uiGridScrollVertical', function(evt, args) {
        // $log.debug('scroll', args.scrollPercentage, scope.options.canvasHeight, args.scrollPercentage * scope.options.canvasHeight);
        var newScrollTop = Math.max(0, args.scrollPercentage * (scope.options.canvasHeight - scope.options.viewportHeight));

        // $log.debug('uiGridCtrl.canvas[0].scrollHeight', uiGridCtrl.canvas[0].scrollHeight);
        // $log.debug('newScrollTop', newScrollTop);

        // var scrollMultiplier = (scope.options.canvasHeight / (scope.options.rowHeight * scope.options.data.length)) * 100;
        var scrollMultiplier = 1; // (scope.options.rowHeight * scope.options.data.length) / scope.options.canvasHeight;
        // $log.debug('scrollMultiplier', scrollMultiplier);
        // newScrollTop = newScrollTop * scrollMultiplier;

        var scrollPercentage = args.scrollPercentage * scrollMultiplier;

        $log.debug('newScrollTop', newScrollTop);
        $log.debug('scrollPercentage', scrollPercentage);

        scope.options.offsetTop = newScrollTop;

        // Prevent scroll top from going over the maximum (canvas height - viewport height)
        if (newScrollTop > scope.options.canvasHeight - scope.options.viewportHeight) {
          newScrollTop = scope.options.canvasHeight - scope.options.viewportHeight;
        }

        uiGridCtrl.adjustScrollVertical(newScrollTop, scrollPercentage);
        uiGridCtrl.viewport[0].scrollTop = newScrollTop;
      });
      
      // Scroll the viewport when the mousewheel is used
      elm.bind('mousewheel', function(evt) {
        // use wheelDeltaY
        evt.preventDefault();

        $log.debug('evt.wheelDeltaY', evt.wheelDeltaY);

        var scrollAmount = evt.wheelDeltaY * -1;

        // Get the scroll percentage
        var scrollPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollAmount) / (uiGridCtrl.viewport[0].scrollHeight - scope.options.viewportHeight);

        // TODO(c0bra): Keep scrollPercentage within the range 0-1.

        $log.debug('scrollPercentage', scrollPercentage);

        // $log.debug('new scrolltop', uiGridCtrl.canvas[0].scrollTop + scrollAmount);
        // uiGridCtrl.canvas[0].scrollTop = uiGridCtrl.canvas[0].scrollTop + scrollAmount;
        // $log.debug('new scrolltop', uiGridCtrl.canvas[0].scrollTop);

        scope.$broadcast('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: elm });
      });

      // TODO(c0bra): Scroll the viewport when the up and down arrow keys are used
      elm.bind('keyDown', function(evt, args) {

      });

      elm.bind('$destroy', function() {
        scrollUnbinder();
        elm.unbind('mousewheel');
        elm.unbind('keyDown');
      });

      uiGridCtrl.setRenderedRows = function (newRows) {
        scope.renderedRows.length = newRows.length;

        scope.$evalAsync(function() {
          for (var i = 0; i < newRows.length; i++) {
            // if (! scope.renderedRows[i]) {
              // $scope.renderedRows[i] = angular.copy(newRows[i]);
            // }
            
            scope.renderedRows[i] = newRows[i];
          }
        });
        
        //   $scope.renderedRows[i].rowIndex = newRows[i].rowIndex;
        //   $scope.renderedRows[i].offsetTop = newRows[i].offsetTop;
        //   $scope.renderedRows[i].selected = newRows[i].selected;
        //   newRows[i].renderedRowIndex = i;
        // }

        // uiGridCtrl.refreshCanvas();
        // uiGridCtrl.buildStyles();
        // uiGridCtrl.recalcRowStyles();
      };

      // Method for updating the visible rows
      uiGridCtrl.updateViewableRange = function(renderedRange) {
        $log.debug('new viewable range', renderedRange);
        var rowArr = scope.options.data.slice(renderedRange[0], renderedRange[1]);
        uiGridCtrl.currentTopRow = renderedRange[0];

        uiGridCtrl.setRenderedRows(rowArr);
      };

      // scope.rowStyle = function(index) {
      //    var offset = (-1 * scope.options.rowHeight * scope.options.excessRows) + (scope.options.offsetTop || 0);
      //    var ret = { top: offset + (index * scope.options.rowHeight) + 'px' };
      //    return ret;
      // };

      scope.rowStyle = function(index) {
        var offset = Math.max(0, (-1 * scope.options.rowHeight * scope.options.excessRows) + (scope.options.offsetTop || 0));
        // offset = Math.min(scope.options.canvasHeight - scope.options.viewportHeight, offset);
        var ret = { top: offset + (index * scope.options.rowHeight) + 'px' };
        return ret;
      };

      // scope.rowStyle = function (index) {
      //   if (index === 0) {
      //     var offset = Math.max(0, (-1 * scope.options.rowHeight * scope.options.excessRows) + (uiGridCtrl.currentTopRow * scope.options.rowHeight));
      //     // var marginTop = uiGridCtrl.currentTopRow * scope.options.rowHeight;
      //     var marginTop = offset;

      //      return { 'margin-top': marginTop + 'px' };
      //   }
        
      //   return null;
      // };
    }
  };
}]);

})();