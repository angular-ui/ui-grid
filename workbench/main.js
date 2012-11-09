/// <reference path="../plugins/ng-grid-reorderable.js" />
/// <reference path="../ng-grid-1.0.0.debug.js" />

function userController($scope) {
    var self = this;
    $scope.mySelections = [];
    $scope.mySelections2 = [];
    $scope.myData = [{name: "Moroni", age: 50, born: '350 A.D.', alive: true},
                     {name: "Tiancum", age: 47, born: '350 A.D.', alive: false},
                     {name: "Jacob", age: 27, born: '350 A.D.', alive: false},
                     {name: "Nephi", age: 29, born: '350 A.D.', alive: false},
                     {name: "Enos", age: 34, born: '350 A.D.', alive: false},
                     {name: "Ether", age: 42, born: '350 A.D.', alive: false},
                     {name: "Alma", age: 43, born: '350 A.D.', alive: true},
                     {name: "Jared", age: 21, born: '350 A.D.', alive: true}];
    $scope.gridOptions = {
        data: 'myData',
        selectedItems: $scope.mySelections,
        multiSelect: true,
        plugins: [new ngGridReorderable()],
        columnDefs: [{ field: 'name', displayName: 'Very Long Name Title', width: 200, cellTemplate: '<div><input ng-model="row.entity[col.field]"/></div>'},
                     { field: 'age', width: 100, cellTemplate: '<div ng-class="{red: row.entity[col.field] > 30}"><div class="ngCellText">{{row.entity[col.field] | currency}}</div></div>'},
                     { field: 'born', width: 100 },
                     { field: 'alive', width: 100, cellTemplate: '<div ng-class="{green: row.entity[col.field], red: !row.entity[col.field] }"><div class="ngCellText">{{row.entity[col.field] | checkmark}}</div></div>' }]
    };
    $scope.myData2 = [{name: "MoroniMoroniMoroniMoroniMoroniMoroniMoroni", age: 50, born: '350 A.D.'},
                        {name: "Tiancum", age: 47, born: '350 A.D.'},
                        {name: "Jacob", age: 27, born: '350 A.D.'},
                        {name: "Nephi", age: 29, born: '350 A.D.'},
                        {name: "Enos", age: 34, born: '350 A.D.'},
                        {name: "Ether", age: 42, born: '350 A.D.'},
                        {name: "Alma", age: 43, born: '350 A.D.'},
                        {name: "Jared", age: 21, born: '350 A.D.'}];
    $scope.gridOptions2 = {
        data: $scope.myData2,
        selectedItems: $scope.mySelections2,
        multiSelect: false,
        plugins: [new ngGridReorderable()],
        columnDefs: [{ field: 'name'},
        { field: 'age'},
        { field: 'born'}]
    };
    $scope.changeData = function(){
        $scope.myData = [{name: "Moronisdgfasdgasg", age: 50, born: '350 A.D.'},
                                {name: "Tiancum", age: 47, born: '350 A.D.'},
                                {name: "Jacob", age: 27, born: '350 A.D.'},
                                {name: "Nephi", age: 29, born: '350 A.D.'},
                                {name: "Enos", age: 34, born: '350 A.D.'},
                                {name: "Ether", age: 42, born: '350 A.D.'},
                                {name: "Alma", age: 43, born: '350 A.D.'},
                                {name: "Jared", age: 21, born: '350 A.D.'},
                                {name: "Gideon", age: 35, born: '350 B.C.'},
                                {name: "Jarom", age: 22, born: '350 B.C.'},
                                {name: "Omni", age: 31, born: '350 B.C.'},
                                {name: "Mosiah", age: 68, born: '350 B.C.'},
                                {name: "Helaman", age: 56, born: '350 A.D.'},
                                {name: "Sam", age: 17, born: '400 B.C.'},
                                {name: "Laman", age: 26, born: '380 B.C.'}];
     };
    
};