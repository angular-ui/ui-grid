/// <reference path="../plugins/ng-grid-reorderable.js" />
/// <reference path="../ng-grid-1.0.0.debug.js" />

function userController($scope) {
    $scope.mySelections = [];
    $scope.mySelections2 = [];
    $scope.myData = largeLoad();
    $scope.gridOptions = {
		data: 'myData',
		jqueryUITheme: false,
        selectedItems: $scope.mySelections,
        displaySelectionCheckbox: false,
        multiSelect: true,
        showColumnMenu: true,
        showFilter: true,
        columnDefs: [{ field: 'name', displayName: 'Very Long Name Title', width: 200 },
                     { field: 'allowance', width: 100, cellFilter: 'currency' },
                     { field: 'birthday', width: 100, cellFilter: 'date' },
                     { field: 'paid', width: 100, cellFilter: 'checkmark' }]
    };
};