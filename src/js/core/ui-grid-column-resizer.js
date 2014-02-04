(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridColumnResizer', ['$log', '$document', function ($log, $document) {
    var resizer = {
      priority: 0,
      scope: {
        col: '='
      },
      require: '?^uiGrid',
      link: function ($scope, $elm, $attrs) {
        function mousemove(event, args) {

        }

        function mouseup(event, args) {
          // Resize the column

          $document.off('mouseup', mouseup);
          $document.off('mousemove', mousemove);
        }

        $elm.on('mousedown', function(event, args) {
          event.preventDefault();

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