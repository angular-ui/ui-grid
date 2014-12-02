describe('ui.grid.cellNav directive', function () {
  var $scope, $compile, elm, uiGridConstants;

  beforeEach(module('ui.grid.cellNav'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _uiGridConstants_) {
    $scope = _$rootScope_;
    $compile = _$compile_;
    uiGridConstants = _uiGridConstants_;

    $scope.gridOpts = {
      data: [{ name: 'Bob' }]
    };
  }));

  it('should not throw exceptions when scrolling when a grid does NOT have the ui-grid-cellNav directive', function () {
    elm = angular.element('<div ui-grid="gridOpts"></div>');

    $compile(elm)($scope);
    $scope.$digest();

    expect(function () {
      $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, {});
    }).not.toThrow();
  });
});