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


  module.directive('uiGridAutoResize', ['gridUtil', function (gridUtil) {
    return {
      require: 'uiGrid',
      scope: false,
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        $scope.$watch(function () {
          return {
            height: gridUtil.elementHeight($elm),
            width: gridUtil.elementWidth($elm)
          }
        }, function (newDimensions, oldDimensions) {
          if (newDimensions.height !== oldDimensions.height || newDimensions.width !== oldDimensions.width) {
            uiGridCtrl.grid.gridHeight = newDimensions.height;
            uiGridCtrl.grid.gridWidth = newDimensions.width;
            uiGridCtrl.grid.api.core.raise.gridDimensionChanged(oldDimensions.height, oldDimensions.width, newDimensions.height, newDimensions.width);
            uiGridCtrl.grid.refresh();
          }
        }, true);
      }
    };
  }]);
})();
