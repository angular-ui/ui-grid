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
                if (thisIndx == prevIndx) {
                    return false;
                }
                prevIndx++;
                if (thisIndx < prevIndx) {
                    thisIndx = thisIndx ^ prevIndx;
                    prevIndx = thisIndx ^ prevIndx;
                    thisIndx = thisIndx ^ prevIndx;
                }
                var rows = [];
                for (; prevIndx <= thisIndx; prevIndx++) {
                    rows.push(self.rowFactory.rowCache[prevIndx]);
                }
                if (rows[rows.length - 1].beforeSelectionChange(rows, evt)) {
                    $.each(rows, function(i, ri) {
                        ri.selected = true;
                        ri.entity[SELECTED_PROP] = true;
                        if (self.selectedItems.indexOf(ri.entity) === -1) {
                            self.selectedItems.push(ri.entity);
                        }
                    });
                    rows[rows.length - 1].afterSelectionChange(rows, evt);
                }
                self.lastClickedRow = rows[rows.length - 1];
                return true;
            }
        } else if (!self.multi) {
            if (self.lastClickedRow && self.lastClickedRow != rowItem) {
                self.setSelection(self.lastClickedRow, false);
            }
            self.setSelection(rowItem, grid.config.keepLastSelected ? true : !rowItem.selected);
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
            self.selectedItems.splice(indx, 1);
        } else {
            if (self.selectedItems.indexOf(rowItem.entity) === -1) {
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