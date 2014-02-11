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
      enableResizeColumns: true,
      data: data
    };

    grid = angular.element('<div ui-grid="gridOpts"></div>');

    recompile = function() {
      $compile(grid)($scope);  
      $scope.$digest();
    };

    recompile();
  }));

  describe('setting enableResizeColumns', function() {
    iit('should by default cause resizer to be attached to the header elements', function() {
      $scope.gridOpts.enableResizeColumns = true;
      recompile();

      var resizers = $(grid).find('[ui-grid-column-resizer]');

      dump(resizers);

      expect(resizers.size()).toEqual(6);
    });

    it('should by default cause resizer to be attached to the header elements', function() {

    });
  });

  describe('setting flag on colDef to false', function() {
    it('should result in no resizer elements being attached to the column', function() {
      $scope.gridOpts.enableResizeColumns = false;
      recompile();

      var resizers = $(grid).find('.ui-grid-column-resizer');

      expect(resizers.size()).toEqual(0);
    });
  });

  // TODO: setting flag on colDef to true should result in resizer elements being attached to the column

  // TODO: Left resizer element should not be on first column

  // TODO: Right resizer element should not be on last column

  // TODO: post-resize a horizontal scroll event should be fired

});