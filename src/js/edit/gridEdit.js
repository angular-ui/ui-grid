(function () {
  'use strict';
  var module = angular.module('ui.grid.edit', ['ui.grid', 'ui.grid.util']);

  module.constant('uiGridEditConstants', {
    EDITABLE_CELL_TEMPLATE: /EDITABLE_CELL_TEMPLATE/g,
    EDITABLE_CELL_DIRECTIVE: /editable_cell_directive/g,
    events: {
      START_CELL_EDIT: 'ngGridEventStartCellEdit',
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
              if (!$scope.col.colDef.enableCellEdit) {
                return;
              }

              //keep original html
              var origHtml;
              var html;

              var inEdit = false;

              $elm.on('dblclick', function () {

                origHtml = $scope.col.cellTemplate;
                origHtml = origHtml.replace(uiGridConstants.COL_FIELD, 'row.entity.' + $scope.col.colDef.field);

                html = $scope.col.editableCellTemplate;
                html = html.replace(uiGridConstants.COL_FIELD, 'row.entity.' + $scope.col.colDef.field);
                html = html.replace(uiGridEditConstants.EDITABLE_CELL_DIRECTIVE, $scope.col.editableCellDirective);

                $scope.$apply(function () {
                    var cellElement = $compile(html)($scope);
                    $elm.replaceWith(cellElement);
                  }
                );
                $scope.$broadcast(uiGridEditConstants.events.START_CELL_EDIT);

              });

              //replace with original display template
              $scope.$on(uiGridEditConstants.events.END_CELL_EDIT, function () {
                  var cellElement = $compile(origHtml)($scope);
                  $elm.replaceWith(cellElement);
              });


            },
            post: function ($scope, iElement) {
              $log.debug('gridEdit uiGridCell post-link');
            }
          };
        }
      };

      return ngCell;
    }]);


  module.directive('uiGridTextEditor', ['uiGridConstants', 'uiGridEditConstants', '$log',
    function (uiGridConstants, uiGridEditConstants, $log) {
      return{
        templateUrl: 'ui-grid/edit/cellTextEditor',
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs) {
              var input = $elm.find('input')[0];

              //set focus at start of edit
              $scope.$on(uiGridEditConstants.events.START_CELL_EDIT, function () {
                input.focus();
              });

              $scope.stopEdit = function(){
                $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
              };
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }]);

})();