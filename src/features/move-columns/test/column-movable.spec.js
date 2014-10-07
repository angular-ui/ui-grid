describe('ui.grid.moveColumns', function () {

  var scope, element, timeout;

  var data = [
    { "name": "Ethel Price", "gender": "female", "age": 25, "company": "Enersol", phone: '111'},
    { "name": "Claudine Neal", "gender": "female", "age": 30, "company": "Sealoud", phone: '111'},
    { "name": "Beryl Rice", "gender": "female", "age": 35, "company": "Velity", phone: '111'},
    { "name": "Wilder Gonzales", "gender": "male", "age": 40, "company": "Geekko", phone: '111'}
  ];

  beforeEach(module('ui.grid.moveColumns'));

  beforeEach(inject(function (_$compile_, $rootScope, $timeout) {

    var $compile = _$compile_;
    scope = $rootScope;
    timeout = $timeout;

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

  it('expect moveColumn() to not change position of columns if enableColumnMoving is false', function () {
    scope.gridApi.colMovable.moveColumn(2, 1);
    expect(scope.grid.columns[0].name).toBe('name');
    expect(scope.grid.columns[1].name).toBe('gender');
    expect(scope.grid.columns[2].name).toBe('age');
    expect(scope.grid.columns[3].name).toBe('company');
    expect(scope.grid.columns[4].name).toBe('phone');
  });

  xit('expect event columnPositionChanged to be called when column position is changed', function () {
    var functionCalled = false;
    scope.gridApi.colMovable.on.columnPositionChanged(scope, function (colDef, newPos, oldPos) {
      functionCalled = true;
    });
    scope.gridApi.colMovable.moveColumn(0, 1);
    expect(functionCalled).toBe(true);
  });

  xit('expect column to move right when dragged right', function () {
    var event = jQuery.Event("mousedown");
    event.toElement = {className: '.ui-grid-header-cell'};
    var columnHeader = angular.element(element.find('.ui-grid-header-cell')[0]);
    columnHeader.trigger(event);
    event = jQuery.Event("mousemove", {
      pageX: 250
    });
    columnHeader.trigger(event);
    event = jQuery.Event("mouseup");
    columnHeader.trigger(event);
    expect(scope.grid.columns[0].name).toBe('gender');
    expect(scope.grid.columns[1].name).toBe('name');
    expect(scope.grid.columns[2].name).toBe('age');
    expect(scope.grid.columns[3].name).toBe('company');
    expect(scope.grid.columns[4].name).toBe('phone');
  });

  xit('expect column to move left when dragged left', function () {
    var event = jQuery.Event("mousedown");
    event.toElement = {className: '.ui-grid-header-cell'};
    var columnHeader = angular.element(element.find('.ui-grid-header-cell')[1]);
    columnHeader.trigger(event);
    event = jQuery.Event("mousemove", {
      pageX: -250
    });
    columnHeader.trigger(event);
    event = jQuery.Event("mouseup");
    columnHeader.trigger(event);
    expect(scope.grid.columns[0].name).toBe('gender');
    expect(scope.grid.columns[1].name).toBe('name');
    expect(scope.grid.columns[2].name).toBe('age');
    expect(scope.grid.columns[3].name).toBe('company');
    expect(scope.grid.columns[4].name).toBe('phone');
  });

  xit('expect column movement to not happen if enableColumnMoving is false', function () {
    var event = jQuery.Event("mousedown");
    event.toElement = {className: '.ui-grid-header-cell'};
    var columnHeader = angular.element(element.find('.ui-grid-header-cell')[3]);
    columnHeader.trigger(event);
    event = jQuery.Event("mousemove", {
      pageX: 75
    });
    columnHeader.trigger(event);
    event = jQuery.Event("mouseup");
    columnHeader.trigger(event);
    scope.grid.refresh();
    expect(scope.grid.columns[0].name).toBe('name');
    expect(scope.grid.columns[1].name).toBe('gender');
    expect(scope.grid.columns[2].name).toBe('age');
    expect(scope.grid.columns[3].name).toBe('company');
    expect(scope.grid.columns[4].name).toBe('phone');
  });

});
