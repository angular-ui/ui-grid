﻿/// <reference path="../templates/aggregateTemplate.js" />
/// <reference path="../namespace.js" />
ngGridDirectives.directive('ngRow', ['$compile', function ($compile) {
    var ngRow = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    var html;
                    if ($scope.row.isAggRow) {
                        html = ng.aggregateTemplate();
                        if ($scope.row.aggLabelFilter) {
                            html = html.replace(CUSTOM_FILTERS, '| ' + $scope.row.aggLabelFilter);
                        } else {
                            html = html.replace(CUSTOM_FILTERS, "");
                        }
                    } else {
                        html = $scope.$parent.rowTemplate;
                    }
                    iElement.append($compile(html)($scope));
                }
            };
        }
    };
    return ngRow;
}]);
