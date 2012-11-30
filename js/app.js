'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.services', 'myApp.controllers', 'ngGrid']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/applications', {templateUrl: 'partials/overviewPage.html', controller: 'OverviewPageCtrl'});
    $routeProvider.when('/gettingstarted', {templateUrl: 'partials/gettingStartedPage.html', controller: 'GettingStartedPageCtrl'});
    $routeProvider.when('/examples', {templateUrl: 'partials/gettingStartedPage.html', controller: 'ExamplesPageCtrl'});
    $routeProvider.otherwise({redirectTo: '/applications'});
  }]);
