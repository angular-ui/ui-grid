/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

ngGridServices.factory('SelectionService', ['$rootScope', function ($scope) {
    var selectionService = {};

	$scope.maxRows = function () {
	   return $scope.dataSource.length;
	};

	selectionService.Initialize = function (options, RowService) {
        $scope.isMulti = options.isMulti || options.isMultiSelect;
        $scope.ignoreSelectedItemChanges = false; // flag to prevent circular event loops keeping single-select observable in sync
        $scope.dataSource = options.data, // the observable array datasource

        $scope.selectedItem = options.selectedItem || undefined;
        $scope.selectedItems = options.selectedItems || [];
        $scope.selectedIndex = options.selectedIndex;
        $scope.lastClickedRow = options.lastClickedRow;
        $scope.RowService = RowService;

        // some subscriptions to keep the selectedItem in sync
        $scope.$watch($scope.selectedItem, function(val) {
            if ($scope.ignoreSelectedItemChanges)
                return;
            $scope.selectedItems = [val];
        });

        $scope.$watch($scope.selectedItems, function(vals) {
            $scope.ignoreSelectedItemChanges = true;
            $scope.selectedItem = vals ? vals[0] : null;
            $scope.ignoreSelectedItemChanges = false;
        });

        // ensures our selection flag on each item stays in sync
        $scope.$watch($scope.selectedItems, function(newItems) {
            var data = $scope.dataSource;
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
        $scope.$watch($scope.dataSource, function(items) {
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
        if ($scope.isMulti && evt && evt.shiftKey) {
            if ($scope.lastClickedRow) {
                var thisIndx = $scope.RowService.rowCache.indexOf(rowItem);
                var prevIndx = $scope.RowService.rowCache.indexOf($scope.lastClickedRow);
                if (thisIndx == prevIndx) return false;
                prevIndx++;
                if (thisIndx < prevIndx) {
                    thisIndx = thisIndx ^ prevIndx;
                    prevIndx = thisIndx ^ prevIndx;
                    thisIndx = thisIndx ^ prevIndx;
                }
                for (; prevIndx <= thisIndx; prevIndx++) {
                    $scope.RowService.rowCache[prevIndx].selected = $scope.lastClickedRow.selected;
                    $scope.addOrRemove(rowItem);
                }
                $scope.lastClickedRow(rowItem);
                return true;
            }
        } else if (!isMulti) {
            rowItem.selected ? $scope.selectedItems = [rowItem.entity] : $scope.selectedItems = [];
        }
        $scope.addOrRemove(rowItem);
        $scope.lastClickedRow(rowItem);
        return true;
    };
	
	// just call this func and hand it the rowItem you want to select (or de-select)    
    selectionService.addOrRemove = function(rowItem) {
        if (!rowItem.selected) {
            $scope.selectedItems.remove(rowItem.entity);
        } else {
            if ($scope.selectedItems.indexOf(rowItem.entity) === -1) {
                $scope.selectedItems.push(rowItem.entity);
            }
        }
    };
    
    // the count of selected items (supports both multi and single-select logic
    selectionService.SelectedItemCount = function () {
        return $scope.selectedItems.length;
    };
    
    // writable-computed observable
    // @return - boolean indicating if all items are selected or not
    // @val - boolean indicating whether to select all/de-select all
    selectionService.ToggleSelectAll = function (checkAll) {
        var dataSourceCopy = [];
        angular.forEach(dataSource, function (item) {
            dataSourceCopy.push(item);
        });
        if (checkAll) {
            $scope.selectedItems = dataSourceCopy;
        } else {
            $scope.selectedItems = [];
        }
    };
    
	return selectionService;
}]);