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
        $scope.$watchGroup([
          function() {
            return gridUtil.elementWidth($elm);
          },
          function() {
            return gridUtil.elementHeight($elm);
          }], function(newValues, oldValues, scope) {
          if (newValues.toString() !== oldValues.toString()) {
            uiGridCtrl.grid.gridWidth = newValues[0];
            uiGridCtrl.grid.gridHeight = newValues[1];
            setTimeout(function(){
              $scope.$apply(function(){
                uiGridCtrl.grid.refresh();
              });
            },0);
          }
        });
      }
    };
  }]);
})();
