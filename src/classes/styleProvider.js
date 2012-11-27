ng.StyleProvider = function($scope, grid, domUtilityService) {
    $scope.topPanelStyle = function() {
        return { "height": $scope.topPanelHeight() + "px" };
    };
    $scope.headerCellStyle = function(col) {
        return { "height": col.headerRowHeight + "px" };
    };
    $scope.rowStyle = function(row) {
        return { "top": row.offsetTop + "px", "height": $scope.rowHeight + "px" };
    };
    $scope.canvasStyle = function() {
        return { "height": grid.maxCanvasHt.toString() + "px" };
    };
    $scope.headerScrollerStyle = function() {
        return { "height": grid.config.headerRowHeight + "px" };
    };
    $scope.topPanelStyle = function() {
        return { "width": grid.rootDim.outerWidth + "px", "height": $scope.topPanelHeight() + "px" };
    };
    $scope.headerStyle = function() {
        return { "width": (grid.rootDim.outerWidth - domUtilityService.ScrollW) + "px", "height": grid.config.headerRowHeight + "px" };
    };
    $scope.viewportStyle = function() {
        return { "width": grid.rootDim.outerWidth + "px", "height": $scope.viewportDimHeight() + "px" };
    };
    $scope.footerStyle = function() {
        return { "width": grid.rootDim.outerWidth + "px", "height": grid.config.footerRowHeight + "px" };
    };
};