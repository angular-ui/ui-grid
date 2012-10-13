/// <reference path="../../lib/knockout-2.0.0.debug.js" />
/// <reference path="../../lib/jquery-1.7.js" />

ko.bindingHandlers['koGrid'] = (function () {
    var makeNewValueAccessor = function (grid) {
        return function () {
            return {
                name: GRID_TEMPLATE,
                data: grid
            };
        };
    };

    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid,
                options = valueAccessor(),
                $element = $(element);

            //create the Grid
            var grid = kg.gridManager.getGrid(element);
            if (!grid){
                grid = new kg.KoGrid(options, $(element).width());
                kg.gridManager.storeGrid(element, grid);
            } else {
                return false;
            }
            
            kg.templateManager.ensureGridTemplates({
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

            //subscribe to the columns and recrate the grid if they change
            grid.config.columnDefs.subscribe(function (){
                var oldgrid = kg.gridManager.getGrid(element);
                var oldgridId = oldgrid.gridId.toString();
                $(element).empty(); 
                $(element).removeClass("kgGrid")
                          .removeClass("ui-widget")
                          .removeClass(oldgridId);
                kg.gridManager.removeGrid(oldgridId);
                ko.applyBindings(bindingContext, element);
            });
            
            //get the container sizes
            kg.domUtility.measureGrid($element, grid, true);

            $element.hide(); //first hide the grid so that its not freaking the screen out

            //set the right styling on the container
            $element.addClass("kgGrid")
                    .addClass("ui-widget")
                    .addClass(grid.gridId.toString());

            //make sure the templates are generated for the Grid
            return ko.bindingHandlers['template'].init(element, makeNewValueAccessor(grid), allBindingsAccessor, grid, bindingContext);

        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid,
                returnVal;

            grid = kg.gridManager.getGrid(element);

            //kind a big problem if this isn't here...
            if (!grid) {
                return { 'controlsDescendantBindings': true };
            }

            //fire the with "update" bindingHandler
            returnVal = ko.bindingHandlers['template'].update(element, makeNewValueAccessor(grid), allBindingsAccessor, grid, bindingContext);

            //walk the element's graph and the correct properties on the grid
            kg.domUtility.assignGridContainers(element, grid);

            //now use the manager to assign the event handlers
            kg.gridManager.assignGridEventHandlers(grid);

            //call update on the grid, which will refresh the dome measurements asynchronously
            grid.update();

            return returnVal;
        }
    };

} ());
