ng.Footer = function ($scope, grid) {
    $scope.maxRows = null;

    if (!ng.utils.isNullOrUndefined($scope.pagingOptions.totalServerItems)) {
        $scope.maxRows = $scope.pagingOptions.totalServerItems;
    } else {
        $scope.maxRows = grid.maxRows;
    }
    $scope.multiSelect = (grid.config.canSelectRows && grid.config.multiSelect);
    $scope.selectedItemCount = grid.selectedItemCount;
    $scope.maxPages = function () {
        var maxCnt = $scope.maxRows || 1;
		return Math.ceil(maxCnt / $scope.pagingOptions.pageSize);
    };

    $scope.pageForward = function() {
        var page = $scope.pagingOptions.currentPage;
        $scope.pagingOptions.currentPage = Math.min(page + 1, $scope.maxPages());
    };

    $scope.pageBackward = function () {
        var page = $scope.pagingOptions.currentPage;
        $scope.pagingOptions.currentPage = Math.max(page - 1, 1);
    };

    $scope.pageToFirst = function () {
        $scope.pagingOptions.currentPage = 1;
    };

    $scope.pageToLast = function () {
        var maxPages = $scope.maxPages();
        $scope.pagingOptions.currentPage = maxPages;
    };

    $scope.cantPageForward = function () {
        var curPage = $scope.pagingOptions.currentPage;
        var maxPages = $scope.maxPages();
        return !(curPage < maxPages);
    };

    $scope.cantPageBackward = function () {
        var curPage = $scope.pagingOptions.currentPage;
        return !(curPage > 1);
    };
};