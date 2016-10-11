(function() {
  'use strict';

  angular.module('ui.grid')
    .factory('GridScrolling', function($window, gridUtil) {
      var isAnimating;

      myScrolling.initiated = 0;

      return myScrolling;

      function myScrolling(elm, scrollHandler) {
        var wrapper = elm, pointX, pointY, startTime, startX, startY,
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

        function start(e) {
          var point = e.touches ? e.touches[0] : e;

          wrapper.off('scroll', scrollHandler);

          myScrolling.initiated = initType[e.type];

          pointX = point.pageX;
          pointY = point.pageY;

          startTime = (new Date()).getTime();
          startX    = wrapper[0].scrollLeft;
          startY    = wrapper[0].scrollTop;
          isAnimating = false;

        }

        function move(e) {
          if (initType[e.type] !== myScrolling.initiated) {
            return;
          }

          var newX, newY, timestamp = (new Date()).getTime(),
            point		= e.touches ? e.touches[0] : e,
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

          scrollHandler.call(null, e);

        }

        function end(e) {
          if ( initType[e.type] !== myScrolling.initiated ) {
            return;
          }

          var duration = (new Date()).getTime() - startTime;

          var momentumX = momentum(wrapper[0].scrollLeft, startX, duration);
          var momentumY = momentum(wrapper[0].scrollTop, startY, duration);
          var newX = momentumX.destination;
          var newY = momentumY.destination;
          var time = Math.max(momentumX.duration, momentumY.duration);

          animate(newX, newY, time, wrapper, scrollHandler.bind(null, e));

          myScrolling.initiated = 0;
        }

        function momentum(curr, start, time) {
          curr = Math.abs(curr);
          start = Math.abs(start);

          var distance = curr - start,
            speed = Math.abs(distance)/time,
            deceleration = 0.0007;

          var destination = curr + (speed * speed)/(2 * deceleration)* (distance >= 0 ? 1 : -1);
          var duration = speed / deceleration;

          return {
            destination: Math.round(destination),
            duration: duration
          };
        }

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

      function translate(x, y, wrapper) {
        wrapper[0].scrollLeft = x;
        wrapper[0].scrollTop = y;
      }

      function easeClb(k) {
        return k * ( 2 - k );
      }

      function animate(destX, destY, duration, wrapper, clbck) {
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
            wrapper.on('scroll', clbck);
            return;
          }

          relPoint = (now - startTime) / duration;

          easeRes = easeClb(relPoint);

          newX = ( destX - Math.abs(startX) ) * easeRes + Math.abs(startX);
          newY = ( destY - Math.abs(startY) ) * easeRes + Math.abs(startY);

          translate(newX, newY, wrapper);

          clbck.call();

          if (isAnimating) {
            window.requestAnimationFrame(next);
          } else {
            wrapper.on('scroll', clbck);
          }
        }
      }
    });
})();
