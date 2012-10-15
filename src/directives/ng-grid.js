/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ngGridDirectives.directive('ngGrid', function (GridService, TemplateService) {
    var ngGrid = {
        scope: true,
        compile: function compile(tElement, tAttrs, transclude) {
            var options = tAttrs,
                $element = $(tElement);

            //create the Grid
            var grid = GridService.getGrid($element);
            if (!grid) {
                grid = new ng.KoGrid(options, $(element).width());
                GridService.storeGrid(element, grid);
            } else {
                return false;
            }

            TemplateService.ensureGridTemplates({
                rowTemplate: grid.config.rowTemplate,
                headerTemplate: grid.config.headerTemplate,
                headerCellTemplate: grid.config.headerCellTemplate,
                footerTemplate: grid.config.footerTemplate,
                columns: grid.columns(),
                showFilter: grid.config.allowFiltering,
                disableTextSelection: grid.config.disableTextSelection,
                autogenerateColumns: grid.config.autogenerateColumns,
                enableColumnResize: grid.config.enableColumnResize
            });



            //get the container sizes
            ng.domUtility.measureGrid($element, grid, true);

            $element.hide(); //first hide the grid so that its not freaking the screen out

            //set the right styling on the container
            $element.addClass("kgGrid")
                    .addClass("ui-widget")
                    .addClass(grid.gridId.toString());
        },
        link: function postLink(scope, iElement, iAttrs) {
            var $element = $(iElement),
                grid = GridService.getGrid($element);
            //subscribe to the columns and recrate the grid if they change
            scope.$watch(grid.config.columnDefs, function () {
                var oldgrid = GridService.getGrid(element);
                var oldgridId = oldgrid.gridId.toString();
                $(element).empty();
                $(element).removeClass("ngGrid")
                          .removeClass("ui-widget")
                          .removeClass(oldgridId);
                GridService.removeGrid(oldgridId);
            });
            //walk the element's graph and the correct properties on the grid
            ng.domUtility.assignGridContainers(element, grid);
            //now use the manager to assign the event handlers
            GridService.assignGridEventHandlers(grid);
            //call update on the grid, which will refresh the dome measurements asynchronously
            grid.update();
        }
    };
    return ngGrid;
});