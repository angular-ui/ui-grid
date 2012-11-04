function gridController($scope) {
    $scope.myData = [{name: "Aislin", age: "4"},
                 {name: "Desmond", age: "2"},
                 {name: "Tim", age: "27"},
                 {name: "Anna", age: "29"}];
}

angular.module('grid', [])
  // Register the 'myCurrentTime' directive factory method.
  // We inject $timeout and dateFilter service since the factory method is DI.
  .directive('ngGrid', function($timeout, dateFilter) {
    // return the directive link function. (compile function not needed)
    return {
        compile: function compile(tElement, tAttrs, transclude) {
            return {
                pre: function preLink(scope, iElement, iAttrs, controller) {
                    return;
                },
                post: function postLink(scope, iElement, iAttrs, controller) {
                    return;
                }
            };
        },
        link: function link(scope, iElement, iAttrs) {
            return {
                pre: function preLink(scope, iElement, iAttrs, controller) {
                    return;
                },
                post: function postLink(scope, iElement, iAttrs, controller) {
                    return;
                }
            };
        }
    };
  });