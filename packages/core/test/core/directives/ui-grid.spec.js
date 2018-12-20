describe('ui-grid', function() {
  'use strict';

  var $compile, $document, $rootScope, $timeout, $q, element, scope, gridApi;

  function compileGrid(template, options) {
    element = angular.element(template);

    scope = $rootScope;
    scope.gridOptions = {
      data: [
        { col1: 'col1', col2: 'col2' }
      ],
      onRegisterApi: function( api ) {
        gridApi = api;
      }
    };

    angular.extend(scope.gridOptions, options);

    $compile(element)(scope);

    $document[0].body.appendChild(element[0]);
    scope.$apply();
    createGridSpies();
  }

  function createGridSpies() {
    spyOn(gridApi.grid, 'buildColumnDefsFromData').and.callFake(angular.noop);
    spyOn(gridApi.grid, 'buildColumns').and.returnValue($q(function(resolve) { resolve(); }));
    spyOn(gridApi.grid, 'callDataChangeCallbacks').and.callFake(angular.noop);
    spyOn(gridApi.grid, 'modifyRows').and.returnValue($q(function(resolve) { resolve(); }));
    spyOn(gridApi.grid, 'preCompileCellTemplates').and.callFake(angular.noop);
    spyOn(gridApi.grid, 'refreshCanvas').and.callFake(angular.noop);
  }

  beforeEach(function() {
    module('ui.grid');

    inject(function(_$compile_, _$document_, _$rootScope_, _$timeout_, _$q_) {
      $compile = _$compile_;
      $document = _$document_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      $q = _$q_;
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
      $document[0].body.innerHTML = '';
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

    afterEach(function() {
      $document[0].body.innerHTML = '';
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
      });

      it('should change columnDefs and call buildColumns when the uiGridColumns attribute changes', function() {
        expect(scope.gridOptions.columnDefs.length).toEqual(columnDefs.length);

        scope.columnDefs = [];

        scope.$apply();

        expect(scope.gridOptions.columnDefs).toEqual([]);
        expect(gridApi.grid.callDataChangeCallbacks).toHaveBeenCalled();
      });

      afterEach(function() {
        $document[0].body.innerHTML = '';
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
            scope.myData = newData;
            scope.$apply();
          });
          it('should watch the changes to the scope variable with the same name', function() {
            expect(gridApi.grid.modifyRows).toHaveBeenCalledWith(newData);
          });
          afterEach(function() {
            $document[0].body.innerHTML = '';
          });
        });

        afterEach(function() {
          $document[0].body.innerHTML = '';
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

    afterEach(function() {
      $document[0].body.innerHTML = '';
    });
  });
});
