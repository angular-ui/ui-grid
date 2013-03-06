function userController($scope, $timeout) {
    
    $scope.myData = [{ 'Sku': 'C-2820164', 'Vendor': 'NEWB', 'SeasonCode': {'test': 'nestedObject2'}, 'Mfg_Id': '573-9880954', 'UPC': '822860449228', 'test': '822860449228' },
                      { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': {'test': 'nestedObject'}, 'Mfg_Id': '780-8855467', 'UPC': '043208523549', 'test': '822860449228' },
                      { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': {'test': 'nestedObject'}, 'Mfg_Id': '355-6906843', 'UPC': '229487568922', 'test': '822860449228' },
                      { 'Sku': 'W-4295255', 'Vendor': 'REEB', 'SeasonCode': {'test': 'nestedObject'}, 'Mfg_Id': '861-4929378', 'UPC': '644134774391', 'test': '822860449228' },
                      { 'Sku': 'X-9829445', 'Vendor': 'DOCK', 'SeasonCode': {'test': 'nestedObject2'}, 'Mfg_Id': '298-5235913', 'UPC': '872941679110', 'test': '822860449228' },
                      { 'Sku': 'H-2415929', 'Vendor': 'REEB', 'SeasonCode': {'test': 'nestedObject'}, 'Mfg_Id': '615-8231520', 'UPC': '310547300561', 'test': '822860449228' },
                      { 'Sku': 'X-2718366', 'Vendor': 'MERR', 'SeasonCode': {'test': 'nestedObject2'}, 'Mfg_Id': '920-2961971', 'UPC': '157891269493', 'test': '822860449228' },
                      { 'Sku': 'Q-1505237', 'Vendor': 'AX', 'SeasonCode': {'test': 'nestedObject'}, 'Mfg_Id': '371-6918101', 'UPC': '553657492213', 'test': '822860449228' },
                      { 'Sku': 'M-1626429', 'Vendor': 'REEB', 'SeasonCode': {'test': 'nestedObject'}, 'Mfg_Id': '242-5856618', 'UPC': '029388467459', 'test': '822860449228' },
                      { 'Sku': 'Y-1914652', 'Vendor': 'LEVI', 'SeasonCode': {'test': 'nestedObject'}, 'Mfg_Id': '80-9194110', 'UPC': '433360049369', 'test': '822860449228' }];
					  
	$scope.selections = [];
	
	$scope.gridOptions = {
        data: 'myData',
        selectedItems: $scope.selections,
		enableRowSelection: true,
		multiSelect: false,
        enableRowReordering: false,
		enableCellSelection: true,
        showGroupPanel: true,
        columnDefs: 'myDefs'
    };
	
	$scope.callMethod = function(){
		angular.forEach($scope.myData, function(item, index){
			if(typeof item == 'object' && item.hasOwnProperty('SeasonCode')){
				if(item.SeasonCode.hasOwnProperty('test') && item.SeasonCode.test == 'nestedObject2'){
					$scope.selections.push(item);
				}
			}
		});
	};
	
	$scope.changeDefs = function(){
		$scope.myDefs = [{ field: 'Sku', displayName: 'My Sku' },
			{ field: 'Vendor', displayName: 'Supplier' },
			{ field: 'SeasonCode.test', displayName: 'My SeasonCode', cellTemplate: '<input style="width:100%;height:100%;" class="ui-widget input" type="text" ng-readonly="!row.selected" ng-model="COL_FIELD"/>' },
			{ field: 'Mfg_Id', displayName: 'Manufacturer ID' },
			{ field: 'UPC', displayName: 'Bar Code' }];
	};
	
	$scope.callMethod();
	
}