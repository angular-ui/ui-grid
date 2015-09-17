describe('uiGridResizeColumnsService', function () {
  var uiGridResizeColumnsService;

  beforeEach(module('ui.grid.resizeColumns'));

  beforeEach(inject(function (_uiGridResizeColumnsService_) {
    uiGridResizeColumnsService = _uiGridResizeColumnsService_;
  }));

  describe('defaultGridOptions', function () {
    it('should default enableColumnResizing to true', function () {
      var gridOptions = {};
      uiGridResizeColumnsService.defaultGridOptions(gridOptions);
      expect(gridOptions.enableColumnResizing).toBe(true);
    });

    it('should not override false gridOptions.enableColumnResizing', function () {
      var gridOptions = {enableColumnResizing:false};
      uiGridResizeColumnsService.defaultGridOptions(gridOptions);
      expect(gridOptions.enableColumnResizing).toBe(false);
    });

    it('should not override false gridOptions.enableColumnResize (legacy support)', function () {
      var gridOptions = {enableColumnResize:false};
      uiGridResizeColumnsService.defaultGridOptions(gridOptions);
      expect(gridOptions.enableColumnResizing).toBe(false);
    });
  });

  describe('colResizerColumnBuilder', function () {
    it('should default enableColumnResizing to true', inject(function ($timeout) {
      var colDef = {name:'col1'};
      var gridOptions = {enableColumnResizing:true, colDefs:[colDef]};
      $timeout(function(){
        uiGridResizeColumnsService.colResizerColumnBuilder(colDef,null, gridOptions);
      });
      $timeout.flush();
      expect(gridOptions.colDefs[0].enableColumnResizing).toBe(true);
    }));

    it('should not override a colDef setting enableColumnResizing', inject(function ($timeout) {
      var colDef = {name:'col1', enableColumnResizing:false};
      var gridOptions = {enableColumnResizing:true, colDefs:[colDef]};
      $timeout(function(){
        uiGridResizeColumnsService.colResizerColumnBuilder(colDef,null, gridOptions);
      });
      $timeout.flush();
      expect(gridOptions.colDefs[0].enableColumnResizing).toBe(false);
    }));

    it('should override gridOptions enableColumnResizing', inject(function ($timeout) {
      var colDef = {name:'col1', enableColumnResizing:true};
      var gridOptions = {enableColumnResizing:false, colDefs:[colDef]};
      $timeout(function(){
        uiGridResizeColumnsService.colResizerColumnBuilder(colDef,null, gridOptions);
      });
      $timeout.flush();
      expect(gridOptions.colDefs[0].enableColumnResizing).toBe(true);
    }));

    it('should default enableColumnResizing to false if gridOptions is false', inject(function ($timeout) {
      var colDef = {name:'col1'};
      var gridOptions = {enableColumnResizing:false, colDefs:[colDef]};
      $timeout(function(){
        uiGridResizeColumnsService.colResizerColumnBuilder(colDef,null, gridOptions);
      });
      $timeout.flush();
      expect(gridOptions.colDefs[0].enableColumnResizing).toBe(false);
    }));

  });
});