(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridFilter', ['$compile', '$templateCache', function ($compile, $templateCache) {

    return {
      compile: function() {
        return {
          pre: function ($scope, $elm, $attrs, controllers) {
            $scope.col.updateFilters = function( filterable ){
              $elm.children().remove();
              if ( filterable ){
                var template = $scope.col.filterHeaderTemplate;
    
                $elm.append($compile(template)($scope));
              }
            };
            
            $scope.$on( '$destroy', function() {
              delete $scope.col.updateFilters;
            });
          }
        };
      }
    };
  }]);
})();
