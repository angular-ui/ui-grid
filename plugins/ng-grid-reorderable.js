ngGridReorderable = function () {
    var self = this;
    self.$scope = null;
    self.myGrid = null;
    self.init = function(scope, grid) {
        self.$scope = scope;
        self.myGrid = grid;
        self.assignEvents();
    };
    self.colToMove = undefined;
    self.colToReplace = undefined;
    self.assignEvents = function() {
        self.myGrid.$headerScroller.on('mousedown', self.onHeaderMouseDown);
    };

    self.onHeaderMouseDown = function(event) {
        var headerContainer = $(event.srcElement).closest('.ngHeaderSortColumn');
        self.colToMove = angular.element(headerContainer).scope().col;
        $(document).on('mouseup', self.onHeaderMouseUp);
    };
    
    self.onHeaderMouseUp = function (event) {
        $(document).off('mouseup');
        var headerContainer = $(event.srcElement).closest('.ngHeaderSortColumn');
        self.colToReplace = angular.element(headerContainer).scope().col;
        self.$scope.columns.splice(self.colToMove.index, 1);
        self.$scope.columns.splice(self.colToReplace.index, 0, self.colToMove);
        angular.forEach(self.$scope.columns, function (col, i) {
            col.index = i;
        });
        self.myGrid.cssBuilder.buildStyles();
    };
};
