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

ngGridDirectives.directive('ngRow', function (SelectionService, TemplateService) {
    var ngRow = {
        template: TemplateService.GetTemplateText(ROW_TEMPLATE),
        replace: true,
        transclude: true,
        link: function ($scope, iElement, iAttrs) {

        }
    };
    return ngRow;
});