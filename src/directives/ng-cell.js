ngGridDirectives.directive('ngCell', ['$compile', function($compile) {
    var ngCell = {
        scope: false,
        compile: function() {
            return {
                pre: function($scope, iElement) {
                    var html = $scope.col.cellTemplate;
                    html = html.replace(COL_FIELD, 'row.entity.' + $scope.col.field);
                    iElement.append($compile(html)($scope));
                }
            };
        }
    };
    return ngCell;
}]);