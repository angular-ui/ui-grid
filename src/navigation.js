/// <reference path="../lib/jquery-1.7.js" />
/// <reference path="../lib/knockout-2.0.0.debug.js" />

//set event binding on the grid so we can select using the up/down keys
ng.moveSelectionHandler = function (grid, evt) {
    // null checks 
    if (grid === null || grid === undefined)
        return true;

    if (grid.config.selectedItems() === undefined)
        return true;
        
    var offset,
        charCode = (evt.which) ? evt.which : event.keyCode,
        ROW_KEY = '__kg_rowIndex__'; // constant for the entity's row's rowIndex

    // detect which direction for arrow keys to navigate the grid
    switch (charCode) {
        case 38:
            // up - select previous
            offset = -1;
            break;
        case 40:
            // down - select next
            offset = 1;
            break;
        default:
            return true;
    }

    var items = grid.finalData,
        n = items.length,
        index = ng.utils.arrayIndexOf(items, grid.config.lastClickedRow.entity) + offset,
        rowCache = grid.rowManager.rowCache,
        rowHeight = grid.config.rowHeight,
        currScroll = grid.$viewport.scrollTop(),
        row = null,
        selected = null,
        itemToView = null;

    // now find the item we arrowed to, and select it
    if (index >= 0 && index < n) {

        selected = items[index];
        row = rowCache[selected[ROW_KEY]];

        // fire the selection
        row.toggleSelected(null, evt);

        itemtoView = ng.utils.getElementsByClassName("kgSelected");

        // finally scroll it into view as we arrow through
        if (!Element.prototype.scrollIntoViewIfNeeded) {
            itemtoView[0].scrollIntoView(false);
            grid.$viewport.focus();
           
        } else {
            itemtoView[0].scrollIntoViewIfNeeded();
        }

        //grid.$viewport.scrollTop(currScroll + (offset * rowHeight));

        return false;
    }
}; 