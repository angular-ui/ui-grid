/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

ngGridServices.factory('SelectionService', ['$rootScope', function ($scope) {
    var selectionService = {};
	$scope._selectionService = {};

	$scope._selectionService.maxRows = function () {
	   return $scope._selectionService.dataSource.length;
	};

	selectionService.Initialize = function (options, RowService) {
        $scope._selectionService.isMulti = options.isMulti || options.isMultiSelect;
        $scope._selectionService.ignoreSelectedItemChanges = false; // flag to prevent circular event loops keeping single-select observable in sync
        $scope._selectionService.dataSource = options.data, // the observable array datasource

        $scope._selectionService.selectedItem = options.selectedItem || undefined;
        $scope._selectionService.selectedItems = options.selectedItems || [];
        $scope._selectionService.selectedIndex = options.selectedIndex;
        $scope._selectionService.lastClickedRow = options.lastClickedRow;
        $scope._selectionService.RowService = RowService;

        // some subscriptions to keep the selectedItem in sync
        $scope.$watch($scope._selectionService.selectedItem, function(val) {
            if ($scope._selectionService.ignoreSelectedItemChanges)
                return;
            $scope._selectionService.selectedItems = [val];
        });

        $scope.$watch($scope._selectionService.selectedItems, function(vals) {
            $scope._selectionService.ignoreSelectedItemChanges = true;
            $scope._selectionService.selectedItem = vals ? vals[0] : null;
            $scope._selectionService.ignoreSelectedItemChanges = false;
        });

        // ensures our selection flag on each item stays in sync
        $scope.$watch($scope._selectionService.selectedItems, function(newItems) {
            var data = $scope._selectionService.dataSource;
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
        $scope.$watch($scope._selectionService.dataSource, function(items) {
            var selectedItems,
                itemsToRemove;
            if (!items) {
                return;
            }

            //make sure the selectedItem(s) exist in the new data
            selectedItems = $scope._selectionService.selectedItems;
            itemsToRemove = [];

            angular.forEach(selectedItems, function(item) {
                if (ng.utils.arrayIndexOf(items, item) < 0) {
                    itemsToRemove.push(item);
                }
            });

            //clean out any selectedItems that don't exist in the new array
            if (itemsToRemove.length > 0) {
                $scope._selectionService.selectedItems.removeAll(itemsToRemove);
            }
        });
    };
		
	// function to manage the selection action of a data item (entity)
    selectionService.ChangeSelection = function(rowItem, evt) {
        if ($scope._selectionService.isMulti && evt && evt.shiftKey) {
            if ($scope._selectionService.lastClickedRow) {
                var thisIndx = $scope._selectionService.RowService.rowCache.indexOf(rowItem);
                var prevIndx = $scope._selectionService.RowService.rowCache.indexOf($scope._selectionService.lastClickedRow);
                if (thisIndx == prevIndx) return false;
                prevIndx++;
                if (thisIndx < prevIndx) {
                    thisIndx = thisIndx ^ prevIndx;
                    prevIndx = thisIndx ^ prevIndx;
                    thisIndx = thisIndx ^ prevIndx;
                }
                for (; prevIndx <= thisIndx; prevIndx++) {
                    $scope._selectionService.RowService.rowCache[prevIndx].selected = $scope._selectionService.lastClickedRow.selected;
                    $scope._selectionService.addOrRemove(rowItem);
                }
                $scope._selectionService.lastClickedRow(rowItem);
                return true;
            }
        } else if (!isMulti) {
            rowItem.selected ? $scope._selectionService.selectedItems = [rowItem.entity] : $scope._selectionService.selectedItems = [];
        }
        $scope._selectionService.addOrRemove(rowItem);
        $scope._selectionService.lastClickedRow(rowItem);
        return true;
    };
	
	// just call this func and hand it the rowItem you want to select (or de-select)    
    selectionService.addOrRemove = function(rowItem) {
        if (!rowItem.selected) {
            $scope._selectionService.selectedItems.remove(rowItem.entity);
        } else {
            if ($scope._selectionService.selectedItems.indexOf(rowItem.entity) === -1) {
                $scope._selectionService.selectedItems.push(rowItem.entity);
            }
        }
    };
    
    // the count of selected items (supports both multi and single-select logic
    selectionService.SelectedItemCount = function () {
        return $scope._selectionService.selectedItems.length;
    };
    
    // writable-computed observable
    // @return - boolean indicating if all items are selected or not
    // @val - boolean indicating whether to select all/de-select all
    selectionService.ToggleSelectAll = function (checkAll) {
        var dataSourceCopy = [];
        angular.forEach($scope._selectionService.dataSource, function (item) {
            dataSourceCopy.push(item);
        });
        if (checkAll) {
            $scope._selectionService.selectedItems = dataSourceCopy;
        } else {
            $scope._selectionService.selectedItems = [];
        }
    };
    
	return selectionService;
}]);