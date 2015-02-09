/* global _ */
(function () {
	'use strict';
	describe('ui.grid.infiniteScroll uiGridInfiniteScrollService', function () {

		var uiGridInfiniteScrollService;
		var grid;
		var gridClassFactory;
    var uiGridConstants;

		beforeEach(module('ui.grid.infiniteScroll'));

		beforeEach(inject(function (_uiGridInfiniteScrollService_, _gridClassFactory_, _uiGridConstants_) {
			uiGridInfiniteScrollService = _uiGridInfiniteScrollService_;
			gridClassFactory = _gridClassFactory_;
      uiGridConstants = _uiGridConstants_;
			
			grid = gridClassFactory.createGrid({});

			grid.options.columnDefs = [
				{field: 'col1'}
			];
			grid.options.infiniteScroll = 20;
			
			grid.options.onRegisterApi = function (gridApi) {
				gridApi.infiniteScroll.on.needLoadMoreData(function(){
					return [];
				});
        gridApi.infiniteScroll.on.needLoadMoreDataTop(function(){
          return [];
        });

      };

			uiGridInfiniteScrollService.initializeGrid(grid);
      spyOn(grid.api.infiniteScroll.raise, 'needLoadMoreData');
      spyOn(grid.api.infiniteScroll.raise, 'needLoadMoreDataTop');

			grid.options.data = [{col1:'a'},{col1:'b'}];

			grid.buildColumns();

		}));

		describe('event handling', function () {
			it('should return false if scrollTop is positioned more than 20% of scrollHeight', function() {
				var scrollHeight = 100;
				var scrollTop = 80;
				var callResult = uiGridInfiniteScrollService.checkScroll(grid, scrollTop);
				expect(callResult).toBe(false);
			});

			it('should return false if scrollTop is positioned less than 20% of scrollHeight', function() {
				var scrollHeight = 100;
				var scrollTop = 19;
				var callResult = uiGridInfiniteScrollService.checkScroll(grid, scrollTop);
				expect(callResult).toBe(true);
			});

			it('should call load data function on grid event raise', function () {
				uiGridInfiniteScrollService.loadData(grid);
				expect(grid.api.infiniteScroll.raise.needLoadMoreData).toHaveBeenCalled();
			});

      it('should call load data top function on grid event raise', function () {
        grid.scrollDirection = uiGridConstants.scrollDirection.UP;
        uiGridInfiniteScrollService.loadData(grid);
        expect(grid.api.infiniteScroll.raise.needLoadMoreDataTop).toHaveBeenCalled();
      });

    });

	});
})();