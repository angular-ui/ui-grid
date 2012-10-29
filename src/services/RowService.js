/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../classes/grid.js" />
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

ngGridServices.factory('RowService', function () {
    var rowService = {};

    // we cache rows when they are built, and then blow the cache away when sorting/filtering
    rowService.rowCache = [];
    rowService.dataChanged = true;
    rowService.dataSource = [];
    rowService.prevMaxRows = 0; // for comparison purposes when scrolling
    rowService.prevMinRows = 0; // for comparison purposes when scrolling
    rowService.rowConfig = {};
    rowService.selectionService = undefined;
    rowService.minRowsToRender = undefined;
    rowService.rowHeight = 30;
    rowService.setRenderedRowsCallback = undefined;
    rowService.prevRenderedRange = undefined; // for comparison purposes to help throttle re-calcs when scrolling
    rowService.prevViewableRange = undefined; // for comparison purposes to help throttle re-calcs when scrolling
    
	// Builds rows for each data item in the 'dataSource'
	// @entity - the data item
	// @rowIndex - the index of the row
	rowService.buildRowFromEntity = function (entity, rowIndex) {
		var row = rowService.rowCache[rowIndex]; // first check to see if we've already built it
		if (!row) {
			// build the row
		    row = new ng.Row(entity, rowService.rowConfig, rowService.selectionService);
			row.rowIndex = rowIndex + 1; //not a zero-based rowIndex
			row.rowDisplayIndex = row.rowIndex;
			row.offsetTop = rowService.rowHeight * rowIndex;
		    row.selected = entity[SELECTED_PROP];
			// finally cache it for the next round
			rowService.rowCache[rowIndex] = row;
		}
		// store the row's index on the entity for future ref
		entity[ROW_KEY] = rowIndex;
		return row;
	};
	
	// core logic that intelligently figures out the rendered range given all the contraints that we have
	rowService.CalcRenderedRange = function () {
		var rg = rowService.renderedRange,
		    minRows = rowService.minRowsToRender(),
		    maxRows = rowService.dataSource.length,
		    prevMaxRows = rowService.prevMaxRows,
		    prevMinRows = rowService.prevMinRows,
		    isDif, // flag to help us see if the viewableRange or data has changed "enough" to warrant re-building our rows
		    newRg = new ng.Range(0, 0); // variable to hold our newly-calc'd rendered range 
		
		isDif = (rg.bottomRow !== rowService.prevViewableRange.bottomRow || rg.topRow !== rowService.prevViewableRange.topRow || rowService.dataChanged);
		if (!isDif && prevMaxRows !== maxRows) {
			isDif = true;
			rg = new ng.Range(rowService.prevViewableRange.bottomRow, rowService.prevViewableRange.topRow);
		}
		if (!isDif && prevMinRows !== minRows) {
			isDif = true;
			rg = new ng.Range(rowService.prevViewableRange.bottomRow, rowService.prevViewableRange.topRow);
		}
		if (isDif) {
		    //store it for next rev
		    rowService.prevViewableRange = rg;
		    // now build the new rendered range
		    newRg = new ng.Range(rg.bottomRow, rg.topRow);
		    // make sure we are within our data constraints (can't render negative rows or rows greater than the # of data items we have)
		    newRg.bottomRow = Math.max(0, rg.bottomRow - EXCESS_ROWS);
		    newRg.topRow = Math.min(maxRows, rg.topRow + EXCESS_ROWS);
		    // store them for later comparison purposes
		    rowService.prevMaxRows = maxRows;
		    rowService.prevMinRows = minRows;
		    //one last equality check
		    if (rowService.prevRenderedRange.topRow !== newRg.topRow || rowService.prevRenderedRange.bottomRow !== newRg.bottomRow || rowService.dataChanged) {
		        rowService.dataChanged = false;
		        rowService.prevRenderedRange = newRg;
		    }
		}
	    rowService.UpdateViewableRange(newRg);
	};
		
	rowService.renderedChange = function () {
		var rowArr = [];
		var dataArr = rowService.dataSource.slice(rowService.renderedRange.bottomRow, rowService.renderedRange.topRow);

		angular.forEach(dataArr, function (item, i) {
			var row = rowService.buildRowFromEntity(item, rowService.renderedRange.bottomRow + i);

			//add the row to our return array
			rowArr.push(row);
		});
	    rowService.setRenderedRowsCallback(rowArr);
	};
	
	rowService.UpdateViewableRange = function (newRange) {
	    rowService.renderedRange = newRange;
	    rowService.renderedChange();
    };
    
	rowService.sortedDataChanged = function (newVal) {
	    rowService.dataSource = newVal;
        rowService.dataChanged = true;
        rowService.rowCache = []; //if data source changes, kill this!
        rowService.CalcRenderedRange();
	};
    
	rowService.Initialize = function (config) {
	    rowService.prevMaxRows = 0; // for comparison purposes when scrolling
	    rowService.prevMinRows = 0; // for comparison purposes when scrolling
	    // height of each row
	    rowService.rowConfig = config.rowConfig;
	    rowService.selectionService = config.selectionService;
	    rowService.minRowsToRender = config.minRowsToRenderCallback;
	    rowService.rowHeight = config.rowHeight;
	    rowService.setRenderedRowsCallback = config.setRenderedRowsCallback;
	    rowService.prevRenderedRange = new ng.Range(0, rowService.minRowsToRender()); // for comparison purposes to help throttle re-calcs when scrolling
	    rowService.prevViewableRange = new ng.Range(0, rowService.minRowsToRender()); // for comparison purposes to help throttle re-calcs when scrolling
	    // the actual range the user can see in the viewport
	    rowService.renderedRange = rowService.prevRenderedRange;
	    rowService.sortedDataChanged(config.sortedData);
	};
    
    return rowService;
});