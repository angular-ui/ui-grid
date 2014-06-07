(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridViewport', ['$log',
    function($log) {
      return {
        replace: true,
        scope: {},
        templateUrl: 'ui-grid/uiGridViewport',
        require: ['^uiGrid', '^uiGridRenderContainer'],
        link: function($scope, $elm, $attrs, controllers) {
          $log.debug('viewport post-link');

          var uiGridCtrl = controllers[0];
          var containerCtrl = controllers[1];
          var container = containerCtrl.container;

          var grid = uiGridCtrl.grid;

          // Put the container in scope so we can get rows and columns from it
          $scope.container = containerCtrl.container;

          // Register this viewport with its container 
          containerCtrl.viewport = $elm;

          $elm.on('scroll', function (evt) {
            var newScrollTop = $elm[0].scrollTop;
            var newScrollLeft = $elm[0].scrollLeft;

            if (newScrollLeft !== container.prevScrollLeft) {
              var xDiff = newScrollLeft - container.prevScrollLeft;

              var horizScrollLength = (container.getCanvasWidth() - container.getViewportWidth());
              var horizScrollPercentage = newScrollLeft / horizScrollLength;

              uiGridCtrl.adjustScrollHorizontal(newScrollLeft, horizScrollPercentage);
            }

            if (newScrollTop !== container.prevScrollTop) {
              var yDiff = newScrollTop - container.prevScrollTop;

              // uiGridCtrl.fireScrollingEvent({ y: { pixels: diff } });
              var vertScrollLength = (container.getCanvasHeight() - container.getViewportHeight());
              // var vertScrollPercentage = (uiGridCtrl.prevScrollTop + yDiff) / vertScrollLength;
              var vertScrollPercentage = newScrollTop / vertScrollLength;

              if (vertScrollPercentage > 1) { vertScrollPercentage = 1; }
              if (vertScrollPercentage < 0) { vertScrollPercentage = 0; }
              
              container.adjustScrollVertical(newScrollTop, vertScrollPercentage);
            }
          });
        }
      };
    }
  ]);

})();