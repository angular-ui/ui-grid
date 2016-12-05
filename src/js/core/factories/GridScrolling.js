(function() {
  'use strict';

  angular.module('ui.grid')
    .factory('gridScrolling', ['$window', 'gridUtil', 'uiGridConstants',
      function($window, gridUtil, uiGridConstants) {
        var isAnimating;

        /**
         *  @ngdoc object
         *  @name initiated
         *  @propertyOf  ui.grid.class:gridScrolling
         *  @description Keeps track of which type of scrolling event has been initiated
         *  and sets it to NONE, when no event is being triggered.
         */
        gridScrolling.initiated = uiGridConstants.scrollType.NONE;

        /**
         * @ngdoc function
         * @name ui.grid.class:gridScrolling
         * @description gridScrolling is a wrapper service that takes over the default scrolling logic in order to
         * ensure that grid scrolling works consistently in both the browser and devices, as well as slow machines.
         * @param {object} element Element being scrolled
         * @param {function} scrollHandler Function that needs to be called when scrolling happens.
         */
        function gridScrolling(element, scrollHandler) {
          var pointX, pointY, startTime, startX, startY, maxScroll,
            scroller = element[0].children[0],
            initType = {
              touchstart: uiGridConstants.scrollType.TOUCHABLE,
              touchmove: uiGridConstants.scrollType.TOUCHABLE,
              touchend: uiGridConstants.scrollType.TOUCHABLE,

              mousedown: uiGridConstants.scrollType.MOUSE,
              mousemove: uiGridConstants.scrollType.MOUSE,
              mouseup: uiGridConstants.scrollType.MOUSE,

              pointerdown: uiGridConstants.scrollType.POINTER,
              pointermove: uiGridConstants.scrollType.POINTER,
              pointerup: uiGridConstants.scrollType.POINTER
            };

          if ('onmousedown' in $window) {
            element.on('scroll', scrollHandler);
          }

          if (gridUtil.isTouchEnabled()) {
            element.on('touchstart', start);
            element.on('touchmove', move);
            element.on('touchcancel', end);
            element.on('touchend', end);
            document.addEventListener('touchmove', function(e) {
              e.preventDefault();
            }, false);
          }

          /**
           * @ngdoc function
           * @name start
           * @methodOf ui.grid.class:gridScrolling
           * @description Gets the current coordinates and time, as well as the target coordinate
           * and initializes the scrolling event
           * @param {object} event The event object
           */
          function start(event) {
            var point = event.touches ? event.touches[0] : event;

            element.off('scroll', scrollHandler);

            gridScrolling.initiated = initType[event.type];

            pointX = point.pageX;
            pointY = point.pageY;

            startTime = (new Date()).getTime();
            startX = element[0].scrollLeft;
            startY = element[0].scrollTop;
            isAnimating = false;
          }

          /**
           * @ngdoc function
           * @name calcNewMove
           * @methodOf ui.grid.class:gridScrolling
           * @description Calculates the next position of the element for a particular axis
           * based on the delta.
           * @param {number} scrollPos The original position of the element.
           * @param {number} delta The amount the pointer moved.
           * @param {number} axis The original position.
           * @returns {number} The next position of the element.
           */
          function calcNewMove(scrollPos, delta, axis) {
            var newMove = scrollPos + delta;

            if (newMove < 0 || newMove > getMaxScroll()[axis]) {
              newMove = newMove < 0 ? 0 : getMaxScroll()[axis];
            }

            return newMove;
          }

          /**
           * @ngdoc function
           * @name move
           * @methodOf ui.grid.class:gridScrolling
           * @description Calculates what the next move should be and starts the scrolling.
           * @param {object} event The event object
           */
          function move(event) {
            if (initType[event.type] !== gridScrolling.initiated) {
              return;
            }

            var newX, newY, timestamp = (new Date()).getTime(),
              point = event.touches ? event.touches[0] : event,
              deltaX = pointX - point.pageX,
              deltaY = pointY - point.pageY;

            pointX = point.pageX;
            pointY = point.pageY;

            newX = calcNewMove(element[0].scrollLeft, deltaX, 'x');
            newY = calcNewMove(element[0].scrollTop, deltaY, 'y');

            if (timestamp - startTime > 300) {
              startTime = (new Date()).getTime();
              startX = newX;
              startY = newY;
            }

            translate(newX, newY, element);

            scrollHandler.call(null, event);
          }

          /**
           * @ngdoc function
           * @name end
           * @methodOf ui.grid.class:gridScrolling
           * @description Finishes the scrolling animation.
           * @param {object} event The event object
           */
          function end(event) {
            if (initType[event.type] !== gridScrolling.initiated) {
              return;
            }

            var duration = (new Date()).getTime() - startTime,
              momentumX = momentum(element[0].scrollLeft, startX, duration),
              momentumY = momentum(element[0].scrollTop, startY, duration),
              newX = momentumX.destination,
              newY = momentumY.destination,
              time = Math.max(momentumX.duration, momentumY.duration);

            animate(newX, newY, time, element, scrollHandler.bind(null, event));

            gridScrolling.initiated = uiGridConstants.scrollType.NONE;
          }

          /**
           * @ngdoc function
           * @name momentum
           * @methodOf ui.grid.class:gridScrolling
           * @description Calculates current momentum of the scrolling based on the current position of the element,
           * its initial position and the duration of this movement.
           * @param {number} curr The current position of the element
           * @param {number} start The original position of the element
           * @param {number} time The time it has taken for the element to get to its current position.
           * @returns {object} An object with the next position for the element and how long
           * that animation should take.
           */
          function momentum(curr, start, time) {
            curr = Math.abs(curr);
            start = Math.abs(start);

            var distance = curr - start,
              speed = Math.abs(distance) / time,
              deceleration = 0.0007,
              destination = curr + (speed * speed) / (2 * deceleration) * (distance >= 0 ? 1 : -1),
              duration = speed / deceleration;

            return {
              destination: Math.round(destination),
              duration: duration
            };
          }

          /**
           * @ngdoc function
           * @name getMaxScroll
           * @methodOf ui.grid.class:gridScrolling
           * @description Gets the limit of the scrolling for both the x and y positions.
           * @returns {object} An object with the x and y scroll limits.
           */
          function getMaxScroll() {
            if (!maxScroll) {
              maxScroll = {
                x: scroller.offsetWidth - element[0].clientWidth,
                y: scroller.offsetHeight - element[0].clientHeight
              };
            }
            return maxScroll;
          }
        }

        /**
         * @ngdoc function
         * @name translate
         * @methodOf ui.grid.class:gridScrolling
         * @description Updates the element's scroll position.
         * @param {number} x The horizontal position of the element
         * @param {number} y The vertical position of the element
         * @param {object} element The element being updated
         */
        function translate(x, y, element) {
          element[0].scrollLeft = x;
          element[0].scrollTop = y;
        }

        /**
         * @ngdoc function
         * @name easeClb
         * @methodOf ui.grid.class:gridScrolling
         * @description Calculates the ease resolution base on the current animation times.
         * @param {number} relPoint The time the animation is taking between frames.
         * @returns {number} The ideal ease time.
         */
        function easeClb(relPoint) {
          return relPoint * ( 2 - relPoint );
        }

        /**
         * @ngdoc function
         * @name calcNewPos
         * @methodOf ui.grid.class:gridScrolling
         * @description Calculates the new position of the element based on where it started, the animation time
         * and where it is ultimately supposed to end up.
         * @param {number} destPos The destination.
         * @param {number} easeRes The ideal ease time.
         * @param {number} startPos The original position.
         * @returns {number} The next position of the element.
         */
        function calcNewPos(destPos, easeRes, startPos) {
          return ( destPos - Math.abs(startPos) ) * easeRes + Math.abs(startPos);
        }

        /**
         * @ngdoc function
         * @name animate
         * @methodOf ui.grid.class:gridScrolling
         * @description Calculates the ease resolution base on the current animation times.
         * @param {number} destX The coordinate of the x axis that the scrolling needs to animate to.
         * @param {number} destY The coordinate of the y axis that the scrolling needs to animate to.
         * @param {number} duration The animation duration
         * @param {object} element The element being updated
         * @param {function} callback Function that needs to be called when the animation is done.
         */
        function animate(destX, destY, duration, element, callback) {
          var startTime = (new Date()).getTime(),
            startX = element[0].scrollLeft,
            startY = element[0].scrollTop,
            destTime = startTime + duration;

          isAnimating = true;

          next();

          function next() {
            var now = (new Date()).getTime(),
              relPoint, easeRes, newX, newY;

            if (now >= destTime) {
              isAnimating = false;
              translate(destX, destY, element);
              element.on('scroll', callback);
              return;
            }

            relPoint = (now - startTime) / duration;

            easeRes = easeClb(relPoint);

            newX = calcNewPos(destX, easeRes, startX);
            newY = calcNewPos(destY, easeRes, startY);

            translate(newX, newY, element);

            callback.call();

            if (isAnimating) {
              window.requestAnimationFrame(next);
            } else {
              element.on('scroll', callback);
            }
          }
        }

        return gridScrolling;
      }]);
})();
