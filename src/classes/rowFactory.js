ng.RowFactory = function (grid) {
    var self = this;

    // we cache rows when they are built, and then blow the cache away when sorting
    self.rowCache = [];
    self.dataChanged = true;
    self.prevMaxRows = 0; // for comparison purposes when scrolling
    self.prevMinRows = 0; // for comparison purposes when scrolling
    self.rowConfig = {};
    self.selectionService = undefined;
    self.minRowsToRender = undefined;
    self.rowHeight = 30;
    self.setRenderedRowsCallback = undefined;
    self.prevRenderedRange = undefined; // for comparison purposes to help throttle re-calcs when scrolling
    self.prevViewableRange = undefined; // for comparison purposes to help throttle re-calcs when scrolling

    // Builds rows for each data item in the 'sortedData'
    // @entity - the data item
    // @rowIndex - the index of the row
    self.buildRowFromEntity = function (entity, rowIndex) {
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

    // core logic that intelligently figures out the rendered range given all the contraints that we have
    self.CalcRenderedRange = function () {
        var rg = self.renderedRange,
		    minRows = self.minRowsToRender(),
		    maxRows = grid.sortedData.length,
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

    self.renderedChange = function () {
        var rowArr = [];
        var dataArr = grid.sortedData.slice(self.renderedRange.bottomRow, self.renderedRange.topRow);

        angular.forEach(dataArr, function (item, i) {
            var row = self.buildRowFromEntity(item, self.renderedRange.bottomRow + i);

            //add the row to our return array
            rowArr.push(row);
        });
        self.setRenderedRowsCallback(rowArr);
    };

    self.UpdateViewableRange = function (newRange) {
        self.renderedRange = newRange;
        self.renderedChange();
    };

    self.sortedDataChanged = function () {
        self.dataChanged = true;
        self.rowCache = []; //if data source changes, kill this!
        self.CalcRenderedRange();
    };

    self.Initialize = function (config) {
        self.prevMaxRows = 0; // for comparison purposes when scrolling
        self.prevMinRows = 0; // for comparison purposes when scrolling
        // height of each row
        self.rowConfig = config.rowConfig;
        self.selectionService = config.selectionService;
        self.minRowsToRender = config.minRowsToRenderCallback;
        self.rowHeight = config.rowHeight;
        self.setRenderedRowsCallback = config.setRenderedRowsCallback;
        self.prevRenderedRange = new ng.Range(0, self.minRowsToRender()); // for comparison purposes to help throttle re-calcs when scrolling
        self.prevViewableRange = new ng.Range(0, self.minRowsToRender()); // for comparison purposes to help throttle re-calcs when scrolling
        // the actual range the user can see in the viewport
        self.renderedRange = self.prevRenderedRange;
        self.sortedDataChanged();
    };
}