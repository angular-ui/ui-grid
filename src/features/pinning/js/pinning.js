(function () {
  'use strict';

  var module = angular.module('ui.grid.pinning', ['ui.grid']);

  module.directive('uiGrid', ['$log', 'GridRenderContainer', function ($log, GridRenderContainer) {
    return {
      priority: -1,
      require: 'uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {

            var pinColumnLeftAction = {
              title: 'Pin Left',
              action: function() {
                this.context.col.renderContainer = 'left';

                // Need to call refresh twice; once to move our column over to the new render container and then
                //   a second time to update the grid viewport dimensions with our adjustments
                uiGridCtrl.refresh()
                  .then(function () {
                    uiGridCtrl.refresh();
                  });
              }
            };

            var pinColumnRightAction = {
              title: 'Pin Right',
              action: function() {
                this.context.col.renderContainer = 'right';
                
                // Need to call refresh twice; once to move our column over to the new render container and then
                //   a second time to update the grid viewport dimensions with our adjustments
                uiGridCtrl.refresh()
                  .then(function () {
                    uiGridCtrl.refresh();
                  });
              }
            };

            var removePinAction = {
              title: 'Unpin',
              icon: 'ui-grid-icon-info-circled',
              shown: function () {
                return typeof(this.context.col.renderContainer) !== 'undefined' && this.context.col.renderContainer !== null && this.context.col.renderContainer !== 'body';
                // return false;
              },
              action: function() {
                this.context.col.renderContainer = null;
                
                // Need to call refresh twice; once to move our column over to the new render container and then
                //   a second time to update the grid viewport dimensions with our adjustments
                uiGridCtrl.refresh()
                  .then(function () {
                    uiGridCtrl.refresh();
                  });
              }
            };

            function pinnableColumnBuilder(colDef, col, gridOptions) {
              col.enablePinning = (typeof(colDef.enablePinning) !== 'undefined' && colDef.enablePinning) ? colDef.enablePinning : gridOptions.enablePinning;

              col.menuItems.push(pinColumnLeftAction);
              col.menuItems.push(pinColumnRightAction);
              col.menuItems.push(removePinAction);
            }

            // Register a column builder to add new menu items for pinning left and right
            uiGridCtrl.grid.registerColumnBuilder(pinnableColumnBuilder);

            uiGridCtrl.grid.renderContainers.left = new GridRenderContainer('left', uiGridCtrl.grid, { disableColumnOffset: true });
            uiGridCtrl.grid.renderContainers.right = new GridRenderContainer('right', uiGridCtrl.grid, { disableColumnOffset: true });
          }
        };
      }
    };
  }]);

  module.directive('uiGrid', ['$log', '$compile', function ($log, $compile) {
    return {
      link: function ($scope, $elm, $attrs) {

        var left = angular.element('<div style="width: 0" ui-grid-pinned-container="\'left\'"></div>');
        $elm.prepend(left);
        $compile(left)($scope);

        var right = angular.element('<div style="width: 0" ui-grid-pinned-container="\'right\'"></div>');
        $elm.append(right);
        $compile(right)($scope);

        var bodyContainer = angular.element( $elm[0].querySelectorAll('[container-id="body"]') );

        bodyContainer.attr('style', 'float: left; position: inherit');
      }
    };
  }]);

  module.directive('uiGridPinnedContainer', ['$log', function ($log) {
    return {
      replace: true,
      template: '<div><div ui-grid-render-container container-id="side" row-container-name="\'body\'" col-container-name="side" bind-scroll-vertical="true" class="ui-grid-pinned-container {{ side }}"></div></div>',
      scope: {
        side: '=uiGridPinnedContainer'
      },
      require: '^uiGrid',
      compile: function compile() {
        return {
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            $log.debug('ui-grid-pinned-container link');

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

                ret += '.grid' + grid.id + ' .ui-grid-pinned-container.' + $scope.side + ', .ui-grid-pinned-container.' + $scope.side + ' .ui-grid-viewport { width: ' + myWidth + 'px; height: ' + grid.getViewportHeight() + 'px; } ';
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