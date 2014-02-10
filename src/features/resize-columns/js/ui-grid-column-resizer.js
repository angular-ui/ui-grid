(function(){
  'use strict';

  angular.module('ui.grid.resize-columns', [])
  .directive('uiGridColumnResizer', ['$log', '$document', 'gridUtil', 'uiGridConstants', function ($log, $document, gridUtil, uiGridConstants) {
    var resizeOverlay = angular.element('<div class="ui-grid-resize-overlay"></div>');

    var resizer = {
      priority: 0,
      scope: {
        col: '=',
        position: '@',
        renderIndex: '=',
      },
      require: '?^uiGrid',
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        var startX = 0,
            x = 0,
            gridLeft = 0;

        if ($scope.position === 'left') {
          $elm.addClass('left');
        }
        else if ($scope.position === 'right') {
          $elm.addClass('right');
        }

        // Resize all the other columns around col
        function resizeAroundColumn(col) {
          uiGridCtrl.grid.columns.forEach(function (column) {
            // Skip the column we just resized
            if (column.index === col.index) { return; }
            
            var colDef = column.colDef;
            if (!colDef.width || (angular.isString(colDef.width) && (colDef.width.indexOf('*') !== -1 || colDef.width.indexOf('%') !== -1))) {
              colDef.width = column.drawnWidth;
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
              uiGridCtrl.refreshCanvas(true)
                .then(function() {
                  // Then fire a scroll event to put the scrollbar in the right place, so it doesn't end up too far ahead or behind
                  var args = uiGridCtrl.prevScrollArgs ? uiGridCtrl.prevScrollArgs : { x: { percentage: 0 } };
                    
                  // Add an extra bit of percentage to the scroll event based on the xDiff we were passed
                  if (xDiff && args.x.pixels) {
                    var extraPercent = xDiff / uiGridCtrl.grid.getViewportWidth();

                    args.x.percentage = args.x.percentage - extraPercent;

                    // Can't be less than 0% or more than 100%
                    if (args.x.percentage > 1) { args.x.percentage = 1; }
                    else if (args.x.percentage < 0) { args.x.percentage = 0; }
                  }
                  
                  // Fire the scroll event
                  uiGridCtrl.fireScrollingEvent(args);
                });
            });
        }

        function mousemove(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.preventDefault();

          if (!uiGridCtrl.grid.element.hasClass('column-resizing')) {
            uiGridCtrl.grid.element.addClass('column-resizing');
          }

          x = event.clientX - gridLeft;

          if (x < 0) { x = 0; }
          else if (x > uiGridCtrl.grid.gridWidth) { x = uiGridCtrl.grid.gridWidth; }

          resizeOverlay.css({ left: x });
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
          var otherCol, multiplier;
          if ($scope.position === 'left') {
            // Get the column to the left of this one
            col = uiGridCtrl.grid.renderedColumns[$scope.renderIndex - 1];
            // otherCol = uiGridCtrl.grid.renderedColumns[$scope.renderIndex - 1];
            otherCol = $scope.col;
            // multiplier = 1;
          }
          else if ($scope.position === 'right') {
            otherCol = uiGridCtrl.grid.renderedColumns[$scope.renderIndex + 1];
            // multiplier = -1;
          }
          
          col.colDef.width = col.drawnWidth + xDiff;
          // otherCol.colDef.width = otherCol.drawnWidth + xDiff * -1;

          // All other columns because fixed to their drawn width, if they aren't already
          resizeAroundColumn(col);

          buildColumnsAndRefresh(xDiff);

          $document.off('mouseup', mouseup);
          $document.off('mousemove', mousemove);
        }

        $elm.on('mousedown', function(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.preventDefault();

          // Get the left offset of the grid
          gridLeft = uiGridCtrl.grid.element[0].offsetLeft;

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
        $elm.on('dblclick', function() {
          
          var col = $scope.col;
          var otherCol, multiplier;

          // If we're the left-positioned resizer then we need to resize the column to the left of our column, and not our column itself
          if ($scope.position === 'left') {
            col = uiGridCtrl.grid.renderedColumns[$scope.renderIndex - 1];
            otherCol = $scope.col;
            multiplier = 1;
          }
          else if ($scope.position === 'right') {
            otherCol = uiGridCtrl.grid.renderedColumns[$scope.renderIndex + 1];
            multiplier = -1;
          }

          // Go through the rendered rows and find out the max size for the data in this column
          var maxWidth = 0;
          var xDiff = 0;
          var cells = uiGridCtrl.grid.element[0].querySelectorAll('.col' + col.index);
          Array.prototype.forEach.call(cells, function (cell) {
              // Get the cell width
              // $log.debug('width', gridUtil.elementWidth(cell));

              gridUtil.fakeElement(cell, {}, function(newElm) {
                var width = gridUtil.elementWidth(newElm);
                if (width > maxWidth) {
                  maxWidth = width;
                  xDiff = maxWidth - width;
                }
              });
            });

          col.colDef.width = maxWidth;
          
          // All other columns because fixed to their drawn width, if they aren't already
          resizeAroundColumn(col);

          buildColumnsAndRefresh(xDiff);
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