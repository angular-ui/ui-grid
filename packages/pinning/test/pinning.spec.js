/* global _ */
(function() {
  "use strict";
  xdescribe('ui.grid.pinning', function () {
    var grid, $scope, $compile, recompile, controller, timeout, GridRenderContainerClass;

    var data = [
      { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
      { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
      { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
      { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
    ];

    beforeEach(function () {
      angular.module('ui.grid.pinning.test', ['ui.grid'])
        .controller('uiGridController', function ($scope, $q, $timeout) {
          controller = this;
          $scope = {
            grid: {
              id: 512,
              registerColumnBuilder: jasmine.createSpy('registerColumnBuilder'),
              enablePinning: jasmine.createSpy('enablePinning'),
              hidePinLeft: jasmine.createSpy('hidePinLeft'),
              hidePinRight: jasmine.createSpy('hidePinRight'),
              registerStyleComputation: jasmine.createSpy('registerStyleComputation'),
              registerViewportAdjusters: jasmine.createSpy('registerViewportAdjusters'),
              renderingComplete: jasmine.createSpy('renderingComplete'),
              refreshCanvas: jasmine.createSpy('refreshCanvas'),
              getViewportHeight: jasmine.createSpy('getViewportHeight').andReturn('333'),
              renderContainers: {
                body: {
                  registerViewportAdjuster: jasmine.createSpy('registerViewportAdjusters for body container')
                }
              },
              options: {}
            }
          };
          this.grid = $scope.grid;
          this.scope = $scope;
          this.refresh = jasmine.createSpy().andCallFake(function () {
            var deferred = $q.defer();
            $timeout(function () {
              deferred.resolve();
            });
            return deferred.promise;
          });
          timeout = $timeout;
        });
    });
    beforeEach(module('ui.grid'));
    beforeEach(module('ui.grid.pinning'));
    beforeEach(module('ui.grid.pinning.test'));

    beforeEach(inject(function (_$compile_, $rootScope, GridRenderContainer) {
      GridRenderContainerClass = GridRenderContainer;

      $scope = $rootScope;
      $compile = _$compile_;

      $scope.gridOpts = {
        enablePinning: true,
        hidePinLeft: false,
        hidePinRight: false,
        data: data
      };

      $scope.gridOpts.columnDefs = [
        { name: 'name', width: 100 },
        { name: 'gender', width: 100  },
        { name: 'company', width: 150  }
      ];

      recompile = function () {
        grid = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts"></div>');
        document.body.appendChild(grid[0]);
        $compile(grid)($scope);
        $scope.$digest();
      };
      recompile();
    }));

    afterEach(function () {
      angular.element(grid).remove();
      grid = null;
    });

    describe('enables pinning when gridOptions.enablePinning is true', function () {
      it('should add pinned containers to the DOM', function () {
        var leftContainer = $(grid).find('[ui-grid-pinned-container*=left]');
        expect(leftContainer.size()).toEqual(1);

        var rightContainer = $(grid).find('[ui-grid-pinned-container*=right]');
        expect(rightContainer.size()).toEqual(1);
      });

      it('should add pinned containers to the grid object', function () {
        expect(controller.grid.renderContainers.left).toEqual(jasmine.any(GridRenderContainerClass));
        expect(controller.grid.renderContainers.right).toEqual(jasmine.any(GridRenderContainerClass));
      });

      it('should register column builders', function () {
        expect(controller.grid.registerColumnBuilder).toHaveBeenCalledWith(jasmine.any(Function));
      });


      describe('registered menu actions', function () {
        var columnBuilder, colDef, col, gridOpts;

        beforeEach(function () {
          columnBuilder = controller.grid.registerColumnBuilder.mostRecentCall.args[0];

          colDef = $scope.gridOpts.columnDefs[0];

          col = {
            menuItems: []
          };

          gridOpts = $scope.gridOpts;

          columnBuilder(colDef, col, gridOpts);
        });

        it('should set the enablePinning flag on the column', function () {
          expect(col.enablePinning).toBeTruthy();
        });

        it('should register menu actions for pinnable columns', function () {
          expect(col.menuItems.length).toEqual(2);
          expect(col.menuItems[0].title).toEqual('Pin Left');
          expect(col.menuItems[0].action).toEqual(jasmine.any(Function));
          expect(col.menuItems[1].title).toEqual('Pin Right');
          expect(col.menuItems[1].action).toEqual(jasmine.any(Function));
        });

        it('should pin a column to the left container and refresh the grid twice when pin left action is activated', function () {
          var actionFunction = col.menuItems[0].action;

          var jsScope = {
            context: {
              col: {}
            }
          };

          expect(controller.refresh.calls.length).toEqual(0);

          actionFunction.apply(jsScope);

          expect(jsScope.context.col.renderContainer).toEqual('left');

          expect(controller.refresh.calls.length).toEqual(1);
          timeout.flush();
          expect(controller.refresh.calls.length).toEqual(2);
        });

        it('should pin a column to the right container when pin right action is activated', function () {
          var actionFunction = col.menuItems[1].action;

          var jsScope = {
            context: {
              col: {}
            }
          };

          expect(controller.refresh.calls.length).toEqual(0);

          actionFunction.apply(jsScope);

          expect(jsScope.context.col.renderContainer).toEqual('right');
        });
      });

      it('should move column to the left column when moved to the left', function () {

      });

    });

    describe('uiGridPinnedContainer directive', function() {
      it('should register a viewport adjuster for the body container that adjusts the body\'s width', function () {
        expect(controller.grid.renderContainers.body.registerViewportAdjuster)
          .toHaveBeenCalledWith(jasmine.any(Function));

        var viewPortAdjusterFunction = controller.grid.renderContainers.body.registerViewportAdjuster.mostRecentCall.args[0];
        var adjustment = viewPortAdjusterFunction({width: 500});

        // TODO Test that the adjuster adjusts
      });

      it('should register a style computation function', function() {
        expect(controller.grid.registerStyleComputation)
          .toHaveBeenCalledWith({
            priority: 15,
            func: jasmine.any(Function)
          });

        var updateContainerDimensionsFunction = _(controller.grid.registerStyleComputation.calls)
          .pluck('args')
          .flatten()
          .pluck('func')
          .filter(function(it) {
            return it.toString().indexOf('updateContainerDimensions()') === 9;
          })
          .first();

      });
    });
  });
})();
