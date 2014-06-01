(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridViewport', ['$log',
    function($log) {
      return {
        require: ['^uiGrid', '^uiGridRenderContainer'],
        link: function($scope, $elm, $attrs, controllers) {
          $log.debug('viewport link');

          var uiGridCtrl = controllers[0];
          var containerCtrl = controllers[0];

          var grid = uiGridCtrl.grid;

          // Put the container in scope so we can get rows and columns from it
          $scope.container = containerCtrl.container;

          // Register this viewport with its container 
          containerCtrl.viewport = $elm;

          $elm.on('scroll', function (evt) {
            var newScrollTop = $elm[0].scrollTop;
            var newScrollLeft = $elm[0].scrollLeft;

            if (newScrollLeft !== containerCtrl.prevScrollLeft) {
              var xDiff = newScrollLeft - containerCtrl.prevScrollLeft;

              var horizScrollLength = (containerCtrl.getCanvasWidth() - containerCtrl.getViewportWidth());
              var horizScrollPercentage = newScrollLeft / horizScrollLength;

              uiGridCtrl.adjustScrollHorizontal(newScrollLeft, horizScrollPercentage);
            }

            if (newScrollTop !== containerCtrl.prevScrollTop) {
              var yDiff = newScrollTop - containerCtrl.prevScrollTop;

              // uiGridCtrl.fireScrollingEvent({ y: { pixels: diff } });
              var vertScrollLength = (containerCtrl.getCanvasHeight() - containerCtrl.getViewportHeight());
              // var vertScrollPercentage = (uiGridCtrl.prevScrollTop + yDiff) / vertScrollLength;
              var vertScrollPercentage = newScrollTop / vertScrollLength;

              if (vertScrollPercentage > 1) { vertScrollPercentage = 1; }
              if (vertScrollPercentage < 0) { vertScrollPercentage = 0; }
              
              containerCtrl.adjustScrollVertical(newScrollTop, vertScrollPercentage);
            }
          });
        }
      };
    }
  ]);

})();