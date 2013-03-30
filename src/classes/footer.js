var ngFooter = function ($scope, grid) {
    $scope.maxRows = function () {
        var ret = Math.max($scope.pagingOptions.totalServerItems, grid.data.length);
        return ret;
    };
    
    $scope.multiSelect = (grid.config.enableRowSelection && grid.config.multiSelect);
    $scope.selectedItemCount = grid.selectedItemCount;
    $scope.maxPages = function () {
        return Math.ceil($scope.maxRows() / $scope.pagingOptions.pageSize);
    };

    $scope.pageForward = function() {
        var page = $scope.pagingOptions.currentPage;
        if ($scope.pagingOptions.totalServerItems > 0) {
            $scope.pagingOptions.currentPage = Math.min(page + 1, $scope.maxPages());
        } else {
            $scope.pagingOptions.currentPage++;
        }
    };

    $scope.pageBackward = function() {
        var page = $scope.pagingOptions.currentPage;
        $scope.pagingOptions.currentPage = Math.max(page - 1, 1);
    };

    $scope.pageToFirst = function() {
        $scope.pagingOptions.currentPage = 1;
    };

    $scope.pageToLast = function() {
        var maxPages = $scope.maxPages();
        $scope.pagingOptions.currentPage = maxPages;
    };

    $scope.cantPageForward = function() {
        var curPage = $scope.pagingOptions.currentPage;
        var maxPages = $scope.maxPages();
        if ($scope.pagingOptions.totalServerItems > 0) {
            return !(curPage < maxPages);
        } else {
            return grid.data.length < 1;
        }

    };
    $scope.cantPageToLast = function() {
        if ($scope.pagingOptions.totalServerItems > 0) {
            return $scope.cantPageForward();
        } else {
            return true;
        }
    };
    
    $scope.cantPageBackward = function() {
        var curPage = $scope.pagingOptions.currentPage;
        return !(curPage > 1);
    };
};