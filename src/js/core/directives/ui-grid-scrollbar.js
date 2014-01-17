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

        /**
         * Link stuff
         */

        // Get the scrolling class from the "scrolling-class" attribute
        var scrollingClass;
        $attrs.$observe('scrollingClass', function(n, o) {
          $log.debug('scrollingClass', n);
          if (n) {
            scrollingClass = n;
          }
        });

        /**
         *
         * Scrollbar sizing
         *
         */

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


        /**
         *
         * Scrollbar movement and grid scrolling
         *
         */

        var startY = 0,
            y = 0;

        // Get the height of the scrollbar, including its margins
        var elmHeight = gridUtil.elementHeight($elm, 'margin');

        // Get the "bottom boundary" which the scrollbar cannot scroll past (which is the viewport height minus the height of the scrollbar)
        var elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;

        // On mousedown on the scrollbar, listen for mousemove events to scroll and mouseup events to unbind the move and mouseup event
        function mousedown(event) {
          // Prevent default dragging of selected content
          event.preventDefault();

          $elm.addClass(scrollingClass);

          // Get the height of the element in case it changed (due to canvas/viewport resizing)
          elmHeight = gridUtil.elementHeight($elm, 'margin');

          // Get the bottom boundary again
          elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;

          // Store the Y value of where we're starting
          startY = event.screenY - y;

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        }

        // Bind to the mousedown event
        $elm.on('mousedown', mousedown);

        // Emit a scroll event when we move the mouse while scrolling
        function mousemove(event) {
          // The delta along the Y axis
          y = event.screenY - startY;

          // Make sure the value does not go above the grid or below the bottom boundary
          if (y < 0) { y = 0; }
          if (y > elmBottomBound) { y = elmBottomBound; }

          // The percentage that we've scrolled is the y axis delta divided by the total scrollable distance (which is the same as the bottom boundary)
          var scrollPercentage = y / elmBottomBound;

          //TODO: When this is part of ui.grid module, the event name should be a constant
          $scope.$emit('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: $elm });
        }

        // Bind to the scroll event which can come from the body (mouse wheel/touch events), or other places
        var scrollDereg = $scope.$on('uiGridScrollVertical', function(evt, args) {
          // Make sure the percentage is normalized within the range 0-1
          if (args.scrollPercentage < 0) { args.scrollPercentage = 0; }
          if (args.scrollPercentage > 1) { args.scrollPercentage = 1; }

          // Get the height of the element in case it changed (due to canvas/viewport resizing)
          elmHeight = gridUtil.elementHeight($elm, 'margin');

          // Get the bottom bound again
          elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;

          // The new top value for the scrollbar is the percentage of scroll multiplied by the bottom boundary
          var newScrollTop = args.scrollPercentage * elmBottomBound;

          var newTop = newScrollTop; //(uiGridCtrl.grid.optionsoffsetTop || 0) + newScrollTop;

          // Prevent scrollbar from going beyond container
          if (newTop > uiGridCtrl.grid.getCanvasHeight() - elmHeight) {
            newTop = uiGridCtrl.grid.getCanvasHeight() - elmHeight;
          }

          // Store the new top in the y value
          y = newScrollTop;

          // Set the css for top
          $elm.css({
            top: newTop + 'px'
          });
        });
  
        // When the user lets go of the mouse...
        function mouseup() {
          // Remove the "scrolling" class, if any
          $elm.removeClass(scrollingClass);

          // Unbind the events we bound to the document
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }


        /**
         *
         * For slide-in effect
         *
         */
        
        // if (! gridUtil.isTouchEnabled()) {
        //   $scope.grid.element.on('mouseenter mouseleave', function() {
        //     $elm.toggleClass('in');
        //   });
        // }
        // else {
        //   $elm.addClass('in');
        // }

        // $scope.grid.element.on('mouseout', function() {
        //   $log.debug('mouseout!');
        //   $elm.removeClass('in');
        // });

        
        /**
         *
         * Remove all 
         *
         */

        $elm.on('$destroy', function() {
          scrollDereg();
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
          $elm.unbind('mousedown');

          // For fancy slide-in effect above
          // $scope.grid.element.unbind('mouseenter');
          // $scope.grid.element.unbind('mouseleave');
        });
      }
    };
  }]);

})();