(function() {
  'use strict';

  angular.module('ui.grid').directive('uiGridPinnedContainer', ['gridUtil', function (gridUtil) {
    return {
      restrict: 'EA',
      replace: true,
      template: '<div class="ui-grid-pinned-container">'
              + '<div ui-grid-render-container container-id="side"'
              + ' row-container-name="\'body\'" col-container-name="side"'
              + ' bind-scroll-vertical="true"'
              + ' class="{{ side }} ui-grid-render-container-{{ side }}"></div>'
              + '</div>',
      scope: {
        side: '=uiGridPinnedContainer'
      },
      require: '^uiGrid',
      compile: function compile() {
        return {
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            // gridUtil.logDebug('ui-grid-pinned-container ' + $scope.side + ' link');

            var grid = uiGridCtrl.grid;

            var myWidth = 0;

            $elm.addClass('ui-grid-pinned-container-' + $scope.side);

            // Monkey-patch the viewport width function
            if ($scope.side === 'left' || $scope.side === 'right') {
              grid.renderContainers[$scope.side].getViewportWidth = monkeyPatchedGetViewportWidth;
            }

            function monkeyPatchedGetViewportWidth() {
              /*jshint validthis: true */
              var self = this;

              var viewportWidth = 0;
              self.visibleColumnCache.forEach(function (column) {
                viewportWidth += column.drawnWidth;
              });

              var adjustment = self.getViewportAdjustment();

              viewportWidth = viewportWidth + adjustment.width;

              return viewportWidth;
            }

            function updateContainerWidth() {
              if ($scope.side === 'left' || $scope.side === 'right') {
                var cols = grid.renderContainers[$scope.side].visibleColumnCache;
                var width = 0;
                for (var i = 0; i < cols.length; i++) {
                  var col = cols[i];
                  width += col.drawnWidth || col.width || 0;
                }

                return width;
              }
            }

            function updateContainerDimensions() {
              var ret = '';

              // Column containers
              if ($scope.side === 'left' || $scope.side === 'right') {
                myWidth = updateContainerWidth();

                // gridUtil.logDebug('myWidth', myWidth);

                // TODO(c0bra): Subtract sum of col widths from grid viewport width and update it
                $elm.attr('style', null);

             //   var myHeight = grid.renderContainers.body.getViewportHeight(); // + grid.horizontalScrollbarHeight;

                ret += '.grid' + grid.id + ' .ui-grid-pinned-container-' + $scope.side + ', .grid' + grid.id + ' .ui-grid-pinned-container-' + $scope.side + ' .ui-grid-render-container-' + $scope.side + ' .ui-grid-viewport { width: ' + myWidth + 'px; } ';
              }

              return ret;
            }

            grid.renderContainers.body.registerViewportAdjuster(function (adjustment) {
              myWidth = updateContainerWidth();

              // Subtract our own width
              adjustment.width -= myWidth;
              adjustment.side = $scope.side;

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
