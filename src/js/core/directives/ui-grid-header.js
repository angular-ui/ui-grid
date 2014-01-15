(function(){
  'use strict';

  var app = angular.module('ui.grid.header', ['ui.grid']);

  app.directive('uiGridHeader', ['$log', '$templateCache', '$compile', 'gridUtil', function($log, $templateCache, $compile, gridUtil) {
    var defaultTemplate = 'ui-grid/ui-grid-header';

    return {
      restrict: 'EA',
      // templateUrl: 'ui-grid/ui-grid-header',
      replace: true,
      // priority: 1000,
      require: '?^uiGrid',
      scope: false,
      compile: function($elm, $attrs) {
        return {
          pre: function ($scope, $elm, $attrs) {
            var headerTemplate = ($scope.grid.options.headerTemplate) ? $scope.grid.options.headerTemplate : defaultTemplate;

             gridUtil.getTemplate(headerTemplate)
              .then(function (contents) {
                var template = angular.element(contents);
                
                var newElm = $compile(template)($scope);
                $elm.append(newElm);
              });
          },

          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            if (uiGridCtrl === undefined) {
              throw new Error('[ui-grid-header] uiGridCtrl is undefined!');
            }

            $log.debug('ui-grid-header link');

            if (uiGridCtrl) {
              uiGridCtrl.header = $elm;
            }

            //todo: remove this if by injecting gridCtrl into unit tests
            if (uiGridCtrl) {
              uiGridCtrl.grid.registerStyleComputation(function() {
                var width = uiGridCtrl.grid.gridWidth;
                var equalWidth = width / uiGridCtrl.grid.options.columnDefs.length;

                var ret = '';
                var left = 0;
                uiGridCtrl.grid.options.columnDefs.forEach(function(c, i) {
                  // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + i + ' { width: ' + equalWidth + 'px; left: ' + left + 'px; }';
                  ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + i + ' { width: ' + equalWidth + 'px; }';
                  left = left + equalWidth;
                });

                $scope.columnStyles = ret;
              });
            }
          }
        };
      }
    };
  }]);

})();