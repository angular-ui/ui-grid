(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridRow', ['$log', function($log) {
    return {
      replace: true,
      // priority: 2001,
      templateUrl: 'ui-grid/ui-grid-row',
      require: '?^uiGrid',
      scope: {
         row: '=uiGridRow',
         rowIndex: '='
      },
      compile: function() {
        return {
          pre: function($scope, $elm, $attrs) {
            // Bring the columnstyle function down into our isolate scope
            // $scope.columnStyle = $scope.$parent.columnStyle;
          },
          post: function($scope, $elm, $attrs, uiGridCtrl) {
            if (uiGridCtrl === undefined) {
              throw new Error('[ui-grid-row] uiGridCtrl is undefined!');
            }

            $scope.grid = uiGridCtrl.grid;

            //add optional reference to externalScopes function to scope
            //so it can be retrieved in lower elements
            $scope.getExternalScopes = uiGridCtrl.getExternalScopes;
            $scope.getCellValue = uiGridCtrl.getCellValue;

            // $attrs.$observe('rowIndex', function(n, o) {
            //   if (n) {
            //     $scope.rowIndex = $scope.$eval(n);
            //   }
            // });
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