describe('ui.grid.resizeColumns', function () {
  var grid, $scope, $compile, recompile;

  var data = [
    { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
    { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
    { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
    { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
  ];
  
  beforeEach(module('ui.grid'));
  beforeEach(module('ui.grid.resizeColumns'));

  beforeEach(inject(function(_$compile_, $rootScope) {
    $scope = $rootScope;
    $compile = _$compile_;

    $scope.gridOpts = {
      enableColumnResizing: true,
      data: data
    };

    grid = angular.element('<div ui-grid="gridOpts"></div>');

    recompile = function() {
      $compile(grid)($scope);  
      $scope.$digest();
    };

    recompile();
  }));

  describe('setting enableColumnResizing', function() {
    it('should by default cause resizer to be attached to the header elements', function() {
      $scope.gridOpts.enableColumnResizing = true;
      recompile();

      var resizers = $(grid).find('[ui-grid-column-resizer]');

      expect(resizers.size()).toEqual(4);
    });

    it('should only attach a right resizer to the first column', function() {
      $scope.gridOpts.enableColumnResizing = true;
      recompile();

      var firstColumn = $(grid).find('[ui-grid-header-cell]').first();

      var resizers = $(firstColumn).find('[ui-grid-column-resizer]');

      expect(resizers.size()).toEqual(1);

      expect(resizers.first().attr('position')).toEqual('right');
      expect(resizers.first().hasClass('right')).toBe(true);
    });

    it('should only attach a left resizer to the last column', function() {
      $scope.gridOpts.enableColumnResizing = true;
      recompile();

      var firstColumn = $(grid).find('[ui-grid-header-cell]').last();

      var resizers = $(firstColumn).find('[ui-grid-column-resizer]');

      expect(resizers.size()).toEqual(1);

      expect(resizers.first().attr('position')).toEqual('left');
      expect(resizers.first().hasClass('left')).toBe(true);
    });
  });

  describe('setting enableColumnResizing to false', function() {
    it('should result in no resizer elements being attached to the column', function() {
      $scope.gridOpts.enableColumnResizing = false;
      recompile();

      var resizers = $(grid).find('.ui-grid-column-resizer');

      expect(resizers.size()).toEqual(0);
    });
  });

  // TODO: e2e specs?

  // TODO: setting flag on colDef to false should result in no resizer elements being attached to the column

  // TODO: post-resize a horizontal scroll event should be fired

});