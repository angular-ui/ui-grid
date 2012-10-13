serviceModule.factory('RowService', ['$scope', function($scope) {
    var RowService = {};

    // we cache rows when they are built, and then blow the cache away when sorting/filtering
    $scope.rowCache = [];
    $scope.dataChanged = true;
    
    RowService.initialize = function (grid) {
        var prevMaxRows = 0, // for comparison purposes when scrolling
            prevMinRows = 0, // for comparison purposes when scrolling
            currentPage = grid.config.currentPage,
            pageSize = grid.config.pageSize,
            ROW_KEY = '__ng_rowIndex__', // constant for the entity's rowCache rowIndex
            prevRenderedRange = new ng.range(0, 1), // for comparison purposes to help throttle re-calcs when scrolling
            prevViewableRange = new ng.range(0, 1), // for comparison purposes to help throttle re-calcs when scrolling
            internalRenderedRange = prevRenderedRange; // for comparison purposes to help throttle re-calcs when scrolling
        
        // short cut to sorted and filtered data
        $scope.dataSource = grid.finalData; //observableArray
        
        // change subscription to clear out our cache
        $scope.$watch(dataSource, function () {
            $scope.dataChanged = true;
            $scope.rowCache = []; //if data source changes, kill this!
        });
        
        // shortcut to the calculated minimum viewport rows
        $scope.minViewportRows = grid.minRowsToRender; //observable
        
        // the # of rows we want to add to the top and bottom of the rendered grid rows 
        $scope.excessRows = 8;
        
        // height of each row
        $scope.rowHeight = grid.config.rowHeight;
        
        // the logic that builds cell objects
        $scope.cellFactory = new ng.cellFactory(grid.columns);
        
        // the actual range the user can see in the viewport
        $scope.viewableRange = prevViewableRange;
        
        // the range of rows that we actually render on the canvas ... essentially 'viewableRange' + 'excessRows' on top and bottom
        $scope.renderedRange = prevRenderedRange;
        
        // the array of rows that we've rendered
        $scope.rows = [];
        // Builds rows for each data item in the 'dataSource'
        // @entity - the data item
        // @rowIndex - the index of the row
        // @pagingOffset - the # of rows to add the the rowIndex in case server-side paging is happening
        $scope.buildRowFromEntity = function (entity, rowIndex, pagingOffset) {
            var row = $scope.rowCache[rowIndex]; // first check to see if we've already built it
            if (!row) {
                // build the row
                row = new ng.row(entity, grid.config, grid.selectionManager);
                row.rowIndex = rowIndex + 1; //not a zero-based rowIndex
                row.rowDisplayIndex = row.rowIndex + pagingOffset;
                row.offsetTop = $scope.rowHeight * rowIndex;
                
                //build out the cells
                $scope.cellFactory.buildRowCells(row);
                
                // finally cache it for the next round
                $scope.rowCache[rowIndex] = row;
            }
            
            // store the row's index on the entity for future ref
            entity[ROW_KEY] = rowIndex;
            
            return row;
        };
        
        // core logic here - anytime we updated the renderedRange, we need to update the 'rows' array 
        $scope.$watch($scope.renderedRange, function (rg) {
            var rowArr = [],
            row,
            pagingOffset = (pageSize() * (currentPage() - 1)),
            dataArr = $scope.dataSource.slice(rg.bottomRow, rg.topRow);
            
            ng.utils.forEach(dataArr, function (item, i) {
                row = $scope.buildRowFromEntity(item, rg.bottomRow + i, pagingOffset);
                
                //add the row to our return array
                rowArr.push(row);
                
                //null the row pointer for next iteration
                row = null;
            });
            $scope.rows = rowArr;
        });
        
        // core logic that intelligently figures out the rendered range given all the contraints that we have
        $scope.calcRenderedRange = function () {
            var rg = $scope.viewableRange,
            minRows = $scope.eminViewportRows,
            maxRows = $scope.dataSource.length,
            isDif = false, // flag to help us see if the viewableRange or data has changed "enough" to warrant re-building our rows
            newRg; // variable to hold our newly-calc'd rendered range 
            
            if (rg) {
                
                isDif = (rg.bottomRow !== prevViewableRange.bottomRow || rg.topRow !== prevViewableRange.topRow || self.dataChanged)
                if (!isDif && prevMaxRows !== maxRows) {
                    isDif = true;
                    rg = new ng.range(prevViewableRange.bottomRow, prevViewableRange.topRow);
                }
                
                if (!isDif && prevMinRows !== minRows) {
                    isDif = true;
                    rg = new ng.range(prevViewableRange.bottomRow, prevViewableRange.topRow);
                }
                
                if (isDif) {
                    //Now build out the new rendered range
                    rg.topRow = rg.bottomRow + minRows;
                    
                    //store it for next rev
                    prevViewableRange = rg;
                    
                    // now build the new rendered range
                    newRg = new ng.range(rg.bottomRow, rg.topRow);
                    
                    // make sure we are within our data constraints (can't render negative rows or rows greater than the # of data items we have)
                    newRg.bottomRow = Math.max(0, rg.bottomRow - $scope.excessRows);
                    newRg.topRow = Math.min(maxRows, rg.topRow + $scope.excessRows);
                    
                    // store them for later comparison purposes
                    prevMaxRows = maxRows;
                    prevMinRows = minRows;
                    
                    //one last equality check
                    if (prevRenderedRange.topRow !== newRg.topRow || prevRenderedRange.bottomRow !== newRg.bottomRow || self.dataChanged) {
                        self.dataChanged = false;
                        prevRenderedRange = newRg;
                        
                        // now kicngff row building
                        self.renderedRange = newRg;
                    }
                }
            } else {
                self.renderedRange = new ng.range(0, 0);
            }
        };
        
        // make sure that if any of these change, we re-fire the calc logic
        $scope.$watch($scope.viewableRange, $scope.calcRenderedRange);
        $scope.$watch($scope.minViewportRows, $scope.calcRenderedRange);
        $scope.$watch($scope.dataSource, $scope.calcRenderedRange);
    };
    
    RowService.DataChanged = {
        get: function()   { return $scope.dataChanged; },
        set: function(val){ $scope.dataChanged = val;  }
    };
    
    RowService.ClearRowCache = function() {
        $scope.rowCache = [];
    };
    
    // change handler subscriptions for disposal purposes (used heavily by the 'rows' binding)
    RowService.RowSubscriptions = {};
    
    RowService.CalcRenderedRange = function(){
        $scope.calcRenderedRange();
    };
    
    return RowService;
}]);