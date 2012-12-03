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
		$scope.plunker = "http://plnkr.co/edit/T6qaQX";
		$scope.gridTitle = "Basic Example";
		$scope.gridDescription = "Below is a basic example on how to use ng-grid:";		
		$scope.myData = [{name: "Moroni", age: 50},
						 {name: "Tiancum", age: 43},
						 {name: "Jacob", age: 27},
						 {name: "Nephi", age: 29},
						 {name: "Enos", age: 34}];
		$scope.gridOptions = { data: 'myData' };
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