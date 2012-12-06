﻿/// <reference path="../templates/aggregateTemplate.js" />
/// <reference path="../namespace.js" />
ngGridDirectives.directive('ngRow', ['$compile', function ($compile) {
    var ngRow = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    if ($scope.row.isAggRow) {
                         var html = ng.aggregateTemplate();
                        if ($scope.row.aggLabelFilter) {
                            html = html.replace(CUSTOM_FILTERS, '| ' + $scope.row.aggLabelFilter);
                        } else {
                            html = html.replace(CUSTOM_FILTERS, "");
                        }
                        iElement.html(html);
                        $compile(iElement.children())($scope);
                    } else {
                        if ($scope.rowTemplate.then) {
                            $scope.rowTemplate.then(function(resp) {
                                iElement.html(resp.data);
                                $compile(iElement.children())($scope);
                            });
                        } else {
                            iElement.html($scope.rowTemplate);
                            $compile(iElement.children())($scope);
                        }
                    }
                }
            };
        }
    };
    return ngRow;
}]);
