ng.Column = function (colDef, index, headerRowHeight, sortService) {
    var self = this;
    
    self.sortService = sortService;
    self.allowSort = colDef.allowSort;
    self.allowFilter = colDef.allowFilter;
    self.allowResize = colDef.allowResize;

    self.width = colDef.width;
    self.widthIsConfigured = false;
    self.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
    self.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;
    self.headerRowHeight = headerRowHeight;

    self.field = colDef.field;
    if (!colDef.displayName) {
        // Allow empty column names -- do not check for empty string
        colDef.displayName = colDef.field;
    }
    self.displayName = colDef.displayName;
    self.index = index;
    self.isVisible = false;

    //sorting
    if (colDef.sortable === undefined || colDef.sortable === null) {
        colDef.sortable = true;
    }

    //resizing
    if (colDef.resizable === undefined || colDef.resizable === null) {
        colDef.resizable = true;
    }
    //resizing
    if (colDef.filterable === undefined || colDef.filterable === null) {
        colDef.filterable = true;
    }

    self.allowSort = colDef.sortable;
    self.allowResize = colDef.resizable;
    self.allowFilter = colDef.filterable;

    self.sortDirection = "";
    self.sortingAlgorithm = colDef.sortFn;

    //filtering
    self.filter = null;

    //cell Template
    self.cellTemplate = function() {
        return colDef.cellTemplate || '<div>{{row.entity[col.field]}}</div>';
    };
    self.hasCellTemplate = (self.cellTemplate ? true : false);

    self.cellClass = colDef.cellClass;
    self.headerClass = colDef.headerClass;

    self.headerTemplate = colDef.headerTemplate;
    self.hasHeaderTemplate = (self.headerTemplate ? true : false);
    
    self.showSortButtonUp = function () {
        return self.allowSort ? (self.noSortVisible() || self.sortDirection === "desc") : self.allowSort;
    };
    self.showSortButtonDown = function () {
        return self.allowSort ? (self.noSortVisible() || self.sortDirection === "asc") : self.allowSort;
    };    
  
    self.filter = "";
    self.filterVisible = false;

    self.noSortVisible = function () {
        var ret = self.sortDirection !== "asc" && self.sortDirection !== "desc";
        return !self.sortDirection;
    };

    self.sort = function () {
        if (!self.allowSort) {
            return; // column sorting is disabled, do nothing
        }
        var dir = self.sortDirection === "asc" ? "desc" : "asc";
        self.sortDirection = dir;
        self.sortService.Sort(self, dir);
    };

    self.filterHasFocus = false;
    self.startMousePosition = 0;
    self.origWidth = 0;
    self.gripOnMouseUp = function () {
        $(document).off('mousemove');
        $(document).off('mouseup');
        document.body.style.cursor = 'default';
        return false;
    };
    self.onMouseMove = function (event) {
        var diff = event.clientX - self.startMousePosition;
        var newWidth = diff + self.origWidth;
        self.width = newWidth < self.minWidth ? self.minWidth : (newWidth > self.maxWidth ? self.maxWidth : newWidth);
        return false;
    };
    self.gripOnMouseDown = function (event) {
        self.startMousePosition = event.clientX;
        self.origWidth = self.width;
        $(document).mousemove(self.onMouseMove);
        $(document).mouseup(self.gripOnMouseUp);
        document.body.style.cursor = 'col-resize';
        event.target.parentElement.style.cursor = 'col-resize';
        return false;
    };
};