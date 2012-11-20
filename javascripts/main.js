/// <reference path="../plugins/ng-grid-reorderable.js" />
/// <reference path="../ng-grid-1.0.0.debug.js" />

function userController($scope, $filter) {
    var self = this;
    $scope.mySelections = [];
    $scope.mySelections2 = [];
    $scope.myData = [{ name: "Moroni", allowance: 50, birthday: 1351728000000, paid: true },
                     {name: "Tiancum", allowance: 47, birthday: 1351728000000 , paid: false},
                     {name: "Jacob", allowance: 27, birthday: 1351728000000 , paid: false},
                     {name: "Nephi", allowance: 29, birthday: 1351728000000 , paid: false},
                     {name: "Enos", allowance: 34, birthday: 1351728000000 , paid: false},
                     {name: "Ether", allowance: 42, birthday: 1288323623006 , paid: false},
                     {name: "Alma", allowance: 43, birthday: 1288323623006 , paid: true},
                     {name: "Jared", allowance: 21, birthday: 1288323623006 , paid: true}];
					 
	$scope.filteredData = self.myData;
					 
	$scope.filterData = function(){
	    $scope.filteredData = $filter('filter')($scope.myData, $scope.searchText);
	};
	
	$scope.$watch('searchText', function(){
		$scope.filterData();
	    self.apply();
	});
	 
    $scope.gridOptions = {
		data: 'filteredData',
        selectedItems: $scope.mySelections,
        multiSelect: true,
        showColumnMenu: true,
        columnDefs: [{ field: 'name', displayName: 'Very Long Name Title', width: 200 },
                     { field: 'allowance', width: 100, cellFilter: 'currency' },
                     { field: 'birthday', width: 100, cellFilter: 'date' },
                     { field: 'paid', width: 100, cellFilter: 'checkmark' }]
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
        showColumnMenu: true,
        columnDefs: [{ field: 'Sku', displayName: 'My Sku', width: 'auto'}, 
                     { field: 'Vendor', displayName: 'Supplier', width: 120 },
                     { field: 'SeasonCode', displayName: 'My SeasonCode', width: 140, cellTemplate: '<input style="width:100%;height:100%;" class="ui-widget input" type="text" ng-readonly="!row.selected" ng-model="row.entity[col.field]"/>' }, 
                     { field: 'Mfg_Id', displayName: 'Manufacturer ID', width: 180 }, 
                     { field: 'UPC', displayName: 'Bar Code', width: "*" }],
    };
    $scope.changeData = function(){
        $scope.myData2 = window.getTestData();
        $scope.myData = largeLoad();
        self.apply();
    };
    self.apply = function() {
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
};