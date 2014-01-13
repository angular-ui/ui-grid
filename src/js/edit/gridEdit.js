(function () {
  'use strict';
  var module = angular.module('ui.grid.edit', ['ui.grid', 'ui.grid.util']);

  module.directive('uiGridEdit', ['$log', '$q', '$templateCache', function($log,$q,$templateCache) {
    return {
      replace: true,
      priority: 1000,
      require: '?^uiGrid',
      scope: false,
      compile: function() {
        return {
          pre: function($scope, $elm, $attrs, uiGridCtrl) {
            $log.debug('uiGridEdit preLink');
            uiGridCtrl.grid.registerColumnBuilder(editColumnBuilder);

            /**
             * Processes designTime column definitions and creates runtime column properties
             * @param grid - reference to grid
             * @returns a promise
             */
            function editColumnBuilder(colDef, col, gridOptions){

              var promises = [];

              col.enableCellEdit = colDef.enableCellEdit !== undefined ?
                colDef.enableCellEdit : gridOptions.enableCellEdit;

              col.cellEditableCondition = colDef.cellEditableCondition || gridOptions.cellEditableCondition || 'true';

              if(col.enableCellEdit) {
                col.cellEditTemplate = colDef.cellEditTemplate || $templateCache.get('ui-grid/cellEdit');
                col.editableCellTemplate = colDef.editableCellTemplate || $templateCache.get('ui-grid/editableCellText');
              }

              return $q.all(promises);
            }
          },
          post: function($scope, $elm, $attrs, uiGridCtrl) {
          }
        };
      }
    };
  }]);

  module.directive('uiGridCell', ['$compile','uiGridConstants', '$log',function ($compile,uiGridConstants,$log) {
    var ngCell = {
      priority: 4900,
      scope: false,
      compile: function() {
        return {
          pre: function($scope, iElement) {
            $log.debug('gridEdit uiGridCell pre-link');
            if (!$scope.col.colDef.enableCellEdit) {
              return;
            }

          .//  iElement[0].children.insertBefore

            var html = $scope.col.cellTemplate.replace(uiGridConstants.COL_FIELD, 'row.entity.' + $scope.col.colDef.field);

//            if ($scope.col.enableCellEdit) {
//              html =  $scope.col.cellEditTemplate;
//              html = html.replace(DISPLAY_CELL_TEMPLATE, cellTemplate);
//              html = html.replace(EDITABLE_CELL_TEMPLATE, $scope.col.editableCellTemplate.replace(COL_FIELD, 'row.entity.' + $scope.col.field));
//            } else {
//              html = cellTemplate;
//            }

            var cellElement = $compile(html)($scope);

//            if ($scope.enableCellSelection && cellElement[0].className.indexOf('ngSelectionCell') === -1) {
//              cellElement[0].setAttribute('tabindex', 0);
//              cellElement.addClass('ngCellElement');
//            }

            iElement.append(cellElement);
          },
          post: function($scope, iElement) {
            $log.debug('gridEdit uiGridCell post-link');
//            if ($scope.enableCellSelection) {
//              $scope.domAccessProvider.selectionHandlers($scope, iElement);
//            }
//
//            $scope.$on('ngGridEventDigestCell', function() {
//              domUtilityService.digest($scope);
//            });
          }
        };
      }
    };

    return ngCell;
  }]);


  module.directive('ngCellHasFocus', [
    function () {
        var focusOnInputElement = function($scope, elm) {
            $scope.isFocused = true;
           // domUtilityService.digest($scope);

            $scope.$broadcast('ngGridEventStartCellEdit');

            $scope.$on('ngGridEventEndCellEdit', function() {
                $scope.isFocused = false;
             //   domUtilityService.digest($scope);
            });
        };

        return function($scope, elm) {
            var isFocused = false;
            var isCellEditableOnMouseDown = false;

            $scope.editCell = function() {
                if(!$scope.col.colDef.enableCellEdit) {
                    setTimeout(function() {
                        focusOnInputElement($scope,elm);
                    }, 0);
                }
            };
            elm.bind('mousedown', function(evt) {
                if($scope.col.colDef.enableCellEdit) {
                    isCellEditableOnMouseDown = true;
                } else {
                    elm.focus();
                }
                return true;
            });
            elm.bind('click', function(evt) {
                if($scope.col.colDef.enableCellEdit) {
                    evt.preventDefault();
                    isCellEditableOnMouseDown = false;
                    focusOnInputElement($scope,elm);
                }
            }); 
            elm.bind('focus', function(evt) {
                isFocused = true;
                if($scope.col.colDef.enableCellEdit && !isCellEditableOnMouseDown) {
                    focusOnInputElement($scope,elm);
                }
                return true;
            });
            elm.bind('blur', function() {
                isFocused = false;
                return true;
            });
            elm.bind('keydown', function(evt) {
                if(!$scope.col.colDef.enableCellEdit) {
                    if (isFocused && evt.keyCode !== 37 && evt.keyCode !== 38 && evt.keyCode !== 39 && evt.keyCode !== 40 && evt.keyCode !== 9 && !evt.shiftKey && evt.keyCode !== 13) {
                        focusOnInputElement($scope,elm);
                    }
                    if (isFocused && evt.shiftKey && (evt.keyCode >= 65 && evt.keyCode <= 90)) {
                        focusOnInputElement($scope, elm);
                    }
                    if (evt.keyCode === 27) {
                        elm.focus();
                    }
                }
                return true;
            });
        };
    }]);

})();