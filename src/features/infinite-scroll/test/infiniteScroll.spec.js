/* global _ */
(function() {
  'use strict';

  describe('ui.grid.infiniteScroll', function() {
    var uiGridInfiniteScrollService, grid, gridClassFactory, uiGridConstants,
      $rootScope, $scope, $timeout, $compile;

    beforeEach(function() {
      module('ui.grid');
      module('ui.grid.infiniteScroll');

      inject(function(_$rootScope_, _$timeout_, _gridClassFactory_, _uiGridConstants_, _uiGridInfiniteScrollService_) {
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        gridClassFactory = _gridClassFactory_;
        uiGridConstants = _uiGridConstants_;
        uiGridInfiniteScrollService = _uiGridInfiniteScrollService_;
      });
    });

    describe('uiGridInfiniteScrollService', function() {
      beforeEach(function() {
        $scope = $rootScope.$new();

        grid = gridClassFactory.createGrid({});

        grid.options.columnDefs = [
          {field: 'col1'}
        ];
        grid.options.infiniteScrollRowsFromEnd = 20;

        uiGridInfiniteScrollService.initializeGrid(grid, $scope);
        spyOn(grid.api.infiniteScroll.raise, 'needLoadMoreData');
        spyOn(grid.api.infiniteScroll.raise, 'needLoadMoreDataTop');

        grid.options.data = [{col1: 'a'},{col1: 'b'}];

        grid.buildColumns();
      });
      afterEach(function() {
        grid.api.infiniteScroll.raise.needLoadMoreData.calls.reset();
        grid.api.infiniteScroll.raise.needLoadMoreDataTop.calls.reset();
      });
      describe('initializeGrid', function() {
        describe('when enableInfiniteScroll is set to false', function() {
          beforeEach(function() {
            grid.options.enableInfiniteScroll = false;
            grid.options.infiniteScrollRowsFromEnd = undefined;
            grid.options.infiniteScrollUp = undefined;
            grid.options.infiniteScrollDown = false;
            grid.infiniteScroll = undefined;

            spyOn(grid.api.core.on, 'scrollEnd').and.callFake(angular.noop);
            spyOn(grid.api, 'registerEventsFromObject').and.callFake(angular.noop);
            spyOn(grid.api, 'registerMethodsFromObject').and.callFake(angular.noop);

            uiGridInfiniteScrollService.initializeGrid(grid, $scope);
          });
          afterEach(function() {
            grid.api.core.on.scrollEnd.calls.reset();
            grid.api.registerEventsFromObject.calls.reset();
            grid.api.registerMethodsFromObject.calls.reset();
          });
          it('should update the default grid options for infinite scroll', function() {
            expect(grid.options.enableInfiniteScroll).toBe(false);
            expect(grid.options.infiniteScrollRowsFromEnd).toEqual(20);
            expect(grid.options.infiniteScrollUp).toBe(false);
            expect(grid.options.infiniteScrollDown).toBe(false);
          });
          it('should not update the grid.infiniteScroll', function() {
            expect(grid.infiniteScroll).toBeUndefined();
          });
          it('should not add an event handler to scrollEnd', function() {
            expect(grid.api.core.on.scrollEnd).not.toHaveBeenCalled();
          });
          it('should not register events or methods', function() {
            expect(grid.api.registerEventsFromObject).not.toHaveBeenCalled();
            expect(grid.api.registerMethodsFromObject).not.toHaveBeenCalled();
          });
        });
        describe('when enableInfiniteScroll is set to true', function() {
          beforeEach(function() {
            grid.options.enableInfiniteScroll = true;
            grid.options.infiniteScrollRowsFromEnd = 10;
            grid.options.infiniteScrollUp = true;
            grid.options.infiniteScrollDown = true;
            grid.infiniteScroll = undefined;

            spyOn(grid.api.core.on, 'scrollEnd').and.callFake(angular.noop);
            spyOn(grid.api, 'registerEventsFromObject').and.callFake(function(events) {
              grid.api.events = events;
            });
            spyOn(grid.api, 'registerMethodsFromObject').and.callFake(function(methods) {
              grid.api.methods = methods;
            });

            uiGridInfiniteScrollService.initializeGrid(grid, $scope);
          });
          afterEach(function() {
            grid.api.core.on.scrollEnd.calls.reset();
            grid.api.registerEventsFromObject.calls.reset();
            grid.api.registerMethodsFromObject.calls.reset();
          });
          it('should update the default grid options for infinite scroll', function() {
            expect(grid.options.enableInfiniteScroll).toBe(true);
            expect(grid.options.infiniteScrollRowsFromEnd).toEqual(10);
            expect(grid.options.infiniteScrollUp).toBe(true);
            expect(grid.options.infiniteScrollDown).toBe(true);
          });
          it('should update the grid.infiniteScroll', function() {
            expect(grid.infiniteScroll.dataLoading).toBe(false);
          });
          it('should set the scroll direction based in the grid options', function() {
            expect(grid.infiniteScroll.scrollUp).toBe(grid.options.infiniteScrollUp);
            expect(grid.suppressParentScrollUp).toBe(grid.options.infiniteScrollUp);
            expect(grid.infiniteScroll.scrollDown).toBe(grid.options.infiniteScrollDown);
            expect(grid.suppressParentScrollDown).toBe(grid.options.infiniteScrollDown);
          });
          it('should add an event handler to scrollEnd', function() {
            expect(grid.api.core.on.scrollEnd).toHaveBeenCalled();
          });
          it('should register events and methods', function() {
            expect(grid.api.registerEventsFromObject).toHaveBeenCalled();
            expect(grid.api.events.infiniteScroll).toBeDefined();
            expect(grid.api.registerMethodsFromObject).toHaveBeenCalled();
            expect(grid.api.methods.infiniteScroll).toBeDefined();
          });
          describe('public API events', function() {
            it('should define a needLoadMoreData function that does nothing', function() {
              expect(angular.isFunction(grid.api.events.infiniteScroll.needLoadMoreData)).toBe(true);
              expect(grid.api.events.infiniteScroll.needLoadMoreData()).toBeUndefined();
            });
            it('should define a needLoadMoreDataTop function', function() {
              expect(angular.isFunction(grid.api.events.infiniteScroll.needLoadMoreDataTop)).toBe(true);
              expect(grid.api.events.infiniteScroll.needLoadMoreDataTop()).toBeUndefined();
            });
          });
          describe('public API methods', function() {
            var scrollUp, scrollDown;

            describe('dataLoaded', function() {
              beforeEach(function() {
                scrollUp = false;
                scrollDown = true;
                grid.infiniteScroll.direction = uiGridConstants.scrollDirection.UP;
                grid.api.methods.infiniteScroll.dataLoaded(scrollUp, scrollDown);
              });
              it('should set the scroll direction based on the arguments passed in', function() {
                expect(grid.infiniteScroll.scrollUp).toBe(scrollUp);
                expect(grid.suppressParentScrollUp).toBe(scrollUp);
                expect(grid.infiniteScroll.scrollDown).toBe(scrollDown);
                expect(grid.suppressParentScrollDown).toBe(scrollDown);
              });
              it('should return a promise', function() {
                expect(grid.api.methods.infiniteScroll.dataLoaded(scrollUp, scrollDown).then).toBeDefined();
              });
              it('should set dataLoading to false when scrolling is adjusted', function() {
                $timeout.flush();
                expect(grid.infiniteScroll.dataLoading).toBe(false);
              });
            });
            describe('resetScroll', function() {
              beforeEach(function() {
                scrollUp = true;
                scrollDown = false;
                spyOn(grid, 'getVisibleRowCount').and.returnValue(10);
                spyOn(grid, 'getViewportHeight').and.returnValue(100);
                spyOn(grid, 'scrollContainers').and.callFake(angular.noop);
                grid.api.methods.infiniteScroll.resetScroll(scrollUp, scrollDown);
              });
              afterEach(function() {
                grid.getVisibleRowCount.calls.reset();
                grid.getViewportHeight.calls.reset();
                grid.scrollContainers.calls.reset();
              });
              it('should set the scroll direction based on the arguments passed in', function() {
                expect(grid.infiniteScroll.scrollUp).toBe(scrollUp);
                expect(grid.suppressParentScrollUp).toBe(scrollUp);
                expect(grid.infiniteScroll.scrollDown).toBe(scrollDown);
                expect(grid.suppressParentScrollDown).toBe(scrollDown);
              });
              it('should adjust the infinite scroll position', function() {
                expect(grid.getVisibleRowCount).toHaveBeenCalled();
                expect(grid.getViewportHeight).toHaveBeenCalled();
                expect(grid.scrollContainers).toHaveBeenCalled();
              });
            });
            describe('saveScrollPercentage', function() {
              beforeEach(function() {
                spyOn(grid, 'getVisibleRowCount').and.returnValue(10);
                grid.api.methods.infiniteScroll.saveScrollPercentage();
              });
              afterEach(function() {
                grid.getVisibleRowCount.calls.reset();
              });
              it('should define prevScrollTop', function() {
                expect(grid.infiniteScroll.prevScrollTop).toEqual(grid.renderContainers.body.prevScrollTop);
              });
              it('should call getVisibleRowCount and set previousVisibleRows to the returned value', function() {
                expect(grid.getVisibleRowCount).toHaveBeenCalled();
                expect(grid.infiniteScroll.previousVisibleRows).toEqual(grid.getVisibleRowCount());
              });
            });
            describe('dataRemovedTop', function() {
              beforeEach(function() {
                scrollUp = true;
                scrollDown = false;
                spyOn(grid, 'getVisibleRowCount').and.returnValue(10);
                spyOn(grid, 'getViewportHeight').and.returnValue(100);
                spyOn(grid, 'scrollContainers').and.callFake(angular.noop);
                grid.api.methods.infiniteScroll.dataRemovedTop(scrollUp, scrollDown);
              });
              afterEach(function() {
                grid.getVisibleRowCount.calls.reset();
                grid.getViewportHeight.calls.reset();
                grid.scrollContainers.calls.reset();
              });
              it('should set the scroll direction based on the arguments passed in', function() {
                expect(grid.infiniteScroll.scrollUp).toBe(scrollUp);
                expect(grid.suppressParentScrollUp).toBe(scrollUp);
                expect(grid.infiniteScroll.scrollDown).toBe(scrollDown);
                expect(grid.suppressParentScrollDown).toBe(scrollDown);
              });
              it('should adjust the infinite scroll position', function() {
                expect(grid.getVisibleRowCount).toHaveBeenCalled();
                expect(grid.getViewportHeight).toHaveBeenCalled();
                expect(grid.scrollContainers).toHaveBeenCalled();
              });
            });
            describe('dataRemovedBottom', function() {
              beforeEach(function() {
                scrollUp = false;
                scrollDown = true;
                spyOn(grid, 'getVisibleRowCount').and.returnValue(10);
                spyOn(grid, 'getViewportHeight').and.returnValue(100);
                spyOn(grid, 'scrollContainers').and.callFake(angular.noop);
                grid.api.methods.infiniteScroll.dataRemovedBottom(scrollUp, scrollDown);
              });
              afterEach(function() {
                grid.getVisibleRowCount.calls.reset();
                grid.getViewportHeight.calls.reset();
                grid.scrollContainers.calls.reset();
              });
              it('should set the scroll direction based on the arguments passed in', function() {
                expect(grid.infiniteScroll.scrollUp).toBe(scrollUp);
                expect(grid.suppressParentScrollUp).toBe(scrollUp);
                expect(grid.infiniteScroll.scrollDown).toBe(scrollDown);
                expect(grid.suppressParentScrollDown).toBe(scrollDown);
              });
              it('should adjust the infinite scroll position', function() {
                expect(grid.getVisibleRowCount).toHaveBeenCalled();
                expect(grid.getViewportHeight).toHaveBeenCalled();
                expect(grid.scrollContainers).toHaveBeenCalled();
              });
            });
            describe('setScrollDirections', function() {
              beforeEach(function() {
                scrollUp = false;
                scrollDown = true;
                grid.api.methods.infiniteScroll.setScrollDirections(scrollUp, scrollDown);
              });
              it('should set the scroll direction based on the arguments passed in', function() {
                expect(grid.infiniteScroll.scrollUp).toBe(scrollUp);
                expect(grid.suppressParentScrollUp).toBe(scrollUp);
                expect(grid.infiniteScroll.scrollDown).toBe(scrollDown);
                expect(grid.suppressParentScrollDown).toBe(scrollDown);
              });
            });
          });
        });
      });
      describe('event handling', function() {
        beforeEach(function() {
          spyOn(uiGridInfiniteScrollService, 'loadData').and.callFake(angular.noop);
          var arrayOf100 = [];
          for ( var i = 0; i < 100; i++ ) {
            arrayOf100.push(i);
          }
          grid.renderContainers = { body: { visibleRowCache: arrayOf100}};
        });

        it('should not request more data if scroll up to 21%', function() {
          grid.scrollDirection = uiGridConstants.scrollDirection.UP;
          uiGridInfiniteScrollService.handleScroll( { grid: grid, y: { percentage: 0.21 }});
          expect(uiGridInfiniteScrollService.loadData).not.toHaveBeenCalled();
        });

        it('should request more data if scroll up to 20%', function() {
          grid.scrollDirection = uiGridConstants.scrollDirection.UP;
          uiGridInfiniteScrollService.handleScroll( { grid: grid,  y: { percentage: 0.20 }});
          expect(uiGridInfiniteScrollService.loadData).toHaveBeenCalled();
        });

        it('should not request more data if scroll down to 79%', function() {
          grid.scrollDirection = uiGridConstants.scrollDirection.DOWN;
          uiGridInfiniteScrollService.handleScroll( {grid: grid, y: { percentage: 0.79 }});
          expect(uiGridInfiniteScrollService.loadData).not.toHaveBeenCalled();
        });

        it('should request more data if scroll down to 80%', function() {
          grid.scrollDirection = uiGridConstants.scrollDirection.DOWN;
          uiGridInfiniteScrollService.handleScroll( { grid: grid, y: { percentage: 0.80 }});
          expect(uiGridInfiniteScrollService.loadData).toHaveBeenCalled();
        });
      });
      describe('loadData', function() {
        it('scroll up and there is data up', function() {
          grid.scrollDirection = uiGridConstants.scrollDirection.UP;
          grid.infiniteScroll.scrollUp = true;

          uiGridInfiniteScrollService.loadData(grid);

          expect(grid.api.infiniteScroll.raise.needLoadMoreDataTop).toHaveBeenCalled();
          expect(grid.infiniteScroll.previousVisibleRows).toEqual(0);
          expect(grid.infiniteScroll.direction).toEqual(uiGridConstants.scrollDirection.UP);
        });

        it('scroll up and there isn\'t data up', function() {
          grid.scrollDirection = uiGridConstants.scrollDirection.UP;
          grid.infiniteScroll.scrollUp = false;

          uiGridInfiniteScrollService.loadData(grid);

          expect(grid.api.infiniteScroll.raise.needLoadMoreDataTop).not.toHaveBeenCalled();
        });

        it('scroll down and there is data down', function() {
          grid.scrollDirection = uiGridConstants.scrollDirection.DOWN;
          grid.infiniteScroll.scrollDown = true;

          uiGridInfiniteScrollService.loadData(grid);

          expect(grid.api.infiniteScroll.raise.needLoadMoreData).toHaveBeenCalled();
          expect(grid.infiniteScroll.previousVisibleRows).toEqual(0);
          expect(grid.infiniteScroll.direction).toEqual(uiGridConstants.scrollDirection.DOWN);
        });

        it('scroll down and there isn\'t data down', function() {
          grid.scrollDirection = uiGridConstants.scrollDirection.DOWN;
          grid.infiniteScroll.scrollDown = false;

          uiGridInfiniteScrollService.loadData(grid);

          expect(grid.api.infiniteScroll.raise.needLoadMoreData).not.toHaveBeenCalled();
        });
      });
      describe('handleScroll', function() {
        describe('when the source is the even "ui.grid.adjustInfiniteScrollPosition"', function() {
          beforeEach(function() {
            grid.scrollDirection = undefined;
            grid.infiniteScroll.dataLoading = undefined;
            uiGridInfiniteScrollService.handleScroll({grid: grid, source: 'ui.grid.adjustInfiniteScrollPosition'});
          });
          it('should do nothing', function() {
            expect(grid.scrollDirection).toBeUndefined();
            expect(grid.infiniteScroll.dataLoading).toBeUndefined();
          });
        });
        describe('when y is not defined', function() {
          beforeEach(function() {
            grid.scrollDirection = undefined;
            grid.infiniteScroll.dataLoading = false;
            uiGridInfiniteScrollService.handleScroll({grid: grid});
          });
          it('should do nothing', function() {
            expect(grid.scrollDirection).toBeUndefined();
            expect(grid.infiniteScroll.dataLoading).toBe(false);
          });
        });
        describe('when y is defined', function() {
          describe('when percentage is set to 0', function() {
            beforeEach(function() {
              grid.scrollDirection = undefined;
              grid.infiniteScroll.scrollUp = true;
              grid.infiniteScroll.dataLoading = false;
              uiGridInfiniteScrollService.handleScroll({grid: grid, y: {percentage: 0}});
            });
            it('should set scroll direction to up', function() {
              expect(grid.scrollDirection).toEqual(uiGridConstants.scrollDirection.UP);
            });
            it('should set data loading to true', function() {
              expect(grid.infiniteScroll.dataLoading).toBe(true);
            });
            it('should raise the needLoadMoreDataTop event', function() {
              expect(grid.api.infiniteScroll.raise.needLoadMoreDataTop).toHaveBeenCalled();
            });
          });
          describe('when percentage is set to 1', function() {
            beforeEach(function() {
              grid.scrollDirection = undefined;
              grid.infiniteScroll.scrollDown = true;
              grid.infiniteScroll.dataLoading = false;
              uiGridInfiniteScrollService.handleScroll({grid: grid, y: {percentage: 1}});
            });
            it('should set scroll direction to down', function() {
              expect(grid.scrollDirection).toEqual(uiGridConstants.scrollDirection.DOWN);
            });
            it('should set data loading to true', function() {
              expect(grid.infiniteScroll.dataLoading).toBe(true);
            });
            it('should raise the needLoadMoreDataTop event', function() {
              expect(grid.api.infiniteScroll.raise.needLoadMoreData).toHaveBeenCalled();
            });
          });
          describe('when percentage is set to something else, but scroll direction is neither up nor down', function() {
            beforeEach(function() {
              grid.scrollDirection = undefined;
              grid.infiniteScroll.dataLoading = false;
              uiGridInfiniteScrollService.handleScroll({grid: grid, y: {percentage: 2}});
            });
            it('should do nothing', function() {
              expect(grid.scrollDirection).toBeUndefined();
              expect(grid.infiniteScroll.dataLoading).toBe(false);
            });
          });
        });
      });
      describe('adjustScroll', function() {
        describe('when direction is undefined', function() {
          beforeEach(function() {
            grid.infiniteScroll.direction = undefined;
            spyOn(grid, 'getVisibleRowCount').and.returnValue(10);
            spyOn(grid, 'getViewportHeight').and.returnValue(100);
            spyOn(grid, 'scrollContainers').and.callFake(angular.noop);
            uiGridInfiniteScrollService.adjustScroll(grid);
          });
          afterEach(function() {
            grid.getVisibleRowCount.calls.reset();
            grid.getViewportHeight.calls.reset();
            grid.scrollContainers.calls.reset();
          });
          it('should adjust the infinite scroll position', function() {
            $timeout.flush();
            expect(grid.getVisibleRowCount).toHaveBeenCalled();
            expect(grid.getViewportHeight).toHaveBeenCalled();
            expect(grid.scrollContainers).toHaveBeenCalled();
          });
        });
        describe('when direction is down', function() {
          beforeEach(function() {
            grid.infiniteScroll.direction = uiGridConstants.scrollDirection.DOWN;
            spyOn(grid, 'getVisibleRowCount').and.returnValue(10);
            spyOn(grid, 'getViewportHeight').and.returnValue(100);
            spyOn(grid, 'scrollContainers').and.callFake(angular.noop);
            uiGridInfiniteScrollService.adjustScroll(grid);
          });
          afterEach(function() {
            grid.getVisibleRowCount.calls.reset();
            grid.getViewportHeight.calls.reset();
            grid.scrollContainers.calls.reset();
          });
          it('should adjust the infinite scroll position', function() {
            $timeout.flush();
            expect(grid.getVisibleRowCount).toHaveBeenCalled();
            expect(grid.getViewportHeight).toHaveBeenCalled();
            expect(grid.scrollContainers).toHaveBeenCalled();
          });
        });
        describe('when infiniteScroll.scrollDown is true and the viewport height is greater than the canvas height', function() {
          beforeEach(function() {
            grid.headerHeight = 20;
            grid.scrollbarHeight = 5;
            grid.renderContainers.body.headerHeight = 20;
            grid.options.rowHeight = 10;
            grid.infiniteScroll.scrollDown = true;
            grid.infiniteScroll.direction = uiGridConstants.scrollDirection.DOWN;
            spyOn(grid, 'getVisibleRowCount').and.returnValue(2);
            spyOn(grid, 'getViewportHeight').and.returnValue(100);
            spyOn(grid, 'scrollContainers').and.callFake(angular.noop);
            uiGridInfiniteScrollService.adjustScroll(grid);
            $timeout.flush();
          });
          afterEach(function() {
            grid.getVisibleRowCount.calls.reset();
            grid.getViewportHeight.calls.reset();
            grid.scrollContainers.calls.reset();
          });
          it('should raise the needLoadMoreData event', function() {
            expect(grid.api.infiniteScroll.raise.needLoadMoreData).toHaveBeenCalled();
          });
          it('should adjust the infinite scroll position', function() {
            expect(grid.getVisibleRowCount).toHaveBeenCalled();
            expect(grid.getViewportHeight).toHaveBeenCalled();
            expect(grid.scrollContainers).toHaveBeenCalled();
          });
        });
      });
    });

    describe('uiGridInfiniteScroll directive', function() {
      var element;

      beforeEach(function() {
        inject(function(_$compile_) {
          $compile = _$compile_;
        });

        $scope = $rootScope.$new();

        $scope.gridOpts = {
          data: [{ name: 'Bob' }, {name: 'Mathias'}, {name: 'Fred'}]
        };

        element = angular.element('<div ui-grid="gridOpts" ui-grid-infinite-scroll></div>');
        spyOn(uiGridInfiniteScrollService, 'initializeGrid').and.callThrough();

        $compile(element)($scope);
        $scope.$apply();
      });
      afterEach(function() {
        uiGridInfiniteScrollService.initializeGrid.calls.reset();
      });
      it('should trigger initializeGrid on the uiGridInfiniteScrollService', function() {
        expect(uiGridInfiniteScrollService.initializeGrid).toHaveBeenCalled();
      });
    });
  });
})();
