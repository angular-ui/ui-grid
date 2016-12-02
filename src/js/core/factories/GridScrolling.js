(function() {
  'use strict';

  angular.module('ui.grid')
    .factory('gridScrolling', function($window, gridUtil) {
      var isAnimating;

      /**
       *  @ngdoc object
       *  @name initiated
       *  @propertyOf  ui.grid.class:gridScrolling
       *  @description Keeps track of which type of scrolling event has been initiated
       *  and sets it to 0, when no event is being triggered.
       */
      gridScrolling.initiated = 0;

      /**
       * @ngdoc function
       * @name ui.grid.class:gridScrolling
       * @description gridScrolling is a wrapper service that takes over the default scrolling logic in order to
       * ensure that grid scrolling works consistently in both the browser and devices, as well as slow machines.
       * @param {object} element Element being scrolled
       * @param {function} scrollHandler Function that needs to be called when scrolling happens.
       */
      function gridScrolling(element, scrollHandler) {
        var wrapper = element, pointX, pointY, startTime, startX, startY,
          scroller = wrapper[0].children[0],
          TOUCHABLE = 1,
          MOUSE = 2,
          POINTER = 3,
          maxScroll,
          initType = {
            touchstart: TOUCHABLE,
            touchmove: TOUCHABLE,
            touchend: TOUCHABLE,

            mousedown: MOUSE,
            mousemove: MOUSE,
            mouseup: MOUSE,

            pointerdown: POINTER,
            pointermove: POINTER,
            pointerup: POINTER
          };

        if ('onmousedown' in $window) {
          wrapper.on('scroll', scrollHandler);
        }

        if (gridUtil.isTouchEnabled()) {
          wrapper.on('touchstart', start);
          wrapper.on('touchmove', move);
          wrapper.on('touchcancel', end);
          wrapper.on('touchend', end);
          document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
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

          wrapper.off('scroll', scrollHandler);

          gridScrolling.initiated = initType[event.type];

          pointX = point.pageX;
          pointY = point.pageY;

          startTime = (new Date()).getTime();
          startX    = wrapper[0].scrollLeft;
          startY    = wrapper[0].scrollTop;
          isAnimating = false;
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
            point		= event.touches ? event.touches[0] : event,
            deltaX = pointX - point.pageX,
            deltaY = pointY - point.pageY;

          pointX = point.pageX;
          pointY = point.pageY;

          newX = wrapper[0].scrollLeft + deltaX;
          newY = wrapper[0].scrollTop + deltaY;

          if ( newX < 0 || newX > getMaxScroll().x ) {
            newX = newX < 0 ? 0 : getMaxScroll().x;
          }

          if ( newY < 0 || newY > getMaxScroll().y ) {
            newY = newY < 0 ? 0 : getMaxScroll().y;
          }

          if (timestamp - startTime > 300) {
            startTime = (new Date()).getTime();
            startX = newX;
            startY = newY;
          }

          translate(newX, newY, wrapper);

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
          if ( initType[event.type] !== gridScrolling.initiated ) {
            return;
          }

          var duration = (new Date()).getTime() - startTime,
            momentumX = momentum(wrapper[0].scrollLeft, startX, duration),
            momentumY = momentum(wrapper[0].scrollTop, startY, duration),
            newX = momentumX.destination,
            newY = momentumY.destination,
            time = Math.max(momentumX.duration, momentumY.duration);

          animate(newX, newY, time, wrapper, scrollHandler.bind(null, event));

          gridScrolling.initiated = 0;
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
            speed = Math.abs(distance)/time,
            deceleration = 0.0007,
            destination = curr + (speed * speed)/(2 * deceleration)* (distance >= 0 ? 1 : -1),
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
         */
        function getMaxScroll() {
          if (!maxScroll) {
            maxScroll = {
              x: scroller.offsetWidth - wrapper[0].clientWidth,
              y: scroller.offsetHeight - wrapper[0].clientHeight
            };
          }
          return maxScroll;
        }
      }

      /**
       * @ngdoc function
       * @name translate
       * @methodOf ui.grid.class:gridScrolling
       * @description Updates the wrapper's scroll position.
       * @param {number} x The horizontal position of the wrapper
       * @param {number} y The vertical position of the wrapper
       * @param {object} wrapper The wrapper element being updated
       */
      function translate(x, y, wrapper) {
        wrapper[0].scrollLeft = x;
        wrapper[0].scrollTop = y;
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
       * @name animate
       * @methodOf ui.grid.class:gridScrolling
       * @description Calculates the ease resolution base on the current animation times.
       * @param {number} destX The coordinate of the x axis that the scrolling needs to animate to.
       * @param {number} destY The coordinate of the y axis that the scrolling needs to animate to.
       * @param {number} duration The animation duration
       * @param {object} wrapper The wrapper element being updated
       * @param {function} callback Function that needs to be called when the animation is done.
       */
      function animate(destX, destY, duration, wrapper, callback) {
        var startTime = (new Date()).getTime(),
          startX = wrapper[0].scrollLeft,
          startY = wrapper[0].scrollTop,
          destTime = startTime + duration;

        isAnimating = true;

        next();

        function next() {
          var now = (new Date()).getTime(),
            relPoint, easeRes, newX, newY;

          if (now >= destTime) {
            isAnimating = false;
            translate(destX, destY, wrapper);
            wrapper.on('scroll', callback);
            return;
          }

          relPoint = (now - startTime) / duration;

          easeRes = easeClb(relPoint);

          newX = ( destX - Math.abs(startX) ) * easeRes + Math.abs(startX);
          newY = ( destY - Math.abs(startY) ) * easeRes + Math.abs(startY);

          translate(newX, newY, wrapper);

          callback.call();

          if (isAnimating) {
            window.requestAnimationFrame(next);
          } else {
            wrapper.on('scroll', callback);
          }
        }
      }

      return gridScrolling;
    });
})();
