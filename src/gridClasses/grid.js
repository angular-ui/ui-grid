/// <reference path="../lib/jquery-1.7.js" />
/// <reference path="../lib/knockout-2.0.0.debug.js" />

ng.grid = function (options, gridWidth) {
    var defaults = {
        rowHeight: 30,
        columnWidth: 100,
        headerRowHeight: 30,
        footerRowHeight: 55,
        filterRowHeight: 30,
        rowTemplate: 'ngRowTemplate',
        headerTemplate: 'ngHeaderRowTemplate',
        headerCellTemplate: 'ngHeaderCellTemplate',
        footerTemplate: 'ngFooterTemplate',
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
    filterManager, //ng.filterManager
    sortManager, //ng.sortManager
    isSorting = false,
    prevScrollTop,
    prevScrollLeft,
    prevMinRowsToRender,
    maxCanvasHt = 0,
    h_updateTimeout;

    this.$root; //this is the root element that is passed in with the binding handler
    this.$topPanel;
    this.$headerContainer;
    this.$headerScroller;
    this.$headers;
    this.$viewport;
    this.$canvas;
    this.$footerPanel;
    this.width = gridWidth;
    this.selectionManager;
    this.selectedItemCount;
    
    this.config = $.extend(defaults, options);
    this.gridId = "ng" + ng.utils.newId();
    this.initPhase = 0;


    // Set new default footer height if not overridden, and multi select is disabled
    if (this.config.footerRowHeight === defaults.footerRowHeight
        && !this.config.canSelectRows) {
        defaults.footerRowHeight = 30;
        this.config.footerRowHeight = 30;
    }
    
    // set this during the constructor execution so that the
    // computed observables register correctly;
    this.data = self.config.data;

    filterManager = new ng.filterManager(self.config);
    sortManager = new ng.sortManager({
        data: filterManager.filteredData,
        sortInfo: self.config.sortInfo,
        useExternalSorting: self.config.useExternalSorting
    });

    this.sortInfo = sortManager.sortInfo; //observable
    this.filterInfo = filterManager.filterInfo; //observable
    this.filterIsOpen = false, //flag so that the header can subscribe and change height when opened
    this.finalData = sortManager.sortedData; //observable Array
    this.canvasHeight = maxCanvasHt.toString() + 'px';

    this.maxRows = (function () {
        var rows = self.finalData;
        maxCanvasHt = rows.length * self.config.rowHeight;
        self.canvasHeight(maxCanvasHt.toString() + 'px');
        return rows.length || 0;
    })();

    this.maxCanvasHeight = function () {
        return maxCanvasHt || 0;
    };

    this.columns = [];

    //initialized in the init method
    this.rowManager;
    this.rows;
    this.headerRow;
    this.footer;

    this.elementDims = {
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
    this.elementsNeedMeasuring = true;

    //#region Container dimensions

    this.rootDim = new ng.dimension({ outerHeight: 20000, outerWidth: 20000 });

    this.headerDim = (function () {
        var rootDim = self.rootDim(),
            newDim = new ng.dimension();

        newDim.outerHeight = self.config.headerRowHeight;
        newDim.outerWidth = rootDim.outerWidth;

        if (filterOpen) {
            newDim.outerHeight += self.config.filterRowHeight;
        }

        return newDim;
    })();

    this.footerDim = (function () {
        var rootDim = self.rootDim(),
            showFooter = self.config.footerVisible,
            newDim = new ng.dimension();

        newDim.outerHeight = self.config.footerRowHeight;
        newDim.outerWidth = rootDim.outerWidth;

        if (!showFooter) {
            newDim.outerHeight = 3;
        }

        return newDim;
    })();

    this.viewportDim = (function () {
        var rootDim = self.rootDim,
            headerDim = self.headerDim,
            footerDim = self.footerDim,
            newDim = new ng.dimension();

        newDim.outerHeight = rootDim.outerHeight - headerDim.outerHeight - footerDim.outerHeight;
        newDim.outerWidth = rootDim.outerWidth;
        newDim.innerHeight = newDim.outerHeight;
        newDim.innerWidth = newDim.outerWidth;

        return newDim;
    })();

    this.totalRowWidth = (function () {
        var totalWidth = 0,
            cols = self.columns,
            numOfCols = self.columns.length,
            asterisksArray = [],
            percentArray = [],
            asteriskNum = 0;
            
        ng.utils.forEach(cols, function (col, i) {
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
                        col.width = self.width - totalWidth;
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
            var remainigWidth = self.width - totalWidth;
            // calculate the weight of each asterisk rounded down
            var asteriskVal = Math.floor(remainigWidth / asteriskNum);
            // set the width of each column based on the number of stars
            ng.utils.forEach(asterisksArray, function (col, i) {
                var t = col.width.length;
                col.width = asteriskVal * t;
                totalWidth += col.width;
            });
        }
        // Now we check if we saved any percentage columns for calculating last
        if (percentArray.length > 0){
            // do the math
            ng.utils.forEach(percentArray, function (col, i) {
                var t = col.width;
                col.width = Math.floor(self.width * (parseInt(t.slice(0, - 1)) / 100));
                totalWidth += col.width;
            });
        }
        return totalWidth;
    })();

    this.minRowsToRender = (function () {
        var viewportH = self.viewportDim.outerHeight || 1;

        if (filterIsOpen) {
            return prevMinRowsToRender;
        };

        prevMinRowsToRender = Math.floor(viewportH / self.config.rowHeight);

        return prevMinRowsToRender;
    })();


    this.headerScrollerDim = (function () {
        var viewportH = self.viewportDim.outerHeight,
            filterOpen = filterIsOpen, //register this observable
            maxHeight = self.maxCanvasHeight,
            vScrollBarIsOpen = (maxHeight > viewportH),
            hScrollBarIsOpen = (self.viewportDim.outerWidth < self.totalRowWidth),
            newDim = new ng.dimension();

        newDim.autoFitHeight = true;
        newDim.outerWidth = self.totalRowWidth;

        if (vScrollBarIsOpen) { newDim.outerWidth += self.elementDims.scrollW; }
        else if ((maxHeight - viewportH) <= self.elementDims.scrollH) { //if the horizontal scroll is open it forces the viewport to be smaller
            newDim.outerWidth += self.elementDims.scrollW;
        }
        return newDim;
    })();

    //#endregion

    //#region Events
    this.toggleSelectAll;

    this.sortData = function (col, dir) {
        isSorting = true;

        ng.utils.forEach(self.columns, function (column) {
            if (column.field !== col.field) {
                if (column.sortDirection !== "") { column.sortDirection = ""; }
            }
        });

        sortManager.sort(col, dir);

        isSorting = false;
    };

    //#endregion

    //keep selected item scrolled into view
    this.finalData.$watch(function () {
         if (self.config.selectedItems()) {
            var lastItemIndex = self.config.selectedItems.length - 1;
            if (lastItemIndex <= 0) {
                var item = self.config.selectedItems[lastItemIndex];
                if (item) {
                   self.scrollIntoView(item);
                }
            }
        }
    });

    this.scrollIntoView = function (entity) {
        var itemIndex,
            viewableRange = self.rowManager.viewableRange;

        if (entity) {
            itemIndex = ng.utils.arrayIndexOf(self.finalData, entity);
        }

        if (itemIndex > -1) {
            //check and see if its already in view!
            if (itemIndex > viewableRange.topRow || itemIndex < viewableRange.bottomRow - 5) {

                //scroll it into view
                self.rowManager.viewableRange = new ng.range(itemIndex, itemIndex + self.minRowsToRender);

                if (self.$viewport) {
                    self.$viewport.scrollTop(itemIndex * self.config.rowHeight);
                }
            }
        };
    };

    this.refreshDomSizes = function () {
        var dim = new ng.dimension(),
            oldDim = self.rootDim,
            rootH = 0,
            rootW = 0,
            canvasH = 0;

        self.elementsNeedMeasuring = true;

        //calculate the POSSIBLE biggest viewport height
        rootH = self.maxCanvasHeight + self.config.headerRowHeight + self.config.footerRowHeight;

        //see which viewport height will be allowed to be used
        rootH = Math.min(self.elementDims.rootMaxH, rootH);
        rootH = Math.max(self.elementDims.rootMinH, rootH);

        //now calc the canvas height of what is going to be used in rendering
        canvasH = rootH - self.config.headerRowHeight - self.config.footerRowHeight;

        //get the max row Width for rendering
        rootW = self.totalRowWidth + self.elementDims.rowWdiff;

        //now see if we are going to have a vertical scroll bar present
        if (self.maxCanvasHeight > canvasH) {

            //if we are, then add that width to the max width 
            rootW += self.elementDims.scrollW || 0;
        }

        //now see if we are constrained by any width dimensions
        dim.outerWidth = Math.min(self.elementDims.rootMaxW, rootW);
        dim.outerWidth = Math.max(self.elementDims.rootMinW, dim.outerWidth);

        dim.outerHeight = rootH;

        //finally don't fire the subscriptions if we aren't changing anything!
        if (dim.outerHeight !== oldDim.outerHeight || dim.outerWidth !== oldDim.outerWidth) {

            //if its not the same, then fire the subscriptions
            self.rootDim = dim;
        }
    };

    this.refreshDomSizesTrigger = (function () {

        if (h_updateTimeout) {
            if (window.setImmediate) {
                window.clearImmediate(h_updateTimeout);
            } else {
                window.clearTimeout(h_updateTimeout);
            }
        }

        if (self.initPhase > 0) {

            //don't shrink the grid if we sorting or filtering
            if (!filterIsOpen && !isSorting) {

                self.refreshDomSizes();

                ng.cssBuilder.buildStyles(self);

                if (self.initPhase > 0 && self.$root) {
                    self.$root.show();
                }
            }
        }

    })();

    this.buildColumnDefsFromData = function () {
        if (self.config.columnDefs.length > 0){
            return;
        }
        if (!self.data || !self.data[0]) {
            throw 'If auto-generating columns, "data" cannot be of null or undefined type!';
        }

        var item;
        item = self.data[0];

        ng.utils.forIn(item, function (prop, propName) {
            if (propName === '__ng_selected__') {
                return;
            }

            self.config.columnDefs.push({
                field: propName
            });
        });

    };

    this.buildColumns = function () {
        var columnDefs = self.config.columnDefs,
            cols = [];

        if (self.config.autogenerateColumns) { self.buildColumnDefsFromData(); }

        if (self.config.displaySelectionCheckbox) {
            columnDefs.splice(0, 0, { field: '__ng_selected__', width: self.elementDims.rowSelectedCellW });
        }
        if (self.config.displayRowIndex) {
            columnDefs.splice(0, 0, { field: 'rowIndex', width: self.elementDims.rowIndexCellW });
        }
        
        var createColumnSortClosure = function (col) {
            return function (dir) {
                if (dir) {
                    self.sortData(col, dir);
                }
            }
        }

        if (columnDefs.length > 0) {

            ng.utils.forEach(columnDefs, function (colDef, i) {
                var column = new ng.column(colDef, i);
                column.sortDirection.$watch(createColumnSortClosure(column));                
                column.filter.$watch(filterManager.createFilterChangeCallback(column));
                cols.push(column);
            });

            self.columns = cols;
        }
    };

    this.init = function () {

        self.buildColumns();

        //now if we are using the default templates, then make the generated ones unique
        if (self.config.rowTemplate === 'ngRowTemplate') {
            self.config.rowTemplate = self.gridId + self.config.rowTemplate;
        }

        if (self.config.headerTemplate === 'ngHeaderRowTemplate') {
            self.config.headerTemplate = self.gridId + self.config.headerTemplate;
        }

        self.rowManager = new ng.rowManager(self);
        self.selectionManager = new ng.selectionManager({
            isMultiSelect: self.config.isMultiSelect,
            data: self.finalData,
            selectedItem: self.config.selectedItem,
            selectedItems: self.config.selectedItems,
            selectedIndex: self.config.selectedIndex,
            lastClickedRow: self.config.lastClickedRow,
            isMulti: self.config.isMultiSelect
        }, self.rowManager);
        
        ng.utils.forEach(self.columns, function(col) {
            if (col.widthIsConfigured){
                col.width.$watch(function(){
                    self.rowManager.dataChanged = true;
                    self.rowManager.rowCache = []; //if data source changes, kill this!
                    self.rowManager.calcRenderedRange();
                });
            }
        });
        
        self.selectedItemCount = self.selectionManager.selectedItemCount;
        self.toggleSelectAll = self.selectionManager.toggleSelectAll;
        self.rows = self.rowManager.rows; // dependent observable

        ng.cssBuilder.buildStyles(self);

        self.initPhase = 1;
    };

    this.update = function () {
        //we have to update async, or else all the observables are registered as dependencies

        var updater = function () {

            self.refreshDomSizes();

            ng.cssBuilder.buildStyles(self);

            if (self.initPhase > 0 && self.$root) {
                self.$root.show();
            }
        };

        if (window.setImmediate) {
            h_updateTimeout = setImmediate(updater);
        } else {
            h_updateTimeout = setTimeout(updater, 0);
        }
    };

    this.showFilter_Click = function () {
        self.headerRow.filterVisible = !self.filterIsOpen;
        self.filterIsOpen = !self.filterIsOpen;
    };

    this.clearFilter_Click = function () {
        ng.utils.forEach(self.columns, function (col, i) {
            col.filter = null;
        });
    };

    this.adjustScrollTop = function (scrollTop, force) {
        if (prevScrollTop === scrollTop && !force) { return; }
        var rowIndex = Math.floor(scrollTop / self.config.rowHeight);
        prevScrollTop = scrollTop;
        self.rowManager.viewableRange = new ng.range(rowIndex, rowIndex + self.minRowsToRender);
    };

    this.adjustScrollLeft = function (scrollLeft) {
        if (self.$headerContainer) {
            self.$headerContainer.scrollLeft(scrollLeft);
        }
    };
    
    self.data.$watch(self.refreshDomSizesTrigger)
    //call init
    self.init();
};