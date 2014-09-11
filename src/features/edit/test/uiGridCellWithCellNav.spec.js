//tests not working. need to refactor either tests or cellNav because the controller isn't wired properly
xdescribe('ui.grid.edit GridCellDirective with CellNav feature', function () {
  beforeEach(module('ui.grid.cellNav'));
  beforeEach(module('ui.grid.edit'));

  var gridUtil;
  var scope;
  var element;
  var uiGridConstants;
  var recompile;
  var $timeout;


  var gridController = null;

  beforeEach(inject(function ($rootScope, $compile, $controller, _gridUtil_, $templateCache, gridClassFactory,
                              uiGridEditService, uiGridCellNavService, _uiGridConstants_, _$timeout_) {
    gridUtil = _gridUtil_;
    uiGridConstants = _uiGridConstants_;
    $timeout = _$timeout_;

    $templateCache.put('ui-grid/uiGridCell', '<div class="ui-grid-cell-contents">{{COL_FIELD CUSTOM_FILTERS}}</div>');
    $templateCache.put('ui-grid/cellEditor', '<div><input ng-model="COL_FIELD" ui-grid-editor /></div>');

    scope = $rootScope.$new();
    var grid = gridClassFactory.createGrid();
    grid.options.columnDefs = [
      {name: 'col1', enableCellEdit: true, enableCellEditOnFocus:true}
    ];
    grid.options.data = [
      {col1: 'val'}
    ];
    uiGridCellNavService.initializeGrid(grid);
    uiGridEditService.initializeGrid(grid);
    grid.buildColumns();
    grid.modifyRows(grid.options.data);

    scope.grid = grid;
    scope.col = grid.columns[0];
    scope.col.cellTemplate = '<div class="ui-grid-cell-contents">{{COL_FIELD}}</div>';
    scope.row = grid.rows[0];

    var gridController = {
      add: function() { return 123; }
    };


    $timeout(function(){
      grid.preCompileCellTemplates();
      recompile = function () {
        element.data('$uiGridController', gridController);
        $compile(element)(scope);
        $rootScope.$digest();
      };
    });
    $timeout.flush();
  }));
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

  it('should stop editing on arrow', function () {
    //stop edit

    $timeout(function () {
      var event = jQuery.Event("keydown");
      event.keyCode = uiGridConstants.keymap.RIGHT;
      element.find('input').trigger(event);
      scope.$digest();
    });
    $timeout.flush();


    //back to beginning
    expect(element.html()).toBe(displayHtml);
  });

  it('should not stop editing on arrow after click', inject(function ($timeout) {
    //click to deep edit (user can use arrows to navigate around editable text)



    var event = jQuery.Event("click");
    element.find('input').trigger(event);

    event = jQuery.Event("keydown");
    event.keyCode = uiGridConstants.keymap.ARROW_RIGHT;
    element.find('input').trigger(event);

    //back to beginning
    expect(element.html()).toBe(displayHtml);
  }));

});
