ng.Column = function ($scope, colDef, index, headerRowHeight) {
    
    var self = this;

    $scope.allowSort = colDef.allowSort;
    $scope.allowFilter = colDef.allowFilter;
    $scope.allowResize = colDef.allowResize;

    self.width = colDef.width;
    $scope.width = self.width;
    $scope.widthIsConfigured = false;
    $scope.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
    $scope.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;
    self.headerRowHeight = headerRowHeight;
    $scope.headerRowHeight = self.headerRowHeight;

    $scope.field = colDef.field;
    if (colDef.displayName === undefined || colDef.displayName === null) {
        // Allow empty column names -- do not check for empty string
        colDef.displayName = colDef.field;
    }
    self.displayName = colDef.displayName;
    $scope.displayName = self.displayName;
    self.index = index;
    $scope.index = self.index;
    $scope.isVisible = false;

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

    $scope.allowSort = colDef.sortable;
    $scope.allowResize = colDef.resizable;
    $scope.allowFilter = colDef.filterable;

    $scope.sortDirection = "";
    $scope.sortingAlgorithm = colDef.sortFn;

    //filtering
    $scope.filter = null;

    //cell Template
    $scope.cellTemplate = colDef.cellTemplate; // string of the cellTemplate script element id
    $scope.hasCellTemplate = ($scope.cellTemplate ? true : false);

    $scope.cellClass = colDef.cellClass;
    $scope.headerClass = colDef.headerClass;

    $scope.headerTemplate = colDef.headerTemplate;
    $scope.hasHeaderTemplate = ($scope.headerTemplate ? true : false);
    $scope.showSortButtonUp = function () {
        return $scope.allowSort ? ($scope.noSortVisible() || $scope.sortDirection === "desc") : allowSort;
    };
    $scope.showSortButtonDown = function () {
        return $scope.allowSort ? ($scope.noSortVisible() || $scope.sortDirection === "asc") : allowSort;
    };    
  
    $scope.filter = "";
    this.filterVisible = false;

    $scope.noSortVisible = function () {
        var sortDir = self.column.sortDirection;
        return sortDir !== "asc" && sortDir !== "desc";
    };

    $scope.sort = function () {
        if (!self.allowSort) {
            return; // column sorting is disabled, do nothing
        }
        var dir = $scope.sortDirection === "asc" ? "desc" : "asc";
        $scope.sortDirection = dir;
    };

    $scope.filterHasFocus = false;
    $scope.startMousePosition = 0;
    $scope.origWidth = 0;
    $scope.gripOnMouseUp = function () {
        $(document).off('mousemove');
        $(document).off('mouseup');
        document.body.style.cursor = 'default';
        return false;
    };
    $scope.onMouseMove = function (event) {
        var diff = event.clientX - $scope.startMousePosition;
        var newWidth = diff + $scope.origWidth;
        $scope.width = newWidth < self.minWidth ? $scope.minWidth : (newWidth > $scope.maxWidth ? $scope.maxWidth : newWidth);
        return false;
    };
    $scope.gripOnMouseDown = function (event) {
        self.startMousePosition = event.clientX;
        self.origWidth = self.width;
        $(document).mousemove(self.onMouseMove);
        $(document).mouseup(self.gripOnMouseUp);
        document.body.style.cursor = 'col-resize';
        event.target.parentElement.style.cursor = 'col-resize';
        return false;
    };
};