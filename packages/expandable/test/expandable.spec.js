describe('ui.grid.expandable', function() {
  'use strict';

  var $compile, $httpBackend, $rootScope, $timeout;

  beforeEach(function() {
    module('ui.grid.expandable');

    inject(function(_$compile_, _$httpBackend_, _$rootScope_, _$timeout_) {
      $compile = _$compile_;
      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
    });
  });

  describe('ui-grid-expandable directive', function() {
    var element, scope;

    beforeEach(function() {
      scope = $rootScope.$new();

      scope.gridOptions = {
        expandableRowTemplate: 'expandableRowTemplate.html',
        expandableRowHeight: 150,
        expandableRowHeaderWidth: 40
      };
      scope.gridOptions.data = [
        { col1: 'col1', col2: 'col2' }
      ];
      scope.gridOptions.onRegisterApi = function(gridApi) {
        scope.gridApi = gridApi;
        scope.grid = gridApi.grid;
      };

      $httpBackend.when('GET', 'expandableRowTemplate.html').respond('<div class="test"></div>');
      element = angular.element('<div class="col-md-5" ui-grid="gridOptions" ui-grid-expandable></div>');

      $compile(element)(scope);
      scope.$apply();
    });
    it('public api expandable should be well defined', function() {
      expect(scope.gridApi.expandable).toBeDefined();
      expect(scope.gridApi.expandable.on.rowExpandedStateChanged).toBeDefined();
      expect(scope.gridApi.expandable.raise.rowExpandedStateChanged).toBeDefined();
      expect(scope.gridApi.expandable.toggleRowExpansion).toBeDefined();
      expect(scope.gridApi.expandable.expandAllRows).toBeDefined();
      expect(scope.gridApi.expandable.collapseAllRows).toBeDefined();
      expect(scope.gridApi.expandable.toggleAllRows).toBeDefined();
    });

    it('expandAll and collapseAll should set and unset row.isExpanded', function() {
      scope.gridApi.expandable.expandAllRows();
      scope.grid.rows.forEach(function(row) {
        expect(row.isExpanded || (row.entity.subGridOptions && row.entity.subGridOptions.disableRowExpandable)).toBe(true);
      });
      scope.gridApi.expandable.collapseAllRows();
      scope.grid.rows.forEach(function(row) {
        expect(row.isExpanded).toBe(false);
      });
    });

    it('toggleAllRows should set and unset row.isExpanded', function() {
      scope.gridApi.expandable.toggleAllRows();
      scope.grid.rows.forEach(function(row) {
        expect(row.isExpanded || (row.entity.subGridOptions && row.entity.subGridOptions.disableRowExpandable)).toBe(true);
      });
      scope.gridApi.expandable.toggleAllRows();
      scope.grid.rows.forEach(function(row) {
        expect(row.isExpanded).toBe(false);
      });
    });

    it('event rowExpandedStateChanged should be fired whenever row expands', function() {
      var functionCalled = false;

      scope.gridApi.expandable.on.rowExpandedStateChanged(scope, function() {
        functionCalled = true;
      });
      scope.gridApi.expandable.toggleRowExpansion(scope.grid.rows[0].entity);
      expect(functionCalled).toBe(true);
    });

    it('subgrid should be added to the dom when we expand row', function() {
      expect(element.find('.test').length).toBe(0);
      scope.gridApi.expandable.toggleRowExpansion(scope.grid.rows[0].entity);
      scope.$apply();
      $timeout(function() {
        expect(element.find('.test').length).toBe(1);
      });
    });
  });

  describe('uiGridExpandableService', function() {
    var grid, gridUtil, uiGridExpandableService;

    beforeEach(function() {
      inject(function(_gridUtil_, _uiGridExpandableService_) {
        gridUtil = _gridUtil_;
        uiGridExpandableService = _uiGridExpandableService_;
      });

      grid = {
        api: jasmine.createSpyObj('gridApi', ['registerEventsFromObject', 'registerMethodsFromObject']),
        options: {},
        rows: [],
        renderContainers: {body: {visibleRowCache: []}},
        getRow: jasmine.createSpy('getRow'),
        queueGridRefresh: jasmine.createSpy('queueGridRefresh')
      };

      spyOn(gridUtil, 'logError').and.callFake(angular.noop);
    });
    afterEach(function() {
      grid.api.registerEventsFromObject.calls.reset();
      grid.api.registerMethodsFromObject.calls.reset();
      grid.queueGridRefresh.calls.reset();
      grid.getRow.calls.reset();
      gridUtil.logError.calls.reset();
    });

    describe('initializeGrid', function() {
      beforeEach(function() {
        grid.options = {};
        uiGridExpandableService.initializeGrid(grid);
      });
      describe('options', function() {
        it('should set expanded all to false', function() {
          expect(grid.expandable.expandedAll).toBe(false);
        });
        it('should default enableExpandable to true when it is true and expandableRowTemplate is defined', function() {
          grid.options.enableExpandable = undefined;
          grid.options.expandableRowTemplate = 'rowTemplate.html';
          uiGridExpandableService.initializeGrid(grid);
          expect(grid.options.enableExpandable).toBe(true);
          expect(gridUtil.logError).toHaveBeenCalled();
        });
        it('should set enableExpandable to false when expandableRowTemplate is undefined', function() {
          expect(grid.options.enableExpandable).toBe(false);
        });
        it('should set enableExpandable to false when it is passed in as false', function() {
          grid.options.enableExpandable = false;
          uiGridExpandableService.initializeGrid(grid);
          expect(grid.options.enableExpandable).toBe(false);
        });
        it('should default showExpandAllButton to true when it is undefined', function() {
          expect(grid.options.showExpandAllButton).toBe(true);
        });
        it('should set showExpandAllButton to false when it is passed in as false', function() {
          grid.options.showExpandAllButton = false;
          uiGridExpandableService.initializeGrid(grid);
          expect(grid.options.showExpandAllButton).toBe(false);
        });
        it('should default expandableRowHeight to 150 when it is undefined', function() {
          expect(grid.options.expandableRowHeight).toBe(150);
        });
        it('should set expandableRowHeight to the value passed in when it is defined', function() {
          grid.options.expandableRowHeight = 200;
          uiGridExpandableService.initializeGrid(grid);
          expect(grid.options.expandableRowHeight).toBe(200);
        });
        it('should default expandableRowHeaderWidth to 40 when it is undefined', function() {
          expect(grid.options.expandableRowHeaderWidth).toBe(40);
        });
        it('should set expandableRowHeaderWidth to the value passed in when it is defined', function() {
          grid.options.expandableRowHeaderWidth = 80;
          uiGridExpandableService.initializeGrid(grid);
          expect(grid.options.expandableRowHeaderWidth).toBe(80);
        });
      });
      describe('methods', function() {
        var methods;

        beforeEach(function() {
          grid.api.registerMethodsFromObject.and.callFake(function(publicMethods) {
            methods = publicMethods.expandable;
          });
          grid.api.registerEventsFromObject.and.callFake(function(events) {
            grid.api.expandable = {raise: events.expandable};
          });
          grid.rows = [
            {entity: {id: 1, name: 'John Doe'}, isExpanded: true},
            {entity: {id: 2, name: 'Joe Doe'}, isExpanded: false},
            {entity: {id: 3, name: 'Jane Doe'}, isExpanded: true},
            {entity: {id: 4, name: 'Peter Doe'}, isExpanded: false},
            {entity: {id: 5, name: 'Sarah Doe'}, isExpanded: false}
          ];
          uiGridExpandableService.initializeGrid(grid);
        });
        describe('toggleRowExpansion', function() {
          beforeEach(function() {
            grid.getRow.and.returnValue(null);
            methods.toggleRowExpansion(grid.rows[2].entity);
          });
          it('should call getRow on the grid with the row entity passed in', function() {
            expect(grid.getRow).toHaveBeenCalledWith(grid.rows[2].entity);
          });
        });
        describe('expandAllRows', function() {
          beforeEach(function() {
            grid.renderContainers.body.visibleRowCache = [
              {entity: {id: 1, name: 'John Doe'}, isExpanded: true},
              {entity: {id: 3, name: 'Jane Doe'}, isExpanded: true}
            ];
            methods.expandAllRows(grid);
          });
          it('should set expandedAll to true', function() {
            expect(grid.expandable.expandedAll).toBe(true);
          });
          it('should call queueGridRefresh', function() {
            expect(grid.queueGridRefresh).toHaveBeenCalled();
          });
        });
        describe('collapseAllRows', function() {
          beforeEach(function() {
            grid.renderContainers.body.visibleRowCache = [
              {entity: {id: 4, name: 'Peter Doe'}, isExpanded: false},
              {entity: {id: 5, name: 'Sarah Doe'}, isExpanded: false}
            ];
            methods.collapseAllRows(grid);
          });
          it('should set expandedAll to false', function() {
            expect(grid.expandable.expandedAll).toBe(false);
          });
          it('should call queueGridRefresh', function() {
            expect(grid.queueGridRefresh).toHaveBeenCalled();
          });
        });
        describe('toggleAllRows', function() {
          beforeEach(function() {
            methods.toggleAllRows(grid);
          });
          it('should call queueGridRefresh', function() {
            expect(grid.queueGridRefresh).toHaveBeenCalled();
          });
        });
        describe('expandRow', function() {
          beforeEach(function() {
            grid.getRow.and.callFake(function(rowEntity) {
              return rowEntity;
            });

            grid.rows = [
              {isExpanded: false, grid: grid},
              {isExpanded: true, grid: grid},
              {isExpanded: true, grid: grid},
              {isExpanded: true, grid: grid},
              {isExpanded: true, grid: grid},
              {isExpanded: true, grid: grid}
            ];
          });
          it('should do nothing when the current row is expanded', function() {
            methods.expandRow(grid.rows[1]);

            expect(grid.rows[1].isExpanded).toEqual(true);
          });
          it('should expand the current row if it is collapsed', function() {
            methods.expandRow(grid.rows[0]);

            expect(grid.rows[0].isExpanded).toEqual(true);
          });
          it('should update the value of expandAll if all rows are expanded', function() {
            methods.expandRow(grid.rows[0]);

            expect(grid.expandable.expandedAll).toEqual(true);
          });
        });
        describe('collapseRow', function() {
          beforeEach(function() {
            grid.getRow.and.callFake(function(rowEntity) {
              return rowEntity;
            });

            grid.rows = [
              {isExpanded: false, grid: grid},
              {isExpanded: true, grid: grid},
              {isExpanded: true, grid: grid},
              {isExpanded: true, grid: grid},
              {isExpanded: true, grid: grid},
              {isExpanded: true, grid: grid}
            ];
          });
          it('should do nothing when the current row is collapsed', function() {
            methods.collapseRow(grid.rows[0]);

            expect(grid.rows[0].isExpanded).toEqual(false);
          });
          it('should collapse the current row if it is expanded', function() {
            methods.collapseRow(grid.rows[1]);

            expect(grid.rows[1].isExpanded).toEqual(false);
          });
          it('should update the value of expandAll if one row is collapsed', function() {
            methods.collapseRow(grid.rows[0]);

            expect(grid.expandable.expandedAll).toEqual(false);
          });
        });
        describe('getExpandedRows', function() {
          it('should return the entity object for all expanded rows', function() {
            expect(methods.getExpandedRows()).toEqual([
              {id: 1, name: 'John Doe'},
              {id: 3, name: 'Jane Doe'}
            ]);
          });
        });
      });
      describe('events', function() {
        var events;

        beforeEach(function() {
          grid.api.registerEventsFromObject.and.callFake(function(publicEvents) {
            events = publicEvents.expandable;
          });
          uiGridExpandableService.initializeGrid(grid);
        });
        it('should register row expanded events as empty functions', function() {
          expect(angular.isFunction(events.rowExpandedBeforeStateChanged)).toBe(true);
          expect(events.rowExpandedBeforeStateChanged()).toBeUndefined();
          expect(angular.isFunction(events.rowExpandedStateChanged)).toBe(true);
          expect(events.rowExpandedStateChanged()).toBeUndefined();
        });
      });
    });

    describe('toggleRowExpansion', function() {

    });

    describe('expandAllRows', function() {

    });

    describe('collapseAllRows', function() {

    });

    describe('toggleAllRows', function() {
      beforeEach(function() {
        spyOn(uiGridExpandableService, 'collapseAllRows').and.callFake(angular.noop);
        spyOn(uiGridExpandableService, 'expandAllRows').and.callFake(angular.noop);
      });
      afterEach(function() {
        uiGridExpandableService.collapseAllRows.calls.reset();
        uiGridExpandableService.expandAllRows.calls.reset();
      });
      it('should call collapseAllRows when all rows are expanded', function() {
        grid.expandable = {expandedAll: true};
        uiGridExpandableService.toggleAllRows(grid);

        expect(uiGridExpandableService.collapseAllRows).toHaveBeenCalledWith(grid);
        expect(uiGridExpandableService.expandAllRows).not.toHaveBeenCalled();
      });
      it('should call expandAllRows when some rows are not expanded', function() {
        grid.expandable = {expandedAll: false};
        uiGridExpandableService.toggleAllRows(grid);

        expect(uiGridExpandableService.expandAllRows).toHaveBeenCalledWith(grid);
        expect(uiGridExpandableService.collapseAllRows).not.toHaveBeenCalled();
      });
    });

    describe('getExpandedRows', function() {
      it('should return only the rows that are expanded', function() {
        grid.rows = [
          {isExpanded: false},
          {isExpanded: true},
          {isExpanded: false},
          {isExpanded: true},
          {isExpanded: true},
          {isExpanded: true}
        ];

        expect(uiGridExpandableService.getExpandedRows(grid).length).toEqual(4);
      });
    });
  });
});
