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
    $scope.gridOptions = { data : $scope.myData };
}