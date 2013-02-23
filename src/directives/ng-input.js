ngGridDirectives.directive('ngInput',['$parse', function($parse) {
    return function ($scope, elm, attrs) {
        var getter = $parse(attrs.ngInput);
        $scope.$watch(getter, function (newVal) {
            elm.val($scope.$eval(newVal));
        });
        elm.bind('keyup', function() {
            var newVal = elm.val();
            if (!$scope.$root.$$phase) {
                $scope.$apply(getter($scope) + "= '" + newVal + "'");
            }
        });
    };
}]);