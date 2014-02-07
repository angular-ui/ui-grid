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

            if (uiGridCtrl) {
              uiGridCtrl.header = $elm;
              
              var headerViewport = $elm[0].getElementsByClassName('ui-grid-header-viewport')[0];
              if (headerViewport) {
                uiGridCtrl.headerViewport = headerViewport;
              }
            }

            //todo: remove this if by injecting gridCtrl into unit tests
            if (uiGridCtrl) {
              uiGridCtrl.grid.registerStyleComputation(function() {
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

                var manualWidthSum = 0;

                var canvasWidth = 0;

                var ret = '';
                debugger;
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
                    asteriskNum += column.width.length;
                    
                    asterisksArray.push(column);
                  }
                  else if (isPercent) { // If the width is a percentage, save it until the very last.
                    percentArray.push(column);
                  }
                  else if (angular.isNumber(column.width)) {
                    manualWidthSum += column.width;
                    canvasWidth += column.width;

                    column.drawnWidth = column.width;

                    ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + column.width + 'px; }';
                  }
                });
  
                // Get the remaining width (available width subtracted by the manual widths sum)
                var remainingWidth = availableWidth - manualWidthSum;

                if (percentArray.length > 0) {
                  percentArray.forEach(function(column) {
                    var percent = parseFloat(column.width) / 100;
                    var colWidth = percent * remainingWidth;

                    canvasWidth = colWidth;

                    column.drawnWidth = colWidth;

                    ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';
                  });
                }

                if (asterisksArray.length > 0) {
                  // Calculate the weight of each asterisk
                  var asteriskVal = remainingWidth / asteriskNum;

                  asterisksArray.forEach(function(column) {
                    var colWidth = asteriskVal * column.width.length;

                    canvasWidth += colWidth;

                    column.drawnWidth = colWidth;

                    ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';
                  });
                }
                
                // uiGridCtrl.grid.options.columnDefs.forEach(function(c, i) {
                //   if (typeof(c.width) !== 'undefined' && c.width !== undefined) {
                //     availableWidth = availableWidth - c.width;
                //     equalWidthColumnCount = equalWidthColumnCount - 1;
                //   }
                // });

                $scope.columnStyles = ret;

                uiGridCtrl.grid.canvasWidth = canvasWidth;
              });
            }

            // Scroll the header horizontally with the grid body
            // var scrollUnbinder = $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
            //   // Horizontal scroll
            //   if (args.x) {
            //     var scrollWidth = (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());

            //     var scrollXPercentage = args.x.percentage;
            //     var newScrollLeft = Math.max(0, scrollXPercentage * scrollWidth);
                
            //     uiGridCtrl.headerViewport.scrollLeft = newScrollLeft;

            //     $log.debug('header viewport scrollLeft', newScrollLeft);
            //   }
            // });

            $elm.bind('$destroy', function() {
              // scrollUnbinder();
            });
          }
        };
      }
    };
  }]);

})();