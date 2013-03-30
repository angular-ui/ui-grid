ngGridFlexibleHeightPlugin = function() {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.init = function(scope, grid, services) {
        self.grid = grid;
        self.scope = scope;
        self.services = services;
        var recalcHeightForData = function () { setTimeout(innerRecalcForData, 1); } ;
        var innerRecalcForData = function () {
            self.grid.$viewport.css('height', (self.grid.$canvas.height() + 5) + 'px');
            self.services.DomUtilityService.RebuildGrid(self.scope, self.grid);
        };
        scope.$watch (grid.config.data, recalcHeightForData);
    };
};