var ngDomAccessProvider = function (grid) {
	var self = this, previousColumn;
	self.selectInputElement = function(elm){
		var node = elm.nodeName.toLowerCase();
		if(node == 'input' || node == 'textarea'){
			elm.select();
		}
	};
	
	self.focusCellElement = function($scope, index){	
		if($scope.selectionProvider.lastClickedRow){
			var columnIndex = index != undefined ? index : previousColumn;
			var elm = $scope.selectionProvider.lastClickedRow.clone ? $scope.selectionProvider.lastClickedRow.clone.elm : $scope.selectionProvider.lastClickedRow.elm;
			if (columnIndex != undefined && elm) {
				var columns = angular.element(elm[0].children).filter(function () { return this.nodeType != 8;}); //Remove html comments for IE8
				var i = Math.max(Math.min($scope.renderedColumns.length - 1, columnIndex), 0);
				if(grid.config.showSelectionCheckbox && angular.element(columns[i]).scope() && angular.element(columns[i]).scope().col.index == 0){
					i = 1; //don't want to focus on checkbox
				}
				if (columns[i]) {
					columns[i].children[0].focus();
				}
				previousColumn = columnIndex;
			}
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
				var ret = ngMoveSelectionHandler($scope, elm, evt, grid);
				doingKeyDown = false;
				return ret;
			}
			return true;
		});
		elm.bind('keyup', function(evt) {
			if (evt.keyCode == 16) { //shift key
				changeUserSelect(elm, 'text', evt);
			}
			return true;
		});
	};
};