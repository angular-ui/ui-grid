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
		
		$scope.chooseTemplate = function() {
			return $scope.selectedApplication == undefined ? "partials/welcome.html" : "partials/application.html";
		}
	}])

	.controller('GettingStartedPageCtrl', ['$scope', function($scope) {
		prettyPrint();
		$scope.switchPage(1);
		$scope.myData = [{name: "Moroni", age: 50},
						 {name: "Tiancum", age: 43},
						 {name: "Jacob", age: 27},
						 {name: "Nephi", age: 29},
						 {name: "Enos", age: 34}];
		$scope.gridOptions = { data: 'myData' };
	}])

	.controller('ExamplesPageCtrl', ['$scope', function($scope) {
		$scope.switchPage(2);
	}]);
