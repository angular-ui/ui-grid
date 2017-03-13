describe('ui-grid', function() {
  var $compile, $document, $rootScope, $timeout, element, scope, gridApi;

  function compileGrid(template, options) {
    element = angular.element(template);

    scope = $rootScope;
    scope.gridOptions = {
      data: [
        { col1: 'col1', col2: 'col2' }
      ],
      onRegisterApi: function( api ){
        gridApi = api;
      }
    };

    angular.extend(scope.gridOptions, options);

    $compile(element)(scope);

    $document[0].body.appendChild(element[0]);
    scope.$apply();
  }

  beforeEach(function() {
    module('ui.grid');

    inject(function(_$compile_, _$document_, _$rootScope_, _$timeout_) {
      $compile = _$compile_;
      $document = _$document_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
    });
  });

  describe('column width calculation', function () {
    var columnDefs, options;

    beforeEach(function() {
      columnDefs = [
        { name: 'col1' },
        { name: 'col2' },
        { name: 'col3' },
        { name: 'col4' },
        { name: 'col5' },
        { name: 'col6' },
        { name: 'col7' }
      ];

      options = {
        columnDefs: columnDefs,
        data: []
      };

      compileGrid('<div style="width: 333px; height: 150px" ui-grid="gridOptions"></div>', options);
    });

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
    var template;

    beforeEach(function() {
      template = '<div class="col-md-5" ui-grid="gridOptions"></div>';
    });

    it('should assign scope to grid.appScope', function() {
      compileGrid(template);

      expect(gridApi.grid.appScope).toBe(scope);
    });
    it('should assign gridOptions.appScopeProvider to grid.appScope', function() {
      compileGrid(template, {appScopeProvider: 'someValue'});

      expect(gridApi.grid.appScope).toBe('someValue');
    });
  });

  describe('watches', function() {
    describe('uiGridColumns attribute', function() {
      var columnDefs;

      beforeEach(function() {
        columnDefs = [
          { name: 'col1' },
          { name: 'col2' },
          { name: 'col3' },
          { name: 'col4' },
          { name: 'col5' },
          { name: 'col6' },
          { name: 'col7' }
        ];

        $rootScope.columnDefs = columnDefs;
        compileGrid('<div class="col-md-5" ui-grid="gridOptions" ui-grid-columns="{{ columnDefs }}"></div>', {
          columnDefs: [],
          data: []
        });
        spyOn(gridApi.grid, 'buildColumns').and.callThrough();
      });

      it('should change columnDefs and call buildColumns when the uiGridColumns attribute changes', function() {
        expect(scope.gridOptions.columnDefs.length).toEqual(columnDefs.length);

        scope.columnDefs = [];

        // need to trigger an apply a second time to get buildColumns promise to be covered
        scope.$apply();
        scope.$apply();

        expect(scope.gridOptions.columnDefs).toEqual([]);
        expect(gridApi.grid.buildColumns).toHaveBeenCalled();
      });
    });

    function testWatches(fastWatch) {
      describe('$scope.uiGrid.data', function() {
        var newData;

        beforeEach(function() {
          compileGrid('<div class="col-md-5" ui-grid="gridOptions"></div>', {
            columnDefs: [
              { name: 'col1' },
              { name: 'col2' },
              { name: 'col3' },
              { name: 'col4' },
              { name: 'col5' },
              { name: 'col6' },
              { name: 'col7' }
            ],
            data: [],
            fastWatch: fastWatch
          });
          spyOn(gridApi.grid, 'modifyRows').and.callThrough();
        });

        describe('when the new data is defined', function() {
          beforeEach(function() {
            newData = [{'col1': 'row1'}, {'col1': 'row2'}, {'col1': 'row3'}];
            scope.gridOptions.data = newData;
            scope.$apply();
          });
          it('should call modifyRows with the new data', function() {
            expect(gridApi.grid.modifyRows).toHaveBeenCalledWith(newData);
          });
        });

        describe('when the new data is not defined', function() {
          beforeEach(function() {
            newData = undefined;
            scope.gridOptions.data = newData;
            scope.$apply();
          });
          it('should not call modifyRows with the new data', function() {
            expect(gridApi.grid.modifyRows).not.toHaveBeenCalled();
          });
        });

        describe('when the data is a string', function() {
          beforeEach(function() {
            newData = [{'col1': 'row1'}, {'col1': 'row2'}, {'col1': 'row3'}];
            compileGrid('<div class="col-md-5" ui-grid="gridOptions"></div>', {
              columnDefs: [
                { name: 'col1' },
                { name: 'col2' },
                { name: 'col3' },
                { name: 'col4' },
                { name: 'col5' },
                { name: 'col6' },
                { name: 'col7' }
              ],
              data: 'myData',
              fastWatch: fastWatch
            });
            spyOn(gridApi.grid, 'modifyRows').and.callThrough();
            scope.myData = newData;
            scope.$apply();
          });
          it('should watch the changes to the scope variable with the same name', function() {
            expect(gridApi.grid.modifyRows).toHaveBeenCalledWith(newData);
          });
        });
      });
    }
    describe('when fastWatch is false', function() {
      testWatches(false);
    });
    describe('when fastWatch is true', function() {
      testWatches(true);
    });
  });

  describe('$destroy', function() {
    var columnDefs, newData;

    beforeEach(function() {
      columnDefs = [{ name: 'col1' }];
      newData = [{'col1': 'row1'}, {'col1': 'row2'}, {'col1': 'row3'}];

      compileGrid('<div class="col-md-5" ui-grid="gridOptions"></div>', {
        columnDefs: [],
        data: []
      });
      spyOn(gridApi.grid, 'modifyRows').and.callThrough();
      spyOn(gridApi.grid, 'buildColumns').and.callThrough();

      scope.$broadcast('$destroy');
      scope.$apply();

      scope.gridOptions.columnDefs = columnDefs;
      scope.gridOptions.data = newData;
      scope.$apply();
    });

    it('should stop watching data and column changes', function() {
      expect(gridApi.grid.modifyRows).not.toHaveBeenCalled();
      expect(gridApi.grid.buildColumns).not.toHaveBeenCalled();
    });
  });
});
