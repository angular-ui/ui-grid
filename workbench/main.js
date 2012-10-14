function gridController($scope) {
    $scope.myData = [{name: "Aislin", age: "4"},
                 {name: "Desmond", age: "2"},
                 {name: "Tim", age: "27"},
                 {name: "Anna", age: "29"}];
    $scope.btn_click = function(){
        $scope.myData = [{name: "Aislin", age: 4},
                         {name: "Desmond", age: 2},
                         {name: "Tim", age: 27},
                         {name: "Anna", age: 29},
                         {name: "Ethan", age: 0}];
    }
}

angular.module('ng-grid', [])
  // Register the 'myCurrentTime' directive factory method.
  // We inject $timeout and dateFilter service since the factory method is DI.
  .directive('gridOptions', function factory($timeout, dateFilter) {
    // return the directive link function. (compile function not needed)
    return function postLink(scope, tElement, tAttrs, controller) {
        scope.myData = scope.myData.splice(0,2);
        return;
    };
  });