ngGridDirectives.directive('ngRow', ['$compile', '$domUtilityService', '$templateCache', function ($compile, domUtilityService, $templateCache) {
    var ngRow = {
        scope: false,
        compile: function(tElem, tAttrs) {
            return {
                pre: function($scope, iElement) {
                    $scope.row.elm = iElement;
                    if ($scope.row.clone) {
                        $scope.row.clone.elm = iElement;
                    }
                    if ($scope.row.isAggRow) {
                        var html = $templateCache.get($scope.gridId + 'aggregateTemplate.html');
                        if ($scope.row.aggLabelFilter) {
                            html = html.replace(CUSTOM_FILTERS, '| ' + $scope.row.aggLabelFilter);
                        } else {
                            html = html.replace(CUSTOM_FILTERS, "");
                        }
                        iElement.append($compile(html)($scope));
                    } else {
                        var detailsTemplate = iElement.html().trim();  //save details template
                        //then clear iElements html
                        iElement.children().addClass('hidden-template').hide();         //this seemed to be the only way to get page working without strange errors
                        //iElement.empty();                 //errors and breaks page

                        var template = $($templateCache.get($scope.gridId + 'rowTemplate.html'));
                        template.children('.expandedRowDetails').html(detailsTemplate);
                        iElement.append($compile(template)($scope));

                        var height = $($(iElement).children()[1]).find('.expandedRowDetails').height();
                        $scope.row.detailHeight(height);
                    }

					$scope.$on('$destroy', $scope.$on('ngGridEventDigestRow', function(){
						domUtilityService.digest($scope);
					}));
                }
            };
        }
    };
    return ngRow;
}]);
