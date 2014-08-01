describe('ui.grid.pinning uiGridPinningService', function () {
  var uiGridPinningService;
  var gridClassFactory;
  var grid;

  beforeEach(module('ui.grid.pinning'));

  beforeEach(inject(function (_uiGridPinningService_,_gridClassFactory_, $templateCache) {
    uiGridPinningService = _uiGridPinningService_;
    gridClassFactory = _gridClassFactory_;

    grid = gridClassFactory.createGrid({});
    grid.options.columnDefs = [
      {field: 'col1'}
    ];

    uiGridPinningService.initializeGrid(grid);
    grid.options.data = [{col1:'a'},{col1:'b'}];

    grid.buildColumns();
  }));


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

});