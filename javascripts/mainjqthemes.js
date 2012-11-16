/// <reference path="../plugins/ng-grid-reorderable.js" />
/// <reference path="../ng-grid-1.0.0.debug.js" />

function userController($scope, $filter) {
    var self = this;
    $scope.mySelections = [];
    $scope.mySelections2 = [];
    self.myData = [{name: "Moroni", allowance: 50, birthday: 1351728000000 , paid: true},
                     {name: "Tiancum", allowance: 47, birthday: 1351728000000 , paid: false},
                     {name: "Jacob", allowance: 27, birthday: 1351728000000 , paid: false},
                     {name: "Nephi", allowance: 29, birthday: 1351728000000 , paid: false},
                     {name: "Enos", allowance: 34, birthday: 1351728000000 , paid: false},
                     {name: "Ether", allowance: 42, birthday: 1288323623006 , paid: false},
                     {name: "Alma", allowance: 43, birthday: 1288323623006 , paid: true},
                     {name: "Jared", allowance: 21, birthday: 1288323623006 , paid: true}];
    $scope.gridOptions = {
        data: 'myData',
        selectedItems: $scope.mySelections,
        multiSelect: true,
        jqueryUITheme: true, // enable the jqueryUIThemes
        columnDefs: [{ field: 'name', displayName: 'Very Long Name Title', width: 200 },
                     { field: 'allowance', width: 100, cellTemplate: 'currency'},
                     { field: 'birthday', width: 100, cellTemplate: 'date' },
                     { field: 'paid', width: 100, cellFilter: 'checkmark' }]
    };
};