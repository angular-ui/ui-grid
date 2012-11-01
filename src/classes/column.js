ng.Column = function (colDef, index, headerRowHeight, sortService) {
    var self = this;
    
    self.sortService = sortService;

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

    self.allowSort = colDef.sortable;

    self.sortDirection = undefined;
    self.sortingAlgorithm = colDef.sortFn;

    //cell Template
    self.cellTemplate = function() {
        return colDef.cellTemplate || '<div class="ngCellText">{{row.entity[col.field]}}</div>';
    };
    self.hasCellTemplate = (self.cellTemplate ? true : false);

    self.cellClass = colDef.cellClass;
    self.headerClass = colDef.headerClass;

    self.headerCellTemplate = function() {
        return colDef.headerCellTemplate || ng.defaultHeaderCellTemplate();
    };
    
    self.showSortButtonUp = function () {
        return self.allowSort ? self.sortDirection === DESC : self.allowSort;
    };
    self.showSortButtonDown = function () {
        return self.allowSort ? self.sortDirection === ASC : self.allowSort;
    };    
  
    self.noSortVisible = function () {
        var ret = self.sortDirection !== ASC && self.sortDirection !== DESC;
        return !self.sortDirection;
    };

    self.sort = function () {
        if (!self.allowSort) {
            return; // column sorting is disabled, do nothing
        }
        var dir = self.sortDirection === ASC ? DESC : ASC;
        self.sortDirection = dir;
        self.sortService.Sort(self, dir);
    };
};