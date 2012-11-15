ng.AggregateProvider = function (grid, $scope, gridService) {

    var self = this;
    // The init method gets called during the ng-grid directive execution.

    self.colToMove = undefined;
	self.groupToMove = undefined;
    self.assignEvents = function () {
        // Here we set the onmousedown event handler to the header container.
		grid.$groupPanel.on('mousedown', self.onGroupMouseDown).on('dragover', self.dragOver).on('drop', self.onGroupDrop);
        grid.$headerScroller.on('mousedown', self.onHeaderMouseDown).on('dragover', self.dragOver).on('drop', self.onHeaderDrop);
        if (grid.config.enableRowRerodering) {
            grid.$viewport.on('mousedown', self.onRowMouseDown).on('dragover', self.dragOver).on('drop', self.onRowDrop);
        }
    };
    self.dragOver = function(evt) {
        evt.preventDefault();
    };	
    
    self.onGroupDragStart = function () {
        // color the header so we know what we are moving
        if (self.groupToMove) {
            self.groupToMove.header.css('background-color', 'rgb(255, 255, 204)');
        }
    };	
    
    self.onGroupDragStop = function () {
        // Set the column to move header color back to normal
        if (self.groupToMove) {
            self.groupToMove.header.css('background-color', 'rgb(247,247,247)');
        }
    };

    self.onGroupMouseDown = function(event) {
        var groupItem = $(event.target);
        // Get the scope from the header container
		if(groupItem[0].className != 'ngRemoveGroup'){
			var groupItemScope = angular.element(groupItem).scope();
			if (groupItemScope) {
				// set draggable events
				groupItem.attr('draggable', 'true');
				groupItem.on('dragstart', self.onGroupDragStart).on('dragend', self.onGroupDragStop);
				// Save the column for later.
				self.groupToMove = { header: groupItem, groupName: groupItemScope.group, index: groupItemScope.$index };
			}
		} else {
			self.groupToMove = undefined;
		}
    };

    self.onGroupDrop = function(event) {
        // clear out the colToMove object
        if (self.groupToMove) {
			self.onGroupDragStop();
            // Get the closest header to where we dropped
            var groupContainer = $(event.target).closest('.ngGroupElement');
            // Get the scope from the header.
            if (groupContainer.context.className == 'ngGroupPanel') {
                $scope.configGroups.splice(self.groupToMove.index, 1);
                $scope.configGroups.push(self.groupToMove.groupName);
            } else {
                var groupScope = angular.element(groupContainer).scope();
                if (groupScope) {
                    // If we have the same column, do nothing.
                    if (self.groupToMove.index != groupScope.$index){
						// Splice the columns
						$scope.configGroups.splice(self.groupToMove.index, 1);
						$scope.configGroups.splice(groupScope.$index, 0, self.groupToMove.groupName);
					}
                }
            }			
			self.groupToMove = undefined;
        } else {	
			self.onHeaderDragStop();
            if ($scope.configGroups.indexOf(self.colToMove.col) == -1) {
				var groupContainer = $(event.target).closest('.ngGroupElement');
				// Get the scope from the header.
				if (groupContainer.context.className == 'ngGroupPanel' || groupContainer.context.className == 'ngGroupPanelDescription') {
					$scope.configGroups.push(self.colToMove.col);
				} else {
					var groupScope = angular.element(groupContainer).scope();
					if (groupScope) {
						// Splice the columns
						$scope.configGroups.splice(groupScope.$index + 1, 0, self.colToMove.col);
					}
				}	
            }			
			self.colToMove = undefined;
        }
        $scope.$apply();
    };
	
    //Header functions
    self.onHeaderMouseDown = function (event) {
        // Get the closest header container from where we clicked.
        var headerContainer = $(event.target).closest('.ngHeaderSortColumn');
        // Get the scope from the header container
        var headerScope = angular.element(headerContainer).scope();
        if (headerScope) {
            // set draggable events
            headerContainer.attr('draggable', 'true');
            headerContainer.on('dragstart', self.onHeaderDragStart).on('dragend', self.onHeaderDragStop);
            // Save the column for later.
            self.colToMove = { header: headerContainer, col: headerScope.col };
        }
    };
    
    self.onHeaderDragStart = function () {
        // color the header so we know what we are moving
        if (self.colToMove) {
            self.colToMove.header.css('background-color', 'rgb(255, 255, 204)');
        }
    };
    
    self.onHeaderDragStop = function () {
        // Set the column to move header color back to normal
        if (self.colToMove) {
            self.colToMove.header.css('background-color', 'rgb(234, 234, 234)');
        }
    };

    self.onHeaderDrop = function (event) {
        if (!self.colToMove) return;
        self.onHeaderDragStop();
        // Get the closest header to where we dropped
        var headerContainer = $(event.target).closest('.ngHeaderSortColumn');
        // Get the scope from the header.
        var headerScope = angular.element(headerContainer).scope();
        if (headerScope) {
            // If we have the same column, do nothing.
            if (self.colToMove.col == headerScope.col) return;
            // Splice the columns
            $scope.columns.splice(self.colToMove.col.index, 1);
            $scope.columns.splice(headerScope.col.index, 0, self.colToMove.col);
            // Fix all the indexes on the columns so if we reorder again the columns will line up correctly.
            angular.forEach($scope.columns, function(col, i) {
                col.index = i;
            });
            // Finally, rebuild the CSS styles.
            grid.cssBuilder.buildStyles();
            // clear out the colToMove object
            self.colToMove = undefined;
        }
    };
    
    // Row functions
    self.onRowMouseDown = function (event) {
        // Get the closest row element from where we clicked.
        var targetRow = $(event.target).closest('.ngRow');
        // Get the scope from the row element
        var rowScope = angular.element(targetRow).scope();
        if (rowScope) {
            // set draggable events
            targetRow.attr('draggable', 'true');
            // Save the row for later.
            gridService.eventStorage.rowToMove = { targetRow: targetRow, scope: rowScope };
        }
    };

    self.onRowDrop = function (event) {
        // Get the closest row to where we dropped
        var targetRow = $(event.target).closest('.ngRow');
        // Get the scope from the row element.
        var rowScope = angular.element(targetRow).scope();
        if (rowScope) {
            // If we have the same Row, do nothing.
            var prevRow = gridService.eventStorage.rowToMove;
            if (prevRow.scope.row == rowScope.row) return;
            // Splice the Rows via the actual datasource
            var i = grid.sortedData.indexOf(prevRow.scope.row.entity);
            var j = grid.sortedData.indexOf(rowScope.row.entity);
            grid.sortedData.splice(i, 1);
            grid.sortedData.splice(j, 0, prevRow.scope.row.entity);
            grid.rowFactory.sortedDataChanged(grid.sortedData);
            // clear out the rowToMove object
            gridService.eventStorage.rowToMove = undefined;
            // if there isn't an apply already in progress lets start one
        }
    };
    // In this example we want to assign grid events.
    self.assignEvents();
};
