(function () {
  'use strict';

  describe('uiGridScroller', function() {
    var element, scrollHandler, gridUtil, uiGridScroller, uiGridScrollerConstants;

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
