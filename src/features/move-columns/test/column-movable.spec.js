describe('ui.grid.moveColumns', function () {

  var scope, element, timeout, gridUtil, document, uiGridConstants;

  var data = [
    { "name": "Ethel Price", "gender": "female", "age": 25, "company": "Enersol", phone: '111'},
    { "name": "Claudine Neal", "gender": "female", "age": 30, "company": "Sealoud", phone: '111'},
    { "name": "Beryl Rice", "gender": "female", "age": 35, "company": "Velity", phone: '111'},
    { "name": "Wilder Gonzales", "gender": "male", "age": 40, "company": "Geekko", phone: '111'}
  ];

  beforeEach(module('ui.grid.moveColumns'));

  beforeEach(inject(function (_$compile_, $rootScope, $timeout, _gridUtil_, $document, _uiGridConstants_) {

    var $compile = _$compile_;
    scope = $rootScope;
    timeout = $timeout;
    gridUtil = _gridUtil_;
    document = $document;
    uiGridConstants = _uiGridConstants_;

    scope.gridOptions = {};
    scope.gridOptions.data = data;
    scope.gridOptions.columnDefs = [
      { field: 'name', width: 200 },
      { field: 'gender', width: 200 },
      { field: 'age', width: 200, visible: false},
      { field: 'company', enableColumnMoving: false, width: 200 },
      { field: 'phone', width: 200 }
    ];

    scope.gridOptions.onRegisterApi = function (gridApi) {
      scope.gridApi = gridApi;
      scope.grid = gridApi.grid;
    };

    element = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOptions" ui-grid-move-columns></div>');

    $timeout(function () {
      $compile(element)(scope);
    });
    $timeout.flush();
  }));

  it('grid api for columnMovable should be defined', function () {
    expect(scope.gridApi.colMovable).toBeDefined();
    expect(scope.gridApi.colMovable.on.columnPositionChanged).toBeDefined();
    expect(scope.gridApi.colMovable.raise.columnPositionChanged).toBeDefined();
    expect(scope.gridApi.colMovable.moveColumn).toBeDefined();
  });

  it('expect enableColumnMoving to be true by default', function () {
    expect(scope.grid.options.enableColumnMoving).toBe(true);
    expect(scope.grid.columns[0].colDef.enableColumnMoving).toBe(true);
    expect(scope.grid.columns[1].colDef.enableColumnMoving).toBe(true);
    expect(scope.grid.columns[2].colDef.enableColumnMoving).toBe(true);
    expect(scope.grid.columns[3].colDef.enableColumnMoving).toBe(false);
    expect(scope.grid.columns[4].colDef.enableColumnMoving).toBe(true);
  });

  it('expect moveColumn() to change position of columns', function () {
    scope.gridApi.colMovable.moveColumn(0, 1);
    expect(scope.grid.columns[0].name).toBe('gender');
    expect(scope.grid.columns[1].name).toBe('name');
    expect(scope.grid.columns[2].name).toBe('age');
    expect(scope.grid.columns[3].name).toBe('company');
    expect(scope.grid.columns[4].name).toBe('phone');
    scope.gridApi.colMovable.moveColumn(0, 3);
    expect(scope.grid.columns[0].name).toBe('name');
    expect(scope.grid.columns[1].name).toBe('age');
    expect(scope.grid.columns[2].name).toBe('company');
    expect(scope.grid.columns[3].name).toBe('phone');
    expect(scope.grid.columns[4].name).toBe('gender');
  });

  it('expect moveColumn() to persist after adding additional column', function () {
    scope.gridApi.colMovable.moveColumn(0, 1);
    scope.gridOptions.columnDefs.push({ field: 'name', displayName: 'name2', width: 200 });
    scope.gridApi.core.notifyDataChange( uiGridConstants.COLUMN );
    timeout.flush();
    scope.$digest();

    expect(scope.grid.columns[0].name).toBe('gender');
    expect(scope.grid.columns[1].name).toBe('name');
    expect(scope.grid.columns[2].name).toBe('age');
    expect(scope.grid.columns[3].name).toBe('company');
    expect(scope.grid.columns[4].name).toBe('phone');
    expect(scope.grid.columns[5].displayName).toBe('name2');
  });

  it('expect moveColumn() to not change position of columns if enableColumnMoving is false', function () {
    scope.gridApi.colMovable.moveColumn(2, 1);
    expect(scope.grid.columns[0].name).toBe('name');
    expect(scope.grid.columns[1].name).toBe('gender');
    expect(scope.grid.columns[2].name).toBe('age');
    expect(scope.grid.columns[3].name).toBe('company');
    expect(scope.grid.columns[4].name).toBe('phone');
  });

  it('expect moveColumn() to not change position of columns if column position given is wrong', function () {
    spyOn(gridUtil, 'logError').andCallFake(function() {});
    scope.gridApi.colMovable.moveColumn(4, 5);
    expect(scope.grid.columns[0].name).toBe('name');
    expect(scope.grid.columns[1].name).toBe('gender');
    expect(scope.grid.columns[2].name).toBe('age');
    expect(scope.grid.columns[3].name).toBe('company');
    expect(scope.grid.columns[4].name).toBe('phone');
    expect(gridUtil.logError).toHaveBeenCalledWith('MoveColumn: Invalid values for originalPosition, finalPosition');
  });

  it('expect event columnPositionChanged to be called when column position is changed', function () {
    var functionCalled = false;
    scope.gridApi.colMovable.on.columnPositionChanged(scope, function (colDef, newPos, oldPos) {
      functionCalled = true;
    });
    scope.gridApi.colMovable.moveColumn(0, 1);
    timeout.flush();
    expect(functionCalled).toBe(true);
  });

  it('expect column to move right when dragged right', function () {
    var event = jQuery.Event("mousedown", {
      pageX: 0
    });
    var columnHeader = angular.element(element.find('.ui-grid-cell-contents')[0]);
    columnHeader.trigger(event);
    event = jQuery.Event("mousemove", {
      pageX: 200
    });
    document.trigger(event);
    document.trigger(event);
    event = jQuery.Event("mouseup");
    document.trigger(event);
    expect(scope.grid.columns[0].name).toBe('gender');
    expect(scope.grid.columns[1].name).toBe('age');
    expect(scope.grid.columns[2].name).toBe('name');
    expect(scope.grid.columns[3].name).toBe('company');
    expect(scope.grid.columns[4].name).toBe('phone');
  });

  it('expect column to move left when dragged left', function () {
    var event = jQuery.Event("mousedown", {
      pageX: 0
    });
    var columnHeader = angular.element(element.find('.ui-grid-cell-contents')[1]);
    columnHeader.trigger(event);
    event = jQuery.Event("mousemove", {
      pageX: -200
    });
    document.trigger(event);
    document.trigger(event);
    event = jQuery.Event("mouseup");
    document.trigger(event);
    expect(scope.grid.columns[0].name).toBe('gender');
    expect(scope.grid.columns[1].name).toBe('name');
    expect(scope.grid.columns[2].name).toBe('age');
    expect(scope.grid.columns[3].name).toBe('company');
    expect(scope.grid.columns[4].name).toBe('phone');
  });

  it('expect column movement to not happen if enableColumnMoving is false', function () {
    var event = jQuery.Event("mousedown", {
      pageX: 0
    });
    var columnHeader = angular.element(element.find('.ui-grid-cell-contents')[3]);
    columnHeader.trigger(event);
    event = jQuery.Event("mousemove", {
      pageX: 200
    });
    document.trigger(event);
    document.trigger(event);
    event = jQuery.Event("mouseup");
    document.trigger(event);
    expect(scope.grid.columns[0].name).toBe('name');
    expect(scope.grid.columns[1].name).toBe('gender');
    expect(scope.grid.columns[2].name).toBe('age');
    expect(scope.grid.columns[3].name).toBe('company');
    expect(scope.grid.columns[4].name).toBe('phone');
  });

});
