/// <reference path="../templates/aggregateTemplate.js" />
/// <reference path="../namespace.js" />
ngGridDirectives.directive('ngRow', function ($compile) {
    var ngRow = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    var html;
                    if ($scope.row.hasOwnProperty('aggIndex')) {
                        html = '<div ng-click="row.toggleExpand()" class="{{row.aggClass()}}"></div>';
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