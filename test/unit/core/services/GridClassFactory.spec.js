describe('gridClassFactory', function() {
  var gridClassFactory;

  beforeEach(module('ui.grid'));

  beforeEach(inject(function(_gridClassFactory_) {
    gridClassFactory = _gridClassFactory_;
  }));

  describe('createGrid', function() {
    var grid;
    beforeEach( function() {
      grid = gridClassFactory.createGrid();
    });

    it('creates a grid with default properties', function() {
      expect(grid).toBeDefined();
      expect(grid.id).toBeDefined();
      expect(grid.id).not.toBeNull();
      expect(grid.options).toBeDefined();
    });
  });
  
  describe('defaultColumnBuilder', function () {
    var grid;
    var testSetup = {};
    beforeEach(inject(function($rootScope, $templateCache) {
      testSetup.$rootScope = $rootScope;
      testSetup.$templateCache = $templateCache;
      testSetup.col = {};
      testSetup.colDef = {};
      testSetup.gridOptions = {};
    }));

    it('column builder with no filters and template has no placeholders', function() {
      testSetup.$templateCache.put('ui-grid/uiGridHeaderCell', '<div>a sample header template with no custom_filters</div>');
      testSetup.$templateCache.put('ui-grid/uiGridCell', '<div>a sample cell template with no custom_filters</div>');
      testSetup.$templateCache.put('ui-grid/uiGridFooterCell', '<div>a sample footer template with no custom_filters</div>');
      
      gridClassFactory.defaultColumnBuilder( testSetup.colDef, testSetup.col, testSetup.gridOptions );
      
      expect(testSetup.col.providedHeaderCellTemplate).toEqual('ui-grid/uiGridHeaderCell');
      expect(testSetup.col.providedCellTemplate).toEqual('ui-grid/uiGridCell');
      expect(testSetup.col.providedFooterCellTemplate).toEqual('ui-grid/uiGridFooterCell');

      testSetup.$rootScope.$digest();
      
      expect(testSetup.col.headerCellTemplate).toEqual('<div>a sample header template with no custom_filters</div>');
      expect(testSetup.col.cellTemplate).toEqual('<div>a sample cell template with no custom_filters</div>');      
      expect(testSetup.col.footerCellTemplate).toEqual('<div>a sample footer template with no custom_filters</div>');
    });

    it('column builder with no filters and template has placeholders', function() {
      testSetup.$templateCache.put('ui-grid/uiGridHeaderCell', '<div>a sample header template with CUSTOM_FILTERS</div>');
      testSetup.$templateCache.put('ui-grid/uiGridCell', '<div>a sample cell template with CUSTOM_FILTERS</div>');
      testSetup.$templateCache.put('ui-grid/uiGridFooterCell', '<div>a sample footer template with CUSTOM_FILTERS</div>');
      
      gridClassFactory.defaultColumnBuilder( testSetup.colDef, testSetup.col, testSetup.gridOptions );
      
      expect(testSetup.col.providedHeaderCellTemplate).toEqual('ui-grid/uiGridHeaderCell');
      expect(testSetup.col.providedCellTemplate).toEqual('ui-grid/uiGridCell');
      expect(testSetup.col.providedFooterCellTemplate).toEqual('ui-grid/uiGridFooterCell');

      testSetup.$rootScope.$digest();
      
      expect(testSetup.col.headerCellTemplate).toEqual('<div>a sample header template with </div>');
      expect(testSetup.col.cellTemplate).toEqual('<div>a sample cell template with </div>');      
      expect(testSetup.col.footerCellTemplate).toEqual('<div>a sample footer template with </div>');      
    });

    it('column builder with filters and template has placeholders', function() {
      testSetup.$templateCache.put('ui-grid/uiGridHeaderCell', '<div>a sample header template with CUSTOM_FILTERS</div>');
      testSetup.$templateCache.put('ui-grid/uiGridCell', '<div>a sample cell template with CUSTOM_FILTERS</div>');
      testSetup.$templateCache.put('ui-grid/uiGridFooterCell', '<div>a sample footer template with CUSTOM_FILTERS</div>');
      
      testSetup.col.cellFilter = 'customCellFilter';
      testSetup.col.headerCellFilter = 'customHeaderCellFilter';
      testSetup.col.footerCellFilter = 'customFooterCellFilter';
      
      gridClassFactory.defaultColumnBuilder( testSetup.colDef, testSetup.col, testSetup.gridOptions );
      
      expect(testSetup.col.providedHeaderCellTemplate).toEqual('ui-grid/uiGridHeaderCell');
      expect(testSetup.col.providedCellTemplate).toEqual('ui-grid/uiGridCell');
      expect(testSetup.col.providedFooterCellTemplate).toEqual('ui-grid/uiGridFooterCell');

      testSetup.$rootScope.$digest();
      
      expect(testSetup.col.headerCellTemplate).toEqual('<div>a sample header template with |customHeaderCellFilter</div>');
      expect(testSetup.col.cellTemplate).toEqual('<div>a sample cell template with |customCellFilter</div>');      
      expect(testSetup.col.footerCellTemplate).toEqual('<div>a sample footer template with |customFooterCellFilter</div>');
    });

    it('column builder with filters and template has no placeholders', function() {
      testSetup.$templateCache.put('ui-grid/uiGridHeaderCell', '<div>a sample header template with custom_filters</div>');
      testSetup.$templateCache.put('ui-grid/uiGridCell', '<div>a sample cell template with custom_filters</div>');
      testSetup.$templateCache.put('ui-grid/uiGridFooterCell', '<div>a sample footer template with custom_filters</div>');
      
      testSetup.col.cellFilter = 'customCellFilter';
      testSetup.col.headerCellFilter = 'customHeaderCellFilter';
      testSetup.col.footerCellFilter = 'customFooterCellFilter';
      
      gridClassFactory.defaultColumnBuilder( testSetup.colDef, testSetup.col, testSetup.gridOptions );
      
      expect(testSetup.col.providedHeaderCellTemplate).toEqual('ui-grid/uiGridHeaderCell');
      expect(testSetup.col.providedCellTemplate).toEqual('ui-grid/uiGridCell');
      expect(testSetup.col.providedFooterCellTemplate).toEqual('ui-grid/uiGridFooterCell');

      // the code appears to rely on cellTemplate being undefined until properly retrieved (i.e. we cannot
      // just push 'ui-grid/uiGridCell' into here, then later replace it with the template body)
      expect(testSetup.col.cellTemplate).toEqual(undefined);

      testSetup.$rootScope.$digest();
      
      expect(testSetup.col.headerCellTemplate).toEqual('<div>a sample header template with custom_filters</div>');
      expect(testSetup.col.cellTemplate).toEqual('<div>a sample cell template with custom_filters</div>');      
      expect(testSetup.col.footerCellTemplate).toEqual('<div>a sample footer template with custom_filters</div>');
    });

    it('column builder passes double dollars as parameters to the filters correctly', function() {
      testSetup.$templateCache.put('ui-grid/uiGridHeaderCell', '<div>a sample header template with CUSTOM_FILTERS</div>');
      testSetup.$templateCache.put('ui-grid/uiGridCell', '<div>a sample cell template with CUSTOM_FILTERS</div>');
      testSetup.$templateCache.put('ui-grid/uiGridFooterCell', '<div>a sample footer template with CUSTOM_FILTERS</div>');

      testSetup.col.cellFilter = 'customCellFilter:row.entity.$$internalValue';
      testSetup.col.headerCellFilter = 'customHeaderCellFilter:row.entity.$$internalValue';
      testSetup.col.footerCellFilter = 'customFooterCellFilter:row.entity.$$internalValue';

      gridClassFactory.defaultColumnBuilder( testSetup.colDef, testSetup.col, testSetup.gridOptions );

      expect(testSetup.col.providedHeaderCellTemplate).toEqual('ui-grid/uiGridHeaderCell');
      expect(testSetup.col.providedCellTemplate).toEqual('ui-grid/uiGridCell');
      expect(testSetup.col.providedFooterCellTemplate).toEqual('ui-grid/uiGridFooterCell');

      testSetup.$rootScope.$digest();

      expect(testSetup.col.headerCellTemplate).toEqual('<div>a sample header template with |customHeaderCellFilter:row.entity.$$internalValue</div>');
      expect(testSetup.col.cellTemplate).toEqual('<div>a sample cell template with |customCellFilter:row.entity.$$internalValue</div>');
      expect(testSetup.col.footerCellTemplate).toEqual('<div>a sample footer template with |customFooterCellFilter:row.entity.$$internalValue</div>');
    });

  });

});