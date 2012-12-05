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

angular.module('myApp.exampleControllers', [])

.controller('BasicExampleCtrl', ['$scope', function($scope) {
		$scope.basicTabs = tabs;
		$scope.selectedBasicTab = $scope.basicTabs[0];		
		$scope.switchTab = function(tab){
			$scope.selectedBasicTab = $scope.basicTabs[tab];
		};				
		$scope.link = function(){ return "partials/exampleDefinitions/basic/basic" + $scope.selectedBasicTab.title + '.html';};
		$scope.myData = [{name: "Moroni", age: 50},
						 {name: "Tiancum", age: 43},
						 {name: "Jacob", age: 27},
						 {name: "Nephi", age: 29},
						 {name: "Enos", age: 34}];
		$scope.gridOptions = { data: 'myData' };
	}])
	
.controller('ColumnDefsExampleCtrl', ['$scope', function($scope) {
		$scope.basicTabs = tabs;
		$scope.selectedBasicTab = $scope.basicTabs[0];		
		$scope.switchTab = function(tab){
			$scope.selectedBasicTab = $scope.basicTabs[tab];
		};				
		$scope.link = function(){ return "partials/exampleDefinitions/columnDefs/columnDefs" + $scope.selectedBasicTab.title + '.html';};
		$scope.myData = [{name: "Moroni", age: 50},
						 {name: "Tiancum", age: 43},
						 {name: "Jacob", age: 27},
						 {name: "Nephi", age: 29},
						 {name: "Enos", age: 34}];
		$scope.gridOptions = { 
			data: 'myData',
			columnDefs: [{field: 'name', displayName: 'Name'}, {field:'age', displayName:'Age'}]
		};
	}])
	
.controller('GroupingExampleCtrl', ['$scope', function($scope) {
		$scope.basicTabs = tabs;
		$scope.selectedBasicTab = $scope.basicTabs[0];		
		$scope.switchTab = function(tab){
			$scope.selectedBasicTab = $scope.basicTabs[tab];
		};				
		$scope.link = function(){ return "partials/exampleDefinitions/grouping/grouping" + $scope.selectedBasicTab.title + '.html';};	
		$scope.basicTabs2 = tabs;
		$scope.selectedBasicTab2 = $scope.basicTabs2[0];		
		$scope.switchTab2 = function(tab){
			$scope.selectedBasicTab2 = $scope.basicTabs2[tab];
		};				
		$scope.link2 = function(){ return "partials/exampleDefinitions/grouping/grouping" + $scope.selectedBasicTab2.title + '2.html';};	
		$scope.myData = [{name: "Moroni", age: 50},
						 {name: "Tiancum", age: 43},
						 {name: "Jacob", age: 27},
						 {name: "Nephi", age: 29},
						 {name: "Enos", age: 34}];
	    $scope.myData2 = [{name: "Moroni", age: 50},
						 {name: "Tiancum", age: 43},
						 {name: "Jacob", age: 27},
						 {name: "Nephi", age: 29},
						 {name: "Enos", age: 34}];
		$scope.gridOptions = { 
			data: 'myData',	
			showGroupPanel: true
		};
		$scope.gridOptions2 = { 
			data: 'myData2',	
			showGroupPanel: true,
			jqueryUIDraggable: true
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
	$scope.myData = [{name: "Moroni", age: 50},
					 {name: "Tiancum", age: 43},
					 {name: "Jacob", age: 27},
					 {name: "Nephi", age: 29},
					 {name: "Enos", age: 34}];
	$scope.gridOptions = { 
		data: 'myData',	
        selectedItems: $scope.mySelections,
		multiSelect: false
	};
}]);