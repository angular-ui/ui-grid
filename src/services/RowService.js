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
	rowService = {};

    // we cache rows when they are built, and then blow the cache away when sorting/filtering
    rowService.rowCache = [];
    rowService.dataChanged = true;
    rowService.dataSource = [];
    rowService.prevMaxRows = 0; // for comparison purposes when scrolling
    rowService.prevMinRows = 0; // for comparison purposes when scrolling
    
    rowService.Initialize = function ($scope, grid) {
        rowService.$scope = $scope;
		rowService.renderedRows = [];
        rowService.prevMaxRows = 0; // for comparison purposes when scrolling
        rowService.prevMinRows = 0; // for comparison purposes when scrolling
        rowService.currentPage = grid.config.currentPage;
        rowService.rowHeight = grid.config.rowHeight;
        rowService.grid = grid;
        rowService.pageSize = grid.config.pageSize;// constant for the entity's rowCache rowIndex
        rowService.prevRenderedRange = new ng.Range(0, 1); // for comparison purposes to help throttle re-calcs when scrolling
        rowService.prevViewableRange = new ng.Range(0, 1); // for comparison purposes to help throttle re-calcs when scrolling
             // for comparison purposes to help throttle re-calcs when scrolling
        rowService.internalRenderedRange = rowService.prevRenderedRange;
        // short cut to sorted and filtered data
        rowService.dataSource = $scope.sortedData; 
        
        // shortcut to the calculated minimum viewport rows
        rowService.$scope.minViewportRows = grid.minRowsToRender(); 
        
        // the # of rows we want to add to the top and bottom of the rendered grid rows 
        rowService.excessRows = 8;
        
        // height of each row
        rowService.rowHeight = grid.config.rowHeight;
        
        // the actual range the user can see in the viewport
        rowService.$scope.viewableRange = rowService.prevViewableRange;
		
		// the range of rows that we actually render on the canvas ... essentially 'viewableRange' + 'excessRows' on top and bottom
        rowService.$scope.renderedRange = rowService.prevRenderedRange;
        // core logic here - anytime we updated the renderedRange, we need to update the 'rows' array     
        $scope.$watch(rowService.$scope.renderedRange, rowService.renderedChange);
        // make sure that if any of these change, we re-fire the calc logic
        $scope.$watch(rowService.$scope.viewableRange, rowService.CalcRenderedRange);

        $scope.$watch(rowService.$scope.minViewportRows, rowService.CalcRenderedRange);

		$scope.$watch('sortedData', rowService.CalcRenderedRange);
    };
	
	// Builds rows for each data item in the 'dataSource'
	// @entity - the data item
	// @rowIndex - the index of the row
	// @pagingOffset - the # of rows to add the the rowIndex in case server-side paging is happening
	rowService.buildRowFromEntity = function (entity, rowIndex, pagingOffset) {
		var row = rowService.rowCache[rowIndex]; // first check to see if we've already built it
		if (!row) {
			// build the row
		    row = new ng.Row(entity, rowService.grid.config, rowService.grid.selectionService);
			row.rowIndex = rowIndex + 1; //not a zero-based rowIndex
			row.rowDisplayIndex = row.rowIndex + pagingOffset;
			row.offsetTop = rowService.rowHeight * rowIndex;
			
			// finally cache it for the next round
			rowService.rowCache[rowIndex] = row;
		}
		
		// store the row's index on the entity for future ref
		entity[ROW_KEY] = rowIndex;
		
		return row;
	};
	
	// core logic that intelligently figures out the rendered range given all the contraints that we have
	rowService.CalcRenderedRange = function () {
		var rg = rowService.$scope.viewableRange,
		minRows = rowService.$scope.minViewportRows,
		maxRows = rowService.dataSource.length,
		prevMaxRows = rowService.prevMaxRows,
		prevMinRows = rowService.prevMinRows,
		isDif, // flag to help us see if the viewableRange or data has changed "enough" to warrant re-building our rows
		newRg; // variable to hold our newly-calc'd rendered range 
		
		if (rg) {

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
				//Now build out the new rendered range
				rg.topRow = rg.bottomRow + minRows;
				
				//store it for next rev
				rowService.prevViewableRange = rg;
				
				// now build the new rendered range
				newRg = new ng.Range(rg.bottomRow, rg.topRow);
				
				// make sure we are within our data constraints (can't render negative rows or rows greater than the # of data items we have)
				newRg.bottomRow = Math.max(0, rg.bottomRow - rowService.excessRows);
				newRg.topRow = Math.min(maxRows, rg.topRow + rowService.excessRows);
				
				// store them for later comparison purposes
				rowService.prevMaxRows = maxRows;
				rowService.prevMinRows = minRows;
				
				//one last equality check
				if (rowService.prevRenderedRange.topRow !== newRg.topRow || rowService.prevRenderedRange.bottomRow !== newRg.bottomRow || rowService.dataChanged) {
					rowService.dataChanged = false;
					rowService.prevRenderedRange = newRg;
					
					// now kicngff row building
					rowService.$scope.renderedRange = newRg;
				}
			}
		} else {
			rowService.$scope.renderedRange = new ng.Range(0, 0);
		}
	};
		
	rowService.renderedChange = function () {
		var rowArr = [],
			pagingOffset = rowService.pageSize * (rowService.currentPage - 1);
		var dataArr = rowService.dataSource;//.slice(rowService.$scope.renderedRange.bottomRow, rowService.$scope.renderedRange.topRow);

		angular.forEach(dataArr, function (item, i) {
			var row = rowService.buildRowFromEntity(item, rowService.$scope.renderedRange.bottomRow + i, pagingOffset);

			//add the row to our return array
			rowArr.push(row);
		});
		rowService.renderedRows = rowArr;
	};
	
	rowService.UpdateViewableRange = function (newRange) {
	    rowService.$scope.renderedRange = newRange;
	    rowService.renderedChange();
    };
    
    rowService.ClearRowCache = function() {
        rowService.rowCache = [];
    };
    
    // change handler subscriptions for disposal purposes (used heavily by the 'rows' binding)
    rowService.RowSubscriptions = {};
    
    return rowService;
});