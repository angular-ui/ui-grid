/// <reference path="../plugins/ng-grid-reorderable.js" />
/// <reference path="../ng-grid-1.0.0.debug.js" />

function userController($scope) {
    var self = this;
    $scope.mySelections = [];
    $scope.mySelections2 = [];
    $scope.myData = largeLoad();
    $scope.gridOptions = {
		data: 'myData',
		jqueryUITheme: false,
		jqueryUIDraggable: false,
        selectedItems: $scope.mySelections,
        displaySelectionCheckbox: false,
        multiSelect: true,
		showGroupPanel: true,
        columnDefs: [{ field: 'name', displayName: 'Very Long Name Title', width: 200, cellTemplate: '<input class="ui-widget input" style="width:100%;height:100%;" ng-model="row.entity[col.field]" />'},
                     { field: 'allowance', width: 100, aggLabelFilter: 'currency', cellTemplate: '<div ng-class="{red: row.entity[col.field] > 30}"><div class="ngCellText">{{row.entity[col.field] | currency}}</div></div>' },
                     { field: 'birthday', width: '120px', aggLabelFilter: 'date', cellTemplate: '<div class="ngCellText">{{row.entity[col.field] | date}}</div>' },
                     { field: 'paid', width: 100, aggLabelFilter: 'checkmark', cellTemplate: '<div ng-class="{green: row.entity[col.field], red: !row.entity[col.field] }"><div class="ngCellText">{{row.entity[col.field] | checkmark}}</div></div>' }]
    };
};