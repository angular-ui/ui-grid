/// <reference path="../lib/jquery-1.8.2.min" />
/// <reference path="../lib/angular.js" />
/// <reference path="../src/constants.js" />
/// <reference path="../src/namespace.js" />
/// <reference path="../src/utils.jsjs" />
//set event binding on the grid so we can select using the up/down keys
ng.moveSelectionHandler = function($scope, elm, evt) {
    if ($scope.selectionService.selectedItems === undefined) {
        return true;
    }
    var charCode = evt.which || evt.keyCode;
    // detect which direction for arrow keys to navigate the grid
    var offset = (charCode == 38 ? -1 : (charCode == 40 ? 1 : null));
    if (!offset) {
        return true;
    }
    var items = $scope.renderedRows;
    var index = items.indexOf($scope.selectionService.lastClickedRow) + offset;
    if (index < 0 || index >= items.length) {
        return true;
    }
    $scope.selectionService.ChangeSelection(items[index], evt);
    if (index > items.length - EXCESS_ROWS) {
        elm.scrollTop(elm.scrollTop() + ($scope.rowHeight * 2));
    } else if (index < EXCESS_ROWS) {
        elm.scrollTop(elm.scrollTop() - ($scope.rowHeight * 2));
    }
    if (!$scope.$$phase) {
        $scope.$parent.$digest();
    }
    return false;
};