describe('GridColumn factory', function () {
  var $q, $scope, cols, grid, Grid, GridColumn, gridClassFactory, GridRenderContainer, uiGridConstants, $httpBackend;

  beforeEach(module('ui.grid'));

  function buildCols(done, noDigest) {
    var promise = grid.buildColumns().then(function() {
      if (done) {
        done();
      }
    });
    if (!noDigest) {
      $scope.$digest();
    }
    return promise;
  }


  beforeEach(inject(function (_$q_, _$rootScope_, _Grid_, _GridColumn_, _gridClassFactory_, _GridRenderContainer_, _uiGridConstants_, _$httpBackend_) {
    $q = _$q_;
    $scope = _$rootScope_;
    Grid = _Grid_;
    GridColumn = _GridColumn_;
    gridClassFactory = _gridClassFactory_;
    GridRenderContainer = _GridRenderContainer_;
    uiGridConstants = _uiGridConstants_;
    $httpBackend = _$httpBackend_;

    cols = [
      { field: 'firstName' }
    ];

    grid = new Grid({ id: 1 });

    grid.registerColumnBuilder(gridClassFactory.defaultColumnBuilder);

    grid.options.columnDefs = cols;
    buildCols();
  }));

  describe('buildColumns', function () {
    describe('should not remove existing sort details on a column', function () {
      var sort = { priority: 0, direction: 'asc' };
      beforeEach(function(complete) {
        grid.columns[0].sort = sort;
        buildCols(complete);
      });

      it('after columns built',function () {
        expect(grid.columns[0].sort).toEqual(sort);
      });
    });

    describe('should add a column with a sort, sort is copied', function () {
      var sort = { priority: 0, direction: 'asc' };
      beforeEach(function(complete) {
        grid.options.columnDefs[1] = { field: 'surname', sort: sort };
        buildCols(complete);
      });

      it('after columns built', function () {
        expect(grid.columns[1].sort).toEqual(sort);
      });
    });

    describe('should not update sort when updating a column, but visible flag does update', function () {
      beforeEach(function(complete) {
        grid.options.columnDefs[0].sort = { priority: 0, direction: 'asc' };
        grid.options.columnDefs[0].visible = false;
        buildCols(complete);
      });

      it('after columns built', function () {
        expect(grid.columns[0].sort).toEqual({});
        expect(grid.columns[0].visible).toEqual(false);
      });
    });

    describe('should update everything but term when updating filters', function () {
      beforeEach(function(complete) {
        grid.options.columnDefs[0].filter = { term: 'x', placeholder: 'placeholder', type: uiGridConstants.filter.SELECT, selectOptions: [ { value: 1, label: "male" } ] };
        buildCols(complete);
      });

      it('after columns built', function () {
        expect(grid.columns[0].filters).toEqual([ { placeholder: 'placeholder', type: uiGridConstants.filter.SELECT, selectOptions: [ { value: 1, label: "male" } ] } ] );
      });
    });


    describe('should update everything but term when updating filters', function () {
      beforeEach(function(complete) {
        grid.options.columnDefs[0].filters = [{ term: 'x', placeholder: 'placeholder', type: uiGridConstants.filter.SELECT, selectOptions: [ { value: 1, label: "male" } ] }];
        buildCols(complete);
      });

      it('after columns built', function () {
        expect(grid.columns[0].filters).toEqual([ { placeholder: 'placeholder', type: uiGridConstants.filter.SELECT, selectOptions: [ { value: 1, label: "male" } ] } ] );
      });
    });


    it('should obey columnDef sort spec', function () {
      // ... TODO(c0bra)
    });

    describe('when handling field-only defs', function () {
      beforeEach(function () {
        grid = new Grid({ id: 1 });
        grid.registerColumnBuilder(gridClassFactory.defaultColumnBuilder);
      });

      it('should add an incrementing number to column names when they have the same field and no name', function () {
        grid.options.columnDefs = [
          { field: 'age' },
          { field: 'name' },
          { field: 'name' },
          { field: 'name' }
        ];

        buildCols();

        expect(grid.columns[0].name).toEqual('age');
        expect(grid.columns[1].name).toEqual('name');
        expect(grid.columns[2].name).toEqual('name2');
        expect(grid.columns[3].name).toEqual('name3');
      });

      it('should not change the displayNames if they are provided', function () {
        grid.options.columnDefs = [
          { field: 'age' },
          { field: 'name', displayName: 'First Name' },
          { field: 'name', displayName: 'First Name' },
          { field: 'name', displayName: 'First Name' }
        ];

        buildCols();

        expect(grid.columns[0].displayName).toEqual('Age');
        expect(grid.columns[1].displayName).toEqual('First Name');
        expect(grid.columns[2].displayName).toEqual('First Name');
        expect(grid.columns[3].displayName).toEqual('First Name');
      });

      it('should account for existing incremented names', function () {
        grid.options.columnDefs = [
          { field: 'age' },
          { field: 'name' },
          { field: 'name', name: 'name3' },
          { field: 'name' }
        ];

        buildCols();

        expect(grid.columns[0].name).toEqual('age');
        expect(grid.columns[1].name).toEqual('name');
        expect(grid.columns[2].name).toEqual('name3');
        expect(grid.columns[3].name).toEqual('name2');
      });
    });
  });

  describe('getRenderContainer', function () {
    it('should return the body container by default if the column has no render container specified', function () {
      var col = grid.columns[0];

      var container = col.getRenderContainer();

      expect(container.name).toEqual('body');
    });

    it('should return the container the column belongs to when the column has a specific render container specified', function () {
      // Add a new render container
      grid.renderContainers.blah = new GridRenderContainer('blah', grid);

      var col = grid.columns[0];
      col.renderContainer = 'blah';

      buildCols();

      var container = col.getRenderContainer();

      expect(container.name).toEqual('blah');
    });
  });

  describe('showColumn', function () {
    it('should set colDef.visible', function () {
      var col = grid.columns[0];
      col.showColumn();
      expect(col.colDef.visible).toBe(true);
      col.hideColumn();
      expect(col.colDef.visible).toBe(false);
    });
  });

  describe('aggregation', function() {
    beforeEach( function() {
      grid.options.data = [
        { name: 'fred', value: 1 },
        { name: 'john', value: 2 },
        { name: 'james', value: "3" },
        { name: 'matthew', value: 4 },
        { name: 'murray', value: 5 }
      ];
      grid.options.columnDefs = [ {name: 'name'}, {name: 'value'}];
    });

    it('count, with label', function() {
      grid.options.columnDefs[0].aggregationType = uiGridConstants.aggregationTypes.count;

      buildCols();
      grid.modifyRows(grid.options.data);

      // this would be called by the footer cell if it were rendered
      var deregFn = grid.api.core.on.rowsRendered(null, grid.columns[0].updateAggregationValue);
      grid.setVisibleRows(grid.rows);

      expect(grid.columns[0].getAggregationValue()).toEqual(5);
      expect(grid.columns[0].getAggregationText()).toEqual('total rows: ');
      deregFn();
    });

    it('count, without label', function() {
      grid.options.columnDefs[0].aggregationType = uiGridConstants.aggregationTypes.count;
      grid.options.columnDefs[0].aggregationHideLabel = true;

      buildCols(function() {});
      grid.modifyRows(grid.options.data);

      // this would be called by the footer cell if it were rendered
      var deregFn = grid.api.core.on.rowsRendered(null, grid.columns[0].updateAggregationValue);
      grid.setVisibleRows(grid.rows);

      expect(grid.columns[0].getAggregationValue()).toEqual(5);
      expect(grid.columns[0].getAggregationText()).toEqual('');
      deregFn();
    });

    it('sum, with label', function() {
      grid.options.columnDefs[1].aggregationType = uiGridConstants.aggregationTypes.sum;

      buildCols();
      grid.modifyRows(grid.options.data);

      // this would be called by the footer cell if it were rendered
      var deregFn = grid.api.core.on.rowsRendered(null, grid.columns[1].updateAggregationValue);
      grid.setVisibleRows(grid.rows);

      expect(grid.columns[1].getAggregationValue()).toEqual(15);
      expect(grid.columns[1].getAggregationText()).toEqual('total: ');
      deregFn();
    });

    it('sum, without label', function() {
      grid.options.columnDefs[1].aggregationType = uiGridConstants.aggregationTypes.sum;
      grid.options.columnDefs[1].aggregationHideLabel = true;

      buildCols();
      grid.modifyRows(grid.options.data);

      // this would be called by the footer cell if it were rendered
      var deregFn = grid.api.core.on.rowsRendered(null, grid.columns[1].updateAggregationValue);
      grid.setVisibleRows(grid.rows);

      expect(grid.columns[1].getAggregationValue()).toEqual(15);
      expect(grid.columns[1].getAggregationText()).toEqual('');
      deregFn();
    });

    it('avg, with label', function() {
      grid.options.columnDefs[1].aggregationType = uiGridConstants.aggregationTypes.avg;

      buildCols();
      grid.modifyRows(grid.options.data);

      // this would be called by the footer cell if it were rendered
      var deregFn = grid.api.core.on.rowsRendered(null, grid.columns[1].updateAggregationValue);
      grid.setVisibleRows(grid.rows);

      expect(grid.columns[1].getAggregationValue()).toEqual(3);
      expect(grid.columns[1].getAggregationText()).toEqual('avg: ');
      deregFn();
    });

    it('avg, without label', function() {
      grid.options.columnDefs[1].aggregationType = uiGridConstants.aggregationTypes.avg;
      grid.options.columnDefs[1].aggregationHideLabel = true;

      buildCols();
      grid.modifyRows(grid.options.data);

      // this would be called by the footer cell if it were rendered
      var deregFn = grid.api.core.on.rowsRendered(null, grid.columns[1].updateAggregationValue);
      grid.setVisibleRows(grid.rows);

      expect(grid.columns[1].getAggregationValue()).toEqual(3);
      expect(grid.columns[1].getAggregationText()).toEqual('');
      deregFn();
    });

    it('min, with label', function() {
      grid.options.columnDefs[1].aggregationType = uiGridConstants.aggregationTypes.min;

      buildCols();
      grid.modifyRows(grid.options.data);

      // this would be called by the footer cell if it were rendered
      var deregFn = grid.api.core.on.rowsRendered(null, grid.columns[1].updateAggregationValue);
      grid.setVisibleRows(grid.rows);

      expect(grid.columns[1].getAggregationValue()).toEqual(1);
      expect(grid.columns[1].getAggregationText()).toEqual('min: ');
      deregFn();
    });

    it('min, without label', function() {
      grid.options.columnDefs[1].aggregationType = uiGridConstants.aggregationTypes.min;
      grid.options.columnDefs[1].aggregationHideLabel = true;

      buildCols();
      grid.modifyRows(grid.options.data);

      // this would be called by the footer cell if it were rendered
      var deregFn = grid.api.core.on.rowsRendered(null, grid.columns[1].updateAggregationValue);
      grid.setVisibleRows(grid.rows);

      expect(grid.columns[1].getAggregationValue()).toEqual(1);
      expect(grid.columns[1].getAggregationText()).toEqual('');
      deregFn();
    });

    it('max, with label', function() {
      grid.options.columnDefs[1].aggregationType = uiGridConstants.aggregationTypes.max;

      buildCols();
      grid.modifyRows(grid.options.data);

      // this would be called by the footer cell if it were rendered
      var deregFn = grid.api.core.on.rowsRendered(null, grid.columns[1].updateAggregationValue);
      grid.setVisibleRows(grid.rows);

      expect(grid.columns[1].getAggregationValue()).toEqual(5);
      expect(grid.columns[1].getAggregationText()).toEqual('max: ');
      deregFn();
    });

    it('max, without label', function() {
      grid.options.columnDefs[1].aggregationType = uiGridConstants.aggregationTypes.max;
      grid.options.columnDefs[1].aggregationHideLabel = true;

      buildCols();
      grid.modifyRows(grid.options.data);

      // this would be called by the footer cell if it were rendered
      var deregFn = grid.api.core.on.rowsRendered(null, grid.columns[1].updateAggregationValue);
      grid.setVisibleRows(grid.rows);

      expect(grid.columns[1].getAggregationValue()).toEqual(5);
      expect(grid.columns[1].getAggregationText()).toEqual('');
      deregFn();
    });

    it('max, with custom label', function() {
      var customLabel = 'custom label';

      grid.options.columnDefs[1].aggregationType = uiGridConstants.aggregationTypes.max;
      grid.options.columnDefs[1].aggregationLabel = customLabel;
      grid.options.columnDefs[1].aggregationHideLabel = false;

      buildCols();
      grid.modifyRows(grid.options.data);

      // this would be called by the footer cell if it were rendered
      var deregFn = grid.api.core.on.rowsRendered(null, grid.columns[1].updateAggregationValue);
      grid.setVisibleRows(grid.rows);

      expect(grid.columns[1].getAggregationValue()).toEqual(5);
      expect(grid.columns[1].getAggregationText()).toEqual(customLabel);
      deregFn();
    });

    it('max, with custom label while also being hidden', function() {
      var customLabel = 'custom label';

      grid.options.columnDefs[1].aggregationType = uiGridConstants.aggregationTypes.max;
      grid.options.columnDefs[1].aggregationLabel = customLabel;
      grid.options.columnDefs[1].aggregationHideLabel = true;

      buildCols();
      grid.modifyRows(grid.options.data);

      // this would be called by the footer cell if it were rendered
      var deregFn = grid.api.core.on.rowsRendered(null, grid.columns[1].updateAggregationValue);
      grid.setVisibleRows(grid.rows);

      expect(grid.columns[1].getAggregationValue()).toEqual(5);
      expect(grid.columns[1].getAggregationText()).toEqual('');
      deregFn();
    });
  });

  describe('unsort', function() {
    beforeEach( function() {
      grid.options.data = [
        { name: 'fred', value: 1 },
        { name: 'john', value: 2 },
        { name: 'james', value: 3 },
        { name: 'matthew', value: 4 },
        { name: 'murray', value: 5 }
      ];
      grid.options.columnDefs = [ {name: 'name'}, {name: 'value'}];
    });

    it('raise event', function() {
      var sortChanged = false;
      grid.api.core.on.sortChanged( $scope, function() { sortChanged = true; });

      grid.columns[0].unsort();
      expect( sortChanged ).toEqual(true);
    });
  });

  describe('getCompiledElementFn()', function () {
    var col;

    beforeEach(function () {
      col = grid.columns[0];
    });

    it('should return a promise', function () {
      expect('then' in col.getCompiledElementFn()).toBe(true);
    });

    describe('should return a promise that is resolved when the cellTemplate is compiled', function () {
      var resolved = false;

      beforeEach(function (complete) {
        buildCols().then(function () {
          grid.preCompileCellTemplates();
        }).then(function() {
          col.getCompiledElementFn().then(function () {
            resolved = true;
            complete();
          });
        });
        $scope.$digest();
      });

      it('and should fully resolve', function () {
        expect(resolved).toBe(true);
      });
    });

    describe('should return a promise that is resolved when a URL-based cellTemplate is available', function () {
      var resolved = false;
      var url = 'http://www.a-really-fake-url.com/template.html';
      beforeEach(function (complete) {
        cols[0].cellTemplate = url;

        $httpBackend.when('GET', url).respond('<div>foo</div>');

        buildCols().then(function () {
          grid.preCompileCellTemplates();
        }).then(function() {
          col.getCompiledElementFn().then(function () {
            resolved = true;
            complete();
          });
        });

        expect(resolved).toBe(false);

        $httpBackend.flush();
        $scope.$digest();
      });

      it('should resolve', function () {
        expect(resolved).toBe(true);
      });
    });
  });

  describe('getCellTemplate()', function () {
    var col;

    beforeEach(function () {
      col = grid.columns[0];
    });

    it('should return a promise', function () {
      expect('then' in col.getCellTemplate()).toBe(true);
    });

    describe('should return a promise that is resolved when a URL-based cellTemplate is available', function () {
      var resolved = false;

      var url = 'http://www.a-really-fake-url.com/template.html';

      beforeEach(function (complete) {
        cols[0].cellTemplate = url;
        $httpBackend.when('GET', url).respond('<div>foo</div>');

        buildCols().then(function () {
          grid.preCompileCellTemplates();
        }).then(function () {
          col.getCellTemplate().then(function () {
            resolved = true;
            complete();
          });
        });
        expect(resolved).toBe(false);

        $httpBackend.flush();
        $scope.$digest();
      });

      it('should resolve', function () {
        expect(resolved).toBe(true);
      });
    });
  });

  describe('updateColumnDef(colDef, isNew)', function () {
    var col, colDef;

    beforeEach(function () {
      col = grid.columns[0];
      colDef = angular.copy(col.colDef);
      col.width = 141;
    });

    it ('should set the value of width to * when colDef.width is undefined', invalidColDef(undefined));
    it ('should set the value of width to * when colDef.width is null', invalidColDef(null));
    it ('should set the value of width to * when colDef.width is an object', invalidColDef({}));
    it ('should set the value of width to colDef.width when it is a percentage', widthEqualsColDefWidth('10.1%'));

    it ('should set the value of width to the persed integer colDef.width when it is a string', function () {
      colDef.width = '42';
      col.updateColumnDef(colDef);
      expect(col.width).toBe(42);
    });

    it ('should set the value of width to colDef.width when it is a series of *', widthEqualsColDefWidth('***'));
    it ('should set the value of width to colDef.width when it is a number', widthEqualsColDefWidth(42));

    it ('should throw when colDef.width is an invalid string', function () {
      colDef.width = 'e1%';
      expect(updateCol(colDef.width)).toThrow();
      colDef.width = '#FFF';
      expect(updateCol(colDef.width)).toThrow();
    });

    it ('should set the value of minWidth to 30 when colDef.minWidth and options.minimumColumnSize are undefined', invalidMinOrMaxWidthDef(undefined, 'minWidth'));
    it ('should set the value of minWidth to 30 when colDef.minWidth and options.minimumColumnSize are null', invalidMinOrMaxWidthDef(null, 'minWidth'));
    it ('should set the value of minWidth to 30 when colDef.minWidth and options.minimumColumnSize are an object', invalidMinOrMaxWidthDef({}, 'minWidth'));

    describe('when options.minimumColumnSize is valid', function() {
      function validMinimumColumnSize(colSize, colMinWidth) {
        return function() {
          col.grid.options.minimumColumnSize = colSize;
          colDef.minWidth = colMinWidth;
          col.updateColumnDef(colDef);
          expect(col.minWidth).toBe(parseInt(grid.options.minimumColumnSize));
        };
      }
      it ('should set the value of minWidth to options.minimumColumnSize when colDef.minWidth is undefined', validMinimumColumnSize(50, undefined));
      it ('should set the value of minWidth to options.minimumColumnSize when colDef.minWidth is null', validMinimumColumnSize('60', null));
      it ('should set the value of minWidth to options.minimumColumnSize when colDef.minWidth is an object', validMinimumColumnSize(70, {}));
    });

    it ('should set the value of minWidth to the parsed integer colDef.minWidth when it is a string', function () {
      colDef.minWidth = '90';
      col.updateColumnDef(colDef);
      expect(col.minWidth).toBe(90);
    });

    it ('should set the value of minWidth to colDef.minWidth when it is a number', function () {
      colDef.minWidth = 90;
      col.updateColumnDef(colDef);
      expect(col.minWidth).toBe(90);
    });

    it ('should throw when colDef.minWidth is an invalid string', function () {
      colDef.minWidth = 'e1%';
      expect(updateCol(col, colDef)).toThrow();
      colDef.minWidth = '#FFF';
      expect(updateCol(col, colDef)).toThrow();
    });

    it ('should set the value of maxWidth to 9000 when colDef.maxWidth is undefined', invalidMinOrMaxWidthDef(undefined, 'maxWidth'));
    it ('should set the value of maxWidth to 9000 when colDef.maxWidth is null', invalidMinOrMaxWidthDef(null, 'maxWidth'));
    it ('should set the value of maxWidth to 9000 when colDef.maxWidth is an object', invalidMinOrMaxWidthDef({}, 'maxWidth'));

    it ('should set the value of maxWidth to the parsed integer colDef.maxWidth when it is a string', function () {
      colDef.maxWidth = '200';
      col.updateColumnDef(colDef);
      expect(col.maxWidth).toBe(200);
    });

    it ('should set the value of maxWidth to colDef.maxWidth when it is a number', function () {
      colDef.maxWidth = 200;
      col.updateColumnDef(colDef);
      expect(col.maxWidth).toBe(200);
    });

    it ('should throw when colDef.maxWidth is an invalid string', function () {
      colDef.maxWidth = 'e1%';
      expect(updateCol(col, colDef)).toThrow();
      colDef.maxWidth = '#FFF';
      expect(updateCol(col, colDef)).toThrow();
    });

    describe('displayName', function() {
      it('should allow the user to set the displayName to an empty string or null value', function() {
        colDef.displayName = '';
        col.updateColumnDef(colDef);
        expect(col.displayName).toEqual('');

        colDef.displayName = null;
        col.updateColumnDef(colDef);
        expect(col.displayName).toBeNull();
      });
      it('should allow the user to enter whatever displayName they desire', function() {
        colDef.displayName = 'Test';
        col.updateColumnDef(colDef);
        expect(col.displayName).toEqual(colDef.displayName);
      });
      it('should generate a displayName based on the name attribute if the user does not define it', function() {
        colDef.displayName = undefined;
        colDef.name = 'mockName';
        col.updateColumnDef(colDef);
        expect(col.displayName).toEqual('Mock Name');
      });
    });

    describe('cellTooltip', function() {
      it('should be set to false when it is undefined', function() {
        colDef.cellTooltip = undefined;
        col.updateColumnDef(colDef);
        expect(col.cellTooltip).toBe(false);
      });
      it('should stay false when the user passed false', function() {
        colDef.cellTooltip = false;
        col.updateColumnDef(colDef);
        expect(col.cellTooltip).toBe(false);
      });
      it('should be set to a function that calls grid.getCellValue when it is set to true', function() {
        colDef.cellTooltip = true;
        col.updateColumnDef(colDef);
        expect(angular.isFunction(col.cellTooltip)).toBe(true);

        spyOn(col.grid, 'getCellValue').and.callFake(angular.noop);
        col.cellTooltip(null, col);

        expect(col.grid.getCellValue).toHaveBeenCalled();

        col.grid.getCellValue.calls.reset();
      });
      it('should be assigned to whatever function is passed to it', function() {
        colDef.cellTooltip = angular.noop;
        col.updateColumnDef(colDef);
        expect(angular.isFunction(col.cellTooltip)).toBe(true);
        expect(col.cellTooltip).toEqual(colDef.cellTooltip);
      });
      it('should be set to a function that returns the string passed into it when it is set to a string', function() {
        colDef.cellTooltip = 'MockHeaderTooltip';
        col.updateColumnDef(colDef);
        expect(angular.isFunction(col.cellTooltip)).toBe(true);
        expect(col.cellTooltip(null, col)).toEqual(colDef.cellTooltip);
      });
    });

    describe('headerTooltip', function() {
      it('should be set to false when it is undefined', function() {
        colDef.headerTooltip = undefined;
        col.updateColumnDef(colDef);
        expect(col.headerTooltip).toBe(false);
      });
      it('should stay false when the user passed false', function() {
        colDef.headerTooltip = false;
        col.updateColumnDef(colDef);
        expect(col.headerTooltip).toBe(false);
      });
      it('should be set to a function that returns the display name when it is set to true', function() {
        colDef.headerTooltip = true;
        col.updateColumnDef(colDef);
        expect(angular.isFunction(col.headerTooltip)).toBe(true);
        expect(col.headerTooltip(col)).toEqual(col.displayName);
      });
      it('should be assigned to whatever function is passed to it', function() {
        colDef.headerTooltip = angular.noop;
        col.updateColumnDef(colDef);
        expect(angular.isFunction(col.headerTooltip)).toBe(true);
        expect(col.headerTooltip).toEqual(colDef.headerTooltip);
      });
      it('should be set to a function that returns the string passed into it when it is set to a string', function() {
        colDef.headerTooltip = 'MockHeaderTooltip';
        col.updateColumnDef(colDef);
        expect(angular.isFunction(col.headerTooltip)).toBe(true);
        expect(col.headerTooltip(col)).toEqual(colDef.headerTooltip);
      });
    });

    describe('sortCellFiltered', function() {
      it('should set sortCellFiltered to true when the user passes in a truthy value', function() {
        colDef.sortCellFiltered = 1;
        col.updateColumnDef(colDef);

        expect(col.sortCellFiltered).toBe(true);
      });
      it('should set sortCellFiltered to false when the user passes in a falsy value', function() {
        colDef.sortCellFiltered = 0;
        col.updateColumnDef(colDef);

        expect(col.sortCellFiltered).toBe(false);
      });
    });

    describe('filterCellFiltered', function() {
      it('should set filterCellFiltered to true when the user passes in a truthy value', function() {
        colDef.filterCellFiltered = 'yes';
        col.updateColumnDef(colDef);

        expect(col.filterCellFiltered).toBe(true);
      });
      it('should set filterCellFiltered to false when the user passes in a falsy value', function() {
        colDef.filterCellFiltered = null;
        col.updateColumnDef(colDef);

        expect(col.filterCellFiltered).toBe(false);
      });
    });

    describe('footerCellFilter', function() {
      it('should set footerCellFilter to the value passed in by the user when the user passes in a truthy value', function() {
        colDef.footerCellFilter = 'date';
        col.updateColumnDef(colDef);

        expect(col.footerCellFilter).toEqual(colDef.footerCellFilter);
      });
      it('should set footerCellFilter an empty string when the user passes in a falsy value', function() {
        colDef.footerCellFilter = null;
        col.updateColumnDef(colDef);

        expect(col.footerCellFilter).toEqual('');
      });
    });

    describe('sortDirectionCycle', function() {
      it('should set sortDirectionCycle to the value passed in by the user when the user passes in a truthy value', function() {
        colDef.sortDirectionCycle = [uiGridConstants.ASC, uiGridConstants.DESC];
        col.updateColumnDef(colDef);

        expect(col.sortDirectionCycle).toEqual(colDef.sortDirectionCycle);
      });
      it('should set sortDirectionCycle the default value when the user passes in undefined', function() {
        colDef.sortDirectionCycle = undefined;
        col.updateColumnDef(colDef);

        expect(col.sortDirectionCycle).toEqual([null, uiGridConstants.ASC, uiGridConstants.DESC]);
      });
    });

    describe('enableFiltering', function() {
      it('should set enableFiltering to the value passed by the user when that value is not undefined', function() {
        colDef.enableFiltering = false;
        col.updateColumnDef(colDef);

        expect(col.enableFiltering).toEqual(colDef.enableFiltering);
      });
      it('should set enableFiltering to true when the user passes in undefined', function() {
        colDef.enableFiltering = undefined;
        col.updateColumnDef(colDef);

        expect(col.enableFiltering).toBe(true);
      });
    });

    function widthEqualsColDefWidth(expected) {
      return function () {
        colDef.width = expected;
        col.updateColumnDef(colDef);
        expect(col.width).toBe(expected);
      };
    }

    function invalidColDef(width) {
      return function () {
        colDef.width = width;
        col.updateColumnDef(colDef);
        expect(col.width).toBe('*');
      };
    }

    function updateCol(col, colDef) {
      return function () {
        col.updateColumnDef(colDef);
      };
    }

    function invalidMinOrMaxWidthDef(width, minOrMax) {
      return function () {
        col.grid.options.minimumColumnSize = width;
        colDef[minOrMax] = width;
        col.updateColumnDef(colDef);
        expect(col[minOrMax]).toBe(minOrMax === 'minWidth' ? 30 : 9000);
      };
    }
  });

  describe('isPinnedLeft', function() {
    var col;

    beforeEach(function () {
      col = grid.columns[0];
    });

    it('should return true when the column is on the left render container', function() {
      col.renderContainer = 'left';

      expect(col.isPinnedLeft()).toBe(true);
    });
    it('should return false when the column is not on the left render container', function() {
      col.renderContainer = 'right';

      expect(col.isPinnedLeft()).toBe(false);
    });
  });

  describe('isPinnedRight', function() {
    var col;

    beforeEach(function () {
      col = grid.columns[0];
    });

    it('should return true when the column is on the right render container', function() {
      col.renderContainer = 'right';

      expect(col.isPinnedRight()).toBe(true);
    });
    it('should return false when the column is not on the right render container', function() {
      col.renderContainer = 'left';

      expect(col.isPinnedRight()).toBe(false);
    });
  });
});
