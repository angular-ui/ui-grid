describe('ui-grid', function() {

  beforeEach(module('ui.grid'));
  // beforeEach(module('ui.grid.body'));
  // beforeEach(module('ui.grid.header'));
  
  /*describe('ui-grid calculated columns', function() {
    var element, scope;

    beforeEach(inject(function($compile, $rootScope) {
      element = angular.element('<div class="col-md-5" ui-grid="data" ui-grid-table-class="table"></div>');
      scope = $rootScope;
      scope.data = [{ col1: 'col1', col2: 'col2' }];
      $compile(element)(scope);
      scope.$digest();
    }));

    it('gets columns correctly', function() {
      expect(element.isolateScope().gridOptions.columnDefs.length).toBe(2);
      expect(element.isolateScope().gridOptions.columnDefs[0].name).toBe('Col1');
      expect(element.isolateScope().gridOptions.columnDefs[0].field).toBe('col1');
    });

  });

  describe('ui-grid declarative columns', function() {
      var element, scope;

      beforeEach(inject(function($compile, $rootScope) {
        element = angular.element('<div class="col-md-5" ui-grid="data" ui-grid-columns="[{name:\'Decl Col 1\',field:\'declCol1\'}]" ui-grid-table-class="table"></div>');
        scope = $rootScope;
        scope.data = [{ declCol1: 'col1', declCol2: 'col2' }];
        $compile(element)(scope);
        scope.$digest();
      }));

      it('gets columns correctly', function() {
        expect(element.isolateScope().gridOptions.columnDefs.length).toBe(1);
        expect(element.isolateScope().gridOptions.columnDefs[0].name).toBe('Decl Col 1');
        expect(element.isolateScope().gridOptions.columnDefs[0].field).toBe('declCol1');
      }); 

  });
  
  describe('ui-grid imperative columns', function () {
    var element, scope;

    beforeEach(inject(function ($compile, $rootScope) {
      element = angular.element('<div class="col-md-5" ui-grid="data" ui-grid-options="myGridOptions" ui-grid-columns="[{name:\'Decl Col 1\',field:\'declCol1\'}]" ui-grid-table-class="table"></div>');
      scope = $rootScope;
      scope.data = [{ impCol1: 'col1', impCol2: 'col2' }];
      //specifying gridOptions on parent scope will override any attributes
      scope.myGridOptions = {};
      scope.myGridOptions.columnDefs = [{ name: 'Imp Col 1', field: 'impCol1' }];
      $compile(element)(scope);
      scope.$digest();
    }));

    it('gets columns correctly', function () {
      expect(element.isolateScope().gridOptions.columnDefs.length).toBe(1);
      expect(element.isolateScope().gridOptions.columnDefs[0].name).toBe('Imp Col 1');
      expect(element.isolateScope().gridOptions.columnDefs[0].field).toBe('impCol1');
    });

  });*/

  describe('refreshRows', function() {
    it('should do something', function () {
      // TODO(c0bra) ...
    });
  });

  describe('minColumnsToRender', function() {
    it('calculates the minimum number of columns to render, correctly', function() {
      // TODO
    });
  });

});