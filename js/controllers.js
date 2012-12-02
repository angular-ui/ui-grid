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
	}])

	.controller('BasicExampleCtrl', ['$scope', function($scope) {
		$scope.basicTabs = [{
				index: 0,
				link: "partials/exampleDefinitions/basic/basicHTML.html",
				title: "HTML"
			},
			{			
				index: 1,
				link: "partials/exampleDefinitions/basic/basicCSS.html",
				title: "CSS"
			},
			{
				index: 2,
				link: "partials/exampleDefinitions/basic/basicJS.html",
				title: "JS"
			}];
		$scope.selectedBasicTab = $scope.basicTabs[0];
		
		$scope.switchTab = function(tab){
			$scope.selectedBasicTab = $scope.basicTabs[tab];
		};
	}]);
