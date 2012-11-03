ngGridReorderable = function () {
    var self = this;
    self.$scope = null;
    self.myGrid = null;
    // init method gets called during the ng-grid directive
    self.init = function (scope, grid) {
        // init passes in the grid scope and the grid object which we will want to save for manipulation later
        self.$scope = scope;
        self.myGrid = grid;
        //in this example we assign grid events.
        self.assignEvents();
    };
    self.colToMove = undefined;
    self.colToReplace = undefined;
    self.assignEvents = function () {
        // set the onmousedown event handler
        self.myGrid.$headerScroller.on('mousedown', self.onHeaderMouseDown);
    };

    self.onHeaderMouseDown = function (event) {
        // get the closest header containr who's scope has the column we want
        var headerContainer = $(event.srcElement).closest('.ngHeaderSortColumn');
        //get the scope
        var headerScope = angular.element(headerContainer).scope();
        //make sure we actually have a scope
        if (headerScope) {
            //save the column for later
            self.colToMove = headerScope.col;
            //set the onmouseup event last in case there was an issue getting here.
            $(document).on('mouseup', self.onHeaderMouseUp);
        }
    };
    
    self.onHeaderMouseUp = function (event) {
        //turn off the mouseup event first so we don't blow things up in case of any issues
        $(document).off('mouseup');
        var headerContainer = $(event.srcElement).closest('.ngHeaderSortColumn');
        var headerScope = angular.element(headerContainer).scope();
        if (headerScope) {
            self.colToReplace = headerScope.col;
            //splice in the columns
            self.$scope.columns.splice(self.colToMove.index, 1);
            self.$scope.columns.splice(self.colToReplace.index, 0, self.colToMove);
            // fix all the indexes on the columns so if we reorder again things line up correctly.
            angular.forEach(self.$scope.columns, function(col, i) {
                col.index = i;
            });
            // finally rebuild the CSS 
            self.myGrid.cssBuilder.buildStyles();
        }
    };
};
