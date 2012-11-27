ng.Footer = function ($scope, grid) {
    $scope.maxRows = Math.max($scope.pagingOptions.totalServerItems || grid.sortedData.length, 1);
    
    $scope.multiSelect = (grid.config.canSelectRows && grid.config.multiSelect);
    $scope.selectedItemCount = grid.selectedItemCount;
    $scope.maxPages = function () {
        $scope.maxRows = Math.max($scope.pagingOptions.totalServerItems || grid.sortedData.length, 1);
        return Math.ceil($scope.maxRows / $scope.pagingOptions.pageSize);
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