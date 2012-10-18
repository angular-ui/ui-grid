ng.Footer = function ($scope, grid) {
    $scope.maxRows = null;

    if (!ng.utils.isNullOrUndefined(grid.config.totalServerItems)) {
        $scope.maxRows = grid.config.totalServerItems;
    } else {
        $scope.maxRows = grid.maxRows;
    }
    $scope.isMultiSelect = (grid.config.canSelectRows && grid.config.isMultiSelect);
    $scope.selectedItemCount = grid.selectedItemCount;

    $scope.selectedPageSize = grid.config.pageSize;
    $scope.pageSizes = grid.config.pageSizes;
    $scope.currentPage = grid.config.currentPage;
    $scope.maxPages = function () {
        var maxCnt = self.maxRows || 1,
            pageSize = self.selectedPageSize;
        return Math.ceil(maxCnt / pageSize);
    };

    $scope.protectedCurrentPage = {
        get: function () {
            return self.currentPage();
        },
        set: function (page) {
            var pageInt = parseInt(page);
            if (!isNaN(pageInt) || (pageInt && pageInt <= self.maxPages && pageInt > 0)) {
                self.currentPage = pageInt;
            }
        }
    };

    $scope.pageForward = function () {
        var page = self.currentPage;
        $scope.currentPage = Math.min(page + 1, self.maxPages);
    };

    $scope.pageBackward = function () {
        var page = $scope.currentPage;
        $scope.currentPage = Math.max(page - 1, 1);
    };

    $scope.pageToFirst = function () {
        $scope.currentPage = 1;
    };

    $scope.pageToLast = function () {
        var maxPages = $scope.maxPages;
        $scope.currentPage = maxPages;
    };

    $scope.canPageForward = function () {
        var curPage = $scope.currentPage;
        var maxPages = $scope.maxPages;
        return curPage < maxPages;
    };

    $scope.canPageBackward = function () {
        var curPage = $scope.currentPage;
        return curPage > 1;
    };
};