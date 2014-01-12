
describe('uiGridEditDirective', function() {
  var gridUtil;
  var scope;
  var element;
  var uiGridController;
  var recompile;

  beforeEach(module('ui.grid.edit'));

  beforeEach(inject(function ($rootScope, $compile, $controller, _gridUtil_, $templateCache) {
    gridUtil = _gridUtil_;

    $templateCache.put('ui-grid/ui-grid','<div/>');
    $templateCache.put('ui-grid/uiGridCell','<div/>');
    $templateCache.put('ui-grid/uiGridHeaderCell','<div/>');
    $templateCache.put('ui-grid/cellEdit','<div/>');
    $templateCache.put('ui-grid/editableCellText','<div/>');

    scope = $rootScope.$new();
    scope.options = {};
    scope.options.data = [
      {col1:'row1'},
      {col1:'row2'}
    ];

    scope.options.columnDefs = [
      {field:'col1',enableCellEdit:true}
    ];

    scope.uiGrid = scope.options;
    uiGridController = $controller('uiGridController', { $scope: scope, $element:element, $attrs:''});
    scope.$apply();

    recompile = function() {
      $compile(element)(scope);
      scope.$digest();
    };
  }));


  describe('add properties to columns', function() {

    it('allows style elements to have expressions', function() {
      element = angular.element('<div ui-grid="options" ui-grid-edit />');
      recompile();

      expect(uiGridController.grid.getColumn('col1')).not.toBeNull();
      expect(uiGridController.grid.getColumn('col1').editableCellTemplate).toBe('<div/>');

    });
  });

});