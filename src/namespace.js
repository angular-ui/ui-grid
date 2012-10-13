var ng = window['ng'] = {};
ng.templates = {};
var servicesModule = angular.module('ngGrid.services', []);
var directivesModule = angular.module('ngGrid.directives', []);
var filtersModule = angular.module('ngGrid.filters', []);
// Declare app level module which depends on filters, and services

angular.module('ngGrid', ['ngGrid.filters', 'ngGrid.services', 'ngGrid.directives'])
}]);