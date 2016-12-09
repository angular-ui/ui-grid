(function () {
  'use strict';

  describe('uiGridScroller', function() {
    var element, scrollHandler, gridUtil, uiGridScroller, uiGridScrollerConstants,
      callbacks = {};

    beforeEach(function() {
      element = {
        0: {
          scrollTop: 0,
          scrollLeft: 0,
          clientWidth: 300,
          clientHeight: 300,
          children: {
            0: {
              offsetWidth: 300,
              offsetHeight: 300
            }
          }
        },
        on: jasmine.createSpy('on').and.callFake(function(eventName, callback) {
          callbacks[eventName] = callback;
        }),
        off: jasmine.createSpy('off'),
        trigger: function(eventName, args) {
          args.type = eventName;
          callbacks[eventName](args);
        }
      };
      scrollHandler = jasmine.createSpy('scrollHandler');

      module('ui.grid.customScrolling');

      inject(function(_uiGridScroller_, _uiGridScrollerConstants_, _gridUtil_) {
        uiGridScroller = _uiGridScroller_;
        uiGridScrollerConstants = _uiGridScrollerConstants_;
        gridUtil = _gridUtil_;
      });

      spyOn(window, 'requestAnimationFrame').and.callFake(jasmine.createSpy('requestAnimationFrame'));
    });

    describe('when gridUtils.isTouchEnabled returns true', function() {
      beforeEach(function() {
        spyOn(gridUtil, 'isTouchEnabled').and.returnValue(true);
        uiGridScroller(element, scrollHandler);
      });
      it('should initialize uiGridScroller.initiated to NONE', function() {
        expect(uiGridScroller.initiated).toEqual(uiGridScrollerConstants.scrollType.NONE);
      });
      it('should initialize touchstart', function() {
        expect(element.on).toHaveBeenCalledWith('touchstart', jasmine.any(Function));
      });
      it('should initialize touchmove', function() {
        expect(element.on).toHaveBeenCalledWith('touchmove', jasmine.any(Function));
      });
      it('should initialize touchend', function() {
        expect(element.on).toHaveBeenCalledWith('touchend', jasmine.any(Function));
      });
      it('should initialize touchcancel', function() {
        expect(element.on).toHaveBeenCalledWith('touchcancel', jasmine.any(Function));
      });
      describe('events', function() {
        describe('on touchstart', function() {
          beforeEach(function() {
            element.trigger('touchstart', {
              touches: [{
                pageX: 0,
                pageY: 0
              }]
            });
          });
          it('should remove the scroll event from the element', function() {
            expect(element.off).toHaveBeenCalledWith('scroll', scrollHandler);
          });
          it('should update the uiGridScroller.initiated value to TOUCHABLE', function() {
            expect(uiGridScroller.initiated).toEqual(uiGridScrollerConstants.scrollType.TOUCHABLE);
          });
          it('should update the uiGridScroller.isAnimating value to false', function() {
            expect(uiGridScroller.isAnimating).toBe(false);
          });
        });
        describe('on touchmove', function() {
          var preventDefaultSpy;

          beforeEach(function() {
            preventDefaultSpy = jasmine.createSpy('preventDefault');
          });
          describe('when the uiGridScroller has been initiated with a touch event', function() {
            beforeEach(function() {
              uiGridScroller.initiated = uiGridScrollerConstants.scrollType.TOUCHABLE;
              element.trigger('touchmove', {
                touches: [{
                  pageX: 0,
                  pageY: 0
                }],
                preventDefault: preventDefaultSpy
              });
            });
            it('should prevent the default behavior', function() {
              expect(preventDefaultSpy).toHaveBeenCalled();
            });
            it('should call the scrollHandler', function() {
              expect(scrollHandler).toHaveBeenCalled();
            });
          });
          describe('when the uiGridScroller has not been initiated with a touch event', function() {
            beforeEach(function() {
              uiGridScroller.initiated = uiGridScrollerConstants.scrollType.NONE;
              element.trigger('touchmove', {
                touches: [{
                  pageX: 0,
                  pageY: 0
                }],
                preventDefault: preventDefaultSpy
              });
            });
            it('should prevent the default behavior', function() {
              expect(preventDefaultSpy).toHaveBeenCalled();
            });
            it('should not call the scrollHandler', function() {
              expect(scrollHandler).not.toHaveBeenCalled();
            });
          });
        });
        function testEndFunction(eventName) {
          describe('when the uiGridScroller has been initiated with a touch event', function() {
            beforeEach(function() {
              uiGridScroller.isAnimating = false;
              uiGridScroller.initiated = uiGridScrollerConstants.scrollType.TOUCHABLE;
              element.trigger(eventName, {
                touches: [{
                  pageX: 0,
                  pageY: 0
                }]
              });
            });
            it('should update the uiGridScroller.initiated value to NONE', function() {
              expect(uiGridScroller.initiated).toEqual(uiGridScrollerConstants.scrollType.NONE);
            });
            it('should update the uiGridScroller.isAnimating value to true', function() {
              expect(uiGridScroller.isAnimating).toBe(true);
            });
            it('should call requestAnimationFrame in the window', function() {
              expect(window.requestAnimationFrame).toHaveBeenCalled();
            });
          });
          describe('when the uiGridScroller has not been initiated with a touch event', function() {
            beforeEach(function() {
              uiGridScroller.isAnimating = false;
              uiGridScroller.initiated = uiGridScrollerConstants.scrollType.MOUSE;
              element.trigger(eventName, {
                touches: [{
                  pageX: 0,
                  pageY: 0
                }]
              });
            });
            it('should not update the uiGridScroller.initiated value', function() {
              expect(uiGridScroller.initiated).toEqual(uiGridScrollerConstants.scrollType.MOUSE);
            });
            it('should not update the uiGridScroller.isAnimating value', function() {
              expect(uiGridScroller.isAnimating).toBe(false);
            });
            it('should not call requestAnimationFrame in the window', function() {
              expect(window.requestAnimationFrame).not.toHaveBeenCalled();
            });
          });
        }
        describe('on touchend', function() {
          testEndFunction('touchend');
        });
        describe('on touchcancel', function() {
          testEndFunction('touchcancel');
        });
      });
      afterEach(function() {
        element.on.calls.reset();
        element.off.calls.reset();
        gridUtil.isTouchEnabled.calls.reset();
      });
    });

    describe('when gridUtils.isTouchEnabled returns false', function() {
      beforeEach(function() {
        spyOn(gridUtil, 'isTouchEnabled').and.returnValue(false);
        uiGridScroller(element, scrollHandler);
      });
      it('should initialize uiGridScroller.initiated to NONE', function() {
        expect(uiGridScroller.initiated).toEqual(uiGridScrollerConstants.scrollType.NONE);
      });
      describe('events', function() {
        describe('on scroll', function() {
          it('should be initialized', function() {
            expect(element.on).toHaveBeenCalledWith('scroll', scrollHandler);
          });
        });
        describe('on touchstart', function() {
          it('should not be initialized', function() {
            expect(element.on).not.toHaveBeenCalledWith('touchstart', jasmine.any(Function));
          });
        });
        describe('on touchmove', function() {
          it('should not be initialized', function() {
            expect(element.on).not.toHaveBeenCalledWith('touchmove', jasmine.any(Function));
          });
        });
        describe('on touchend', function() {
          it('should not be initialized', function() {
            expect(element.on).not.toHaveBeenCalledWith('touchend', jasmine.any(Function));
          });
        });
        describe('on touchcancel', function() {
          it('should not be initialized', function() {
            expect(element.on).not.toHaveBeenCalledWith('touchcancel', jasmine.any(Function));
          });
        });
      });
      afterEach(function() {
        element.on.calls.reset();
        element.off.calls.reset();
        gridUtil.isTouchEnabled.calls.reset();
      });
    });

    afterEach(function() {
      uiGridScroller = null;
    });
  });
})();
