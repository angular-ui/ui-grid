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

	selectionService.Initialize = function ($scope, options, rowService) {
	    selectionService.$scope = $scope;
        selectionService.isMulti = options.isMulti || options.isMultiSelect;
        selectionService.ignoreSelectedItemChanges = false; // flag to prevent circular event loops keeping single-select observable in sync
        $scope.dataSource = options.data, // the observable array datasource

        $scope.selectedItem = options.selectedItem || undefined;
        $scope.selectedItems = options.selectedItems || [];
        selectionService.selectedIndex = options.selectedIndex;
        selectionService.lastClickedRow = options.lastClickedRow;
        selectionService.rowService = rowService;

        // some subscriptions to keep the selectedItem in sync
        $scope.$watch('selectedItem', function(val) {
            if (selectionService.ignoreSelectedItemChanges)
                return;
            selectionService.selectedItems = [val];
        });

        $scope.$watch('selectedItems', function(vals) {
            selectionService.ignoreSelectedItemChanges = true;
            $scope.selectedItem = vals ? vals[0] : null;
            selectionService.ignoreSelectedItemChanges = false;
        });

        // ensures our selection flag on each item stays in sync
        $scope.$watch('selectedItems', function(newItems) {
            var data = selectionService.dataSource;
            if (!newItems) {
                newItems = [];
            }
            angular.forEach(data, function(item) {
                if (!item[SELECTED_PROP]) {
                    item[SELECTED_PROP] = false;
                }
                if (ng.utils.arrayIndexOf(newItems, item) > -1) {
                    //newItems contains the item
                    item[SELECTED_PROP] = true;
                } else {
                    item[SELECTED_PROP] = false;
                }
            });
        });

        //make sure as the data changes, we keep the selectedItem(s) correct
        $scope.$watch('dataSource', function(items) {
            var selectedItems,
                itemsToRemove;
            if (!items) {
                return;
            }

            //make sure the selectedItem(s) exist in the new data
            selectedItems = $scope.selectedItems;
            itemsToRemove = [];

            angular.forEach(selectedItems, function(item) {
                if (ng.utils.arrayIndexOf(items, item) < 0) {
                    itemsToRemove.push(item);
                }
            });

            //clean out any selectedItems that don't exist in the new array
            if (itemsToRemove.length > 0) {
                $scope.selectedItems.removeAll(itemsToRemove);
            }
        });
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
                selectionService.lastClickedRow(rowItem);
                return true;
            }
        } else if (!selectionService.isMulti) {
            rowItem.selected ? selectionService.$scope.selectedItems = [rowItem.entity] : $scope.selectedItems = [];
        }
        selectionService.addOrRemove(rowItem);
        selectionService.lastClickedRow = rowItem;
        return true;
    };
	
	// just call this func and hand it the rowItem you want to select (or de-select)    
    selectionService.addOrRemove = function(rowItem) {
        if (!rowItem.selected) {
            var indx = selectionService.$scope.selectedItems.indexOf(rowItem.entity);
            selectionService.$scope.selectedItems.splice(indx, 1);
        } else {
            if (selectionService.$scope.selectedItems.indexOf(rowItem.entity) === -1) {
                selectionService.$scope.selectedItems.push(rowItem.entity);
            }
        }
    };
    
    // the count of selected items (supports both multi and single-select logic
    selectionService.SelectedItemCount = function () {
        return selectionService.$scope.selectedItems.length;
    };
    
    // writable-computed observable
    // @return - boolean indicating if all items are selected or not
    // @val - boolean indicating whether to select all/de-select all
    selectionService.ToggleSelectAll = function (checkAll) {
        var dataSourceCopy = [];
        angular.forEach(selectionService.dataSource, function (item) {
            dataSourceCopy.push(item);
        });
        if (checkAll) {
            selectionService.$scope.selectedItems = dataSourceCopy;
        } else {
            selectionService.$scope.selectedItems = [];
        }
    };
    
	return selectionService;
});