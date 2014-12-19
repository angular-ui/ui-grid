(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridRow', ['gridUtil', function(gridUtil) {
    return {
      replace: true,
      // priority: 2001,
      // templateUrl: 'ui-grid/ui-grid-row',
      require: ['^uiGrid', '^uiGridRenderContainer'],
      scope: {
         row: '=uiGridRow',
         //rowRenderIndex is added to scope to give the true visual index of the row to any directives that need it
         rowRenderIndex: '='
      },
      compile: function() {
        return {
          pre: function($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            var grid = uiGridCtrl.grid;

            $scope.grid = uiGridCtrl.grid;
            $scope.colContainer = containerCtrl.colContainer;

            // Function for attaching the template to this scope
            function compileTemplate() {
              var compiledElementFn = $scope.row.compiledElementFn;

              compiledElementFn($scope, function (clonedElement, scope) {
                $elm.empty().append(clonedElement);
              });
            }

            // Initially attach the compiled template to this scope
            compileTemplate();

            // If the row's compiled element function changes, we need to replace this element's contents with the new compiled template
            $scope.$watch('row.compiledElementFn', function (newFunc, oldFunc) {
              if (newFunc !== oldFunc) {
                newFunc($scope, function (clonedElement, scope) {
                  $elm.empty().append(clonedElement);
                });
              }
            });
          },
          post: function($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            //add optional reference to externalScopes function to scope
            //so it can be retrieved in lower elements
            $scope.getExternalScopes = uiGridCtrl.getExternalScopes;
          }
        };
      }
    };
  }]);

})();