'use strict';

/* Controllers */

angular.module('myApp.controllers', [])	
	.controller('ApiPageCtrl', ['$scope', 'GridOptionsService', 'ColumnDefsOptionsService', 'HelperMethodsService',  function($scope, GridOptionsService, ColumnDefsOptionsService , HelperMethodsService){
		HelperMethodsService.serviceDataLoader(GridOptionsService, function(data){
			$scope.gridOptionsData = data;
		});
		HelperMethodsService.serviceDataLoader(ColumnDefsOptionsService, function(data){
			$scope.columnDefsOptionsData = data;
		});
	}])

	.controller('GettingStartedPageCtrl', ['$scope', function($scope) {
		prettyPrint();
		$scope.myData = [{name: "Moroni", age: 50},
						 {name: "Tiancum", age: 43},
						 {name: "Jacob", age: 27},
						 {name: "Nephi", age: 29},
						 {name: "Enos", age: 34}];
		$scope.gridOptions = { data: 'myData' };
	}]);
