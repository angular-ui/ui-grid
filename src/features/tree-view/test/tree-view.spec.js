describe('ui.grid.treeView uiGridTreeViewService', function () {
  var uiGridTreeViewService;
  var uiGridTreeViewConstants;
  var gridClassFactory;
  var grid;
  var $rootScope;
  var $scope;
  var GridRow;

  beforeEach(module('ui.grid.treeView'));

  beforeEach(inject(function (_uiGridTreeViewService_,_gridClassFactory_, $templateCache, _uiGridTreeViewConstants_,
                              _$rootScope_, _GridRow_) {
    uiGridTreeViewService = _uiGridTreeViewService_;
    uiGridTreeViewConstants = _uiGridTreeViewConstants_;
    gridClassFactory = _gridClassFactory_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    GridRow = _GridRow_;

    $templateCache.put('ui-grid/uiGridCell', '<div/>');
    $templateCache.put('ui-grid/editableCell', '<div editable_cell_directive></div>');

    grid = gridClassFactory.createGrid({});
    grid.options.columnDefs = [
      {field: 'col0'},
      {field: 'col1'},
      {field: 'col2'},
      {field: 'col3'}
    ];

    _uiGridTreeViewService_.initializeGrid(grid, $scope);
    var data = [];
    for (var i = 0; i < 10; i++) {
      data.push({col0: 'a_' + Math.floor(i/4), col1: 'b_' + Math.floor(i/2), col2: 'c_' + i, col3: 'd_' + i});
    }
    data[0].$$treeLevel = 0;
    data[1].$$treeLevel = 1;
    data[3].$$treeLevel = 1;
    data[4].$$treeLevel = 2;
    data[7].$$treeLevel = 0;
    data[9].$$treeLevel = 1;

    grid.options.data = data;

    grid.buildColumns();
    grid.modifyRows(grid.options.data);
  }));

});