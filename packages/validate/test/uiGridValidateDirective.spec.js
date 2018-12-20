describe('uiGridValidateDirective', function () {
  var scope;
  var element;
  var recompile;
  var digest;
  var uiGridConstants;
  var $timeout;

  beforeEach(module('ui.grid.validate', 'ui.grid.edit'));

  beforeEach(inject(function ($rootScope, $compile, _uiGridConstants_, _$timeout_, $templateCache) {

    scope = $rootScope.$new();
    scope.options = {enableCellEdit: true};
    scope.options.data = [
      {col1: 'A1', col2: 'B1'},
      {col1: 'A2', col2: 'B2'}
    ];

    scope.options.columnDefs = [
      {field: 'col1', validators: {required: true},
       cellTemplate: 'ui-grid/cellTitleValidator'},
      {field: 'col2', validators: {minLength: 2},
      cellTemplate: 'ui-grid/cellTooltipValidator'}
    ];


    recompile = function () {
      $compile(element)(scope);
      $rootScope.$digest();
    };

    digest = function() {
      $rootScope.$digest();
    };

    uiGridConstants = _uiGridConstants_;
    $timeout = _$timeout_;

  }));


  it('should add a validate property to the grid', function () {

    element = angular.element('<div ui-grid="options" ui-grid-edit ui-grid-validate />');
    recompile();

    var gridScope = element.scope().$$childHead;

    var validate = gridScope.grid.validate;

    expect(validate).toBeDefined();

  });

  it('should run validators on a edited cell', function () {

    element = angular.element('<div ui-grid="options" ui-grid-edit ui-grid-validate />');
    recompile();

    var cells = element.find('.ui-grid-cell-contents.ng-scope');

    for (var i = 0; i < cells.length; i++) {
      var cellContent = cells[i];
      var cellValue = cellContent.textContent;
      var event = jQuery.Event("keydown");

      var cell = angular.element(cellContent.parentElement);
      cell.dblclick();
      $timeout.flush();
      expect(cell.find('input').length).toBe(1);

      switch (cellValue) {
        case 'A1':
          cell.find('input').controller('ng-model').$setViewValue('');
          event = jQuery.Event("keydown");
          event.keyCode = uiGridConstants.keymap.TAB;
          cell.find('input').trigger(event);
          digest();
          expect(cellContent.classList.contains('invalid')).toBe(true);
          break;
        case 'B1':
          cell.find('input').controller('ng-model').$setViewValue('B');
          event = jQuery.Event("keydown");
          event.keyCode = uiGridConstants.keymap.TAB;
          cell.find('input').trigger(event);
          digest();
          expect(cellContent.classList.contains('invalid')).toBe(true);
          break;
        case 'A2':
          cell.find('input').controller('ng-model').$setViewValue('A');
          event = jQuery.Event("keydown");
          event.keyCode = uiGridConstants.keymap.TAB;
          cell.find('input').trigger(event);
          digest();
          expect(cellContent.classList.contains('invalid')).toBe(false);
          break;
        case 'B2':
          cell.find('input').controller('ng-model').$setViewValue('B2+');
          event = jQuery.Event("keydown");
          event.keyCode = uiGridConstants.keymap.TAB;
          cell.find('input').trigger(event);
          digest();
          expect(cellContent.classList.contains('invalid')).toBe(false);
          break;
      }
    }
  });

  it('should run validators on a edited invalid cell', function () {
    element = angular.element('<div ui-grid="options" ui-grid-edit ui-grid-validate />');
    recompile();

    var cells = element.find('.ui-grid-cell-contents.ng-scope');
    var cellContent = cells[0];
    var cellValue = cellContent.textContent;
    var event = jQuery.Event("keydown");

    var cell = angular.element(cellContent.parentElement);
    cell.dblclick();
    $timeout.flush();
    expect(cell.find('input').length).toBe(1);

    cell.find('input').controller('ng-model').$setViewValue('');
    event = jQuery.Event("keydown");
    event.keyCode = uiGridConstants.keymap.TAB;
    cell.find('input').trigger(event);
    digest();
    expect(cellContent.classList.contains('invalid')).toBe(true);

    cell.dblclick();
    $timeout.flush();
    expect(cell.find('input').length).toBe(1);

    cell.find('input').controller('ng-model').$setViewValue('A1');
    event = jQuery.Event("keydown");
    event.keyCode = uiGridConstants.keymap.TAB;
    cell.find('input').trigger(event);
    digest();
    expect(cellContent.classList.contains('invalid')).toBe(false);
  });

  it('should raise an event when validation fails', function () {

    element = angular.element('<div ui-grid="options" ui-grid-edit ui-grid-validate />');
    recompile();

    var cells = element.find('.ui-grid-cell-contents.ng-scope');
    var cellContent = cells[1];
    var cellValue = cellContent.textContent;
    var event = jQuery.Event("keydown");
    var scope = angular.element(cellContent).scope();
    var grid = scope.grid;

    var listenerObject;

    grid.api.validate.on.validationFailed(scope, function(rowEntity, colDef, newValue, oldValue) {
      listenerObject = [rowEntity, colDef, newValue, oldValue];
    });

    var validationFailedSpy = jasmine.createSpy('validationFailed');
    validationFailedSpy.and.callThrough();
    validationFailedSpy(grid.api.validate.raise, 'validationFailed');

    var cell = angular.element(cellContent.parentElement);
    cell.dblclick();
    $timeout.flush();
    expect(cell.find('input').length).toBe(1);

    cell.find('input').controller('ng-model').$setViewValue('B');
    event = jQuery.Event("keydown");
    event.keyCode = uiGridConstants.keymap.TAB;
    cell.find('input').trigger(event);
    digest();
    expect(cellContent.classList.contains('invalid')).toBe(true);
    expect(validationFailedSpy).toHaveBeenCalled();
    expect(angular.equals(listenerObject, [grid.options.data[0], grid.options.columnDefs[1], 'B', 'B1'])).toBe(true);

  });
});
