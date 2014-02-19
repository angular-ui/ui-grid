describe('uiGridEditDirective', function () {
  var gridUtil;
  var scope;
  var element;
  var uiGridController;
  var recompile;

  beforeEach(module('ui.grid.edit'));

  beforeEach(inject(function ($rootScope, $compile, $controller, _gridUtil_, $templateCache, $timeout) {
    gridUtil = _gridUtil_;

    $templateCache.put('ui-grid/ui-grid', '<div/>');
    $templateCache.put('ui-grid/uiGridCell', '<div/>');
    $templateCache.put('ui-grid/uiGridHeaderCell', '<div/>');
    $templateCache.put('ui-grid/editableCell', '<div editable_cell_directive></div>');

    scope = $rootScope.$new();
    scope.options = {};
    scope.options.data = [
      {col1: 'row1'},
      {col1: 'row2'}
    ];

    scope.options.columnDefs = [
      {field: 'col1', enableCellEdit: true},
      {field: 'col2', enableCellEdit: false}
    ];

    recompile = function () {
      $compile(element)(scope);
      $rootScope.$digest();
    };
  }));

  describe('columnsBuilder function', function () {

    it('should create additional edit properties', function () {
      element = angular.element('<div ui-grid="options" ui-grid-edit />');
      recompile();

      //grid scope is a child of the scope used to compile the element.
      // this is the only way I could figure out how to access
      var gridScope = element.scope().$$childTail;

      var col = gridScope.grid.getColumn('col1');
      expect(col).not.toBeNull();
      expect(col.enableCellEdit).toBe(true);
      expect(col.editableCellTemplate).toBe('<div editable_cell_directive></div>');
      expect(col.editableCellDirective).toBe('ui-grid-text-editor');

      col = gridScope.grid.getColumn('col2');
      expect(col).not.toBeNull();
      expect(col.enableCellEdit).toBe(false);
      expect(col.editableCellTemplate).not.toBeDefined();
      expect(col.editableCellDirective).not.toBeDefined();

    });
  });

});