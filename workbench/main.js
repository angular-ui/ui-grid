/// <reference path="../plugins/ng-grid-reorderable.js" />
/// <reference path="../ng-grid-1.0.0.debug.js" />
function userController($scope) {
    var self = this;
    $scope.mySelections = [];
    $scope.mySelections2 = [];
    $scope.myData = [];
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: false,
    };
    $scope.pagingOptions = {
        pageSizes: [250, 500, 1000], //page Sizes
        pageSize: 250, //Size of Paging data
        totalServerItems: 0, //how many items are on the server (for paging)
        currentPage: 1 //what page they are currently on
    };
    self.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            self.gettingData = true;
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
                data = largeLoad().filter(function (item) {
                    return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                });
            } else {
                data = largeLoad();
            }
            var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
            $scope.pagingOptions.totalServerItems = data.length;
            $scope.myData = pagedData;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
            self.gettingData = false;
        }, 100);
    };
    $scope.$watch('pagingOptions', function () {
        if (!self.poInit || self.gettingData) {
            self.poInit = true;
            return;
        } 
        self.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
    }, true);
    $scope.$watch('filterOptions', function () {
        if (!self.foInit || self.gettingData) {
            self.foInit = true;
            return;
        }
        self.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
    }, true);
    self.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    $scope.myDefs = [{ field: 'name', displayName: 'Very Long Name Title', sortable: false, headerClass: 'foo' },
        { field: 'allowance', aggLabelFilter: 'currency', cellTemplate: 'partials/cellTemplate.html' },
        { field: 'birthday', cellFilter: 'date', resizable: false },
        { field: 'paid', cellFilter: 'checkmark' }];
    $scope.myDefs2 = [{ field: 'Sku', displayName: 'My Sku' },
        { field: 'Vendor', displayName: 'Supplier' },
        { field: 'SeasonCode', displayName: 'My SeasonCode', cellTemplate: '<input style="width:100%;height:100%;" class="ui-widget input" type="text" ng-readonly="!row.selected" ng-model="row.entity[col.field]"/>' },
        { field: 'Mfg_Id', displayName: 'Manufacturer ID' },
        { field: 'UPC', displayName: 'Bar Code' }];
    self.selectionchanging = function (a, b) {
        return true;
    };
    $scope.gridOptions = {
        data: 'myData',
        selectedItems: $scope.mySelections2,
        beforeSelectionChange: self.selectionchanging,
        pagingOptions: $scope.pagingOptions,
        enablePaging: true,
        canSelectRows: true,
        enableRowReordering: true,
        showGroupPanel: true,
        columnDefs: 'myDefs'
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
        beforeSelectionChange: self.selectionchanging,
        multiSelect: false,
		canSelectRows: true,
        enableRowReordering: true,
        showGroupPanel: true,
        columnDefs: 'myDefs2'
    };
    $scope.changeData = function () {
        $scope.myData2.pop();
    };
    $scope.changeLang = function () {
        $scope.gridOptions.i18n = 'ge';
    };
    $scope.spliceData = function () {
        var temp = $scope.myData2;
        temp.splice(0, 0, { 'Sku': 'Y-1914652', 'Vendor': 'LEVI', 'SeasonCode': '5553', 'Mfg_Id': '80-9194110', 'UPC': '433360049369' });
        $scope.myData2 = temp;
    };
    $scope.resetData = function () {
        $scope.myData2 = [{ 'Sku': 'C-2820164', 'Vendor': 'NEWB', 'SeasonCode': null, 'Mfg_Id': '573-9880954', 'UPC': '822860449228' },
                      { 'Sku': 'J-8555462', 'Vendor': 'NIKE', 'SeasonCode': '', 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
                      { 'Sku': 'K-5312708', 'Vendor': 'REEB', 'SeasonCode': '1293', 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
                      { 'Sku': 'W-4295255', 'Vendor': 'REEB', 'SeasonCode': '6283', 'Mfg_Id': '861-4929378', 'UPC': '644134774391' },
                      { 'Sku': 'X-9829445', 'Vendor': 'DOCK', 'SeasonCode': '6670', 'Mfg_Id': '298-5235913', 'UPC': '872941679110' },
                      { 'Sku': 'H-2415929', 'Vendor': 'REEB', 'SeasonCode': '3884', 'Mfg_Id': '615-8231520', 'UPC': '310547300561' },
                      { 'Sku': 'X-2718366', 'Vendor': 'MERR', 'SeasonCode': '4054', 'Mfg_Id': '920-2961971', 'UPC': '157891269493' },
                      { 'Sku': 'Q-1505237', 'Vendor': 'AX', 'SeasonCode': '9145', 'Mfg_Id': '371-6918101', 'UPC': '553657492213' },
                      { 'Sku': 'M-1626429', 'Vendor': 'REEB', 'SeasonCode': '1846', 'Mfg_Id': '242-5856618', 'UPC': '029388467459' },
                      { 'Sku': 'Y-1914652', 'Vendor': 'LEVI', 'SeasonCode': '5553', 'Mfg_Id': '80-9194110', 'UPC': '433360049369' }];;
    };
	$scope.modifyData = function(){
		$scope.myData2[0].Vendor = "HELLO";
	};
    
};