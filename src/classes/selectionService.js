ng.SelectionService = function(grid) {
    var self = this;
    self.multi = grid.config.multiSelect;
    self.selectedItems = grid.config.selectedItems;
    self.selectedIndex = grid.config.selectedIndex;
    self.lastClickedRow = undefined;
    self.ignoreSelectedItemChanges = false; // flag to prevent circular event loops keeping single-select var in sync

    self.rowFactory = {};
    self.Initialize = function(rowFactory) {
        self.rowFactory = rowFactory;
    };

    // function to manage the selection action of a data item (entity)
    self.ChangeSelection = function(rowItem, evt) {
        if (evt && evt.shiftKey && self.multi) {
            if (self.lastClickedRow) {
                var thisIndx = grid.filteredData.indexOf(rowItem.entity);
                var prevIndx = grid.filteredData.indexOf(self.lastClickedRow.entity);
				self.lastClickedRow = self.rowFactory.rowCache[thisIndx];
                if (thisIndx == prevIndx) {
                    return false;
                }
                if (thisIndx < prevIndx) {
                    thisIndx = thisIndx ^ prevIndx;
                    prevIndx = thisIndx ^ prevIndx;
                    thisIndx = thisIndx ^ prevIndx;
					thisIndx--;
                } else {
					prevIndx++;
				}
                var rows = [];
                for (; prevIndx <= thisIndx; prevIndx++) {
                    rows.push(self.rowFactory.rowCache[prevIndx]);
                }
                if (rows[rows.length - 1].beforeSelectionChange(rows, evt)) {
                    $.each(rows, function(i, ri) {
						var selectionState = ri.selected;
                        ri.selected = !selectionState;
                        ri.entity[SELECTED_PROP] = !selectionState;
						var index = self.selectedItems.indexOf(ri.entity);
                        if (index === -1) {
                            self.selectedItems.push(ri.entity);
                        } else {
							self.selectedItems.splice(index,1);
						}
                    });
                    rows[rows.length - 1].afterSelectionChange(rows, evt);
                }
                return true;
            }
        } else if (!self.multi) {
            if (self.lastClickedRow) {
				//sorting builds new row so last clicked row will have different hash 
				//than new row in rowcache so set lastClickedRow to same row in new rowCache
				for(var i = 0; i < self.rowFactory.rowCache.length; i++) { 
					if(self.rowFactory.rowCache[i] && self.rowFactory.rowCache[i].entity == self.lastClickedRow.entity){
						self.lastClickedRow = self.rowFactory.rowCache[i];
						break;
					}
				}
				self.setSelection(self.lastClickedRow, false);
				if(self.lastClickedRow.entity == rowItem.entity){ 
					self.lastClickedRow = undefined; //deselect row
					return true;
				}
				self.setSelection(rowItem, grid.config.keepLastSelected ? true : !rowItem.selected);
            } else {
				self.setSelection(rowItem, grid.config.keepLastSelected ? true : !rowItem.selected);
			}
        } else {
            self.setSelection(rowItem, !rowItem.selected);
        }
		self.lastClickedRow = rowItem;
        return true;
    };

    // just call this func and hand it the rowItem you want to select (or de-select)    
    self.setSelection = function(rowItem, isSelected) {
        rowItem.selected = isSelected;
        rowItem.entity[SELECTED_PROP] = isSelected;
        if (!isSelected) {
            var indx = self.selectedItems.indexOf(rowItem.entity);
			if(indx != -1){
				self.selectedItems.splice(indx, 1);
			}
        } else {
            if (self.selectedItems.indexOf(rowItem.entity) === -1) {
				if(!self.multi && self.selectedItems.length > 0){
					self.toggleSelectAll(false);
					rowItem.selected = isSelected;
					rowItem.entity[SELECTED_PROP] = isSelected;
				}
				self.selectedItems.push(rowItem.entity);
            }
        }
    };
    // @return - boolean indicating if all items are selected or not
    // @val - boolean indicating whether to select all/de-select all
    self.toggleSelectAll = function (checkAll) {
        angular.forEach(grid.filteredData, function(item, i) {
            grid.rowFactory.buildEntityRow(item, i);
        });
        if (grid.config.beforeSelectionChange(grid.rowFactory.rowCache)) {
            var selectedlength = self.selectedItems.length;
            if (selectedlength > 0) {
                self.selectedItems.splice(0, selectedlength);
            }
            angular.forEach(grid.filteredData, function (item) {
                item[SELECTED_PROP] = checkAll;
                if (checkAll) {
                    self.selectedItems.push(item);
                }
            });
            angular.forEach(self.rowFactory.rowCache, function (row) {
                row.selected = checkAll;
            });
            grid.config.afterSelectionChange(grid.rowFactory.rowCache);
        }
    };
};