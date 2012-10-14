serviceModule.factory('TemplateService', ['$scope', function($scope) {
    var TemplateService = {};
    TemplateService.TemplateExists = function (tmplId) {
        var el = document.getElementById(tmplId);
        return (el !== undefined && el !== null);
    };

    TemplateService.AddTemplate = function (templateText, tmplId) {
        var tmpl = document.createElement("SCRIPT");
        tmpl.type = "text/html";
        tmpl.id = tmplId;
        tmpl.text = templateText;
        document.body.appendChild(tmpl);
    };

    TemplateService.RemoveTemplate = function (tmplId){
        var element = document.getElementById(tmplId);
        if (element) element.parentNode.removeChild(element);
    };

    TemplateService.AddTemplateSafe = function (tmplId, templateTextAccessor) {
        if (!self.templateExists(tmplId)) {
            self.addTemplate(templateTextAccessor(), tmplId);
        }
    };

    TemplateService.EnsureGridTemplates = function (options) {
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
        self.addTemplateSafe(GRID_TEMPLATE,  function () {
            return ng.templates.defaultGridInnerTemplate(config);
        });
        
        //header row template
        if (config.headerTemplate) {
            self.addTemplateSafe(config.headerTemplate, function () {
                return ng.templates.generateHeaderTemplate(config);
            });
        }
        
        //header cell template
        if (config.headerCellTemplate) {
            self.addTemplateSafe(config.headerCellTemplate, function () {
                return ng.templates.defaultHeaderCellTemplate(config);
            });
        }
        
        //row template
        if (config.rowTemplate) {
            self.addTemplateSafe(config.rowTemplate, function () {
                return ng.templates.generateRowTemplate(config);
            });
        }
        
        //footer template
        if (config.footerTemplate) {
            self.addTemplateSafe(config.footerTemplate, function () {
                return ng.templates.defaultFooterTemplate(config);
            });
        }
    };

    TemplateService.GetTemplateText = function (tmplId) {
        if (!self.templateExists(tmplId)) {
            return "";
        } else {
            var el = document.getElementById(tmplId);
            return el.text;
        }
    };
    return TemplateService;
}]);