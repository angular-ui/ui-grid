(function () {
  'use strict';
  var module = angular.module('ui.grid.edit', ['ui.grid', 'ui.grid.util']);

  module.constant('uiGridEditConstants', {
    EDITABLE_CELL_TEMPLATE: /EDITABLE_CELL_TEMPLATE/g,
    EDITABLE_CELL_DIRECTIVE: /editable_cell_directive/g,
    events: {
      BEGIN_CELL_EDIT: 'ngGridEventBeginCellEdit',
      END_CELL_EDIT: 'ngGridEventEndCellEdit'
    }
  });

  module.directive('uiGridEdit', ['$log', '$q', '$templateCache', function ($log, $q, $templateCache) {
    return {
      replace: true,
      priority: 1000,
      require: '?^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            $log.debug('uiGridEdit preLink');
            uiGridCtrl.grid.registerColumnBuilder(editColumnBuilder);

            /**
             * Processes designTime column definitions and creates runtime column properties
             * @param grid - reference to grid
             * @returns a promise
             */
            function editColumnBuilder(colDef, col, gridOptions) {

              var promises = [];

              col.enableCellEdit = colDef.enableCellEdit !== undefined ?
                colDef.enableCellEdit : gridOptions.enableCellEdit;

              col.cellEditableCondition = colDef.cellEditableCondition || gridOptions.cellEditableCondition || 'true';

              if (col.enableCellEdit) {
                col.editableCellTemplate = colDef.editableCellTemplate || $templateCache.get('ui-grid/edit/editableCell');
                col.editableCellDirective = colDef.editableCellDirective || 'ui-grid-text-editor';
              }

              return $q.all(promises);
            }
          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
          }
        };
      }
    };
  }]);

  module.directive('uiGridCell', ['$compile', 'uiGridConstants', 'uiGridEditConstants', '$log',
    function ($compile, uiGridConstants, uiGridEditConstants, $log) {
      var ngCell = {
        priority: 4900,
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm) {
              $log.debug('gridEdit uiGridCell pre-link');

            },
            post: function ($scope, $elm) {
              $log.debug('gridEdit uiGridCell post-link');
              if (!$scope.col.colDef.enableCellEdit) {
                return;
              }

              var origHtml;
              var html;
              var inEdit = false;

              $elm.on('dblclick', function () {
                beginEdit();
              });



              function beginEdit(){
                origHtml = $scope.col.cellTemplate;
                origHtml = origHtml.replace(uiGridConstants.COL_FIELD, 'row.entity.' + $scope.col.colDef.field);

                html = $scope.col.editableCellTemplate;
                html = html.replace(uiGridEditConstants.EDITABLE_CELL_DIRECTIVE, $scope.col.editableCellDirective);

                $scope.$apply(function () {
                    inEdit = true;
                    var cellElement = $compile(html)($scope);
                    $elm.find('div').replaceWith(cellElement);
                  }
                );

                //stop editing when grid is scrolled
                var deregOnGridScroll = $scope.$on(uiGridConstants.events.GRID_SCROLL, function () {
                  endEdit();
                  deregOnGridScroll();
                });

                //replace with original display template
                var deregOnEndCellEdit = $scope.$on(uiGridEditConstants.events.END_CELL_EDIT, function () {
                  endEdit();
                  deregOnEndCellEdit();
                });

                $scope.$broadcast(uiGridEditConstants.events.BEGIN_CELL_EDIT);
              }

              function endEdit(){
                if(!inEdit){return;}
                var cellElement = $compile(origHtml)($scope);
                $elm.find('div').replaceWith(cellElement);
                $scope.$apply();
                inEdit = false;
              }


            }
          };
        }
      };

      return ngCell;
    }]);

  module.directive('uiGridTextEditor',
    ['uiGridConstants', 'uiGridEditConstants', '$log', '$templateCache', '$compile',
    function (uiGridConstants, uiGridEditConstants, $log, $templateCache, $compile) {
      return{
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs) {

            },
            post: function ($scope, $elm, $attrs) {
              var html = $templateCache.get('ui-grid/edit/cellTextEditor');
              html = html.replace(uiGridConstants.COL_FIELD, 'row.entity.' + $scope.col.colDef.field);
              var cellElement = $compile(html)($scope);
              $elm.append(cellElement);

              var input = $elm.find('input')[0];

              // Set focus at start of edit
              $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                input.focus();
              });

              $scope.stopEdit = function () {
                $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
              };
            }
          };
        }
      };
    }]);

})();