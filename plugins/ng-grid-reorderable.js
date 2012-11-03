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
    self.colToReplace = undefined;
    self.assignEvents = function () {
        // Here we set the onmousedown event handler to the header container.
        self.myGrid.$headerScroller.on('mousedown', self.onHeaderMouseDown);
    };

    self.onHeaderMouseDown = function (event) {
        // Get the closest header container from where we clicked.
        var headerContainer = $(event.srcElement).closest('.ngHeaderSortColumn');
        // Get the scope from the header container
        var headerScope = angular.element(headerContainer).scope();
        // If we have a scope let's get the column associated with the header.
        if (headerScope) {
            // Save the column for later.
            self.colToMove = headerScope.col;
            // Set the onmouseup event last in case there was an issue getting here.
            $(document).on('mouseup', self.onHeaderMouseUp);
        }
    };

    self.onHeaderMouseUp = function (event) {
        // Turn off mouseup event so things don't blow up, if there are any issues.
        $(document).off('mouseup');
        var headerContainer = $(event.srcElement).closest('.ngHeaderSortColumn');
        var headerScope = angular.element(headerContainer).scope();
        if (headerScope) {
            self.colToReplace = headerScope.col;
            if (self.colToMove == self.colToReplace) return;
            // Splice the columns
            self.$scope.columns.splice(self.colToMove.index, 1);
            self.$scope.columns.splice(self.colToReplace.index, 0, self.colToMove);
            // Fix all the indexes on the columns so if we reorder again the columns will line up correctly.
            angular.forEach(self.$scope.columns, function(col, i) {
                col.index = i;
            });
            // Finally, rebuild the CSS styles.
            self.myGrid.cssBuilder.buildStyles();
        }
    };
};
