ng.SelectionService = function (grid, $scope) {
    var self = this;
    self.multi = grid.config.multiSelect;
    self.selectedItems = grid.config.selectedItems;
    self.selectedIndex = grid.config.selectedIndex;
    self.lastClickedRow = undefined;
    self.ignoreSelectedItemChanges = false; // flag to prevent circular event loops keeping single-select var in sync

    // function to manage the selection action of a data item (entity)
    self.ChangeSelection = function(rowItem, evt) {
        if (evt && evt.shiftKey && !evt.keyCode && self.multi && grid.config.canSelectRows) {
            if (self.lastClickedRow) {
                var rowsArr;
                if ($scope.configGroups.length > 0) {
                    rowsArr = grid.rowFactory.parsedData.filter(function(row) {
                        return !row.isAggRow;
                    });
                } else {
                    rowsArr = grid.filteredRows;
                }
                var thisIndx = rowsArr.indexOf(rowItem);
                var prevIndx = rowsArr.indexOf(self.lastClickedRow);
                self.lastClickedRow = rowItem;
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
                    rows.push(rowsArr[prevIndx]);
                }
                if (rows[rows.length - 1].beforeSelectionChange(rows, evt)) {
                    for (var i = 0; i < rows.length; i++) {
                        var ri = rows[i];
                        var selectionState = ri.selected;
                        ri.selected = !selectionState;
                        var index = self.selectedItems.indexOf(ri.entity);
                        if (index === -1) {
                            self.selectedItems.push(ri.entity);
                        } else {
                            self.selectedItems.splice(index, 1);
                        }
                    }
                    rows[rows.length - 1].afterSelectionChange(rows, evt);
                }
                return true;
            }
        } else if (!self.multi) {
            if (self.lastClickedRow) {
				self.setSelection(self.lastClickedRow, false);
				if(self.lastClickedRow == rowItem){ 
					self.lastClickedRow = undefined; //deselect row
					return true;
				}
            }
		    self.setSelection(rowItem, grid.config.keepLastSelected ? true : !rowItem.selected);
        } else if (!evt.keyCode) {
            self.setSelection(rowItem, !rowItem.selected);
        }
		self.lastClickedRow = rowItem;
        return true;
    };

    // just call this func and hand it the rowItem you want to select (or de-select)    
    self.setSelection = function(rowItem, isSelected) {
		if(grid.config.canSelectRows){
			rowItem.selected = isSelected;
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
					}
					self.selectedItems.push(rowItem.entity);
				}
			}
			rowItem.afterSelectionChange(rowItem);
		}
    };
    // @return - boolean indicating if all items are selected or not
    // @val - boolean indicating whether to select all/de-select all
    self.toggleSelectAll = function (checkAll) {
        if (grid.config.beforeSelectionChange(grid.rowCache)) {
            var selectedlength = self.selectedItems.length;
            if (selectedlength > 0) {
                self.selectedItems.length = 0;
            }
            for (var i = 0; i < grid.filteredRows.length; i++) {
                grid.filteredRows[i].selected = checkAll;
                if (checkAll) {
                    self.selectedItems.push(grid.filteredRows[i].entity);
                }
            }
            grid.config.afterSelectionChange(grid.rowCache);
        }
    };
};