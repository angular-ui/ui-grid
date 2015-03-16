(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridFilter', function ($compile, $templateCache) {

    return {
      compile: function() {
        return {
          pre: function ($scope, $elm, $attrs) {
            var template = $scope.colFilter.filterTemplate || $scope.col.filterTemplate;

            $elm.append($compile(template)($scope));
          }
        };
      }
    };
  });
})();