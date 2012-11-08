/// <reference path="../lib/jquery-1.8.2.min" />
/// <reference path="../lib/angular.js" />
/// <reference path="../src/constants.js"/>
/// <reference path="../src/namespace.js" />
/// <reference path="../src/utils.jsjs"/>

//set event binding on the grid so we can select using the up/down keys
ng.moveSelectionHandler = function ($scope, grid, evt) {
    // null checks 
    if (grid === null || grid === undefined) return true;
    if (grid.config.selectedItems === undefined) return true;
    
    var offset,
        charCode = (evt.which) ? evt.which : event.keyCode;
    
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
    var items = grid.sortedData,
        n = items.length,
        index = ng.utils.arrayIndexOf(items, grid.selectionService.lastClickedRow.entity) + offset,
        rowCache = grid.rowFactory.rowCache,
        selected,
        itemToView;

    // now find the item we arrowed to, and select it
    if (index >= 0 && index < n) {
        selected = items[index];
        var row = rowCache[selected[ROW_KEY]];
        if (row) {
            row.toggleSelected(evt);
            itemToView = ng.utils.getElementsByClassName("selected");
            // finally scroll it into view as we arrow through
            if (itemToView && itemToView[0]) {
                if (!Element.prototype.scrollIntoViewIfNeeded) {
                    itemToView[0].scrollIntoView(false);
                    grid.$viewport.focus();
                } else {
                    itemToView[0].scrollIntoViewIfNeeded();
                }
            }
        }
        if (!$scope.$$phase) {
            $scope.$apply();
        }
        // fire the selection
        return false;
    }
    return false;
}; 