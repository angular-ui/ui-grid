(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.pinning
   * @description
   *
   *  # ui.grid.pinning
   * This module provides column pinning
   * <br/>
   * <br/>
   *
   * <div doc-module-components="ui.grid.pinning"></div>
   */

  var module = angular.module('ui.grid.pinning', ['ui.grid']);

  module.config(['$provide', function ($provide) {
    $provide.decorator('i18nService', ['$delegate', function ($delegate) {
      $delegate.add('en',
        { pinning: {
            pinLeft: 'Pin Left',
            pinRight: 'Pin Right',
            unpin: 'Unpin'
          }
        }
      );

      return $delegate;
    }]);
  }]);

  module.service('uiGridPinningService', ['$log', 'GridRenderContainer', 'i18nService', function ($log, GridRenderContainer, i18nService) {
    var service = {

      initializeGrid: function (grid) {
        service.defaultGridOptions(grid.options);

        // Register a column builder to add new menu items for pinning left and right
        grid.registerColumnBuilder(service.pinningColumnBuilder);

        grid.renderContainers.left = new GridRenderContainer('left', grid, { disableColumnOffset: true });
        grid.renderContainers.right = new GridRenderContainer('right', grid, { disableColumnOffset: true });

      },

      defaultGridOptions: function (gridOptions) {
        //default option to true unless it was explicitly set to false
        /**
         *  @ngdoc object
         *  @name ui.grid.pinning.api:GridOptions
         *
         *  @description GridOptions for pinning feature
         */

        /**
         *  @ngdoc object
         *  @name enableRowSelection
         *  @propertyOf  ui.grid.pinning.api:GridOptions
         *  @propertyOf  ui.grid.class:GridOptions
         *  @description Enable pinning for the entire grid. Requires the pinning feature to be enabled. 
         *  <br/>Defaults to true
         */
        gridOptions.enablePinning = gridOptions.enablePinning !== false;

      },

      pinningColumnBuilder: function (colDef, col, gridOptions) {
        //default to true unless gridOptions or colDef is explicitly false

        /**
         *  @ngdoc object
         *  @name ui.grid.pinning.api:ColDef
         *
         *  @description ColDef for pinning feature
         */

        /**
         *  @ngdoc object
         *  @name enablePinning
         *  @propertyOf  ui.grid.pinning.api:ColDef
         *  @propertyOf  ui.grid.class:GridOptions.columnDef
         *  @description Enable pinning for the individual column. Requires the pinning feature to be enabled. 
         *  <br/>Defaults to true
         */
        colDef.enablePinning = colDef.enablePinning === undefined ? gridOptions.enablePinning : colDef.enablePinning;

        if (!colDef.enablePinning) {
          return;
        }

        var pinColumnLeftAction = {
          title: i18nService.get().pinning.pinLeft,
          icon: 'ui-grid-icon-left-open',
          shown: function () {
            return typeof(this.context.col.renderContainer) === 'undefined' || !this.context.col.renderContainer || this.context.col.renderContainer !== 'left';
          },
          action: function () {
            this.context.col.renderContainer = 'left';

            // Need to call refresh twice; once to move our column over to the new render container and then
            //   a second time to update the grid viewport dimensions with our adjustments
            col.grid.refresh()
              .then(function () {
                col.grid.refresh();
              });
          }
        };

        var pinColumnRightAction = {
          title: i18nService.get().pinning.pinRight,
          icon: 'ui-grid-icon-right-open',
          shown: function () {
            return typeof(this.context.col.renderContainer) === 'undefined' || !this.context.col.renderContainer || this.context.col.renderContainer !== 'right';
          },
          action: function () {
            this.context.col.renderContainer = 'right';

            // Need to call refresh twice; once to move our column over to the new render container and then
            //   a second time to update the grid viewport dimensions with our adjustments
            col.grid.refresh()
              .then(function () {
                col.grid.refresh();
              });
          }
        };

        var removePinAction = {
          title: i18nService.get().pinning.unpin,
          icon: 'ui-grid-icon-cancel',
          shown: function () {
            return typeof(this.context.col.renderContainer) !== 'undefined' && this.context.col.renderContainer !== null && this.context.col.renderContainer !== 'body';
          },
          action: function () {
            this.context.col.renderContainer = null;

            // Need to call refresh twice; once to move our column over to the new render container and then
            //   a second time to update the grid viewport dimensions with our adjustments
            col.grid.refresh()
              .then(function () {
                col.grid.refresh();
              });
          }
        };

        col.menuItems.push(pinColumnLeftAction);
        col.menuItems.push(pinColumnRightAction);
        col.menuItems.push(removePinAction);
      }
    };

    return service;
  }]);

  module.directive('uiGridPinning', ['$log', 'uiGridPinningService',
    function ($log, uiGridPinningService) {
      return {
        require: 'uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              uiGridPinningService.initializeGrid(uiGridCtrl.grid);
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {

              var left = angular.element('<div style="width: 0" ui-grid-pinned-container="\'left\'"></div>');
              $elm.prepend(left);
              uiGridCtrl.innerCompile(left);

              var right = angular.element('<div style="width: 0" ui-grid-pinned-container="\'right\'"></div>');
              $elm.append(right);
              uiGridCtrl.innerCompile(right);

              var bodyContainer = angular.element($elm[0].querySelectorAll('[container-id="body"]'));

              bodyContainer.attr('style', 'float: left; position: inherit');
            }
          };
        }
      };
    }]);

  module.directive('uiGridPinnedContainer', ['$log', function ($log) {
    return {
      restrict: 'EA',
      replace: true,
      template: '<div><div ui-grid-render-container container-id="side" row-container-name="\'body\'" col-container-name="side" bind-scroll-vertical="true" class="ui-grid-pinned-container {{ side }}"></div></div>',
      scope: {
        side: '=uiGridPinnedContainer'
      },
      require: '^uiGrid',
      compile: function compile() {
        return {
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            $log.debug('ui-grid-pinned-container ' + $scope.side + ' link');

            var grid = uiGridCtrl.grid;

            var myWidth = 0;

            // $elm.addClass($scope.side);

            function updateContainerDimensions() {
              // $log.debug('update ' + $scope.side + ' dimensions');

              var ret = '';

              // Column containers
              if ($scope.side === 'left' || $scope.side === 'right') {
                var cols = grid.renderContainers[$scope.side].visibleColumnCache;
                var width = 0;
                for (var i in cols) {
                  var col = cols[i];
                  width += col.drawnWidth;
                }

                myWidth = width;

                // $log.debug('myWidth', myWidth);

                // TODO(c0bra): Subtract sum of col widths from grid viewport width and update it
                $elm.attr('style', null);

                var myHeight = grid.getViewportHeight(); // + grid.horizontalScrollbarHeight;

                ret += '.grid' + grid.id + ' .ui-grid-pinned-container.' + $scope.side + ', .ui-grid-pinned-container.' + $scope.side + ' .ui-grid-viewport { width: ' + myWidth + 'px; height: ' + myHeight + 'px; } ';
              }

              return ret;
            }

            grid.renderContainers.body.registerViewportAdjuster(function (adjustment) {
              // Subtract our own width
              adjustment.width -= myWidth;

              return adjustment;
            });

            // Register style computation to adjust for columns in `side`'s render container
            grid.registerStyleComputation({
              priority: 15,
              func: updateContainerDimensions
            });
          }
        };
      }
    };
  }]);

})();