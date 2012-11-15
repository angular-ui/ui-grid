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
		jqueryUIDraggable: true,
        selectedItems: $scope.mySelections,
        displaySelectionCheckbox: false,
        multiSelect: true,
		showGroupPanel: true,
        columnDefs: [{ field: 'name', displayName: 'Very Long Name Title', width: 'auto', cellTemplate: '<input class="ui-widget input" style="width:100%;height:100%;" ng-model="row.entity[col.field]" />'},
                     { field: 'allowance', width: 'auto', cellTemplate: '<div ng-class="{red: row.entity[col.field] > 30}"><div class="ngCellText">{{row.entity[col.field] | currency}}</div></div>' },
                     { field: 'birthday', width: '120px', cellTemplate: '<div class="ngCellText">{{row.entity[col.field] | date}}</div>' },
                     { field: 'paid', width: 100, cellTemplate: '<div ng-class="{green: row.entity[col.field], red: !row.entity[col.field] }"><div class="ngCellText">{{row.entity[col.field] | checkmark}}</div></div>' }]
    };
    $scope.myData2 = [{ 'Sku': 'C-2820164', 'Vendor': 'NEWB', 'SeasonCode': null, 'Mfg_Id': '573-9880954', 'UPC': '822860449228' },
                      { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': '', 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
                      { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': '1293', 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
                      { 'Sku': 'W-4295255', 'Vendor': 'REEB', 'SeasonCode': '6283', 'Mfg_Id': '861-4929378', 'UPC': '644134774391' },
                      { 'Sku': 'X-9829445', 'Vendor': 'DOCK', 'SeasonCode': '6670', 'Mfg_Id': '298-5235913', 'UPC': '872941679110' },
                      { 'Sku': 'H-2415929', 'Vendor': 'REEB', 'SeasonCode': '3884', 'Mfg_Id': '615-8231520', 'UPC': '310547300561' },
                      { 'Sku': 'X-2718366', 'Vendor': 'MERR', 'SeasonCode': '4054', 'Mfg_Id': '920-2961971', 'UPC': '157891269493' },
                      { 'Sku': 'Q-1505237', 'Vendor': 'AX', 'SeasonCode': '9145', 'Mfg_Id': '371-6918101', 'UPC': '553657492213' },
                      { 'Sku': 'M-1626429', 'Vendor': 'REEB', 'SeasonCode': '1846', 'Mfg_Id': '242-5856618', 'UPC': '029388467459' },
                      { 'Sku': 'Y-1914652', 'Vendor': 'LEVI', 'SeasonCode': '5553', 'Mfg_Id': '80-9194110', 'UPC': '433360049369' }];
    $scope.gridOptions2 = {
        data: 'myData2',
        selectedItems: $scope.mySelections2,
        multiSelect: false,
        columnDefs: [{ field: 'Sku', displayName: 'My Sku', width: 'auto'}, 
                     { field: 'Vendor', displayName: 'Supplier', width: '120px' },
                     { field: 'SeasonCode', displayName: 'My SeasonCode', width: 140, cellTemplate: '<input style="width:100%;height:100%;" class="ui-widget input" type="text" ng-readonly="!row.selected" ng-model="row.entity[col.field]"/>' }, 
                     { field: 'Mfg_Id', displayName: 'Manufacturer ID', width: 180 }, 
                     { field: 'UPC', displayName: 'Bar Code', width: "*" }],
        plugins: [new ngGridReorderable()]
    };
    $scope.changeData = function(){
        $scope.myData2 = window.getTestData();
        $scope.myData = largeLoad();
     };
    
};