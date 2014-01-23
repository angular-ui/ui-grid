describe('ui.grid.edit GridCellDirective', function () {
  var gridUtil;
  var scope;
  var element;
  var uiGridConstants;
  var recompile;

  beforeEach(module('ui.grid.edit'));

  beforeEach(inject(function ($rootScope, $compile, $controller, _gridUtil_, $templateCache, gridClassFactory, uiGridEditService, _uiGridConstants_) {
    gridUtil = _gridUtil_;
    uiGridConstants = _uiGridConstants_;

    $templateCache.put('ui-grid/uiGridCell', '<div class="ui-grid-cell-contents">{{COL_FIELD CUSTOM_FILTERS}}</div>');
    $templateCache.put('ui-grid/edit/editableCell', '<div editable_cell_directive></div>');
    $templateCache.put('ui-grid/edit/cellTextEditor', '<input ng-input="COL_FIELD" ng-model="COL_FIELD" ng-blur="stopEdit()" />');

    scope = $rootScope.$new();
    var grid = gridClassFactory.createGrid();
    grid.options.columnDefs = [
      {name: 'col1', enableCellEdit: true}
    ];
    grid.options.data = [
      {col1: 'val'}
    ];
    grid.registerColumnBuilder(uiGridEditService.editColumnBuilder);
    grid.buildColumns();
    grid.modifyRows(grid.options.data);

    scope.grid = grid;
    scope.col = grid.columns[0];
    scope.row = grid.rows[0];

    scope.getCellValue = function(row,col){return 'val';};

    recompile = function () {
      $compile(element)(scope);
      $rootScope.$digest();
    };
  }));

  describe('ui.grid.edit uiGridCell and uiGridTextEditor full workflow', function () {
    var displayHtml;
    beforeEach(function () {
      element = angular.element('<div ui-grid-cell/>');
      recompile();

      displayHtml = element.html();
      expect(element.text()).toBe('val');
      //invoke edit
      element.dblclick();
      expect(element.find('input')).toBeDefined();
      expect(element.find('input').val()).toBe('val');
    });


    it('should stop editing on enter', function () {
      //stop edit
      var event = jQuery.Event("keydown");
      event.keyCode = uiGridConstants.keymap.ENTER;
      element.find('input').trigger(event);

      //back to beginning
      expect(element.html()).toBe(displayHtml);
    });

    it('should stop editing on esc', function () {
      //stop edit
      var event = jQuery.Event("keydown");
      event.keyCode = uiGridConstants.keymap.ESC;
      element.find('input').trigger(event);

      //back to beginning
      expect(element.html()).toBe(displayHtml);
    });

    it('should stop when grid scrolls', function () {
      //stop edit
      scope.$broadcast(uiGridConstants.events.GRID_SCROLL);
      scope.$digest();
      //back to beginning
      expect(element.html()).toBe(displayHtml);
    });
  });

});