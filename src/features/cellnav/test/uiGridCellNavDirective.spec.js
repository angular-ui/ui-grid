describe('ui.grid.cellNav directive', function () {
  var $scope, $compile, elm, uiGridConstants;

  beforeEach(module('ui.grid'));
  beforeEach(module('ui.grid.cellNav'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _uiGridConstants_) {
    $scope = _$rootScope_;
    $compile = _$compile_;
    uiGridConstants = _uiGridConstants_;

    $scope.gridOpts = {
      data: [{ name: 'Bob' }, {name: 'Mathias'}, {name: 'Fred'}],
      modifierKeysToMultiSelectCells: true
    };

    $scope.gridOpts.onRegisterApi = function (gridApi) {
      $scope.gridApi = gridApi;
      $scope.grid = gridApi.grid;
    };

    elm = angular.element('<div ui-grid="gridOpts" ui-grid-cellNav></div>');
    $scope.gridOpts.onRegisterApi = function (gridApi) {
      $scope.gridApi = gridApi;
      $scope.grid = gridApi.grid;
    };

    elm = angular.element('<div ui-grid="gridOpts" ui-grid-cellNav></div>');

    $compile(elm)($scope);
    $scope.$digest();
  }));

  it('should not throw exceptions when scrolling when a grid does NOT have the ui-grid-cellNav directive', function () {
    expect(function () {
      $scope.gridApi.core.raise.scrollBegin({});
    }).not.toThrow();
  });


  it('rowColSelectIndex(rowCol) should properly return the index of the provided rowCol representing the order it was' +
    ' selected', function () {
    var rowColToTest = { row: $scope.grid.rows[0], col: $scope.grid.columns[0] };
    // We select an arbitrary cell first to test that holding modifier persists the selection
    $scope.grid.cellNav.broadcastCellNav({ row: $scope.grid.rows[1], col: $scope.grid.columns[0] }, true);
    $scope.grid.cellNav.broadcastCellNav(rowColToTest, true);
    // Now our rowColToTest should have the index 1 as it was selected second
    expect($scope.gridApi.cellNav.rowColSelectIndex(rowColToTest)).toEqual(1);
  });

  it('getCurrentSelection() should properly return an array representing the values of the current cell selection', function () {
    $scope.grid.cellNav.broadcastCellNav({ row: $scope.grid.rows[0], col: $scope.grid.columns[0] }, true);
    $scope.grid.cellNav.broadcastCellNav({ row: $scope.grid.rows[1], col: $scope.grid.columns[0] }, true);
    expect($scope.gridApi.cellNav.getCurrentSelection().length).toEqual(2);
  });
  
  
  it('handleKeyDown should clear the focused cells list when clearing focus', function () {
	// first ensure that a cell is selected
	$scope.grid.cellNav.broadcastCellNav({ row: $scope.grid.rows[0], col: $scope.grid.columns[0] }, true);
    var rowColToTest = { row: $scope.grid.rows[0], col: $scope.grid.columns[0] };
    var evt = jQuery.Event("keydown");
    evt.keyCode = uiGridConstants.keymap.TAB;
	$scope.grid.cellNav.lastRowCol = rowColToTest;
	
	// simulate tabbing out of grid
    elm.controller('uiGrid').cellNav.handleKeyDown(evt);
	expect($scope.grid.cellNav.focusedCells.length).toEqual(0);
	
	// simulate restoring focus
	$scope.grid.cellNav.broadcastCellNav({ row: $scope.grid.rows[0], col: $scope.grid.columns[0] }, true);
	expect($scope.grid.cellNav.focusedCells.length).toEqual(1);
  });
});