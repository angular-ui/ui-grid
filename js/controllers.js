'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

	.controller('PageNavigationCtrl', ['$scope', 'PageNavigationService', 'HelperMethodsService', function($scope, PageNavigationService, HelperMethodsService) {  
		HelperMethodsService.serviceDataLoader(PageNavigationService, function(data){
			$scope.pageTabs = data;
		});
		
		$scope.switchPage = function(indx){
			$scope.selectedPage = $scope.pageTabs[indx];
		}
	}])

	.controller('OverviewPageCtrl', ['$scope', function($scope) {	
		$scope.switchPage(0);
	}])
	
	.controller('ApiPageCtrl', ['$scope', 'GridOptionsService', 'ColumnDefsOptionsService', 'HelperMethodsService',  function($scope, GridOptionsService, ColumnDefsOptionsService , HelperMethodsService){
		HelperMethodsService.serviceDataLoader(GridOptionsService, function(data){
			$scope.gridOptionsData = data;
		});
		HelperMethodsService.serviceDataLoader(ColumnDefsOptionsService, function(data){
			$scope.columnDefsOptionsData = data;
		});
		$scope.test = "testing";
		$scope.switchPage(1);	
	}])

	.controller('GettingStartedPageCtrl', ['$scope', function($scope) {
		prettyPrint();
		$scope.switchPage(2);
		$scope.myData = [{name: "Moroni", age: 50},
						 {name: "Tiancum", age: 43},
						 {name: "Jacob", age: 27},
						 {name: "Nephi", age: 29},
						 {name: "Enos", age: 34}];
		$scope.gridOptions = { data: 'myData' };
	}])

	.controller('ExamplesPageCtrl', ['$scope', function($scope) {
		$scope.switchPage(3);
	}])	;
