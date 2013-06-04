function ngGridFlexibleHeightPlugin (opts) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.init = function (scope, grid) {
        self.grid = grid;
        self.scope = scope;
        var recalcHeightForData = function () { setTimeout(innerRecalcForData, 1); };
        var innerRecalcForData = function () {
            var gridId = self.grid.gridId;
            var footerPanelSel = '.' + gridId + ' .ngFooterPanel';
            var extraHeight = self.grid.$topPanel.height() + $(footerPanelSel).height();
            var naturalHeight = self.grid.$canvas.height() + 1;
            if (scope.baseViewportHeight == null || scope.baseViewportHeight === 0) {
                scope.baseViewportHeight = self.grid.$viewport.height();
            }
            if (scope.baseViewportHeight > naturalHeight) {
                if (opts != null) {
                    if (opts.minHeight != null && (naturalHeight + extraHeight) < opts.minHeight) {
                        naturalHeight = opts.minHeight - extraHeight - 2;
                    }
                }
                self.grid.$viewport.css('height', (naturalHeight + 2) + 'px');
                self.grid.$root.css('height', (naturalHeight + extraHeight + 2) + 'px');
            }
            self.grid.refreshDomSizes();
        };
        scope.catHashKeys = function () {
            var hash = '',
                idx;
            for (idx in scope.renderedRows) { hash += scope.renderedRows[idx].$$hashKey; }
            return hash;
        };
        scope.$watch('catHashKeys()', innerRecalcForData);
        scope.$watch(grid.config.data, recalcHeightForData);
    };
}
