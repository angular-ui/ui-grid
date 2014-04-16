describe('GridColumn factory', function () {
  var $q, $scope, cols, grid, gridCol, Grid, GridColumn, gridClassFactory;

  beforeEach(module('ui.grid'));

  function buildCols() {
    grid.buildColumns();
  }


  beforeEach(inject(function (_$q_, _$rootScope_, _Grid_, _GridColumn_, _gridClassFactory_) {
    $q = _$q_;
    $scope = _$rootScope_;
    Grid = _Grid_;
    GridColumn = _GridColumn_;
    gridClassFactory = _gridClassFactory_;

    cols = [
      { field: 'firstName' }
    ];

    grid = new Grid({ id: 1 });

    grid.registerColumnBuilder(gridClassFactory.defaultColumnBuilder);

    grid.options.columnDefs = cols;

    buildCols();
  }));
  
  describe('buildColumns', function () {
    it('should not remove existing sort details on a column', function () {
      var sort = { priority: 0, direction: 'asc' };
      grid.columns[0].sort = sort;

      runs(buildCols);

      runs(function () {
        expect(grid.columns[0].sort).toEqual(sort);
      });
    });

    it('should obey columnDef sort spec', function () {
      // ... TODO(c0bra)
    });
  });

});