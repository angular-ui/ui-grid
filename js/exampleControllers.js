var tabs = [{
				index: 0,
				title: "HTML"
			},
			{			
				index: 1,
				title: "CSS"
			},
			{
				index: 2,
				title: "JS"
			}];
			
var gridData = [{name: "Moroni", age: 50},
						 {name: "Tiancum", age: 43},
						 {name: "Jacob", age: 27},
						 {name: "Nephi", age: 29},
						 {name: "Enos", age: 34}];

angular.module('myApp.exampleControllers', [])

.controller('BasicExampleCtrl', ['$scope', function($scope) {
		$scope.basicTabs = tabs;
		$scope.selectedBasicTab = $scope.basicTabs[0];		
		$scope.switchTab = function(tab){
			$scope.selectedBasicTab = $scope.basicTabs[tab];
		};				
		$scope.link = function(){ return "partials/exampleDefinitions/basic/basic" + $scope.selectedBasicTab.title + '.html';};
		$scope.myData = gridData;
		$scope.gridOptions = { data: 'myData' };
	}])
	
.controller('ColumnDefsExampleCtrl', ['$scope', function($scope) {
		$scope.basicTabs = tabs;
		$scope.selectedBasicTab = $scope.basicTabs[0];		
		$scope.switchTab = function(tab){
			$scope.selectedBasicTab = $scope.basicTabs[tab];
		};				
		$scope.link = function(){ return "partials/exampleDefinitions/columnDefs/columnDefs" + $scope.selectedBasicTab.title + '.html';};
		$scope.myData = gridData;
		$scope.gridOptions = { 
			data: 'myData',
			columnDefs: [{field: 'name', displayName: 'Name'}, {field:'age', displayName:'Age'}]
		};
	}])
	
.controller('GroupingHTML5ExampleCtrl', ['$scope', function($scope) {
		$scope.basicTabs = tabs;
		$scope.selectedBasicTab = $scope.basicTabs[0];		
		$scope.switchTab = function(tab){
			$scope.selectedBasicTab = $scope.basicTabs[tab];
		};				
		$scope.link = function(){ return "partials/exampleDefinitions/grouping/groupByHTML5/groupByHTML5" + $scope.selectedBasicTab.title + '.html';};		
		$scope.myData = gridData;
		$scope.gridOptions = { 
			data: 'myData',	
			showGroupPanel: true
		};
	}])
	
.controller('GroupingJQueryExampleCtrl', ['$scope', function($scope) {
		$scope.basicTabs = tabs;
		$scope.selectedBasicTab = $scope.basicTabs[0];		
		$scope.switchTab = function(tab){
			$scope.selectedBasicTab = $scope.basicTabs[tab];
		};				
		$scope.link = function(){ return "partials/exampleDefinitions/grouping/groupByJQueryUI/groupByJQueryUI" + $scope.selectedBasicTab.title + '.html';};		
		$scope.myData = gridData;
		$scope.gridOptions = { 
			data: 'myData',	
			showGroupPanel: true,
			jqueryUIDraggable: true
		};
	}])
	
.controller('StringCellTemplateCtrl', ['$scope', function($scope) {
		$scope.basicTabs = tabs;
		$scope.selectedBasicTab = $scope.basicTabs[0];		
		$scope.switchTab = function(tab){
			$scope.selectedBasicTab = $scope.basicTabs[tab];
		};				
		$scope.angularBindings = "{{row.getProperty(col.field)}}";
		$scope.link = function(){ return "partials/exampleDefinitions/templates/cellTemplates/stringCellTemplate/stringCellTemplate" + $scope.selectedBasicTab.title + '.html';};
		$scope.myData = gridData;
		$scope.gridOptions = { 
			data: 'myData',
			columnDefs: [{field: 'name', displayName: 'Name'},
						 {field:'age', displayName:'Age', cellTemplate: '<div ng-class="{green: row.getProperty(col.field) > 30}"><div class="ngCellText">{{row.getProperty(col.field)}}</div></div>'}]
		};
	}])

.controller('PagingExampleCtrl', ['$scope', '$http', function($scope, $http) {
	$scope.basicTabs = tabs;
	$scope.selectedBasicTab = $scope.basicTabs[0];		
	$scope.switchTab = function(tab){
		$scope.selectedBasicTab = $scope.basicTabs[tab];
	};				
	$scope.link = function(){ return "partials/exampleDefinitions/paging/paging" + $scope.selectedBasicTab.title + '.html';};

	$scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    };
    $scope.pagingOptions = {
        pageSizes: [250, 500, 1000],
        pageSize: 250,
        totalServerItems: 0,
        currentPage: 1
    };
	$scope.setPagingData = function(data, page, pageSize){	
		var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
		$scope.myData = pagedData;
		$scope.pagingOptions.totalServerItems = data.length;
		if (!$scope.$$phase) {
			$scope.$apply();
		}
	};
    $scope.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
				$http.get('jsonFiles/largeLoad.json').success(function (largeLoad) {		
					data = largeLoad.filter(function(item) {
						return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
					});
					$scope.setPagingData(data,page,pageSize);
				});            
            } else {
				$http.get('jsonFiles/largeLoad.json').success(function (largeLoad) {
					$scope.setPagingData(largeLoad,page,pageSize);
				});
            }
        }, 100);
    };
	
    $scope.myData = $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
	
    $scope.$watch('pagingOptions', function () {
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
    }, true);
    $scope.$watch('filterOptions', function () {
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
    }, true);   
	
    $scope.gridOptions = {
		data: 'myData',
        enablePaging: true,
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions
    };	
}])
	
.controller('MasterDetailExampleCtrl', ['$scope', function($scope) {
	$scope.basicTabs = tabs;
	$scope.selectedBasicTab = $scope.basicTabs[0];		
	$scope.switchTab = function(tab){
		$scope.selectedBasicTab = $scope.basicTabs[tab];
	};				
	$scope.angularBindings = "{{mySelections}}";
	$scope.link = function(){ return "partials/exampleDefinitions/masterDetail/masterDetails" + $scope.selectedBasicTab.title + '.html';};	
    $scope.mySelections = [];
	$scope.myData = gridData;
	$scope.gridOptions = { 
		data: 'myData',	
        selectedItems: $scope.mySelections,
		multiSelect: false
	};
}]);