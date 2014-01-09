describe('ui.grid.controller', function() {
  var gridUtil;
  var uiGridController;
  var scope;

  beforeEach(module('ui.grid'));

  describe('no columns. data in options', function() {
    beforeEach(inject(function ($rootScope, $controller,_gridUtil_) {
      gridUtil = _gridUtil_;
      scope = $rootScope.$new();
      scope.options = {};
      scope.options.data = [{col1:'val'}];
      scope.uiGrid = {data:scope.options.data};
      var element = angular.element('<div ui-grid="options"</div>');
      uiGridController = $controller('uiGridController', { $scope: scope, $element:element, $attrs:''});
      scope.$apply();

    }));

    describe('newGrid', function() {
      it('creates a new grid instance', function() {
        expect(uiGridController.grid).toBeDefined();
        expect(uiGridController.grid.id).toBeDefined();
        expect(uiGridController.grid.options).toBeDefined();
      });
      it('has column definitions', function() {
        expect(uiGridController.grid.options.columnDefs).toBeDefined();
        expect(uiGridController.grid.options.columnDefs.length).toBe(1);
      });
      it('has grid data', function() {
        expect(uiGridController.grid.options.data).toBeDefined();
        expect(uiGridController.grid.options.data.length).toBe(1);
      });
    });
  });
});