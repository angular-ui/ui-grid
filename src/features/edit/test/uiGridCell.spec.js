describe('ui.grid.edit GridCellDirective', function () {
  var gridUtil;
  var scope;
  var element;
  var uiGridConstants;
  var recompile;
  var $timeout;

  beforeEach(module('ui.grid.edit'));

  beforeEach(inject(function ($rootScope, $compile, $controller, _gridUtil_, $templateCache, gridClassFactory,
                              uiGridEditService, _uiGridConstants_, _$timeout_) {
    gridUtil = _gridUtil_;
    uiGridConstants = _uiGridConstants_;
    $timeout = _$timeout_;

    $templateCache.put('ui-grid/uiGridCell', '<div class="ui-grid-cell-contents">{{COL_FIELD CUSTOM_FILTERS}}</div>');
    $templateCache.put('ui-grid/cellEditor', '<div><input ng-model="MODEL_COL_FIELD" ui-grid-editor /></div>');

    scope = $rootScope.$new();
    var grid = gridClassFactory.createGrid();
    grid.options.columnDefs = [
      {name: 'col1', enableCellEdit: true}
    ];
    grid.options.data = [
      {col1: 'val', col2:'col2val'}
    ];
    uiGridEditService.initializeGrid(grid);
    grid.buildColumns();
    grid.modifyRows(grid.options.data);

    scope.grid = grid;
    scope.col = grid.columns[0];
    scope.row = grid.rows[0];

    scope.getCellValue = function(row,col){return 'val';};

    $timeout(function(){
      recompile = function () {
        $compile(element)(scope);
        $rootScope.$digest();
      };
    });
    $timeout.flush();

  }));

  describe('ui.grid.edit uiGridCell start editing', function () {
    var displayHtml;
    beforeEach(function () {
      element = angular.element('<div ui-grid-cell/>');
      recompile();

      displayHtml = element.html();
      expect(element.text()).toBe('val');
    });

    it('startEdit on "a"', function () {
      //stop edit
      var event = jQuery.Event("keydown");
      event.keyCode = 65;
      element.trigger(event);
      expect(element.find('input')).toBeDefined();
    });

    it('not start edit on tab', function () {
      //stop edit
      var event = jQuery.Event("keydown");
      event.keyCode = uiGridConstants.keymap.TAB;
      element.trigger(event);
      expect(element.html()).toEqual(displayHtml);
    });

  });

  describe('ui.grid.edit uiGridCell and uiGridEditor full workflow', function () {
    var displayHtml;
    beforeEach(function () {
      element = angular.element('<div ui-grid-cell/>');
      recompile();

      displayHtml = element.html();
      expect(element.text()).toBe('val');
      //invoke edit
      element.dblclick();
      $timeout(function () {
        expect(element.find('input')).toBeDefined();
        expect(element.find('input').val()).toBe('val');
      });
      $timeout.flush();
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

    it('should stop editing on tab', function () {
      //stop edit
      var event = jQuery.Event("keydown");
      event.keyCode = uiGridConstants.keymap.TAB;
      element.find('input').trigger(event);

      //back to beginning
      expect(element.html()).toBe(displayHtml);
    });

    it('should stop when grid scrolls', function () {
      //stop edit
      scope.grid.api.core.raise.scrollBegin();
      scope.$digest();
      //back to beginning
      expect(element.html()).toBe(displayHtml);
    });

    it('should fire public event', inject(function ($timeout) {

      var edited = false;

      scope.grid.api.edit.on.afterCellEdit(scope,function(rowEntity, colDef, newValue, oldValue){
        edited = true;
        scope.$apply();
      });

      //stop edit
      $timeout(function(){
        var event = jQuery.Event("keydown");
        event.keyCode = uiGridConstants.keymap.ENTER;
        element.find('input').trigger(event);
      });
      $timeout.flush();

      expect(edited).toBe(true);

    }));


  });


  describe('ui.grid.edit should override bound value when using editModelField', function () {
    var displayHtml;
    beforeEach(function () {
      element = angular.element('<div ui-grid-cell/>');
      //bind the edit to another column. This could be any property on the entity
      scope.grid.options.columnDefs[0].editModelField = 'col2';
      recompile();

      displayHtml = element.html();
      expect(element.text()).toBe('val');
      //invoke edit
      element.dblclick();
      expect(element.find('input')).toBeDefined();
      expect(element.find('input').val()).toBe('col2val');
    });
  });
});
