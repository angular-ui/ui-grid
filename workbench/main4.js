function userController($scope) {
	$scope.myDefs = [{ field: 'Vendor', displayName: 'Supplier', cellTemplate: '<button ng-click="switchUser(row.entity)">test</button>' },
        { field: 'SeasonCode', displayName: 'My SeasonCode' },
        { field: 'Mfg_Id', displayName: 'Manufacturer ID' },
        { field: 'UPC', displayName: 'Bar Code' }];
		
	$scope.selections = [];
	
	$scope.switchUser = function(row){
		console.log(row);
		row.updated = true;
	};
	
	$scope.gridOptions = {
        data: 'myData',
        selectedItems: $scope.selections,
		enableRowSelection: true,
		multiSelect: false,
        enableRowReordering: false,
        showGroupPanel: true,
        columnDefs: 'myDefs',
        showColumnMenu: true,
        enableColumnReordering: true,
        enableColumnResize:true,
        showFooter: true,
        showFilter: true,
        filterOptions: {filterText:'573', useExternalFilter: false}
    };
	
		$scope.myData = [{ 'Sku': 'C-', 'Vendor': 'NEWB', 'SeasonCode': false, 'Mfg_Id': '573-', 'UPC': '' },
						  { 'Sku': 'J-', 'Vendor': 'NIKE', 'SeasonCode': false, 'Mfg_Id': '-', 'UPC': '' },
						  { 'Sku': 'K-', 'Vendor': 'REEB', 'SeasonCode': true, 'Mfg_Id': '355-', 'UPC': '' },
						  { 'Sku': 'J-', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '-8855467', 'UPC': '' },
						  { 'Sku': 'K-', 'Vendor': 'REEB', 'SeasonCode': true, 'Mfg_Id': '355-', 'UPC': '' },
						  { 'Sku': 'J-', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '-', 'UPC': '' }];
					  
	
}