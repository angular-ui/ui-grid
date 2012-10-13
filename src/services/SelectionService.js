servicesModule.factory('SelectionService', ['$scope', function($scope) {
    var SelectionService = {};		
	
	// the count of selected items (supports both multi and single-select logic
    $scope.selectedItemCount = function () {
        return $scope.selectedItems.length;
    }
	
	$scope.maxRows = function () {
	   return $scope.dataSource.length;
	};
		
	SelectionService.initialize = function(options, rowManager){
		$scope.isMulti = options.isMulti || options.isMultiSelect;
        $scope.ignoreSelectedItemChanges = false; // flag to prevent circular event loops keeping single-select observable in sync
        $scope.dataSource = options.data, // the observable array datasource
        $scope.KEY = '__ng_selected__', // constant for the selection property that we add to each data item,
        $scope.ROW_KEY = '__ng_rowIndex__', // constant for the entity's rowCache rowIndex
        		
		$scope.selectedItem = options.selectedItem || undefined; 
		$scope.selectedItems = options.selectedItems || []; 
		$scope.selectedIndex = options.selectedIndex; 
		$scope.lastClickedRow = options.lastClickedRow; 
		$scope.rowManager = rowManager;
		
		// some subscriptions to keep the selectedItem in sync
		$scope.$watch($scope.selectedItem, function (val) {
			if ($scope.ignoreSelectedItemChanges)
				return;
			$scope.selectedItems = [val];
		});
		
		$scope.$watch($scope.selectedItems, function (vals) {
			$scope.ignoreSelectedItemChanges = true;
			$scope.selectedItem = vals ? vals[0] : null;
			$scope.ignoreSelectedItemChanges = false;
		});
		
		// ensures our selection flag on each item stays in sync
		$scope.$watch($scope.selectedItems, function (newItems) {
			var data = $scope.dataSource;
			if (!newItems) {
				newItems = [];
			}
			angular.forEach(data, function (item, i) {
				if (!item[$scope.KEY]) {
					item[$scope.KEY] = false;
				}
				if (ng.utils.arrayIndexOf(newItems, item) > -1) {
					//newItems contains the item
					item[$scope.KEY] = true;
				} else {
					item[$scope.KEY] = false;
				}
			});
		});		
		
		//make sure as the data changes, we keep the selectedItem(s) correct
		$scope.$watch($scope.dataSource, function (items) {
			var selectedItems,
				itemsToRemove;
			if (!items) {
				return;
			}
			
			//make sure the selectedItem(s) exist in the new data
			selectedItems = $scope.selectedItems;
			itemsToRemove = [];

			angular.forEach(selectedItems, function (item) {
				if (ng.utils.arrayIndexOf(items, item) < 0) {
					itemsToRemove.push(item);
				}
			});

			//clean out any selectedItems that don't exist in the new array
			if (itemsToRemove.length > 0) {
				$scope.selectedItems.removeAll(itemsToRemove);
			}
		});
		
		// writable-computed observable
		// @return - boolean indicating if all items are selected or not
		// @val - boolean indicating whether to select all/de-select all
		$scope.toggleSelectAll = {
			get: function () {
				var cnt = $scope.selectedItemCount;
				if ($scope.maxRows() === 0) {
					return false;
				}
				return cnt === $scope.maxRows();
			},
			set: function (val) {
				var checkAll = val,
				dataSourceCopy = [];
				angular.forEach(dataSource, function (item) {
					dataSourceCopy.push(item);
				});
				if (checkAll) {
					$scope.selectedItems = dataSourceCopy;
				} else {
					$scope.selectedItems = [];
				}
			}
		}
	}	
		
	// function to manage the selection action of a data item (entity)
    SelectionService.changeSelection = function (rowItem, evt) {
        if ($scope.isMulti && evt && evt.shiftKey) {
            if($scope.lastClickedRow) {
                var thisIndx = $scope.rowManager.rowCache.indexOf(rowItem);
                var prevIndx = $scope.rowManager.rowCache.indexOf($scope.lastClickedRow);
                if (thisIndx == prevIndx) return;
                prevIndx++;
                if (thisIndx < prevIndx) {
                    thisIndx = thisIndx ^ prevIndx;
                    prevIndx = thisIndx ^ prevIndx;
                    thisIndx = thisIndx ^ prevIndx;
                }
                for (; prevIndx <= thisIndx; prevIndx++) {
                    $scope.rowManager.rowCache[prevIndx].selected = $scope.lastClickedRow.selected;
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
    }
	
	// just call this func and hand it the rowItem you want to select (or de-select)    
    SelectionService.addOrRemove = function(rowItem) {
        if (!rowItem.selected) {
            $scope.selectedItems.remove(rowItem.entity);
        } else {
            if ($scope.selectedItems.indexOf(rowItem.entity) === -1) {
                $scope.selectedItems.push(rowItem.entity);
            }
        }
    };
	
	return SelectionService;
}]);