/* global _ */
(function() {
  'use strict';

  describe('ui.grid.edit GridCellDirective', function() {
    var $compile, $rootScope, $templateCache, $timeout, element, grid, gridClassFactory, gridUtil,
      recompile, scope, uiGridConstants, uiGridCtrl, uiGridEditService, onNavigateCb;

    beforeEach(function() {
      module('ui.grid');
      module('ui.grid.edit');

      inject(function(_$compile_, _$rootScope_, _$templateCache_, _$timeout_, _gridClassFactory_,
        _gridUtil_, _uiGridEditService_, _uiGridConstants_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $templateCache = _$templateCache_;
        $timeout = _$timeout_;
        gridClassFactory = _gridClassFactory_;
        gridUtil = _gridUtil_;
        uiGridConstants = _uiGridConstants_;
        uiGridEditService = _uiGridEditService_;
      });

      $templateCache.put('ui-grid/uiGridCell', '<div class="ui-grid-cell-contents">{{COL_FIELD CUSTOM_FILTERS}}</div>');
      $templateCache.put('ui-grid/cellEditor', '<div><input ng-model="MODEL_COL_FIELD" ui-grid-editor /></div>');

      scope = $rootScope.$new();
      grid = gridClassFactory.createGrid();
      grid.options.columnDefs = [
        {name: 'col1', enableCellEdit: true},
        {name: 'col2', enableCellEdit: false}
      ];
      grid.options.data = [
        {col1: 'val', col2: 'col2val'},
        {col1: 'val1', col2: 'col2val1'}
      ];
      uiGridEditService.initializeGrid(grid);
      grid.buildColumns();
      grid.modifyRows(grid.options.data);
      grid.options.onRegisterApi = function(gridApi) {
        uiGridCtrl = {
          grid: {
            api: gridApi
          }
        };
        gridApi.cellNav = {
          on: {
            navigate: function(scope, callback) {
              uiGridCtrl.gridScope = scope;
              onNavigateCb = callback;

              return angular.noop;
            },
            viewPortKeyDown: function() {
              return angular.noop;
            }
          }
        };
      };
      element = angular.element('<div ui-grid-cell/>');

      scope.grid = grid;
      scope.col = grid.columns[0];
      scope.row = grid.rows[0];

      scope.getCellValue = function() {
        return 'val';
      };

      $timeout(function() {
        recompile = function() {
          $compile(element)(scope);
          $rootScope.$apply();
        };
      });
      $timeout.flush();
    });

    describe('when a column has enableCellEdit set to false', function() {
      beforeEach(function() {
        scope.col = grid.columns[1];
        scope.beginEditEventsWired = false;
        element = angular.element('<div ui-grid-cell/>');
        recompile();
      });
      it('should not register the begin edit events', function() {
        expect(scope.beginEditEventsWired).toBe(false);
      });
    });

    describe('when a column starts out with enableCellEdit set to true, then is updated to become false and rows change', function() {
      beforeEach(function() {
        scope.col = grid.columns[0];
        scope.beginEditEventsWired = true;
        element = angular.element('<div ui-grid-cell/>');
        recompile();

        scope.col.colDef.enableCellEdit = false;
        scope.row = grid.rows[1];
        scope.$apply();
      });
      it('should cancel the begin edit events', function() {
        expect(scope.beginEditEventsWired).toBe(false);
      });
      it('should also not update beginEditEventsWired if called again', function() {
        scope.row = grid.rows[0];
        scope.$apply();

        expect(scope.beginEditEventsWired).toBe(false);
      });
    });

    describe('on navigate', function() {
      beforeEach(function() {
        element = angular.element('<div ui-grid="grid.options" ui-grid-edit/>');
      });
      describe('if enableCellEditOnFocus is set to true', function() {
        beforeEach(function() {
          recompile();
          uiGridCtrl.gridScope.col.colDef.enableCellEditOnFocus = true;
          uiGridCtrl.gridScope.col.editableCellTemplate = '';
          uiGridCtrl.gridScope.grid.api.core.scrollToIfNecessary = jasmine.createSpy('scrollToIfNecessary').and.returnValue({then: angular.noop});
          scope.$apply();
        });
        afterEach(function() {
          uiGridCtrl.gridScope.grid.api.core.scrollToIfNecessary.calls.reset();
        });
        it('should trigger scrolling if necessary when the navigating to the current row and column via click', function(done) {
          var event = new jQuery.Event('click');

          onNavigateCb({row: uiGridCtrl.gridScope.row, col: uiGridCtrl.gridScope.col}, {}, event);
          $timeout.flush();
          setTimeout(function() {
            expect(uiGridCtrl.gridScope.grid.api.core.scrollToIfNecessary).toHaveBeenCalled();
            done();
          }, 1);
        });
        it('should trigger scrolling if necessary when the navigating to the current row and column via keydown', function(done) {
          var event = new jQuery.Event('keydown');

          onNavigateCb({row: uiGridCtrl.gridScope.row, col: uiGridCtrl.gridScope.col}, {}, event);
          $timeout.flush();
          setTimeout(function() {
            expect(uiGridCtrl.gridScope.grid.api.core.scrollToIfNecessary).toHaveBeenCalled();
            done();
          }, 1);
        });
        it('should trigger scrolling if necessary when the navigating to the current row and column without an event', function(done) {
          onNavigateCb({row: uiGridCtrl.gridScope.row, col: uiGridCtrl.gridScope.col}, {}, null);
          $timeout.flush();
          setTimeout(function() {
            expect(uiGridCtrl.gridScope.grid.api.core.scrollToIfNecessary).toHaveBeenCalled();
            done();
          }, 1);
        });
        it('should not trigger scrolling if necessary when the navigating to a different row and column', function(done) {
          onNavigateCb({row: 'DifferentRow', col: 'DifferentCol'}, {}, null);
          $timeout.flush();
          setTimeout(function() {
            expect(uiGridCtrl.gridScope.grid.api.core.scrollToIfNecessary).not.toHaveBeenCalled();
            done();
          }, 1);
        });
      });
      describe('if enableCellEditOnFocus is set to false', function() {
        beforeEach(function() {
          recompile();
          uiGridCtrl.gridScope.col.colDef.enableCellEditOnFocus = false;
          uiGridCtrl.gridScope.grid.api.core.scrollToIfNecessary = jasmine.createSpy('scrollToIfNecessary').and.returnValue({then: angular.noop});
          onNavigateCb({row: uiGridCtrl.gridScope.row, col: uiGridCtrl.gridScope.col}, {}, null);
          $timeout.flush();
          scope.$apply();
        });
        afterEach(function() {
          uiGridCtrl.gridScope.grid.api.core.scrollToIfNecessary.calls.reset();
        });
        it('should not trigger scrolling', function(done) {
          setTimeout(function() {
            expect(uiGridCtrl.gridScope.grid.api.core.scrollToIfNecessary).not.toHaveBeenCalled();
            done();
          }, 1);
        });
      });
    });

    describe('touchStart', function() {
      function testTouchStart(withOriginalEvent) {
        beforeEach(function() {
          var event = new jQuery.Event('touchstart');

          if (withOriginalEvent) {
            event.originalEvent = new jQuery.Event('touchstart');
          }
          scope.grid.api.core.scrollToIfNecessary = jasmine.createSpy('scrollToIfNecessary').and.returnValue({then: angular.noop});
          recompile();
          element.trigger(event);
          $timeout.flush();
          scope.$apply();
        });
        afterEach(function() {
          scope.grid.api.core.scrollToIfNecessary.calls.reset();
        });
        it('should trigger scrolling if necessary', function(done) {
          setTimeout(function() {
            expect(scope.grid.api.core.scrollToIfNecessary).toHaveBeenCalled();
            done();
          }, 1);
        });
        describe('touchEnd', function() {
          beforeEach(function() {
            var touchStartEvent = new jQuery.Event('touchstart'),
              touchEndEvent = new jQuery.Event('touchend');

            spyOn($timeout, 'cancel').and.callThrough();
            element.trigger(touchStartEvent);
            element.trigger(touchEndEvent);
          });
          afterEach(function() {
            $timeout.cancel.calls.reset();
          });
          it('should cancel any touchstart timeout', function() {
            expect($timeout.cancel).toHaveBeenCalled();
          });
        });
      }
      describe('when original event is defined', function() {
        testTouchStart(true);
      });
      describe('when original event is not defined', function() {
        testTouchStart(false);
      });
    });

    describe('shouldEdit', function() {
      beforeEach(function() {
        var event = new jQuery.Event('touchstart');

        scope.grid.api.core.scrollToIfNecessary = jasmine.createSpy('scrollToIfNecessary').and.returnValue({
          then: function(resolve) {
            resolve();
          }
        });
        scope.col.colDef.cellEditableCondition = jasmine.createSpy('cellEditableCondition').and.returnValue(false);
        recompile();
        spyOn(scope.row, 'getQualifiedColField').and.callThrough();
        element.trigger(event);
        $timeout.flush();
        scope.$apply();
      });
      afterEach(function() {
        scope.grid.api.core.scrollToIfNecessary.calls.reset();
        scope.row.getQualifiedColField.calls.reset();
      });
      it('should not begin cell edit when the cell does not meet the cellEditableCondition', function() {
        expect(scope.row.getQualifiedColField).not.toHaveBeenCalled();
      });
    });

    describe('ui.grid.edit uiGridCell start editing', function() {
      var displayHtml;

      beforeEach(function() {
        element = angular.element('<div ui-grid-cell/>');
        recompile();

        displayHtml = element.html();
        expect(element.text()).toBe('val');
      });

      it('startEdit on "a"', function() {
        // stop edit
        var event = jQuery.Event("keydown");
        event.keyCode = 65;
        element.trigger(event);
        expect(element.find('input')).toBeDefined();
      });

      it('not start edit on tab', function() {
        // stop edit
        var event = jQuery.Event("keydown");
        event.keyCode = uiGridConstants.keymap.TAB;
        element.trigger(event);
        expect(element.html()).toEqual(displayHtml);
      });
    });

    describe('ui.grid.edit uiGridCell and uiGridEditor full workflow', function() {
      var displayHtml;

      beforeEach(function() {
        element = angular.element('<div ui-grid-cell/>');
        recompile();

        displayHtml = element.html();
        expect(element.text()).toBe('val');
        // invoke edit
        element.dblclick();
        $timeout(function() {
          expect(element.find('input')).toBeDefined();
          expect(element.find('input').val()).toBe('val');
        });
        $timeout.flush();
      });

      it('should stop editing on enter', function() {
        // stop edit
        var event = jQuery.Event("keydown");
        event.keyCode = uiGridConstants.keymap.ENTER;
        element.find('input').trigger(event);

        // back to beginning
        expect(element.html()).toBe(displayHtml);
      });

      it('should stop editing on esc', function() {
        // stop edit
        var event = jQuery.Event("keydown");
        event.keyCode = uiGridConstants.keymap.ESC;
        element.find('input').trigger(event);

        // back to beginning
        expect(element.html()).toBe(displayHtml);
      });

      it('should stop editing on tab', function() {
        // stop edit
        var event = jQuery.Event("keydown");
        event.keyCode = uiGridConstants.keymap.TAB;
        element.find('input').trigger(event);

        // back to beginning
        expect(element.html()).toBe(displayHtml);
      });

      it('should stop when grid scrolls', function() {
        // stop edit
        scope.grid.api.core.raise.scrollBegin();
        scope.$digest();
        // back to beginning
        expect(element.html()).toBe(displayHtml);
      });

      it('should fire public event', inject(function($timeout) {
        var edited = false;

        scope.grid.api.edit.on.afterCellEdit(scope, function() {
          edited = true;
          scope.$apply();
        });

        // stop edit
        $timeout(function() {
          var event = jQuery.Event("keydown");
          event.keyCode = uiGridConstants.keymap.ENTER;
          element.find('input').trigger(event);
        });
        $timeout.flush();

        expect(edited).toBe(true);
      }));
    });

    describe('ui.grid.edit should override bound value when using editModelField', function() {
      var displayHtml;

      beforeEach(function() {
        element = angular.element('<div ui-grid-cell/>');
        // bind the edit to another column. This could be any property on the entity
        scope.grid.options.columnDefs[0].editModelField = 'col2';
        recompile();

        displayHtml = element.html();
        expect(element.text()).toBe('val');
        // invoke edit
        element.dblclick();
        expect(element.find('input')).toBeDefined();
        expect(element.find('input').val()).toBe('col2val');
      });
    });
  });
})();
