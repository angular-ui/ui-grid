/// <reference path="../plugins/ng-grid-reorderable.js" />
/// <reference path="../ng-grid-1.0.0.debug.js" />

function userController($scope, $filter) {
    var self = this;
    $scope.mySelections = [];
    $scope.mySelections2 = [];
    $scope.myData = [{name: "Moroni", allowance: 50, birthday: 1351728000000 , paid: true},
                     {name: "Tiancum", allowance: 47, birthday: 1351728000000 , paid: false},
                     {name: "Jacob", allowance: 27, birthday: 1351728000000 , paid: false},
                     {name: "Nephi", allowance: 29, birthday: 1351728000000 , paid: false},
                     {name: "Enos", allowance: 34, birthday: 1351728000000 , paid: false},
                     {name: "Ether", allowance: 42, birthday: 1288323623006 , paid: false},
                     {name: "Alma", allowance: 43, birthday: 1288323623006 , paid: true},
                     {name: "Jared", allowance: 21, birthday: 1288323623006 , paid: true}];
					 
	$scope.filteredData = self.myData;
					 
	$scope.filterData = function(){
		$scope.filteredData = $filter('filter')(self.myData, $scope.searchText);
	};
	
	$scope.$watch('searchText', function(){
		$scope.filterData();
		if(!$scope.$$phase) {
			$scope.$apply();
		}
	});
	 
    $scope.gridOptions = {
		data: 'myData',
		jqueryUITheme: false,
        selectedItems: $scope.mySelections,
        displaySelectionCheckbox: false,
        multiSelect: true,
		watchDataItems: true,
        plugins: [new ngGridReorderable()],
        columnDefs: [{ field: 'name', displayName: 'Very Long Name Title', width: 200, cellTemplate: '<input class="ui-widget input" style="width:100%;height:100%;" ng-model="row.entity[col.field]" />'},
                     { field: 'allowance', width: 100, cellTemplate: '<div ng-class="{red: row.entity[col.field] > 30}"><div class="ngCellText">{{row.entity[col.field] | currency}}</div></div>'},
                     { field: 'birthday', width: 100, cellTemplate: '<div class="ngCellText">{{row.entity[col.field] | date}}</div>' },
                     { field: 'paid', width: 100, cellTemplate: '<div ng-class="{green: row.entity[col.field], red: !row.entity[col.field] }"><div class="ngCellText">{{row.entity[col.field] | checkmark}}</div></div>' }]
    };
    $scope.myData2 = window.getTestData();
    $scope.gridOptions2 = {
		data: 'myData2',
        selectedItems: $scope.mySelections2,
        multiSelect: false,
		watchDataItems: true,
        columnDefs: [{ field: 'Sku', displayName: 'My Sku', width: 'auto'}, 
                     { field: 'Vendor', displayName: 'Supplier', width: 120 },
                     { field: 'SeasonCode', displayName: 'My SeasonCode', width: 140, cellTemplate: '<input style="width:100%;height:100%;" class="ui-widget input" type="text" ng-readonly="!row.selected" ng-model="row.entity[col.field]"/>' }, 
                     { field: 'Mfg_Id', displayName: 'Manufacturer ID', width: 180 }, 
                     { field: 'UPC', displayName: 'Bar Code', width: "*" }],
        plugins: [new ngGridReorderable()]
    };
    $scope.changeData = function(){
        $scope.myData2 = window.getTestData();
        $scope.myData = largeLoad();
     };
	 
	$scope.changingData = function(){
		$scope.myData2[0].Vendor = "Hello";
	};   
};