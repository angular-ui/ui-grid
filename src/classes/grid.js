/// <reference path="footer.js" />
/// <reference path="../services/SortService.js" />
/// <reference path="../../lib/jquery-1.8.2.min" />
var ngGrid = function ($scope, options, sortService, domUtilityService, $filter, $templateCache, $utils, $timeout, $parse) {
    var defaults = {
        //Define an aggregate template to customize the rows when grouped. See github wiki for more details.
        aggregateTemplate: undefined,
        
        //Callback for when you want to validate something after selection.
        afterSelectionChange: function() {
        }, 

        /* Callback if you want to inspect something before selection,
        return false if you want to cancel the selection. return true otherwise. 
        If you need to wait for an async call to proceed with selection you can 
        use rowItem.changeSelection(event) method after returning false initially. 
        Note: when shift+ Selecting multiple items in the grid this will only get called
        once and the rowItem will be an array of items that are queued to be selected. */
        beforeSelectionChange: function() {
            return true;
        },

        //checkbox templates.
        checkboxCellTemplate: undefined,
        checkboxHeaderTemplate: undefined,
        
        //definitions of columns as an array [], if not defines columns are auto-generated. See github wiki for more details.
        columnDefs: undefined,

        //*Data being displayed in the grid. Each item in the array is mapped to a row being displayed.
        data: [],
        
        //Data updated callback, fires every time the data is modified from outside the grid.
        dataUpdated: function() {
        },

        //Enables cell editing.
        enableCellEdit: false,
		
        //Enables cell selection.
        enableCellSelection: false,

        //Enable or disable resizing of columns
        enableColumnResize: false,

        //Enable or disable reordering of columns
        enableColumnReordering: false,

        //Enable or disable HEAVY column virtualization. This turns off selection checkboxes and column pinning and is designed for spreadsheet-like data.
        enableColumnHeavyVirt: false,

        //Enables the server-side paging feature
        enablePaging: false,

        //Enable column pinning
        enablePinning: false,
        
        //Enable drag and drop row reordering. Only works in HTML5 compliant browsers.
        enableRowReordering: false,
        
        //To be able to have selectable rows in grid.
        enableRowSelection: true,

        //Enables or disables sorting in grid.
        enableSorting: true,

        //Enables or disables text highlighting in grid by adding the "unselectable" class (See CSS file)
        enableHighlighting: false,
        
        // string list of properties to exclude when auto-generating columns.
        excludeProperties: [],
        
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
        
        // the template for the column menu and filter, including the button.
        footerTemplate: undefined,

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

        // the template for the column menu and filter, including the button.
        menuTemplate: undefined,

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
        
        //the selection checkbox is pinned to the left side of the viewport or not.
        pinSelectionCheckbox: false,

        //Array of plugin functions to register in ng-grid
        plugins: [],

        //User defined unique ID field that allows for better handling of selections and for server-side paging
        primaryKey: undefined,

        //Row height of rows in grid.
        rowHeight: 30,
        
        //Define a row template to customize output. See github wiki for more details.
        rowTemplate: undefined,
        
        //all of the items selected in the grid. In single select mode there will only be one item in the array.
        selectedItems: [],
        
        //Disable row selections by clicking on the row and only when the checkbox is clicked.
        selectWithCheckboxOnly: false,
        
        /*Enables menu to choose which columns to display and group by. 
        If both showColumnMenu and showFilter are false the menu button will not display.*/
        showColumnMenu: false,

        /*Enables display of the filterbox in the column menu. 
        If both showColumnMenu and showFilter are false the menu button will not display.*/
        showFilter: false,
        
        //Show or hide the footer alltogether the footer is enabled by default
        showFooter: false,

        //Show the dropzone for drag and drop grouping
        showGroupPanel: false,
        
        //Row selection check boxes appear as the first column.
        showSelectionCheckbox: false,
        
        /*Define a sortInfo object to specify a default sorting state. 
        You can also observe this variable to utilize server-side sorting (see useExternalSorting).
        Syntax is sortinfo: { fields: ['fieldName1',' fieldName2'], direction: 'ASC'/'asc' || 'desc'/'DESC'}*/
        sortInfo: {fields: [], columns: [], directions: [] },

        //Set the tab index of the Vieport.
        tabIndex: -1,
        /*Prevents the internal sorting from executing. 
        The sortInfo object will be updated with the sorting information so you can handle sorting (see sortInfo)*/
        useExternalSorting: false,
        
        /*i18n language support. choose from the installed or included languages, en, fr, sp, etc...*/
        i18n: 'en',
        
        //the threshold in rows to force virtualization on
        virtualizationThreshold: 50
    },
        self = this;
    self.maxCanvasHt = 0;
    //self vars
    self.config = $.extend(defaults, window.ngGrid.config, options);

    // override conflicting settings
    self.config.showSelectionCheckbox = (self.config.showSelectionCheckbox && self.config.enableColumnHeavyVirt === false);
    self.config.enablePinning = (self.config.enablePinning && self.config.enableColumnHeavyVirt === false);
    self.config.selectWithCheckboxOnly = (self.config.selectWithCheckboxOnly && self.config.showSelectionCheckbox !== false);
    self.config.pinSelectionCheckbox = self.config.enablePinning;

    if (typeof options.columnDefs == "string") {
        self.config.columnDefs = $scope.$eval(options.columnDefs);
    }
    self.rowCache = [];
    self.rowMap = [];
    self.gridId = "ng" + $utils.newId();
    self.$root = null; //this is the root element that is passed in with the binding handler
    self.$groupPanel = null;
    self.$topPanel = null;
    self.$headerContainer = null;
    self.$headerScroller = null;
    self.$headers = null;
    self.$viewport = null;
    self.$canvas = null;
    self.rootDim = self.config.gridDim;
    self.data = [];
    self.lateBindColumns = false;
    self.filteredRows = [];
    
    //Templates
    // test templates for urls and get the tempaltes via synchronous ajax calls
    var getTemplate = function (key) {
        var t = self.config[key];
        var uKey = self.gridId + key + ".html";
        if (t && !TEMPLATE_REGEXP.test(t)) {
            $templateCache.put(uKey, $.ajax({
                type: "GET",
                url: t,
                async: false
            }).responseText);
        } else if (t) {
            $templateCache.put(uKey, t);
        } else {
            var dKey = key + ".html";
            $templateCache.put(uKey, $templateCache.get(dKey));
        }
    };
    getTemplate('rowTemplate');
    getTemplate('aggregateTemplate');
    getTemplate('headerRowTemplate');
    getTemplate('checkboxCellTemplate');
    getTemplate('checkboxHeaderTemplate');
    getTemplate('menuTemplate');
    getTemplate('footerTemplate');

    if (typeof self.config.data == "object") {
        self.data = self.config.data; // we cannot watch for updates if you don't pass the string name
    }
    self.calcMaxCanvasHeight = function() {
        return (self.config.groups.length > 0) ? (self.rowFactory.parsedData.filter(function(e) {
            return !e[NG_HIDDEN];
        }).length * self.config.rowHeight) : (self.filteredRows.length * self.config.rowHeight);
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
    self.setRenderedRows = function (newRows) {
        $scope.renderedRows.length = newRows.length;
        for (var i = 0; i < newRows.length; i++) {
            if (!$scope.renderedRows[i] || (newRows[i].isAggRow || $scope.renderedRows[i].isAggRow)) {
                $scope.renderedRows[i] = newRows[i].copy();
                $scope.renderedRows[i].collapsed = newRows[i].collapsed;
                if (!newRows[i].isAggRow) {
                    $scope.renderedRows[i].setVars(newRows[i]);
                }
            } else {
                $scope.renderedRows[i].setVars(newRows[i]);
            }
            $scope.renderedRows[i].rowIndex = newRows[i].rowIndex;
            $scope.renderedRows[i].offsetTop = newRows[i].offsetTop;
			newRows[i].renderedRowIndex = i;
        }
        self.refreshDomSizes();
        $scope.$emit('ngGridEventRows', newRows);
    };
    self.minRowsToRender = function() {
        var viewportH = $scope.viewportDimHeight() || 1;
        return Math.floor(viewportH / self.config.rowHeight);
    };
    self.refreshDomSizes = function() {
        var dim = new ngDimension();
        dim.outerWidth = self.elementDims.rootMaxW;
        dim.outerHeight = self.elementDims.rootMaxH;
        self.rootDim = dim;
        self.maxCanvasHt = self.calcMaxCanvasHeight();
    };
    self.buildColumnDefsFromData = function () {
        self.config.columnDefs = [];
        var item = self.data[0];
        if (!item) {
            self.lateBoundColumns = true;
            return;
        }
        $utils.forIn(item, function (prop, propName) {
            if (self.config.excludeProperties.indexOf(propName) == -1) {
                self.config.columnDefs.push({
                    field: propName
                });
            }
        });
    };
    self.buildColumns = function() {
        var columnDefs = self.config.columnDefs,
            cols = [];
        if (!columnDefs) {
            self.buildColumnDefsFromData();
            columnDefs = self.config.columnDefs;
        }
        if (self.config.showSelectionCheckbox) {
            cols.push(new ngColumn({
                colDef: {
                    field: '\u2714',
                    width: self.elementDims.rowSelectedCellW,
                    sortable: false,
                    resizable: false,
                    groupable: false,
                    headerCellTemplate: $templateCache.get($scope.gridId + 'checkboxHeaderTemplate.html'),
                    cellTemplate: $templateCache.get($scope.gridId + 'checkboxCellTemplate.html'),
                    pinned: self.config.pinSelectionCheckbox
                },
                index: 0,
                headerRowHeight: self.config.headerRowHeight,
                sortCallback: self.sortData,
                resizeOnDataCallback: self.resizeOnData,
                enableResize: self.config.enableColumnResize,
                enableSort: self.config.enableSorting
            }, $scope, self, domUtilityService, $templateCache, $utils));
        }
        if (columnDefs.length > 0) {
            var indexOffset = self.config.showSelectionCheckbox ? self.config.groups.length + 1 : self.config.groups.length;
            $scope.configGroups.length = 0;
            angular.forEach(columnDefs, function(colDef, i) {
                i += indexOffset;
                var column = new ngColumn({
                    colDef: colDef,
                    index: i,
                    headerRowHeight: self.config.headerRowHeight,
                    sortCallback: self.sortData,
                    resizeOnDataCallback: self.resizeOnData,
                    enableResize: self.config.enableColumnResize,
                    enableSort: self.config.enableSorting,
                    enablePinning: self.config.enablePinning,
                    enableCellEdit: self.config.enableCellEdit 
                }, $scope, self, domUtilityService, $templateCache, $utils);
                var indx = self.config.groups.indexOf(colDef.field);
                if (indx != -1) {
                    column.isGroupedBy = true;
                    $scope.configGroups.splice(indx, 0, column);
                    column.groupIndex = $scope.configGroups.length;
                }
                cols.push(column);
            });
            $scope.columns = cols;
        }
    };
    self.configureColumnWidths = function() {
        var cols = self.config.columnDefs;
        var indexOffset = self.config.showSelectionCheckbox ? $scope.configGroups.length + 1 : $scope.configGroups.length;
        var numOfCols = cols.length + indexOffset,
            asterisksArray = [],
            percentArray = [],
            asteriskNum = 0,
            totalWidth = 0;
        totalWidth += self.config.showSelectionCheckbox ? 25 : 0;
        angular.forEach(cols, function(col, i) {
                i += indexOffset;
                var isPercent = false, t = undefined;
                //if width is not defined, set it to a single star
                if ($utils.isNullOrUndefined(col.width)) {
                    col.width = "*";
                } else { // get column width
                    isPercent = isNaN(col.width) ? $utils.endsWith(col.width, "%") : false;
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
                    $timeout(function () {
                        self.resizeOnData(temp, true);
                    });
                    return;
                } else if (t.indexOf("*") != -1) { //  we need to save it until the end to do the calulations on the remaining width.
                    if (col.visible !== false) {
                        asteriskNum += t.length;
                    }
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
            } else if (col.visible !== false) {
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
                if (col.visible !== false) {
                    totalWidth += $scope.columns[col.index].width;
                }
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
        $scope.selectionProvider = new ngSelectionProvider(self, $scope, $parse);
        $scope.domAccessProvider = new ngDomAccessProvider(self);
		self.rowFactory = new ngRowFactory(self, $scope, domUtilityService, $templateCache, $utils);
        self.searchProvider = new ngSearchProvider($scope, self, $filter);
        self.styleProvider = new ngStyleProvider($scope, self, domUtilityService);
        $scope.$watch('configGroups', function(a) {
          var tempArr = [];
          angular.forEach(a, function(item) {
            tempArr.push(item.field || item);
          });
          self.config.groups = tempArr;
          self.rowFactory.filteredRowsChanged();
          $scope.$emit('ngGridEventGroups', a);
        }, true);
        $scope.$watch('columns', function (a) {
            domUtilityService.BuildStyles($scope, self, true);
            $scope.$emit('ngGridEventColumns', a);
        }, true);
        $scope.$watch(function() {
            return options.i18n;
        }, function(newLang) {
            $utils.seti18n($scope, newLang);
        });
        self.maxCanvasHt = self.calcMaxCanvasHeight();
        if (self.config.sortInfo.fields && self.config.sortInfo.fields.length > 0) {
            self.getColsFromFields();
            self.sortActual();
        }
    };
   
    self.resizeOnData = function(col) {
        // we calculate the longest data.
        var longest = col.minWidth;
        var arr = $utils.getElementsByClassName('col' + col.index);
        angular.forEach(arr, function(elem, index) {
            var i;
            if (index === 0) {
                var kgHeaderText = $(elem).find('.ngHeaderText');
                i = $utils.visualLength(kgHeaderText) + 10; // +10 some margin
            } else {
                var ngCellText = $(elem).find('.ngCellText');
                i = $utils.visualLength(ngCellText) + 10; // +10 some margin
            }
            if (i > longest) {
                longest = i;
            }
        });
        col.width = col.longest = Math.min(col.maxWidth, longest + 7); // + 7 px to make it look decent.
        domUtilityService.BuildStyles($scope, self, true);
    };
    self.lastSortedColumns = [];
    self.changeRowOrder = function(prevRow, targetRow) {
        // Splice the Rows via the actual datasource
        var i = self.rowCache.indexOf(prevRow);
        var j = self.rowCache.indexOf(targetRow);
        self.rowCache.splice(i, 1);
        self.rowCache.splice(j, 0, prevRow);
        $scope.$emit('ngGridEventChangeOrder', self.rowCache);
    };
    self.sortData = function(col, evt) {
        if (evt.shiftKey && self.config.sortInfo) {
            var indx = self.config.sortInfo.columns.indexOf(col);
            if (indx === -1) {
                if (self.config.sortInfo.columns.length == 1) {
                    self.config.sortInfo.columns[0].sortPriority = 1;
                }
                self.config.sortInfo.columns.push(col);
                col.sortPriority = self.config.sortInfo.columns.length;
                self.config.sortInfo.fields.push(col.field);
                self.config.sortInfo.directions.push(col.sortDirection);
                self.lastSortedColumns.push(col);
            } else {
                self.config.sortInfo.directions[indx] = col.sortDirection;
            }
        } else {
            var isArr = $.isArray(col);
            self.config.sortInfo.columns.length = 0;
            self.config.sortInfo.fields.length = 0;
            self.config.sortInfo.directions.length = 0;
            var push = function (c) {
                self.config.sortInfo.columns.push(c);
                self.config.sortInfo.fields.push(c.field);
                self.config.sortInfo.directions.push(c.sortDirection);
                self.lastSortedColumns.push(c);
            };
            if (isArr) {
                self.clearSortingData();
                angular.forEach(col, function (c, i) {
                    c.sortPriority = i + 1;
                    push(c);
                });
            } else {
                self.clearSortingData(col);
                col.sortPriority = undefined;
                push(col);
            }
        }
        self.sortActual();
        self.searchProvider.evalFilter();
        $scope.$emit('ngGridEventSorted', self.config.sortInfo);
    };
    self.getColsFromFields = function() {
        if (self.config.sortInfo.columns) {
            self.config.sortInfo.columns.length = 0;
        } else {
            self.config.sortInfo.columns = [];
        }
        angular.forEach($scope.columns, function(c) {
            var i = self.config.sortInfo.fields.indexOf(c.field);
            if (i != -1) {
                c.sortDirection = self.config.sortInfo.directions[i] || 'asc';
                self.config.sortInfo.columns.push(c);
            }
            return false;
        });
    };
    self.sortActual = function() {
        if (!self.config.useExternalSorting) {
            var tempData = self.data.slice(0);
            angular.forEach(tempData, function(item, i) {
                item.preSortSelected = self.rowCache[self.rowMap[i]].selected;
                item.preSortIndex = i;
            });
            sortService.Sort(self.config.sortInfo, tempData);
            angular.forEach(tempData, function(item, i) {
                self.rowCache[i].entity = item;
                self.rowCache[i].selected = item.preSortSelected;
                self.rowMap[item.preSortIndex] = i;
                delete item.preSortSelected;
                delete item.preSortIndex;
            });
        }
    };

    self.clearSortingData = function (col) {
        if (!col) {
            angular.forEach(self.lastSortedColumns, function (c) {
                c.sortDirection = "";
                c.sortPriority = null;
            });
            self.lastSortedColumns = [];
        } else {
            angular.forEach(self.lastSortedColumns, function (c) {
                if (col.index != c.index) {
                    c.sortDirection = "";
                    c.sortPriority = null;
                }
            });
            self.lastSortedColumns[0] = col;
            self.lastSortedColumns.length = 1;
        };
    };
    self.fixColumnIndexes = function() {
        //fix column indexes
        for (var i = 0; i < $scope.columns.length; i++) {
            if ($scope.columns[i].visible !== false) {
                $scope.columns[i].index = i;
            }
        }
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
    $scope.renderedColumns = [];
    $scope.headerRow = null;
    $scope.rowHeight = self.config.rowHeight;
    $scope.jqueryUITheme = self.config.jqueryUITheme;
    $scope.showSelectionCheckbox = self.config.showSelectionCheckbox;
    $scope.enableCellSelection = self.config.enableCellSelection;
    $scope.footer = null;
    $scope.selectedItems = self.config.selectedItems;
    $scope.multiSelect = self.config.multiSelect;
    $scope.showFooter = self.config.showFooter;
    $scope.footerRowHeight = $scope.showFooter ? self.config.footerRowHeight : 0;
    $scope.showColumnMenu = self.config.showColumnMenu;
    $scope.showMenu = false;
    $scope.configGroups = [];
    $scope.gridId = self.gridId;
    //Paging
    $scope.enablePaging = self.config.enablePaging;
    $scope.pagingOptions = self.config.pagingOptions;

    //i18n support
    $scope.i18n = {};
    $utils.seti18n($scope, self.config.i18n);
    $scope.adjustScrollLeft = function (scrollLeft) {
        var colwidths = 0,
            totalLeft = 0,
            x = $scope.columns.length,
            newCols = [],
            dcv = !self.config.enableColumnHeavyVirt;
        var r = 0;
        var addCol = function (c) {
            if (dcv) {
                newCols.push(c);
            } else {
                if (!$scope.renderedColumns[r]) {
                    $scope.renderedColumns[r] = c.copy();
                } else {
                    $scope.renderedColumns[r].setVars(c);
                }
            }
            r++;
        };
        for (var i = 0; i < x; i++) {
            var col = $scope.columns[i];
            if (col.visible !== false) {
                var w = col.width + colwidths;
                if (col.pinned) {
                    addCol(col);
                    var newLeft = i > 0 ? (scrollLeft + totalLeft) : scrollLeft;
                    domUtilityService.setColLeft(col, newLeft, self);
                    totalLeft += col.width;
                } else {
                    if (w >= scrollLeft) {
                        if (colwidths <= scrollLeft + self.rootDim.outerWidth) {
                            addCol(col);
                        }
                    }
                }
                colwidths += col.width;
            }
        }
        if (dcv) {
            $scope.renderedColumns = newCols;
        }
    };
    self.prevScrollTop = 0;
    self.prevScrollIndex = 0;
    $scope.adjustScrollTop = function(scrollTop, force) {
        if (self.prevScrollTop === scrollTop && !force) {
            return;
        }
        if (scrollTop > 0 && self.$viewport[0].scrollHeight - scrollTop <= self.$viewport.outerHeight()) {
            $scope.$emit('ngGridEventScroll');
        }
        var rowIndex = Math.floor(scrollTop / self.config.rowHeight);
	    var newRange;
	    if (self.filteredRows.length > self.config.virtualizationThreshold) {
	        // Have we hit the threshold going down?
	        if (self.prevScrollTop < scrollTop && rowIndex < self.prevScrollIndex + SCROLL_THRESHOLD) {
	            return;
	        }
	        //Have we hit the threshold going up?
	        if (self.prevScrollTop > scrollTop && rowIndex > self.prevScrollIndex - SCROLL_THRESHOLD) {
	            return;
	        }
	        newRange = new ngRange(Math.max(0, rowIndex - EXCESS_ROWS), rowIndex + self.minRowsToRender() + EXCESS_ROWS);
	    } else {
	        var maxLen = $scope.configGroups.length > 0 ? self.rowFactory.parsedData.length : self.data.length;
	        newRange = new ngRange(0, Math.max(maxLen, self.minRowsToRender() + EXCESS_ROWS));
	    }
	    self.prevScrollTop = scrollTop;
	    self.rowFactory.UpdateViewableRange(newRange);
	    self.prevScrollIndex = rowIndex;
    };

    //scope funcs
    $scope.toggleShowMenu = function() {
        $scope.showMenu = !$scope.showMenu;
    };
    $scope.toggleSelectAll = function(a) {
        $scope.selectionProvider.toggleSelectAll(a);
    };
    $scope.totalFilteredItemsLength = function() {
        return self.filteredRows.length;
    };
    $scope.showGroupPanel = function() {
        return self.config.showGroupPanel;
    };
    $scope.topPanelHeight = function() {
        return self.config.showGroupPanel === true ? self.config.headerRowHeight + 32 : self.config.headerRowHeight;
    };

    $scope.viewportDimHeight = function() {
        return Math.max(0, self.rootDim.outerHeight - $scope.topPanelHeight() - $scope.footerRowHeight - 2);
    };
    $scope.groupBy = function (col) {
        if (self.data.length < 1 || !col.groupable  || !col.field) {
            return;
        }
        //first sort the column
        if (!col.sortDirection) col.sort({ shiftKey: false });

        var indx = $scope.configGroups.indexOf(col);
        if (indx == -1) {
            col.isGroupedBy = true;
            $scope.configGroups.push(col);
            col.groupIndex = $scope.configGroups.length;
        } else {
            $scope.removeGroup(indx);
        }
        self.$viewport.scrollTop(0);
        domUtilityService.digest($scope);
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
        $scope.adjustScrollLeft(0);
    };
    $scope.togglePin = function (col) {
        var indexFrom = col.index;
        var indexTo = 0;
        for (var i = 0; i < $scope.columns.length; i++) {
            if (!$scope.columns[i].pinned) {
                break;
            }
            indexTo++;
        }
        if (col.pinned) {
            indexTo = Math.max(col.originalIndex, indexTo - 1);
        }
        col.pinned = !col.pinned;
        // Splice the columns
        $scope.columns.splice(indexFrom, 1);
        $scope.columns.splice(indexTo, 0, col);
        self.fixColumnIndexes();
        // Finally, rebuild the CSS styles.
        domUtilityService.BuildStyles($scope, self, true);
        self.$viewport.scrollLeft(self.$viewport.scrollLeft() - col.width);
    };
    $scope.totalRowWidth = function() {
        var totalWidth = 0,
            cols = $scope.columns;
        for (var i = 0; i < cols.length; i++) {
            if (cols[i].visible !== false) {
                totalWidth += cols[i].width;
            }
        }
        return totalWidth;
    };
    $scope.headerScrollerDim = function() {
        var viewportH = $scope.viewportDimHeight(),
            maxHeight = self.maxCanvasHt,
            vScrollBarIsOpen = (maxHeight > viewportH),
            newDim = new ngDimension();

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
