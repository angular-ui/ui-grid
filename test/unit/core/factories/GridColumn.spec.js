describe('GridColumn factory', function () {
  var $q, $scope, cols, grid, gridCol, Grid, GridColumn, gridClassFactory, GridRenderContainer, uiGridConstants, $httpBackend;

  beforeEach(module('ui.grid'));

  function buildCols() {
    return grid.buildColumns();
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
    it('should not remove existing sort details on a column', function () {
      var sort = { priority: 0, direction: 'asc' };
      grid.columns[0].sort = sort;

      runs(buildCols);

      runs(function () {
        expect(grid.columns[0].sort).toEqual(sort);
      });
    });

    it('should add a column with a sort, sort is copied', function () {
      var sort = { priority: 0, direction: 'asc' };
      grid.options.columnDefs[1] = { field: 'surname', sort: sort };

      runs(buildCols);

      runs(function () {
        expect(grid.columns[1].sort).toEqual(sort);
      });
    });

    it('should not update sort when updating a column, but visible flag does update', function () {
      var sort = { priority: 0, direction: 'asc' };
      grid.options.columnDefs[0].sort = sort;
      grid.options.columnDefs[0].visible = false;

      runs(buildCols);

      runs(function () {
        expect(grid.columns[0].sort).toEqual({});
        expect(grid.columns[0].visible).toEqual(false);
      });
    });

    it('should update everything but term when updating filters', function () {
      var filter = { term: 'x', placeholder: 'placeholder', type: uiGridConstants.filter.SELECT, selectOptions: [ { value: 1, label: "male" } ] };
      grid.options.columnDefs[0].filter = filter;

      runs(buildCols);

      runs(function () {
        expect(grid.columns[0].filters).toEqual([ { placeholder: 'placeholder', type: uiGridConstants.filter.SELECT, selectOptions: [ { value: 1, label: "male" } ] } ] );
      });
    });


    it('should update everything but term when updating filters', function () {
      var filters = [{ term: 'x', placeholder: 'placeholder', type: uiGridConstants.filter.SELECT, selectOptions: [ { value: 1, label: "male" } ] }];
      grid.options.columnDefs[0].filters = filters;

      runs(buildCols);

      runs(function () {
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
        var cols = [
          { field: 'age' },
          { field: 'name' },
          { field: 'name' },
          { field: 'name' }
        ];

        grid.options.columnDefs = cols;

        buildCols();

        expect(grid.columns[0].displayName).toEqual('Age');
        expect(grid.columns[1].displayName).toEqual('Name');
        expect(grid.columns[2].displayName).toEqual('Name2');
        expect(grid.columns[3].displayName).toEqual('Name3');
      });

      it('should account for existing incremented names', function () {
        var cols = [
          { field: 'age' },
          { field: 'name' },
          { field: 'name', name: 'Name3' },
          { field: 'name' }
        ];

        grid.options.columnDefs = cols;

        buildCols();

        expect(grid.columns[0].displayName).toEqual('Age');
        expect(grid.columns[1].displayName).toEqual('Name');
        expect(grid.columns[2].displayName).toEqual('Name3');
        expect(grid.columns[3].displayName).toEqual('Name4');
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
      
      buildCols();
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
      grid.api.core.on.sortChanged( $scope, function(){ sortChanged = true; });
      
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

    it('should return a promise that is resolved when the cellTemplate is compiled', function () {
      var resolved = false;

      runs(function () {
        buildCols().then(function () {
          grid.preCompileCellTemplates();
        });
      });

      runs(function () {
        col.getCompiledElementFn().then(function () {
          resolved = true;
        });

        $scope.$digest();
      });

      // $scope.$digest();

      runs(function () {
        expect(resolved).toBe(true);
      });
    });

    it('should return a promise that is resolved when a URL-based cellTemplate is available', function () {
      var resolved = false;

      var url = 'http://www.a-really-fake-url.com/template.html';
      cols[0].cellTemplate = url;

      $httpBackend.when('GET', url).respond('<div>foo</div>');

      runs(function () {
        buildCols().then(function () {
          grid.preCompileCellTemplates();
        });

        col.getCompiledElementFn().then(function () {
          resolved = true;
        });

        expect(resolved).toBe(false);

        $httpBackend.flush();
      });

      runs(function () {
        $scope.$digest();
      });

      runs(function () {
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

    it('should return a promise that is resolved when a URL-based cellTemplate is available', function () {
      var resolved = false;

      var url = 'http://www.a-really-fake-url.com/template.html';
      cols[0].cellTemplate = url;

      $httpBackend.when('GET', url).respond('<div>foo</div>');

      runs(function () {
        buildCols().then(function () {
          grid.preCompileCellTemplates();
        });

        col.getCellTemplate().then(function () {
          resolved = true;
        });

        expect(resolved).toBe(false);

        $httpBackend.flush();
      });

      runs(function () {
        $scope.$digest();
      });

      runs(function () {
        expect(resolved).toBe(true);
      });
    });
  });
});