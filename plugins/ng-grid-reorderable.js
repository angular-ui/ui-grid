ngGridReorderable = function (options) {
    var defaults = {
        enableHeader: true,
        enableRow: true
    };
    var self = this;
    self.config = $.extend(defaults, options);
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
    self.rowToMove = undefined;
    self.assignEvents = function () {
        // Here we set the onmousedown event handler to the header container.
        if (self.config.enableHeader) {
            self.myGrid.$headerScroller.on('mousedown', self.onHeaderMouseDown).on('dragover', self.dragOver).on('drop', self.onHeaderDrop);
        }
        if (self.config.enableRow) {
            self.myGrid.$viewport.on('mousedown', self.onRowMouseDown).on('dragover', self.dragOver).on('drop', self.onRowDrop);
        }
    };
    self.dragOver = function(evt) {
        evt.preventDefault();
    };
    //Header functions
    self.onHeaderMouseDown = function (event) {
        // Get the closest header container from where we clicked.
        var headerContainer = $(event.srcElement).closest('.ngHeaderSortColumn');
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
        self.onHeaderDragStop();
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
            // clear out the colToMove object
            self.colToMove = undefined;
        }
    };
    
    // Row functions
    self.onRowMouseDown = function (event) {
        // Get the closest row element from where we clicked.
        var targetRow = $(event.srcElement).closest('.ngRow');
        // Get the scope from the row element
        var rowScope = angular.element(targetRow).scope();
        if (rowScope) {
            // set draggable events
            targetRow.attr('draggable', 'true');
            // Save the row for later.
            self.rowToMove = { targetRow: targetRow, scope: rowScope };
        }
    };

    self.onRowDrop = function (event) {
        // Get the closest row to where we dropped
        var targetRow = $(event.srcElement).closest('.ngRow');
        // Get the scope from the row element.
        var rowScope = angular.element(targetRow).scope();
        if (rowScope) {
            // If we have the same Row, do nothing.
            if (self.rowToMove.scope.row == rowScope.row) return;
            // Splice the Rows via the actual datasource
            var i = self.$scope.dataSource.indexOf(self.rowToMove.scope.row.entity);
            var j = self.$scope.dataSource.indexOf(rowScope.row.entity);
            self.$scope.dataSource.splice(i, 1);
            self.$scope.dataSource.splice(j, 0, self.rowToMove.scope.row.entity);
            // clear out the rowToMove object
            self.rowToMove = undefined;
            // if there isn't an apply already in progress lets start one
            if (!self.$scope.$$phase) self.$scope.$apply();
        }
    };
};
