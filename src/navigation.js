//set event binding on the grid so we can select using the up/down keys
var ngMoveSelectionHandler = function($scope, elm, evt, grid) {
    if ($scope.selectionProvider.selectedItems === undefined) {
        return true;
    }
    var charCode = evt.which || evt.keyCode,
        newColumnIndex,
        lastInRow = false,
        firstInRow = false,
        rowIndex = $scope.selectionProvider.lastClickedRow.rowIndex,
        visibleCols = $scope.columns.filter(function(c) { return c.visible; }),
        pinnedCols = $scope.columns.filter(function(c) { return c.pinned; });

    if ($scope.col) {
        newColumnIndex = visibleCols.indexOf($scope.col);
    }
    if(charCode != 37 && charCode != 38 && charCode != 39 && charCode != 40 && charCode != 9 && charCode != 13){
		return true;
	}
    
	if($scope.enableCellSelection){
		if(charCode == 9){ //tab key
			evt.preventDefault();
		}
		var focusedOnFirstColumn = $scope.showSelectionCheckbox ? $scope.col.index == 1 : $scope.col.index == 0;
        var focusedOnFirstVisibleColumns = $scope.$index == 1 || $scope.$index == 0;
        var focusedOnLastVisibleColumns = $scope.$index == ($scope.renderedColumns.length - 1) || $scope.$index == ($scope.renderedColumns.length - 2);
        var focusedOnLastColumn = visibleCols.indexOf($scope.col) == (visibleCols.length - 1);
        var focusedOnLastPinnedColumn = pinnedCols.indexOf($scope.col) == (pinnedCols.length - 1);
        
        if (charCode == 37 || charCode == 9 && evt.shiftKey) {
            var scrollTo = 0;
            if (!focusedOnFirstColumn) {
                newColumnIndex -= 1;
            }
			if (focusedOnFirstVisibleColumns) {
				if(focusedOnFirstColumn && charCode ==  9 && evt.shiftKey){
				    scrollTo = grid.$canvas.width();
					newColumnIndex = visibleCols.length - 1;
					firstInRow = true;
				} else {
				    scrollTo = grid.$viewport.scrollLeft() - $scope.col.width;
				}
			} else if (pinnedCols.length > 0) {
			    scrollTo = grid.$viewport.scrollLeft() - visibleCols[newColumnIndex].width;
			}
            grid.$viewport.scrollLeft(scrollTo);
			
		} else if(charCode == 39 || charCode ==  9 && !evt.shiftKey){
            if (focusedOnLastVisibleColumns) {
				if(focusedOnLastColumn && charCode ==  9 && !evt.shiftKey){
					grid.$viewport.scrollLeft(0);
					newColumnIndex = $scope.showSelectionCheckbox ? 1 : 0;	
					lastInRow = true;
				} else {

				    grid.$viewport.scrollLeft(grid.$viewport.scrollLeft() + $scope.col.width);
				}
            } else if (focusedOnLastPinnedColumn) {
                grid.$viewport.scrollLeft(0);
            }
			if(!focusedOnLastColumn){
				newColumnIndex += 1;
			}
		}
	}
	
	var items;
	if ($scope.configGroups.length > 0) {
	   items = grid.rowFactory.parsedData.filter(function (row) {
		   return !row.isAggRow;
	   });
	} else {
	   items = grid.filteredRows;
	}
	
	var offset = 0;
	if(rowIndex != 0 && (charCode == 38 || charCode == 13 && evt.shiftKey || charCode == 9 && evt.shiftKey && firstInRow)){ //arrow key up or shift enter or tab key and first item in row
		offset = -1;
	} else if(rowIndex != items.length - 1 && (charCode == 40 || charCode == 13 && !evt.shiftKey || charCode == 9 && lastInRow)){//arrow key down, enter, or tab key and last item in row?
		offset = 1;
	} 
    
	if (offset) {
	    var r = items[rowIndex + offset];
	    if (r.beforeSelectionChange(r, evt)) {
	        r.continueSelection(evt);
	        $scope.$emit('ngGridEventDigestGridParent');

	        if ($scope.selectionProvider.lastClickedRow.renderedRowIndex >= $scope.renderedRows.length - EXCESS_ROWS - 2) {
	            grid.$viewport.scrollTop(grid.$viewport.scrollTop() + $scope.rowHeight);
	        } else if ($scope.selectionProvider.lastClickedRow.renderedRowIndex <= EXCESS_ROWS + 2) {
	            grid.$viewport.scrollTop(grid.$viewport.scrollTop() - $scope.rowHeight);
	        }
	    }
	}
    
    if($scope.enableCellSelection){
        setTimeout(function(){
            $scope.domAccessProvider.focusCellElement($scope, $scope.renderedColumns.indexOf(visibleCols[newColumnIndex]));
        },3);
    }
    return false;
};
