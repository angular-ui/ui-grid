(function () {
  'use strict';

  angular.module('ui.grid').directive('uiGridFooterCell', ['$timeout', 'gridUtil', 'uiGridConstants', '$compile',
  function ($timeout, gridUtil, uiGridConstants, $compile) {
    return {
      priority: 0,
      scope: {
        col: '=',
        row: '=',
        renderIndex: '='
      },
      replace: true,
      require: '^uiGrid',
      compile: function compile() {
        return {
          pre: function ($scope, $elm) {
            var template = $scope.col.footerCellTemplate;

            if (template === undefined && $scope.col.providedFooterCellTemplate !== '') {
              if ($scope.col.footerCellTemplatePromise) {
                $scope.col.footerCellTemplatePromise.then(function () {
                  template = $scope.col.footerCellTemplate;
                  $elm.append($compile(template)($scope));
                });
              }
            }
            else {
              $elm.append($compile(template)($scope));
            }
          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            // $elm.addClass($scope.col.getColClass(false));
            $scope.grid = uiGridCtrl.grid;

            var initColClass = $scope.col.getColClass(false);

            $elm.addClass(initColClass);

            // apply any footerCellClass
            var classAdded;

            var updateClass = function() {
              var contents = $elm;

              if ( classAdded ) {
                contents.removeClass( classAdded );
                classAdded = null;
              }

              if (angular.isFunction($scope.col.footerCellClass)) {
                classAdded = $scope.col.footerCellClass($scope.grid, $scope.row, $scope.col, $scope.rowRenderIndex, $scope.colRenderIndex);
              }
              else {
                classAdded = $scope.col.footerCellClass;
              }
              contents.addClass(classAdded);
            };

            if ($scope.col.footerCellClass) {
              updateClass();
            }

            $scope.col.updateAggregationValue();

            // Register a data change watch that would get triggered whenever someone edits a cell or modifies column defs
            var dataChangeDereg = $scope.grid.registerDataChangeCallback( updateClass, [uiGridConstants.dataChange.COLUMN]);

            // listen for visible rows change and update aggregation values
            $scope.grid.api.core.on.rowsRendered( $scope, $scope.col.updateAggregationValue );
            $scope.grid.api.core.on.rowsRendered( $scope, updateClass );
            $scope.$on( '$destroy', dataChangeDereg );
          }
        };
      }
    };
  }]);
})();
