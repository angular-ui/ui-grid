ngGridDirectives.directive('ngRow', function ($compile) {
    var ngRow = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    var html = $scope.$parent.rowTemplate();
                    iElement.append($compile(html)($scope));
                }
            };
        }
    };
    return ngRow;
});