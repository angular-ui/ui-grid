ng.Footer = function ($scope, grid) {
    $scope.maxRows = null;

    if (!ng.utils.isNullOrUndefined(grid.config.totalServerItems)) {
        $scope.maxRows = grid.config.totalServerItems;
    } else {
        $scope.maxRows = grid.maxRows;
    }
    $scope.multiSelect = (grid.config.canSelectRows && grid.config.multiSelect);
    $scope.selectedItemCount = grid.selectedItemCount;
};