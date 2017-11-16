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

        $scope.$watch(function() {
          return $elm[0].clientWidth;
        }, function(newVal, oldVal) {
          if (newVal !== oldVal) {
            var newGridWidth = newVal;
            uiGridCtrl.grid.gridWidth = newGridWidth;
            uiGridCtrl.grid.refresh();
          }
        });

        $scope.$watch(function() {
          return $elm[0].clientHeight;
        }, function(newVal, oldVal) {
          if (newVal !== oldVal) {
            var newGridHeight = newVal;
            uiGridCtrl.grid.gridHeight = newGridHeight;
            uiGridCtrl.grid.refresh();
          }
        });

      }
    };
  }]);
})();
