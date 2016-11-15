describe('GridRow factory', function () {
  var $q, $scope, grid, Grid, GridRow, gridUtil, gridClassFactory, $timeout;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$q_, _$rootScope_, _Grid_, _GridRow_, _gridUtil_, _gridClassFactory_, _$timeout_) {
    $q = _$q_;
    $scope = _$rootScope_;
    Grid = _Grid_;
    GridRow = _GridRow_;
    gridUtil = _gridUtil_;
    gridClassFactory = _gridClassFactory_;
    $timeout = _$timeout_;
  }));


 describe('binding', function() {
    var grid;
    var entity;
    beforeEach(inject(function (_$q_, _$rootScope_, _Grid_, _GridRow_, _gridUtil_) {
      grid = new Grid({id:'a'});

      entity = {
        simpleProp: 'simpleProp',
        complexProp: { many: { paths: 'complexProp'}},
        functionProp: function () {
          return 'functionProp';
        },
        arrayProp: ['arrayProp']
      };
      entity['weird-prop'] = 'weird-prop';
    }));

    it('binds correctly to row.entity', function() {
      var gridRow = new GridRow(entity,0,grid);
      var col = {
        field:'simpleProp'
      };
      expect(gridRow.getQualifiedColField(col)).toBe('row.entity[\'simpleProp\']');
    });

    it('binds correctly to $$this', function() {
      var gridRow = new GridRow(entity,0,grid);
      var col = {
        field: '$$this'
      };
      expect(gridRow.getQualifiedColField(col)).toBe('row.entity');
    });

  });


  describe('row visibility', function() {
    var grid;
    var rowsVisibleChanged;

    beforeEach(function() {
      rowsVisibleChanged = false;

      grid = new Grid({id: 'a'});

      grid.options.columnDefs = [{ field: 'col1' }];
      for (var i = 0; i < 10; i++) {
        grid.options.data.push({col1:'a_' + i});
      }

      grid.buildColumns();
      grid.modifyRows(grid.options.data);
      grid.setVisibleRows(grid.rows);
    });

    it('should set then unset forceInvisible on visible row, raising visible rows changed event', function () {
      grid.api.core.on.rowsVisibleChanged( $scope, function() { rowsVisibleChanged = true; });

      expect(grid.api.core.getVisibleRows(grid).length).toEqual(10, 'all rows visible');

      grid.api.core.setRowInvisible(grid.rows[0]);
      expect(grid.rows[0].invisibleReason.user).toBe(true);
      expect(grid.rows[0].visible).toBe(false);

      expect(rowsVisibleChanged).toEqual(true);
      $scope.$apply();
      $timeout.flush();

      expect(grid.api.core.getVisibleRows(grid).length).toEqual(9, 'one row now invisible');

      rowsVisibleChanged = false;

      grid.api.core.clearRowInvisible(grid.rows[0]);
      expect(grid.rows[0].invisibleReason.user).toBe(undefined);
      expect(grid.rows[0].visible).toBe(true);

      expect(rowsVisibleChanged).toEqual(true);
      $scope.$apply();
      $timeout.flush();

      expect(grid.api.core.getVisibleRows(grid).length).toEqual(10, 'should be visible again');
    });

    it('should set forceInvisible on invisible row, then clear forceInvisible visible row, doesn\'t raise visible rows changed event', function () {
      grid.api.core.on.rowsVisibleChanged( $scope, function() { rowsVisibleChanged = true; });
      grid.rows[0].visible = false;

      grid.api.core.setRowInvisible(grid.rows[0]);
      expect(grid.rows[0].invisibleReason.user).toBe(true);
      expect(grid.rows[0].visible).toBe(false);

      expect(rowsVisibleChanged).toEqual(false);

      grid.rows[0].visible = true;

      grid.api.core.clearRowInvisible(grid.rows[0]);
      expect(grid.rows[0].invisibleReason.user).toBe(undefined);
      expect(grid.rows[0].visible).toBe(true);

      expect(rowsVisibleChanged).toEqual(false);
    });

    it('row not found is OK, no event raised', function () {
      grid.api.core.on.rowsVisibleChanged( $scope, function() { rowsVisibleChanged = true; });

      grid.api.core.setRowInvisible(grid, {col1: 'not in grid'});

      expect(rowsVisibleChanged).toEqual(false);
    });
  });

  describe('row height', function() {
    var grid;
    var rowsVisibleChanged;

    beforeEach(function() {
      rowsVisibleChanged = false;

      grid = new Grid({id: 'a'});

      grid.options.columnDefs = [{ field: 'col1' }];
      for (var i = 0; i < 10; i++) {
        grid.options.data.push({col1:'a_' + i});
      }

      grid.buildColumns();
      grid.modifyRows(grid.options.data);
      grid.setVisibleRows(grid.rows);
    });

    it('should have a rowheight setter', function () {
      var gridRow = new GridRow({},0,grid);
      gridRow.height = 99;
      expect(gridRow.$$height).toBe(99);
    });

    it('should flag the grid render containers to upate canvas heights', function () {
      var gridRow = grid.rows[0];
      grid.renderContainers.body.getCanvasHeight();
      expect(grid.renderContainers.body.canvasHeightShouldUpdate).toBe(false);
      expect(grid.renderContainers.body.$$canvasHeight).toBe(grid.options.data.length * grid.options.rowHeight);


      gridRow.height = grid.options.rowHeight * 2;
      expect(grid.renderContainers.body.canvasHeightShouldUpdate).toBe(true);
      expect(grid.renderContainers.body.canvasHeightShouldUpdate).toBe(true);
      expect(grid.renderContainers.body.getCanvasHeight()).toBe((grid.options.data.length * grid.options.rowHeight) + grid.options.rowHeight);
    });



  });

});

