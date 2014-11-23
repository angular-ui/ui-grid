(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridRecursiveSectionHeader', ['$compile', 'gridUtil', function($compile, gridUtil){
    return {
      restrict: 'EA',
      replace: true,
      compile: function($elm, $attrs) {
        return {
          pre: function ($scope, $elm, $attrs, controllers) {
            var sectionTemplate = 'ui-grid/ui-grid-recursive-section-header';

            gridUtil.getTemplate(sectionTemplate)
              .then(function (contents) {
                var template = angular.element(contents);

                var newElm = $compile(template)($scope);
                $elm.replaceWith(newElm);
                $elm = newElm;
              });
          },
          post: function ($scope, $elm, $attrs, controllers) {

          }
        };
      }
    };
  }]);
})();