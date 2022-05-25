describe('GridRenderContainer factory', function() {
	'use strict';

	var $q, $scope, grid, Grid, gridClassFactory, GridRenderContainer, uiGridConstants;

	beforeEach(function() {
		module('ui.grid');

		inject(function(_$q_, _$rootScope_, _Grid_, _GridColumn_, _gridClassFactory_, _GridRenderContainer_, _uiGridConstants_) {
			$q = _$q_;
			$scope = _$rootScope_;
			Grid = _Grid_;
			gridClassFactory = _gridClassFactory_;
			GridRenderContainer = _GridRenderContainer_;
			uiGridConstants = _uiGridConstants_;
		});

		grid = new Grid({id: 1});

		grid.options.columnDefs = [
			{field: 'firstName'},
			{field: 'lastName'},
			{field: 'company'},
			{field: 'gender'}
		];
	});

	describe('constructor', function() {
		it('should not throw with good arguments', function() {
			expect(function() {
				var r = new GridRenderContainer('asdf', grid);
			}).not.toThrow();
		});
	});

	describe('getViewportStyle', function() {
		var r;

		beforeEach(function() {
			r = new GridRenderContainer('name', grid);
		});

		it('should have a vert and horiz scrollbar on body', function() {
			r.name = 'body';
			expect(r.getViewportStyle()).toEqual({'overflow-x': 'scroll', 'overflow-y': 'scroll'});
		});

		it('should have a vert only', function() {
			r.name = 'body';
			grid.options.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
			expect(r.getViewportStyle()).toEqual({'overflow-x': 'scroll', 'overflow-y': 'hidden'});
		});

		it('should have a horiz only', function() {
			r.name = 'body';
			grid.options.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
			expect(r.getViewportStyle()).toEqual({'overflow-x': 'hidden', 'overflow-y': 'scroll'});
		});

		it('should have a vert scrollbar only when needed', function() {
			r.name = 'body';
			grid.options.enableVerticalScrollbar = uiGridConstants.scrollbars.WHEN_NEEDED;
			expect(r.getViewportStyle()).toEqual({'overflow-x': 'scroll', 'overflow-y': 'auto'});
		});

		it('should have a horiz scrollbar only when needed', function() {
			r.name = 'body';
			grid.options.enableHorizontalScrollbar = uiGridConstants.scrollbars.WHEN_NEEDED;
			expect(r.getViewportStyle()).toEqual({'overflow-x': 'auto', 'overflow-y': 'scroll'});
		});

		it('left should have a no scrollbar when not rtl', function() {
			r.name = 'left';
			expect(r.getViewportStyle()).toEqual({'overflow-x': 'hidden', 'overflow-y': 'hidden'});
		});

		it('right should have a vert scrollbar when not rtl', function() {
			r.name = 'right';
			expect(r.getViewportStyle()).toEqual({'overflow-x': 'hidden', 'overflow-y': 'scroll'});
		});

		it('right should have no scrollbar when configured', function() {
			r.name = 'right';
			grid.options.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
			expect(r.getViewportStyle()).toEqual({'overflow-x': 'hidden', 'overflow-y': 'hidden'});
		});

		it('left should have a vert scrollbar when rtl', function() {
			r.name = 'left';
			grid.rtl = true;
			expect(r.getViewportStyle()).toEqual({'overflow-x': 'hidden', 'overflow-y': 'scroll'});
		});

		it('left should have no vert scrollbar when rtl and configured Never', function() {
			r.name = 'left';
			grid.rtl = true;
			grid.options.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
			expect(r.getViewportStyle()).toEqual({'overflow-x': 'hidden', 'overflow-y': 'hidden'});
		});

		it('right should have no scrollbars when rtl', function() {
			r.name = 'right';
			grid.rtl = true;
			expect(r.getViewportStyle()).toEqual({'overflow-x': 'hidden', 'overflow-y': 'hidden'});
		});

	});

  describe('needsHScrollbarPlaceholder', function() {
    var r;

    function initializeRenderContainer(scrollbarSetting, scrollWidth, offsetWidth) {
      grid.element = [{
        querySelector: function() {
          return {
            scrollWidth: scrollWidth,
            offsetWidth: offsetWidth
          };
        }
      }];
      grid.options.enableHorizontalScrollbar = scrollbarSetting;
      r = new GridRenderContainer('name', grid);
    }
    describe('body render container', function() {
      it('should return false', function() {
        initializeRenderContainer();
        r.name = 'body';
        expect(r.needsHScrollbarPlaceholder()).toEqual(false);
      });
    });

    describe('left && right render containers', function() {
      describe('grid options enableHorizontalScrollbar === ALWAYS', function() {
        it('should return true', function() {
          initializeRenderContainer(uiGridConstants.scrollbars.ALWAYS);
          r.name = 'left';
          expect(r.needsHScrollbarPlaceholder()).toEqual(true);

          r.name = 'right';
          expect(r.needsHScrollbarPlaceholder()).toEqual(true);
        });
      });
      describe('grid options enableHorizontalScrollbar === WHEN_NEEDED', function() {
        it('should return true if body render container is scrollable', function () {
          initializeRenderContainer(uiGridConstants.scrollbars.WHEN_NEEDED, 100, 50);
          r.name = 'left';
          expect(r.needsHScrollbarPlaceholder()).toBe(true);
        });
        it('should return false if body render container is not scrollable', function () {
          initializeRenderContainer(uiGridConstants.scrollbars.WHEN_NEEDED, 50, 100);
          r.name = 'left';
          expect(r.needsHScrollbarPlaceholder()).toBe(false);
        });
      });
    });
  });

	describe('updateWidths', function() {
		beforeEach(function() {
			grid.buildColumns();
			grid.setVisibleColumns(grid.columns);
			spyOn(grid, 'getViewportWidth').and.callFake(function() {
				return 415;
			});  // actual width 400 after scrollbar
			grid.scrollbarWidth = 15;
		});

		it('all percentages', function() {
			grid.columns[0].width = '25%';
			grid.columns[1].width = '25%';
			grid.columns[2].width = '25%';
			grid.columns[3].width = '25%';

			grid.renderContainers.body.updateColumnWidths();

			expect(grid.columns[0].drawnWidth).toEqual(100);
			expect(grid.columns[1].drawnWidth).toEqual(100);
			expect(grid.columns[2].drawnWidth).toEqual(100);
			expect(grid.columns[3].drawnWidth).toEqual(100);
		});

		it('all percentages, less than 100%', function() {
			grid.columns[0].width = '20%';
			grid.columns[1].width = '15%';
			grid.columns[2].width = '20%';
			grid.columns[3].width = '15%';

			grid.renderContainers.body.updateColumnWidths();

			expect(grid.columns[0].drawnWidth).toEqual(80);
			expect(grid.columns[1].drawnWidth).toEqual(60);
			expect(grid.columns[2].drawnWidth).toEqual(80);
			expect(grid.columns[3].drawnWidth).toEqual(60);
		});

		it('all percentages, more than 100%', function() {
			grid.columns[0].width = '40%';
			grid.columns[1].width = '30%';
			grid.columns[2].width = '40%';
			grid.columns[3].width = '30%';

			grid.renderContainers.body.updateColumnWidths();

			expect(grid.columns[0].drawnWidth).toEqual(160);
			expect(grid.columns[1].drawnWidth).toEqual(120);
			expect(grid.columns[2].drawnWidth).toEqual(160);
			expect(grid.columns[3].drawnWidth).toEqual(120);
		});

		it('fixed widths', function() {
			grid.columns[0].width = 50;
			grid.columns[1].width = 150;
			grid.columns[2].width = 50;
			grid.columns[3].width = 150;

			grid.renderContainers.body.updateColumnWidths();

			expect(grid.columns[0].drawnWidth).toEqual(50);
			expect(grid.columns[1].drawnWidth).toEqual(150);
			expect(grid.columns[2].drawnWidth).toEqual(50);
			expect(grid.columns[3].drawnWidth).toEqual(150);
		});

		it('asterixes', function() {
			grid.columns[0].width = '*';
			grid.columns[1].width = '*';
			grid.columns[2].width = '*';
			grid.columns[3].width = '*';

			grid.renderContainers.body.updateColumnWidths();

			expect(grid.columns[0].drawnWidth).toEqual(100);
			expect(grid.columns[1].drawnWidth).toEqual(100);
			expect(grid.columns[2].drawnWidth).toEqual(100);
			expect(grid.columns[3].drawnWidth).toEqual(100);
		});

		it('double asterixes', function() {
			grid.columns[0].width = '***';
			grid.columns[1].width = '*';
			grid.columns[2].width = '***';
			grid.columns[3].width = '*';

			grid.renderContainers.body.updateColumnWidths();

			expect(grid.columns[0].drawnWidth).toEqual(150);
			expect(grid.columns[1].drawnWidth).toEqual(50);
			expect(grid.columns[2].drawnWidth).toEqual(150);
			expect(grid.columns[3].drawnWidth).toEqual(50);
		});

		it('asterixes, min width', function() {
			grid.columns[0].width = '*';
			grid.columns[1].width = '*';
			grid.columns[2].width = '*';
			grid.columns[3].width = '*';
			grid.columns[0].minWidth = 130;

			grid.renderContainers.body.updateColumnWidths();

			expect(grid.columns[0].drawnWidth).toEqual(130);
			expect(grid.columns[1].drawnWidth).toEqual(90);
			expect(grid.columns[2].drawnWidth).toEqual(90);
			expect(grid.columns[3].drawnWidth).toEqual(90);
		});

		it('asterixes, max widths', function() {
			grid.columns[0].width = '*';
			grid.columns[1].width = '*';
			grid.columns[2].width = '*';
			grid.columns[3].width = '*';
			grid.columns[0].maxWidth = 70;

			grid.renderContainers.body.updateColumnWidths();

			expect(grid.columns[0].drawnWidth).toEqual(70);
			expect(grid.columns[1].drawnWidth).toEqual(110);
			expect(grid.columns[2].drawnWidth).toEqual(110);
			expect(grid.columns[3].drawnWidth).toEqual(110);
		});
	});

	describe('reset', function() {
		var gridRenderContainer;

		beforeEach(function() {
			gridRenderContainer = new GridRenderContainer('asdf', grid);

			gridRenderContainer.visibleColumnCache.length = 1;
			gridRenderContainer.visibleRowCache.length = 1;

			gridRenderContainer.renderedRows.length = 1;
			gridRenderContainer.renderedColumns.length = 1;
			gridRenderContainer.reset();
		});
		it('should reset the grid lengths', function() {
			expect(gridRenderContainer.visibleColumnCache.length).toEqual(0);
			expect(gridRenderContainer.visibleRowCache.length).toEqual(0);
			expect(gridRenderContainer.renderedRows.length).toEqual(0);
			expect(gridRenderContainer.renderedColumns.length).toEqual(0);
		});
	});

	describe('getVisibleRowCount', function() {
		var gridRenderContainer;

		beforeEach(function() {
			gridRenderContainer = new GridRenderContainer('asdf', grid);
		});
		it('should get the visibleColumnCache length', function() {
			expect(gridRenderContainer.getVisibleRowCount()).toEqual(gridRenderContainer.visibleColumnCache.length);
		});
	});

	describe('removeViewportAdjuster', function() {
		var gridRenderContainer;

		beforeEach(function() {
			gridRenderContainer = new GridRenderContainer('asdf', grid);
			spyOn(gridRenderContainer.viewportAdjusters, 'indexOf').and.callFake(angular.noop);
			spyOn(gridRenderContainer.viewportAdjusters, 'splice').and.callFake(angular.noop);
		});
		afterEach(function() {
			gridRenderContainer.viewportAdjusters.indexOf.calls.reset();
			gridRenderContainer.viewportAdjusters.splice.calls.reset();
		});
		it('should call splice when the viewport adjuster being removed is found', function() {
			gridRenderContainer.viewportAdjusters.indexOf.and.returnValue(1);
			gridRenderContainer.removeViewportAdjuster(gridRenderContainer.viewportAdjusters[0]);
			expect(gridRenderContainer.viewportAdjusters.splice).toHaveBeenCalled();
		});
		it('should not call splice when the viewport adjuster being removed is not found', function() {
			gridRenderContainer.viewportAdjusters.indexOf.and.returnValue(-1);
			gridRenderContainer.removeViewportAdjuster(gridRenderContainer.viewportAdjusters[0]);
			expect(gridRenderContainer.viewportAdjusters.splice).not.toHaveBeenCalled();
		});
	});

	describe('getHorizontalScrollLength', function() {
		var gridRenderContainer;

		beforeEach(function() {
			gridRenderContainer = new GridRenderContainer('asdf', grid);
			gridRenderContainer.canvasWidth = 100;
			gridRenderContainer.grid.gridWidth = 300;
		});
		it('should return -1 when the canvas width is the same as viewport width + the scrollbar width', function() {
			gridRenderContainer.grid.scrollbarWidth = 200;
			expect(gridRenderContainer.getHorizontalScrollLength()).toEqual(-1);
		});
		it('should return the difference between the canvas width and the viewport width + the scrollbar width', function() {
			gridRenderContainer.grid.scrollbarWidth = 100;
			expect(gridRenderContainer.getHorizontalScrollLength())
				.toEqual(gridRenderContainer.canvasWidth - gridRenderContainer.grid.gridWidth + gridRenderContainer.grid.scrollbarWidth);
		});
	});

	describe('scrollVertical', function() {
		var gridRenderContainer, vertScrollPercentage;

		beforeEach(function() {
			gridRenderContainer = new GridRenderContainer('asdf', grid);
			gridRenderContainer.prevScrollTop = 100;
		});

		it('should not return anything the the new scroll top is the same as the previous', function() {
			expect(gridRenderContainer.scrollVertical(gridRenderContainer.prevScrollTop)).toBeUndefined();
		});
		it('should set scrollDirection to DOWN when yDiff is greater than 0', function() {
			vertScrollPercentage = gridRenderContainer.scrollVertical(gridRenderContainer.prevScrollTop + 100);

			expect(gridRenderContainer.grid.scrollDirection).toEqual(uiGridConstants.scrollDirection.DOWN);
		});
		it('should set scrollDirection to UP when yDiff is less than 0', function() {
			vertScrollPercentage = gridRenderContainer.scrollVertical(gridRenderContainer.prevScrollTop - 100);

			expect(gridRenderContainer.grid.scrollDirection).toEqual(uiGridConstants.scrollDirection.UP);
		});
		it('should return 0 when vertScrollPercentage is less than 0', function() {
			gridRenderContainer.canvasHeight = 400;
			gridRenderContainer.headerHeight = 50;
			gridRenderContainer.grid.gridHeight = 300;
			gridRenderContainer.grid.footerHeight = 50;
			gridRenderContainer.grid.scrollbarHeight = 200;
			vertScrollPercentage = gridRenderContainer.scrollVertical(gridRenderContainer.prevScrollTop - 100);

			expect(vertScrollPercentage).toBe(0);
		});
	});

	describe('scrollHorizontal', function() {
		var gridRenderContainer, horizScrollPercentage;

		beforeEach(function() {
			gridRenderContainer = new GridRenderContainer('asdf', grid);
			gridRenderContainer.prevScrollLeft = 100;
		});

		it('should not return anything the the new scroll left is the same as the previous', function() {
			expect(gridRenderContainer.scrollHorizontal(gridRenderContainer.prevScrollLeft)).toBeUndefined();
		});
		it('should set scrollDirection to RIGHT when xDiff is greater than 0', function() {
			horizScrollPercentage = gridRenderContainer.scrollHorizontal(gridRenderContainer.prevScrollLeft + 100);

			expect(gridRenderContainer.grid.scrollDirection).toEqual(uiGridConstants.scrollDirection.RIGHT);
		});
		it('should set scrollDirection to LEFT when xDiff is less than 0', function() {
			horizScrollPercentage = gridRenderContainer.scrollHorizontal(gridRenderContainer.prevScrollLeft - 100);

			expect(gridRenderContainer.grid.scrollDirection).toEqual(uiGridConstants.scrollDirection.LEFT);
		});
	});

	describe('adjustScrollVertical', function() {
		var gridRenderContainer;

		beforeEach(function() {
			gridRenderContainer = new GridRenderContainer('asdf', grid);
			gridRenderContainer.canvasHeight = 500;
			gridRenderContainer.grid.gridHeight = 300;
			spyOn(gridRenderContainer.grid, 'queueRefresh').and.callFake(angular.noop);
		});
		afterEach(function() {
			gridRenderContainer.grid.queueRefresh.calls.reset();
		});
		it('should not do anything when force is false and the new scroll is the same as the old scroll', function() {
			gridRenderContainer.prevScrollTop = 100;
			gridRenderContainer.adjustScrollVertical(100, 0.5, false);

			expect(gridRenderContainer.grid.queueRefresh).not.toHaveBeenCalled();
		});
		it('should queue a refresh when the new scroll is the different as the old scroll', function() {
			gridRenderContainer.prevScrollTop = 100;
			gridRenderContainer.adjustScrollVertical(200, 0.5, false);

			expect(gridRenderContainer.grid.queueRefresh).toHaveBeenCalled();
		});
		it('should calculate scrollTop when the new scroll is null', function() {
			gridRenderContainer.prevScrollTop = 100;
			gridRenderContainer.adjustScrollVertical(null, 0.5, false);

			expect(gridRenderContainer.prevScrollTop)
				.toEqual((gridRenderContainer.getCanvasHeight() - gridRenderContainer.getViewportHeight()) * 0.5);
		});
	});

	describe('adjustScrollHorizontal', function() {
		var gridRenderContainer;

		beforeEach(function() {
			gridRenderContainer = new GridRenderContainer('asdf', grid);
			gridRenderContainer.canvasWidth = 500;
			gridRenderContainer.grid.gridWidth = 300;
			spyOn(gridRenderContainer.grid, 'queueRefresh').and.callFake(angular.noop);
		});
		afterEach(function() {
			gridRenderContainer.grid.queueRefresh.calls.reset();
		});
		it('should not do anything when force is false and the new scroll is the same as the old scroll', function() {
			gridRenderContainer.prevScrollLeft = 100;
			gridRenderContainer.adjustScrollHorizontal(100, 0.5, false);

			expect(gridRenderContainer.grid.queueRefresh).not.toHaveBeenCalled();
		});
		it('should queue a refresh when the new scroll is the different as the old scroll', function() {
			gridRenderContainer.prevScrollLeft = 100;
			gridRenderContainer.adjustScrollHorizontal(200, 0.5, false);

			expect(gridRenderContainer.grid.queueRefresh).toHaveBeenCalled();
		});
		it('should calculate scrollLeft when the new scroll is null', function() {
			gridRenderContainer.prevScrollLeft = 100;
			gridRenderContainer.adjustScrollHorizontal(null, 0.5, false);

			expect(gridRenderContainer.prevScrollLeft)
				.toEqual((gridRenderContainer.getCanvasWidth() - gridRenderContainer.getViewportWidth()) * 0.5);
		});
	});

	describe('headerCellWrapperStyle', function() {
		var gridRenderContainer;

		beforeEach(function() {
			gridRenderContainer = new GridRenderContainer('asdf', grid);
			gridRenderContainer.columnOffset = 50;
		});

		describe('when current first column is different than 0', function() {
			beforeEach(function() {
				gridRenderContainer.currentFirstColumn = 1;
			});
			afterEach(function() {
				gridRenderContainer.grid.isRTL.calls.reset();
			});
			it('should return a margin-right when isRTL returns true', function() {
				gridRenderContainer.grid.isRTL = jasmine.createSpy('isRTL').and.returnValue(true);

				expect(gridRenderContainer.headerCellWrapperStyle()).toEqual({
					'margin-right': gridRenderContainer.columnOffset + 'px'
				});
			});
			it('should return a margin-right when isRTL returns true', function() {
				gridRenderContainer.grid.isRTL = jasmine.createSpy('isRTL').and.returnValue(false);

				expect(gridRenderContainer.headerCellWrapperStyle()).toEqual({
					'margin-left': gridRenderContainer.columnOffset + 'px'
				});
			});
		});
		describe('when current first column is 0', function() {
			it('should return null', function() {
				gridRenderContainer.currentFirstColumn = 0;

				expect(gridRenderContainer.headerCellWrapperStyle()).toEqual(null);
			});
		});
	});

	describe('getViewportStyle', function() {
		var gridRenderContainer;

		beforeEach(function() {
			gridRenderContainer = new GridRenderContainer('asdf', grid);
		});
		it('should set overflow-x and overflow-y to hidden when grid scrolling is disabled', function() {
			gridRenderContainer.grid.disableScrolling = true;

			expect(gridRenderContainer.getViewportStyle()).toEqual({
				'overflow-x': 'hidden',
				'overflow-y': 'hidden'
			});
		});
	});
});
