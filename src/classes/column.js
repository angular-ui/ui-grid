ng.Column = function ($scope, colDef, index) {
    
    var self = this;
    self.width = colDef.width;
    $scope.width = self.width;
    $scope.widthIsConfigured = false;
    $scope.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
    $scope.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;
    
    $scope.field = colDef.field;
    if (colDef.displayName === undefined || colDef.displayName === null) {
        // Allow empty column names -- do not check for empty string
        colDef.displayName = colDef.field;
    }
    self.displayName = colDef.displayName;
    $scope.displayName = self.displayName;
    self.index = index;
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
};