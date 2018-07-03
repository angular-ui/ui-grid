describe('uiGridResizeColumnsService', function() {
  var $timeout, uiGridResizeColumnsService;

  beforeEach(module('ui.grid.resizeColumns'));

  beforeEach(inject(function (_$timeout_, _uiGridResizeColumnsService_) {
    $timeout = _$timeout_;
    uiGridResizeColumnsService = _uiGridResizeColumnsService_;
  }));

  describe('defaultGridOptions', function() {
    it('should default enableColumnResizing to true', function() {
      var gridOptions = {};

      uiGridResizeColumnsService.defaultGridOptions(gridOptions);
      expect(gridOptions.enableColumnResizing).toBe(true);
    });

    it('should not override false gridOptions.enableColumnResizing', function() {
      var gridOptions = {enableColumnResizing: false};

      uiGridResizeColumnsService.defaultGridOptions(gridOptions);
      expect(gridOptions.enableColumnResizing).toBe(false);
    });

    it('should not override false gridOptions.enableColumnResize (legacy support)', function() {
      var gridOptions = {enableColumnResize: false};

      uiGridResizeColumnsService.defaultGridOptions(gridOptions);
      expect(gridOptions.enableColumnResizing).toBe(false);
    });
  });

  describe('colResizerColumnBuilder', function() {
    it('should default enableColumnResizing to true', function() {
      var colDef = {name: 'col1'},
        gridOptions = {enableColumnResizing: true, colDefs: [colDef]};

      $timeout(function() {
        uiGridResizeColumnsService.colResizerColumnBuilder(colDef,null, gridOptions);
      });
      $timeout.flush();
      expect(gridOptions.colDefs[0].enableColumnResizing).toBe(true);
    });

    it('should not override a colDef setting enableColumnResizing', function() {
      var colDef = {name: 'col1', enableColumnResizing: false},
        gridOptions = {enableColumnResizing: true, colDefs: [colDef]};

      $timeout(function() {
        uiGridResizeColumnsService.colResizerColumnBuilder(colDef,null, gridOptions);
      });
      $timeout.flush();
      expect(gridOptions.colDefs[0].enableColumnResizing).toBe(false);
    });

    it('should override gridOptions enableColumnResizing', function() {
      var colDef = {name: 'col1', enableColumnResizing: true},
        gridOptions = {enableColumnResizing: false, colDefs: [colDef]};

      $timeout(function() {
        uiGridResizeColumnsService.colResizerColumnBuilder(colDef,null, gridOptions);
      });
      $timeout.flush();
      expect(gridOptions.colDefs[0].enableColumnResizing).toBe(true);
    });

    it('should default enableColumnResizing to false if gridOptions is false', function() {
      var colDef = {name: 'col1'},
        gridOptions = {enableColumnResizing: false, colDefs: [colDef]};

      $timeout(function() {
        uiGridResizeColumnsService.colResizerColumnBuilder(colDef,null, gridOptions);
      });
      $timeout.flush();
      expect(gridOptions.colDefs[0].enableColumnResizing).toBe(false);
    });
  });
});
