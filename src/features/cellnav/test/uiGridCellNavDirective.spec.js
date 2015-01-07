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

    $scope.gridOpts.onRegisterApi = function(gridApi){
      $scope.gridApi = gridApi;
    };


  }));

  it('should not throw exceptions when scrolling when a grid does NOT have the ui-grid-cellNav directive', function () {
    elm = angular.element('<div ui-grid="gridOpts"></div>');

    $compile(elm)($scope);
    $scope.$digest();

    expect(function () {
      $scope.gridApi.core.raise.scrollEvent({});
    }).not.toThrow();
  });
});