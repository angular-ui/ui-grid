(function() {
  'use strict';

  angular.module('ui.grid').directive('uiGridRow', function() {
    return {
      replace: true,
      require: ['^uiGrid', '^uiGridRenderContainer'],
      scope: {
         row: '=uiGridRow',
         // rowRenderIndex is added to scope to give the true visual index of the row to any directives that need it
         rowRenderIndex: '='
      },
      compile: function() {
        return {
          pre: function($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            $scope.grid = uiGridCtrl.grid;
            $scope.colContainer = containerCtrl.colContainer;

            // Function for attaching the template to this scope
            var clonedElement, cloneScope;
            function compileTemplate() {
              $scope.row.getRowTemplateFn.then(function (compiledElementFn) {
                // var compiledElementFn = $scope.row.compiledElementFn;

                // Create a new scope for the contents of this row, so we can destroy it later if need be
                var newScope = $scope.$new();

                compiledElementFn(newScope, function (newElm, scope) {
                  // If we already have a cloned element, we need to remove it and destroy its scope
                  if (clonedElement) {
                    clonedElement.remove();
                    cloneScope.$destroy();
                  }

                  // Empty the row and append the new element
                  $elm.empty().append(newElm);

                  // Save the new cloned element and scope
                  clonedElement = newElm;
                  cloneScope = newScope;
                });
              }).catch(angular.noop);
            }

            // Initially attach the compiled template to this scope
            compileTemplate();

            // If the row's compiled element function changes, we need to replace this element's contents with the new compiled template
            $scope.$watch('row.getRowTemplateFn', function (newFunc, oldFunc) {
              if (newFunc !== oldFunc) {
                compileTemplate();
              }
            });
          },
          post: function($scope, $elm) {
            $scope.row.element = $elm;
          }
        };
      }
    };
  });
})();
