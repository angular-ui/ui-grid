(function() {
	'use strict';

	describe('uiGridRenderContainer', function() {
		var $compile, $document, $rootScope, $scope, $templateCache, data, grid, gridUtil, ScrollEvent,
			atTopSpy, atBottomSpy, atLeftSpy, atRightSpy, fireThrottledScrollingEventSpy;

		function recompile() {
			grid = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts"></div>');

			$compile(grid)($scope);
			$document[0].body.appendChild(grid[0]);

			$scope.$apply();
		}

		beforeEach(function() {
			fireThrottledScrollingEventSpy = jasmine.createSpy('fireThrottledScrollingEvent');
			ScrollEvent = function() {
				return {
					atTop: atTopSpy,
					atBottom: atBottomSpy,
					atLeft: atLeftSpy,
					atRight: atRightSpy,
					fireThrottledScrollingEvent: fireThrottledScrollingEventSpy
				};
			};
			ScrollEvent.Sources = {
				RenderContainerMouseWheel: 'RenderContainerMouseWheel'
			};

			module('ui.grid', function($provide) {
				$provide.value('ScrollEvent', ScrollEvent);
			});

			inject(function(_$compile_, _$document_, _$rootScope_, _$templateCache_, _gridUtil_) {
				$compile = _$compile_;
				$document = _$document_;
				$rootScope = _$rootScope_;
				$templateCache = _$templateCache_;
				gridUtil = _gridUtil_;
			});

			$templateCache.put('ui-grid/header-render-container', '<div ui-grid-render-container></div>');
			$scope = $rootScope.$new();

			data = [
				{name: 'Bob', age: 35},
				{name: 'Bill', age: 25},
				{name: 'Sam', age: 17},
				{name: 'Jane', age: 19}
			];

			$scope.gridOpts = {
				headerTemplate: 'ui-grid/header-render-container',
				data: data
			};
		});
		describe('when something goes wrong', function() {
			it('should throw an error when row container name is not defined', function(done) {
				try {
					recompile();
				} catch (error) {
					expect(error.message).toEqual('No row render container name specified');
					grid.remove();
					done();
				}
			});
			it('should throw an error when column container name is not defined', function(done) {
				$templateCache.put('ui-grid/header-render-container', '<div ui-grid-render-container row-container-name="\'header\'"></div>');
				try {
					recompile();
				} catch (error) {
					expect(error.message).toEqual('No column render container name specified');
					grid.remove();
					done();
				}
			});
			it('should throw an error when the row container is not defined', function(done) {
				$templateCache.put('ui-grid/header-render-container',
					'<div ui-grid-render-container row-container-name="\'mock\'" col-container-name="\'mock\'"></div>');
				try {
					recompile();
				} catch (error) {
					expect(error.message).toEqual('Row render container "mock" is not registered.');
					grid.remove();
					done();
				}
			});
			it('should throw an error when the column container is not defined', function(done) {
				$templateCache.put('ui-grid/header-render-container',
					'<div ui-grid-render-container row-container-name="\'body\'" col-container-name="\'mock\'"></div>');
				try {
					recompile();
				} catch (error) {
					expect(error.message).toEqual('Column render container "mock" is not registered.');
					grid.remove();
					done();
				}
			});
		});
		describe('when the user scrolls with the mouse wheel', function() {
			var scrollEvent, mouseWheelCallback;

			beforeEach(function() {
				$scope.gridOpts = {
					data: data
				};
				scrollEvent = new $.Event('mousewheel');
				scrollEvent.deltaFactor = 1;
				spyOn(scrollEvent, 'preventDefault').and.callThrough();
				spyOn(scrollEvent, 'stopPropagation').and.callThrough();
				spyOn(gridUtil.on, 'mousewheel').and.callFake(function(elm, callback) {
					scrollEvent.deltaY = 0;
					scrollEvent.deltaX = 0;
					mouseWheelCallback = callback;
				});
				spyOn(gridUtil, 'normalizeScrollLeft').and.callFake(angular.noop);
				recompile();
			});
			afterEach(function() {
				grid.remove();
				gridUtil.on.mousewheel.calls.reset();
				gridUtil.normalizeScrollLeft.calls.reset();
			});
			it('should call the on mousewheel even handler in gridUtil', function() {
				expect(gridUtil.on.mousewheel).toHaveBeenCalled();
			});

			function testParentContainerScrolls() {
				it('should not prevent the default behavior', function() {
					expect(scrollEvent.preventDefault).not.toHaveBeenCalled();
				});
				it('should not stop propagation of the event', function() {
					expect(scrollEvent.stopPropagation).not.toHaveBeenCalled();
				});
				it('should not throttle scrolling', function() {
					expect(fireThrottledScrollingEventSpy).not.toHaveBeenCalled();
				});
			}
			describe('when deltaX and deltaY are equal to zero', function() {
				beforeEach(function() {
					scrollEvent.deltaY = 0;
					scrollEvent.deltaX = 0;
					mouseWheelCallback(scrollEvent);
				});
				afterEach(function() {
					scrollEvent.preventDefault.calls.reset();
					scrollEvent.stopPropagation.calls.reset();
					fireThrottledScrollingEventSpy.calls.reset();
				});
				it('should prevent the default behavior', function() {
					expect(scrollEvent.preventDefault).toHaveBeenCalled();
				});
				it('should stop propagation of the event', function() {
					expect(scrollEvent.stopPropagation).toHaveBeenCalled();
				});
				it('should throttle scrolling', function() {
					expect(fireThrottledScrollingEventSpy).toHaveBeenCalled();
				});
			});
			describe('when deltaX is different than 0 and user scrolled to the left', function() {
				beforeEach(function() {
					scrollEvent.deltaY = 0;
					scrollEvent.deltaX = -50;
					atLeftSpy = jasmine.createSpy('atLeft').and.returnValue(true);
					mouseWheelCallback(scrollEvent);
				});
				afterEach(function() {
					atLeftSpy.calls.reset();
					scrollEvent.preventDefault.calls.reset();
					scrollEvent.stopPropagation.calls.reset();
					fireThrottledScrollingEventSpy.calls.reset();
				});
				testParentContainerScrolls();
			});
			describe('when deltaX is different than 0 and user scrolled to the right', function() {
				beforeEach(function() {
					scrollEvent.deltaY = 0;
					scrollEvent.deltaX = 50;
					atLeftSpy = jasmine.createSpy('atLeft').and.returnValue(false);
					atRightSpy = jasmine.createSpy('atRight').and.returnValue(true);
					mouseWheelCallback(scrollEvent);
				});
				afterEach(function() {
					atLeftSpy.calls.reset();
					atRightSpy.calls.reset();
					scrollEvent.preventDefault.calls.reset();
					scrollEvent.stopPropagation.calls.reset();
					fireThrottledScrollingEventSpy.calls.reset();
				});
				testParentContainerScrolls();
			});
			describe('when deltaY is different than 0 and user scrolled to the top', function() {
				beforeEach(function() {
					scrollEvent.deltaY = -50;
					scrollEvent.deltaX = 0;
					atTopSpy = jasmine.createSpy('atTop').and.returnValue(true);
					mouseWheelCallback(scrollEvent);
				});
				afterEach(function() {
					atTopSpy.calls.reset();
					scrollEvent.preventDefault.calls.reset();
					scrollEvent.stopPropagation.calls.reset();
					fireThrottledScrollingEventSpy.calls.reset();
				});
				testParentContainerScrolls();
			});
			describe('when deltaY is different than 0 and user scrolled to the bottom', function() {
				beforeEach(function() {
					scrollEvent.deltaY = 50;
					scrollEvent.deltaX = 0;
					atTopSpy = jasmine.createSpy('atTop').and.returnValue(false);
					atBottomSpy = jasmine.createSpy('atBottom').and.returnValue(true);
					mouseWheelCallback(scrollEvent);
				});
				afterEach(function() {
					atTopSpy.calls.reset();
					atBottomSpy.calls.reset();
					scrollEvent.preventDefault.calls.reset();
					scrollEvent.stopPropagation.calls.reset();
					fireThrottledScrollingEventSpy.calls.reset();
				});
				testParentContainerScrolls();
			});
		});
	});
})();
