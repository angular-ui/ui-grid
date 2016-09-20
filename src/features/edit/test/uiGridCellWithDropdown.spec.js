describe('ui.grid.edit GridCellDirective - with dropdown', function () {
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
    $templateCache.put('ui-grid/dropdownEditor', '<div><form name="inputForm"><select ng-class="\'colt\' + col.uid" ui-grid-edit-dropdown ng-model="MODEL_COL_FIELD" ng-options="field[editDropdownIdLabel] as field[editDropdownValueLabel] for field in editDropdownOptionsArray CUSTOM_FILTERS"></select></form></div>');

    scope = $rootScope.$new();
    var grid = gridClassFactory.createGrid();
    grid.options.columnDefs = [
      {name: 'col1', enableCellEdit: true, editableCellTemplate: 'ui-grid/dropdownEditor', editDropdownOptionsArray: [{id: 1, value: 'fred'}, {id:2, value: 'john'}]}
    ];
    grid.options.data = [
      {col1: 1}
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
      expect(element.text()).toBe('1');
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
      expect(element.text()).toBe('1');
      //invoke edit
      element.dblclick();
      expect(element.find('select')).toBeDefined();

      $timeout(function () {
        // val is the selected option, which is option 0 or 'number:1' in angular ^1.4
        /*
         * Why the version dependent test?
         * See: https://github.com/angular/angular.js/blob/master/CHANGELOG.md#breaking-changes-7
         */
        if ( angular.version.major === 1 && angular.version.minor < 4) { // If below vesrion 1.4
          expect(element.find('select').val()).toBe('0');
        } else { // If above vesrion 1.4
          expect(element.find('select').val()).toBe('number:1');
        }
      });
      $timeout.flush();
    });

    it('should stop editing on enter', function () {
      //stop edit
      var event = jQuery.Event("keydown");
      event.keyCode = uiGridConstants.keymap.ENTER;
      element.find('select').trigger(event);

      //back to beginning
      $timeout(function () {
        expect(element.html()).toBe(displayHtml);
      });
      $timeout.flush();

    });

    it('should stop editing on esc', function () {
      //stop edit
      var event = jQuery.Event("keydown");
      event.keyCode = uiGridConstants.keymap.ESC;
      element.find('select').trigger(event);

      //back to beginning
      expect(element.html()).toBe(displayHtml);
    });

    //todo: arrow left only stops editing if using cellnav.  need to wire up the controllers in test
    xit('should stop editing on arrow left', function () {
      //stop edit
      var event = jQuery.Event("keydown");
      event.keyCode = uiGridConstants.keymap.LEFT;
      element.find('select').trigger(event);

      //back to beginning
      expect(element.html()).toBe(displayHtml);
    });

    //todo: arrow left only stops editing if using cellnav.  need to wire up the controllers in test
    xit('should stop editing on arrow right', function () {
      //stop edit
      var event = jQuery.Event("keydown");
      event.keyCode = uiGridConstants.keymap.RIGHT;
      element.find('select').trigger(event);

      //back to beginning
      expect(element.html()).toBe(displayHtml);
    });

    it('should stop editing on tab', function () {
      //stop edit
      var event = jQuery.Event("keydown");
      event.keyCode = uiGridConstants.keymap.TAB;
      element.find('select').trigger(event);

      //back to beginning
      expect(element.html()).toBe(displayHtml);
    });

    it('should stop when grid scrolls', function () {
      //stop edit
      scope.grid.api.core.raise.scrollBegin(scope);
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
        element.find('select').trigger(event);
      });
      $timeout.flush();

      expect(edited).toBe(true);

    }));


  });

});
