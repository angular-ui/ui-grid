/// <reference path="../classes/grid.js" />
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ngGridDirectives.directive('ngGrid', function (FilterService, GridService, RowService, SelectionService, SortService, TemplateService) {
    var ngGrid = {
        link: function (scope, iElement, iAttrs) {
            var $element = $(iElement),
                options = scope[iAttrs.ngGrid],
                //create the Grid
                grid = GridService.GetGrid($element);
            
            if (!grid) {
                grid = new ng.Grid(options, $($element).width(), FilterService, RowService, SelectionService, SortService);
                GridService.StoreGrid($element, grid);
            } else {
                return false;
            }

            TemplateService.EnsureGridTemplates({
                rowTemplate: grid.config.rowTemplate,
                headerTemplate: grid.config.headerTemplate,
                headerCellTemplate: grid.config.headerCellTemplate,
                footerTemplate: grid.config.footerTemplate,
                columns: grid.columns,
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

            //subscribe to the columns and recrate the grid if they change
            scope.$watch(grid.config.columnDefs, function () {
                var oldgrid = GridService.GetGrid($element);
                var oldgridId = oldgrid.gridId.toString();
                $(element).empty();
                $(element).removeClass("ngGrid")
                          .removeClass("ui-widget")
                          .removeClass(oldgridId);
                GridService.RemoveGrid(oldgridId);
            });
            //keep selected item scrolled into view
            scope.$watch(grid.finalData, function () {
                if (grid.config.selectedItems()) {
                    var lastItemIndex = grid.config.selectedItems.length - 1;
                    if (lastItemIndex <= 0) {
                        var item = grid.config.selectedItems[lastItemIndex];
                        if (item) {
                            grid.scrollIntoView(item);
                        }
                    }
                }
            });
            scope.$watch(grid.data, grid.refreshDomSizesTrigger);
            angular.forEach(grid.columns, function (column) {
                scope.$watch(column.sortDirection, function () {
                    return function(dir) {
                        if (dir) {
                            grid.sortData(column, dir);
                        }
                    };
                });
                scope.$watch(column.filter, FilterService.CreateFilterChangeCallback(column));
            });
            
            scope.toggleSelectAll = grid.toggleSelectAll;
            scope.filterIsOpen = grid.filterIsOpen;
            //walk the element's graph and the correct properties on the grid
            ng.domUtility.assignGridContainers($element, grid);
            //now use the manager to assign the event handlers
            GridService.AssignGridEventHandlers(grid);
            //call update on the grid, which will refresh the dome measurements asynchronously
            grid.update();
            scope.initPhase = 1;
            return null;
        }
    };
    return ngGrid;
});