ngGridFlexibleHeightPlugin = function(opts) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.init = function(scope, grid, services) {
        self.grid = grid;
        self.scope = scope;
        var recalcHeightForData = function () { setTimeout(innerRecalcForData, 1); } ;
        var innerRecalcForData = function () {
            var rowCount = self.grid.data.length;
            var gridId = self.grid.gridId;
            var topPanelSel = '.' + gridId + ' .ngTopPanel';
            var footerPanelSel = '.' + gridId + ' .ngFooterPanel';
            var canvasSel = '.' + gridId + ' .ngCanvas';
            var viewportSel = '.' + gridId + ' .ngViewport';
            var extraHeight = $(topPanelSel).height() + $(footerPanelSel).height();
            var naturalHeight = $(canvasSel).height() + 15;
            if (scope.baseViewportHeight == null || scope.baseViewportHeight == 0) {
              scope.baseViewportHeight = $(viewportSel).height();
            }
            if (scope.baseViewportHeight > naturalHeight ) {
                if (opts != null) {
                    if (opts.minHeight != null && (naturalHeight + extraHeight) < opts.minHeight) {
                        naturalHeight = opts.minHeight - extraHeight - 2;
                    }
                }
                $(viewportSel).css('height', (naturalHeight + 2) + 'px');
                $('.' + gridId).css('height', (naturalHeight + extraHeight + 2) + 'px');
            }
            self.grid.refreshDomSizes();
        };
        scope.catHashKeys = function() {
          hash = '';
          for (idx in scope.renderedRows) { hash += scope.renderedRows[idx].$$hashKey;  }
          return hash;
        };
        scope.$watch('catHashKeys()', innerRecalcForData);
        scope.$watch (grid.config.data, recalcHeightForData);
    };
};
