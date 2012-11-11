ng.RowFactory = function (grid, $scope) {
    var self = this;
    var NG_FIELD = '_ng_field_';
    var NG_DEPTH = '_ng_depth_';
    // we cache rows when they are built, and then blow the cache away when sorting
    self.rowCache = [];
    self.dataChanged = true;
    self.prevMaxRows = 0; // for comparison purposes when scrolling
    self.prevMinRows = 0; // for comparison purposes when scrolling
    self.rowConfig = {};
    self.selectionService = undefined;
    self.rowHeight = 30;
    self.prevRenderedRange = undefined; // for comparison purposes to help throttle re-calcs when scrolling
    self.prevViewableRange = undefined; // for comparison purposes to help throttle re-calcs when scrolling

    // Builds rows for each data item in the 'sortedData'
    // @entity - the data item
    // @rowIndex - the index of the row
    self.buildEntityRow = function (entity, rowIndex) {
        var row = self.rowCache[rowIndex]; // first check to see if we've already built it
        if (!row) {
            // build the row
            row = new ng.Row(entity, self.rowConfig, self.selectionService);
            row.rowIndex = rowIndex + 1; //not a zero-based rowIndex
            row.rowDisplayIndex = row.rowIndex;
            row.offsetTop = self.rowHeight * rowIndex;
            row.selected = entity[SELECTED_PROP];
            // finally cache it for the next round
            self.rowCache[rowIndex] = row;
        }
        // store the row's index on the entity for future ref
        entity[ROW_KEY] = rowIndex;
        return row;
    };

    self.buildAggregateRow = function (aggEntity, aggIndex) {
        var agg = self.rowCache[aggIndex]; // first check to see if we've already built it
        if (!agg) {
            // build the row
            agg = new ng.Aggregate(aggEntity);
            agg.index = aggIndex + 1; //not a zero-based rowIndex
            agg.offsetTop = self.rowHeight * aggIndex;
            // finally cache it for the next round
            self.rowCache[aggIndex] = agg;
        }
        // store the row's index on the entity for future ref
        aggEntity[ROW_KEY] = aggIndex;
        return agg;
    };

    // core logic that intelligently figures out the rendered range given all the contraints that we have
    self.CalcRenderedRange = function () {
        var rg = self.renderedRange,
		    minRows = grid.minRowsToRender(),
		    maxRows = Math.max(grid.sortedData.length, grid.minRowsToRender()),
		    prevMaxRows = self.prevMaxRows,
		    prevMinRows = self.prevMinRows,
		    isDif, // flag to help us see if the viewableRange or data has changed "enough" to warrant re-building our rows
		    newRg = new ng.Range(0, 0); // variable to hold our newly-calc'd rendered range 

        isDif = (rg.bottomRow !== self.prevViewableRange.bottomRow || rg.topRow !== self.prevViewableRange.topRow || self.dataChanged);
        if (!isDif && prevMaxRows !== maxRows) {
            isDif = true;
            rg = new ng.Range(self.prevViewableRange.bottomRow, self.prevViewableRange.topRow);
        }
        if (!isDif && prevMinRows !== minRows) {
            isDif = true;
            rg = new ng.Range(self.prevViewableRange.bottomRow, self.prevViewableRange.topRow);
        }
        if (isDif) {
            //store it for next rev
            self.prevViewableRange = rg;
            // now build the new rendered range
            newRg = new ng.Range(rg.bottomRow, rg.topRow);
            // make sure we are within our data constraints (can't render negative rows or rows greater than the # of data items we have)
            newRg.bottomRow = Math.max(0, rg.bottomRow - EXCESS_ROWS);
            newRg.topRow = Math.min(maxRows, rg.topRow + EXCESS_ROWS);
            // store them for later comparison purposes
            self.prevMaxRows = maxRows;
            self.prevMinRows = minRows;
            //one last equality check
            if (self.prevRenderedRange.topRow !== newRg.topRow || self.prevRenderedRange.bottomRow !== newRg.bottomRow || self.dataChanged) {
                self.dataChanged = false;
                self.prevRenderedRange = newRg;
            }
        }
        self.UpdateViewableRange(newRg);
    };

    self.renderedChange2 = function () {
        var rowArr = [];
        var dataArr = grid.sortedData.slice(self.renderedRange.bottomRow, self.renderedRange.topRow);

        angular.forEach(dataArr, function (item, i) {
            var row = self.buildRowFromEntity(item, self.renderedRange.bottomRow + i);
            //add the row to our return array
            rowArr.push(row);
        });
        grid.setRenderedRows(rowArr);
    };

    self.UpdateViewableRange = function (newRange) {
        self.renderedRange = newRange;
        self.renderedChange();
    };

    self.sortedDataChanged = function () {
        self.dataChanged = true;
        self.rowCache = []; //if data source changes, kill this!
        self.selectionService.toggleSelectAll(false);
        self.CalcRenderedRange();
    };

    self.Initialize = function (config) {
        self.prevMaxRows = 0; // for comparison purposes when scrolling
        self.prevMinRows = 0; // for comparison purposes when scrolling
        // height of each row
        self.rowConfig = config.rowConfig;
        self.selectionService = config.selectionService;
        self.rowHeight = config.rowHeight;
        if (grid.config.groups) {
            self.getGrouping(grid.config.groups);
        }
        var i = grid.minRowsToRender();
        self.prevRenderedRange = new ng.Range(0, i); // for comparison purposes to help throttle re-calcs when scrolling
        self.prevViewableRange = new ng.Range(0, i); // for comparison purposes to help throttle re-calcs when scrolling
        // the actual range the user can see in the viewport
        self.renderedRange = self.prevRenderedRange;
        self.sortedDataChanged();
    };
    
    self.getGrouping = function (groups) {
        self.groupedData = { };
        // Here we set the onmousedown event handler to the header container.
        var data = grid.sortedData;
        angular.forEach(data, function (item) {
            var ptr = self.groupedData;
            angular.forEach(groups, function(group, depth) {
                var val = item[group].toString();
                if (!ptr[val]) {
                    ptr[val] = {};
                }
                if (!ptr[NG_FIELD]) {
                    ptr[NG_FIELD] = group;
                }
                if (!ptr[NG_DEPTH]) {
                    ptr[NG_DEPTH] = depth;
                }
                ptr = ptr[val];
            });
            if (!ptr.values) {
                ptr.values = [];
            }
            item.hidden = false;
            ptr.values.push(item);
        });
    };
    
    self.renderedChange = function () {
        var rowArr = [];
        var groupArr = [];
        var parseGroup = function (g) {
            if (g.values) {
                angular.forEach(g.values, function (item) {
                    //add the row to our return array
                    groupArr.push(item);
                });
            } else {
                for (var prop in g) {
                    if (prop == NG_FIELD || prop == NG_DEPTH) {
                        continue;
                    } else if (g.hasOwnProperty(prop)) {
                        groupArr.push({ gField: g[NG_FIELD], gLabel: prop, gDepth: g[NG_DEPTH], isAggRow: true });
                        parseGroup(g[prop]);
                    }
                }
            }
        };
        parseGroup(self.groupedData);
        var dataArray = groupArr.slice(self.renderedRange.bottomRow, self.renderedRange.topRow);
        var maxDepth = -1;
        var cols = $scope.columns;
        angular.forEach(dataArray, function (item, indx) {
            var row;
            if (item.isAggRow && maxDepth < item.gDepth) {
                if (!cols[item.gDepth].isAggCol) {
                    maxDepth = Math.max(maxDepth, item.gDepth);
                    cols.splice(item.gDepth, 0, new ng.Column({
                        colDef: {
                            field: '',
                            width: 25,
                            sortable: false,
                            resizable: false,
                            headerCellTemplate: '<div style="width: 100%; height 100%;"></div>',
                        },
                        isAggCol: true,
                        index: item.gDepth,
                        headerRowHeight: grid.config.headerRowHeight
                    }));
                }
                row = self.buildAggregateRow(item, self.renderedRange.bottomRow + indx);
            } else {
                row = self.buildEntityRow(item, self.renderedRange.bottomRow + indx);
            }
            //add the row to our return array
            if (!item.hidden) {
                rowArr.push(row);
            }
        });
        angular.forEach(cols, function (col, i) {
            col.index = i;
        });
        $scope.columns = cols;
        grid.setRenderedRows(rowArr);
    };
}