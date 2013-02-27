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
        var focusedOnFirstColumn =  $scope.displaySelectionCheckbox ? $scope.col.index == 1 : $scope.col.index == 0;
        var focusedOnFirstVisibleColumn = $scope.displaySelectionCheckbox && grid.config.enablePinning ? $scope.$index == 1 : $scope.$index == 0;
        var focusedOnLastVisibleColumn = $scope.$index == ($scope.renderedColumns.length - 1);
        var focusedOnLastColumn = $scope.col.index == ($scope.columns.length - 1);
        var toScroll;
        
		if((charCode == 37 || charCode ==  9 && evt.shiftKey)){
			if (focusedOnFirstVisibleColumn) {
				toScroll = grid.$viewport.scrollLeft() - $scope.col.width;
				if(focusedOnFirstColumn){
					grid.$viewport.scrollLeft(grid.$canvas.width() - grid.$viewport.width());
					newColumnIndex = $scope.columns.length - 1;
					firstInRow = true;
				} else {
					grid.$viewport.scrollLeft(Math.max(toScroll, 0));
				}
			} 
			if(!focusedOnFirstColumn){
				newColumnIndex -= 1;
			}
		} else if((charCode == 39 || charCode ==  9 && !evt.shiftKey)){
            if (focusedOnLastVisibleColumn) {
				toScroll = grid.$viewport.scrollLeft() + $scope.col.width;
				if(focusedOnLastColumn){
					grid.$viewport.scrollLeft(0);
					newColumnIndex = $scope.displaySelectionCheckbox ? 1 : 0;	
					lastInRow = true;
				} else {
					grid.$viewport.scrollLeft(Math.min(toScroll, grid.$canvas.width() - grid.$viewport.width()));
				}
			}
			if(!focusedOnLastColumn){
				newColumnIndex += 1;
			}
		}
	}
	
	var offset = 0;
	if(charCode == 38 || (charCode == 13 && evt.shiftKey) || (charCode == 9 && evt.shiftKey) && firstInRow){ //arrow key up or shift enter or tab key and first item in row
		offset = -1;
	} else if(charCode == 40 || charCode == 13 || charCode == 9 && lastInRow){//arrow key down, enter, or tab key and last item in row?
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
		$scope.$evalAsync(function(){
			$scope.domAccessProvider.focusCellElement($scope, newColumnIndex)
		});
		$scope.$emit('ngGridEventDigestGridParent');
	} else {	
		if ($scope.selectionService.lastClickedRow.renderedRow >= $scope.renderedRows.length - EXCESS_ROWS) {
			elm.scrollTop(elm.scrollTop() + $scope.rowHeight);
		} else if ($scope.selectionService.lastClickedRow.renderedRow <= EXCESS_ROWS) {
			elm.scrollTop(elm.scrollTop() - $scope.rowHeight);
		}	
		$scope.$emit('ngGridEventDigestGrid');
	}
    return false;
};
