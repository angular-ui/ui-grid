describe('GridRenderContainer factory', function () {
  var $q, $scope, cols, grid, gridCol, Grid, gridClassFactory, GridRenderContainer, uiGridConstants;

  beforeEach(module('ui.grid'));

  function buildCols() {
    grid.buildColumns();
  }


  beforeEach(inject(function (_$q_, _$rootScope_, _Grid_, _GridColumn_, _gridClassFactory_, _GridRenderContainer_, _uiGridConstants_) {
    $q = _$q_;
    $scope = _$rootScope_;
    Grid = _Grid_;
    gridClassFactory = _gridClassFactory_;
    GridRenderContainer = _GridRenderContainer_;
    uiGridConstants = _uiGridConstants_;

    grid = new Grid({ id: 1 });

    grid.options.columnDefs = [
      { field: 'firstName' },
      { field: 'lastName' },
      { field: 'company' },
      { field: 'gender' }
    ];

  }));

  describe('constructor', function () {
    it('should not throw with good arguments', function () {
      expect(function  () {
        var r = new GridRenderContainer('asdf', grid);
      }).not.toThrow();
    });

  });

  describe('getViewportStyle', function () {
    var r;

    beforeEach(function () {
       r = new GridRenderContainer('name', grid);
    });

    it('should have a vert and horiz scrollbar on body', function () {
      r.name = 'body';
      expect(r.getViewportStyle()).toEqual({'overflow-x':'scroll', 'overflow-y':'scroll'});
    });

    it('should have a vert only', function () {
      r.name = 'body';
      grid.options.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
      expect(r.getViewportStyle()).toEqual({'overflow-x':'scroll', 'overflow-y':'hidden'});
    });

    it('should have a horiz only', function () {
      r.name = 'body';
      grid.options.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
      expect(r.getViewportStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'scroll'});
    });

    it('left should have a no scrollbar when not rtl', function () {
      r.name = 'left';
      expect(r.getViewportStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'hidden'});
    });

    it('right should have a vert scrollbar when not rtl', function () {
      r.name = 'right';
      expect(r.getViewportStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'scroll'});
    });

    it('right should have no scrollbar when configured', function () {
      r.name = 'right';
      grid.options.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
      expect(r.getViewportStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'hidden'});
    });

    it('left should have a vert scrollbar when rtl', function () {
      r.name = 'left';
      grid.rtl = true;
      expect(r.getViewportStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'scroll'});
    });

    it('left should have no vert scrollbar when rtl and configured Never', function () {
      r.name = 'left';
      grid.rtl = true;
      grid.options.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
      expect(r.getViewportStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'hidden'});
    });

    it('right should have no scrollbars when rtl', function () {
      r.name = 'right';
      grid.rtl = true;
      expect(r.getViewportStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'hidden'});
    });

  });


  describe('updateWidths', function() {
    beforeEach(function() {
      grid.buildColumns();
      grid.setVisibleColumns(grid.columns);
      spyOn(grid, 'getViewportWidth').andCallFake(function() { return 415;});  // actual width 400 after scrollbar
      grid.scrollbarWidth = 15;
    });
    
    it('all percentages', function() {
      grid.columns[0].width = '25%';
      grid.columns[1].width = '25%';
      grid.columns[2].width = '25%';
      grid.columns[3].width = '25%';
      
      grid.renderContainers.body.updateColumnWidths();
      
      expect( grid.columns[0].drawnWidth ).toEqual(100);
      expect( grid.columns[1].drawnWidth ).toEqual(100);
      expect( grid.columns[2].drawnWidth ).toEqual(100);
      expect( grid.columns[3].drawnWidth ).toEqual(100);
    });

    it('all percentages, less than 100%', function() {
      grid.columns[0].width = '20%';
      grid.columns[1].width = '15%';
      grid.columns[2].width = '20%';
      grid.columns[3].width = '15%';
      
      grid.renderContainers.body.updateColumnWidths();
      
      expect( grid.columns[0].drawnWidth ).toEqual(80);
      expect( grid.columns[1].drawnWidth ).toEqual(60);
      expect( grid.columns[2].drawnWidth ).toEqual(80);
      expect( grid.columns[3].drawnWidth ).toEqual(60);
    });

    it('all percentages, more than 100%', function() {
      grid.columns[0].width = '40%';
      grid.columns[1].width = '30%';
      grid.columns[2].width = '40%';
      grid.columns[3].width = '30%';
      
      grid.renderContainers.body.updateColumnWidths();
      
      expect( grid.columns[0].drawnWidth ).toEqual(160);
      expect( grid.columns[1].drawnWidth ).toEqual(120);
      expect( grid.columns[2].drawnWidth ).toEqual(160);
      expect( grid.columns[3].drawnWidth ).toEqual(120);
    });

    it('fixed widths', function() {
      grid.columns[0].width = 50;
      grid.columns[1].width = 150;
      grid.columns[2].width = 50;
      grid.columns[3].width = 150;
      
      grid.renderContainers.body.updateColumnWidths();
      
      expect( grid.columns[0].drawnWidth ).toEqual(50);
      expect( grid.columns[1].drawnWidth ).toEqual(150);
      expect( grid.columns[2].drawnWidth ).toEqual(50);
      expect( grid.columns[3].drawnWidth ).toEqual(150);
    });

    it('asterixes', function() {
      grid.columns[0].width = '*';
      grid.columns[1].width = '*';
      grid.columns[2].width = '*';
      grid.columns[3].width = '*';
      
      grid.renderContainers.body.updateColumnWidths();
      
      expect( grid.columns[0].drawnWidth ).toEqual(100);
      expect( grid.columns[1].drawnWidth ).toEqual(100);
      expect( grid.columns[2].drawnWidth ).toEqual(100);
      expect( grid.columns[3].drawnWidth ).toEqual(100);
    });

    it('double asterixes', function() {
      grid.columns[0].width = '***';
      grid.columns[1].width = '*';
      grid.columns[2].width = '***';
      grid.columns[3].width = '*';
      
      grid.renderContainers.body.updateColumnWidths();
      
      expect( grid.columns[0].drawnWidth ).toEqual(150);
      expect( grid.columns[1].drawnWidth ).toEqual(50);
      expect( grid.columns[2].drawnWidth ).toEqual(150);
      expect( grid.columns[3].drawnWidth ).toEqual(50);
    });

    it('asterixes, min width', function() {
      grid.columns[0].width = '*';
      grid.columns[1].width = '*';
      grid.columns[2].width = '*';
      grid.columns[3].width = '*';
      grid.columns[0].minWidth = 130;
      
      grid.renderContainers.body.updateColumnWidths();
      
      expect( grid.columns[0].drawnWidth ).toEqual(130);
      expect( grid.columns[1].drawnWidth ).toEqual(90);
      expect( grid.columns[2].drawnWidth ).toEqual(90);
      expect( grid.columns[3].drawnWidth ).toEqual(90);
    });

    it('asterixes, max widths', function() {
      grid.columns[0].width = '*';
      grid.columns[1].width = '*';
      grid.columns[2].width = '*';
      grid.columns[3].width = '*';
      grid.columns[0].maxWidth = 70;
      
      grid.renderContainers.body.updateColumnWidths();
      
      expect( grid.columns[0].drawnWidth ).toEqual(70);
      expect( grid.columns[1].drawnWidth ).toEqual(110);
      expect( grid.columns[2].drawnWidth ).toEqual(110);
      expect( grid.columns[3].drawnWidth ).toEqual(110);
    });
  });

});