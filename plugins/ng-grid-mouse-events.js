function ngMouseEventsPlugin() {
    var self = this;
    self.$scope = null;
    self.grid = null;

    self.init = function (scope, grid, services) {
        self.$scope = scope;
        self.grid = grid;

        self.assignEvents();
    };

    self.assignEvents = function () {
        self.grid.$viewport.on('click', self.onClick);
        self.grid.$viewport.on('dblclick', self.onDblClick);
        self.grid.$viewport.on('contextmenu', self.onRightClick);
    };

    self.onClick = function () {
        if (typeof self.grid.config.onClick == 'function')
            self.grid.config.onClick(self.$scope.selectedItems[0]);
    };

    self.onDblClick = function (row) {
        if (typeof self.grid.config.onDblClick == 'function')
            self.grid.config.onDblClick(self.$scope.selectedItems[0]);
    };

    self.onRightClick = function () {
        if (typeof self.grid.config.onRightClick == 'function')
            self.grid.config.onRightClick(self.$scope.selectedItems[0]);
    };
}