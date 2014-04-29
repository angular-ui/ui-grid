(function(){
// 'use strict';

  angular.module('ui.grid').directive('uiGridScrollbar', ['$log', '$document', 'uiGridConstants', 'gridUtil', function($log, $document, uiGridConstants, gridUtil) {
    return {
      replace: true,
      // priority: 1000,
      templateUrl: 'ui-grid/ui-grid-scrollbar',
      require: '?^uiGrid',
      scope: {
        'type': '@'
      },
      link: function($scope, $elm, $attrs, uiGridCtrl) {
        var self = this;

        if (uiGridCtrl === undefined) {
          throw new Error('[ui-grid-scrollbar] uiGridCtrl is undefined!');
        }

        $log.debug('ui-grid-scrollbar link', $scope.type);

        uiGridCtrl.scrollbars.push($elm);

        /**
         * Link stuff
         */

        if ($scope.type === 'vertical') {
          $elm.addClass('ui-grid-scrollbar-vertical');
        }
        else if ($scope.type === 'horizontal') {
          uiGridCtrl.horizontalScrollbar = self;

          $elm.addClass('ui-grid-scrollbar-horizontal');
        }

        // Get the scrolling class from the "scrolling-class" attribute
        var scrollingClass;
        $attrs.$observe('scrollingClass', function(n, o) {
          if (n) {
            scrollingClass = n;
          }
        });

        // Show the scrollbar when the mouse hovers the grid, hide it when it leaves UNLESS we're currently scrolling.
        //   record when we're in or outside the grid for the mouseup event handler
        var mouseInGrid;
        function gridMouseEnter() {
          mouseInGrid = true;
          $elm.addClass('ui-grid-scrollbar-visible');

          $document.on('mouseup', mouseup);
        }
        uiGridCtrl.grid.element.on('mouseenter', gridMouseEnter);

        function gridMouseLeave() {
          mouseInGrid = false;
          if (!uiGridCtrl.grid.isScrolling()) {
            $elm.removeClass('ui-grid-scrollbar-visible');
          }
        }
        uiGridCtrl.grid.element.on('mouseleave', gridMouseLeave);

        /**
         *
         * Scrollbar sizing
         *
         */

        // Size the scrollbar according to the amount of data. 35px high minimum, otherwise scale inversely proportinal to canvas vs viewport height
        function updateVerticalScrollbar(gridScope) {
          var scrollbarHeight = Math.floor(Math.max(35, uiGridCtrl.grid.getViewportHeight() / uiGridCtrl.grid.getCanvasHeight() * uiGridCtrl.grid.getViewportHeight()));
          uiGridCtrl.grid.verticalScrollbarStyles = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-scrollbar-vertical { height: ' + scrollbarHeight + 'px; }';
        }

        function updateHorizontalScrollbar(gridScope) {
          var minWidth = 35;
          var scrollbarWidth = Math.floor(
                                 Math.max(
                                   minWidth,
                                   uiGridCtrl.grid.getViewportWidth() / uiGridCtrl.grid.getCanvasWidth() * uiGridCtrl.grid.getViewportWidth()
                                 )
                               );

          scrollbarWidth = isNaN(scrollbarWidth) ? minWidth : scrollbarWidth;

          uiGridCtrl.grid.horizontalScrollbarStyles = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-scrollbar-horizontal { width: ' + scrollbarWidth + 'px; }';
        }

        if ($scope.type === 'vertical') {
          uiGridCtrl.grid.registerStyleComputation({
            priority: 10,
            func: updateVerticalScrollbar
          });
        }
        else if ($scope.type === 'horizontal') {
          uiGridCtrl.grid.registerStyleComputation({
            priority: 10,
            func: updateHorizontalScrollbar
          });
        }

        // Only show the scrollbar when the canvas height is less than the viewport height
        $scope.showScrollbar = function() {
          if ($scope.type === 'vertical') {
            return uiGridCtrl.grid.getCanvasHeight() > uiGridCtrl.grid.getViewportHeight();
          }
          else if ($scope.type === 'horizontal') {
            return uiGridCtrl.grid.getCanvasWidth() > uiGridCtrl.grid.getViewportWidth(); 
          }
        };

        var getElmSize = function() {
          if ($scope.type === 'vertical') {
            return gridUtil.elementHeight($elm, 'margin');
          }
          else if ($scope.type === 'horizontal') {
            return gridUtil.elementWidth($elm, 'margin');
          }
        };

        var getElmMaxBound = function() {
          if ($scope.type === 'vertical') {
            return uiGridCtrl.grid.getViewportHeight() - getElmSize();
          }
          else if ($scope.type === 'horizontal') {
            return uiGridCtrl.grid.getViewportWidth() - getElmSize();
          }
        };


        /**
         *
         * Scrollbar movement and grid scrolling
         *
         */

        var startY = 0,
            startX = 0,
            y = 0,
            x = 0;

        // Get the height of the scrollbar, including its margins
        // var elmHeight = gridUtil.elementHeight($elm, 'margin');
        

        // Get the "bottom boundary" which the scrollbar cannot scroll past (which is the viewport height minus the height of the scrollbar)
        // var elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;
        // var elmSize = getElmSize();
        var elmMaxBound = getElmMaxBound();
        

        // On mousedown on the scrollbar, listen for mousemove events to scroll and mouseup events to unbind the move and mouseup event
        function mousedown(event) {
          // Prevent default dragging of selected content
          event.preventDefault();

          uiGridCtrl.grid.setScrolling(true);

          $elm.addClass(scrollingClass);

          // Get the height of the element in case it changed (due to canvas/viewport resizing)
          // elmHeight = gridUtil.elementHeight($elm, 'margin');
          // elmSize = getElmSize();

          // Get the bottom boundary again
          // elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;
          elmMaxBound = getElmMaxBound();

          // Store the Y value of where we're starting
          startY = event.screenY - y;
          startX = event.screenX - x;

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        }

        // Bind to the mousedown event
        $elm.on('mousedown', mousedown);

        // Emit a scroll event when we move the mouse while scrolling
        function mousemove(event) {
          // The delta along the Y axis
          y = event.screenY - startY;
          x = event.screenX - startX;

          // Make sure the value does not go above the grid or below the bottom boundary

          var scrollArgs = { target: $elm };
          if ($scope.type === 'vertical') {
            if (y < 0) { y = 0; }
            if (y > elmMaxBound) { y = elmMaxBound; }
            
            var scrollPercentageY = y / elmMaxBound;

            scrollArgs.y = { percentage: scrollPercentageY, pixels: y };
          }
          else if ($scope.type === 'horizontal') {
            if (x < 0) { x = 0; }
            if (x > elmMaxBound) { x = elmMaxBound; }
            
            var scrollPercentageX = x / elmMaxBound;

            scrollArgs.x = { percentage: scrollPercentageX, pixels: x };
          }

          // The percentage that we've scrolled is the y axis delta divided by the total scrollable distance (which is the same as the bottom boundary)
          
          $scope.$emit(uiGridConstants.events.GRID_SCROLL, scrollArgs);
        }

        // Bind to the scroll event which can come from the body (mouse wheel/touch events), or other places
        var scrollDereg = $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
          // Make sure the percentage is normalized within the range 0-1

          var scrollPercentage;
          if ($scope.type === 'vertical') {
            // Skip if no scroll on Y axis
            if (!args.y) {
              return;
            }
            scrollPercentage = args.y.percentage;
          }
          else if ($scope.type === 'horizontal') {
            // Skip if no scroll on X axis
            if (!args.x) {
              return;
            }
            scrollPercentage = args.x.percentage;
          }

          if (scrollPercentage < 0) { scrollPercentage = 0; }
          if (scrollPercentage > 1) { scrollPercentage = 1; }

          // Get the height of the element in case it changed (due to canvas/viewport resizing)
          // elmSize = getElmSize();

          // Get the bottom bound again
          elmMaxBound = getElmMaxBound();

          // The new top value for the scrollbar is the percentage of scroll multiplied by the bottom boundary
          var newScrollPosition = scrollPercentage * elmMaxBound;

          // Prevent scrollbar from going beyond container
          // if (newTop > uiGridCtrl.grid.getCanvasHeight() - elmHeight) {
          //   newTop = uiGridCtrl.grid.getCanvasHeight() - elmHeight;
          // }

          // Store the new top in the y value
          if ($scope.type === 'vertical') {
            y = newScrollPosition;

            // Set the css for top
            $elm.css({
              top: y + 'px'
            });
          }
          else {
            x = newScrollPosition;
            $elm.css({
              left: x + 'px'
            });
          }
        });
  
        // When the user lets go of the mouse...
        function mouseup() {
          // Remove the "scrolling" class, if any
          $elm.removeClass(scrollingClass);

          if (!mouseInGrid) {
            $elm.removeClass('ui-grid-scrollbar-visible');
          }

          uiGridCtrl.grid.setScrolling(false);

          // Unbind the events we bound to the document
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }


        /**
         *
         * For slide-in effect
         *
         */
        
        // if (!gridUtil.isTouchEnabled()) {
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
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
          $elm.unbind('mousedown');
          uiGridCtrl.grid.element.off('mouseenter', gridMouseEnter);
          uiGridCtrl.grid.element.off('mouseleave', gridMouseLeave);

          // For fancy slide-in effect above
          // $scope.grid.element.unbind('mouseenter');
          // $scope.grid.element.unbind('mouseleave');
        });
      }
    };
  }]);

})();