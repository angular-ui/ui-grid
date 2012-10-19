/// <reference path="footer.js" />
/// <reference path="../services/SortService.js" />
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.Grid = function ($scope, options, gridHeight, gridWidth, FilterService, RowService, SelectionService, SortService) {
    var defaults = {
        rowHeight: 30,
        columnWidth: 100,
        headerRowHeight: 30,
        footerRowHeight: 55,
        filterRowHeight: 30,
        rowTemplate: ROW_TEMPLATE,
        headerTemplate: HEADERROW_TEMPLATE,
        headerCellTemplate: HEADERCELL_TEMPLATE,
        footerVisible: true,
        canSelectRows: true,
        autogenerateColumns: true,
        data: [],
        columnDefs: [],
        pageSizes: [250, 500, 1000], //page Sizes
        enablePaging: false,
        pageSize: 250, //Paging: Size of Paging data
        totalServerItems: undefined, //Paging: how many items are on the server
        currentPage: 1, //Paging: initial displayed page.
        selectedItems: [],
        selectedIndex: 0, //index of the selectedItem in the data array
        displaySelectionCheckbox: true, //toggles whether row selection check boxes appear
        displayRowIndex: true, //shows the rowIndex cell at the far left of each row
        useExternalFiltering: false,
        useExternalSorting: false,
        filterInfo: undefined, // holds filter information (fields, and filtering strings)
        sortInfo: undefined, // similar to filterInfo
        filterWildcard: "*",
        includeDestroyed: false, // flag to show _destroy=true items in grid
        selectWithCheckboxOnly: false,
        keepLastSelectedAround: false,
        isMultiSelect: true,
        lastClickedRow: undefined,
        tabIndex: -1,
        disableTextSelection: false,
        enableColumnResize: true
    },
    self = this,
    isSorting = false,
    prevScrollTop,
    prevMinRowsToRender,
    maxCanvasHt = 0,
    hUpdateTimeout;

    $scope.$root = null; //this is the root element that is passed in with the binding handler
    $scope.$topPanel = null;
    $scope.$headerContainer = null;
    $scope.$headerScroller = null;
    $scope.$headers = null;
    $scope.$viewport = null;
    $scope.$canvas = null;
    $scope.footerController = null;
    $scope.width = gridWidth;
    $scope.selectionManager = null;
    $scope.selectedItemCount= null;
    $scope.filterIsOpen = false;
    self.config = $.extend(defaults, options);
    self.gridId = "ng" + ng.utils.newId();
    $scope.initPhase = 0;


    // Set new default footer height if not overridden, and multi select is disabled
    if (self.config.footerRowHeight === defaults.footerRowHeight
        && !self.config.canSelectRows) {
        defaults.footerRowHeight = 30;
        self.config.footerRowHeight = 30;
    }
    
    // set this during the constructor execution so that the
    // computed observables register correctly;
    $scope.data = self.config.data;

    FilterService.Initialize(self.config);
    SortService.Initialize({
        data: FilterService.FilteredData,
        sortInfo: self.config.sortInfo,
        useExternalSorting: self.config.useExternalSorting
    });

    $scope.sortInfo = SortService.SortInfo; //observable
    $scope.filterInfo = FilterService.FilterInfo.get(); //observable
    $scope.filterIsOpen = false, //flag so that the header can subscribe and change height when opened
    $scope.finalData = SortService.SortedData(); //observable Array
    $scope.canvasHeight = maxCanvasHt.toString() + 'px';

    $scope.$parent.maxRows = function () {
        var rows = $scope.finalData;
        maxCanvasHt = rows.length * self.config.rowHeight;
        $scope.canvasHeight(maxCanvasHt.toString() + 'px');
        return rows.length || 0;
    };

    $scope.maxCanvasHeight = function () {
        return maxCanvasHt || 0;
    };

    $scope.columns = [];

    //initialized in the init method
    $scope.rowManager = null;
    $scope.rows = null;
    $scope.headerRow = null;
    $scope.footer = null;

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
    $scope.elementsNeedMeasuring = true;

    //#region Container Dimensions

    $scope.rootDim = new ng.Dimension({ outerHeight: gridHeight, outerWidth: gridWidth });

    $scope.headerDim = function () {
        var rootDim = $scope.rootDim,
            newDim = new ng.Dimension();

        newDim.outerHeight = self.config.headerRowHeight;
        newDim.outerWidth = rootDim.outerWidth;

        if ($scope.filterOpen) {
            newDim.outerHeight += self.config.filterRowHeight;
        }

        return newDim;
    };

    $scope.footerDim = function() {
        var rootDim = $scope.rootDim,
            showFooter = self.config.footerVisible,
            newDim = new ng.Dimension();

        newDim.outerHeight = self.config.footerRowHeight;
        newDim.outerWidth = rootDim.outerWidth;

        if (!showFooter) {
            newDim.outerHeight = 3;
        }

        return newDim;
    };

    $scope.viewportDim = function () {
        var rootDim = $scope.rootDim,
            headerDim = $scope.headerDim(),
            footerDim = $scope.footerDim(),
            newDim = new ng.Dimension();

        newDim.outerHeight = rootDim.outerHeight - headerDim.outerHeight - footerDim.outerHeight;
        newDim.outerWidth = rootDim.outerWidth;
        newDim.innerHeight = newDim.outerHeight;
        newDim.innerWidth = newDim.outerWidth;

        return newDim;
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
            });
        }
        // Now we check if we saved any percentage columns for calculating last
        if (percentArray.length > 0){
            // do the math
            angular.forEach(percentArray, function (col) {
                var t = col.width;
                col.width = Math.floor($scope.width * (parseInt(t.slice(0, - 1)) / 100));
                totalWidth += col.width;
            });
        }
        return totalWidth;
    };

    $scope.minRowsToRender = function () {
        var viewportH = $scope.viewportDim.outerHeight || 1;

        if ($scope.filterIsOpen) {
            return prevMinRowsToRender;
        };

        prevMinRowsToRender = Math.floor(viewportH / self.config.rowHeight);

        return prevMinRowsToRender;
    };


    $scope.headerScrollerDim = function () {
        var viewportH = $scope.viewportDim.outerHeight,
            maxHeight = $scope.maxCanvasHeight,
            vScrollBarIsOpen = (maxHeight > viewportH),
            newDim = new ng.Dimension();

        newDim.autoFitHeight = true;
        newDim.outerWidth = $scope.totalRowWidth;

        if (vScrollBarIsOpen) { newDim.outerWidth += self.elementDims.scrollW; }
        else if ((maxHeight - viewportH) <= self.elementDims.scrollH) { //if the horizontal scroll is open it forces the viewport to be smaller
            newDim.outerWidth += self.elementDims.scrollW;
        }
        return newDim;
    };

    //#endregion

    //#region Events
    $scope.toggleSelectAll = false;

    $scope.sortData = function (col, dir) {
        isSorting = true;

        angular.forEach($scope.columns, function (column) {
            if (column.field !== col.field) {
                if (column.sortDirection !== "") { column.sortDirection = ""; }
            }
        });

        SortService.Sort(col, dir);

        isSorting = false;
    };

    //#endregion

    $scope.scrollIntoView = function (entity) {
        var itemIndex = -1,
            viewableRange = $scope.rowManager.viewableRange;

        if (entity) {
            itemIndex = ng.utils.arrayIndexOf($scope.finalData, entity);
        }

        if (itemIndex > -1) {
            //check and see if its already in view!
            if (itemIndex > viewableRange.topRow || itemIndex < viewableRange.bottomRow - 5) {

                //scroll it into view
                $scope.rowManager.viewableRange = new ng.Range(itemIndex, itemIndex + $scope.minRowsToRender);

                if ($scope.$viewport) {
                    $scope.$viewport.scrollTop(itemIndex * self.config.rowHeight);
                }
            }
        };
    };

    self.refreshDomSizes = function () {
        var dim = new ng.Dimension(),
            oldDim = $scope.rootDim,
            rootH,
            rootW,
            canvasH;

        $scope.elementsNeedMeasuring = true;

        //calculate the POSSIBLE biggest viewport height
        rootH = $scope.maxCanvasHeight + self.config.headerRowHeight + self.config.footerRowHeight;

        //see which viewport height will be allowed to be used
        rootH = Math.min(self.elementDims.rootMaxH, rootH);
        rootH = Math.max(self.elementDims.rootMinH, rootH);

        //now calc the canvas height of what is going to be used in rendering
        canvasH = rootH - self.config.headerRowHeight - self.config.footerRowHeight;

        //get the max row Width for rendering
        rootW = $scope.totalRowWidth + self.elementDims.rowWdiff;

        //now see if we are going to have a vertical scroll bar present
        if ($scope.maxCanvasHeight > canvasH) {

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

    $scope.refreshDomSizesTrigger = (function () {

        if (hUpdateTimeout) {
            if (window.setImmediate) {
                window.clearImmediate(hUpdateTimeout);
            } else {
                window.clearTimeout(hUpdateTimeout);
            }
        }

        if ($scope.initPhase > 0) {

            //don't shrink the grid if we sorting or filtering
            if (!filterIsOpen && !isSorting) {

                $scope.refreshDomSizes();

                ng.cssBuilder.buildStyles($scope, self);

                if ($scope.initPhase > 0 && $scope.$root) {
                    $scope.$root.show();
                }
            }
        }

    })();

    $scope.buildColumnDefsFromData = function () {
        if (self.config.columnDefs.length > 0){
            return;
        }
        if (!$scope.data || !$scope.data[0]) {
            throw 'If auto-generating columns, "data" cannot be of null or undefined type!';
        }

        var item;
        item = $scope.data[0];

        ng.utils.forIn(item, function (prop, propName) {
            if (propName === SELECTED_PROP) {
                return;
            }

            self.config.columnDefs.push({
                field: propName
            });
        });

    };
    $scope.headerControllers = [];
    $scope.buildColumns = function () {
        $scope.headerControllers = [];
        var columnDefs = self.config.columnDefs,
            cols = [];

        if (self.config.autogenerateColumns) { $scope.buildColumnDefsFromData(); }

        if (self.config.displaySelectionCheckbox) {
            columnDefs.splice(0, 0, { field: SELECTED_PROP, width: self.elementDims.rowSelectedCellW });
        }
        if (self.config.displayRowIndex) {
            columnDefs.splice(0, 0, { field: 'rowIndex', width: self.elementDims.rowIndexCellW });
        }

        if (columnDefs.length > 0) {

            angular.forEach(columnDefs, function (colDef, i) {
                var newScope = $scope.$new();
                var column = new ng.Column(newScope, colDef, i);
                var newController = function controller($scope) { return new ng.HeaderCell(newScope, column); };
                $scope.headerControllers.push(newController);
                cols.push(column);
            });

            $scope.columns = cols;
        }
    };

    this.init = function () {

        $scope.buildColumns();

        //now if we are using the default templates, then make the generated ones unique
        if (self.config.rowTemplate === 'ngRowTemplate') {
            self.config.rowTemplate = self.gridId + self.config.rowTemplate;
        }

        if (self.config.headerTemplate === 'ngHeaderRowTemplate') {
            self.config.headerTemplate = self.gridId + self.config.headerTemplate;
        }

        RowService.Initialize($scope, self);
        SelectionService.Initialize({
            isMultiSelect: self.config.isMultiSelect,
            data: $scope.finalData,
            selectedItem: self.config.selectedItem,
            selectedItems: self.config.selectedItems,
            selectedIndex: self.config.selectedIndex,
            lastClickedRow: self.config.lastClickedRow,
            isMulti: self.config.isMultiSelect
        }, RowService);
        
        angular.forEach($scope.columns, function(col) {
            if (col.widthIsConfigured){
                col.width.$watch(function(){
                    $scope.rowManager.dataChanged = true;
                    $scope.rowManager.rowCache = []; //if data source changes, kill this!
                    $scope.rowManager.calcRenderedRange();
                });
            }
        });
        
        $scope.selectedItemCount = SelectionService.SelectedItemCount;
        $scope.toggleSelectAll = SelectionService.ToggleSelectAll;
        $scope.rows = RowService.Rows; // dependent observable

        ng.cssBuilder.buildStyles($scope, self);

        $scope.initPhase = 1;
    };

    this.update = function () {
        //we have to update async, or else all the observables are registered as dependencies

        var updater = function () {

            $scope.refreshDomSizes();

            ng.cssBuilder.buildStyles($scope, self);

            if ($scope.initPhase > 0 && $scope.$root) {
                $scope.$root.show();
            }
        };

        if (window.setImmediate) {
            hUpdateTimeout = window.setImmediate(updater);
        } else {
            hUpdateTimeout = setTimeout(updater, 0);
        }
    };

    $scope.showFilter_Click = function () {
        $scope.headerRow.filterVisible = !$scope.filterIsOpen;
        $scope.filterIsOpen = !$scope.filterIsOpen;
    };

    $scope.clearFilter_Click = function () {
        angular.forEach($scope.columns, function (col) {
            col.filter = null;
        });
    };

    self.adjustScrollTop = function (scrollTop, force) {
        if (prevScrollTop === scrollTop && !force) { return; }
        var rowIndex = Math.floor(scrollTop / self.config.rowHeight);
        prevScrollTop = scrollTop;
        RowService.ViewableRange(new ng.Range(rowIndex, rowIndex + $scope.minRowsToRender));
    };

    $scope.adjustScrollLeft = function (scrollLeft) {
        if ($scope.$headerContainer) {
            $scope.$headerContainer.scrollLeft(scrollLeft);
        }
    };

    $scope.footerVisible = self.config.footerVisible;
    $scope.pagerVisible = self.config.enablePaging;
    //call init
    self.init();
};