(function () {
  'use strict';

  angular.module('ui.grid').directive('uiGridFooterCell', ['$timeout', 'gridUtil', 'uiGridConstants', '$compile',
  function ($timeout, gridUtil, uiGridConstants, $compile) {
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
            $scope.getExternalScopes = uiGridCtrl.getExternalScopes;

            $elm.addClass($scope.col.getColClass(false));

            // apply any footerCellClass
            var classAdded;
            var updateClass = function( grid ){
              var contents = $elm;
              if ( classAdded ){
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

            // Register a data change watch that would get triggered whenever someone edits a cell or modifies column defs
            var watchUid = $scope.grid.registerDataChangeCallback( updateClass, [uiGridConstants.dataChange.COLUMN]);

            $scope.$on( '$destroy', function() {
              $scope.grid.deregisterDataChangeCallback( watchUid ); 
            });
          }
        };
      }
    };

    return uiGridFooterCell;
  }]);

})();
