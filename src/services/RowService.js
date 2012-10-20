/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../classes/grid.js" />
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

ngGridServices.factory('RowService', ['$rootScope', function ($scope) {
    var rowService = {};
	$scope._rowService = {};

    // we cache rows when they are built, and then blow the cache away when sorting/filtering
    $scope._rowService.rowCache = [];
    $scope._rowService.dataChanged = true;
    $scope._rowService.dataSource = [];
    
    rowService.Initialize = function (options, grid) {
        $scope._rowService.prevMaxRows = 0; // for comparison purposes when scrolling
        $scope._rowService.prevMinRows = 0; // for comparison purposes when scrolling
        $scope._rowService.currentPage = grid.config.currentPage;
        $scope._rowService.rowHeight = grid.config.rowHeight;
        $scope._rowService.grid = grid;
        $scope._rowService.pageSize = grid.config.pageSize;// constant for the entity's rowCache rowIndex
        $scope._rowService.prevRenderedRange = new ng.Range(0, 1); // for comparison purposes to help throttle re-calcs when scrolling
        $scope._rowService.prevViewableRange = new ng.Range(0, 1); // for comparison purposes to help throttle re-calcs when scrolling
             // for comparison purposes to help throttle re-calcs when scrolling
        $scope._rowService.internalRenderedRange = $scope._rowService.prevRenderedRange;
        // short cut to sorted and filtered data
        $scope._rowService.dataSource = options.data; //observableArray
        
        // change subscription to clear out our cache
        $scope.$watch($scope._rowService.dataSource, function () {
            $scope._rowService.dataChanged = true;
            $scope._rowService.rowCache = []; //if data source changes, kill this!
        });
        
        // shortcut to the calculated minimum viewport rows
        $scope._rowService.minViewportRows = grid.minRowsToRender; //observable
        
        // the # of rows we want to add to the top and bottom of the rendered grid rows 
        $scope._rowService.excessRows = 8;
        
        // height of each row
        $scope._rowService.rowHeight = grid.config.rowHeight;
        
        // the actual range the user can see in the viewport
        $scope._rowService.viewableRange = $scope._rowService.prevViewableRange;	
		
		// the range of rows that we actually render on the canvas ... essentially 'viewableRange' + 'excessRows' on top and bottom
        $scope._rowService.renderedRange = $scope._rowService.prevRenderedRange;
		
		$scope._rowService.renderedRange = $scope._rowService.renderedChange();
        
        // core logic here - anytime we updated the renderedRange, we need to update the 'rows' array 
        //$scope.$watch($scope._rowService.renderedRange, $scope._rowService.renderedChange);     
        
        // make sure that if any of these change, we re-fire the calc logic
        $scope.$watch($scope._rowService.viewableRange, function(){
			$scope._rowService.calcRenderedRange();
		});		
        $scope.$watch($scope._rowService.minViewportRows, function(){
			$scope._rowService.calcRenderedRange();
		});		
        $scope.$watch($scope._rowService.dataSource, function(){
			$scope._rowService.calcRenderedRange();
		});		
    };
	
	// Builds rows for each data item in the 'dataSource'
	// @entity - the data item
	// @rowIndex - the index of the row
	// @pagingOffset - the # of rows to add the the rowIndex in case server-side paging is happening
	$scope._rowService.buildRowFromEntity = function (entity, rowIndex, pagingOffset) {
		var row = $scope._rowService.rowCache[rowIndex]; // first check to see if we've already built it
		if (!row) {
			// build the row
			row = new ng.Row(entity, $scope._rowService.grid.config, $scope._rowService.grid.selectionManager);
			row.rowIndex = rowIndex + 1; //not a zero-based rowIndex
			row.rowDisplayIndex = row.rowIndex + pagingOffset;
			row.offsetTop = $scope._rowService.rowHeight * rowIndex;
			
			// finally cache it for the next round
			$scope._rowService.rowCache[rowIndex] = row;
		}
		
		// store the row's index on the entity for future ref
		entity[ROW_KEY] = rowIndex;
		
		return row;
	};
	
	// core logic that intelligently figures out the rendered range given all the contraints that we have
	$scope._rowService.calcRenderedRange = function () {
		var rg = $scope._rowService.viewableRange,
		minRows = $scope._rowService.eminViewportRows,
		maxRows = $scope._rowService.dataSource.length,
		isDif, // flag to help us see if the viewableRange or data has changed "enough" to warrant re-building our rows
		newRg; // variable to hold our newly-calc'd rendered range 
		
		if (rg) {

			isDif = (rg.bottomRow !== $scope._rowService.prevViewableRange.bottomRow || rg.topRow !== $scope._rowService.prevViewableRange.topRow || $scope._rowService.dataChanged);
			if (!isDif && prevMaxRows !== maxRows) {
				isDif = true;
				rg = new ng.Range($scope._rowService.prevViewableRange.bottomRow, $scope._rowService.prevViewableRange.topRow);
			}
			
			if (!isDif && prevMinRows !== minRows) {
				isDif = true;
				rg = new ng.Range($scope._rowService.prevViewableRange.bottomRow, $scope._rowService.prevViewableRange.topRow);
			}
			
			if (isDif) {
				//Now build out the new rendered range
				rg.topRow = rg.bottomRow + minRows;
				
				//store it for next rev
				$scope._rowService.prevViewableRange = rg;
				
				// now build the new rendered range
				newRg = new ng.Range(rg.bottomRow, rg.topRow);
				
				// make sure we are within our data constraints (can't render negative rows or rows greater than the # of data items we have)
				newRg.bottomRow = Math.max(0, rg.bottomRow - $scope.excessRows);
				newRg.topRow = Math.min(maxRows, rg.topRow + $scope.excessRows);
				
				// store them for later comparison purposes
				prevMaxRows = maxRows;
				prevMinRows = minRows;
				
				//one last equality check
				if ($scope._rowService.prevRenderedRange.topRow !== newRg.topRow || $scope._rowService.prevRenderedRange.bottomRow !== newRg.bottomRow || $scope._rowService.dataChanged) {
					$scope._rowService.dataChanged = false;
					$scope._rowService.prevRenderedRange = newRg;
					
					// now kicngff row building
					$scope._rowService.renderedRange = newRg;
				}
			}
		} else {
			$scope._rowService.renderedRange = new ng.Range(0, 0);
		}
	};
		
	$scope._rowService.renderedChange = function () {
		var rowArr = [],
			pagingOffset = $scope._rowService.pageSize * ($scope._rowService.currentPage - 1);
		var dataArr = $scope._rowService.dataSource; //.slice($scope._rowService.renderedRange.bottomRow, $scope._rowService.renderedRange.topRow);

		angular.forEach(dataArr, function (item, i) {
			var row = $scope._rowService.buildRowFromEntity(item, $scope._rowService.renderedRange.bottomRow + i, pagingOffset);

			//add the row to our return array
			rowArr.push(row);
		});
		$scope._rowService.rows = rowArr;
	};
	
	
	
    rowService.RowsToDisplay = function() {
		return $scope._rowService.rows;
    };
	
    rowService.DataChanged = {
        get: function()   { return $scope._rowService.dataChanged; },
        set: function(val){ $scope._rowService.dataChanged = val;  }
    };
    
    rowService.ClearRowCache = function() {
        $scope._rowService.rowCache = [];
    };
    
    // change handler subscriptions for disposal purposes (used heavily by the 'rows' binding)
    rowService.RowSubscriptions = {};
    
    rowService.CalcRenderedRange = function(){
        $scope._rowService.calcRenderedRange();
    };

    rowService.ViewableRange = function () {
        return $scope._rowService.viewableRange;
    };
    
    return rowService;
}]);