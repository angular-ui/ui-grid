/// <reference path="../templates/footerTemplate.js" />
/// <reference path="../templates/gridTemplate.js" />
/// <reference path="../templates/headerCellTemplate.js" />
/// <reference path="../templates/headerTemplate.js" />
/// <reference path="../templates/rowTemplate.js" />
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

ngGridServices.factory('TemplateService', ['$rootScope', function ($scope) {
    var templateService = {};
	$scope._templateService = {};
    
    $scope._templateService.templateCache = {};
    $scope._templateService.templateCache[GRID_TEMPLATE] = ng.templates.defaultGridInnerTemplate();
    templateService.AddTemplate = function (templateText, tmplId) {
        $scope._templateService.templateCache[tmplId] = templateText;
    };

    templateService.RemoveTemplate = function (tmplId){
        delete $scope._templateService.templateCache[tmplId];
    };

    templateService.AddTemplateSafe = function (tmplId, templateTextAccessor) {
        if (!$scope._templateService.templateCache[tmplId]) {
            templateService.AddTemplate(templateTextAccessor(), tmplId);
        }
    };

    templateService.EnsureGridTemplates = function (options) {
        var defaults = {
            rowTemplate: '',
            headerTemplate: '',
            headerCellTemplate: '',
            footerTemplate: '',
            columns: null,
            showFilter: true
        },
        config = $.extend(defaults, options);
        
        //first ensure the grid template!
        templateService.AddTemplateSafe(GRID_TEMPLATE, function () {
            return ng.templates.defaultGridInnerTemplate(config);
        });
        
        //header row template
        if (config.headerTemplate) {
            templateService.AddTemplateSafe(config.headerTemplate, function () {
                return ng.templates.generateHeaderTemplate(config);
            });
        }
        
        //header cell template
        if (config.headerCellTemplate) {
            templateService.AddTemplateSafe(config.headerCellTemplate, function () {
                return ng.templates.defaultHeaderCellTemplate(config);
            });
        }
        
        //row template
        if (config.rowTemplate) {
            templateService.AddTemplateSafe(config.rowTemplate, function () {
                return ng.templates.generateRowTemplate(config);
            });
        }
    };

    templateService.GetTemplateText = function(tmplId) {
        var ret = $scope._templateService.templateCache[tmplId] || "";
        return ret;
    };
    return templateService;
}]);