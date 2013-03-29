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
    var testData = [{ name: "Moroni", age: 50, id: 101 },
             { name: "Tiancum", age: 43, id: 102 },
             { name: "Jacob", age: 27, id: 103 },
             { name: "Nephi", age: 29, id: 104 },
             { name: "Enos", age: 34, id: 105 }];
    self.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            self.gettingData = true;
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
                data = testData.filter(function (item) {
                    return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                });
            } else {
                data = testData;
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
    $scope.myDefs = [{ field: 'name', displayName: 'Very Long Name Title', headerClass: 'foo', editableCellTemplate: '<div ng-click="doStuff($event)" style="width:100%;height:100%;" ><select  style="width:100%;height:100%;" class="ui-widget input" type="text" ng-model="row.entity.name"><option ng-repeat="opt in dropDownOpts">{{opt}}</option></select></div>' },
        { field: 'allowance', aggLabelFilter: 'currency' },
        { field: 'birthday', cellFilter: "date:'yyyy-MM-dd HH:mm:ss'", resizable: false },
        { field: 'paid', cellFilter: 'checkmark', },
        { field: 'sdaf', displayName: 'sadfasdfasdfasd', headerClass: 'foo', visible: false },
        { field: 'asdf', aggLabelFilter: 'currency', },
        { field: 'asdgasg', cellFilter: 'date', resizable: false, visible: false },
        { field: 'asgdasga', cellFilter: 'checkmark' },
        { field: 'asgasgadf', displayName: 'asgasgadf', headerClass: 'foo', visible: false },
        { field: 'asdgasgasgagsd', aggLabelFilter: 'currency', visible: false },
        { field: 'asdasdgasdg', cellFilter: 'date', resizable: false, visible: false },
        { field: 'sadfasdfasdfasd', cellFilter: 'checkmark', }];
    var myplugin = {
        init: function(scope, grid) {
            myplugin.scope = scope;
            myplugin.grid = grid;
            $scope.$watch(function () {
                var searchQuery = "";
                angular.forEach(myplugin.scope.columns, function (col) {
                    if (col.filterText) {
                        searchQuery += col.field + ": " + col.filterText + "; ";
                    }
                });
                return searchQuery;
            }, function (searchQuery) {
                myplugin.scope.$parent.filterText = searchQuery;
                myplugin.grid.searchProvider.evalFilter();
            });
        },
        scope: undefined,
        grid: undefined,
    };

    $scope.myDefs2 = [{ field: 'Sku', displayName: 'My Sku', enableCellEdit: true },
        { field: 'Vendor', displayName: 'Supplier', enableCellEdit: true },
        { field: 'SeasonCode', displayName: 'My SeasonCode', enableCellEdit: true },
        { field: 'Mfg_Id', displayName: 'Manufacturer ID', enableCellEdit: true },
        { field: 'UPC', displayName: 'Bar Code', enableCellEdit: true }];
    self.selectionchanging = function (a, b) {
        return true;
    };

    $scope.gridOptions = {
        data: 'myData',
        enableColumnResize: true,
        enableColumnReordering: true,
        selectedItems: $scope.mySelections,
        headerRowHeight: 40,
        pagingOptions: $scope.pagingOptions,
		enablePaging: true,
		enableRowSelection: true,
		multiSelect: false,
        enableRowReordering: false,
		enablePinning: true,
		showGroupPanel: true,
		showFooter: false,
		showFilter: true,
		enableCellEdit: true,
        enableCellSelection: true,
		showSelectionCheckbox: true,
        selectWithCheckboxOnly: true,
        showColumnMenu: true,
        maintainColumnRatios: true,
        columnDefs: 'myDefs',
        primaryKey: 'id',
        sortInfo: {fields:['name'], directions:['asc'] },
    };
    $scope.doStuff = function (evt) {
        var elm = angular.element(evt.currentTarget.parentNode);
        elm.on('change', function() {
            var scope = elm.scope();
            scope.$parent.isFocused = false;
        });
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
        showGroupPanel: true,
        showFilter: true,
        multiSelect: true,
        columnDefs: 'myDefs2',
        enablePinning: true,
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


	$scope.myData3 = [{ 'Sku': 'C-2820164', 'Vendor': {'name':'NIKE'}, 'SeasonCode': null, 'Mfg_Id': '573-9880954', 'UPC': '822860449228' },
				  { 'Sku': 'J-8555462', 'Vendor': {'name':'NIKE'}, 'SeasonCode': '', 'Mfg_Id': '780-8855467', 'UPC': '043208523549' },
				  { 'Sku': 'K-5312708', 'Vendor': {'name':'NIKE'}, 'SeasonCode': '1293', 'Mfg_Id': '355-6906843', 'UPC': '229487568922' },
				  { 'Sku': 'W-4295255', 'Vendor': {'name':'NIKE'}, 'SeasonCode': '6283', 'Mfg_Id': '861-4929378', 'UPC': '644134774391' },
				  { 'Sku': 'X-9829445', 'Vendor': {'name':'NIKE'}, 'SeasonCode': '6670', 'Mfg_Id': '298-5235913', 'UPC': '872941679110' },
				  { 'Sku': 'H-2415929', 'Vendor': {'name':'REEB'}, 'SeasonCode': '3884', 'Mfg_Id': '615-8231520', 'UPC': '310547300561' },
				  { 'Sku': 'X-2718366', 'Vendor': {'name':'REEB'}, 'SeasonCode': '4054', 'Mfg_Id': '920-2961971', 'UPC': '157891269493' },
				  { 'Sku': 'Q-1505237', 'Vendor': {'name':'REEB'}, 'SeasonCode': '9145', 'Mfg_Id': '371-6918101', 'UPC': '553657492213' },
				  { 'Sku': 'M-1626429', 'Vendor': {'name':'REEB'}, 'SeasonCode': '1846', 'Mfg_Id': '242-5856618', 'UPC': '029388467459' },
				  { 'Sku': 'Y-1914652', 'Vendor': {'name':'REEB'}, 'SeasonCode': '5553', 'Mfg_Id': '80-9194110', 'UPC': '433360049369' }];
				  
    $scope.myDefs3 = [{ field: 'Sku', displayName: 'My Sku' },
        { field: 'Vendor.name', displayName: 'Supplier', cellFilter: 'branding' },
        { field: 'SeasonCode', displayName: 'My SeasonCode', cellTemplate: '<input style="width:100%;height:100%;" class="ui-widget input" type="text" ng-readonly="!row.selected" ng-model="row.entity[col.field]"/>' },
        { field: 'Mfg_Id', displayName: 'Manufacturer ID' },
        { field: 'UPC', displayName: 'Bar Code' }];
		
	$scope.filteringText = '';
    $scope.gridOptions3 = {
        data: 'myData3',
        multiSelect: false,
		filterOptions: {filterText:'filteringText', useExternalFilter: false},
        columnDefs: 'myDefs3'
    };
	
	$scope.$on('filterChanged', function(evt, text){
		$scope.filteringText = text;
	});
    $scope.setSelection = function() {
        $scope.gridOptions2.selectRow(0, true);
    };
    $scope.dropDownOpts = ['editing', 'is', 'impossibru?'];
};