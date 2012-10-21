function userController($scope) {
    $scope.myData = [{name: "Moroni", age: 50},
                     {name: "Tiancum", age: 47},
                     {name: "Jacob", age: 27},
                     {name: "Nephi", age: 29},
                     {name: "Enos", age: 34},
                     {name: "Ether", age: 42},
                     {name: "Alma", age: 43},
                     {name: "Jared", age: 21},
                     {name: "Gideon", age: 35},
                     {name: "Jarom", age: 22},
                     {name: "Omni", age: 31},
                     {name: "Mosiah", age: 68},
                     {name: "Helaman", age: 56},
                     {name: "Sam", age: 17},
                     {name: "Laman", age: 26},
                     {name: "Lemuel", age: 26}];
    $scope.$root.gridOptions = {
        data: $scope.myData,
        enablePaging: true,
        selectedItems: $scope.mySelection,
        multiSelect: false
    };
    $scope.mySelection = [];
};