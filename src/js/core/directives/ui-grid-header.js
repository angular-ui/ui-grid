(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridHeader', ['$log', '$templateCache', '$compile', 'uiGridConstants', 'gridUtil', '$timeout', function($log, $templateCache, $compile, uiGridConstants, gridUtil, $timeout) {
    var defaultTemplate = 'ui-grid/ui-grid-header';

    return {
      restrict: 'EA',
      // templateUrl: 'ui-grid/ui-grid-header',
      replace: true,
      // priority: 1000,
      require: '?^uiGrid',
      scope: false,
      compile: function($elm, $attrs) {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            var headerTemplate = ($scope.grid.options.headerTemplate) ? $scope.grid.options.headerTemplate : defaultTemplate;

             gridUtil.getTemplate(headerTemplate)
              .then(function (contents) {
                var template = angular.element(contents);
                
                var newElm = $compile(template)($scope);
                $elm.append(newElm);

                if (uiGridCtrl) {
                  // Inject a reference to the header viewport (if it exists) into the grid controller for use in the horizontal scroll handler below
                  var headerViewport = $elm[0].getElementsByClassName('ui-grid-header-viewport')[0];

                  if (headerViewport) {
                    uiGridCtrl.headerViewport = headerViewport;
                  }
                }
              });
          },

          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            if (uiGridCtrl === undefined) {
              throw new Error('[ui-grid-header] uiGridCtrl is undefined!');
            }

            $log.debug('ui-grid-header link');

            function updateColumnWidths() {
              var asterisksArray = [],
                  percentArray = [],
                  manualArray = [],
                  asteriskNum = 0,
                  totalWidth = 0;

              // Get the width of the viewport
              var availableWidth = uiGridCtrl.grid.getViewportWidth();

              // The total number of columns
              // var equalWidthColumnCount = columnCount = uiGridCtrl.grid.options.columnDefs.length;
              // var equalWidth = availableWidth / equalWidthColumnCount;

              // The last column we processed
              var lastColumn;

              var manualWidthSum = 0;

              var canvasWidth = 0;

              var ret = '';

              uiGridCtrl.grid.columns.forEach(function(column, i) {
                // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + i + ' { width: ' + equalWidth + 'px; left: ' + left + 'px; }';
                //var colWidth = (typeof(c.width) !== 'undefined' && c.width !== undefined) ? c.width : equalWidth;

                // Skip hidden columns
                if (! column.visible) { return; }

                var colWidth,
                    isPercent = false;

                if (! angular.isNumber(column.width)) {
                  isPercent = isNaN(column.width) ? gridUtil.endsWith(column.width, "%") : false;
                }

                if (angular.isString(column.width) && column.width.indexOf('*') !== -1) { //  we need to save it until the end to do the calulations on the remaining width.
                  asteriskNum = parseInt(asteriskNum + column.width.length, 10);
                  
                  asterisksArray.push(column);
                }
                else if (isPercent) { // If the width is a percentage, save it until the very last.
                  percentArray.push(column);
                }
                else if (angular.isNumber(column.width)) {
                  manualWidthSum = parseInt(manualWidthSum + column.width, 10);
                  
                  canvasWidth = parseInt(canvasWidth, 10) + parseInt(column.width, 10);

                  column.drawnWidth = column.width;

                  ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + column.width + 'px; }';
                }
              });

              // Get the remaining width (available width subtracted by the manual widths sum)
              var remainingWidth = availableWidth - manualWidthSum;

              var i, column, colWidth;

              if (percentArray.length > 0) {
                // Pre-process to make sure they're all within any min/max values
                for (i = 0; i < percentArray.length; i++) {
                  column = percentArray[i];

                  var percent = parseInt(column.width.replace(/%/g, ''), 10) / 100;

                  colWidth = percent * remainingWidth;

                  if (column.colDef.minWidth && colWidth < column.colDef.minWidth) {
                    colWidth = column.colDef.minWidth;

                    remainingWidth = remainingWidth - colWidth;

                    canvasWidth += colWidth;
                    column.drawnWidth = colWidth;

                    ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';

                    // Remove this element from the percent array so it's not processed below
                    percentArray.splice(i, 1);
                  }
                  else if (column.colDef.maxWidth && colWidth > column.colDef.maxWidth) {
                    colWidth = column.colDef.maxWidth;

                    remainingWidth = remainingWidth - colWidth;

                    canvasWidth += colWidth;
                    column.drawnWidth = colWidth;

                    ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';

                    // Remove this element from the percent array so it's not processed below
                    percentArray.splice(i, 1);
                  }
                }

                percentArray.forEach(function(column) {
                  var percent = parseInt(column.width.replace(/%/g, ''), 10) / 100;
                  var colWidth = percent * remainingWidth;

                  canvasWidth += colWidth;

                  column.drawnWidth = colWidth;

                  ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';
                });
              }

              if (asterisksArray.length > 0) {
                var asteriskVal = parseInt(remainingWidth / asteriskNum, 10);

                 // Pre-process to make sure they're all within any min/max values
                for (i = 0; i < asterisksArray.length; i++) {
                  column = asterisksArray[i];

                  colWidth = parseInt(asteriskVal * column.width.length, 10);

                  if (column.colDef.minWidth && colWidth < column.colDef.minWidth) {
                    colWidth = column.colDef.minWidth;

                    remainingWidth = remainingWidth - colWidth;
                    asteriskNum--;

                    canvasWidth += colWidth;
                    column.drawnWidth = colWidth;

                    ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';

                    lastColumn = column;

                    // Remove this element from the percent array so it's not processed below
                    asterisksArray.splice(i, 1);
                  }
                  else  if (column.colDef.maxWidth && colWidth > column.colDef.maxWidth) {
                    colWidth = column.colDef.maxWidth;

                    remainingWidth = remainingWidth - colWidth;
                    asteriskNum--;

                    canvasWidth += colWidth;
                    column.drawnWidth = colWidth;

                    ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';

                    // Remove this element from the percent array so it's not processed below
                    asterisksArray.splice(i, 1);
                  }
                }

                // Redo the asterisk value, as we may have removed columns due to width constraints
                asteriskVal = parseInt(remainingWidth / asteriskNum, 10);

                asterisksArray.forEach(function(column) {
                  var colWidth = parseInt(asteriskVal * column.width.length, 10);

                  canvasWidth += colWidth;

                  column.drawnWidth = colWidth;

                  ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';
                });
              }

              $scope.columnStyles = ret;

              uiGridCtrl.grid.canvasWidth = parseInt(canvasWidth, 10);
            }

            if (uiGridCtrl) {
              uiGridCtrl.header = $elm;
              
              var headerViewport = $elm[0].getElementsByClassName('ui-grid-header-viewport')[0];
              if (headerViewport) {
                uiGridCtrl.headerViewport = headerViewport;
              }
            }

            //todo: remove this if by injecting gridCtrl into unit tests
            if (uiGridCtrl) {
              uiGridCtrl.grid.registerStyleComputation({
                priority: 0,
                func: updateColumnWidths
              });
            }
          }
        };
      }
    };
  }]);

})();