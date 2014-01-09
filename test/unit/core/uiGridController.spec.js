describe('ui.grid.controller', function() {
  var gridUtil;
  var uiGridController;
  var scope;

  beforeEach(module('ui.grid'));


  beforeEach(inject(function ($rootScope, $controller,_gridUtil_) {
    gridUtil = _gridUtil_;
    scope = $rootScope.$new();
    scope.options = {};
    scope.options.data = [{col1:'val'}];
    scope.uiGrid = {data:scope.options.data};
    var element = angular.element('<div ui-grid="options"</div>');
    uiGridController = $controller('uiGridController', { $scope: scope, $element:element, $attrs:''});

  }));

  describe('newGrid', function() {
    it('creates a new grid instance', function() {
       expect(uiGridController.grid).toBeDefined();
      expect(uiGridController.grid.id).toBeDefined();
    });
  });
});