/// <reference path="../templates/aggregateTemplate.js" />
/// <reference path="../namespace.js" />
ngGridDirectives.directive('ngRow', function ($compile) {
    var ngRow = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    var html;
                    if ($scope.row.isAggRow) {
                        html = '<div ng-click="row.toggleExpand()" class="{{row.aggClass()}}"><span style="position: absolute; left: {{row.offsetleft}}px;">{{row.label}}</span></div>';
                    } else {
                        html = $scope.$parent.rowTemplate();
                    }
                    iElement.append($compile(html)($scope));
                }
            };
        }
    };
    return ngRow;
});