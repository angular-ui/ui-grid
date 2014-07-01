(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridCol', [function() {
    return {
      link: {
        post: function($scope, $elm) {
          $elm.addClass('col' + $scope.col.index);
          $scope.$watch('col.index', function (newValue, oldValue) {
            if (newValue === oldValue) { return; }
            var className = $elm.attr('class');
            className = className.replace('col' + oldValue, 'col' + newValue);
            $elm.attr('class', className);
          });
        }
      }
    };
  }]);

})();
