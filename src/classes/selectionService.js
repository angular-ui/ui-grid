ng.SelectionService = function (grid) {
    var self = this;

    self.lastClickedRow = undefined;
    self.ignoreSelectedItemChanges = false; // flag to prevent circular event loops keeping single-select observable in sync
    
	self.Initialize = function (options, rowFactory) {
        self.isMulti = options.isMulti || options.multiSelect;
        self.selectedItems = options.selectedItems;
        self.selectedIndex = options.selectedIndex;
        self.rowFactory = rowFactory;
    };
		
	// function to manage the selection action of a data item (entity)
	self.ChangeSelection = function (rowItem, evt) {
	    if (!self.isMulti) {
	        if (self.lastClickedRow && self.lastClickedRow.selected) {
	            self.setSelection(self.lastClickedRow, false);
	        }
	    } else if (evt && evt.shiftKey) {
            if (self.lastClickedRow) {
                var thisIndx = ng.utils.arrayIndexOf(grid.sortedData, rowItem.entity);
                var prevIndx = ng.utils.arrayIndexOf(grid.sortedData, self.lastClickedRow.entity);
                if (thisIndx == prevIndx) return false;
                prevIndx++;
                if (thisIndx < prevIndx) {
                    thisIndx = thisIndx ^ prevIndx;
                    prevIndx = thisIndx ^ prevIndx;
                    thisIndx = thisIndx ^ prevIndx;
                }
                for (; prevIndx <= thisIndx; prevIndx++) {
                    self.setSelection(self.rowFactory.rowCache[prevIndx], self.lastClickedRow.selected);
                }
                self.lastClickedRow = rowItem;
                return true;
            }
	    }
	    self.setSelection(rowItem, rowItem.selected ? false : true);
	    self.lastClickedRow = rowItem;
        return true;
    };

    // just call this func and hand it the rowItem you want to select (or de-select)    
    self.setSelection = function(rowItem, isSelected) {
        rowItem.selected = isSelected ;
        rowItem.entity[SELECTED_PROP] = isSelected;
        if (!isSelected) {
            var indx = self.selectedItems.indexOf(rowItem.entity);
            self.selectedItems.splice(indx, 1);
        } else {
            if (self.selectedItems.indexOf(rowItem.entity) === -1) {
                self.selectedItems.push(rowItem.entity);
            }
        }
    };
    
    // writable-computed observable
    // @return - boolean indicating if all items are selected or not
    // @val - boolean indicating whether to select all/de-select all
    self.toggleSelectAll = function (checkAll) {
        var selectedlength = self.selectedItems.length;
        if (selectedlength > 0) {
            self.selectedItems.splice(0, selectedlength);
        }
        angular.forEach(grid.sortedData, function (item) {
            item[SELECTED_PROP] = checkAll;
            if (checkAll) {
                self.selectedItems.push(item);
            }
        });
        angular.forEach(self.rowFactory.rowCache, function (row) {
            row.selected = checkAll;
        });
    };
};