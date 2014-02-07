(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridColumnResizer', ['$log', '$document', function ($log, $document) {
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

        function mousemove(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.preventDefault();

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

          // The other column to resize (the one next to this one)
          var otherCol, multiplier;
          if ($scope.position === 'left') {
            // Get the column to the left of this one
            otherCol = uiGridCtrl.grid.renderedColumns[$scope.renderIndex - 1];
            multiplier = 1;
          }
          else if ($scope.position === 'right') {
            otherCol = uiGridCtrl.grid.renderedColumns[$scope.renderIndex + 1];
            multiplier = -1;
          }
          
          $scope.col.colDef.width = $scope.col.drawnWidth - xDiff * multiplier;
          otherCol.colDef.width = otherCol.drawnWidth + xDiff * multiplier;

          $log.debug($scope.col, otherCol);

          uiGridCtrl.grid.buildColumns()
            .then(function() {
              uiGridCtrl.refreshCanvas(true);
            });

          $document.off('mouseup', mouseup);
          $document.off('mousemove', mousemove);
        }

        $elm.on('mousedown', function(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.preventDefault();

          uiGridCtrl.grid.element.addClass('column-resizing');

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