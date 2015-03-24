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

  });

  describe('getViewPortStyle', function () {
    var r;

    beforeEach(function () {
       r = new GridRenderContainer('name', grid);
    });

    it('should have a vert and horiz scrollbar on body', function () {
      r.name = 'body';
      expect(r.getViewPortStyle()).toEqual({'overflow-x':'scroll', 'overflow-y':'scroll'});
    });

    it('should have a vert only', function () {
      r.name = 'body';
      grid.options.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
      expect(r.getViewPortStyle()).toEqual({'overflow-x':'scroll', 'overflow-y':'hidden'});
    });

    it('should have a horiz only', function () {
      r.name = 'body';
      grid.options.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
      expect(r.getViewPortStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'scroll'});
    });

    it('left should have a no scrollbar when not rtl', function () {
      r.name = 'left';
      expect(r.getViewPortStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'hidden'});
    });

    it('right should have a vert scrollbar when not rtl', function () {
      r.name = 'right';
      expect(r.getViewPortStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'scroll'});
    });

    it('right should have no scrollbar when configured', function () {
      r.name = 'right';
      grid.options.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
      expect(r.getViewPortStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'hidden'});
    });

    it('left should have a vert scrollbar when rtl', function () {
      r.name = 'left';
      grid.rtl = true;
      expect(r.getViewPortStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'scroll'});
    });

    it('left should have no vert scrollbar when rtl and configured Never', function () {
      r.name = 'left';
      grid.rtl = true;
      grid.options.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
      expect(r.getViewPortStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'hidden'});
    });

    it('right should have no scrollbars when rtl', function () {
      r.name = 'right';
      grid.rtl = true;
      expect(r.getViewPortStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'hidden'});
    });
    it('vertical should be optional', function () {
        r.name = 'body';
        grid.options.enableVerticalScrollbar = uiGridConstants.scrollbars.WHEN_NEEDED;
        expect(r.getViewPortStyle()).toEqual({'overflow-x':'scroll', 'overflow-y':'auto'});
    });
    it('horizontal should be optional', function () {
        r.name = 'body';
        grid.options.enableHorizontalScrollbar = uiGridConstants.scrollbars.WHEN_NEEDED;
        expect(r.getViewPortStyle()).toEqual({'overflow-x':'auto', 'overflow-y':'scroll'});
    });
    it('vertical should be optional horizontal should be never', function () {
        r.name = 'body';
        grid.options.enableVerticalScrollbar = uiGridConstants.scrollbars.WHEN_NEEDED;
        grid.options.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
        expect(r.getViewPortStyle()).toEqual({'overflow-x':'hidden', 'overflow-y':'auto'});
    });

  });



});