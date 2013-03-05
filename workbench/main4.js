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
        columnDefs: 'myDefs'
    };
	
		$scope.myData = [{ 'Sku': 'C-2820164', 'Vendor': 'NEWB', 'SeasonCode': 0, 'Mfg_Id': '573-9880954', 'UPC': '822860449228' },
						  { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
						  { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': 04, 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
						  { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
						  { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': 04, 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
						  { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
						  { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': 04, 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
						  { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
						  { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': 04, 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
						  { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
						  { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': 04, 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
						  { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
						  { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': 04, 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
						  { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
						  { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': 04, 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
						  { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
						  { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': 04, 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
						  { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
						  { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': 04, 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
						  { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
						  { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': 04, 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
						  { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': 0, 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
						  { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': 04, 'Mfg_Id': '355-6906843', 'UPC': '229487568922' }];
					  
	
}