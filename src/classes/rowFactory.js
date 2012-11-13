/// <reference path="../namespace.js" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js" />
ng.RowFactory = function (grid, $scope) {
    var self = this;
    // we cache rows when they are built, and then blow the cache away when sorting
    self.rowCache = [];
    self.aggCache = {};
    self.dataChanged = true;
    self.prevMaxRows = 0; // for comparison purposes when scrolling
    self.prevMinRows = 0; // for comparison purposes when scrolling
    self.rowConfig = {};
    self.selectionService = undefined;
    self.rowHeight = 30;
    self.prevRenderedRange = undefined; // for comparison purposes to help throttle re-calcs when scrolling
    self.prevViewableRange = undefined; // for comparison purposes to help throttle re-calcs when scrolling
    self.numberOfAggregates = 0;
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

    self.buildAggregateRow = function (aggEntity, rowIndex) {
        var agg = self.aggCache[aggEntity.aggIndex]; // first check to see if we've already built it 
        if (!agg) {
            // build the row
            agg = new ng.Aggregate(aggEntity, self);
            self.aggCache[aggEntity.aggIndex] = agg;
        }
        agg.index = rowIndex + 1; //not a zero-based rowIndex
        agg.offsetTop = self.rowHeight * rowIndex;
        // finally cache it for the next round
        // store the row's index on the entity for future ref
        aggEntity[ROW_KEY] = rowIndex;
        return agg;
    };

    // core logic that intelligently figures out the rendered range given all the contraints that we have
    self.CalcRenderedRange = function () {
        var rg = self.renderedRange,
		    minRows = grid.minRowsToRender(),
		    maxRows = Math.max(grid.sortedData.length + self.numberOfAggregates, grid.minRowsToRender()),
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

    self.renderedChangeNoGroups = function () {
        var rowArr = [];
        var dataArr = grid.sortedData.slice(self.renderedRange.bottomRow, self.renderedRange.topRow);

        angular.forEach(dataArr, function (item, i) {
            var row = self.buildEntityRow(item, self.renderedRange.bottomRow + i);
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
        if (grid.config.groups.length > 0) {
            self.getGrouping(grid.config.groups);
            self.parsedData.needsUpdate = true;
        }
        self.CalcRenderedRange();
    };

    self.Initialize = function (config) {
        self.prevMaxRows = 0; // for comparison purposes when scrolling
        self.prevMinRows = 0; // for comparison purposes when scrolling
        // height of each row
        self.rowConfig = config.rowConfig;
        self.selectionService = config.selectionService;
        self.rowHeight = config.rowHeight;
        var i = grid.minRowsToRender();
        self.prevRenderedRange = new ng.Range(0, i); // for comparison purposes to help throttle re-calcs when scrolling
        self.prevViewableRange = new ng.Range(0, i); // for comparison purposes to help throttle re-calcs when scrolling
        // the actual range the user can see in the viewport
        self.renderedRange = self.prevRenderedRange;
        if (grid.config.groups.length > 0) {
            self.getGrouping(grid.config.groups);
        }
        self.sortedDataChanged();
        self.parsedData.needsUpdate = true;
    };
    
    self.getGrouping = function (groups) {
        self.aggCache = [];
        self.rowCache = [];
        self.numberOfAggregates = 0;
        self.groupedData = { };
        // Here we set the onmousedown event handler to the header container.
        var data = grid.sortedData;
        var maxDepth = groups.length;
        var cols = $scope.columns;

        angular.forEach(data, function (item) {
            var ptr = self.groupedData;
            angular.forEach(groups, function (group, depth) {
                if (!cols[depth].isAggCol && depth <= maxDepth) {
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
            item[NG_HIDDEN] = true;
            ptr.values.push(item);
        });
        //fix column indexes
        angular.forEach(cols, function (col, i) {
            col.index = i;
        });
        $scope.columns = cols;
        grid.cssBuilder.buildStyles();
    };
    
    self.parsedData = { needsUpdate: true, values: [] };
    
    self.renderedChange = function () {
        if (grid.config.groups.length < 1) {
            self.renderedChangeNoGroups();
            grid.refreshDomSizes();
            return;
        }
        var rowArr = [];
        if (self.parsedData.needsUpdate) {
            self.parsedData.values.length = 0;
            self.parseGroupData(self.groupedData);
            self.parsedData.needsUpdate = false;
        }
        var dataArray = self.parsedData.values.filter(function (e) {
             return e[NG_HIDDEN] === false;
        }).slice(self.renderedRange.bottomRow, self.renderedRange.topRow);
        angular.forEach(dataArray, function (item, indx) {
            var row;
            if (item.isAggRow) {
                row = self.buildAggregateRow(item, self.renderedRange.bottomRow + indx);
            } else {
                row = self.buildEntityRow(item, self.renderedRange.bottomRow + indx);
            }
            //add the row to our return array
            rowArr.push(row);
        });
        grid.setRenderedRows(rowArr);
        grid.refreshDomSizes();
    };
    
    //magical recursion. it works. I swear it.
    var parentAgg = undefined;
    self.parseGroupData = function (g) {
        if (g.values) {
            angular.forEach(g.values, function (item) {
                parentAgg.children.push(item);
                //add the row to our return array
                self.parsedData.values.push(item);
            });
            parentAgg = parentAgg.parent;
        } else {
            for (var prop in g) {
                if (prop == NG_FIELD || prop == NG_DEPTH) {
                    continue;
                } else if (g.hasOwnProperty(prop)) {
                    var agg = self.buildAggregateRow({
                        gField: g[NG_FIELD],
                        gLabel: prop,
                        gDepth: g[NG_DEPTH],
                        isAggRow: true,
                        '_ng_hidden_': false,
                        children: [],
                        aggChildren: [],
                        aggIndex: self.numberOfAggregates++,
                        parent: parentAgg
                    }, 0);
                    //we want the aggregates that are at a deeper level and aren't already children.
                    if (agg.entity.parent && agg.entity.parent.aggChildren.indexOf(agg) == -1 && agg.depth > parentAgg.depth) {
                        agg.entity.parent.collapsed = false;
                        agg.entity.parent.aggChildren.push(agg);
                    }
                    self.parsedData.values.push(agg.entity);
                    parentAgg = agg;
                    self.parseGroupData(g[prop]);
                }
            }
        }
    };
}