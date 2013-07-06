/// <reference path="footer.js" />
/// <reference path="../services/SortService.js" />
/// <reference path="../../lib/jquery-1.8.2.min" />
var ngGrid = function ($scope, options, sortService, domUtilityService, $filter, $templateCache, $utils, $timeout, $parse, $http, $q) {
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

        //Enables cell editing on focus
        enableCellEditOnFocus: false,
        
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
        
        // set the initial state of aggreagate grouping. "true" means they will be collapsed when grouping changes, "false" means they will be expanded by default.
        groupsCollapsedByDefault: true,
        
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
        
        //totalServerItems: Total items are on the server. 
        totalServerItems: 0,
            
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

    if (typeof options.columnDefs === "string") {
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

    self.initTemplates = function() {
        var templates = ['rowTemplate', 'aggregateTemplate', 'headerRowTemplate', 'checkboxCellTemplate', 'checkboxHeaderTemplate', 'menuTemplate', 'footerTemplate'];

        var promises = [];
        angular.forEach(templates, function(template) {
            promises.push( self.getTemplate(template) );
        });

        return $q.all(promises);
    };
    
    //Templates
    // test templates for urls and get the tempaltes via synchronous ajax calls
    self.getTemplate = function (key) {
        var t = self.config[key];
        var uKey = self.gridId + key + ".html";
        var p = $q.defer();
        if (t && !TEMPLATE_REGEXP.test(t)) {
            $http.get(t, {
                cache: $templateCache
            })
            .success(function(data){
                $templateCache.put(uKey, data);
                p.resolve();
            })
            .error(function(err){
                p.reject("Could not load template: " + t);
            });
        } else if (t) {
            $templateCache.put(uKey, t);
            p.resolve();
        } else {
            var dKey = key + ".html";
            $templateCache.put(uKey, $templateCache.get(dKey));
            p.resolve();
        }

        return p.promise;
    };

    if (typeof self.config.data === "object") {
        self.data = self.config.data; // we cannot watch for updates if you don't pass the string name
    }
    self.calcMaxCanvasHeight = function() {
        var calculatedHeight;
        if(self.config.groups.length > 0){
            calculatedHeight = self.rowFactory.parsedData.filter(function(e) {
                return !e[NG_HIDDEN];
            }).length * self.config.rowHeight;
        } else {
            calculatedHeight = self.filteredRows.length * self.config.rowHeight;
        }
        return calculatedHeight;
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
            $scope.renderedRows[i].selected = newRows[i].selected;
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
            if (self.config.excludeProperties.indexOf(propName) === -1) {
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
                enableSort: self.config.enableSorting,
                enablePinning: self.config.enablePinning
            }, $scope, self, domUtilityService, $templateCache, $utils));
        }
        if (columnDefs.length > 0) {
            var checkboxOffset = self.config.showSelectionCheckbox ? 1 : 0;
            var groupOffset = $scope.configGroups.length;
            $scope.configGroups.length = 0;
            angular.forEach(columnDefs, function(colDef, i) {
                i += checkboxOffset;
                var column = new ngColumn({
                    colDef: colDef,
                    index: i + groupOffset,
                    originalIndex: i,
                    headerRowHeight: self.config.headerRowHeight,
                    sortCallback: self.sortData,
                    resizeOnDataCallback: self.resizeOnData,
                    enableResize: self.config.enableColumnResize,
                    enableSort: self.config.enableSorting,
                    enablePinning: self.config.enablePinning,
                    enableCellEdit: self.config.enableCellEdit || self.config.enableCellEditOnFocus
                }, $scope, self, domUtilityService, $templateCache, $utils);
                var indx = self.config.groups.indexOf(colDef.field);
                if (indx !== -1) {
                    column.isGroupedBy = true;
                    $scope.configGroups.splice(indx, 0, column);
                    column.groupIndex = $scope.configGroups.length;
                }
                cols.push(column);
            });
            $scope.columns = cols;
            if (self.config.groups.length > 0) {
                self.rowFactory.getGrouping(self.config.groups);
            }
        }
    };
    self.configureColumnWidths = function() {
        var asterisksArray = [],
            percentArray = [],
            asteriskNum = 0,
            totalWidth = 0;

        // When rearranging columns, their index in $scope.columns will no longer match the original column order from columnDefs causing
        // their width config to be out of sync. We can use "originalIndex" on the ngColumns to get hold of the correct setup from columnDefs, but to
        // avoid O(n) lookups in $scope.columns per column we setup a map.
        var indexMap = {};
        // Build a map of columnDefs column indices -> ngColumn indices (via the "originalIndex" property on ngColumns).
        angular.forEach($scope.columns, function(ngCol, i) {
            // Disregard columns created by grouping (the grouping columns don't match a column from columnDefs)
            if (!$utils.isNullOrUndefined(ngCol.originalIndex)) {
                var origIndex = ngCol.originalIndex;
                if (self.config.showSelectionCheckbox) {
                    //if visible, takes up 25 pixels
                    if(ngCol.originalIndex === 0 && ngCol.visible){
                        totalWidth += 25;
                    }
                    // The originalIndex will be offset 1 when including the selection column
                    origIndex--;
                }
                indexMap[origIndex] = i;
            }
        });

        angular.forEach(self.config.columnDefs, function(colDef, i) {
                // Get the ngColumn that matches the current column from columnDefs
            var ngColumn = $scope.columns[indexMap[i]];

            colDef.index = i;

            var isPercent = false, t;
            //if width is not defined, set it to a single star
            if ($utils.isNullOrUndefined(colDef.width)) {
                colDef.width = "*";
            } else { // get column width
                isPercent = isNaN(colDef.width) ? $utils.endsWith(colDef.width, "%") : false;
                t = isPercent ? colDef.width : parseInt(colDef.width, 10);
            }

             // check if it is a number
            if (isNaN(t) && !$scope.hasUserChangedGridColumnWidths) {
                t = colDef.width;
                // figure out if the width is defined or if we need to calculate it
                if (t === 'auto') { // set it for now until we have data and subscribe when it changes so we can set the width.
                    ngColumn.width = ngColumn.minWidth;
                    totalWidth += ngColumn.width;
                    var temp = ngColumn;

                    $scope.$on("ngGridEventData", function () {
                        self.resizeOnData(temp);
                    });
                    return;
                } else if (t.indexOf("*") !== -1) { //  we need to save it until the end to do the calulations on the remaining width.
                    if (ngColumn.visible !== false) {
                        asteriskNum += t.length;
                    }
                    asterisksArray.push(colDef);
                    return;
                } else if (isPercent) { // If the width is a percentage, save it until the very last.
                    percentArray.push(colDef);
                    return;
                } else { // we can't parse the width so lets throw an error.
                    throw "unable to parse column width, use percentage (\"10%\",\"20%\", etc...) or \"*\" to use remaining width of grid";
                }
            } else if (ngColumn.visible !== false) {
                totalWidth += ngColumn.width = parseInt(ngColumn.width, 10);
            }
        });
        
        // Now we check if we saved any percentage columns for calculating last
        if (percentArray.length > 0) {
            //If they specificy for maintain column ratios to be false in grid config, then it will remain false. If not specifiied or true, will be true.
            self.config.maintainColumnRatios = self.config.maintainColumnRatios !== false; 
            // If any columns with % widths have been hidden, then let other % based columns use their width
            var percentWidth = 0; // The total % value for all columns setting their width using % (will e.g. be 40 for 2 columns with 20% each)
            var hiddenPercent = 0; // The total % value for all columns setting their width using %, but which have been hidden
            angular.forEach(percentArray, function(colDef) {
                // Get the ngColumn that matches the current column from columnDefs
                var ngColumn = $scope.columns[indexMap[colDef.index]];
                var t = colDef.width;
                var percent = parseInt(t.slice(0, -1), 10) / 100;
                percentWidth += percent;

                if (!ngColumn.visible) {
                    hiddenPercent += percent;
                }
            });
            var percentWidthUsed = percentWidth - hiddenPercent;

            // do the math
            angular.forEach(percentArray, function(colDef) {
                // Get the ngColumn that matches the current column from columnDefs
                var ngColumn = $scope.columns[indexMap[colDef.index]];
                
                // Calc the % relative to the amount of % reserved for the visible columns (that use % based widths)
                var t = colDef.width;
                var percent = parseInt(t.slice(0, -1), 10) / 100;
                if (hiddenPercent > 0) {
                    percent = percent / percentWidthUsed;
                }
                else {
                    percent = percent / percentWidth;
                }

                var pixelsForPercentBasedWidth = self.rootDim.outerWidth * percentWidth;
                ngColumn.width = Math.floor(pixelsForPercentBasedWidth * percent);
                totalWidth += ngColumn.width;
            });
        }

        // check if we saved any asterisk columns for calculating later
        if (asterisksArray.length > 0) {
            //If they specificy for maintain column ratios to be false in grid config, then it will remain false. If not specifiied or true, will be true.
            self.config.maintainColumnRatios = self.config.maintainColumnRatios !== false; 
            // get the remaining width
            var remainingWidth = self.rootDim.outerWidth - totalWidth;
            // are we overflowing vertically?
            if (self.maxCanvasHt > $scope.viewportDimHeight()) {
                //compensate for scrollbar
                remainingWidth -= domUtilityService.ScrollW;
            }
            // calculate the weight of each asterisk rounded down
            var asteriskVal = Math.floor(remainingWidth / asteriskNum);

            // set the width of each column based on the number of stars
            angular.forEach(asterisksArray, function(colDef, i) {
                // Get the ngColumn that matches the current column from columnDefs
                var ngColumn = $scope.columns[indexMap[colDef.index]];                
                ngColumn.width = asteriskVal * colDef.width.length;
                if (ngColumn.visible !== false) {
                    totalWidth += ngColumn.width;
                }

                var isLast = (i === (asterisksArray.length - 1));
                //if last asterisk and doesn't fill width of grid, add the difference
                if(isLast && totalWidth < self.rootDim.outerWidth){
                    var gridWidthDifference = self.rootDim.outerWidth - totalWidth;
                    if(self.maxCanvasHt > $scope.viewportDimHeight()){
                        gridWidthDifference -= domUtilityService.ScrollW;
                    }
                    ngColumn.width += gridWidthDifference;
                }
            });
        }
    };
    self.init = function() {
        return self.initTemplates().then(function(){
            //factories and services
            $scope.selectionProvider = new ngSelectionProvider(self, $scope, $parse);
            $scope.domAccessProvider = new ngDomAccessProvider(self);
            self.rowFactory = new ngRowFactory(self, $scope, domUtilityService, $templateCache, $utils);
            self.searchProvider = new ngSearchProvider($scope, self, $filter);
            self.styleProvider = new ngStyleProvider($scope, self);
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
                if(!$scope.isColumnResizing){
                    domUtilityService.RebuildGrid($scope, self);
                }
                $scope.$emit('ngGridEventColumns', a);
            }, true);
            $scope.$watch(function() {
                return options.i18n;
            }, function(newLang) {
                $utils.seti18n($scope, newLang);
            });
            self.maxCanvasHt = self.calcMaxCanvasHeight();

            if (self.config.sortInfo.fields && self.config.sortInfo.fields.length > 0) {
                $scope.$watch(function() {
                    return self.config.sortInfo;
                }, function(sortInfo){
                    if (!sortService.isSorting) {
                        self.sortColumnsInit();
                        $scope.$emit('ngGridEventSorted', self.config.sortInfo);
                    }
                },true);
            }
        });

        // var p = $q.defer();
        // p.resolve();
        // return p.promise;
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
    self.sortData = function(col, evt) {
        if (evt && evt.shiftKey && self.config.sortInfo) {
            var indx = self.config.sortInfo.columns.indexOf(col);
            if (indx === -1) {
                if (self.config.sortInfo.columns.length === 1) {
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
    self.sortColumnsInit = function() {
        if (self.config.sortInfo.columns) {
            self.config.sortInfo.columns.length = 0;
        } else {
            self.config.sortInfo.columns = [];
        }
        angular.forEach($scope.columns, function(c) {
            var i = self.config.sortInfo.fields.indexOf(c.field);
            if (i !== -1) {
                c.sortDirection = self.config.sortInfo.directions[i] || 'asc';
                self.config.sortInfo.columns[i] = c;
            }
        });
        angular.forEach(self.config.sortInfo.columns, function(c){
            self.sortData(c);
        });
    };
    self.sortActual = function() {
        if (!self.config.useExternalSorting) {
            var tempData = self.data.slice(0);
            angular.forEach(tempData, function(item, i) {
                var e = self.rowMap[i];
                if (e !== undefined) {
                    var v = self.rowCache[e];
                    if (v !== undefined) {
                        item.preSortSelected = v.selected;
                        item.preSortIndex = i;
                    }
                }
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
                if (col.index !== c.index) {
                    c.sortDirection = "";
                    c.sortPriority = null;
                }
            });
            self.lastSortedColumns[0] = col;
            self.lastSortedColumns.length = 1;
        }
    };
    self.fixColumnIndexes = function() {
        //fix column indexes
        for (var i = 0; i < $scope.columns.length; i++) {
            $scope.columns[i].index = i;
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
    $scope.enableCellEditOnFocus = self.config.enableCellEditOnFocus;
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
    $scope.toggleSelectAll = function(state, selectOnlyVisible) {
        $scope.selectionProvider.toggleSelectAll(state, false, selectOnlyVisible);
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
        if (!col.sortDirection) {
            col.sort({ shiftKey: $scope.configGroups.length > 0 ? true : false });
        }

        var indx = $scope.configGroups.indexOf(col);
        if (indx === -1) {
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
            return item.groupIndex === (index + 1);
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
};
