ngGridReorderable = function () {
    var self = this;
    self.$scope = null;
    self.myGrid = null;
    // The init method gets called during the ng-grid directive execution.
    self.init = function (scope, grid) {
        // The directive passes in the grid scope and the grid object which we will want to save for manipulation later.
        self.$scope = scope;
        self.myGrid = grid;
        // In this example we want to assign grid events.
        self.assignEvents();
    };
    self.colToMove = undefined;
    self.assignEvents = function () {
        // Here we set the onmousedown event handler to the header container.
        self.myGrid.$headerScroller.on('mousedown', self.onHeaderMouseDown).on('dragover', self.dragOver).on('drop', self.onDrop);
    };
    self.dragOver = function(evt) {
        evt.preventDefault();
    };

    self.onHeaderMouseDown = function (event) {
        // Get the closest header container from where we clicked.
        var headerContainer = $(event.srcElement).closest('.ngHeaderSortColumn');
        // Get the scope from the header container
        var headerScope = angular.element(headerContainer).scope();
        // If we have a scope let's get the column associated with the header.
        if (headerScope) {
            headerContainer.attr('draggable', 'true');
            headerContainer.on('dragstart', self.onDragStart).on('dragend', self.onDragStop);
            // Save the column for later.
            self.colToMove = { header: headerContainer, col: headerScope.col };
            // Set the onmouseup event last in case there was an issue getting here.
        }
    };
    
    self.onDragStart = function () {
        // color the header so we know what we are moving
        if (self.colToMove) {
            self.colToMove.header.css('background-color', 'rgb(255, 255, 204)');
        }
    };
    
    self.onDragStop = function () {
        // Set the column to move header color back to normal
        if (self.colToMove) {
            self.colToMove.header.css('background-color', 'rgb(234, 234, 234)');
        }
    };

    self.onDrop = function (event) {
        self.onDragStop();
        // Get the closest header to where we dropped
        var headerContainer = $(event.srcElement).closest('.ngHeaderSortColumn');
        // Get the scope from the header.
        var headerScope = angular.element(headerContainer).scope();
        if (headerScope) {
            // If we have the same column, do nothing.
            if (self.colToMove.col == headerScope.col) return;
            // Splice the columns
            self.$scope.columns.splice(self.colToMove.col.index, 1);
            self.$scope.columns.splice(headerScope.col.index, 0, self.colToMove.col);
            // Fix all the indexes on the columns so if we reorder again the columns will line up correctly.
            angular.forEach(self.$scope.columns, function(col, i) {
                col.index = i;
            });
            // Finally, rebuild the CSS styles.
            self.myGrid.cssBuilder.buildStyles();
            self.colToMove = undefined;
        }
    };
};
