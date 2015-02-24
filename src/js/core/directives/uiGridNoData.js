(function() {
  'use strict';

  angular.module('ui.grid').directive('uiGridNoData', [
    '$compile', '$templateCache',
    function ($compile, $templateCache) {

      return {
        restrict: 'A',
        require: '^uiGrid',
        compile: function(tElement, tAttrs) {
          return {
            pre: function(scope, element, attrs, uiGridCtrl) {
              var compileTemplate = function() {
                if (uiGridCtrl != null) {
                  var options = uiGridCtrl.grid.options;
                  var tmpl;

                  if (angular.isDefined(options.noDataTemplate)) {
                    tmpl = '<div>' + options.noDataTemplate + '</div>';
                  }
                  else {
                    tmpl = $templateCache.get('ui-grid/uiGridNoData');
                  }

                  var el = $compile(tmpl)(scope.$new());

                  element.append(el);
                }
              };

              compileTemplate();
            }
          };
        }
      };

      /**
       * @ngdoc property
       * @name noDataTemplate
       * @propertyOf ui.grid.class:GridOptions
       * @description This value overrides the default template
       * ('ui-grid/uiGridNoData') for the element that is being displayed when
       * there is no data (no renderedRows).
       */
    }
  ]);
})();
