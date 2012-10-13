ng.footer = function (grid) {
    var self = this;

    this.maxRows;

    if (!ng.utils.isNullOrUndefined(grid.config.totalServerItems)) {
        this.maxRows = grid.config.totalServerItems;
    } else {
        this.maxRows = grid.maxRows;
    }
    this.isMultiSelect = (grid.config.canSelectRows && grid.config.isMultiSelect);
    this.selectedItemCount = grid.selectedItemCount;

    this.footerVisible = grid.config.footerVisible;
    this.pagerVisible = grid.config.enablePaging;
    this.selectedPageSize = grid.config.pageSize;
    this.pageSizes = grid.config.pageSizes;
    this.currentPage = grid.config.currentPage;
    this.maxPages = (function () {
        var maxCnt = self.maxRows || 1,
            pageSize = self.selectedPageSize;
        return Math.ceil(maxCnt / pageSize);
    });

    this.protectedCurrentPage = {
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

    this.pageForward = function () {
        var page = self.currentPage;
        self.currentPage(Math.min(page + 1, self.maxPages));
    }

    this.pageBackward = function () {
        var page = self.currentPage;
        self.currentPage = Math.max(page - 1, 1);
    };

    this.pageToFirst = function () {
        self.currentPage = 1;
    };

    this.pageToLast = function () {
        var maxPages = self.maxPages;
        self.currentPage = maxPages;
    };

    this.canPageForward = ko.computed(function () {
        var curPage = self.currentPage;
        var maxPages = self.maxPages;
        return curPage < maxPages;
    });

    this.canPageBackward = ko.computed(function () {
        var curPage = self.currentPage;
        return curPage > 1;
    });
};