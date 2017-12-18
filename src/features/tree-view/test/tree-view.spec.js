/* global _ */
(function() {
  'use strict';

  describe('ui.grid.treeView uiGridTreeViewService', function() {
    var uiGridTreeViewService, uiGridTreeBaseService, gridClassFactory, grid, GridRow,
      $compile, $rootScope, $scope, $templateCache;

    beforeEach(function() {
      module('ui.grid');
      module('ui.grid.treeView');

      inject(function (_$rootScope_, _$templateCache_, _GridRow_, _gridClassFactory_, _uiGridTreeBaseService_, _uiGridTreeViewService_) {
        $rootScope = _$rootScope_;
        $templateCache = _$templateCache_;
        GridRow = _GridRow_;
        gridClassFactory = _gridClassFactory_;
        uiGridTreeBaseService = _uiGridTreeBaseService_;
        uiGridTreeViewService = _uiGridTreeViewService_;
      });
    });

    describe('uiGridTreeViewService', function() {
      beforeEach(function() {
        $scope = $rootScope.$new();

        grid = gridClassFactory.createGrid({});
        grid.options.columnDefs = [
          {field: 'col0'},
          {field: 'col1'},
          {field: 'col2'},
          {field: 'col3'}
        ];
        uiGridTreeViewService.initializeGrid(grid, $scope);
      });
      describe('initializeGrid', function() {
        beforeEach(function() {
          grid.treeView = undefined;

          spyOn(uiGridTreeBaseService, 'initializeGrid').and.callFake(angular.noop);
          spyOn(grid, 'registerRowsProcessor').and.callFake(angular.noop);
          spyOn(grid.api, 'registerEventsFromObject').and.callFake(function(events) {
            grid.api.events = events;
          });
          spyOn(grid.api, 'registerMethodsFromObject').and.callFake(function(methods) {
            grid.api.methods = methods;
          });

          uiGridTreeViewService.initializeGrid(grid, $scope);
        });
        afterEach(function() {
          uiGridTreeBaseService.initializeGrid.calls.reset();
        });
        it('should trigger initializeGrid on uiGridTreeBaseService', function() {
          expect(uiGridTreeBaseService.initializeGrid).toHaveBeenCalledWith(grid, $scope);
        });
        it('should defined treeView on the grid', function() {
          expect(grid.treeView).toBeDefined();
        });
        it('should call register a new row processor', function() {
          expect(grid.registerRowsProcessor).toHaveBeenCalledWith(uiGridTreeViewService.adjustSorting, 60);
        });
        it('should register treeView events', function() {
          expect(grid.api.events.treeView).toBeDefined();
        });
        it('should register treeView methods', function() {
          expect(grid.api.methods.treeView).toBeDefined();
        });
      });
      describe('defaultGridOptions', function() {
        var gridOptions;

        beforeEach(function() {
          gridOptions = {};
        });
        it('should set enableTreeView to false when enableTreeView is false on the options passed in', function() {
          gridOptions.enableTreeView = false;
          uiGridTreeViewService.defaultGridOptions(gridOptions);

          expect(gridOptions.enableTreeView).toBe(false);
        });
        it('should set enableTreeView to true when enableTreeView is true on the options passed in', function() {
          gridOptions.enableTreeView = true;
          uiGridTreeViewService.defaultGridOptions(gridOptions);

          expect(gridOptions.enableTreeView).toBe(true);
        });
        it('should set enableTreeView to true when enableTreeView is undefined on the options passed in', function() {
          gridOptions.enableTreeView = undefined;
          uiGridTreeViewService.defaultGridOptions(gridOptions);

          expect(gridOptions.enableTreeView).toBe(true);
        });
      });
      describe('adjustSorting', function() {
        var adjustedRows, renderableRows;

        beforeEach(function() {
          renderableRows = [{}];
          uiGridTreeViewService.columns = [
            {field: 'col0', sort: {ignoreSort: false}},
            {field: 'col1'}
          ];
          adjustedRows = uiGridTreeViewService.adjustSorting(renderableRows);
          $scope.$apply();
        });
        it('should return the same rows that were passed into it', function() {
          expect(adjustedRows).toEqual(renderableRows);
        });
        it('should set ignoreSort to true on any column that has a sort object defined', function() {
          expect(uiGridTreeViewService.columns[0].sort.ignoreSort).toBe(true);
        });
        it('should not update sort on any column that does not have a sort object defined', function() {
          expect(uiGridTreeViewService.columns[1].sort).toBeUndefined();
        });
      });
    });

    describe('uiGridTreeView directive', function() {
      var element;

      beforeEach(function() {
        inject(function(_$compile_) {
          $compile = _$compile_;
        });

        $scope = $rootScope.$new();

        $scope.gridOpts = {
          data: [{ name: 'Bob' }, {name: 'Mathias'}, {name: 'Fred'}]
        };

        element = angular.element('<div ui-grid="gridOpts" ui-grid-tree-view></div>');
        spyOn(uiGridTreeViewService, 'initializeGrid').and.callThrough();
      });
      afterEach(function() {
        uiGridTreeViewService.initializeGrid.calls.reset();
      });

      describe('when enableTreeView is true', function() {
        beforeEach(function() {
          $scope.gridOpts.enableTreeView = true;
          $compile(element)($scope);
          $scope.$apply();
        });
        it('should trigger initializeGrid on the uiGridTreeViewService', function() {
          expect(uiGridTreeViewService.initializeGrid).toHaveBeenCalled();
        });
      });
      describe('when enableTreeView is false', function() {
        beforeEach(function() {
          $scope.gridOpts.enableTreeView = false;
          $compile(element)($scope);
          $scope.$apply();
        });
        it('should not trigger initializeGrid on the uiGridTreeViewService', function() {
          expect(uiGridTreeViewService.initializeGrid).not.toHaveBeenCalled();
        });
      });
    });
  });
})();
