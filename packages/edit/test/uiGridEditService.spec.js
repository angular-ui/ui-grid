/* global _ */
(function() {
  'use strict';

  describe('ui.grid.edit uiGridEditService', function() {
    var $rootScope, $templateCache, $timeout, gridClassFactory, gridUtil, uiGridConstants, uiGridEditService;

    beforeEach(function() {
      module('ui.grid.edit');

      inject(function (_$rootScope_, _$templateCache_, _$timeout_, _gridClassFactory_, _gridUtil_, _uiGridConstants_, _uiGridEditService_) {
        $rootScope = _$rootScope_;
        $templateCache = _$templateCache_;
        $timeout = _$timeout_;
        gridClassFactory = _gridClassFactory_;
        gridUtil = _gridUtil_;
        uiGridConstants = _uiGridConstants_;
        uiGridEditService = _uiGridEditService_;
      });

      $templateCache.put('ui-grid/uiGridCell', '<div/>');
      $templateCache.put('ui-grid/cellEditor', '<div ui-grid-editor></div>');
    });
    describe('initializeGrid function', function() {
      var grid;

      beforeEach(function() {
        grid = gridClassFactory.createGrid();
        grid.options.cellEditableCondition = undefined;
        grid.options.enableCellEditOnFocus = undefined;

        spyOn(grid.api, 'registerEventsFromObject').and.callFake(function(events) {
          grid.api.events = events;
        });
        spyOn(grid, 'registerColumnBuilder').and.callFake(angular.noop);

        uiGridEditService.initializeGrid(grid);
      });
      afterEach(function() {
        grid.registerColumnBuilder.calls.reset();
        grid.api.registerEventsFromObject.calls.reset();
      });
      it('should set default options', function() {
        expect(grid.options.cellEditableCondition).toBe(true);
        expect(grid.options.enableCellEditOnFocus).toBe(false);
      });
      it('should register a column builder', function() {
        expect(grid.registerColumnBuilder).toHaveBeenCalledWith(uiGridEditService.editColumnBuilder);
      });
      it('should define an edit object on the grid', function() {
        expect(grid.edit).toBeDefined();
      });
      it('should register edit events on the grid', function() {
        expect(grid.api.registerEventsFromObject).toHaveBeenCalled();
        expect(grid.api.events.edit).toBeDefined();
      });
      describe('event functions', function() {
        it('should define an afterCellEdit function', function() {
          expect(angular.isFunction(grid.api.events.edit.afterCellEdit)).toBe(true);
          expect(grid.api.events.edit.afterCellEdit()).toBeUndefined();
        });
        it('should define an beginCellEdit function', function() {
          expect(angular.isFunction(grid.api.events.edit.beginCellEdit)).toBe(true);
          expect(grid.api.events.edit.beginCellEdit()).toBeUndefined();
        });
        it('should define an cancelCellEdit function', function() {
          expect(angular.isFunction(grid.api.events.edit.cancelCellEdit)).toBe(true);
          expect(grid.api.events.edit.cancelCellEdit()).toBeUndefined();
        });
      });
    });
    describe('editColumnBuilder function', function() {
      it('should default gridOptions', function() {
        var options = {};

        uiGridEditService.defaultGridOptions(options);
        expect(options.enableCellEdit).toBe(undefined);
        expect(options.cellEditableCondition).toBe(true);
        expect(options.enableCellEditOnFocus).toBe(false);

        options.enableCellEdit = false;
        uiGridEditService.defaultGridOptions(options);
        expect(options.enableCellEdit).toBe(false);

        function myFunc() {}
        options.cellEditableCondition = myFunc;
        uiGridEditService.defaultGridOptions(options);
        expect(options.cellEditableCondition).toBe(myFunc);

        options.cellEditableCondition = false;
        uiGridEditService.defaultGridOptions(options);
        expect(options.cellEditableCondition).toBe(false);

        options.enableCellEditOnFocus = true;
        uiGridEditService.defaultGridOptions(options);
        expect(options.enableCellEditOnFocus).toBe(true);
      });

      it('should maintain the column options that are already defined on the column object', function() {
        var grid = gridClassFactory.createGrid();

        grid.options.columnDefs = [
          {field: 'col1', enableCellEdit: true, cellEditableCondition: true, enableCellEditOnFocus: true}
        ];
        uiGridEditService.editColumnBuilder(grid.options.columnDefs[0], grid.options.columnDefs[0], grid.options);

        expect(grid.options.columnDefs[0].enableCellEdit).toBe(true);
        expect(grid.options.columnDefs[0].cellEditableCondition).toBe(true);
        expect(grid.options.columnDefs[0].enableCellEditOnFocus).toBe(true);
      });

      it('should throw an error when the enableCellEdit is true and editableCellTemplate cannot be found', function(done) {
        var grid = gridClassFactory.createGrid();

        grid.options.columnDefs = [
          {field: 'col1', enableCellEdit: true, editableCellTemplate: 'ui-grid/nonExistentCellEditor'}
        ];

        spyOn(gridUtil, 'getTemplate').and.callFake(function() {
          return {
            then: function(resolve, reject) {
              reject();
            }
          };
        });

        try {
          uiGridEditService.editColumnBuilder(grid.options.columnDefs[0], grid.options.columnDefs[0], grid.options);
        } catch (error) {
          expect(error.message).toEqual("Couldn't fetch/use colDef.editableCellTemplate '" + grid.options.columnDefs[0].editableCellTemplate + "'");
          gridUtil.getTemplate.calls.reset();
          done();
        }

        $rootScope.$apply();
      });

      it('should create additional edit properties', function() {
        var grid = gridClassFactory.createGrid();

        grid.options.columnDefs = [
          {field: 'col1', enableCellEdit: true}
        ];
        $timeout(function() {
          uiGridEditService.defaultGridOptions(grid.options);
          grid.buildColumns();
        });
        $timeout.flush();

        var colDef = grid.options.columnDefs[0];
        var col = grid.columns[0];
        $timeout(function() {
          uiGridEditService.editColumnBuilder(colDef,col,grid.options);
        });
        $timeout.flush();

        expect(col.colDef.enableCellEdit).toBe(true);
        expect(col.editableCellTemplate).toBeDefined();
      });

      it('should not create additional edit properties if edit is not enabled for a column', function() {
        var grid = gridClassFactory.createGrid();
        grid.options.columnDefs = [
          {field: 'col1', enableCellEdit: false}
        ];
        grid.buildColumns();

        var colDef = grid.options.columnDefs[0];
        var col = grid.columns[0];
        uiGridEditService.editColumnBuilder(colDef,col,grid.options);
        expect(col.colDef.enableCellEdit).toBe(false);
        expect(col.editableCellTemplate).not.toBeDefined();
      });

      it('should create additional edit properties if global enableCellEdit is true', function() {
        var grid = gridClassFactory.createGrid();

        grid.options.enableCellEdit = true;
        grid.options.columnDefs = [
          {field: 'col1'}
        ];
        grid.buildColumns();

        var colDef = grid.options.columnDefs[0];
        var col = grid.columns[0];
        $timeout(function() {
          uiGridEditService.defaultGridOptions(grid.options);
          uiGridEditService.editColumnBuilder(colDef,col,grid.options);
        });
        $timeout.flush();
        expect(col.colDef.enableCellEdit).toBe(true);
        expect(col.colDef.editableCellTemplate).toBeDefined();
      });

      it('should not create additional edit properties if global enableCellEdit is false', function() {
        var grid = gridClassFactory.createGrid();

        grid.options.enableCellEdit = false;
        grid.options.columnDefs = [
          {field: 'col1'}
        ];
        grid.buildColumns();

        var colDef = grid.options.columnDefs[0];
        var col = grid.columns[0];
        uiGridEditService.editColumnBuilder(colDef,col,grid.options);
        expect(col.colDef.enableCellEdit).toBe(false);
        expect(col.colDef.editableCellTemplate).not.toBeDefined();
      });

      it('should not create additional edit properties for column of type object', function() {
        var grid = gridClassFactory.createGrid();

        grid.options.columnDefs = [
          {field: 'col1', type: 'object'}
        ];
        grid.buildColumns();

        var colDef = grid.options.columnDefs[0];
        var col = grid.columns[0];
        uiGridEditService.editColumnBuilder(colDef,col,grid.options);
        expect(col.colDef.enableCellEdit).toBe(false);
        expect(col.colDef.editableCellTemplate).not.toBeDefined();
      });

      it('should override enableCellEdit for each coldef if global enableCellEdit is false', function() {
        var grid = gridClassFactory.createGrid();

        grid.options.enableCellEdit = false;
        grid.options.columnDefs = [
          {field: 'col1', enableCellEdit: true},
          {field: 'col2', enableCellEdit: false}
        ];
        grid.buildColumns();

        var colDef = grid.options.columnDefs[0];
        var col = grid.columns[0];
        $timeout(function() {
          uiGridEditService.defaultGridOptions(grid.options);
          uiGridEditService.editColumnBuilder(colDef,col,grid.options);
        });
        $timeout.flush();
        expect(col.colDef.enableCellEdit).toBe(true);
        expect(col.editableCellTemplate).toBeDefined();

        colDef = grid.options.columnDefs[1];
        col = grid.columns[1];
        uiGridEditService.editColumnBuilder(colDef,col,grid.options);
        expect(col.colDef.enableCellEdit).toBe(false);
        expect(col.editableCellTemplate).not.toBeDefined();
      });

      it('should override enableCellEdit for each coldef if global enableCellEdit is true', function() {
        var grid = gridClassFactory.createGrid();

        grid.options.enableCellEdit = true;
        grid.options.columnDefs = [
          {field: 'col1', enableCellEdit: false},
          {field: 'col2', enableCellEdit: true}
        ];
        grid.buildColumns();

        var colDef = grid.options.columnDefs[0];
        var col = grid.columns[0];
        $timeout(function() {
          uiGridEditService.defaultGridOptions(grid.options);
          uiGridEditService.editColumnBuilder(colDef,col,grid.options);
        });
        $timeout.flush();
        expect(col.colDef.enableCellEdit).toBe(false);
        expect(col.editableCellTemplate).not.toBeDefined();

        colDef = grid.options.columnDefs[1];
        col = grid.columns[1];
        $timeout(function() {
          uiGridEditService.editColumnBuilder(colDef,col,grid.options);
        });
        $timeout.flush();
        expect(col.colDef.enableCellEdit).toBe(true);
        expect(col.editableCellTemplate).toBeDefined();
      });
    });
    describe('isStartEditKey function', function() {
      var event;

      beforeEach(function() {
        event = {};
      });
      it('should return false when event.metaKey is true', function() {
        event.metaKey = true;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when ESC is pressed', function() {
        event.keyCode = uiGridConstants.keymap.ESC;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when SHIFT is pressed', function() {
        event.keyCode = uiGridConstants.keymap.SHIFT;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when CTRL is pressed', function() {
        event.keyCode = uiGridConstants.keymap.CTRL;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when ALT is pressed', function() {
        event.keyCode = uiGridConstants.keymap.ALT;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when WIN is pressed', function() {
        event.keyCode = uiGridConstants.keymap.WIN;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when CAPSLOCK is pressed', function() {
        event.keyCode = uiGridConstants.keymap.CAPSLOCK;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when LEFT is pressed', function() {
        event.keyCode = uiGridConstants.keymap.LEFT;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when RIGHT is pressed', function() {
        event.keyCode = uiGridConstants.keymap.RIGHT;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when UP is pressed', function() {
        event.keyCode = uiGridConstants.keymap.UP;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when DOWN is pressed', function() {
        event.keyCode = uiGridConstants.keymap.DOWN;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when SHIFT+TAB is pressed', function() {
        event.keyCode = uiGridConstants.keymap.TAB;
        event.shiftKey = true;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when TAB is pressed', function() {
        event.keyCode = uiGridConstants.keymap.TAB;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when SHIFT+ENTER is pressed', function() {
        event.keyCode = uiGridConstants.keymap.ENTER;
        event.shiftKey = true;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return false when ENTER is pressed', function() {
        event.keyCode = uiGridConstants.keymap.ENTER;
        expect(uiGridEditService.isStartEditKey(event)).toBe(false);
      });
      it('should return true when any other key is pressed', function() {
        event.keyCode = uiGridConstants.keymap.BCKSP;
        expect(uiGridEditService.isStartEditKey(event)).toBe(true);
      });
    });
  });
})();
