/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

ngGridServices.factory('SelectionService', function () {
    var selectionService = {};

	selectionService.maxRows = function () {
	   return selectionService.dataSource.length;
	};

	selectionService.Initialize = function (options, rowService) {
        selectionService.isMulti = options.isMulti || options.multiSelect;
        selectionService.ignoreSelectedItemChanges = false; // flag to prevent circular event loops keeping single-select observable in sync
	    selectionService.sortedData = options.sortedData, // the observable array datasource

	    selectionService.selectedItems = options.selectedItems;
        selectionService.selectedIndex = options.selectedIndex;
        selectionService.lastClickedRow = options.lastClickedRow;
        selectionService.rowService = rowService;
    };
		
	// function to manage the selection action of a data item (entity)
    selectionService.ChangeSelection = function(rowItem, evt) {
        if (selectionService.isMulti && evt && evt.shiftKey) {
            if (selectionService.lastClickedRow) {
                var thisIndx = selectionService.rowService.rowCache.indexOf(rowItem);
                var prevIndx = selectionService.rowService.rowCache.indexOf(selectionService.lastClickedRow);
                if (thisIndx == prevIndx) return false;
                prevIndx++;
                if (thisIndx < prevIndx) {
                    thisIndx = thisIndx ^ prevIndx;
                    prevIndx = thisIndx ^ prevIndx;
                    thisIndx = thisIndx ^ prevIndx;
                }
                for (; prevIndx <= thisIndx; prevIndx++) {
                    selectionService.rowService.rowCache[prevIndx].selected = selectionService.lastClickedRow.selected;
                    selectionService.addOrRemove(rowItem);
                }
                selectionService.lastClickedRow = rowItem;
                return true;
            }
        } else if (!selectionService.isMulti) {
            if (selectionService.lastClickedRow) selectionService.lastClickedRow.selected = false;
            if (rowItem.selected) {
                selectionService.selectedItems.splice(0, selectionService.selectedItems.length);
                selectionService.selectedItems.push(rowItem.entity);
            } else {
                selectionService.selectedItems.splice(0, selectionService.selectedItems.length);
            }
            selectionService.lastClickedRow = rowItem;
            return true;
        }
        selectionService.addOrRemove(rowItem);
        selectionService.lastClickedRow = rowItem;
        return true;
    };
	
	// just call this func and hand it the rowItem you want to select (or de-select)    
    selectionService.addOrRemove = function(rowItem) {
        if (!rowItem.selected) {
            var indx = selectionService.selectedItems.indexOf(rowItem.entity);
            selectionService.selectedItems.splice(indx, 1);
        } else {
            if (selectionService.selectedItems.indexOf(rowItem.entity) === -1) {
                selectionService.selectedItems.push(rowItem.entity);
            }
        }
    };
    
    // writable-computed observable
    // @return - boolean indicating if all items are selected or not
    // @val - boolean indicating whether to select all/de-select all
    selectionService.toggleSelectAll = function (checkAll) {
        var selectedlength = selectionService.selectedItems.length;
        if (selectedlength > 0) {
            selectionService.selectedItems.splice(0, selectedlength);
        }
        angular.forEach(selectionService.sortedData, function (item) {
            item[SELECTED_PROP] = checkAll;
            if (checkAll) {
                selectionService.selectedItems.push(item);
            }
        });
        angular.forEach(selectionService.rowService.rowCache, function (row) {
            row.selected = checkAll;
        });
    };
	return selectionService;
});