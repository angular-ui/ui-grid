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


  //describe('minColumnsToRender', function() {
  //  it('calculates the minimum number of columns to render, correctly', function() {
  //    // TODO
  //  });
  //});

  describe('column width calculation', function () {
    var element = null, gridApi = null;

    var columnDefs;

    beforeEach(inject(function (_$compile_, _$rootScope_, _$document_) {
      var scope = _$rootScope_;
      var $compile = _$compile_;
      var $document = _$document_;

      columnDefs = [
        { name: 'col1' },
        { name: 'col2' },
        { name: 'col3' },
        { name: 'col4' },
        { name: 'col5' },
        { name: 'col6' },
        { name: 'col7' }
      ];

      element = angular.element('<div style="width 333px; height: 150px" ui-grid="gridOptions"></div>');
      scope.gridOptions = {
        columnDefs: columnDefs,
        data: [],
        onRegisterApi: function( api ){ gridApi = api; }
      };

      $compile(element)(scope);
      $document[0].body.appendChild(element[0]);

      scope.$digest();
    }));

    afterEach(function() {
      element.remove();
      columnDefs.forEach( function (c) {
        delete c.width;
      });
    });

    // ideally there should be tests for multiple column configurations here
    // but need to figure out how to have separate columnDefs for each
    // expect block below

    it('should distribute extra width', function () {
      var renderWidth = 0;

      gridApi.grid.columns.forEach( function (c) {
        renderWidth += c.drawnWidth;
      });

      expect(renderWidth).toBe(gridApi.grid.getViewportWidth() - gridApi.grid.scrollbarWidth);
    });
  });

  //TODO(Jlleitschuh): FIXME! Disabled because phantom runs out of memory
  xdescribe('watch for new pinned containers', function () {
    var $compile, $rootScope, $timeout;
    var element;

    beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
    }));

    beforeEach(function() {
      var scope = $rootScope;
      element = angular.element('<div class="col-md-5" ui-grid="gridOptions"></div>');
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
    });

    afterEach(function() {
      element.remove();
    });

    it('fires watch for left container', function() {
      var scope = $rootScope;
      var refreshCanvasSpy = jasmine.createSpy('refreshCanvasSpy');
      refreshCanvasSpy(scope.grid, 'refreshCanvas');

      expect(refreshCanvasSpy).not.toHaveBeenCalled();
      $timeout(function(){
        scope.grid.createLeftContainer();
      });
      $timeout.flush();

      expect(refreshCanvasSpy).toHaveBeenCalledWith(true);
      console.log("exiting left container");
    });


    xit('fires watch for right container', function() {
      var scope = $rootScope;
      var refreshCanvasSpy = jasmine.createSpy('refreshCanvasSpy');
      refreshCanvasSpy(scope.grid, 'refreshCanvas');

      expect(refreshCanvasSpy.calls.count()).toEqual(0);
      $timeout(function(){
        scope.grid.createRightContainer();
      });
      $timeout.flush();

      expect(refreshCanvasSpy).toHaveBeenCalledWith(true);
    });

  });

  describe('appScope is correctly assigned', function () {
    var $compile, $rootScope, $timeout;
    var element, scope, gridApi;

    beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
    }));

    it('should assign scope to grid.appScope', function() {
      element = angular.element('<div class="col-md-5" ui-grid="gridOptions"></div>');
      scope = $rootScope;
      scope.gridOptions = { onRegisterApi: function( api ){ gridApi = api; }};
      scope.gridOptions.data = [
        { col1: 'col1', col2: 'col2' }
      ];

      $timeout(function () {
        $compile(element)(scope);
      });
      $timeout.flush();
      expect(gridApi.grid.appScope).toBe(scope);
    });

    it('should assign gridOptions.appScopeProvider to grid.appScope', function() {
      element = angular.element('<div class="col-md-5" ui-grid="gridOptions"></div>');
      scope = $rootScope;
      scope.gridOptions = {
        appScopeProvider : 'someValue',
        onRegisterApi: function( api ){ gridApi = api; }};
      scope.gridOptions.data = [
        { col1: 'col1', col2: 'col2' }
      ];

      $timeout(function () {
        $compile(element)(scope);
      });
      $timeout.flush();
      expect(gridApi.grid.appScope).toBe('someValue');
    });
  });

});
