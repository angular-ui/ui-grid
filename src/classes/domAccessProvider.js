ng.DomAccessProvider = function(domUtilityService) {	
	var self = this, previousColumn;
	self.inputSelection = function(elm){
		var node = elm.nodeName.toLowerCase();
		if(node == 'input' || node == 'textarea' || node == 'select'){
			elm.select();
		}
	};
	
	self.focusCellElement = function($scope, index){	
		var columnIndex = index != undefined ? index : previousColumn;
		if(columnIndex != undefined){
			var columns = angular.element($scope.selectionService.lastClickedRow.elm[0].children).filter(function() { return this.nodeType != 8 }); //Remove html comments for IE8
			var nextFocusedCellElement = columns[columnIndex];
			nextFocusedCellElement.children[0].focus();
			self.inputSelection(nextFocusedCellElement);
			previousColumn = columnIndex;
		}
	};
	
	var changeUserSelect = function(elm, value) {
		elm.css({
			'-webkit-touch-callout': value,
			'-webkit-user-select': value,
			'-khtml-user-select': value,
			'-moz-user-select': value == 'none'
				? '-moz-none'
				: value,
			'-ms-user-select': value,
			'user-select': value
		});
	};
	
	self.selectionHandlers = function($scope, elm){
		var doingKeyDown = false;
		elm.bind('keydown', function(evt) {
			if (evt.keyCode == 16) { //shift key
				changeUserSelect(elm, 'none', evt);
				return true;
			} else if (!doingKeyDown) {
				doingKeyDown = true;
				var ret = ng.moveSelectionHandler($scope, elm, evt, domUtilityService);
				doingKeyDown = false;
				return ret;
			}
			return false;
		});
		elm.bind('keyup', function(evt) {
			if (evt.keyCode == 16) { //shift key
				changeUserSelect(elm, 'text', evt);
			}
			return true;
		});
	};
};