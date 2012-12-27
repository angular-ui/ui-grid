if (!window.ng) {
    window.ng = {};
}
window.ngGrid = {};
window.ngGrid.i18n = {};
var ngGridServices = angular.module('ngGrid.services', []);
var ngGridDirectives = angular.module('ngGrid.directives', []);
var ngGridFilters = angular.module('ngGrid.filters', []);
// Declare app level module which depends on filters, and services