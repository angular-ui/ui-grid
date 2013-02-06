ngGridDirectives.directive('ngCell', ['$compile', function($compile) {
    var ngCell = {
        scope: false,
        compile: function() {
            return {
                pre: function($scope, iElement) {
					var html;
					if($scope.col.enableFocusedCellEdit){
						html =  $scope.col.focusedCellEditTemplate;
						html = html.replace(DISPLAY_CELL_TEMPLATE, $scope.col.cellTemplate);
						html = html.replace(EDITABLE_CELL_TEMPLATE, $scope.col.editableCellTemplate);
					} else {
						html = $scope.col.cellTemplate;
					}
                    html = html.replace(COL_FIELD, 'row.entity.' + $scope.col.field);
					var cellElement = $compile(html)($scope);
					if($scope.enableCellSelection && cellElement[0].className.indexOf('ngSelectionCell') == -1){
						cellElement[0].setAttribute('tabindex', 0);
						cellElement.addClass('ngCellElement');
					}
                    iElement.append(cellElement);
                },
				post: function($scope, iElement){	
					if($scope.enableCellSelection){
						$scope.domAccessProvider.selectionHandlers($scope, iElement);
					}
				}
            };
        }
    };
    return ngCell;
}]);