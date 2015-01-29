describe('ui.grid.expandable', function () {

  var scope, element, timeout;

  beforeEach(module('ui.grid.expandable'));

  beforeEach(inject(function (_$compile_, $rootScope, $timeout, $httpBackend) {

    var $compile = _$compile_;
    scope = $rootScope;
    timeout = $timeout;

    scope.gridOptions = {
      expandableRowTemplate: 'expandableRowTemplate.html',
      expandableRowHeight: 150,
      expandableRowHeaderWidth: 40
    };
    scope.gridOptions.data = [
      { col1: 'col1', col2: 'col2' }
    ];
    scope.gridOptions.onRegisterApi = function (gridApi) {
      scope.gridApi = gridApi;
      scope.grid = gridApi.grid;
    };

    $httpBackend.when('GET', 'expandableRowTemplate.html').respond("<div class='test'></div>");
    element = angular.element('<div class="col-md-5" ui-grid="gridOptions" ui-grid-expandable></div>');

    $timeout(function () {
      $compile(element)(scope);
    });
    $timeout.flush();
  }));

  it('public api expandable should be well defined', function () {
    expect(scope.gridApi.expandable).toBeDefined();
    expect(scope.gridApi.expandable.on.rowExpandedStateChanged).toBeDefined();
    expect(scope.gridApi.expandable.raise.rowExpandedStateChanged).toBeDefined();
    expect(scope.gridApi.expandable.toggleRowExpansion).toBeDefined();
    expect(scope.gridApi.expandable.expandAllRows).toBeDefined();
    expect(scope.gridApi.expandable.collapseAllRows).toBeDefined();
    expect(scope.gridApi.expandable.toggleAllRows).toBeDefined();
  });

  it('expandAll and collapseAll should set and unset row.isExpanded', function () {
    scope.gridApi.expandable.expandAllRows();
    scope.grid.rows.forEach(function(row) {
      expect(row.isExpanded).toBe(true);
    });
    scope.gridApi.expandable.collapseAllRows();
    scope.grid.rows.forEach(function(row) {
      expect(row.isExpanded).toBe(false);
    });
  });

  it('toggleAllRows should set and unset row.isExpanded', function(){
    scope.gridApi.expandable.toggleAllRows();
    scope.grid.rows.forEach(function(row){
      expect(row.isExpanded).toBe(true);
    });
    scope.gridApi.expandable.toggleAllRows();
    scope.grid.rows.forEach(function(row){
      expect(row.isExpanded).toBe(false);
    });
  });

  it('event rowExpandedStateChanged should be fired whenever row expands', function () {
    var functionCalled = false;
    scope.gridApi.expandable.on.rowExpandedStateChanged(scope,function(row){
      functionCalled = true;
    });
    scope.gridApi.expandable.toggleRowExpansion(scope.grid.rows[0].entity);
    expect(functionCalled).toBe(true);
  });

  it('subgrid should be addeed to the dom when we expand row', function () {
    expect(element.find('.test').length).toBe(0);
    scope.gridApi.expandable.toggleRowExpansion(scope.grid.rows[0].entity);
    scope.$digest();
    timeout(function () {
      expect(element.find('.test').length).toBe(1);
    });
  });
});