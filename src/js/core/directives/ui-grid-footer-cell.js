(function () {
  'use strict';

  angular.module('ui.grid').directive('uiGridFooterCell', ['$log', '$timeout', 'gridUtil', '$compile', function ($log, $timeout, gridUtil, $compile) {
    var uiGridFooterCell = {
      priority: 0,
      scope: {
        col: '=',
        row: '=',
        renderIndex: '='
      },
      replace: true,
      require: '^uiGrid',
      compile: function compile(tElement, tAttrs, transclude) {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            function compileTemplate(template) {
              gridUtil.getTemplate(template).then(function (contents) {
                var linkFunction = $compile(contents);
                var html = linkFunction($scope);
                $elm.append(html);
              });
            }

            //compile the footer template
            if ($scope.col.footerCellTemplate) {
              //compile the custom template
              compileTemplate($scope.col.footerCellTemplate);
            }
            else {
              //use default template
              compileTemplate('ui-grid/uiGridFooterCell');
            }
          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            //$elm.addClass($scope.col.getColClass(false));
            $scope.grid = uiGridCtrl.grid;
          }
        };
      }
    };

    return uiGridFooterCell;
  }]);

})();
