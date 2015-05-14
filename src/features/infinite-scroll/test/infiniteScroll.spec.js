/* global _ */
(function () {
  'use strict';
  describe('ui.grid.infiniteScroll uiGridInfiniteScrollService', function () {

    var uiGridInfiniteScrollService;
    var grid;
    var gridClassFactory;
    var uiGridConstants;
    var $rootScope;
    var $scope;

    beforeEach(module('ui.grid.infiniteScroll'));

    beforeEach(inject(function (_uiGridInfiniteScrollService_, _gridClassFactory_, _uiGridConstants_, _$rootScope_) {
      uiGridInfiniteScrollService = _uiGridInfiniteScrollService_;
      gridClassFactory = _gridClassFactory_;
      uiGridConstants = _uiGridConstants_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
      
      grid = gridClassFactory.createGrid({});

      grid.options.columnDefs = [
        {field: 'col1'}
      ];
      grid.options.infiniteScrollRowsFromEnd = 20;

      uiGridInfiniteScrollService.initializeGrid(grid, $scope);
      spyOn(grid.api.infiniteScroll.raise, 'needLoadMoreData');
      spyOn(grid.api.infiniteScroll.raise, 'needLoadMoreDataTop');

      grid.options.data = [{col1:'a'},{col1:'b'}];

      grid.buildColumns();
      
    }));

    describe('event handling', function () {
      beforeEach(function() {
        spyOn(uiGridInfiniteScrollService, 'loadData').andCallFake(function() {});
        var arrayOf100 = [];
        for ( var i = 0; i < 100; i++ ){
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


    describe( 'dataRemovedTop', function() {
      it( 'adjusts scroll as expected', function() {
        
      });
    });


    describe( 'dataRemovedBottom', function() {
      it( 'adjusts scroll as expected', function() {
        
      });
    });
  });
})();