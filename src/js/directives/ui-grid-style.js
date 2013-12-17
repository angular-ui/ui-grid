(function(){
// 'use strict';

/**
 * @ngdoc directive
 * @name ui.grid.style.directive:uiGridStyle
 * @element style
 * @restrict A
 *
 * @description
 * Allows us to interpolate expressions in `<style>` elements. Angular doesn't do this by default as it can/will/might? break in IE8.
 *
 * @example
   <example module="app">
     <file name="app.js">
       var app = angular.module('app', ['ui.grid']);
       
       app.controller('MainCtrl', ['$scope', function ($scope) {
         $scope.myStyle = '.blah { color: red }';
       }]);
     </file>
     <file name="index.html">
       <div ng-controller="MainCtrl">
         <style ui-grid-style>{{ myStyle }}</style>
         <span class="blah">I am red.</span>
       </div>
     </file>
   </example>
 */

var app = angular.module('ui.grid.style', []);

app.directive('uiGridStyle', ['$interpolate', '$sce', function($interpolate, $sce) {
  return {
    // restrict: 'A',
    priority: 1000,
    link: function(scope, element) {
      var interpolateFn = $interpolate(element.text(), true);

      if (interpolateFn) {
        scope.$watch(interpolateFn, function(value) {
          element.text(value);
        });
      }
    }
  };
}]);

})();