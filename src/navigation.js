//set event binding on the grid so we can select using the up/down keys
ng.moveSelectionHandler = function($scope, elm, evt, grid) {
    if ($scope.selectionService.selectedItems === undefined) {
        return true;
    }
    var charCode = evt.which || evt.keyCode;
	
    var newColumnIndex = $scope.$index;
    
	var lastInRow = false;
	var firstInRow = false;
    
	if($scope.enableCellSelection){
		if(charCode == 9){ //tab key
			evt.preventDefault();
		}
        var focusedOnFirstColumn =  $scope.displaySelectionCheckbox ? ($scope.col.index == 1) : ($scope.col.index == 0);
        var focusedOnFirstVisibleColumn = ($scope.$index === 0);
        var focusedOnLastVisibleColumn = ($scope.$index === ($scope.renderedColumns.length - 1));
        var focusedOnLastColumn = ($scope.col.index == ($scope.columns.length - 1));
        var toScroll;
        
		if((charCode == 37 || charCode ==  9 && evt.shiftKey)){
			if (focusedOnFirstVisibleColumn) {
				toScroll = grid.$viewport.scrollLeft() - $scope.col.width;
				grid.$viewport.scrollLeft(Math.max(toScroll, 0));
			} 
			if(!focusedOnFirstColumn){
				newColumnIndex -= 1;
			}
			newColumnIndex -= 1;
		} else if((charCode == 39 || charCode ==  9 && !evt.shiftKey)){
            if (focusedOnLastVisibleColumn) {
				toScroll = grid.$viewport.scrollLeft() + $scope.col.width;
				grid.$viewport.scrollLeft(Math.min(toScroll, grid.$canvas.width() - grid.$viewport.width()));
			}
			if(!focusedOnLastColumn){
				newColumnIndex += 1;
			}
			newColumnIndex += 1;
		} else if((charCode == 9 && !evt.shiftKey) && focusedOnLastColumn){
			newColumnIndex = 0;	
			lastInRow = true;
		} else if((charCode == 9 && evt.shiftKey) && focusedOnFirstColumn){
			newColumnIndex = $scope.columns.length - 1;
			firstInRow = true;
		}
	}
	
	var offset = 0;
	if (charCode == 9 && lastInRow){//Tab Key and Last Item in Row?
		offset = 1;
	} else if((charCode == 9 && evt.shiftKey) && firstInRow){ // Same as above. But with Shiftkey pressed.
		offset = -1;
	} else if(charCode == 38 || (charCode == 13 && evt.shiftKey)){ //arrow key up or shift enter
		offset = -1;
	} else if(charCode == 40 || charCode == 13){//arrow key down or enter
		offset = 1;
	} else if(charCode != 37 && charCode != 39 && charCode != 9){
		return true;
	}
	
	var items;
	if ($scope.configGroups.length > 0) {
	   items = grid.rowFactory.parsedData.filter(function (row) {
		   return !row.isAggRow;
	   });
	} else {
	   items = grid.filteredRows;
	}
	
    var index = $scope.selectionService.lastClickedRow.rowIndex + offset;
    if (index < 0 || index >= items.length) {
        return true;
    }
	if(charCode != 37 && charCode != 39){
		$scope.selectionService.ChangeSelection(items[index], evt);
	}
	
	if($scope.enableCellSelection){
		$scope.domAccessProvider.focusCellElement($scope, newColumnIndex);
		$scope.$emit('ngGridEventDigestGridParent');
	} else {	
		if (index >= items.length - EXCESS_ROWS - 1) {
			elm.scrollTop(elm.scrollTop() + ($scope.rowHeight * 2));
		} else if (index <= EXCESS_ROWS) {
			elm.scrollTop(elm.scrollTop() - ($scope.rowHeight * 2));
		}	
		$scope.$emit('ngGridEventDigestGrid');
	}
    return false;
};
