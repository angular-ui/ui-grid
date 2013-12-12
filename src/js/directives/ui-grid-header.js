(function(){
'use strict';

var app = angular.module('ui.grid.header', ['ui.grid.util']);

app.directive('uiGridHeader', ['$log', '$templateCache', '$compile', 'GridUtil', function($log, $templateCache, $compile, GridUtil) {
  return {
    restrict: 'EA',
    // templateUrl: 'ui-grid/ui-grid-header',
    // replace: true,
    priority: 1000,
    require: '?^uiGrid',
    scope: {
      tableClass: '=uiGridTableClass'
    },
    compile: function (elm, attrs) {
      $log.debug('header compile');

      // If the contents of the grid element are empty, use the default grid template
      var tmpl;
      if (elm.html() === '' || /^\s*$/.test(elm.html())) {
        tmpl = $templateCache.get('ui-grid/ui-grid-header');
      }

      var preLink = function (scope, elm, attrs) {
        $log.debug('header prelink scope', scope.$id);

        if (tmpl) {
          elm.append(tmpl);
        }
        $compile(elm.contents())(scope);
      };

      var postLink = function(scope, elm, attrs, uiGridCtrl) {
        $log.debug('header postlink scope', scope.$id);

        if (uiGridCtrl === undefined) {
          $log.warn('[ui-grid-header] uiGridCtrl is undefined!');
        }

        // Get the column defs from the parent grid controller
        if (uiGridCtrl && typeof(uiGridCtrl.columns) !== 'undefined' && uiGridCtrl.columns) {
          scope.columns = uiGridCtrl.columns;
        }

        // if (tmpl) {
        //   elm.append(tmpl);
        //   $compile(elm.contents())(scope);
        // }

        // scope.$watch('columns', function(n, o) {
        //    $log.debug('columns change', n, o);
        //    var contents = elm.contents();
        //    $compile(contents)(scope);
        // });
      };

      return {
        pre: preLink,
        post: postLink
      };
    }
  };
}]);

})();