ngGridDirectives.directive('ngCell', ['$compile', 'DomUtilityService', function($compile, domUtilityService) {
    var ngCell = {
        scope: false,
        compile: function() {
            return {
                pre: function($scope, iElement) {
                    var html = $scope.col.cellTemplate;
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
						domUtilityService.selectionHandlers($scope, iElement);
					}
				}
            };
        }
    };
    return ngCell;
}]);