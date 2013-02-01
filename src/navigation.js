/// <reference path="../lib/jquery-1.8.2.min" />
/// <reference path="../lib/angular.js" />
/// <reference path="../src/constants.js" />
/// <reference path="../src/namespace.js" />
/// <reference path="../src/utils.jsjs" />
//set event binding on the grid so we can select using the up/down keys
ng.moveSelectionHandler = function($scope, elm, evt, domUtilityService) {
    if ($scope.selectionService.selectedItems === undefined) {
        return true;
    }
    var charCode = evt.which || evt.keyCode;
	
	var newColumnIndex;
	if($scope.enableCellSelection){
		var focusedOnFirstColumn = $scope.displaySelectionCheckbox && $scope.col.index == 1 || !$scope.displaySelectionCheckbox && $scope.col.index == 0;
		var focusedOnLastColumn = $scope.col.index == $scope.columns.length - 1;
		if(charCode == 9){ //tab key
			if(!evt.shiftKey && focusedOnLastColumn//tabing on last column
				|| evt.shiftKey && focusedOnFirstColumn){  //tabbing on first column
				evt.preventDefault();
			}
			return true;
		}
		newColumnIndex = $scope.col.index;
		if(charCode == 37 && !focusedOnFirstColumn){
			newColumnIndex -= 1;
		} else if(charCode == 39 && !focusedOnLastColumn){			
			newColumnIndex += 1;
		}
	}
		
	var offset = 0;
	if(charCode == 38 || (charCode == 13 && evt.shiftKey)){ //arrow key up or shift enter
		offset = -1;
	} else if(charCode == 40 || charCode == 13){//arrow key down or enter
		offset = 1;
	} else if(charCode != 37 && charCode != 39){
		return true;
	}	
	
    var items = $scope.renderedRows;
    var index = items.indexOf($scope.selectionService.lastClickedRow) + offset;
    if (index < 0 || index >= items.length) {
        return true;
    }
	if(charCode != 37 && charCode != 39){
		$scope.selectionService.ChangeSelection(items[index], evt);
	}
	
	if($scope.enableCellSelection){ 
		domUtilityService.focusCellElement($scope, newColumnIndex);
	} else {	
		if (index > items.length - EXCESS_ROWS) {
			elm.scrollTop(elm.scrollTop() + ($scope.rowHeight * 2));
		} else if (index < EXCESS_ROWS) {
			elm.scrollTop(elm.scrollTop() - ($scope.rowHeight * 2));
		}
	}
	
    if (!$scope.$$phase) {
        $scope.$parent.$parent.$digest();
    }
    return false;
};