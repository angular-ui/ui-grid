/// <reference path="../lib/jquery-1.8.2.min" />
/// <reference path="../lib/angular.js" />
/// <reference path="../src/constants.js"/>
/// <reference path="../src/namespace.js" />
/// <reference path="../src/navigation.js"/>
/// <reference path="../src/utils.js"/>

// initialization of services intot he main module
angular.module('ngGrid', ['ngGrid.filters', 'ngGrid.services', 'ngGrid.directives']).
    run(function(FilerService, GridService, RowService, SelectionService, SortService, TemplateService){
        return null;
    });