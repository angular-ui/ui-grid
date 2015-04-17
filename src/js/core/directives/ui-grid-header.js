(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridHeader', ['$templateCache', '$compile', 'uiGridConstants', 'gridUtil', '$timeout', 'ScrollEvent',
    function($templateCache, $compile, uiGridConstants, gridUtil, $timeout, ScrollEvent) {
    var defaultTemplate = 'ui-grid/ui-grid-header';
    var emptyTemplate = 'ui-grid/ui-grid-no-header';

    return {
      restrict: 'EA',
      // templateUrl: 'ui-grid/ui-grid-header',
      replace: true,
      // priority: 1000,
      require: ['^uiGrid', '^uiGridRenderContainer'],
      scope: true,
      compile: function($elm, $attrs) {
        return {
          pre: function ($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            $scope.grid = uiGridCtrl.grid;
            $scope.colContainer = containerCtrl.colContainer;

            updateHeaderReferences();
            
            var headerTemplate;
            if (!$scope.grid.options.showHeader) {
              headerTemplate = emptyTemplate;
            }
            else {
              headerTemplate = ($scope.grid.options.headerTemplate) ? $scope.grid.options.headerTemplate : defaultTemplate;            
            }

            gridUtil.getTemplate(headerTemplate)
              .then(function (contents) {
                var template = angular.element(contents);
                
                var newElm = $compile(template)($scope);
                $elm.replaceWith(newElm);

                // And update $elm to be the new element
                $elm = newElm;

                updateHeaderReferences();

                if (containerCtrl) {
                  // Inject a reference to the header viewport (if it exists) into the grid controller for use in the horizontal scroll handler below
                  var headerViewport = $elm[0].getElementsByClassName('ui-grid-header-viewport')[0];


                  if (headerViewport) {
                    containerCtrl.headerViewport = headerViewport;
                    angular.element(headerViewport).on('scroll', scrollHandler);
                    $scope.$on('$destroy', function () {
                      angular.element(headerViewport).off('scroll', scrollHandler);
                    });
                  }
                }

                $scope.grid.queueRefresh();
              });

            function updateHeaderReferences() {
              containerCtrl.header = containerCtrl.colContainer.header = $elm;

              var headerCanvases = $elm[0].getElementsByClassName('ui-grid-header-canvas');

              if (headerCanvases.length > 0) {
                containerCtrl.headerCanvas = containerCtrl.colContainer.headerCanvas = headerCanvases[0];
              }
              else {
                containerCtrl.headerCanvas = null;
              }
            }

            function scrollHandler(evt) {
              if (uiGridCtrl.grid.isScrollingHorizontally) {
                return;
              }
              var newScrollLeft = gridUtil.normalizeScrollLeft(containerCtrl.headerViewport, uiGridCtrl.grid);
              var horizScrollPercentage = containerCtrl.colContainer.scrollHorizontal(newScrollLeft);

              var scrollEvent = new ScrollEvent(uiGridCtrl.grid, null, containerCtrl.colContainer, ScrollEvent.Sources.ViewPortScroll);
              scrollEvent.newScrollLeft = newScrollLeft;
              if ( horizScrollPercentage > -1 ){
                scrollEvent.x = { percentage: horizScrollPercentage };
              }

              uiGridCtrl.grid.scrollContainers(null, scrollEvent);
            }
          },

          post: function ($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            // gridUtil.logDebug('ui-grid-header link');

            var grid = uiGridCtrl.grid;

            // Don't animate header cells
            gridUtil.disableAnimations($elm);

            function updateColumnWidths() {
              // this styleBuilder always runs after the renderContainer, so we can rely on the column widths
              // already being populated correctly

              var columnCache = containerCtrl.colContainer.visibleColumnCache;
              
              // Build the CSS
              // uiGridCtrl.grid.columns.forEach(function (column) {
              var ret = '';
              var canvasWidth = 0;
              columnCache.forEach(function (column) {
                ret = ret + column.getColClassDefinition();
                canvasWidth += column.drawnWidth;
              });

              containerCtrl.colContainer.canvasWidth = canvasWidth;
              
              // Return the styles back to buildStyles which pops them into the `customStyles` scope variable
              return ret;
            }
            
            containerCtrl.header = $elm;
            
            var headerViewport = $elm[0].getElementsByClassName('ui-grid-header-viewport')[0];
            if (headerViewport) {
              containerCtrl.headerViewport = headerViewport;
            }

            //todo: remove this if by injecting gridCtrl into unit tests
            if (uiGridCtrl) {
              uiGridCtrl.grid.registerStyleComputation({
                priority: 15,
                func: updateColumnWidths
              });
            }
          }
        };
      }
    };
  }]);

})();
