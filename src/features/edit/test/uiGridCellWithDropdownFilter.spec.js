describe('ui.grid.edit GridCellDirective - with dropdown filter', function () {
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
      {
        name: 'col1',
        enableCellEdit: true,
        editableCellTemplate: 'ui-grid/dropdownEditor',
        editDropdownOptionsArray: [
          {id: 1, value: 'fred'},
          {id: 2, value: 'john'},
          {id: 3, value: 'ken'}
        ],
        editDropdownFilter: 'filter:{ id: 3 }:true'
      }
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

  describe('ui.grid.edit uiGridCell and uiGridEditor with editDropdownFilter', function () {
    var displayHtml;
    beforeEach(function () {
      element = angular.element('<div ui-grid-cell/>');
      recompile();

      displayHtml = element.html();
      expect(element.text()).toBe('1');
      //invoke edit
      element.dblclick();
      expect(element.find('select')).toBeDefined();

    });

    it('should have filtered options', function () {

      var options = element.find('select option');

      // options should be 0 and ken
      expect(options.length).toBe(2);
      expect(options[1].text).toBe('ken');

    });

  });

});
