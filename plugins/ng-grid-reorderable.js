/* 
 Reorderablr row plugin
*/

function ngGridReorderable () {
    var self = this;
    self.$scope = null;
    self.myGrid = null;

    // The init method gets called during the ng-grid directive execution.
    self.init = function(scope, grid, services) {
        // The directive passes in the grid scope and the grid object which we will want to save for manipulation later.
        self.$scope = scope;
        self.myGrid = grid;
        self.services = services;
        // In this example we want to assign grid events.
        self.assignEvents();
    };
    self.colToMove = undefined;
    self.groupToMove = undefined;
    self.assignEvents = function() {
        // Here we set the onmousedown event handler to the header container.
        self.myGrid.$viewport.on('mousedown', self.onRowMouseDown).on('dragover', self.dragOver).on('drop', self.onRowDrop);
    };
    // Row functions
    self.onRowMouseDown = function(event) {
        // Get the closest row element from where we clicked.
        var targetRow = $(event.target).closest('.ngRow');
        // Get the scope from the row element
        var rowScope = angular.element(targetRow).scope();
        if (rowScope) {
            // set draggable events
            targetRow.attr('draggable', 'true');
            // Save the row for later.
            self.services.DomUtilityService.eventStorage.rowToMove = { targetRow: targetRow, scope: rowScope };
        }
    };
    self.onRowDrop = function(event) {
        // Get the closest row to where we dropped
        var targetRow = $(event.target).closest('.ngRow');
        // Get the scope from the row element.
        var rowScope = angular.element(targetRow).scope();
        if (rowScope) {
            // If we have the same Row, do nothing.
            var prevRow = self.services.DomUtilityService.eventStorage.rowToMove;
            if (prevRow.scope.row === rowScope.row) {
                return;
            }
            self.changeRowOrder(prevRow.scope.row, rowScope.row);
            self.myGrid.searchProvider.evalFilter();
            // clear out the rowToMove object
            self.services.DomUtilityService.eventStorage.rowToMove = undefined;
            // if there isn't an apply already in progress lets start one
            self.services.DomUtilityService.digest(rowScope.$root);
        }
    };
    self.changeRowOrder = function (prevRow, targetRow) {
        var i = prevRow.rowIndex;
        var j = targetRow.rowIndex;
        var cl = prevRow.copy();
        // remove current row (prevRow) from it's current position
        // Splice the Rows via the actual datasource
        self.myGrid.rowCache.splice(i, 1);
        // place current row in new place
        // placing prevRow here won't work, object must be copied
        self.myGrid.rowCache.splice(j, 0, cl);
        self.$scope.$emit('ngGridEventChangeOrder', self.myGrid.rowCache);
    };
    self.dragOver = function(evt) {
        evt.preventDefault();
    };
}
