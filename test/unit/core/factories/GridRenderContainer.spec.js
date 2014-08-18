describe('GridRenderContainer factory', function () {
  var $q, $scope, cols, grid, gridCol, Grid, gridClassFactory, GridRenderContainer;

  beforeEach(module('ui.grid'));

  function buildCols() {
    grid.buildColumns();
  }


  beforeEach(inject(function (_$q_, _$rootScope_, _Grid_, _GridColumn_, _gridClassFactory_, _GridRenderContainer_) {
    $q = _$q_;
    $scope = _$rootScope_;
    Grid = _Grid_;
    gridClassFactory = _gridClassFactory_;
    GridRenderContainer = _GridRenderContainer_;

    cols = [
      { field: 'firstName' }
    ];

    grid = new Grid({ id: 1 });
  }));

  describe('constructor', function () {
    it('should not throw with good arguments', function () {
      expect(function  () {
        var r = new GridRenderContainer('asdf', grid);
      }).not.toThrow();
    });

    // it('should throw exception if grid argument is not a Grid object', function () {
    //   expect(function () {
    //     var r = new GridRenderContainer('asdf', 'boogers');
    //   }).toThrow(new Error("Grid argument is not a Grid object"));
    // });
  });

});