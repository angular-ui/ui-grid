describe('gridClassFactory', function() {
  var gridClassFactory;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function(_gridClassFactory_) {
    gridClassFactory = _gridClassFactory_;
  }));

  describe('createGrid', function() {
    var grid;
    beforeEach(inject(function(_gridClassFactory_) {
      grid = gridClassFactory.createGrid();
    }));

    it('creates a grid with default properties', function() {
      expect(grid).toBeDefined();
      expect(grid.id).toBeDefined();
      expect(grid.id).not.toBeNull();
      expect(grid.options).toBeDefined();
    });
  });

});