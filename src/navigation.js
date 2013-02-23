/// <reference path="../lib/jquery-1.8.2.min" />
/// <reference path="../lib/angular.js" />
/// <reference path="../src/constants.js" />
/// <reference path="../src/namespace.js" />
/// <reference path="../src/utils.jsjs" />
//set event binding on the grid so we can select using the up/down keys
ng.moveSelectionHandler = function($scope, elm, evt, grid) {
    if ($scope.selectionService.selectedItems === undefined) {
        return true;
    }
    var charCode = evt.which || evt.keyCode;
	
	var newColumnIndex;
	if($scope.enableCellSelection){
		if(charCode == 9){ //tab key
			evt.preventDefault();
		}
		var focusedOnFirstColumn = $scope.displaySelectionCheckbox && $scope.col.index == 1 || !$scope.displaySelectionCheckbox && $scope.col.index == 0;
	    var focusedOnLastVisibleColumn = ($scope.col.index == $scope.renderedColumns[$scope.renderedColumns.length - 1].index);
	    var focusedOnLastColumn = $scope.col.index == $scope.columns.length - 1;
	    if (focusedOnLastVisibleColumn && $scope.renderedColumns.length < $scope.columns.length) {
	        var toScroll = grid.$viewport.scrollLeft() + $scope.col.width;
	        grid.$viewport.scrollLeft(Math.max(toScroll, grid.$canvas.width() - grid.$viewport.width()));
	    }
		newColumnIndex = $scope.$index;
		if((charCode == 37 || charCode ==  9 && evt.shiftKey) && !focusedOnFirstColumn){
			newColumnIndex -= 1;
		} else if((charCode == 39 || charCode ==  9 && !evt.shiftKey) && !focusedOnLastColumn){			
			newColumnIndex += 1;
		}
	}
		
	var offset = 0;
	if(charCode == 38 || (charCode == 13 && evt.shiftKey)){ //arrow key up or shift enter
		offset = -1;
	} else if(charCode == 40 || charCode == 13){//arrow key down or enter
		offset = 1;
	} else if(charCode != 37 && charCode != 39 && charCode != 9){
		return true;
	}	
	
	var items = grid.filteredRows;
    var index = $scope.selectionService.lastClickedRow.rowIndex + offset;
    if (index < 0 || index >= items.length) {
        return true;
    }
	if(charCode != 37 && charCode != 39 && charCode != 9){
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