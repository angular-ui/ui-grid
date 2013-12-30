(function(){
'use strict';

var app = angular.module('ui.grid.body', []);

app.directive('uiGridBody', ['$log', 'GridUtil', function($log, GridUtil) {
  return {
    replace: true,
    // priority: 1000,
    templateUrl: 'ui-grid/ui-grid-body',
    require: '?^uiGrid',
    scope: false,
    link: function(scope, elm, attrs, uiGridCtrl) {
      if (uiGridCtrl === undefined) {
        $log.warn('[ui-grid-body] uiGridCtrl is undefined!');
      }

      $log.debug('ui-grid-body link');

      // Stick the canvas in the controller
      uiGridCtrl.canvas = angular.element( elm[0].getElementsByClassName('ui-grid-canvas')[0] );
      uiGridCtrl.viewport = angular.element( elm[0].getElementsByClassName('ui-grid-viewport')[0] );

      scope.$on('uiGridScrollVertical', function(evt, args) {
        // $log.debug('scroll', args.scrollPercentage, scope.options.canvasHeight, args.scrollPercentage * scope.options.canvasHeight);
        var newScrollTop = args.scrollPercentage * (uiGridCtrl.canvas[0].scrollHeight - scope.options.canvasHeight);
        uiGridCtrl.canvas[0].scrollTop = newScrollTop;
      });

      var unbinders = [];
      unbinders.push(elm.bind('mousewheel', function(evt) {
        // use wheelDeltaY
        evt.preventDefault();

        var scrollAmount = evt.wheelDeltaY * -1;

        // Get the scroll percentage
        var scrollPercentage = (uiGridCtrl.canvas[0].scrollTop + scrollAmount) / (uiGridCtrl.canvas[0].scrollHeight - scope.options.canvasHeight);

        // $log.debug('new scrolltop', uiGridCtrl.canvas[0].scrollTop + scrollAmount);
        // uiGridCtrl.canvas[0].scrollTop = uiGridCtrl.canvas[0].scrollTop + scrollAmount;
        // $log.debug('new scrolltop', uiGridCtrl.canvas[0].scrollTop);

        scope.$broadcast('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: elm });
      }));
      unbinders.push(elm.bind('keyDown', function(evt, args) {

      }));

      elm.bind('$destroy', function() {
        angular.forEach(unbinders, function(u) {
          u();
        });
      });
    }
  };
}]);

})();