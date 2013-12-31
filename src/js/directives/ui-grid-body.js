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
      uiGridCtrl.viewport = elm; //angular.element( elm[0].getElementsByClassName('ui-grid-viewport')[0] );
      uiGridCtrl.viewportOuterHeight = GridUtil.outerElementHeight(uiGridCtrl.viewport[0]);

      uiGridCtrl.prevScrollTop = 0;

      uiGridCtrl.adjustScrollVertical = function (scrollTop, force) {
        if (uiGridCtrl.prevScrollTop === scrollTop && !force) {
          return;
        }

        if (scrollTop > 0 && uiGridCtrl.viewport[0].scrollHeight - scrollTop <= uiGridCtrl.viewportOuterHeight) {
          // $scope.$emit('ngGridEventScroll');
        }

        // var rowIndex = Math.floor(scrollTop / scope.options.rowHeight);
         var rowIndex = Math.floor(scope.options.data.length * Math.floor(scrollTop / scope.options.canvasHeight));

        $log.debug('newScrollTop', scrollTop);
        $log.debug('rowIndex', rowIndex);
        $log.debug('data.length', scope.options.data.length);
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
            newRange = [Math.max(0, rowIndex - scope.options.excessRows), rowIndex + uiGridCtrl.minRowsToRender() + scope.options.excessRows];
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
        var newScrollTop = args.scrollPercentage * (uiGridCtrl.canvas[0].scrollHeight - scope.options.canvasHeight);

        uiGridCtrl.adjustScrollVertical(newScrollTop);

        uiGridCtrl.canvas[0].scrollTop = newScrollTop;
      });
      
      // Scroll the viewport when the mousewheel is used
      elm.bind('mousewheel', function(evt) {
        // use wheelDeltaY
        evt.preventDefault();

        var scrollAmount = evt.wheelDeltaY * -1;

        // Get the scroll percentage
        var scrollPercentage = (uiGridCtrl.canvas[0].scrollTop + scrollAmount) / (uiGridCtrl.canvas[0].scrollHeight - scope.options.canvasHeight);

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

      uiGridCtrl.minRowsToRender = function() {
        return Math.floor(scope.options.canvasHeight / scope.options.rowHeight);
      };

      uiGridCtrl.setRenderedRows = function (newRows) {
        $log.debug('scope.renderedRows', scope.renderedRows);
        scope.renderedRows.length = newRows.length;

        for (var i = 0; i < newRows.length; i++) {
          // if (! scope.renderedRows[i]) {
            // $scope.renderedRows[i] = angular.copy(newRows[i]);
          // }
          scope.renderedRows[i] = angular.copy(newRows[i]);
        }
        //   $scope.renderedRows[i].rowIndex = newRows[i].rowIndex;
        //   $scope.renderedRows[i].offsetTop = newRows[i].offsetTop;
        //   $scope.renderedRows[i].selected = newRows[i].selected;
        //   newRows[i].renderedRowIndex = i;
        // }

        // uiGridCtrl.refreshCanvas();
      };

      // Method for updating the visible rows
      uiGridCtrl.updateViewableRange = function(renderedRange) {
        $log.debug('new viewable range', renderedRange);
        var rowArr = scope.options.data.slice(renderedRange[0], renderedRange[1]);
        $log.debug('rowArr', rowArr);

        uiGridCtrl.setRenderedRows(rowArr);
      };
    }
  };
}]);

})();