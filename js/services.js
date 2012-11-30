'use strict';

  /*<WizardExtension>
	<Assembly>WizardImplementation, Version=0.0.0.0, Culture=neutral, PublicKeyToken=9d6441b48a95526c</Assembly>
	<FullClassName>CustomWizard.WizardImplementation</FullClassName>
  </WizardExtension>*/
/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).	
	factory('HelperMethodsService', function() {
		var HelperMethodsService = {};
	
		HelperMethodsService.serviceDataLoader = function(service, callback){
			if(service.size() == 0){
				service.loadData(function(list){
					callback(list);
				});
			} else {
				callback(service.data());
			}
		}
		
		HelperMethodsService.size = function(obj) {
			var size = 0, key;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) size++;
			}
			return size;
		}
		
		return HelperMethodsService;
	}).
	
	factory('PageNavigationService', function($http, HelperMethodsService) {
	    var PageNavigationService = {};
	    var list = {};
	    PageNavigationService.loadData = function(callback) {
		    $http.get('jsonFiles/tabs.json').success(function (data) {
				list = data;
				callback(list);
		    })
	    }
	    PageNavigationService.size = function() { return HelperMethodsService.size(list); }
	    PageNavigationService.data = function() { return list };

	    return PageNavigationService;
	});
