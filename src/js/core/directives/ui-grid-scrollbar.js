(function(){
// 'use strict';

  var app = angular.module('ui.grid.scrollbar', []);

  app.directive('uiGridScrollbar', ['$log', '$document', 'gridUtil', function($log, $document, gridUtil) {
    return {
      replace: true,
      // priority: 1000,
      templateUrl: 'ui-grid/ui-grid-scrollbar',
      require: '?^uiGrid',
      scope: false,
      link: function($scope, $elm, $attrs, uiGridCtrl) {
        if (uiGridCtrl === undefined) {
          throw new Error('[ui-grid-scrollbar] uiGridCtrl is undefined!');
        }

        $log.debug('ui-grid-scrollbar link');

        // Size the scrollbar according to the amount of data. 35px high minimum, otherwise scale inversely proportinal to canvas vs viewport height
        function updateScrollbar(gridScope) {
          var scrollbarHeight = Math.floor(Math.max(35, uiGridCtrl.grid.getViewportHeight() / uiGridCtrl.grid.getCanvasHeight() * uiGridCtrl.grid.getViewportHeight()));

          $scope.scrollbarStyles = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-scrollbar-vertical { height: ' + scrollbarHeight + 'px; }';
        }

        // Only show the scrollbar when the canvas height is less than the viewport height
        $scope.showScrollbar = function() {
          return uiGridCtrl.grid.getCanvasHeight() > uiGridCtrl.grid.getViewportHeight();
        };

        uiGridCtrl.grid.registerStyleComputation(updateScrollbar);


        var startY = 0,
          y = 0;

        // Get the height of the scrollbar, including its margins
        var elmHeight = gridUtil.elementHeight($elm, 'margin');

        // Get the "bottom bound" which the scrollbar cannot scroll past
        var elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;

        function mousedown(event) {
          // Prevent default dragging of selected content
          event.preventDefault();
          elmHeight = gridUtil.elementHeight($elm, 'margin');
          elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;
          startY = event.screenY - y;

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        }

        $elm.on('mousedown', mousedown);

        function mousemove(event) {
          y = event.screenY - startY;

          if (y < 0) { y = 0; }
          if (y > elmBottomBound) { y = elmBottomBound; }

          var scrollPercentage = y / elmBottomBound;
          // $log.debug('scrollPercentage', y, uiGridCtrl.grid.optionsviewportHeight, elmHeight, elmBottomBound, scrollPercentage);

          $scope.$emit('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: $elm });
        }

        var scrollDereg = $scope.$on('uiGridScrollVertical', function(evt, args) {
          if (args.scrollPercentage < 0) { args.scrollPercentage = 0; }
          if (args.scrollPercentage > 1) { args.scrollPercentage = 1; }

          elmHeight = gridUtil.elementHeight($elm, 'margin');
          elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;

          // $log.debug('elmHeight', elmHeight);
          // $log.debug('elmBottomBound', elmBottomBound);

          // var newScrollTop = Math.floor(args.scrollPercentage * elmBottomBound);
          var newScrollTop = args.scrollPercentage * elmBottomBound;

          // $log.debug('newScrollTop', newScrollTop);
          // $log.debug('maxScrollTop', elmBottomBound);

          var newTop = newScrollTop; //(uiGridCtrl.grid.optionsoffsetTop || 0) + newScrollTop;

          // Prevent scrollbar from going beyond container
          if (newTop > uiGridCtrl.grid.getCanvasHeight() - elmHeight) {
            $log.debug('newTop too big!', newTop);
            newTop = uiGridCtrl.grid.getCanvasHeight() - elmHeight;
          }

          // $log.debug('newTop', newTop);

          y = newScrollTop;
          $elm.css({
            top: newTop + 'px'
          });
        });

        function mouseup() {
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
        }

        $elm.on('$destroy', function() {
          scrollDereg();
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
          $elm.unbind('mousedown');
        });
      }
    };
  }]);

})();