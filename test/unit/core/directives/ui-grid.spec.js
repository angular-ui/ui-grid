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


  describe('minColumnsToRender', function() {
    it('calculates the minimum number of columns to render, correctly', function() {
      // TODO
    });
  });

  describe('watch for new pinned containers', function () {
    var element, scope;

    beforeEach(inject(function ($compile, $rootScope, $timeout) {
      element = angular.element('<div class="col-md-5" ui-grid="gridOptions"></div>');
      scope = $rootScope;
      scope.gridOptions = {};
      scope.gridOptions.data = [
        { col1: 'col1', col2: 'col2' }
      ];

      scope.gridOptions.onRegisterApi = function(gridApi) {
        scope.grid = gridApi.grid;
      };

      $timeout(function () {
        $compile(element)(scope);
      });
      $timeout.flush();
    }));

    it('fires watch for left container', inject(function($timeout) {
      spyOn(scope.grid, 'refreshCanvas');

      expect(scope.grid.refreshCanvas.callCount).toEqual(0);
      $timeout(function(){
        scope.grid.createLeftContainer();
      });
      $timeout.flush();

      expect(scope.grid.refreshCanvas).toHaveBeenCalledWith(true);
      expect(scope.grid.refreshCanvas.callCount).toEqual(1);
    }));


    it('fires watch for right container', inject(function($timeout) {
      spyOn(scope.grid, 'refreshCanvas');

      expect(scope.grid.refreshCanvas.callCount).toEqual(0);
      $timeout(function(){
        scope.grid.createRightContainer();
      });
      $timeout.flush();

      expect(scope.grid.refreshCanvas).toHaveBeenCalledWith(true);
      expect(scope.grid.refreshCanvas.callCount).toEqual(1);

    }));

 });

});