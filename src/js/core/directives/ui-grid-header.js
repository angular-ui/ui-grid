(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridHeader', ['$templateCache', '$compile', 'uiGridConstants', 'gridUtil', '$timeout', function($templateCache, $compile, uiGridConstants, gridUtil, $timeout) {
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
            $scope.getExternalScopes = uiGridCtrl.getExternalScopes;

            containerCtrl.header = $elm;
            containerCtrl.colContainer.header = $elm;

            /**
             * @ngdoc property
             * @name hideHeader
             * @propertyOf ui.grid.class:GridOptions
             * @description Null by default. When set to true, this setting will replace the
             * standard header template with '<div></div>', resulting in no header being shown.
             */
            
            var headerTemplate;
            if ($scope.grid.options.hideHeader){
              headerTemplate = emptyTemplate;
            } else {
              headerTemplate = ($scope.grid.options.headerTemplate) ? $scope.grid.options.headerTemplate : defaultTemplate;            
            }

             gridUtil.getTemplate(headerTemplate)
              .then(function (contents) {
                var template = angular.element(contents);
                
                var newElm = $compile(template)($scope);
                $elm.replaceWith(newElm);

                // Replace the reference to the container's header element with this new element
                containerCtrl.header = newElm;
                containerCtrl.colContainer.header = newElm;

                // And update $elm to be the new element
                $elm = newElm;

                if (containerCtrl) {
                  // Inject a reference to the header viewport (if it exists) into the grid controller for use in the horizontal scroll handler below
                  var headerViewport = $elm[0].getElementsByClassName('ui-grid-header-viewport')[0];

                  if (headerViewport) {
                    containerCtrl.headerViewport = headerViewport;
                  }
                }
              });
          },

          post: function ($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            // gridUtil.logDebug('ui-grid-header link');

            var grid = uiGridCtrl.grid;

            // Don't animate header cells
            gridUtil.disableAnimations($elm);

            function updateColumnWidths() {
              // Get the width of the viewport
              var availableWidth = containerCtrl.colContainer.getViewportWidth();

              if (typeof(uiGridCtrl.grid.verticalScrollbarWidth) !== 'undefined' && uiGridCtrl.grid.verticalScrollbarWidth !== undefined && uiGridCtrl.grid.verticalScrollbarWidth > 0) {
                availableWidth = availableWidth + uiGridCtrl.grid.verticalScrollbarWidth;
              }

              // The total number of columns
              // var equalWidthColumnCount = columnCount = uiGridCtrl.grid.options.columnDefs.length;
              // var equalWidth = availableWidth / equalWidthColumnCount;

              var columnCache = containerCtrl.colContainer.visibleColumnCache,
                  canvasWidth = 0,
                  asteriskNum = 0,
                  oneAsterisk = 0,
                  leftoverWidth = availableWidth,
                  hasVariableWidth = false;
              
              var getColWidth = function(column){
                if (column.widthType === "manual"){ 
                  return +column.width; 
                }
                else if (column.widthType === "percent"){ 
                  return parseInt(column.width.replace(/%/g, ''), 10) * availableWidth / 100;
                }
                else if (column.widthType === "auto"){
                  // leftOverWidth is subtracted from after each call to this
                  // function so we need to calculate oneAsterisk size only once
                  if (oneAsterisk === 0) {
                    oneAsterisk = parseInt(leftoverWidth / asteriskNum, 10);
                  }
                  return column.width.length * oneAsterisk; 
                }
              };
              
              // Populate / determine column width types:
              columnCache.forEach(function(column){
                column.widthType = null;
                if (isFinite(+column.width)){
                  column.widthType = "manual";
                }
                else if (gridUtil.endsWith(column.width, "%")){
                  column.widthType = "percent";
                  hasVariableWidth = true;
                }
                else if (angular.isString(column.width) && column.width.indexOf('*') !== -1){
                  column.widthType = "auto";
                  asteriskNum += column.width.length;
                  hasVariableWidth = true;
                }
              });
              
              // For sorting, calculate width from first to last:
              var colWidthPriority = ["manual", "percent", "auto"];
              columnCache.filter(function(column){
                // Only draw visible items with a widthType
                return (column.visible && column.widthType); 
              }).sort(function(a,b){
                // Calculate widths in order, so that manual comes first, etc.
                return colWidthPriority.indexOf(a.widthType) - colWidthPriority.indexOf(b.widthType);
              }).forEach(function(column){
                // Calculate widths:
                var colWidth = getColWidth(column);
                if (column.minWidth){
                  colWidth = Math.max(colWidth, column.minWidth);
                }
                if (column.maxWidth){
                  colWidth = Math.min(colWidth, column.maxWidth);
                }
                column.drawnWidth = Math.floor(colWidth);
                canvasWidth += column.drawnWidth;
                leftoverWidth -= column.drawnWidth;
              });

              // If the grid width didn't divide evenly into the column widths and we have pixels left over, dole them out to the columns one by one to make everything fit
              if (hasVariableWidth && leftoverWidth > 0 && canvasWidth > 0 && canvasWidth < availableWidth) {
                var remFn = function (column) {
                  if (leftoverWidth > 0 && (column.widthType === "auto" || column.widthType === "percent")) {
                    column.drawnWidth = column.drawnWidth + 1;
                    canvasWidth = canvasWidth + 1;
                    leftoverWidth--;
                  }
                };
                var prevLeftover = 0;
                do {
                  prevLeftover = leftoverWidth;
                  columnCache.forEach(remFn);
                } while (leftoverWidth > 0 && leftoverWidth !== prevLeftover );
              }
              canvasWidth = Math.max(canvasWidth, availableWidth);

              // Build the CSS
              // uiGridCtrl.grid.columns.forEach(function (column) {
              var ret = '';
              columnCache.forEach(function (column) {
                ret = ret + column.getColClassDefinition();
              });

              // Add the vertical scrollbar width back in to the canvas width, it's taken out in getViewportWidth
              if (grid.verticalScrollbarWidth) {
                canvasWidth = canvasWidth + grid.verticalScrollbarWidth;
              }
              // canvasWidth = canvasWidth + 1;

              // if we have a grid menu, then we prune the width of the last column header
              // to allow room for the button whilst still getting to the column menu
              if (columnCache.length > 0) { // && grid.options.enableGridMenu) {
                columnCache[columnCache.length - 1].headerWidth = columnCache[columnCache.length - 1].drawnWidth - 30;
              }

              containerCtrl.colContainer.canvasWidth = parseInt(canvasWidth, 10);

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
                priority: 5,
                func: updateColumnWidths
              });
            }
          }
        };
      }
    };
  }]);

})();
