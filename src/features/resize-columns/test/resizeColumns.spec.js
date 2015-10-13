describe('ui.grid.resizeColumns', function () {
  var grid, gridUtil, gridScope, $scope, $compile, recompile, uiGridConstants;

  var downEvent, upEvent, moveEvent;

  var data = [
    { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
    { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
    { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
    { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
  ];

  beforeEach(module('ui.grid'));
  beforeEach(module('ui.grid.resizeColumns'));

  beforeEach(inject(function (_$compile_, $rootScope, _uiGridConstants_, _gridUtil_) {
    $scope = $rootScope;
    $compile = _$compile_;
    uiGridConstants = _uiGridConstants_;
    gridUtil = _gridUtil_;

    if (gridUtil.isTouchEnabled()) {
      downEvent = 'touchstart';
      upEvent = 'touchend';
      moveEvent = 'touchmove';
    }
    else {
      downEvent = 'mousedown';
      upEvent = 'mouseup';
      moveEvent = 'mousemove';
    }

    $scope.gridOpts = {
      enableColumnResizing: true,
      data: data
    };

    $scope.gridOpts.onRegisterApi = function (gridApi) {
      $scope.gridApi = gridApi;
    };
    
    recompile = function () {
      gridUtil.resetUids();

      grid = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts" ui-grid-resize-columns></div>');
      document.body.appendChild(grid[0]);
      $compile(grid)($scope);
      $scope.$digest();
      gridScope = $(grid).isolateScope();
    };

    recompile();
  }));

  afterEach(function () {
    angular.element(grid).remove();
    grid = null;
  });

  describe('checking grid api for colResizable', function() {
    it('columnSizeChanged should be defined', function () {
      expect($scope.gridApi.colResizable.on.columnSizeChanged).toBeDefined();
    });
  });
  
  describe('setting enableColumnResizing', function () {
    it('should by default cause resizer to be attached to the header elements', function () {
      var resizers = $(grid).find('[ui-grid-column-resizer]');

      expect(resizers.size()).toEqual(5);
    });

    it('should only attach a right resizer to the first column', function () {
      var firstColumn = $(grid).find('[ui-grid-header-cell]').first();

      var resizers = $(firstColumn).find('[ui-grid-column-resizer]');

      expect(resizers.size()).toEqual(1);

      expect(resizers.first().attr('position')).toEqual('right');
      expect(resizers.first().hasClass('right')).toBe(true);
    });

    it('should attach left and right resizers to the last column', function () {
      var firstColumn = $(grid).find('[ui-grid-header-cell]').last();

      var resizers = $(firstColumn).find('[ui-grid-column-resizer]');

      expect(resizers.size()).toEqual(2);

      expect(resizers.first().attr('position')).toEqual('left');
      expect(resizers.first().hasClass('left')).toBe(true);
    });
  });

  describe('setting enableColumnResizing to false', function () {
    it('should result in no resizer elements being attached to the column', function () {
      $scope.gridOpts.enableColumnResizing = false;
      recompile();

      var resizers = $(grid).find('[ui-grid-column-resizer]');

      expect(resizers.size()).toEqual(0);
    });
  });

  describe('setting flag on colDef to false', function () {
    it('should result in only one resizer elements being attached to the column and the column to it\'s right', function () {
      $scope.gridOpts.columnDefs = [
        { field: 'name' },
        { field: 'gender', enableColumnResizing: false },
        { field: 'company' }
      ];

      recompile();

      var middleCol = $(grid).find('[ui-grid-header-cell]:nth-child(2)');
      var resizer = middleCol.find('[ui-grid-column-resizer]');

      expect(resizer.size()).toEqual(1);

      var lastCol = $(grid).find('[ui-grid-header-cell]:nth-child(3)');
      resizer = lastCol.find('[ui-grid-column-resizer]');

      expect(resizer.size()).toEqual(1);
    });
  });

  // NOTE: these pixel sizes might fail in other browsers, due to font differences!
  describe('double-clicking a resizer', function () {
    // TODO(c0bra): We account for menu button and sort icon size now, so this test is failing.
    xit('should resize the column to the maximum width of the rendered columns', function (done) {
      var firstResizer = $(grid).find('[ui-grid-column-resizer]').first();

      var colWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + '0').first().width();

      expect(colWidth === 166 || colWidth === 167).toBe(true); // allow for column widths that don't equally divide 

      firstResizer.trigger('dblclick');

      $scope.$digest();

      var newColWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + '0').first().width();

      // Can't really tell how big the columns SHOULD be, we'll just expect them to be different in width now
      expect(newColWidth).not.toEqual(colWidth);
    });
  });

  describe('clicking on a resizer', function () {
    it('should cause the column separator overlay to be added', function () {
      var firstResizer = $(grid).find('[ui-grid-column-resizer]').first();

      firstResizer.trigger(downEvent);
      $scope.$digest();

      var overlay = $(grid).find('.ui-grid-resize-overlay');

      expect(overlay.size()).toEqual(1);

      // The grid shouldn't have the resizing class
      expect(grid.hasClass('column-resizing')).toEqual(false);
    });

    describe('and moving the mouse', function () {
      var xDiff, initialWidth, initialX, overlay, initialOverlayX;

      beforeEach(function () {
        var firstResizer = $(grid).find('[ui-grid-column-resizer]').first();

        // Get the initial width of the column
        var firstColumnUid = gridScope.grid.columns[0].uid;
        initialWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + firstColumnUid).first().width();

        initialX = firstResizer.position().left;
        
        $(firstResizer).simulate(downEvent, { clientX: initialX });
        $scope.$digest();

        // Get the overlay
        overlay = $(grid).find('.ui-grid-resize-overlay');
        initialOverlayX = $(overlay).position().left;

        xDiff = 100;
        $(document).simulate(moveEvent, { clientX: initialX + xDiff });
        $scope.$digest();
      });

      it('should add the column-resizing class to the grid', function () {
        // The grid should have the resizing class
        expect(grid.hasClass('column-resizing')).toEqual(true);
      });

      it('should cause the overlay to appear', function () {
        expect(overlay.is(':visible')).toEqual(true);
      });

      // TODO(c0bra): This test is failing on Travis (PhantomJS on Linux).
      xit('should cause the overlay to move', function () {
        // TODO(c0bra): This tests fails on IE9 and Opera on linx. It gets 253 instead if 262 (9 pixels off)
        //expect($(overlay).position().left).toEqual( (initialX + xDiff + 1) ); // Extra one pixel here for grid border
        expect($(overlay).position().left).not.toEqual(initialX); // Extra one pixel here for grid border
      });

      describe('then releasing the mouse', function () {
        beforeEach(function () {       
          $(document).simulate(upEvent, { clientX: initialX + xDiff });
          $scope.$digest();
        });

        it('should cause the column to resize by the amount change in the X axis', function () {
          var firstColumnUid = gridScope.grid.columns[0].uid;
          var newWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + firstColumnUid).first().width();
          expect(newWidth - initialWidth).toEqual(xDiff);
        });

        it('should remove the overlay', function () {
          var overlay = $(grid).find('.ui-grid-resize-overlay');

          expect(overlay.size()).toEqual(0);
        });
      });
    });
  });

  describe('when a column has a minWidth', function () {
    var minWidth;

    beforeEach(function () {
      minWidth = 200;

      $scope.gridOpts.columnDefs = [
        { field: 'name', minWidth: minWidth },
        { field: 'gender' },
        { field: 'company' }
      ];
      
      recompile();
    });

    describe('and you double-click its resizer, the column width', function () {
      it('should not go below the minWidth less border', function () {
        var firstResizer = $(grid).find('[ui-grid-column-resizer]').first();

        $(firstResizer).simulate('dblclick');
        $scope.$digest();

        var firstColumnUid = gridScope.grid.columns[0].uid;

        var newWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + firstColumnUid).first().width();

        expect(newWidth >= (minWidth - 1)).toEqual(true);
      });
    });

    describe('and you move its resizer left further than the minWidth, the column width', function () {
      var initialX;

      beforeEach(function () {
        var firstResizer = $(grid).find('[ui-grid-column-resizer]').first();
        initialX = firstResizer.position().left;

        $(firstResizer).simulate(downEvent, { clientX: initialX });
        $scope.$digest();

        $(document).simulate(upEvent, { clientX: initialX - minWidth });
        $scope.$digest();
      });

      it('should not go below the minWidth less border', function () {
        var firstColumnUid = gridScope.grid.columns[0].uid;

        var newWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + firstColumnUid).first().width();

        expect(newWidth >= (minWidth - 1)).toEqual(true);
      });
    });
  });
  
  // Don't run this on IE9. The behavior looks correct when testing interactively but these tests fail
  if (!navigator.userAgent.match(/MSIE\s+9\.0/)) {
    describe('when a column has a maxWidth', function () {
      var maxWidth;

      beforeEach(function () {
        maxWidth = 60;

        $scope.gridOpts.columnDefs = [
          { field: 'name', maxWidth: maxWidth },
          { field: 'gender' },
          { field: 'company' }
        ];

        recompile();
      });

      describe('and you double-click its resizer', function () {
        it('the column width should not go above the maxWidth', function () {
          var firstResizer = $(grid).find('[ui-grid-column-resizer]').first();

          $(firstResizer).simulate('dblclick');
          $scope.$digest();

          var firstColumnUid = gridScope.grid.columns[0].uid;

          var newWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + firstColumnUid).first().width();

          expect(newWidth <= maxWidth).toEqual(true);
        });
      });

      describe('and you move its resizer right further than the maxWidth, the column width', function () {
        var initialX;

        beforeEach(function () {
          var firstResizer = $(grid).find('[ui-grid-column-resizer]').first();
          initialX = firstResizer.position().left;

          $(firstResizer).simulate(downEvent, { clientX: initialX });
          $scope.$digest();

          $(document).simulate(upEvent, { clientX: initialX + maxWidth });
          $scope.$digest();
        });

        it('should not go above the maxWidth', function () {
          var firstColumnUid = gridScope.grid.columns[0].uid;

          var newWidth = $(grid).find('.' + uiGridConstants.COL_CLASS_PREFIX + firstColumnUid).first().width();

          expect(newWidth <= maxWidth).toEqual(true);
        });
      });
    });
  }
});