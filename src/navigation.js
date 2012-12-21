/// <reference path="../lib/jquery-1.8.2.min" />
/// <reference path="../lib/angular.js" />
/// <reference path="../src/constants.js" />
/// <reference path="../src/namespace.js" />
/// <reference path="../src/utils.jsjs" />
//set event binding on the grid so we can select using the up/down keys
ng.moveSelectionHandler = function($scope, grid, evt) {
    // null checks 
    if (grid === null || grid === undefined) {
        return true;
    }
    if (grid.config.selectedItems === undefined) {
        return true;
    }
    var charCode = evt.which || evt.keyCode;
    // detect which direction for arrow keys to navigate the grid
    var offset = (charCode == 38 ? -1 : (charCode == 40 ? 1 : null));
    if (!offset) {
        return true;
    }
    var items = $scope.renderedRows;
    var index = items.indexOf(grid.selectionService.lastClickedRow) + offset;
    if (index < 0 || index >= items.length) {
        return true;
    }
    grid.selectionService.ChangeSelection(items[index], evt);
    if (index > items.length - EXCESS_ROWS) {
        grid.$viewport.scrollTop(grid.$viewport.scrollTop() + (grid.config.rowHeight * 2));
    } else if (index < EXCESS_ROWS) {
        grid.$viewport.scrollTop(grid.$viewport.scrollTop() - (grid.config.rowHeight * 2));
    }
    if (!$scope.$$phase) {
        $scope.$parent.$digest();
    }
    return false;
};