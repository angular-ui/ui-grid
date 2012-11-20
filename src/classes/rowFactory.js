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
	var parents = []; // Used for grouping and is cleared each time groups are calulated.
    // Builds rows for each data item in the 'sortedData'
    // @entity - the data item
    // @rowIndex - the index of the row
    self.buildEntityRow = function (entity, rowIndex, pagingOffset) {
        var row = self.rowCache[rowIndex]; // first check to see if we've already built it
        if (!row) {
            // build the row
            row = new ng.Row(entity, self.rowConfig, self.selectionService);
            row.rowIndex = rowIndex + 1; //not a zero-based rowIndex
            row.rowDisplayIndex = row.rowIndex + pagingOffset;
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
        var pagingOffset = ($scope.pagingOptions.pageSize * ($scope.pagingOptions.currentPage - 1));
        var dataArr = grid.sortedData.slice(self.renderedRange.bottomRow, self.renderedRange.topRow);

        angular.forEach(dataArr, function (item, i) {
            var row = self.buildEntityRow(item, self.renderedRange.bottomRow + i, pagingOffset);
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
                            headerCellTemplate: '<div class="ngAggHeader"></div>',
                        },
                        isAggCol: true,
                        index: item.gDepth,
                        headerRowHeight: grid.config.headerRowHeight
                    }));
                }
                var col = cols.filter(function(c) {
                    return c.field == group;
                })[0];
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
                if (!ptr[NG_COLUMN]) {
                    ptr[NG_COLUMN] = col;
                }
                ptr = ptr[val];
            });
            if (!ptr.values) {
                ptr.values = [];
            }
            item[NG_HIDDEN] = true;
            ptr.values.push(item);
        });
        grid.fixColumnIndexes();
    };
    
    self.parsedData = { needsUpdate: true, values: [] };
    
    self.renderedChange = function () {
        if (grid.config.groups.length < 1) {
            self.renderedChangeNoGroups();
            grid.refreshDomSizes();
            return;
        }
        var rowArr = [];
		parents = [];
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
    self.parseGroupData = function (g) {
        if (g.values) {
            angular.forEach(g.values, function (item) {
                // get the last parent in the array because that's where our children want to be
                parents[parents.length -1].children.push(item);
                //add the row to our return array
                self.parsedData.values.push(item);
            });
        } else {
            for (var prop in g) {
                // exclude the meta properties.
                if (prop == NG_FIELD || prop == NG_DEPTH || prop == NG_COLUMN) {
                    continue;
                } else if (g.hasOwnProperty(prop)) {
                    //build the aggregate row
                    var agg = self.buildAggregateRow({
                        gField: g[NG_FIELD],
                        gLabel: prop,
                        gDepth: g[NG_DEPTH],
                        isAggRow: true,
                        '_ng_hidden_': false,
                        children: [],
                        aggChildren: [],
                        aggIndex: self.numberOfAggregates++,
                        aggLabelFilter: g[NG_COLUMN].aggLabelFilter
                    }, 0);
                    //set the aggregate parent to the parent in the array that is one less deep.
                    agg.parent = parents[agg.depth - 1];
                    // if we have a parent, set the parent to not be collapsed and append the current agg to its children
                    if (agg.parent) {
                        agg.parent.collapsed = false;
                        agg.parent.aggChildren.push(agg);
                    }
                    // add the aggregate row to the parsed data.
                    self.parsedData.values.push(agg.entity);
                    // the current aggregate now the parent of the current depth
                    parents[agg.depth] = agg;
                    // dig deeper for more aggregates or children.
                    self.parseGroupData(g[prop]);
                }
            }
        }
    };
}