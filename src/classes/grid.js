/// <reference path="footer.js" />
/// <reference path="../services/SortService.js" />
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
ng.Grid = function ($scope, options, gridDim, sortService, domUtilityService) {
    var defaults = {
            rowHeight: 30,
            columnWidth: 100,
            headerRowHeight: 30,
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
			jqueryUITheme: false,
			jqueryUIDraggable: false,
            plugins: [],
            keepLastSelected: true,
            groups: [],
            showGroupPanel: false,
            enableRowReordering: false,
            showColumnMenu: true,
            showFilter: true,
            filterOptions: {
                filterText: "",
                useExternalFilter: false,
            },
            //Paging 
            enablePaging: false,
            pagingOptions: {
                pageSizes: [250, 500, 1000], //page Sizes
                pageSize: 250, //Size of Paging data
                totalServerItems: undefined, //how many items are on the server (for paging)
                currentPage: 1, //what page they are currently on
            },
        },
        self = this,
        hUpdateTimeout;
    
    self.maxCanvasHt = 0;
    //self vars
    self.initPhase = 0;
    self.config = $.extend(defaults, options);
    self.gridId = "ng" + ng.utils.newId();
    self.$root = null; //this is the root element that is passed in with the binding handler
	self.$groupPanel = null;
    self.$topPanel = null;
    self.$headerContainer = null;
    self.$headerScroller = null;
    self.$headers = null;
    self.$viewport = null;
    self.$canvas = null;
    self.sortInfo = self.config.sortInfo;
    self.sortedData = [];
    self.lateBindColumns = false;
    self.filteredData = [];
    if (typeof self.config.data == "object") {
        self.sortedData = $.extend(true, [], self.config.data); // we cannot watch for updates if you don't pass the string name
    }
    self.lastSortedColumn = undefined;
    self.calcMaxCanvasHeight = function() {
        return (self.config.groups.length > 0) ? (self.rowFactory.parsedData.filter(function (e) {
            return e[NG_HIDDEN] === false;
        }).length * self.config.rowHeight) : (self.filteredData.length * self.config.rowHeight);
    };
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
    //self funcs
    self.setRenderedRows = function (newRows) {
        $scope.renderedRows = newRows;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
        self.refreshDomSizes();
    };
    self.minRowsToRender = function () {
        var viewportH = $scope.viewportDimHeight() || 1;
        return Math.floor(viewportH / self.config.rowHeight);
    };
    self.refreshDomSizes = function () {
        var dim = new ng.Dimension(),
            oldDim = $scope.rootDim,
            rootH,
            rootW,
            canvasH;

        self.maxCanvasHt = self.calcMaxCanvasHeight();
        $scope.elementsNeedMeasuring = true;
        //calculate the POSSIBLE biggest viewport height
        rootH = self.maxCanvasHt + self.config.headerRowHeight + self.config.footerRowHeight;
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
        domUtilityService.BuildStyles($scope,self,true);
    };
    self.refreshDomSizesTrigger = function () {
        if (hUpdateTimeout) {
            if (window.setImmediate) {
                window.clearImmediate(hUpdateTimeout);
            } else {
                window.clearTimeout(hUpdateTimeout);
            }
        }
    };
    self.buildColumnDefsFromData = function () {
        if (!self.config.columnDefs > 0) {
            self.config.columnDefs = [];
        }
        if (!self.sortedData || !self.sortedData[0]) {
            self.lateBoundColumns = true;
            return;
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
                field: '\u2714',
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
                    colDef: colDef, 
                    index: i, 
                    headerRowHeight: self.config.headerRowHeight,
                    sortCallback: self.sortData, 
                    resizeOnDataCallback: self.resizeOnData,
                    enableResize: self.config.enableColumnResize
                }, $scope, self, domUtilityService);
                cols.push(column);
                var indx = self.config.groups.indexOf(colDef.field);
                if (indx != -1) {
                    $scope.configGroups.splice(indx, 0, column);
                }
            });
            $scope.columns = cols;
        }
    };
    self.init = function () {
        //factories and services
        self.selectionService = new ng.SelectionService(self);
        self.rowFactory = new ng.RowFactory(self, $scope);
        self.selectionService.Initialize(self.rowFactory);
        self.searchProvider = new ng.SearchProvider($scope, self);
        self.styleProvider = new ng.StyleProvider($scope, self, domUtilityService);
        self.buildColumns();
        sortService.columns = $scope.columns,
        $scope.$watch('sortInfo', sortService.updateSortInfo);
        $scope.$watch('configGroups', function (a) {
            if (!a) return;
            var tempArr = [];
            angular.forEach(a, function(item) {
                tempArr.push(item.field || item);
            });
            self.config.groups = tempArr;
            self.rowFactory.filteredDataChanged();
        }, true);
        $scope.$watch('columns', function () {
            domUtilityService.BuildStyles($scope,self,true);
        }, true);
        self.maxCanvasHt = self.calcMaxCanvasHeight();
        domUtilityService.BuildStyles($scope,self,true);
        $scope.initPhase = 1;
    };
    self.update = function () {
        var updater = function () {
            self.refreshDomSizes();
            domUtilityService.BuildStyles($scope,self,true);
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
    self.prevScrollTop = 0;
    self.prevScrollIndex = 0;
    self.adjustScrollTop = function (scrollTop, force) {
        if (self.prevScrollTop === scrollTop && !force) { return; }
        var rowIndex = Math.floor(scrollTop / self.config.rowHeight);
        // Have we hit the threshold going down?
        if (self.prevScrollTop < scrollTop && rowIndex < self.prevScrollIndex + SCROLL_THRESHOLD) return;
        //Have we hit the threshold going up?
        if (self.prevScrollTop > scrollTop && rowIndex > self.prevScrollIndex - SCROLL_THRESHOLD) return;
        self.prevScrollTop = scrollTop;
        self.rowFactory.UpdateViewableRange(new ng.Range(Math.max(0, rowIndex - EXCESS_ROWS), rowIndex + self.minRowsToRender() + EXCESS_ROWS));
        self.prevScrollIndex = rowIndex;
    };
    self.adjustScrollLeft = function (scrollLeft) {
        if (self.$headerContainer) {
            self.$headerContainer.scrollLeft(scrollLeft);
        }
    };
    self.resizeOnData = function (col) {
        // we calculate the longest data.
        var longest = col.minWidth;
        var arr = ng.utils.getElementsByClassName('col' + col.index);
        angular.forEach(arr, function (elem, index) {
            var i;
            if (index == 0) {
                var kgHeaderText = $(elem).find('.ngHeaderText');
                i = ng.utils.visualLength(kgHeaderText) + 10;// +10 some margin
            } else {
                var ngCellText = $(elem).find('.ngCellText');
                i = ng.utils.visualLength(ngCellText) + 10; // +10 some margin
            }
            if (i > longest) {
                longest = i;
            }
        });
        col.width = col.longest = Math.min(col.maxWidth, longest + 7); // + 7 px to make it look decent.
        domUtilityService.BuildStyles($scope,self,true);
    };
    self.sortData = function(col, direction) {
        sortInfo = {
            column: col,
            direction: direction
        };
        self.clearSortingData(col);
        sortService.Sort(sortInfo, self.sortedData);
        self.lastSortedColumn = col;
        self.searchProvider.evalFilter();
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
    self.fixColumnIndexes = function() {
        //fix column indexes
        angular.forEach($scope.columns, function(col, i) {
            col.index = i;
        });
    };
    //$scope vars
    $scope.elementsNeedMeasuring = true;
    $scope.width = gridDim.outerWidth;
    $scope.columns = [];
    $scope.renderedRows = [];
    $scope.headerRow = null;
    $scope.rowHeight = self.config.rowHeight;
	$scope.jqueryUITheme = self.config.jqueryUITheme;
    $scope.footer = null;
    $scope.selectedItems = self.config.selectedItems;
    $scope.multiSelect = self.config.multiSelect;
    $scope.rootDim = gridDim;
    $scope.footerVisible = self.config.footerVisible;
    $scope.showColumnMenu = self.config.showColumnMenu;
    $scope.showMenu = false;
    $scope.configGroups = [];

    //Paging
    $scope.enablePaging = self.config.enablePaging;
    $scope.pagingOptions = self.config.pagingOptions;
    
    //scope funcs
    $scope.visibleColumns = function () {
        return $scope.columns.filter(function (col) {
            return col.visible;
        });
    };
    $scope.toggleShowMenu = function () {
        $scope.showMenu = !$scope.showMenu;
    };
    $scope.toggleSelectAll = function (a) {
        self.selectionService.toggleSelectAll(a);
    };
    $scope.totalFilteredItemsLength = function () {
        return Math.max(self.filteredData.length);
    };
	$scope.showGroupPanel = function(){
		return self.config.showGroupPanel;
	};
	$scope.topPanelHeight = function(){
	    return self.config.showGroupPanel == true ? self.config.headerRowHeight * 2 : self.config.headerRowHeight;
	};
    $scope.maxCanvasHeight = function () {
        return self.maxCanvasHt;
    };
    $scope.rowTemplate = function() {
        return self.config.rowTemplate || ng.defaultRowTemplate();
    };
    $scope.headerRowTemplate = function() {
        return self.config.headerRowTemplate || ng.defaultHeaderRowTemplate();
    };
    $scope.viewportDimHeight = function () {
        return Math.max(0, $scope.rootDim.outerHeight - $scope.topPanelHeight() - self.config.footerRowHeight - 2);
    };
    $scope.groupBy = function(col) {
        var indx = $scope.configGroups.indexOf(col);
        if (indx == -1) {
            $scope.configGroups.push(col);
        } else {
            $scope.configGroups.splice(indx, 1);
            $scope.columns.splice(indx, 1);
        }
    };
    $scope.removeGroup = function(index) {
        $scope.columns.splice(index, 1);
        $scope.configGroups.splice(index, 1);
        if ($scope.configGroups.length == 0) {
            self.fixColumnIndexes();
            domUtilityService.apply();
        }
    };
    $scope.totalRowWidth = function () {
        var totalWidth = 0,
            asterisksArray = [],
            percentArray = [],
            asteriskNum = 0,
            cols = $scope.visibleColumns();
        var numOfCols = cols.length;
            
        angular.forEach(cols, function (col, i) {
            // get column width 
            var t = parseInt(col.width);
            var isPercent = isNaN(t) ? ng.utils.endsWith(t, "%") : false;
            t = isPercent ? t : parseInt(t);
            // check if it is a number
            if (isNaN(t)) {
                t = col.width;
                // figure out if the width is defined or if we need to calculate it
                if (t == undefined) {
                    // set the width to the length of the header title +30 for sorting icons and padding
                    col.width = (col.displayName.length * domUtilityService.LetterW) + 30;
                } else if (t == "auto") { // set it for now until we have data and subscribe when it changes so we can set the width.
                    col.width = col.minWidth;
                    var temp = col;
                    $(document).ready(function () { self.resizeOnData(temp, true); });
                    return;
                } else if (t.indexOf("*") != -1){
                    // if it is the last of the columns just configure it to use the remaining space
                    if (i + 1 == numOfCols && asteriskNum == 0){
                        col.width = $scope.width - totalWidth;
                    } else { // otherwise we need to save it until the end to do the calulations on the remaining width.
                        asteriskNum += t.length;
                        asterisksArray.push(col);
                        return;
                    }
                } else if (isPercent) { // If the width is a percentage, save it until the very last.
                    percentArray.push(col);
                    return;
                } else { // we can't parse the width so lets throw an error.
                    throw "unable to parse column width, use percentage (\"10%\",\"20%\", etc...) or \"*\" to use remaining width of grid";
                }
            }
            // add the caluclated or pre-defined width the total width
            totalWidth += col.width = parseInt(col.width);
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