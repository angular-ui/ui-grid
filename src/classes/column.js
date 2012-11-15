ng.Column = function (config) {
    var self = this,
        colDef = config.colDef;
    
    self.width = colDef.width;
    self.widthIsConfigured = false;
    self.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
    self.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;
    self.headerRowHeight = config.headerRowHeight;
    self.widthWatcher = null;
    self.isAggCol = config.isAggCol;
    self.field = colDef.field;
    self.aggLabelFilter = colDef.aggLabelFilter;

    if (!colDef.displayName) {
        // Allow empty column names -- do not check for empty string
        colDef.displayName = colDef.field;
    }
    self.displayName = colDef.displayName;
    self.index = config.index;
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
    self.allowResize = config.enableResize ? colDef.resizable : false;
    
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
        return !self.sortDirection;
    };

    self.sort = function () {
        if (!self.allowSort) {
            return; // column sorting is disabled, do nothing
        }
        var dir = self.sortDirection === ASC ? DESC : ASC;
        self.sortDirection = dir;
        config.sortCallback(self, dir);
    };
    var delay = 500,
        clicks = 0,
        timer = null;
    
    self.gripClick = function () {
        clicks++;  //count clicks
        if (clicks === 1) {
            timer = setTimeout(function () {
                //Here you can add a single click action.
                clicks = 0;  //after action performed, reset counter
            }, delay);
        } else {
            clearTimeout(timer);  //prevent single-click action
            config.resizeOnDataCallback(self);  //perform double-click action
            clicks = 0;  //after action performed, reset counter
        }
    };

    self.gripOnMouseDown = function (event) {
        document.body.style.cursor = 'col-resize';
        event.target.parentElement.style.cursor = 'col-resize';
        self.startMousePosition = event.clientX;
        self.origWidth = self.width;
        $(document).mousemove(self.onMouseMove);
        $(document).mouseup(self.gripOnMouseUp);
        return false;
    };
    self.onMouseMove = function (event) {
        var diff = event.clientX - self.startMousePosition;
        var newWidth = diff + self.origWidth;
        self.width = (newWidth < self.minWidth ? self.minWidth : (newWidth > self.maxWidth ? self.maxWidth : newWidth));
        config.cssBuilder.buildStyles();
        return false;
    };
    self.gripOnMouseUp = function () {
        $(document).off('mousemove');
        $(document).off('mouseup');
        document.body.style.cursor = 'default';
        return false;
    };
};