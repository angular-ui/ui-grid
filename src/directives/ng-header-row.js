ngGridDirectives.directive('ngHeaderRow', ['$compile', function($compile) {
    var ngHeaderRow = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    if (iElement.children().length == 0) {
                        if ($scope.headerRowTemplate.then) {
                            $scope.headerRowTemplate.then(function (resp) {
                                iElement.html(resp.data);
                                $compile(iElement.children())($scope);
                            });
                        } else {
                            iElement.html($scope.headerRowTemplate);
                            $compile(iElement.children())($scope);
                        }
                    }
                }
            };
        }
    };
    return ngHeaderRow;
}]);