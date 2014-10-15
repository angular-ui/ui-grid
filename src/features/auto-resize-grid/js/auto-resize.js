(function() {
  'use strict';
  /**
   *  @ngdoc overview
   *  @name ui.grid.autoResize
   *
   *  @description 
   *
   *  #ui.grid.autoResize
   *  This module provides auto-resizing functionality to ui-grid
   *
   */
  var module = angular.module('ui.grid.autoResize', ['ui.grid']);
  

  module.directive('uiGridAutoResize', ['$timeout', 'gridUtil', function ($timeout, gridUtil) {
    return {
      require: 'uiGrid',
      scope: false,
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        var prevGridWidth, prevGridHeight;

        function getDimensions() {
          prevGridHeight = gridUtil.elementHeight($elm);
          prevGridWidth = gridUtil.elementWidth($elm);
        }

        // Initialize the dimensions
        getDimensions();

        var canceler;
        function startTimeout() {
          $timeout.cancel(canceler);

          canceler = $timeout(function () {
            var newGridHeight = gridUtil.elementHeight($elm);
            var newGridWidth = gridUtil.elementWidth($elm);

            if (newGridHeight !== prevGridHeight || newGridWidth !== prevGridWidth) {
              uiGridCtrl.grid.gridHeight = newGridHeight;
              uiGridCtrl.grid.gridWidth = newGridWidth;

              uiGridCtrl.grid.refresh()
                .then(function () {
                  getDimensions();

                  startTimeout();
                });
            }
            else {
              startTimeout();
            }
          }, 250);
        }

        startTimeout();

        $scope.$on('$destroy', function() {
          $timeout.cancel(canceler);
        });
      }
    };
  }]);
})();