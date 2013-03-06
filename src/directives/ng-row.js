/// <reference path="../templates/aggregateTemplate.js" />
/// <reference path="../namespace.js" />
ngGridDirectives.directive('ngRow', ['$compile', 'DomUtilityService', function($compile, domUtilityService) {
    var ngRow = {
        scope: false,
        compile: function() {
            return {
                pre: function($scope, iElement) {
                    $scope.row.elm = iElement;
                    if ($scope.row.clone) {
                        $scope.row.clone.elm = iElement;
                    }
                    if ($scope.row.isAggRow) {
                        var html = $scope.aggregateTemplate;
                        if ($scope.row.aggLabelFilter) {
                            html = html.replace(CUSTOM_FILTERS, '| ' + $scope.row.aggLabelFilter);
                        } else {
                            html = html.replace(CUSTOM_FILTERS, "");
                        }
                        iElement.append($compile(html)($scope));
                    } else {
                        iElement.append($compile($scope.rowTemplate)($scope));
                    }
					$scope.$on('ngGridEventDigestRow', function(){
						domUtilityService.digest($scope);
					});
                }
            };
        }
    };
    return ngRow;
}]);