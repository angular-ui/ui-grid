ngGridDirectives.directive('ngCell', ['$compile', '$domUtilityService', '$utilityService', function ($compile, domUtilityService, utilityService) {
    var ngCell = {
        scope: false,
        compile: function() {
            return {
                pre: function($scope, iElement) {
                    var html;
                    var cellTemplate = $scope.col.cellTemplate.replace(COL_FIELD, utilityService.preEval('row.entity.' + $scope.col.field) );

                    if ($scope.col.enableCellEdit) {
                        html =  $scope.col.cellEditTemplate;
                        html = html.replace(CELL_EDITABLE_CONDITION, $scope.col.cellEditableCondition);
                        html = html.replace(DISPLAY_CELL_TEMPLATE, cellTemplate);
                        html = html.replace(EDITABLE_CELL_TEMPLATE, $scope.col.editableCellTemplate.replace(COL_FIELD, utilityService.preEval('row.entity.' + $scope.col.field)));
                    } else {
                        html = cellTemplate;
                    }

                    var cellElement = $(html);
                    iElement.append(cellElement);
                    $compile(cellElement)($scope);
					
                    if ($scope.enableCellSelection && cellElement[0].className.indexOf('ngSelectionCell') === -1) {
                        cellElement[0].setAttribute('tabindex', 0);
                        cellElement.addClass('ngCellElement');
                    }
                },
                post: function($scope, iElement) {
                    if ($scope.enableCellSelection) {
                        $scope.domAccessProvider.selectionHandlers($scope, iElement);
                    }
                    
                    $scope.$on('$destroy', $scope.$on('ngGridEventDigestCell', function() {
                        domUtilityService.digest($scope);
                    }));
                }
            };
        }
    };
    
    return ngCell;
}]);