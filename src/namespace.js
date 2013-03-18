window.ngGrid = {};
window.ngGrid.i18n = {};

// Declare app level module which depends on filters, and services
var ngGridServices = angular.module('ngGrid.services', []);
var ngGridDirectives = angular.module('ngGrid.directives', []);
var ngGridFilters = angular.module('ngGrid.filters', []);
// initialization of services into the main module
angular.module('ngGrid', ['ngGrid.services', 'ngGrid.directives', 'ngGrid.filters']);