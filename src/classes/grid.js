/// <reference path="footer.js" />
/// <reference path="../services/SortService.js" />
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js" />
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js" />
/// <reference path="../utils.js" />
ng.Grid = function($scope, options, sortService, domUtilityService, $filter) {
    var defaults = {
        //Callback for when you want to validate something after selection.
        afterSelectionChange: function() {
        }, 

        /* Callback if you want to inspect something before selection,
        return false if you want to cancel the selection. return true otherwise. 
        If you need to wait for an async call to proceed with selection you can 
        use rowItem.continueSelection(event) method after returning false initially. 
        Note: when shift+ Selecting multiple items in the grid this will only get called
        once and the rowItem will be an array of items that are queued to be selected. */
        beforeSelectionChange: function() {
            return true;
        },

        //To be able to have selectable rows in grid.
        canSelectRows: true, 

        //definitions of columns as an array [], if not defines columns are auto-generated. See github wiki for more details.
        columnDefs: undefined,

        //*Data being displayed in the grid. Each item in the array is mapped to a row being displayed.
        data: [],

        //Row selection check boxes appear as the first column.
        displaySelectionCheckbox: true, 

        //Enable or disable resizing of columns
        enableColumnResize: true,

        //Enable or disable resizing of columns
        enableColumnReordering: true,

        //Enables the server-side paging feature
        enablePaging: false,

        //Enable drag and drop row reordering. Only works in HTML5 compliant browsers.
        enableRowReordering: true,

        //Enables or disables sorting in grid.
        enableSorting: true,

        /* filterOptions -
        filterText: The text bound to the built-in search box. 
        useExternalFilter: Bypass internal filtering if you want to roll your own filtering mechanism but want to use builtin search box.
        */
        filterOptions: {
            filterText: "",
            useExternalFilter: false
        },
        
        //Defining the height of the footer in pixels.
        footerRowHeight: 55,

        //Show or hide the footer alltogether the footer is enabled by default
        displayFooter: undefined,
        footerVisible: true, // depricated

        //Initial fields to group data by. Array of field names, not displayName.
        groups: [],

        //The height of the header row in pixels.
        headerRowHeight: 30,

        //Define a header row template for further customization. See github wiki for more details.
        headerRowTemplate: undefined,

        /*Enables the use of jquery UI reaggable/droppable plugin. requires jqueryUI to work if enabled. 
        Useful if you want drag + drop but your users insist on crappy browsers. */
        jqueryUIDraggable: false,

        //Enable the use jqueryUIThemes
        jqueryUITheme: false,

        //Prevent unselections when in single selection mode.
        keepLastSelected: true,

        /*Maintains the column widths while resizing. 
        Defaults to true when using *'s or undefined widths. Can be ovverriden by setting to false.*/
        maintainColumnRatios: undefined,

        //Set this to false if you only want one item selected at a time
        multiSelect: true,

        // pagingOptions -

        pagingOptions: {
            // pageSizes: list of available page sizes.
            pageSizes: [250, 500, 1000], 
            //pageSize: currently selected page size. 
            pageSize: 250,
            //totalServerItems: Total items are on the server. 
            totalServerItems: 0,
            //currentPage: the uhm... current page.
            currentPage: 1
        },

        //Array of plugin functions to register in ng-grid
        plugins: [],

        //Row height of rows in grid.
        rowHeight: 30,
        
        //Define a row Template to customize output. See github wiki for more details.
        rowTemplate: undefined,
        
        //all of the items selected in the grid. In single select mode there will only be one item in the array.
        selectedItems: [],
        
        //Disable row selections by clicking on the row and only when the checkbox is clicked.
        selectWithCheckboxOnly: false,
        
        /*Enables menu to choose which columns to display and group by. 
        If both showColumnMenu and showFilter are false the menu button will not display.*/
        showColumnMenu: true,

        /*Enables display of the filterbox in the column menu. 
        If both showColumnMenu and showFilter are false the menu button will not display.*/
        showFilter: true,

        //Show the dropzone for drag and drop grouping
        showGroupPanel: false,
        
        /*Define a sortInfo object to specify a default sorting state. 
        You can also observe this variable to utilize server-side sorting (see useExternalSorting).
        Syntax is sortinfo: { field: 'fieldName', direction: 'ASC'/'asc' || 'desc'/'DESC'}*/
        sortInfo: undefined,

        //Set the tab index of the Vieport.
        tabIndex: -1,
        /*Prevents the internal sorting from executing. 
        The sortInfo object will be updated with the sorting information so you can handle sorting (see sortInfo)*/
        useExternalSorting: false,
        
        /*i18n language support. choose from the installed or included languages, en, fr, sp, etc...*/
        i18n: 'en'
    },
        self = this;

    self.maxCanvasHt = 0;
    //self vars
    self.config = $.extend(defaults, options);
    if (typeof options.columnDefs == "string") {
        self.config.columnDefs = $scope.$eval(options.columnDefs);
    }
    self.gridId = "ng" + ng.utils.newId();
    self.$root = null; //this is the root element that is passed in with the binding handler
    self.$groupPanel = null;
    self.$topPanel = null;
    self.$headerContainer = null;
    self.$headerScroller = null;
    self.$headers = null;
    self.$viewport = null;
    self.$canvas = null;
    self.rootDim = self.config.gridDim;
    self.sortInfo = self.config.sortInfo;
    self.sortedData = [];
    self.lateBindColumns = false;
    self.filteredData = [];
    if (typeof self.config.data == "object") {
        self.sortedData = self.config.data; // we cannot watch for updates if you don't pass the string name
    }
    self.lastSortedColumn = undefined;
    self.calcMaxCanvasHeight = function() {
        return (self.config.groups.length > 0) ? (self.rowFactory.parsedData.filter(function(e) {
            return e[NG_HIDDEN] === false;
        }).length * self.config.rowHeight) : (self.filteredData.length * self.config.rowHeight);
    };
    self.elementDims = {
        scrollW: 0,
        scrollH: 0,
        rowIndexCellW: 25,
        rowSelectedCellW: 25,
        rootMaxW: 0,
        rootMaxH: 0
    };
    //self funcs
    self.setRenderedRows = function(newRows) {
        $scope.renderedRows = newRows;
        if (!$scope.$$phase) {
            $scope.$digest();
        }
        self.refreshDomSizes();
        $scope.$emit('ngGridEventRows', newRows);
    };
    self.minRowsToRender = function() {
        var viewportH = $scope.viewportDimHeight() || 1;
        return Math.floor(viewportH / self.config.rowHeight);
    };
    self.refreshDomSizes = function() {
        var dim = new ng.Dimension();
        dim.outerWidth = self.elementDims.rootMaxW;
        dim.outerHeight = self.elementDims.rootMaxH;
        self.rootDim = dim;
        self.maxCanvasHt = self.calcMaxCanvasHeight();
    };
    self.buildColumnDefsFromData = function() {
        if (!self.config.columnDefs) {
            self.config.columnDefs = [];
        }
        if (!self.sortedData || !self.sortedData[0]) {
            self.lateBoundColumns = true;
            return;
        }
        var item;
        item = self.sortedData[0];

        ng.utils.forIn(item, function(prop, propName) {
            if (propName != SELECTED_PROP) {
                self.config.columnDefs.push({
                    field: propName
                });
            }
        });
    };
    self.buildColumns = function() {
        var columnDefs = self.config.columnDefs,
            cols = [],
            indexOffset = 0;

        if (!columnDefs) {
            self.buildColumnDefsFromData();
            columnDefs = self.config.columnDefs;
        }
        if (self.config.displaySelectionCheckbox) {
            indexOffset = 1;
            cols.push(new ng.Column({
                colDef: {
                    field: '\u2714',
                    width: self.elementDims.rowSelectedCellW,
                    sortable: false,
                    resizable: false,
                    groupable: false,
                    headerCellTemplate: '<input class="ngSelectionHeader" type="checkbox" ng-show="multiSelect" ng-model="allSelected" ng-change="toggleSelectAll(allSelected)"/>',
                    cellTemplate: '<div class="ngSelectionCell"><input class="ngSelectionCheckbox" type="checkbox" ng-checked="row.selected" /></div>'
                },
                index: 0,
                headerRowHeight: self.config.headerRowHeight,
                sortCallback: self.sortData,
                resizeOnDataCallback: self.resizeOnData,
                enableResize: self.config.enableColumnResize,
                enableSort: self.config.enableSorting
            }, $scope, self, domUtilityService, $filter));
        }
        if (columnDefs.length > 0) {
            angular.forEach(columnDefs, function(colDef, i) {
                i += indexOffset;
                var column = new ng.Column({
                    colDef: colDef,
                    index: i,
                    headerRowHeight: self.config.headerRowHeight,
                    sortCallback: self.sortData,
                    resizeOnDataCallback: self.resizeOnData,
                    enableResize: self.config.enableColumnResize,
                    enableSort: self.config.enableSorting
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
    self.configureColumnWidths = function() {
        var cols = self.config.columnDefs;
        var indexOffset = self.config.displaySelectionCheckbox ? $scope.configGroups.length + 1 : $scope.configGroups.length;
        var numOfCols = cols.length + indexOffset,
            asterisksArray = [],
            percentArray = [],
            asteriskNum = 0,
            totalWidth = 0;
        totalWidth += self.config.displaySelectionCheckbox ? 25 : 0;
        angular.forEach(cols, function(col, i) {
            i += indexOffset;
            var isPercent = false, t = undefined;
            //if width is not defined, set it to a single star
            if (ng.utils.isNullOrUndefined(col.width)) {
                col.width = "*";
            } else { // get column width
                isPercent = isNaN(col.width) ? ng.utils.endsWith(col.width, "%") : false;
                t = isPercent ? col.width : parseInt(col.width, 10);
            }
            // check if it is a number
            if (isNaN(t)) {
                t = col.width;
                // figure out if the width is defined or if we need to calculate it
                if (t == 'auto') { // set it for now until we have data and subscribe when it changes so we can set the width.
                    $scope.columns[i].width = col.minWidth;
                    totalWidth += $scope.columns[i].width;
                    var temp = $scope.columns[i];
                    $scope.$evalAsync(function() {
                        self.resizeOnData(temp, true);
                    });
                    return;
                } else if (t.indexOf("*") != -1) { //  we need to save it until the end to do the calulations on the remaining width.
                    asteriskNum += t.length;
                    col.index = i;
                    asterisksArray.push(col);
                    return;
                } else if (isPercent) { // If the width is a percentage, save it until the very last.
                    col.index = i;
                    percentArray.push(col);
                    return;
                } else { // we can't parse the width so lets throw an error.
                    throw "unable to parse column width, use percentage (\"10%\",\"20%\", etc...) or \"*\" to use remaining width of grid";
                }
            } else {
                totalWidth += $scope.columns[i].width = parseInt(col.width, 10);
            }
        });
        // check if we saved any asterisk columns for calculating later
        if (asterisksArray.length > 0) {
            self.config.maintainColumnRatios === false ? angular.noop() : self.config.maintainColumnRatios = true;
            // get the remaining width
            var remainigWidth = self.rootDim.outerWidth - totalWidth;
            // calculate the weight of each asterisk rounded down
            var asteriskVal = Math.floor(remainigWidth / asteriskNum);
            // set the width of each column based on the number of stars
            angular.forEach(asterisksArray, function(col) {
                var t = col.width.length;
                $scope.columns[col.index].width = asteriskVal * t;
                //check if we are on the last column
                if (col.index + 1 == numOfCols) {
                    var offset = 2; //We're going to remove 2 px so we won't overlflow the viwport by default
                    // are we overflowing?
                    if (self.maxCanvasHt > $scope.viewportDimHeight()) {
                        //compensate for scrollbar
                        offset += domUtilityService.ScrollW;
                    }
                    $scope.columns[col.index].width -= offset;
                }
                totalWidth += $scope.columns[col.index].width;
            });
        }
        // Now we check if we saved any percentage columns for calculating last
        if (percentArray.length > 0) {
            // do the math
            angular.forEach(percentArray, function(col) {
                var t = col.width;
                $scope.columns[col.index].width = Math.floor(self.rootDim.outerWidth * (parseInt(t.slice(0, -1), 10) / 100));
            });
        }
    };
    self.init = function() {
        //factories and services
        self.selectionService = new ng.SelectionService(self);
        self.rowFactory = new ng.RowFactory(self, $scope);
        self.selectionService.Initialize(self.rowFactory);
        self.searchProvider = new ng.SearchProvider($scope, self, $filter);
        self.styleProvider = new ng.StyleProvider($scope, self, domUtilityService);
        self.buildColumns();
        $scope.$watch('configGroups', function(a) {
            var tempArr = [];
            angular.forEach(a, function(item) {
                tempArr.push(item.field || item);
            });
            self.config.groups = tempArr;
            self.rowFactory.filteredDataChanged();
            $scope.$emit('ngGridEventGroups', a);
        }, true);
        $scope.$watch('columns', function(a) {
            domUtilityService.BuildStyles($scope, self, true);
            $scope.$emit('ngGridEventColumns', a);
        }, true);
        $scope.$watch(function() {
            return options.i18n;
        }, function(newLang) {
            ng.utils.seti18n($scope, newLang);
        });
        self.maxCanvasHt = self.calcMaxCanvasHeight();
        if (self.config.sortInfo) {
            self.config.sortInfo.column = $scope.columns.filter(function(c) {
                return c.field == self.config.sortInfo.field;
            })[0];
            self.config.sortInfo.column.sortDirection = self.config.sortInfo.direction.toUpperCase();
            self.sortData(self.config.sortInfo.column);
        }
    };
    self.prevScrollTop = 0;
    self.prevScrollIndex = 0;
    self.adjustScrollTop = function(scrollTop, force) {
        if (self.prevScrollTop === scrollTop && !force) {
            return;
        }
        var rowIndex = Math.floor(scrollTop / self.config.rowHeight);
        // Have we hit the threshold going down?
        if (self.prevScrollTop < scrollTop && rowIndex < self.prevScrollIndex + SCROLL_THRESHOLD) {
            return;
        }
        //Have we hit the threshold going up?
        if (self.prevScrollTop > scrollTop && rowIndex > self.prevScrollIndex - SCROLL_THRESHOLD) {
            return;
        }
        self.prevScrollTop = scrollTop;
        self.rowFactory.UpdateViewableRange(new ng.Range(Math.max(0, rowIndex - EXCESS_ROWS), rowIndex + self.minRowsToRender() + EXCESS_ROWS));
        self.prevScrollIndex = rowIndex;
    };
    self.adjustScrollLeft = function(scrollLeft) {
        if (self.$headerContainer) {
            self.$headerContainer.scrollLeft(scrollLeft);
        }
    };
    self.resizeOnData = function(col) {
        // we calculate the longest data.
        var longest = col.minWidth;
        var arr = ng.utils.getElementsByClassName('col' + col.index);
        angular.forEach(arr, function(elem, index) {
            var i;
            if (index === 0) {
                var kgHeaderText = $(elem).find('.ngHeaderText');
                i = ng.utils.visualLength(kgHeaderText) + 10; // +10 some margin
            } else {
                var ngCellText = $(elem).find('.ngCellText');
                i = ng.utils.visualLength(ngCellText) + 10; // +10 some margin
            }
            if (i > longest) {
                longest = i;
            }
        });
        col.width = col.longest = Math.min(col.maxWidth, longest + 7); // + 7 px to make it look decent.
        domUtilityService.BuildStyles($scope, self, true);
    };
    self.sortData = function(col) {
        self.config.sortInfo = {
            column: col,
            field: col.field,
            direction: col.sortDirection
        };
        self.clearSortingData(col);
        if (!self.config.useExternalSorting) {
            sortService.Sort(self.config.sortInfo, self.sortedData);
        }
        self.lastSortedColumn = col;
        self.searchProvider.evalFilter();
        $scope.$emit('ngGridEventSorted', col);
    };
    self.clearSortingData = function(col) {
        if (!col) {
            angular.forEach($scope.columns, function(c) {
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
    self.fixGroupIndexes = function() {
        angular.forEach($scope.configGroups, function(item, i) {
            item.groupIndex = i + 1;
        });
    };
    //$scope vars
    $scope.elementsNeedMeasuring = true;
    $scope.columns = [];
    $scope.renderedRows = [];
    $scope.headerRow = null;
    $scope.rowHeight = self.config.rowHeight;
    $scope.jqueryUITheme = self.config.jqueryUITheme;
    $scope.footer = null;
    $scope.selectedItems = self.config.selectedItems;
    $scope.multiSelect = self.config.multiSelect;
    $scope.footerVisible = ng.utils.isNullOrUndefined(self.config.displayFooter) ? self.config.footerVisible : self.config.displayFooter;
    $scope.footerRowHeight = $scope.footerVisible ? self.config.footerRowHeight : 0;
    $scope.showColumnMenu = self.config.showColumnMenu;
    $scope.showMenu = false;
    $scope.configGroups = [];
    //Paging
    $scope.enablePaging = self.config.enablePaging;
    $scope.pagingOptions = self.config.pagingOptions;
    //Templates
    $scope.rowTemplate = self.config.rowTemplate || ng.defaultRowTemplate();
    $scope.headerRowTemplate = self.config.headerRowTemplate || ng.defaultHeaderRowTemplate();
    //i18n support
    $scope.i18n = {};
    ng.utils.seti18n($scope, self.config.i18n);

    if (self.config.rowTemplate && !TEMPLATE_REGEXP.test(self.config.rowTemplate)) {
        $scope.rowTemplate = $.ajax({
            type: "GET",
            url: self.config.rowTemplate,
            async: false
        }).responseText;
    }
    if (self.config.headerRowTemplate && !TEMPLATE_REGEXP.test(self.config.headerRowTemplate)) {
        $scope.headerRowTemplate = $.ajax({
            type: "GET",
            url: self.config.headerRowTemplate,
            async: false
        }).responseText;
    }

    //scope funcs
    $scope.visibleColumns = function() {
        return $scope.columns.filter(function(col) {
            return col.visible;
        });
    };
    $scope.toggleShowMenu = function() {
        $scope.showMenu = !$scope.showMenu;
    };
    $scope.toggleSelectAll = function(a) {
        self.selectionService.toggleSelectAll(a);
    };
    $scope.totalFilteredItemsLength = function() {
        return self.filteredData.length;
    };
    $scope.showGroupPanel = function() {
        return self.config.showGroupPanel;
    };
    $scope.topPanelHeight = function() {
        return self.config.showGroupPanel === true ? self.config.headerRowHeight * 2 : self.config.headerRowHeight;
    };

    $scope.viewportDimHeight = function() {
        return Math.max(0, self.rootDim.outerHeight - $scope.topPanelHeight() - $scope.footerRowHeight - 2);
    };
    $scope.groupBy = function(col) {
        if (self.sortedData.length < 1 || !col.groupable) {
            return;
        }
        var indx = $scope.configGroups.indexOf(col);
        if (indx == -1) {
            col.isGroupedBy = true;
            $scope.configGroups.push(col);
            col.groupIndex = $scope.configGroups.length;
        } else {
            $scope.removeGroup(indx);
        }
    };
    $scope.removeGroup = function(index) {
        var col = $scope.columns.filter(function(item) {
            return item.groupIndex == (index + 1);
        })[0];
        col.isGroupedBy = false;
        col.groupIndex = 0;
        if ($scope.columns[index].isAggCol) {
            $scope.columns.splice(index, 1);
            $scope.configGroups.splice(index, 1);
            self.fixGroupIndexes();
        }
        if ($scope.configGroups.length === 0) {
            self.fixColumnIndexes();
            domUtilityService.digest($scope);
        }
    };
    $scope.totalRowWidth = function() {
        var totalWidth = 0,
            cols = $scope.visibleColumns();
        angular.forEach(cols, function(col) {
            totalWidth += col.width;
        });
        return totalWidth;
    };
    $scope.headerScrollerDim = function() {
        var viewportH = $scope.viewportDimHeight(),
            maxHeight = self.maxCanvasHt,
            vScrollBarIsOpen = (maxHeight > viewportH),
            newDim = new ng.Dimension();

        newDim.autoFitHeight = true;
        newDim.outerWidth = $scope.totalRowWidth();
        if (vScrollBarIsOpen) {
            newDim.outerWidth += self.elementDims.scrollW;
        } else if ((maxHeight - viewportH) <= self.elementDims.scrollH) { //if the horizontal scroll is open it forces the viewport to be smaller
            newDim.outerWidth += self.elementDims.scrollW;
        }
        return newDim;
    };
    //call init
    self.init();
};