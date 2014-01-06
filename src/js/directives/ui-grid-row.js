(function(){
'use strict';

var app = angular.module('ui.grid.row', []);

app.directive('uiGridRow', ['$log', '$compile', 'GridUtil', function($log, $compile, GridUtil) {
  return {
    replace: true,
    // priority: 2001,
    templateUrl: 'ui-grid/ui-grid-row',
    require: ['?^uiGrid', '?^ngRepeat'],
    scope: {
      row: '=uiGridRow',
      rowIndex: '='
    },
    compile: function() {
      return {
        pre: function(scope, elm, attrs) {
          // if (scope.rowIndex === 0) {
          //   ng-style="rowStyle($index)"
          //   elm.attr('ng-style', "rowStyle($index)");
          //   $compile(elm)(scope);
          // }
        },
        post: function(scope, elm, attrs, controllers) {
          var uiGridCtrl   = controllers[0];
          var ngRepeatCtrl = controllers[1];

          if (uiGridCtrl === undefined) {
            $log.warn('[ui-grid-row] uiGridCtrl is undefined!');
          }

          // if (scope.rowIndex === 0) {
          //   // ng-style="rowStyle($index)"
          //   elm.attr('ng-style', "rowStyle($index)");
          //   $log.debug(elm.contents());
          //   // $compile()(scope);
          // }

          scope.options = uiGridCtrl.grid.options;
        }
      };
    }
  };
}]);

// app.directive('rowStyler', function($log, $compile) {
//   return {
//     scope: {
//       rowIndex: '='
//     },
//     link: function(scope, elm, attrs) {
//       // $log.debug('scope.rowIndex', scope.rowIndex);

//       if (scope.rowIndex === 0) {
//         elm.attr('ng-style', "rowStyle($index)");
//         $log.debug(elm[0].outerHTML);
//         // $compile(elm)(scope);
//       }
//     }
//   };
// });

})();