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

    grid = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts"></div>');
    document.body.appendChild(grid[0]);

    recompile = function() {
      $compile(grid)($scope);
      $scope.$digest();
    };

    recompile();
  }));

  afterEach(function() {
    angular.element(grid).remove();
    grid = null;
  });

  describe('setting enableColumnResizing', function() {
    it('should by default cause resizer to be attached to the header elements', function() {
      // $scope.gridOpts.enableColumnResizing = true;
      // recompile();

      var resizers = $(grid).find('[ui-grid-column-resizer]');

      expect(resizers.size()).toEqual(4);
    });

    it('should only attach a right resizer to the first column', function() {
      // $scope.gridOpts.enableColumnResizing = true;
      // recompile();

      var firstColumn = $(grid).find('[ui-grid-header-cell]').first();

      var resizers = $(firstColumn).find('[ui-grid-column-resizer]');

      expect(resizers.size()).toEqual(1);

      expect(resizers.first().attr('position')).toEqual('right');
      expect(resizers.first().hasClass('right')).toBe(true);
    });

    it('should only attach a left resizer to the last column', function() {
      // $scope.gridOpts.enableColumnResizing = true;
      // recompile();

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

      var resizers = $(grid).find('[ui-grid-column-resizer]');

      expect(resizers.size()).toEqual(0);
    });
  });

  describe('setting flag on colDef to false', function() {
    it('should result in no resizer elements being attached to the column', function() {
      $scope.gridOpts.columnDefs = [
        { field: 'name' },
        { field: 'gender', enableColumnResizing: false },
        { field: 'company' }
      ];

      recompile();

      var middleCol = $(grid).find('[ui-grid-header-cell]:nth-child(2)');
      var resizer = middleCol.find('[ui-grid-column-resizer]');

      expect(resizer.size()).toEqual(0);
    });
  });


  // NOTE: these pixel sizes might fail in other browsers, due to font differences!
  describe('when double-clicking a resizer', function() {
    it('should resize the column to the maximum width of the rendered columns', function(done) {
      var firstResizer = $(grid).find('[ui-grid-column-resizer]').first();

      var colWidth = $(grid).find('.col0').first().width();

      expect(colWidth).toEqual(166);
      
      firstResizer.trigger('dblclick');

      $scope.$digest();
      
      var newColWidth = $(grid).find('.col0').first().width();

      expect(newColWidth).toEqual(100);
    });
  });

  describe('clicking on a resizer', function() {
    it('should cause the column separator overlay to be added', function() {
      var firstResizer = $(grid).find('[ui-grid-column-resizer]').first();

      firstResizer.trigger('mousedown');
      $scope.$digest();

      var overlay = $(grid).find('.ui-grid-resize-overlay');

      expect(overlay.size()).toEqual(1);

      // The grid shouldn't have the resizing class
      expect(grid.hasClass('column-resizing')).toEqual(false);
    });

    describe('and moving the mouse', function() {
      it('should cause the overlay to move', function() {
        
      });
    });
  });

  // TODO: click and move should result in the overlay being added, and following the mouse
});