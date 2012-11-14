/// <reference path="footer.js" />
/// <reference path="../services/SortService.js" />
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.Grid = function ($scope, options, gridDim, SortService) {
    var defaults = {
            rowHeight: 30,
            columnWidth: 100,
            headerRowHeight: 32,
            footerRowHeight: 55,
            footerVisible: true,
            canSelectRows: true,
            data: [],
            columnDefs: undefined,
            selectedItems: [], // array, if multi turned off will have only one item in array
            displaySelectionCheckbox: true, //toggles whether row selection check boxes appear
            selectWithCheckboxOnly: false,
            useExternalSorting: false,
            sortInfo: undefined, // similar to filterInfo
            multiSelect: true,
            tabIndex: -1,
            disableTextSelection: false,
            enableColumnResize: true,
            enableSorting: true,
            beforeSelectionChange: function () { return true;},
            afterSelectionChange: function () { return true;},
            rowTemplate: undefined,
            headerRowTemplate: undefined,
            plugins: [],
            keepLastSelected: true
        },
        self = this,
        isSorting = false,
        prevScrollTop,
        prevMinRowsToRender,
        maxCanvasHt = 0,
        hUpdateTimeout;
    
    //self vars
    self.initPhase = 0;
    self.config = $.extend(defaults, options);
    self.gridId = "ng" + ng.utils.newId();
    self.$root = null; //this is the root element that is passed in with the binding handler
    self.$topPanel = null;
    self.$headerContainer = null;
    self.$headerScroller = null;
    self.$headers = null;
    self.$viewport = null;
    self.$canvas = null;
    self.sortInfo = self.config.sortInfo;
    self.sortedData = $.extend(true,[], $scope.$parent[self.config.data] || self.config.data); // we cannot watch for updates if you don't pass the string name
    //initialized in the init method
    self.rowFactory = new ng.RowFactory(self);
    self.selectionService = new ng.SelectionService(self);
    self.sortService = SortService;
    self.lastSortedColumn = undefined;
    self.elementDims = {
        scrollW: 0,
        scrollH: 0,
        cellHdiff: 0,
        cellWdiff: 0,
        rowWdiff: 0,
        rowHdiff: 0,
        rowIndexCellW: 25,
        rowSelectedCellW: 25,
        rootMaxW: 0,
        rootMaxH: 0,
        rootMinW: 0,
        rootMinH: 0
    };
    // Set new default footer height if not overridden, and multi select is disabled
    if (self.config.footerRowHeight === defaults.footerRowHeight
        && !self.config.canSelectRows) {
        defaults.footerRowHeight = 30;
        self.config.footerRowHeight = 30;
    }
    //sefl funcs
    self.setRenderedRows = function (newRows) {
        $scope.renderedRows = newRows;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };
    self.minRowsToRender = function () {
        var viewportH = $scope.viewportDimHeight() || 1;
        prevMinRowsToRender = Math.floor(viewportH / self.config.rowHeight);
        return prevMinRowsToRender;
    };
    self.refreshDomSizes = function () {
        var dim = new ng.Dimension(),
            oldDim = $scope.rootDim,
            rootH,
            rootW,
            canvasH;

        maxCanvasHt = self.sortedData.length * self.config.rowHeight;
        $scope.elementsNeedMeasuring = true;
        //calculate the POSSIBLE biggest viewport height
        rootH = $scope.maxCanvasHeight() + self.config.headerRowHeight + self.config.footerRowHeight;
        //see which viewport height will be allowed to be used
        rootH = Math.min(self.elementDims.rootMaxH, rootH);
        rootH = Math.max(self.elementDims.rootMinH, rootH);
        //now calc the canvas height of what is going to be used in rendering
        canvasH = rootH - self.config.headerRowHeight - self.config.footerRowHeight;
        //get the max row Width for rendering
        rootW = $scope.totalRowWidth() + self.elementDims.rowWdiff;
        //now see if we are going to have a vertical scroll bar present
        if ($scope.maxCanvasHeight() > canvasH) {
            //if we are, then add that width to the max width 
            rootW += self.elementDims.scrollW || 0;
        }
        //now see if we are constrained by any width Dimensions
        dim.outerWidth = Math.min(self.elementDims.rootMaxW, rootW);
        dim.outerWidth = Math.max(self.elementDims.rootMinW, dim.outerWidth);
        dim.outerHeight = rootH;

        //finally don't fire the subscriptions if we aren't changing anything!
        if (dim.outerHeight !== oldDim.outerHeight || dim.outerWidth !== oldDim.outerWidth) {
            //if its not the same, then fire the subscriptions
            $scope.rootDim = dim;
        }
    };
    self.refreshDomSizesTrigger = function () {
        if (hUpdateTimeout) {
            if (window.setImmediate) {
                window.clearImmediate(hUpdateTimeout);
            } else {
                window.clearTimeout(hUpdateTimeout);
            }
        }
        if (self.initPhase > 0) {

            //don't shrink the grid if we sorting
            if (!isSorting) {
                self.refreshDomSizes();
                ng.cssBuilder.buildStyles();
                if (self.initPhase > 0 && self.$root) {
                    self.$root.show();
                }
            }
        }
    };
    self.buildColumnDefsFromData = function () {
        if (!self.config.columnDefs > 0) {
            self.config.columnDefs = [];
        }
        if (!self.sortedData || !self.sortedData[0]) {
            throw 'If auto-generating columns, "data" cannot be of null or undefined type!';
        }
        var item;
        item = self.sortedData[0];

        ng.utils.forIn(item, function (prop, propName) {
            self.config.columnDefs.push({
                field: propName
            });
        });

    };
    self.buildColumns = function () {
        var columnDefs = self.config.columnDefs,
            cols = [];

        if (!columnDefs) {
            self.buildColumnDefsFromData();
            columnDefs = self.config.columnDefs;
        }
        if (self.config.displaySelectionCheckbox) {
            columnDefs.splice(0, 0, {
                field: '',
                width: self.elementDims.rowSelectedCellW,
                sortable: false,
                resizable: false,
                headerCellTemplate: '<input class="ngSelectionHeader" type="checkbox" ng-show="multiSelect" ng-model="allSelected" ng-change="toggleSelectAll(allSelected)"/>',
                cellTemplate: '<div class="ngSelectionCell"><input class="ngSelectionCheckbox" type="checkbox" ng-checked="row.selected" /></div>'
            });
        }
        if (columnDefs.length > 0) {
            angular.forEach(columnDefs, function (colDef, i) {
                var column = new ng.Column({
                    colDef : colDef, 
                    index: i, 
                    headerRowHeight: self.config.headerRowHeight,
                    sortCallback: self.sortData, 
                    resizeOnDataCallback: self.resizeOnData,
                    cssBuilder: self.cssBuilder,
                    enableResize: self.config.enableColumnResize
                });
                cols.push(column);
            });
            $scope.columns = cols;
        }
    };
    self.init = function () {
        self.cssBuilder = new ng.CssBuilder($scope, self);
        self.buildColumns();
        self.sortService.columns = $scope.columns,
        $scope.$watch('sortInfo', self.sortService.updateSortInfo);
        $scope.maxRows = $scope.renderedRows.length;
        maxCanvasHt = self.sortedData.length * self.config.rowHeight;
        self.selectionService.Initialize({
            multiSelect: self.config.multiSelect,
            selectedItems: self.config.selectedItems,
            selectedIndex: self.config.selectedIndex,
            isMulti: self.config.multiSelect
        }, self.rowFactory);
        self.rowFactory.Initialize({
            selectionService: self.selectionService,
            rowHeight: self.config.rowHeight,
            rowConfig: {
                canSelectRows: self.config.canSelectRows,
                rowClasses: self.config.rowClasses,
                selectedItems: self.config.selectedItems,
                selectWithCheckboxOnly: self.config.selectWithCheckboxOnly,
                beforeSelectionChangeCallback: self.config.beforeSelectionChange,
                afterSelectionChangeCallback: self.config.afterSelectionChange
            }
        });
        angular.forEach($scope.columns, function (col) {
            if (col.widthIsConfigured) {
                col.width.$watch(function () {
                    self.rowFactory.dataChanged = true;
                    self.rowFactory.rowCache = []; //if data source changes, kill this!
                    self.rowFactory.calcRenderedRange();
                });
            }
        });
        self.cssBuilder.buildStyles();
        $scope.initPhase = 1;
    };
    self.update = function () {
        var updater = function () {
            self.refreshDomSizes();
            self.cssBuilder.buildStyles();
            if (self.initPhase > 0 && self.$root) {
                self.$root.show();
            }
        };
        if (window.setImmediate) {
            hUpdateTimeout = window.setImmediate(updater);
        } else {
            hUpdateTimeout = setTimeout(updater, 0);
        }
    };
    self.adjustScrollTop = function (scrollTop, force) {
        if (prevScrollTop === scrollTop && !force) { return; }
        var rowIndex = Math.floor(scrollTop / self.config.rowHeight);
        prevScrollTop = scrollTop;
        self.rowFactory.UpdateViewableRange(new ng.Range(rowIndex, rowIndex + self.minRowsToRender() + EXCESS_ROWS));
    };
    self.adjustScrollLeft = function (scrollLeft) {
        if (self.$headerContainer) {
            self.$headerContainer.scrollLeft(scrollLeft);
        }
    };
    self.resizeOnData = function (col, override) {
        if (col.longest) { // check for cache so we don't calculate again
            col.width = col.longest;
        } else {// we calculate the longest data.
            var road = override || self.config.resizeOnAllData;
            var longest = col.minWidth;
            var arr = road ? self.sortedData : $scope.renderedRows;
            angular.forEach(arr, function (data) {
                var i = ng.utils.visualLength(data[col.field]);
                if (i > longest) {
                    longest = i;
                }
            });
            longest += 10; //add 10 px for decent padding if resizing on data.
            col.longest = longest > col.maxWidth ? col.maxWidth : longest;
            col.width = longest;
        }
        if (col.widthWatcher) {
            col.widthWatcher();
        }
        self.cssBuilder.buildStyles();
    };
    self.sortData = function(col, direction) {
        sortInfo = {
            column: col,
            direction: direction
        };
        self.clearSortingData(col);
        self.sortService.Sort(sortInfo, self.sortedData);
        self.lastSortedColumn = col;
        self.rowFactory.sortedDataChanged();
    };
    self.clearSortingData = function (col) {
        if (!col) {
            angular.forEach($scope.columns, function (c) {
                c.sortDirection = "";
            });
        } else if (self.lastSortedColumn && col != self.lastSortedColumn) {
            self.lastSortedColumn.sortDirection = "";
        }
    };
    //$scope vars
    $scope.elementsNeedMeasuring = true;
    $scope.width = gridDim.outerWidth;
    $scope.columns = [];
    $scope.renderedRows = [];
    $scope.headerRow = null;
    $scope.rowHeight = self.config.rowHeight;
    $scope.footer = null;
    $scope.selectedItems = self.config.selectedItems;
    $scope.multiSelect = self.config.multiSelect;
    $scope.rootDim = gridDim;
    $scope.footerVisible = self.config.footerVisible;
    //scope funcs
    $scope.toggleSelectAll = function (a) {
        self.selectionService.toggleSelectAll(a);
    };
    $scope.totalItemsLength = function () {
        return self.sortedData.length;
    };
	
    $scope.maxCanvasHeight = function () {
        return maxCanvasHt || 0;
    };
    $scope.rowTemplate = function() {
        return self.config.rowTemplate || ng.defaultRowTemplate();
    };
    $scope.headerRowTemplate = function() {
        return self.config.headerRowTemplate || ng.defaultHeaderRowTemplate();
    };
    $scope.viewportDimHeight = function () {
        return Math.max(0, $scope.rootDim.outerHeight - self.config.headerRowHeight - self.config.footerRowHeight - 2);
    };
	$scope.headerCellSize = function(col){
		return { "width": col.width + "px", "height": col.headerRowHeight + "px"  };
	};
	$scope.rowStyle = function(row){
		return { "top": row.offsetTop + "px", "height": $scope.rowHeight + "px", "width": $scope.totalRowWidth() + "px" };
	};
	$scope.canvasHeight = function(){
		return { "height": maxCanvasHt.toString() + "px"};
	};
    $scope.headerScrollerSize = function() {
        return { "width": $scope.totalRowWidth() + ng.domUtility.scrollH + "px", "height": self.config.headerRowHeight + "px" };
    };
	$scope.headerSize = function() {
		return { "width": $scope.rootDim.outerWidth + "px", "height": self.config.headerRowHeight + "px" };
	};
	$scope.viewportSize = function() {
		return { "width": $scope.rootDim.outerWidth + "px", "height": $scope.viewportDimHeight() + "px" };
	};
	$scope.footerSize = function() {
		return { "width": $scope.rootDim.outerWidth + "px", "height": self.config.footerRowHeight + "px" };
	};
	
    $scope.totalRowWidth = function () {
        var totalWidth = 0,
            cols = $scope.columns,
            numOfCols = $scope.columns.length,
            asterisksArray = [],
            percentArray = [],
            asteriskNum = 0;
            
        angular.forEach(cols, function (col, i) {
            // get column width out of the observable
            var t = col.width;
            // check if it is a number
            if (isNaN(t)){
                // figure out if the width is defined or if we need to calculate it
                if (t == undefined) {
                    // set the width to the length of the header title +30 for sorting icons and padding
                    col.width = (col.displayName.length * ng.domUtility.letterW) + 30;
                } else if (t == "auto") { // set it for now until we have data and subscribe when it changes so we can set the width.
                    col.width = col.minWidth;
                    col.widthWatcher = $scope.$watch('renderedRows', function (newArr) {
                        if (newArr.length > 0) {
                            self.resizeOnData(col, true);
                        }
                    });
                } else if (t.indexOf("*") != -1){
                    // if it is the last of the columns just configure it to use the remaining space
                    if (i + 1 == numOfCols && asteriskNum == 0){
                        col.width = $scope.width - totalWidth;
                    } else { // otherwise we need to save it until the end to do the calulations on the remaining width.
                        asteriskNum += t.length;
                        asterisksArray.push(col);
                        return;
                    }
                } else if (ng.utils.endsWith(t, "%")){ // If the width is a percentage, save it until the very last.
                    percentArray.push(col);
                    return;
                } else { // we can't parse the width so lets throw an error.
                    throw "unable to parse column width, use percentage (\"10%\",\"20%\", etc...) or \"*\" to use remaining width of grid";
                }
            }
            // add the caluclated or pre-defined width the total width
            totalWidth += col.width;
            // set the flag as the width is configured so the subscribers can be added
            col.widthIsConfigured = true;
        });
        // check if we saved any asterisk columns for calculating later
        if (asterisksArray.length > 0){
            // get the remaining width
            var remainigWidth = $scope.width - totalWidth;
            // calculate the weight of each asterisk rounded down
            var asteriskVal = Math.floor(remainigWidth / asteriskNum);
            // set the width of each column based on the number of stars
            angular.forEach(asterisksArray, function (col) {
                var t = col.width.length;
                col.width = asteriskVal * t;
                totalWidth += col.width;
                col.widthIsConfigured = true;
            });
        }
        // Now we check if we saved any percentage columns for calculating last
        if (percentArray.length > 0){
            // do the math
            angular.forEach(percentArray, function (col) {
                var t = col.width;
                col.width = Math.floor($scope.width * (parseInt(t.slice(0, - 1)) / 100));
                totalWidth += col.width;
                col.widthIsConfigured = true;
            });
        }
        return totalWidth;
    };
    $scope.headerScrollerDim = function () {
        var viewportH = $scope.viewportDimHeight(),
            maxHeight = $scope.maxCanvasHeight(),
            vScrollBarIsOpen = (maxHeight > viewportH),
            newDim = new ng.Dimension();

        newDim.autoFitHeight = true;
        newDim.outerWidth = $scope.totalRowWidth();
        if (vScrollBarIsOpen) { newDim.outerWidth += self.elementDims.scrollW; }
        else if ((maxHeight - viewportH) <= self.elementDims.scrollH) { //if the horizontal scroll is open it forces the viewport to be smaller
            newDim.outerWidth += self.elementDims.scrollW;
        }
        return newDim;
    };
    //call init
    self.init();
};