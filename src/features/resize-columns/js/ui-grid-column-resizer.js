(function(){
  'use strict';

  var module = angular.module('ui.grid.resizeColumns', ['ui.grid']);

  module.constant('columnBounds', {
    minWidth: 35
  });


  module.service('uiGridResizeColumnsService', ['gridUtil', '$q', '$timeout',
    function (gridUtil, $q, $timeout) {

      var service = {
        defaultGridOptions: function(gridOptions){
          //default option to true unless it was explicitly set to false
          /**
           *  @ngdoc object
           *  @name ui.grid.resizeColumns.api:GridOptions
           *
           *  @description GridOptions for resizeColumns feature, these are available to be  
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           *  @ngdoc object
           *  @name enableColumnResizing
           *  @propertyOf  ui.grid.resizeColumns.api:GridOptions
           *  @description Enable column resizing on the entire grid 
           *  <br/>Defaults to true
           */
          gridOptions.enableColumnResizing = gridOptions.enableColumnResizing !== false;

          //legacy support
          //use old name if it is explicitly false
          if (gridOptions.enableColumnResize === false){
            gridOptions.enableColumnResizing = false;
          }
        },

        colResizerColumnBuilder: function (colDef, col, gridOptions) {

          var promises = [];
          /**
           *  @ngdoc object
           *  @name ui.grid.resizeColumns.api:ColumnDef
           *
           *  @description ColumnDef for resizeColumns feature, these are available to be 
           *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
           */

          /**
           *  @ngdoc object
           *  @name enableColumnResizing
           *  @propertyOf  ui.grid.resizeColumns.api:ColumnDef
           *  @description Enable column resizing on an individual column
           *  <br/>Defaults to GridOptions.enableColumnResizing
           */
          //default to true unless gridOptions or colDef is explicitly false
          colDef.enableColumnResizing = colDef.enableColumnResizing === undefined ? gridOptions.enableColumnResizing : colDef.enableColumnResizing;


          //legacy support of old option name
          if (colDef.enableColumnResize === false){
            colDef.enableColumnResizing = false;
          }

          return $q.all(promises);
        },
        
        registerPublicApi: function (grid) {
            /**
             *  @ngdoc object
             *  @name ui.grid.resizeColumns.api:PublicApi
             *  @description Public Api for column resize feature.
             */
            var publicApi = {
              events: {
                /**
                 * @ngdoc event
                 * @name columnSizeChanged
                 * @eventOf  ui.grid.resizeColumns.api:PublicApi
                 * @description raised when column is resized
                 * <pre>
                 *      gridApi.colResizable.on.columnSizeChanged(scope,function(colDef, deltaChange){})
                 * </pre>
                 * @param {object} colDef the column that was resized
                 * @param {integer} delta of the column size change
                 */
                colResizable: {
                  columnSizeChanged: function (colDef, deltaChange) {
                  }
                }
              }
            };
            grid.api.registerEventsFromObject(publicApi.events);
        },
        
        fireColumnSizeChanged: function (grid, colDef, deltaChange) {
          $timeout(function () {
            grid.api.colResizable.raise.columnSizeChanged(colDef, deltaChange);
          });
        }
      };

      return service;

    }]);


  /**
   * @ngdoc directive
   * @name ui.grid.resizeColumns.directive:uiGridResizeColumns
   * @element div
   * @restrict A
   * @description
   * Enables resizing for all columns on the grid. If, for some reason, you want to use the ui-grid-resize-columns directive, but not allow column resizing, you can explicitly set the
   * option to false. This prevents resizing for the entire grid, regardless of individual columnDef options.
   *
   * @example
   <doc:example module="app">
   <doc:source>
   <script>
   var app = angular.module('app', ['ui.grid', 'ui.grid.resizeColumns']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
          $scope.gridOpts = {
            data: [
              { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
              { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
              { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
              { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
            ]
          };
        }]);
   </script>

   <div ng-controller="MainCtrl">
   <div class="testGrid" ui-grid="gridOpts" ui-grid-resize-columns ></div>
   </div>
   </doc:source>
   <doc:scenario>

   </doc:scenario>
   </doc:example>
   */
  module.directive('uiGridResizeColumns', ['gridUtil', 'uiGridResizeColumnsService', function (gridUtil, uiGridResizeColumnsService) {
    return {
      replace: true,
      priority: 0,
      require: '^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {            
            uiGridResizeColumnsService.defaultGridOptions(uiGridCtrl.grid.options);
            uiGridCtrl.grid.registerColumnBuilder( uiGridResizeColumnsService.colResizerColumnBuilder);
            uiGridResizeColumnsService.registerPublicApi(uiGridCtrl.grid);
          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
          }
        };
      }
    };
  }]);

  // Extend the uiGridHeaderCell directive
  module.directive('uiGridHeaderCell', ['gridUtil', '$templateCache', '$compile', '$q', function (gridUtil, $templateCache, $compile, $q) {
    return {
      // Run after the original uiGridHeaderCell
      priority: -10,
      require: '^uiGrid',
      // scope: false,
      compile: function() {
        return {
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
           if (uiGridCtrl.grid.options.enableColumnResizing) {
              var renderIndexDefer = $q.defer();

              $attrs.$observe('renderIndex', function (n, o) {
                $scope.renderIndex = $scope.$eval(n);

                renderIndexDefer.resolve();
              });

              renderIndexDefer.promise.then(function() {
                var columnResizerElm = $templateCache.get('ui-grid/columnResizer');

                var resizerLeft = angular.element(columnResizerElm).clone();
                var resizerRight = angular.element(columnResizerElm).clone();

                resizerLeft.attr('position', 'left');
                resizerRight.attr('position', 'right');

                var col = $scope.col;
                var renderContainer = col.getRenderContainer();


                // Get the column to the left of this one
                var otherCol = renderContainer.renderedColumns[$scope.renderIndex - 1];

                // Don't append the left resizer if this is the first column or the column to the left of this one has resizing disabled
                if (otherCol && renderContainer.visibleColumnCache.indexOf($scope.col) !== 0 && otherCol.colDef.enableColumnResizing !== false) {
                  $elm.prepend(resizerLeft);
                  $compile(resizerLeft)($scope);
                }
                
                // Don't append the right resizer if this column has resizing disabled
                if ($scope.col.colDef.enableColumnResizing !== false) {
                  $elm.append(resizerRight);
                  $compile(resizerRight)($scope);
                }
              });
            }
          }
        };
      }
    };
  }]);


  
  /**
   * @ngdoc directive
   * @name ui.grid.resizeColumns.directive:uiGridColumnResizer
   * @element div
   * @restrict A
   *
   * @description
   * Draggable handle that controls column resizing.
   * 
   * @example
   <doc:example module="app">
     <doc:source>
       <script>
        var app = angular.module('app', ['ui.grid', 'ui.grid.resizeColumns']);

        app.controller('MainCtrl', ['$scope', function ($scope) {
          $scope.gridOpts = {
            enableColumnResizing: true,
            data: [
              { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
              { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
              { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
              { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
            ]
          };
        }]);
       </script>

       <div ng-controller="MainCtrl">
        <div class="testGrid" ui-grid="gridOpts"></div>
       </div>
     </doc:source>
     <doc:scenario>
      // TODO: e2e specs?
        // TODO: Obey minWidth and maxWIdth;

      // TODO: post-resize a horizontal scroll event should be fired
     </doc:scenario>
   </doc:example>
   */  
  module.directive('uiGridColumnResizer', ['$document', 'gridUtil', 'uiGridConstants', 'columnBounds', 'uiGridResizeColumnsService', function ($document, gridUtil, uiGridConstants, columnBounds, uiGridResizeColumnsService) {
    var resizeOverlay = angular.element('<div class="ui-grid-resize-overlay"></div>');

    var resizer = {
      priority: 0,
      scope: {
        col: '=',
        position: '@',
        renderIndex: '='
      },
      require: '?^uiGrid',
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        var startX = 0,
            x = 0,
            gridLeft = 0,
            rtlMultiplier = 1;

        //when in RTL mode reverse the direction using the rtlMultiplier and change the position to left
        if (uiGridCtrl.grid.isRTL()) {
          $scope.position = 'left';
          rtlMultiplier = -1;
        }

        if ($scope.position === 'left') {
          $elm.addClass('left');
        }
        else if ($scope.position === 'right') {
          $elm.addClass('right');
        }

        // Resize all the other columns around col
        function resizeAroundColumn(col) {
          // Get this column's render container
          var renderContainer = col.getRenderContainer();

          renderContainer.visibleColumnCache.forEach(function (column) {
            // Skip the column we just resized
            if (column === col) { return; }
            
            var colDef = column.colDef;
            if (!colDef.width || (angular.isString(colDef.width) && (colDef.width.indexOf('*') !== -1 || colDef.width.indexOf('%') !== -1))) {
              column.width = column.drawnWidth;
            }
          });
        }

        // Build the columns then refresh the grid canvas
        //   takes an argument representing the diff along the X-axis that the resize had
        function buildColumnsAndRefresh(xDiff) {
          // Build the columns
          uiGridCtrl.grid.buildColumns()
            .then(function() {
              // Then refresh the grid canvas, rebuilding the styles so that the scrollbar updates its size
              uiGridCtrl.grid.refreshCanvas(true);
            });
        }

        function mousemove(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.preventDefault();

          x = event.clientX - gridLeft;

          if (x < 0) { x = 0; }
          else if (x > uiGridCtrl.grid.gridWidth) { x = uiGridCtrl.grid.gridWidth; }

          // The other column to resize (the one next to this one)
          var col = $scope.col;
          var renderContainer = col.getRenderContainer();
          var otherCol;
          if ($scope.position === 'left') {
            // Get the column to the left of this one
            col = renderContainer.renderedColumns[$scope.renderIndex - 1];
            otherCol = $scope.col;
          }
          else if ($scope.position === 'right') {
            otherCol = renderContainer.renderedColumns[$scope.renderIndex + 1];
          }

          // Don't resize if it's disabled on this column
          if (col.colDef.enableColumnResizing === false) {
            return;
          }

          if (!uiGridCtrl.grid.element.hasClass('column-resizing')) {
            uiGridCtrl.grid.element.addClass('column-resizing');
          }

          // Get the diff along the X axis
          var xDiff = x - startX;

          // Get the width that this mouse would give the column
          var newWidth = parseInt(col.drawnWidth + xDiff * rtlMultiplier, 10);

          // If the new width would be less than the column's allowably minimum width, don't allow it
          if (col.colDef.minWidth && newWidth < col.colDef.minWidth) {
            x = x + (col.colDef.minWidth - newWidth) * rtlMultiplier;
          }
          else if (!col.colDef.minWidth && columnBounds.minWidth && newWidth < columnBounds.minWidth) {
            x = x + (col.colDef.minWidth - newWidth);
          }
          else if (col.colDef.maxWidth && newWidth > col.colDef.maxWidth) {
            x = x + (col.colDef.maxWidth - newWidth) * rtlMultiplier;
          }
          
          resizeOverlay.css({ left: x + 'px' });

          uiGridCtrl.fireEvent(uiGridConstants.events.ITEM_DRAGGING);
        }

        function mouseup(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.preventDefault();

          uiGridCtrl.grid.element.removeClass('column-resizing');

          resizeOverlay.remove();

          // Resize the column
          x = event.clientX - gridLeft;
          var xDiff = x - startX;

          if (xDiff === 0) {
            $document.off('mouseup', mouseup);
            $document.off('mousemove', mousemove);
            return;
          }

          // The other column to resize (the one next to this one)
          var col = $scope.col;
          var renderContainer = col.getRenderContainer();

          var otherCol;
          if ($scope.position === 'left') {
            // Get the column to the left of this one
            col = renderContainer.renderedColumns[$scope.renderIndex - 1];
            otherCol = $scope.col;
          }
          else if ($scope.position === 'right') {
            otherCol = renderContainer.renderedColumns[$scope.renderIndex + 1];
          }

          // Don't resize if it's disabled on this column
          if (col.colDef.enableColumnResizing === false) {
            return;
          }

          // Get the new width
          var newWidth = parseInt(col.drawnWidth + xDiff * rtlMultiplier, 10);

          // If the new width is less than the minimum width, make it the minimum width
          if (col.colDef.minWidth && newWidth < col.colDef.minWidth) {
            newWidth = col.colDef.minWidth;
          }
          else if (!col.colDef.minWidth && columnBounds.minWidth && newWidth < columnBounds.minWidth) {
            newWidth = columnBounds.minWidth;
          }
          // 
          if (col.colDef.maxWidth && newWidth > col.colDef.maxWidth) {
            newWidth = col.colDef.maxWidth;
          }
          
          col.width = newWidth;

          // All other columns because fixed to their drawn width, if they aren't already
          resizeAroundColumn(col);

          buildColumnsAndRefresh(xDiff);

          uiGridResizeColumnsService.fireColumnSizeChanged(uiGridCtrl.grid, col.colDef, xDiff);

          $document.off('mouseup', mouseup);
          $document.off('mousemove', mousemove);
        }

        $elm.on('mousedown', function(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.stopPropagation();

          // Get the left offset of the grid
          // gridLeft = uiGridCtrl.grid.element[0].offsetLeft;
          gridLeft = uiGridCtrl.grid.element[0].getBoundingClientRect().left;

          // Get the starting X position, which is the X coordinate of the click minus the grid's offset
          startX = event.clientX - gridLeft;

          // Append the resizer overlay
          uiGridCtrl.grid.element.append(resizeOverlay);

          // Place the resizer overlay at the start position
          resizeOverlay.css({ left: startX });

          // Add handlers for mouse move and up events
          $document.on('mouseup', mouseup);
          $document.on('mousemove', mousemove);
        });

        // On doubleclick, resize to fit all rendered cells
        $elm.on('dblclick', function(event, args) {
          event.stopPropagation();

          var col = $scope.col;
          var renderContainer = col.getRenderContainer();

          var otherCol, multiplier;

          // If we're the left-positioned resizer then we need to resize the column to the left of our column, and not our column itself
          if ($scope.position === 'left') {
            col = renderContainer.renderedColumns[$scope.renderIndex - 1];
            otherCol = $scope.col;
            multiplier = 1;
          }
          else if ($scope.position === 'right') {
            otherCol = renderContainer.renderedColumns[$scope.renderIndex + 1];
            otherCol = renderContainer.renderedColumns[$scope.renderIndex + 1];
            multiplier = -1;
          }

          // Go through the rendered rows and find out the max size for the data in this column
          var maxWidth = 0;
          var xDiff = 0;

          // Get the parent render container element
          var renderContainerElm = gridUtil.closestElm($elm, '.ui-grid-render-container');

          // Get the cell contents so we measure correctly. For the header cell we have to account for the sort icon and the menu buttons, if present
          var cells = renderContainerElm.querySelectorAll('.' + uiGridConstants.COL_CLASS_PREFIX + col.uid + ' .ui-grid-cell-contents');
          Array.prototype.forEach.call(cells, function (cell) {
              // Get the cell width
              // gridUtil.logDebug('width', gridUtil.elementWidth(cell));

              // Account for the menu button if it exists
              var menuButton;
              if (angular.element(cell).parent().hasClass('ui-grid-header-cell')) {
                menuButton = angular.element(cell).parent()[0].querySelectorAll('.ui-grid-column-menu-button');
              }

              gridUtil.fakeElement(cell, {}, function(newElm) {
                // Make the element float since it's a div and can expand to fill its container
                var e = angular.element(newElm);
                e.attr('style', 'float: left');

                var width = gridUtil.elementWidth(e);

                if (menuButton) {
                  var menuButtonWidth = gridUtil.elementWidth(menuButton);
                  width = width + menuButtonWidth;
                }

                if (width > maxWidth) {
                  maxWidth = width;
                  xDiff = maxWidth - width;
                }
              });
            });

          // If the new width is less than the minimum width, make it the minimum width
          if (col.colDef.minWidth && maxWidth < col.colDef.minWidth) {
            maxWidth = col.colDef.minWidth;
          }
          else if (!col.colDef.minWidth && columnBounds.minWidth && maxWidth < columnBounds.minWidth) {
            maxWidth = columnBounds.minWidth;
          }
          // 
          if (col.colDef.maxWidth && maxWidth > col.colDef.maxWidth) {
            maxWidth = col.colDef.maxWidth;
          }

          col.width = parseInt(maxWidth, 10);
          
          // All other columns because fixed to their drawn width, if they aren't already
          resizeAroundColumn(col);

          buildColumnsAndRefresh(xDiff);
          
          uiGridResizeColumnsService.fireColumnSizeChanged(uiGridCtrl.grid, col.colDef, xDiff);
        });

        $elm.on('$destroy', function() {
          $elm.off('mousedown');
          $elm.off('dblclick');
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        });
      }
    };

    return resizer;
  }]);

})();