/* global _ */
describe('ui.grid.pinning uiGridPinningService', function () {
  var uiGridPinningService;
  var uiGridPinningConstants;
  var gridClassFactory;
  var grid;
  var GridRenderContainer;

  beforeEach(module('ui.grid.pinning'));

  beforeEach(inject(function (_uiGridPinningService_,_gridClassFactory_, $templateCache, _GridRenderContainer_, _uiGridPinningConstants_) {
    uiGridPinningService = _uiGridPinningService_;
    uiGridPinningConstants = _uiGridPinningConstants_;
    gridClassFactory = _gridClassFactory_;
    GridRenderContainer = _GridRenderContainer_;

    grid = gridClassFactory.createGrid({});
    spyOn(grid, 'registerColumnBuilder');

    grid.options.columnDefs = [
      {field: 'col1'}
    ];

    uiGridPinningService.initializeGrid(grid);
    grid.options.data = [{col1:'a'},{col1:'b'}];

    grid.buildColumns();
  }));

  describe('initialize', function() {

    it('should have pinning enabled', function() {
      expect(grid.options.enablePinning).toBe(true);
    });

    it('should register a column builder to the grid', function() {
      expect(grid.registerColumnBuilder).toHaveBeenCalledWith(uiGridPinningService.pinningColumnBuilder);
    });
  });

  describe('defaultGridOptions', function () {
    it('should default to true', function () {
      var options = {};
      uiGridPinningService.defaultGridOptions(options);
      expect(options.enablePinning).toBe(true);
    });
    it('should allow false', function () {
      var options = {enablePinning:false};
      uiGridPinningService.defaultGridOptions(options);
      expect(options.enablePinning).toBe(false);
    });
  });

  describe('pinningColumnBuilder', function() {
    var mockCol, colOptions, gridOptions;

    beforeEach(function() {
      mockCol = {menuItems: [], grid: grid};
      colOptions = {};
      gridOptions = {enablePinning:true};
    });

    it('should enable column pinning when pinning allowed for the grid', function() {
      uiGridPinningService.pinningColumnBuilder(colOptions, mockCol, gridOptions);

      expect(colOptions.enablePinning).toBe(true);
    });

    it('should disable column pinning when pinning disabled for the column', function() {
      colOptions = {enablePinning: false};

      uiGridPinningService.pinningColumnBuilder(colOptions, mockCol, gridOptions);

      expect(colOptions.enablePinning).toBe(false);
    });

    it('should enable column pinning when pinning enabled for the column', function() {
      colOptions = {enablePinning: true};
      gridOptions = {enablePinning: false};

      uiGridPinningService.pinningColumnBuilder(colOptions, mockCol, gridOptions);

      expect(colOptions.enablePinning).toBe(true);
    });

    it('should pin left when pinnedLeft=true', function() {
        colOptions = {pinnedLeft: true};
        gridOptions = {enablePinning: false};

        uiGridPinningService.pinningColumnBuilder(colOptions, mockCol, gridOptions);
        expect(grid.renderContainers.left).toEqual(jasmine.any(GridRenderContainer));
        expect(grid.renderContainers.right).not.toBeDefined();

        expect(mockCol.renderContainer).toBe('left');
    });

    it('should pin left if both PinnedLeft and PinnedRight', function() {
      colOptions = {pinnedLeft: true, pinnedRight:true};
      gridOptions = {enablePinning: false};

      uiGridPinningService.pinningColumnBuilder(colOptions, mockCol, gridOptions);

      expect(mockCol.renderContainer).toBe('left');
    });

    it('should pin right when pinnedRight=true', function() {
      colOptions = {pinnedRight: true};
      gridOptions = {enablePinning: false};

      uiGridPinningService.pinningColumnBuilder(colOptions, mockCol, gridOptions);
      expect(grid.renderContainers.right).toEqual(jasmine.any(GridRenderContainer));
      expect(grid.renderContainers.left).not.toBeDefined();

      expect(mockCol.renderContainer).toBe('right');
    });

    it('should register menu actions for pinnable columns', function () {
      function testMenuItem(obj) {
        expect(obj.title).toEqual(jasmine.any(String));
        expect(obj.icon.indexOf('ui-grid-icon-')).toEqual(0);
        expect(obj.shown).toEqual(jasmine.any(Function));
        expect(obj.action).toEqual(jasmine.any(Function));
      }

      uiGridPinningService.pinningColumnBuilder(colOptions, mockCol, gridOptions);

      expect(mockCol.menuItems.length).toEqual(3);
      _(mockCol.menuItems).each(function(it) {
        testMenuItem(it);
      });
    });


  });

  describe('pinColumn', function() {

    var previousWidth;

    beforeEach(function() {
      spyOn(grid, 'createLeftContainer').andCallThrough();
      spyOn(grid, 'createRightContainer').andCallThrough();
      previousWidth = grid.columns[0].drawnWidth;
    });

    describe('left', function() {

      beforeEach(function() {
        grid.api.pinning.pinColumn(grid.columns[0], uiGridPinningConstants.container.LEFT);
      });

      it('should set renderContainer to be left', function(){
        expect(grid.columns[0].renderContainer).toEqual('left');
      });

      it('should call createLeftContainer', function() {
        expect(grid.createLeftContainer).toHaveBeenCalled();
      });

      it('should set width based on previous setting', function() {
        expect(grid.width).toEqual(previousWidth);
      });

    });

    describe('right', function() {

      beforeEach(function() {
        grid.api.pinning.pinColumn(grid.columns[0], uiGridPinningConstants.container.RIGHT);
      });

      it('should set renderContainer to be right', function(){
        expect(grid.columns[0].renderContainer).toEqual('right');
      });

      it('should call createLeftContainer', function() {
        expect(grid.createRightContainer).toHaveBeenCalled();
      });

      it('should set width based on previous setting', function() {
        expect(grid.width).toEqual(previousWidth);
      });

    });

    describe('none', function() {

      beforeEach(function() {
        grid.api.pinning.pinColumn(grid.columns[0], uiGridPinningConstants.container.NONE);
      });

      it('should set renderContainer to be null', function(){
        expect(grid.columns[0].renderContainer).toBeNull();
      });

      it('should NOT call either container creation methods', function() {
        expect(grid.createLeftContainer).not.toHaveBeenCalled();
        expect(grid.createRightContainer).not.toHaveBeenCalled();
      });

    });

  });

});