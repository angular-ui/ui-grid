(function () {
  'use strict';

  describe('uiGridScroller', function() {
    var element, scrollHandler, gridUtil, uiGridScroller, uiGridScrollerConstants;

    beforeEach(function() {
      element = {
        0: {
          children: {
            0: {}
          }
        },
        on: jasmine.createSpy('on'),
        off: jasmine.createSpy('off')
      };
      scrollHandler = jasmine.createSpy('scrollHandler');

      module('ui.grid.customScrolling');

      inject(function(_uiGridScroller_, _uiGridScrollerConstants_, _gridUtil_) {
        uiGridScroller = _uiGridScroller_;
        uiGridScrollerConstants = _uiGridScrollerConstants_;
        gridUtil = _gridUtil_;
      });

      spyOn(window, 'requestAnimationFrame').and.callFake(angular.noop);
    });

    describe('when gridUtils.isTouchEnabled returns true', function() {
      var preventDefaultSpy;

      beforeEach(function() {
        spyOn(gridUtil, 'isTouchEnabled').and.returnValue(true);
        preventDefaultSpy = jasmine.createSpy('preventDefault');

        element.on.and.callFake(function(eventName, callback) {
          switch (eventName) {
            case 'touchstart':
              callback({
                type: eventName,
                touches: [true]
              });
              break;
            case 'touchmove':
              callback({
                type: eventName,
                touches: [true],
                preventDefault: preventDefaultSpy
              });
              break;
            case 'touchend':
              callback({
                type: eventName,
                touches: [true]
              });
              break;
            case 'touchcancel':
              callback({
                type: eventName,
                touches: [true]
              });
              break;
          }
        });
        uiGridScroller(element, scrollHandler);
      });
      it('should initialize uiGridScroller.initiated to NONE', function() {
        expect(uiGridScroller.initiated).toEqual(uiGridScrollerConstants.scrollType.NONE);
      });
      xdescribe('events', function() {
        describe('on touchstart', function() {
          beforeEach(function() {
            uiGridScroller(element, scrollHandler);
          });
          it('should be initialized', function() {
            expect(element.on).toHaveBeenCalledWith('touchstart', jasmine.any(Function));
          });
          it('should remove the scroll event from the element', function() {
            expect(element.off).toHaveBeenCalledWith('scroll', scrollHandler);
          });
        });
        xdescribe('on touchmove', function() {
          beforeEach(function() {
            uiGridScroller.initiated = uiGridScrollerConstants.scrollType.TOUCHABLE;
            uiGridScroller(element, scrollHandler);
          });
          it('should be initialized', function() {
            expect(element.on).toHaveBeenCalledWith('touchmove', jasmine.any(Function));
          });
          it('should prevent the default behavior', function() {
            expect(preventDefaultSpy).toHaveBeenCalled();
          });
          it('should call the scrollHandler', function() {
            expect(scrollHandler).toHaveBeenCalled();
          });
        });
        function testEndFunction() {
          xdescribe('when the uiGridScroller has been initiated with a touch event', function() {
            beforeEach(function() {
              uiGridScroller.initiated = uiGridScrollerConstants.scrollType.TOUCHABLE;
              uiGridScroller(element, scrollHandler);
            });
            it('should update the uiGridScroller.initiated value to NONE', function() {
              expect(uiGridScroller.initiated).toEqual(uiGridScrollerConstants.scrollType.NONE);
            });
          });
        }
        describe('on touchend', function() {
          it('should be initialized', function() {
            expect(element.on).toHaveBeenCalledWith('touchend', jasmine.any(Function));
          });
          testEndFunction();
        });
        describe('on touchcancel', function() {
          it('should be initialized', function() {
            expect(element.on).toHaveBeenCalledWith('touchcancel', jasmine.any(Function));
          });
          testEndFunction();
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
