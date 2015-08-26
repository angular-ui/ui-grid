(function() {
  'use strict';
  /**
   *  @ngdoc overview
   *  @name ui.grid.autoResize
   *
   *  @description
   *
   *  #ui.grid.autoResize
   *
   *  <div class="alert alert-warning" role="alert"><strong>Beta</strong> This feature is ready for testing, but it either hasn't seen a lot of use or has some known bugs.</div>
   *
   *  This module provides auto-resizing functionality to UI-Grid.
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

        var resizeTimeoutId;
        function startTimeout() {
          clearTimeout(resizeTimeoutId);

          resizeTimeoutId = setTimeout(function () {
            var newGridHeight = gridUtil.elementHeight($elm);
            var newGridWidth = gridUtil.elementWidth($elm);

            if (newGridHeight !== prevGridHeight || newGridWidth !== prevGridWidth) {
              uiGridCtrl.grid.gridHeight = newGridHeight;
              uiGridCtrl.grid.gridWidth = newGridWidth;

              $scope.$apply(function () {
                uiGridCtrl.grid.refresh()
                  .then(function () {
                    getDimensions();

                    startTimeout();
                  });
              });
            }
            else {
              startTimeout();
            }
          }, 250);
        }

        startTimeout();

        $scope.$on('$destroy', function() {
          clearTimeout(resizeTimeoutId);
        });
      }
    };
  }]);
})();
