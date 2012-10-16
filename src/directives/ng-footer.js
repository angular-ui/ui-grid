/// <reference path="../classes/grid.js" />
/// <reference path="../services/FilterService.js" />
/// <reference path="../services/GridService.js" />
/// <reference path="../services/SelectionService.js" />
/// <reference path="../services/RowService.js" />
/// <reference path="../services/TemplateService.js" />
/// <reference path="../services/SortService.js" />
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../classes/footer.js" />
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ngGridDirectives.directive('ngFooter', function(TemplateService, GridService) {
    var ngFooter = {
        template: TemplateService.GetTemplateText(FOOTER_TEMPLATE),
        replace: false,
        transclude: true,
        priority: 10,
        link: function (scope, iElement, iAttrs, controller) {
            var element = $(iElement).parent()[0];
            var grid = GridService.GetGrid(element);
            grid.footer = new ng.Footer(grid);
        }
    };
    return ngFooter;
});