(function(){
  'use strict';

  var app = angular.module('ui.grid.header', ['ui.grid']);

  app.directive('uiGridHeader', ['$log', '$templateCache', '$compile', 'uiGridConstants', 'gridUtil', function($log, $templateCache, $compile, uiGridConstants, gridUtil) {
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
                var width = uiGridCtrl.grid.getCanvasWidth();
                // var equalWidth = width / uiGridCtrl.grid.options.columnDefs.length;

                var availableWidth = width;
                var equalWidthColumnCount = uiGridCtrl.grid.options.columnDefs.length;
                uiGridCtrl.grid.options.columnDefs.forEach(function(c, i) {
                  if (typeof(c.width) !== 'undefined' && c.width !== undefined) {
                    availableWidth = availableWidth - c.width; 
                    equalWidthColumnCount = equalWidthColumnCount - 1;
                  }
                });
                var equalWidth = availableWidth / equalWidthColumnCount;

                var ret = '';
                var left = 0;
                uiGridCtrl.grid.columns.forEach(function(c, i) {
                  // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + i + ' { width: ' + equalWidth + 'px; left: ' + left + 'px; }';
                  //var colWidth = (typeof(c.width) !== 'undefined' && c.width !== undefined) ? c.width : equalWidth;
                  var colWidth;
                  if (typeof(c.colDef.width) !== 'undefined' && c.colDef.width !== undefined) {
                    colWidth = c.colDef.width;
                  }
                  else if ($scope.grid.useColumnDrawnWidths && typeof(c.drawnWidth) !== 'undefined' && c.drawnWidth !== undefined) {
                    colWidth = c.drawnWidth;
                  }
                  else {
                    colWidth = equalWidth;
                  }

                  ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + i + ' { width: ' + colWidth + 'px; }';
                  left = left + equalWidth;
                });

                $scope.columnStyles = ret;
              });
            }

            // Scroll the header horizontally with the grid body
            var scrollUnbinder = $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
              // Horizontal scroll
              if (args.x) {
                var scrollWidth = (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());

                var scrollXPercentage = args.x.percentage;
                var newScrollLeft = Math.max(0, scrollXPercentage * scrollWidth);
                
                uiGridCtrl.headerViewport.scrollLeft = newScrollLeft;
              }
            });

            $elm.bind('$destroy', function() {
              scrollUnbinder();
            });
          }
        };
      }
    };
  }]);

})();