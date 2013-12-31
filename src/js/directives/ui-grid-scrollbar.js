(function(){
// 'use strict';

var app = angular.module('ui.grid.scrollbar', []);

app.directive('uiGridScrollbar', ['$log', '$document', 'GridUtil', function($log, $document, GridUtil) {
  return {
    replace: true,
    // priority: 1000,
    templateUrl: 'ui-grid/ui-grid-scrollbar',
    require: '?^uiGrid',
    scope: false,
    link: function(scope, elm, attrs, uiGridCtrl) {
      if (uiGridCtrl === undefined) {
        $log.warn('[ui-grid-scrollbar] uiGridCtrl is undefined!');
      }

      $log.debug('ui-grid-scrollbar link');

      function updateScrollbar(gridScope) {
        gridScope.scrollbarStyles = '.grid' + gridScope.gridId + ' .ui-grid-scrollbar-vertical { height: ' + (gridScope.options.canvasHeight / 8 || 20) + 'px; }';
      }

      if (uiGridCtrl) {
        uiGridCtrl.styleComputions.push(updateScrollbar);
      }

      var startY = 0,
          y = 0;
      
      // Get the height of the scrollbar, including its margins
      var elmHeight = GridUtil.elementHeight(elm, 'margin');

      // Get the "bottom bound" which the scrollbar cannot scroll past
      var elmBottomBound = scope.options.canvasHeight - elmHeight;
      
      elm.on('mousedown', function(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        elmHeight = GridUtil.elementHeight(elm, 'margin');
        elmBottomBound = scope.options.canvasHeight - elmHeight;
        startY = event.screenY - y;

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.screenY - startY;

        if (y < 0) { y = 0; }
        if (y > elmBottomBound) { y = elmBottomBound; }

        var scrollPercentage = y / elmBottomBound;

        scope.$emit('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: elm });
      }

      scope.$on('uiGridScrollVertical', function(evt, args) {
        if (args.scrollPercentage < 0) { args.scrollPercentage = 0; }
        if (args.scrollPercentage > 1) { args.scrollPercentage = 1; }

        elmHeight = GridUtil.elementHeight(elm, 'margin');
        elmBottomBound = scope.options.canvasHeight - elmHeight;

        var newScrollTop = args.scrollPercentage * elmBottomBound;

        y = newScrollTop;
        elm.css({
          top: newScrollTop + 'px'
        });
      });

      function mouseup() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
      }

      elm.on('$destroy', function() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
      });
    }
  };
}]);

})();