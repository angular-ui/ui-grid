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

  module.directive('uiGridAutoResize', ['gridUtil', function(gridUtil) {
    return {
      require: 'uiGrid',
      scope: false,
      link: function($scope, $elm, $attrs, uiGridCtrl) {
        var timeout = null;

        var debounce = function(width, height) {
          if (timeout !== null) {
            clearTimeout(timeout);
          }
          timeout = setTimeout(function() {
            uiGridCtrl.grid.gridWidth = width;
            uiGridCtrl.grid.gridHeight = height;
            uiGridCtrl.grid.refresh();
            timeout = null;
          }, 400);
        };

        $scope.$watchGroup([
          function() {
            return gridUtil.elementWidth($elm);
          },
          function() {
            return gridUtil.elementHeight($elm);
          }
        ], function(newValues, oldValues, scope) {
          if (!angular.equals(newValues, oldValues)) {
            debounce(newValues[0], newValues[1]);
          }
        });
      }
    };
  }]);
})();
