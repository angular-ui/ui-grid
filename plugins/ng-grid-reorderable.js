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
        self.myGrid.$viewport.on('mousedown', self.onRowMouseDown)
                .on('dragstart', self.dragStart)
                .on('dragover', self.dragOver)
                .on('dragleave', self.dragLeave)
                .on('drop', self.onRowDrop)
                .on('dragend', self.dragEnd);
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
            self.$scope.$emit('ngGridEventChangeOrderStart', targetRow);
        }
    };

    self.onRowDrop = function(event) {
        event.stopPropagation(); // Stops some browsers from redirecting.
        event.preventDefault();
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
        // Splice the Rows via the actual datasource
        var i = prevRow.rowIndex;
        var j = targetRow.rowIndex;
        oldRow = self.myGrid.rowCache[i];
        self.myGrid.rowCache.splice(i, 1);
        self.myGrid.rowCache.splice(j, 0, oldRow);
        self.$scope.$emit('ngGridEventChangeOrder', self.myGrid.rowCache);
    };

    self.dragStart = function(event) {
        event.target.style.opacity = '0.4';

        var dragSrcEl = event.target;
        event.originalEvent.dataTransfer.effectAllowed = 'move';
        event.originalEvent.dataTransfer.setData('text/html', dragSrcEl.innerHTML);
    };

    self.dragEnd = function(event) {
        event.target.style.opacity = '1';
    };

    self.dragOver = function(event) {
        var targetRow = $(event.target).closest('.ngRow');
        targetRow.addClass("over");
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.originalEvent.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

        return false;
    };

    self.dragLeave = function(event) {
        var targetRow = $(event.target).closest('.ngRow');
        targetRow.removeClass("over");
        event.preventDefault();
    };
}