ng.Column = function (config, $scope, grid, domUtilityService) {
    var self = this,
        colDef = config.colDef,
		delay = 500,
        clicks = 0,
        timer = null;
    self.width = colDef.width;
    self.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
    self.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;
    self.headerRowHeight = config.headerRowHeight;
    self.displayName = colDef.displayName || colDef.field;
    self.index = config.index;
    self.isAggCol = config.isAggCol;
    self.cellClass = colDef.cellClass;
    self.cellFilter = colDef.cellFilter ? "|" + colDef.cellFilter : "";
    self.field = colDef.field;
    self.aggLabelFilter = colDef.cellFilter || colDef.aggLabelFilter;
    self.visible = ng.utils.isNullOrUndefined(colDef.visible) || colDef.visible;
    self.sortable = ng.utils.isNullOrUndefined(colDef.sortable) || colDef.sortable;
    self.resizable = ng.utils.isNullOrUndefined(colDef.resizable) || colDef.resizable;
    self.sortDirection = undefined;
    self.sortingAlgorithm = colDef.sortFn;
    self.headerClass = colDef.headerClass;
    self.headerCellTemplate = colDef.headerCellTemplate || ng.defaultHeaderCellTemplate();
    self.cellTemplate = colDef.cellTemplate || ng.defaultCellTemplate().replace(CUSTOM_FILTERS, self.cellFilter);
    if (colDef.cellTemplate && URI_REGEXP.test(colDef.cellTemplate)) {
        ng.utils.getTemplates(colDef.cellTemplate, function(t) {
            self.cellTemplate = t;
        });
    } 
    if (colDef.headerCellTemplate && URI_REGEXP.test(colDef.headerCellTemplate)) {
        self.headerCellTemplate = ng.utils.getTemplates(colDef.headerCellTemplate, function(t) {
            self.headerCellTemplate = t;
        });
    }
    self.toggleVisible = function () {
        self.visible = !self.visible;
    };
    self.showSortButtonUp = function () {
        return self.sortable ? self.sortDirection === DESC : self.sortable;
    };
    self.showSortButtonDown = function () {
        return self.sortable ? self.sortDirection === ASC : self.sortable;
    };     
    self.noSortVisible = function () {
        return !self.sortDirection;
    };
    self.sort = function () {
        if (!self.sortable) {
            return; // column sorting is disabled, do nothing
        }
        var dir = self.sortDirection === ASC ? DESC : ASC;
        self.sortDirection = dir;
        config.sortCallback(self, dir);
    };   
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
        if (event.ctrlKey) {
            self.toggleVisible();
            domUtilityService.BuildStyles($scope, grid);
            return true;
        }
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
        domUtilityService.BuildStyles($scope, grid);
        return false;
    };
    self.gripOnMouseUp = function () {
        $(document).off('mousemove');
        $(document).off('mouseup');
        document.body.style.cursor = 'default';
        domUtilityService.apply($scope);
        return false;
    };
};