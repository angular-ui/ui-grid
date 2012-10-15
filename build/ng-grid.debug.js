/***********************************************
* ng-grid JavaScript Library
* Authors: https://github.com/Crash8308/ng-grid/blob/master/README.md
* License: MIT (http://www.opensource.org/licenses/mit-license.php)
* Compiled At: 10/15/2012 12:16:46
***********************************************/

(function(window, undefined){

/***********************************************
* FILE: ..\src\namespace.js
***********************************************/
/// <reference path="../lib/jquery-1.8.2.min" />
/// <reference path="../lib/angular.js" />
/// <reference path="../src/constants.js"/>
/// <reference path="../src/navigation.js"/>
/// <reference path="../src/utils.js"/>

var ng = window['ng'] = {};
ng.templates = {};
var ngGridServices = angular.module('ngGrid.services', []);
var ngGridDirectives = angular.module('ngGrid.directives', []);
var ngGridFilters = angular.module('ngGrid.filters', []);
// Declare app level module which depends on filters, and services


/***********************************************
* FILE: ..\src\constants.js
***********************************************/
/// <reference path="../lib/jquery-1.8.2.min" />
/// <reference path="../lib/angular.js" />
/// <reference path="../src/namespace.js" />
/// <reference path="../src/navigation.js"/>
/// <reference path="../src/utils.js"/>

var ROW_KEY = '__ng_rowIndex__';
var SELECTED_PROP = '__ng_selected__';
var GRID_TEMPLATE = 'ng-gridTmpl';
var GRID_KEY = '__koGrid__';

/***********************************************
* FILE: ..\src\navigation.js
***********************************************/
/// <reference path="../lib/jquery-1.8.2.min" />
/// <reference path="../lib/angular.js" />
/// <reference path="../src/constants.js"/>
/// <reference path="../src/namespace.js" />
/// <reference path="../src/utils.jsjs"/>

//set event binding on the grid so we can select using the up/down keys
ng.moveSelectionHandler = function (grid, evt) {
    // null checks 
    if (grid === null || grid === undefined)
        return true;

    if (grid.config.selectedItems() === undefined)
        return true;
        
    var offset,
        charCode = (evt.which) ? evt.which : event.keyCode,
        rowKey = '__kg_rowIndex__'; // constant for the entity's row's rowIndex

    // detect which direction for arrow keys to navigate the grid
    switch (charCode) {
        case 38:
            // up - select previous
            offset = -1;
            break;
        case 40:
            // down - select next
            offset = 1;
            break;
        default:
            return true;
    }

    var items = grid.finalData,
        n = items.length,
        index = ng.utils.arrayIndexOf(items, grid.config.lastClickedRow.entity) + offset,
        rowCache = grid.rowManager.rowCache,
        selected,
        itemToView;

    // now find the item we arrowed to, and select it
    if (index >= 0 && index < n) {

        selected = items[index];
        var row = rowCache[selected[rowKey]];

        // fire the selection
        row.toggleSelected(null, evt);

        itemToView = ng.utils.getElementsByClassName("kgSelected");

        // finally scroll it into view as we arrow through
        if (!Element.prototype.scrollIntoViewIfNeeded) {
            itemToView[0].scrollIntoView(false);
            grid.$viewport.focus();
           
        } else {
            itemToView[0].scrollIntoViewIfNeeded();
        }

        //grid.$viewport.scrollTop(currScroll + (offset * rowHeight));

        return false;
    }
    return false;
}; 

/***********************************************
* FILE: ..\src\utils.js
***********************************************/
/// <reference path="../lib/jquery-1.8.2.min" />
/// <reference path="../lib/angular.js" />
/// <reference path="../src/constants.js"/>
/// <reference path="../src/namespace.js" />
/// <reference path="../src/navigation.js"/>

ng.utils = {
    arrayForEach: function (array, action) {
        for (var i = 0, j = array.length; i < j; i++)
        action(array[i]);
    },

    arrayIndexOf: function (array, item) {
        if (typeof Array.prototype.indexOf == "function")
            return Array.prototype.indexOf.call(array, item);
        for (var i = 0, j = array.length; i < j; i++)
            if (array[i] === item)
                return i;
        return -1;
    },
    
    arrayFilter: function (array, predicate) {
        array = array || [];
        var result = [];
        for (var i = 0, j = array.length; i < j; i++)
        if (predicate(array[i]))
        result.push(array[i]);
        return result;
    },

    forIn: function (obj, action) {
        var prop;

        for (prop in obj) {
            if(obj.hasOwnProperty(prop)){
                action(obj[prop], prop);
            }
        }
    },
        
    endsWith: function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },
    isNullOrUndefined: function (obj){
        if (obj == null || obj == undefined) return true;
        return false;
    },
    StringBuilder: function () {
        var strArr = [];
        
        this.append = function (str, data) {
            var len = arguments.length,
                intMatch = 0,
                strMatch = '{0}',
                i = 1;

            if (len > 1) { // they provided data
                while (i < len) {

                    //apparently string.replace only works on one match at a time
                    //so, loop through the string and hit all matches
                    while (str.indexOf(strMatch) !== -1) {
                        str = str.replace(strMatch, arguments[i]);
                    }
                    i++;
                    intMatch = i - 1;
                    strMatch = "{" + intMatch.toString() + "}";
                }
            }
            strArr.push(str);
        };

        this.toString = function () {
            var separator = arguments[0];
            if (separator !== null && separator !== undefined) {
                return strArr.join(separator);
            } else {
                return strArr.join("");
            }
        };
    },
    
    getElementsByClassName: function(cl) {
        var retnode = [];
        var myclass = new RegExp('\\b'+cl+'\\b');
        var elem = document.getElementsByTagName('*');
        for (var i = 0; i < elem.length; i++) {
            var classes = elem[i].className;
            if (myclass.test(classes)) retnode.push(elem[i]);
        }
        return retnode;
    },
    
    getPropertyPath: function(path, entity){
        var propPath = path.split('.');
        var tempProp = entity[propPath[0]];

        for (var j = 1; j < propPath.length; j++){
            tempProp = tempProp[propPath[j]];
        }
        return tempProp;
    },
    
    newId: (function () {
        var seedId = new Date().getTime();

        return function () {
            return seedId += 1;
        };
    })(),
    
    // we copy KO's ie detection here bc it isn't exported in the min versions of KO
    // Detect IE versions for workarounds (uses IE conditionals, not UA string, for robustness) 
    ieVersion: (function () {
        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
        while (
            div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
            iElems[0]
        );
        return version > 4 ? version : undefined;
    })(),
};

$.extend(ng.utils, {
    isIe6: (function(){ 
        return ng.utils.ieVersion === 6;
    })(),
    isIe7: (function(){ 
        return ng.utils.ieVersion === 7;
    }    )(),
    isIe: (function () { 
        return ng.utils.ieVersion !== undefined; 
    })()
}); 

/***********************************************
* FILE: ..\src\services\FilterService.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

serviceModule.factory('FilterService', ['$scope', function($scope) {
    var filterService = {};	
    
    // array that we use to manage the filtering before it updates the final data
    $scope.internalFilteredData = [];
    
    // filters off _destroy = true items
    $scope.filterDestroyed = function (arr) {
        return ng.utils.arrayFilter(arr, function (item) {
            return (item['_destroy'] === true ? false : true);
        });
    };
    
    // the array of filtered data we return to the grid
    $scope.filteredData = function () {
        var data = $scope.internalFilteredData;
        //this is a bit funky, but it prevents our options.data observable from being registered as a subscription to our grid.update bindingHandler
        if ($scope.initPhase > 0) {
            return data;
        } else {
            return $scope.filterDestroyed(self.data);
        }
    };
    
    filterService.initialize = function (options){
        var wildcard = options.filterWildcard || "*", // the wildcard character used by the user
            regExCache = { }; // a cache of filterString to regex objects, eg: { 'abc%' : RegExp("abc[^\']*, "gi") }
        
        $scope.initPhase = 0;     
        $scope.options = options;
        // first check the wildcard as we only support * and % currently
        if (wildcard === '*' || wildcard === '%') {
            // do nothing
        } else {
            throw new Error("You can only declare a percent sign (%) or an asterisk (*) as a wildcard character");
        }

        // map of column.field values to filterStrings
        $scope.filterInfo = options.filterInfo;
        // the array of data that the user defined
        $scope.data = options.data;

        // utility function for checking data validity
        $scope.isEmpty = function (data) {
            return (data === null || data === undefined || data === '');
        };
        // performs regex matching on data strings
        $scope.matchString = function (itemStr, filterStr) {
            //first check for RegEx thats already built
            var regex = regExCache[filterStr];
            //if nothing, build the regex
            if (!regex) {
                var replacer;
                //escape any wierd characters they might using
                filterStr = filterStr.replace(/\\/g, "\\");
                // build our replacer regex
                if (wildcard === "*") {
                    replacer = /\*/g;
                } else {
                    replacer = /\%/g;
                }
                //first replace all % percent signs with the true regex wildcard *
                var regexStr = filterStr.replace(replacer, "[^\']*");
                //ensure that we do "beginsWith" logic
                if (regexStr !== "*") { // handle the asterisk logic
                    regexStr = "^" + regexStr;
                }
                // incase the user makes some nasty regex that we can't use
                try{
                    // then create an actual regex object
                    regex = new RegExp(regexStr, "gi");
                }
                catch (e) {
                    // the user input something we can't parse into a valid RegExp, so just say that the data
                    // was a match
                    regex = /.*/gi;
                }
                // store it
                regExCache[filterStr] = regex;
            }
            return itemStr.match(regex);
        };
        // the core logic for filtering data
        $scope.filterData = function () {
            var fi = $scope.filterInfo,
            data = self.data,
            keepRow = false, // flag to say if the row will be removed or kept in the viewport
            match = true, // flag for matching logic
            newArr, // the filtered array
            f, // the field of the column that we are filtering
            itemData, // the data from the specific row's column
            itemDataStr, // the stringified version of itemData
            filterStr; // the user-entered filtering criteria
            // filter the destroyed items
            data = $scope.filterDestroyed(data);
            // make sure we even have work to do before we get started
            if (!fi || $.isEmptyObject(fi) || options.useExternalFiltering) {
                $scope.internalFilteredData = data;
                return;
            }
            //clear out the regex cache so that we don't get improper results
            regExCache = {};
            // filter the data array
            newArr = ng.utils.arrayFilter(data, function (item) {
                //loop through each property and filter it
                for (f in fi) {
                    if (fi.hasOwnProperty(f)) {
                        // pull the data out of the item
                        itemData = ng.utils.getPropertyPath(f, item);
                        // grab the user-entered filter criteria
                        filterStr = fi[f];
                        // make sure they didn't just enter the wildcard character
                        if (!$scope.isEmpty(filterStr) && filterStr !== wildcard) {
                            // execute regex matching
                            if ($scope.isEmpty(itemData)) {
                                match = false;
                            } else if (typeof itemData === "string") {
                                match = $scope.matchString(itemData, filterStr);
                            } else {
                                itemDataStr = itemData.toString();
                                match = $scope.matchString(itemDataStr, filterStr);
                            }
                        }
                    }
                    //supports "AND" filtering logic
                    if (keepRow && !match) {
                        keepRow = false;
                    } else if (!keepRow && match) {
                        keepRow = true; //should only catch on the first pass
                    }
                    //now if we catch anything thats not a match, break out of the loop
                    if (!match) { break; }
                }
                //reset variables
                filterStr = null;
                itemData = null;
                itemDataStr = null;
                match = true;
                return keepRow;
            });
            // finally set our internal array to the filtered stuff, which will tell the rest of the manager to propogate it up to the grid
            $scope.internalFilteredData = newArr;
        };
        //create subscriptions
        $scope.$watch($scope.data, $scope.filterData);
        $scope.$watch($scope.filterInfo, $scope.filterData);
        //increase this after initialization so that the computeds fire correctly
        $scope.initPhase = 1;
    };
    
    filterService.FilterInfo = {
        get: function()   { return $scope.filterInfo; },
        set: function(val){ $scope.filterInfo = val;  }
    };
    
    filterService.FilteredData = (function(){
        return $scope.filteredData();
    })();
    
    // the grid uses this to asign the change handlers to the filter boxes during initialization
    filterService.CreateFilterChangeCallback = function (col) {
        // the callback
        return function (newFilterVal) {
            var info = self.filterInfo;
            if (!info && !newFilterVal) {
                return;
            }
            //if we're still here, we may need to new up the info
            if (!info) { info = {}; }
            if ((newFilterVal === null ||
            newFilterVal === undefined ||
            newFilterVal === "") &&
            info[col.field]) { // we don't it to be null or undefined
                //smoke it so we don't loop through it for filtering anymore!
                delete info[col.field];
            } else if (newFilterVal !== null && newFilterVal !== undefined) {
                info[col.field] = newFilterVal;
            }
            self.filterInfo = info;
            if (options && options.currentPage) {
                options.currentPage = 1;
            }
        };
    };
    return filterService;
}]);

/***********************************************
* FILE: ..\src\services\GridService.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

serviceModule.factory('GridService', ['$scope', function ($scope) {
    var gridService = {};
    $scope.gridCache = {};
    
    $scope.getIndexOfCache = function() {
        var indx = -1;   
        for (var grid in $scope.gridCache) {
            indx++;
            if (!$scope.gridCache.hasOwnProperty(grid)) continue;
            return indx;
        }
        return indx;
    ?};
    
    gridService.initialize = function (){
        
    };
    gridService.StoreGrid = function (element, grid) {
        $scope.gridCache[grid.gridId] = grid;
        element[GRID_KEY] = grid.gridId;
    };
        
    gridService.RemoveGrid = function(gridId) {
        delete $scope.gridCache[gridId];
    };
    
    gridService.GetGrid = function (element) {
        var grid;
        if (element[GRID_KEY]) {
            grid = $scope.gridCache[element[GRID_KEY]];
            return grid;
        }
        return false;
    };
    
    gridService.ClearGridCache = function () {
        $scope.gridCache = {};
    };
    
    gridService.AssignGridEventHandlers = function (grid) {
        grid.$viewport.scroll(function (e) {
            var scrollLeft = e.target.scrollLeft,
            scrollTop = e.target.scrollTop;
            grid.adjustScrollLeft(scrollLeft);
            grid.adjustScrollTop(scrollTop);
        });
        grid.$viewport.off('keydown');
        grid.$viewport.on('keydown', function (e) {
            return ng.moveSelectionHandler(grid, e);
        });
        //Chrome and firefox both need a tab index so the grid can recieve focus.
        //need to give the grid a tabindex if it doesn't already have one so
        //we'll just give it a tab index of the corresponding gridcache index 
        //that way we'll get the same result every time it is run.
        //configurable within the options.
        if (grid.config.tabIndex === -1){
            grid.$viewport.attr('tabIndex', $scope.getIndexOfCache(grid.gridId));
        } else {
            grid.$viewport.attr('tabIndex', grid.config.tabIndex);
        }
        $(window).resize(function () {
            var prevSizes = {
                rootMaxH: grid.elementDims.rootMaxH,
                rootMaxW: grid.elementDims.rootMaxW,
                rootMinH: grid.elementDims.rootMinH,
                rootMinW: grid.elementDims.rootMinW
            },
            scrollTop,
            isDifferent;
            // first check to see if the grid is hidden... if it is, we will screw a bunch of things up by re-sizing
            var $hiddens = grid.$root.parents(":hidden");
            if ($hiddens.length > 0) {
                return;
            }
            //catch this so we can return the viewer to their original scroll after the resize!
            scrollTop = grid.$viewport.scrollTop();
            ng.domUtility.measureGrid(grid.$root, grid);
            //check to see if anything has changed
            if (prevSizes.rootMaxH !== grid.elementDims.rootMaxH && grid.elementDims.rootMaxH !== 0) { // if display: none is set, then these come back as zeros
                isDifferent = true;
            } else if (prevSizes.rootMaxW !== grid.elementDims.rootMaxW && grid.elementDims.rootMaxW !== 0) {
                isDifferent = true;
            } else if (prevSizes.rootMinH !== grid.elementDims.rootMinH) {
                isDifferent = true;
            } else if (prevSizes.rootMinW !== grid.elementDims.rootMinW) {
                isDifferent = true;
            } else {
                return;
            }
            if (isDifferent) {
                
                grid.refreshDomSizes();
                
                grid.adjustScrollTop(scrollTop, true); //ensure that the user stays scrolled where they were
            }
        });
    };
    return gridService;
}]);

/***********************************************
* FILE: ..\src\services\RowService.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

serviceModule.factory('RowService', ['$scope', function ($scope) {
    var rowService = {};

    // we cache rows when they are built, and then blow the cache away when sorting/filtering
    $scope.rowCache = [];
    $scope.dataChanged = true;
    
    rowService.initialize = function (grid) {
        var prevMaxRows = 0, // for comparison purposes when scrolling
            prevMinRows = 0, // for comparison purposes when scrolling
            currentPage = grid.config.currentPage,
            pageSize = grid.config.pageSize, // constant for the entity's rowCache rowIndex
            prevRenderedRange = new ng.Range(0, 1), // for comparison purposes to help throttle re-calcs when scrolling
            prevViewableRange = new ng.Range(0, 1); // for comparison purposes to help throttle re-calcs when scrolling
             // for comparison purposes to help throttle re-calcs when scrolling
        $scope.internalRenderedRange = prevRenderedRange;
        // short cut to sorted and filtered data
        $scope.dataSource = grid.finalData; //observableArray
        
        // change subscription to clear out our cache
        $scope.$watch(dataSource, function () {
            $scope.dataChanged = true;
            $scope.rowCache = []; //if data source changes, kill this!
        });
        
        // shortcut to the calculated minimum viewport rows
        $scope.minViewportRows = grid.minRowsToRender; //observable
        
        // the # of rows we want to add to the top and bottom of the rendered grid rows 
        $scope.excessRows = 8;
        
        // height of each row
        $scope.rowHeight = grid.config.rowHeight;
        
        // the logic that builds cell objects
        $scope.cellFactory = new ng.CellFactory(grid.columns);
        
        // the actual range the user can see in the viewport
        $scope.viewableRange = prevViewableRange;
        
        // the range of rows that we actually render on the canvas ... essentially 'viewableRange' + 'excessRows' on top and bottom
        $scope.renderedRange = prevRenderedRange;
        
        // the array of rows that we've rendered
        $scope.rows = [];
        // Builds rows for each data item in the 'dataSource'
        // @entity - the data item
        // @rowIndex - the index of the row
        // @pagingOffset - the # of rows to add the the rowIndex in case server-side paging is happening
        $scope.buildRowFromEntity = function (entity, rowIndex, pagingOffset) {
            var row = $scope.rowCache[rowIndex]; // first check to see if we've already built it
            if (!row) {
                // build the row
                row = new ng.Row(entity, grid.config, grid.selectionManager);
                row.rowIndex = rowIndex + 1; //not a zero-based rowIndex
                row.rowDisplayIndex = row.rowIndex + pagingOffset;
                row.offsetTop = $scope.rowHeight * rowIndex;
                
                //build out the cells
                $scope.cellFactory.buildRowCells(row);
                
                // finally cache it for the next round
                $scope.rowCache[rowIndex] = row;
            }
            
            // store the row's index on the entity for future ref
            entity[ROW_KEY] = rowIndex;
            
            return row;
        };
        
        // core logic here - anytime we updated the renderedRange, we need to update the 'rows' array 
        $scope.$watch($scope.renderedRange, function (rg) {
            var rowArr = [],
            row,
            pagingOffset = (pageSize() * (currentPage() - 1)),
            dataArr = $scope.dataSource.slice(rg.bottomRow, rg.topRow);
            
            ng.utils.forEach(dataArr, function (item, i) {
                row = $scope.buildRowFromEntity(item, rg.bottomRow + i, pagingOffset);
                
                //add the row to our return array
                rowArr.push(row);
                
                //null the row pointer for next iteration
                row = null;
            });
            $scope.rows = rowArr;
        });
        
        // core logic that intelligently figures out the rendered range given all the contraints that we have
        $scope.calcRenderedRange = function () {
            var rg = $scope.viewableRange,
            minRows = $scope.eminViewportRows,
            maxRows = $scope.dataSource.length,
            isDif, // flag to help us see if the viewableRange or data has changed "enough" to warrant re-building our rows
            newRg; // variable to hold our newly-calc'd rendered range 
            
            if (rg) {

                isDif = (rg.bottomRow !== prevViewableRange.bottomRow || rg.topRow !== prevViewableRange.topRow || self.dataChanged);
                if (!isDif && prevMaxRows !== maxRows) {
                    isDif = true;
                    rg = new ng.Range(prevViewableRange.bottomRow, prevViewableRange.topRow);
                }
                
                if (!isDif && prevMinRows !== minRows) {
                    isDif = true;
                    rg = new ng.Range(prevViewableRange.bottomRow, prevViewableRange.topRow);
                }
                
                if (isDif) {
                    //Now build out the new rendered range
                    rg.topRow = rg.bottomRow + minRows;
                    
                    //store it for next rev
                    prevViewableRange = rg;
                    
                    // now build the new rendered range
                    newRg = new ng.Range(rg.bottomRow, rg.topRow);
                    
                    // make sure we are within our data constraints (can't render negative rows or rows greater than the # of data items we have)
                    newRg.bottomRow = Math.max(0, rg.bottomRow - $scope.excessRows);
                    newRg.topRow = Math.min(maxRows, rg.topRow + $scope.excessRows);
                    
                    // store them for later comparison purposes
                    prevMaxRows = maxRows;
                    prevMinRows = minRows;
                    
                    //one last equality check
                    if (prevRenderedRange.topRow !== newRg.topRow || prevRenderedRange.bottomRow !== newRg.bottomRow || self.dataChanged) {
                        self.dataChanged = false;
                        prevRenderedRange = newRg;
                        
                        // now kicngff row building
                        self.renderedRange = newRg;
                    }
                }
            } else {
                self.renderedRange = new ng.Range(0, 0);
            }
        };
        
        // make sure that if any of these change, we re-fire the calc logic
        $scope.$watch($scope.viewableRange, $scope.calcRenderedRange);
        $scope.$watch($scope.minViewportRows, $scope.calcRenderedRange);
        $scope.$watch($scope.dataSource, $scope.calcRenderedRange);
    };
    
    rowService.DataChanged = {
        get: function()   { return $scope.dataChanged; },
        set: function(val){ $scope.dataChanged = val;  }
    };
    
    rowService.ClearRowCache = function() {
        $scope.rowCache = [];
    };
    
    // change handler subscriptions for disposal purposes (used heavily by the 'rows' binding)
    rowService.RowSubscriptions = {};
    
    rowService.CalcRenderedRange = function(){
        $scope.calcRenderedRange();
    };
    
    return rowService;
}]);

/***********************************************
* FILE: ..\src\services\SelectionService.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

servicesModule.factory('SelectionService', ['$scope', function ($scope) {
    var selectionService = {};		
	
	// the count of selected items (supports both multi and single-select logic
    $scope.selectedItemCount = function() {
        return $scope.selectedItems.length;
    };
	
	$scope.maxRows = function () {
	   return $scope.dataSource.length;
	};

    selectionService.initialize = function(options, rowManager) {
        $scope.isMulti = options.isMulti || options.isMultiSelect;
        $scope.ignoreSelectedItemChanges = false; // flag to prevent circular event loops keeping single-select observable in sync
        $scope.dataSource = options.data, // the observable array datasource

        $scope.selectedItem = options.selectedItem || undefined;
        $scope.selectedItems = options.selectedItems || [];
        $scope.selectedIndex = options.selectedIndex;
        $scope.lastClickedRow = options.lastClickedRow;
        $scope.rowManager = rowManager;

        // some subscriptions to keep the selectedItem in sync
        $scope.$watch($scope.selectedItem, function(val) {
            if ($scope.ignoreSelectedItemChanges)
                return;
            $scope.selectedItems = [val];
        });

        $scope.$watch($scope.selectedItems, function(vals) {
            $scope.ignoreSelectedItemChanges = true;
            $scope.selectedItem = vals ? vals[0] : null;
            $scope.ignoreSelectedItemChanges = false;
        });

        // ensures our selection flag on each item stays in sync
        $scope.$watch($scope.selectedItems, function(newItems) {
            var data = $scope.dataSource;
            if (!newItems) {
                newItems = [];
            }
            angular.forEach(data, function(item) {
                if (!item[SELECTED_PROP]) {
                    item[SELECTED_PROP] = false;
                }
                if (ng.utils.arrayIndexOf(newItems, item) > -1) {
                    //newItems contains the item
                    item[SELECTED_PROP] = true;
                } else {
                    item[SELECTED_PROP] = false;
                }
            });
        });

        //make sure as the data changes, we keep the selectedItem(s) correct
        $scope.$watch($scope.dataSource, function(items) {
            var selectedItems,
                itemsToRemove;
            if (!items) {
                return;
            }

            //make sure the selectedItem(s) exist in the new data
            selectedItems = $scope.selectedItems;
            itemsToRemove = [];

            angular.forEach(selectedItems, function(item) {
                if (ng.utils.arrayIndexOf(items, item) < 0) {
                    itemsToRemove.push(item);
                }
            });

            //clean out any selectedItems that don't exist in the new array
            if (itemsToRemove.length > 0) {
                $scope.selectedItems.removeAll(itemsToRemove);
            }
        });

        // writable-computed observable
        // @return - boolean indicating if all items are selected or not
        // @val - boolean indicating whether to select all/de-select all
        $scope.toggleSelectAll = {
            get: function() {
                var cnt = $scope.selectedItemCount;
                if ($scope.maxRows() === 0) {
                    return false;
                }
                return cnt === $scope.maxRows();
            },
            set: function(val) {
                var checkAll = val,
                    dataSourceCopy = [];
                angular.forEach(dataSource, function(item) {
                    dataSourceCopy.push(item);
                });
                if (checkAll) {
                    $scope.selectedItems = dataSourceCopy;
                } else {
                    $scope.selectedItems = [];
                }
            }
        };
    };
		
	// function to manage the selection action of a data item (entity)
    selectionService.changeSelection = function(rowItem, evt) {
        if ($scope.isMulti && evt && evt.shiftKey) {
            if ($scope.lastClickedRow) {
                var thisIndx = $scope.rowManager.rowCache.indexOf(rowItem);
                var prevIndx = $scope.rowManager.rowCache.indexOf($scope.lastClickedRow);
                if (thisIndx == prevIndx) return false;
                prevIndx++;
                if (thisIndx < prevIndx) {
                    thisIndx = thisIndx ^ prevIndx;
                    prevIndx = thisIndx ^ prevIndx;
                    thisIndx = thisIndx ^ prevIndx;
                }
                for (; prevIndx <= thisIndx; prevIndx++) {
                    $scope.rowManager.rowCache[prevIndx].selected = $scope.lastClickedRow.selected;
                    $scope.addOrRemove(rowItem);
                }
                $scope.lastClickedRow(rowItem);
                return true;
            }
        } else if (!isMulti) {
            rowItem.selected ? $scope.selectedItems = [rowItem.entity] : $scope.selectedItems = [];
        }
        $scope.addOrRemove(rowItem);
        $scope.lastClickedRow(rowItem);
        return true;
    };
	
	// just call this func and hand it the rowItem you want to select (or de-select)    
    selectionService.addOrRemove = function(rowItem) {
        if (!rowItem.selected) {
            $scope.selectedItems.remove(rowItem.entity);
        } else {
            if ($scope.selectedItems.indexOf(rowItem.entity) === -1) {
                $scope.selectedItems.push(rowItem.entity);
            }
        }
    };
	
	return selectionService;
}]);

/***********************************************
* FILE: ..\src\services\SortService.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

serviceModule.factory('SortService', ['$scope', function ($scope) {
    var sortService = {};
    
    // this takes an piece of data from the cell and tries to determine its type and what sorting
    // function to use for it
    // @item - the cell data
    $scope.guessSortFn = function (item) {
        var sortFn, // sorting function that is guessed
            itemType, // the typeof item
            dateParts, // for date parsing
            month, // for date parsing
            day; // for date parsing
        
        if (item === undefined || item === null || item === '') return null;
        
        itemType = typeof (item);
        
        //check for numbers and booleans
        switch (itemType) {
            case "number":
            sortFn = $scope.sortNumber;
            break;
            case "boolean":
            sortFn = $scope.sortBool;
            break;
        }
        
        //if we found one, return it
        if (sortFn) return sortFn;
        
        //check if the item is a valid Date
        if (Object.prototype.toString.call(item) === '[object Date]') return $scope.sortDate;
        
        // if we aren't left with a string, we can't sort full objects...
        if (itemType !== "string") return null;   
        
        // now lets string check..
        //check if the item data is a valid number
        if (item.match(/^-?[£$¤]?[\d,.]+%?$/)) return $scope.sortNumberStr;
        // check for a date: dd/mm/yyyy or dd/mm/yy
        // can have / or . or - as separator
        // can be mm/dd as well
        dateParts = item.match(dateRE);
        if (dateParts) {
            // looks like a date
            month = parseInt(dateParts[1]);
            day = parseInt(dateParts[2]);
            if (month > 12) {
                // definitely dd/mm
                return $scope.sortDDMMStr;
            } else if (day > 12) {
                return $scope.sortMMDDStr;
            } else {
                // looks like a date, but we can't tell which, so assume that it's MM/DD
                return $scope.sortMMDDStr;
            }
        }
        //finally just sort the normal string...
        return $scope.sortAlpha;
    };
    
    //#region Sorting Functions
    $scope.sortNumber = function (a, b) {
        return a - b;
    };

    $scope.sortNumberStr = function (a, b) {
        var numA, numB, badA = false, badB = false;
        numA = parseFloat(a.replace(/[^0-9.-]/g, ''));
        if (isNaN(numA)) badA = true;
        numB = parseFloat(b.replace(/[^0-9.-]/g, ''));
        if (isNaN(numB)) badB = true;
        // we want bad ones to get pushed to the bottom... which effectively is "greater than"
        if (badA && badB) return 0;
        if (badA) return 1; 
        if (badB) return -1;
        return numA - numB;
    };

    $scope.sortAlpha = function (a, b) {
        var strA = a.toUpperCase(),
        strB = b.toUpperCase();
        return strA == strB ? 0 : (strA < strB ? -1 : 1);
    };

    $scope.sortDate = function (a, b) {
        var timeA = a.getTime(),
        timeB = b.getTime();
        return timeA == timeB ? 0 : (timeA < timeB ? -1 : 1);
    };

    $scope.sortBool = function (a, b) {
        if (a && b) { return 0; }
        if (!a && !b) { return 0; }
        else { return a ? 1 : -1;}
    };

    $scope.sortDDMMStr = function (a, b) {
        var dateA, dateB, mtch, m, d, y;
        mtch = a.match($scope.dateRE);
        y = mtch[3]; m = mtch[2]; d = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateA = y + m + d;
        mtch = b.match($scope.dateRE);
        y = mtch[3]; m = mtch[2]; d = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateB = y + m + d;
        if (dateA == dateB) return 0;
        if (dateA < dateB) return -1;
        return 1;
    };

    $scope.sortMMDDStr = function (a, b) {
        var dateA, dateB, mtch, m, d, y;
        mtch = a.match($scope.dateRE);
        y = mtch[3]; d = mtch[2]; m = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateA = y + m + d;
        mtch = b.match(dateRE);
        y = mtch[3]; d = mtch[2]; m = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateB = y + m + d;
        if (dateA == dateB) return 0;
        if (dateA < dateB) return -1;
        return 1;
    };
    //#endregion

    // the core sorting logic trigger
    $scope.sortData = function () {
        var data = $scope.dataSource,
            sortInfo = self.sortInfo,
            col,
            direction,
            sortFn,
            item;
        
        // first make sure we are even supposed to do work
        if (!data || !sortInfo || options.useExternalSorting) {
            $scope.internalSortedData = data;
            return;
        }
        
        // grab the metadata for the rest of the logic
        col = sortInfo.column;
        direction = sortInfo.direction;
        
        //see if we already figured out what to use to sort the column
        if (colSortFnCache[col.field]) {
            sortFn = colSortFnCache[col.field];
        } else if (col.sortingAlgorithm != undefined){
            sortFn = col.sortingAlgorithm;
            colSortFnCache[col.field] = col.sortingAlgorithm;
        } else { // try and guess what sort function to use
            item = $scope.dataSource[0];
            sortFn = self.guessSortFn(ng.utils.getPropertyPath(col.field, item));
            
            //cache it
            if (sortFn) {
                colSortFnCache[col.field] = sortFn;
            } else {
                // we assign the alpha sort because anything that is null/undefined will never get passed to
                // the actual sorting function. It will get caught in our null check and returned to be sorted
                // down to the bottom
                sortFn = self.sortAlpha;
            }
        }
        
        //now actually sort the data
        data.sort(function (itemA, itemB) {
            var propA = itemA,
            propB = itemB,
            propAEmpty,
            propBEmpty,
            propPath,
            i;
            
            propPath = col.field.split(".");
            for (i = 0; i < propPath.length; i++) {
                if (propA !== undefined && propA !== null) { propA = propA[propPath[i]]; }
                if (propB !== undefined && propB !== null) { propB = propB[propPath[i]]; }
            }
            
            propAEmpty = $scope.isEmpty(propA);
            propBEmpty = $scope.isEmpty(propB);
            
            // we want to force nulls and such to the bottom when we sort... which effectively is "greater than"
            if (propAEmpty && propBEmpty) {
                return 0;
            } else if (propAEmpty) {
                return 1;
            } else if (propBEmpty) {
                return -1;
            }
            
            //made it this far, we don't have to worry about null & undefined
            if (direction === ASC) {
                return sortFn(propA, propB);
            } else {
                return 0 - sortFn(propA, propB);
            }
        });
        
        $scope.internalSortedData = data;
    };
    
    sortService.initialize = function (options){
        $scope.colSortFnCache = {}, // cache of sorting functions. Once we create them, we don't want to keep re-doing it
        $scope.dateRE = /^(\d\d?)[\/\.-](\d\d?)[\/\.-]((\d\d)?\d\d)$/, // nasty regex for date parsing
        $scope.ASC = "asc", // constant for sorting direction
        $scope.DESC = "desc", // constant for sorting direction
        $scope.prevSortInfo = {}, // obj for previous sorting comparison (helps with throttling events)
        $scope.initPhase = 0, // flag for preventing improper dependency registrations with KO
        $scope.internalSortedData = [];
            
        $scope.dataSource = options.data;
        // utility function for null checking
        $scope.isEmpty = function (val) {
            return (val === null || val === undefined || val === '');
        };
        
        // the sorting metadata, eg: { column: { field: 'sku' }, direction: "asc" }
        $scope.sortInfo = options.sortInfo;
        
        $scope.sortedData = function () {
            var sortData = internalSortedData;
            //We have to do this because any observable that is invoked inside of a bindingHandler (init or update) is registered as a
            // dependency during the binding handler's dependency detection :(
            if ($scope.initPhase > 0) {
                return sortData;
            } else {
                return $scope.dataSource;
            }
        };
        $scope.initPhase = 1;
    };
    
    // the actual sort function to call
    // @col - the column to sort
    // @direction - "asc" or "desc"
    sortService.Sort = function (col, direction) {
        //do an equality check first
        if (col === prevSortInfo.column && direction === prevSortInfo.direction) {
            return;
        }
        //if its not equal, set the observable and kicngff the event chain
        $scope.sortInfo = {
            column: col,
            direction: direction
        };
    };

    //watch the changes in these objects
    $scope.$watch($scope.dataSource, $scope.sortData);
    $scope.$watch($scope.sortInfo, $scope.sortData);
    
    return sortService;
}]);

/***********************************************
* FILE: ..\src\services\TemplateService.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

serviceModule.factory('TemplateService', ['$scope', function () {
    var templateService = {};
    templateService.TemplateExists = function (tmplId) {
        var el = document.getElementById(tmplId);
        return (el !== undefined && el !== null);
    };

    templateService.AddTemplate = function (templateText, tmplId) {
        var tmpl = document.createElement("SCRIPT");
        tmpl.type = "text/html";
        tmpl.id = tmplId;
        tmpl.text = templateText;
        document.body.appendChild(tmpl);
    };

    templateService.RemoveTemplate = function (tmplId){
        var element = document.getElementById(tmplId);
        if (element) element.parentNode.removeChild(element);
    };

    templateService.AddTemplateSafe = function (tmplId, templateTextAccessor) {
        if (!self.templateExists(tmplId)) {
            self.addTemplate(templateTextAccessor(), tmplId);
        }
    };

    templateService.EnsureGridTemplates = function (options) {
        var defaults = {
            rowTemplate: '',
            headerTemplate: '',
            headerCellTemplate: '',
            footerTemplate: '',
            columns: null,
            showFilter: true
        },
        config = $.extend(defaults, options);
        
        //first ensure the grid template!
        self.addTemplateSafe(GRID_TEMPLATE,  function () {
            return ng.templates.defaultGridInnerTemplate(config);
        });
        
        //header row template
        if (config.headerTemplate) {
            self.addTemplateSafe(config.headerTemplate, function () {
                return ng.templates.generateHeaderTemplate(config);
            });
        }
        
        //header cell template
        if (config.headerCellTemplate) {
            self.addTemplateSafe(config.headerCellTemplate, function () {
                return ng.templates.defaultHeaderCellTemplate(config);
            });
        }
        
        //row template
        if (config.rowTemplate) {
            self.addTemplateSafe(config.rowTemplate, function () {
                return ng.templates.generateRowTemplate(config);
            });
        }
        
        //footer template
        if (config.footerTemplate) {
            self.addTemplateSafe(config.footerTemplate, function () {
                return ng.templates.defaultFooterTemplate(config);
            });
        }
    };

    templateService.GetTemplateText = function (tmplId) {
        if (!self.templateExists(tmplId)) {
            return "";
        } else {
            var el = document.getElementById(tmplId);
            return el.text;
        }
    };
    return templateService;
}]);

/***********************************************
* FILE: ..\src\templates\footerTemplate.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

kg.templates.defaultFooterTemplate = function () {
    var b = new ng.utils.StringBuilder();
    b.append('<div class="kgTotalSelectContainer" ng-show="footerVisible">');
    b.append(    '<div class="kgFooterTotalItems" ng-class="{\'ngNoMultiSelect\': !isMultiSelect}" >');
    b.append(        '<span class="ngLabel">Total Items: {{maxRows}}</span>');
    b.append(    '</div>');
    b.append(    '<div class="ngFooterSelectedItems" ng-show="isMultiSelect">');
    b.append(        '<span class="ngLabel">Selected Items: {{selectedItemCount}}</span>');
    b.append(    '</div>');
    b.append('</div>');
    b.append('<div class="kgPagerContainer" ng-show="{pagerVisible && footerVisible}" ng-class="{\'ngNoMultiSelect\': !isMultiSelect}">');
    b.append(    '<div style="float: right;">');
    b.append(        '<div class="kgRowCountPicker">');
    b.append(            '<span class="kgLabel">Rows:</span>');
    b.append(            '<select ng-model="selectedPageSize">');
    b.append(                '<option ng-repeat="size in pageSizes">{{size}}</option>');
    b.append(            '</select>');
    b.append(        '</div>');
    b.append(        '<div class="kgPagerControl" style="float: left; min-width: 135px;">');
    b.append(            '<input class="kgPagerFirst" type="button" ng-click="pageToFirst" ng-disable="!canPageBackward" title="First Page"/>');
    b.append(            '<input class="kgPagerPrev" type="button"  ng-click="pageBackward" ng-disable="!canPageBackward" title="Previous Page"/>');
    b.append(            '<input class="kgPagerCurrent" type="text" ng-model="protectedCurrentPage" ng-disable="{ maxPages < 1 }" />');
    b.append(            '<input class="kgPagerNext" type="button"  ng-click="pageForward" ng-disable="!canPageForward" title="Next Page"/>');
    b.append(            '<input class="kgPagerLast" type="button"  ng-click="pageToLast" ng-disable="!canPageForward" title="Last Page"/>');
    b.append(        '</div>');
    b.append(    '</div>');
    b.append('</div>');
    return b.toString();
};

/***********************************************
* FILE: ..\src\templates\gridTemplate.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

kg.templates.defaultGridInnerTemplate = function (options) {
    var b = new ng.utils.StringBuilder();
    b.append('<div class="kgTopPanel" ng-size="{ dim: headerDim }">');
    b.append(    '<div class="kgHeaderContainer" ng-size="{ dim: headerDim }">');
    b.append(        '<div class="kgHeaderScroller" ng-header-row="data" ng-size="{ dim: headerScrollerDim }">');
    b.append(        '</div>');
    b.append(    '</div>');
    b.append('</div>');
    b.append('<div class="kgViewport {0}" ng-size="{ dim: viewportDim }">', options.disableTextSelection ? "kgNoSelect": "");
    b.append(    '<div class="kgCanvas" ng-rows="rows" ng-style="{ height: canvasHeight, position: \'relative\' }">');
    b.append(    '</div>');
    b.append('</div>');
    b.append('<div class="kgFooterPanel" ng-footer="data" ng-size="{ dim: footerDim }">'); //not sure what goes in ng-footer.
    b.append('</div>');
    return b.toString();
};

/***********************************************
* FILE: ..\src\templates\headerCellTemplate.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

kg.templates.defaultHeaderCellTemplate = function (options) {
    var b = new ng.utils.StringBuilder();
    b.append('<div ng-click="sort" ng-class="{ \'kgSorted\': !noSortVisible }">');
    b.append('  <span>{{displayName}}</span>');
    b.append('  <div class="kgSortButtonDown" ng-show="(allowSort ? (noSortVisible || sortAscVisible) : allowSort)"></div>');
    b.append('  <div class="kgSortButtonUp" ng-show="(allowSort ? (noSortVisible || sortDescVisible) : allowSort)"></div>');
    b.append('</div>');
    if (!options.autogenerateColumns && options.enableColumnResize){
        b.append('<div class="kgHeaderGrip" ng-show="allowResize" ng-mouseDown="gripOnMouseDown()"></div>');
    }
    b.append('<div ng-show="_filterVisible">');
    b.append('  <input type="text" ng-model="column.filter" style="width: 80%" tabindex="1" />');
    b.append('</div>');
    return b.toString();
};

/***********************************************
* FILE: ..\src\templates\headerTemplate.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

kg.templates.generateHeaderTemplate = function (options) {
    var b = new ng.utils.StringBuilder(),
        cols = options.columns,
        showFilter = options.showFilter;
    ng.utils.forEach(cols, function (col, i) {
        if (col.field === SELECTED_PROP) {
            b.append('<div class="kgSelectionCell kgHeaderCell col{0} kgNoSort">', col.index);
            b.append('  <input type="checkbox" ng-checked="toggleSelectAll()"/>');
            b.append('</div>');
        } else if (col.field === 'rowIndex' && showFilter) {
            b.append('<div class="kgHeaderCell col{0} kgNoSort">', col.index);
            b.append('      <div title="Filter Results" class="kgFilterBtn openBtn" ng-hide="filterVisible" ng-click="showFilter_Click()"></div>');
            b.append('      <div title="Close" class="kgFilterBtn closeBtn" ng-show="filterVisible" ng-click="showFilter_Click()"></div>');
            b.append('      <div title="Clear Filters" class="kgFilterBtn clearBtn" ng-show="filterVisible" ng-click="clearFilter_Click()"></div>');
            b.append('</div>');
        } else {
            b.append('<div class="kgHeaderCell col{0}" ng-style="{ width: colWidth }" ng-class="{ \'kgNoSort\': {1} }">{{field}}</div>', col.index, !col.allowSort);
        }
    });
    return b.toString();
};

/***********************************************
* FILE: ..\src\templates\rowTemplate.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

kg.templates.generateRowTemplate = function (options) {
    var b = new ng.utils.StringBuilder(),
        cols = options.columns;
    b.append('<div ng-row="rowData" ng-click="toggleSelected" ng-class="{ \'kgSelected\': selected }">');
    angular.forEach(cols, function (col) {
        // check for the Selection Column
        if (col.field === SELECTED_PROP) {
            b.append('<div class="kgSelectionCell" ng-class="[\'kgCell\',\'col{0}]\']">', col.index);
            b.append('  <input type="checkbox" ng-checked="selected"/>');
            b.append('</div>');
        }
        // check for RowIndex Column
        else if (col.field === 'rowIndex') {
            b.append('<div class="kgRowIndexCell" ng-class="[\'kgCell\',\'col{0}]\']">{{rowIndex}}</div>', col.index);
        }
        // check for a Column with a Cell Template
        else if (col.hasCellTemplate) {
            // first pull the template
            var tmpl = ng.templateManager.getTemplateText(col.cellTemplate);
            // build the replacement text
            var replacer = "{{field}}' }";
            // run any changes on the template for re-usable templates
            tmpl = tmpl.replace(/\$cellClass/g, col.cellClass || 'kgEmpty');
            tmpl = tmpl.replace(/\$cellValue/g, col.field);
            tmpl = tmpl.replace(/\$cell/g, replacer);
            b.append(tmpl);
        }
        // finally just use a basic template for the cell
        else {
            b.append('  <div ng-class="[\'kgCell\',\'col{0}]\', \'{0}\']">{{field}}</div>', col.cellClass || 'kgEmpty',  col.index);
        }
    });
    b.append('</div>');
    return b.toString();
};

/***********************************************
* FILE: ..\src\classes\cell.js
***********************************************/
ng.Cell = function (col) {
    this.data = '';
    this.column = col;
    this.row = null;
};

/***********************************************
* FILE: ..\src\classes\cellFactory.js
***********************************************/
ng.CellFactory = function (cols) {
    var colCache = cols,
        len = colCache.length;

    this.buildRowCells = function (row) {
        var cell,
            cells = [],
            col,
            i = 0;

        for (; i < len; i++) {
            col = colCache[i];

            cell = new ng.Cell(col);
            cell.row = row;
            //enabling nested property values in a viewmodel
            cell.data = ng.utils.getPropertyPath(col.field, row.entity); 
            cells.push(cell);
            row.cellMap[col.field] = cell;
        }
        row.cells(cells);

        return row;
    };
};

/***********************************************
* FILE: ..\src\classes\column.js
***********************************************/
ng.column = function (colDef, index) {
    var self = this;
        
    this.width = colDef.width;
    this.widthIsConfigured = false;
    this.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
    this.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;
    
    this.field = colDef.field;
    if (colDef.displayName === undefined || colDef.displayName === null) {
        // Allow empty column names -- do not check for empty string
        colDef.displayName = colDef.field;
    }
    this.displayName = colDef.displayName;
    this.index = index;
    this.isVisible = false;

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
    
    this.allowSort = colDef.sortable;
    this.allowResize = colDef.resizable;
    this.allowFilter = colDef.filterable;
    
    this.sortDirection = "";
    this.sortingAlgorithm = colDef.sortFn;

    //filtering
    this.filter;

    //cell Template
    this.cellTemplate = colDef.cellTemplate; // string of the cellTemplate script element id
    this.hasCellTemplate = (this.cellTemplate ? true : false);

    this.cellClass = colDef.cellClass;
    this.headerClass = colDef.headerClass;

    this.headerTemplate = colDef.headerTemplate
    this.hasHeaderTemplate = (this.headerTemplate ? true : false);
};

/***********************************************
* FILE: ..\src\classes\dimension.js
***********************************************/
ng.dimension = function (options) {
    this.innerHeight = null;
    this.innerWidth = null;
    this.outerHeight = null;
    this.outerWidth = null;
    this.widthDiff = null;
    this.heightDiff = null;

    this.autoFitHeight = false; //tells it to just fit to the wrapping container
    this.autoFitWidth = false;

    $.extend(this, options);
};

/***********************************************
* FILE: ..\src\classes\footer.js
***********************************************/
ng.footer = function (grid) {
    var self = this;

    this.maxRows;

    if (!ng.utils.isNullOrUndefined(grid.config.totalServerItems)) {
        this.maxRows = grid.config.totalServerItems;
    } else {
        this.maxRows = grid.maxRows;
    }
    this.isMultiSelect = (grid.config.canSelectRows && grid.config.isMultiSelect);
    this.selectedItemCount = grid.selectedItemCount;

    this.footerVisible = grid.config.footerVisible;
    this.pagerVisible = grid.config.enablePaging;
    this.selectedPageSize = grid.config.pageSize;
    this.pageSizes = grid.config.pageSizes;
    this.currentPage = grid.config.currentPage;
    this.maxPages = (function () {
        var maxCnt = self.maxRows || 1,
            pageSize = self.selectedPageSize;
        return Math.ceil(maxCnt / pageSize);
    });

    this.protectedCurrentPage = {
        get: function () {
            return self.currentPage();
        },
        set: function (page) {
            var pageInt = parseInt(page);
            if (!isNaN(pageInt) || (pageInt && pageInt <= self.maxPages && pageInt > 0)) {
                self.currentPage = pageInt;
            }
        }
    };

    this.pageForward = function () {
        var page = self.currentPage;
        self.currentPage(Math.min(page + 1, self.maxPages));
    }

    this.pageBackward = function () {
        var page = self.currentPage;
        self.currentPage = Math.max(page - 1, 1);
    };

    this.pageToFirst = function () {
        self.currentPage = 1;
    };

    this.pageToLast = function () {
        var maxPages = self.maxPages;
        self.currentPage = maxPages;
    };

    this.canPageForward = ko.computed(function () {
        var curPage = self.currentPage;
        var maxPages = self.maxPages;
        return curPage < maxPages;
    });

    this.canPageBackward = ko.computed(function () {
        var curPage = self.currentPage;
        return curPage > 1;
    });
};

/***********************************************
* FILE: ..\src\classes\grid.js
***********************************************/
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

/***********************************************
* FILE: ..\src\classes\headerCell.js
***********************************************/
ng.headerCell = function (col) {
    var self = this;

    this.colIndex = col.colIndex;
    this.displayName = col.displayName;
    this.field = col.field;
    this.column = col;

    this.headerClass = col.headerClass;
    this.headerTemplate = col.headerTemplate;
    this.hasHeaderTemplate = col.hasHeaderTemplate;
    
    this.allowSort = col.allowSort;
    this.allowFilter = col.allowFilter;
    this.allowResize = col.allowResize;
    
    this.width = col.width;
    this.minWidth = col.minWidth;
    this.maxWidth = col.maxWidth;

    this.filter = {
        get: function () {
            return self.column.filter;
        },
        set: function (val) {
            self.column. = val;
        }
    };

    this.filterVisible = false;
    this._filterVisible = {
        get: function () {
            return self.allowFilter;
        },
        set: function (val) {
            self.filterVisible = val;
        }
    };
    
    this.sortAscVisible = (function () {
        return self.column.sortDirection === "asc";
    })();

    this.sortDescVisible = (function () {
        return self.column.sortDirection === "desc";
    })();

    this.noSortVisible = (function () {
        var sortDir = self.column.sortDirection;
        return sortDir !== "asc" && sortDir !== "desc";
    })();

    this.sort = function () {
        if (!self.allowSort()) {
            return; // column sorting is disabled, do nothing
        }
        var dir = self.column.sortDirection === "asc" ? "desc" : "asc";
        self.column.sortDirection = dir;
    };

    this.filterHasFocus = false;

?    this.startMousePosition = 0;
    
?    this.startMousePosition = 0;
    this.origWidth = 0;
?    
    this.gripOnMouseUp = function () {
        $(document).off('mousemove');
        $(document).off('mouseup');
        document.body.style.cursor = 'default';
        return false;
    };

    this.onMouseMove = function (event) {
        var diff = event.clientX - self.startMousePosition;
        var newWidth = diff + self.origWidth;
        self.width(newWidth < self.minWidth ? self.minWidth : ( newWidth > self.maxWidth ? self.maxWidth : newWidth) );
        return false;
?    };
?    
    this.gripOnMouseDown = function (event) {
        self.startMousePosition = event.clientX;
        self.origWidth = self.width();
?        $(document).mousemove(self.onMouseMove);
?        $(document).mouseup(self.gripOnMouseUp);
        document.body.style.cursor = 'col-resize';
        event.target.parentElement.style.cursor = 'col-resize';
        return false;
    };
};

/***********************************************
* FILE: ..\src\classes\headerRow.js
***********************************************/
ng.headerRow = function () {
    this.headerCells = [];
    this.height;
    this.headerCellMap = {};
    this.filterVisible = false;
};

/***********************************************
* FILE: ..\src\classes\range.js
***********************************************/
ng.Range = function (bottom, top) {
    this.topRow = top;
    this.bottomRow = bottom;
};

/***********************************************
* FILE: ..\src\classes\row.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.Row = function (entity, config, selectionManager) {
    var self = this, // constant for the selection property that we add to each data item
        canSelectRows = config.canSelectRows;
    this.selectedItems = config.selectedItems;
    this.entity = entity;
    this.selectionManager = selectionManager;
    //selectify the entity
    if (this.entity[SELECTED_PROP] === undefined) {
        this.entity[SELECTED_PROP] = false;
    }
    this.selected = {
        get: function() {
            if (!canSelectRows) {
                return false;
            }
            var val = self.entity['__ng_selected__'];
            return val;
        },
        set: function(val, evt) {
            if (!canSelectRows) {
                return true;
            }
            self.beforeSelectionChange();
            self.entity[SELECTED_PROP] = val;
            self.selectionManager.changeSelection(self, evt);
            self.afterSelectionChange();
            self.onSelectionChanged();
            return val;
        }
    };

    this.toggleSelected = function (data, event) {
        if (!canSelectRows) {
            return true;
        }
        var element = event.target;

        //check and make sure its not the bubbling up of our checked 'click' event 
        if (element.type == "checkbox" && element.parentElement.className.indexOf("ngSelectionCell" !== -1)) {
            return true;
        } 
        if (config.selectWithCheckboxOnly && element.type != "checkbox"){
            return true;
        } else {
            self.selected ? self.selected.set(false, event) : self.selected.set(true, event);
        }
        return true;
    };

    this.toggle = function(item) {
        if (item.selected.get()) {
            item.selected.set(false);
            self.selectedItems.remove(item.entity);
        } else {
            item.selected.set(true);
            if (self.selectedItems.indexOf(item.entity) === -1) {
                self.selectedItems.push(item.entity);
            }
        }

    };

    this.cells = [];
    this.cellMap = {};
    this.rowIndex = 0;
    this.offsetTop = 0;
    this.rowKey = ng.utils.newId();
    this.rowDisplayIndex = 0;

    this.onSelectionChanged = function () { }; //replaced in rowManager
    this.beforeSelectionChange = function () { };
    this.afterSelectionChange = function () { };
    //during row initialization, let's make all the entities properties first-class properties on the row
    (function () {
        ng.utils.forIn(entity, function (prop, propName) {
            self[propName] = prop;
        });
    }());
}; 

/***********************************************
* FILE: ..\src\domManipulation\cssBuilder.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

kg.cssBuilder = {

    buildStyles: function (grid) {
        var rowHeight = (grid.config.rowHeight - grid.elementDims.rowHdiff),
            headerRowHeight = grid.config.headerRowHeight,
            $style = grid.$styleSheet,
            gridId = grid.gridId,
            i = 0,
            len = grid.columns.length,
            css = new ng.utils.StringBuilder(),
            col,
            sumWidth = 0;

        if (!$style) {
            $style = $("<style type='text/css' rel='stylesheet' />").appendTo($('head'));
        }
        $style.empty();
        
        css.append(".{0} .kgCanvas { width: {1}px; }", gridId, grid.totalRowWidth);
        css.append(".{0} .kgCell { height: {1}px; }", gridId, rowHeight);
        css.append(".{0} .kgRow { position: absolute; left: 0; right: 0; height: {1}px; line-height: {1}px; display: inline; }", gridId, rowHeight);
        css.append(".{0} .kgHeaderCell { top: 0; bottom: 0; }", gridId, headerRowHeight);
        css.append(".{0} .kgHeaderScroller { line-height: {1}px; overflow: none; }", gridId, headerRowHeight);    
        
        for (; i < len; i++) {
            col = grid.columns[i];
            css.append(".{0} .col{1} { left: {2}px; right: {3}px; }", gridId, i, sumWidth, (grid.totalRowWidth - sumWidth - col.width));
            sumWidth += col.width();
        }
        if (ng.utils.isIe) { // IE
            $style[0].styleSheet.cssText = css.toString(" ");
        }
        else {
            $style[0].appendChild(document.createTextNode(css.toString(" ")));
        }

        grid.$styleSheet = $style;
    }
};

/***********************************************
* FILE: ..\src\domManipulation\domUtility.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

kg.domUtility = (new function () {
    var $testContainer = $('<div></div>'),
        self = this;

    var parsePixelString = function(pixelStr){
        if(!pixelStr){
            return 0;
        }

        var numStr = pixelStr.replace("/px/gi", "");

        var num = parseInt(numStr, 10);

        return isNaN(num) ? 0 : num;
    };

    this.assignGridContainers = function (rootEl, grid) {

        grid.$root = $(rootEl);

        //Headers
        grid.$topPanel = $(".kgTopPanel", grid.$root[0]);
        grid.$headerContainer = $(".kgHeaderContainer", grid.$topPanel[0]);
        grid.$headerScroller = $(".kgHeaderScroller", grid.$headerContainer[0]);
        grid.$headers = grid.$headerContainer.children();

        //Viewport
        grid.$viewport = $(".kgViewport", grid.$root[0]);

        //Canvas
        grid.$canvas = $(".kgCanvas", grid.$viewport[0]);

        //Footers
        grid.$footerPanel = $(".kgFooterPanel", grid.$root[0]);
    };

    this.measureElementMaxDims = function ($container) {
        var dims = {};

        var $test = $("<div style='height: 20000px; width: 20000px;'></div>");

        $container.append($test);

        dims.maxWidth = $container.width();
        dims.maxHeight = $container.height();
        var pixelStr;
        if (!dims.maxWidth) {
            pixelStr = $container.css("max-width");
            dims.maxWidth = parsePixelString(pixelStr);
        }

        if (!dims.maxHeight) {
            pixelStr = $container.css("max-height");
            dims.maxHeight = parsePixelString(pixelStr);
        }

        //if they are zero, see what the parent's size is
        if (dims.maxWidth === 0) {
            dims.maxWidth = $container.parent().width();
        }
        if (dims.maxHeight === 0) {
            dims.maxHeight = $container.parent().height();
        }
        
        $test.remove();

        return dims;
    };

    this.measureElementMinDims = function ($container) {
        var dims = { };
        var testContainer = $container.clone();

        $testContainer.appendTo($container.parent().first());

        dims.minWidth = 0;
        dims.minHeight = 0;

        //since its cloned... empty it out
        testContainer.empty();

        var $test = $("<div style='height: 0x; width: 0px;'></div>");
        testContainer.append($test);

        //$testContainer.wrap("<div style='width: 1px; height: 1px;'></div>");

        dims.minWidth = $testContainer.width();
        dims.minHeight = $testContainer.height();
        var pixelStr;
        if (!dims.minWidth) {
            pixelStr = $testContainer.css("min-width");
            dims.minWidth = parsePixelString(pixelStr);
        }

        if (!dims.minHeight) {
            pixelStr = $testContainer.css("min-height");
            dims.minHeight = parsePixelString(pixelStr);
        }

        $testContainer.remove();

        return dims;
    };

    this.measureGrid = function ($container, grid) {

        //find max sizes
        var dims = self.measureElementMaxDims($container);

        grid.elementDims.rootMaxW = dims.maxWidth;
        grid.elementDims.rootMaxH = dims.maxHeight;

        //set scroll measurements
        grid.elementDims.scrollW = ng.domUtility.scrollW;
        grid.elementDims.scrollH = ng.domUtility.scrollH;

        //find min sizes
        dims = self.measureElementMinDims($container);

        grid.elementDims.rootMinW = dims.minWidth;

        // do a little magic here to ensure we always have a decent viewport
        dims.minHeight = Math.max(dims.minHeight, (grid.config.headerRowHeight + grid.config.footerRowHeight + (3 * grid.config.rowHeight)));
        dims.minHeight = Math.min(grid.elementDims.rootMaxH, dims.minHeight);

        grid.elementDims.rootMinH = dims.minHeight;
    };

    this.measureRow = function ($canvas, grid) {
        var $row,
            $cell,
            isDummyRow,
            isDummyCell;

        $row = $canvas.children().first();
        if ($row.length === 0) {
            //add a dummy row
            $canvas.append('<div class="kgRow"></div>');
            $row = $canvas.children().first();
            isDummyRow = true;
        }

        $cell = $row.children().first();
        if ($cell.length === 0) {
            //add a dummy cell
            $row.append('<div class="kgCell col0"></div>');
            $cell = $row.children().first();
            isDummyCell = true;
        }

        grid.elementDims.rowWdiff = $row.outerWidth() - $row.width();
        grid.elementDims.rowHdiff = $row.outerHeight() - $row.height();

        grid.elementDims.cellWdiff = $cell.outerWidth() - $cell.width();
        grid.elementDims.cellHdiff = $cell.outerHeight() - $cell.height();

        grid.elementsNeedMeasuring = false;

        if (isDummyRow) {
            $row.remove();
        } else if (isDummyCell) {
            $cell.remove();
        }
    };

    this.scrollH = 17; // default in IE, Chrome, & most browsers
    this.scrollW = 17; // default in IE, Chrome, & most browsers
    this.letterW = 5;

    $(function () {
        $testContainer.appendTo('body');
        // 1. Run all the following measurements on startup!

        //measure Scroll Bars
        $testContainer.height(100).width(100).css("position", "absolute").css("overflow", "scroll");
        $testContainer.append('<div style="height: 400px; width: 400px;"></div>');

        self.scrollH = ($testContainer.height() - $testContainer[0].clientHeight);
        self.scrollW = ($testContainer.width() - $testContainer[0].clientWidth);

        $testContainer.empty();

        //clear styles
        $testContainer.attr('style', '');

        //measure letter sizes using a pretty typical font size and fat font-family
        $testContainer.append('<span style="font-family: Verdana, Helvetica, Sans-Serif; font-size: 14px;"><strong>M</strong></span>');

        self.letterW = $testContainer.children().first().width();

        $testContainer.remove();
    });

} ());

/***********************************************
* FILE: ..\src\directives\ng-footer.js
***********************************************/
/*ko.bindingHandlers['kgFooter'] = (function () {
    var makeNewValueAccessor = function (grid) {
        return function () {
            return { name: grid.config.footerTemplate, data: grid.footer };
        }
    };

    var makeNewBindingContext = function (bindingContext, footer) {
        return bindingContext.createChildContext(footer);
    };

    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid = bindingContext.$data;

            grid.footer = new kg.Footer(grid);

            return ko.bindingHandlers.template.init(element, makeNewValueAccessor(grid), allBindingsAccessor, grid, makeNewBindingContext(bindingContext, grid.footer));
        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid = bindingContext.$data;

            return ko.bindingHandlers.template.update(element, makeNewValueAccessor(grid), allBindingsAccessor, grid, makeNewBindingContext(bindingContext, grid.footer));
        }
    }
} ());
*/

/***********************************************
* FILE: ..\src\directives\ng-grid.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ngGridDirectives.directive('ngGrid', function factory(GridService, TemplateService) {
    var ngGrid = {
        scope: true,
        compile: function compile(tElement, tAttrs, transclude) {
            var options = tAttrs,
                $element = $(tElement);

            //create the Grid
            var grid = GridService.getGrid($element);
            if (!grid) {
                grid = new ng.KoGrid(options, $(element).width());
                GridService.storeGrid(element, grid);
            } else {
                return false;
            }

            TemplateService.ensureGridTemplates({
                rowTemplate: grid.config.rowTemplate,
                headerTemplate: grid.config.headerTemplate,
                headerCellTemplate: grid.config.headerCellTemplate,
                footerTemplate: grid.config.footerTemplate,
                columns: grid.columns(),
                showFilter: grid.config.allowFiltering,
                disableTextSelection: grid.config.disableTextSelection,
                autogenerateColumns: grid.config.autogenerateColumns,
                enableColumnResize: grid.config.enableColumnResize
            });



            //get the container sizes
            ng.domUtility.measureGrid($element, grid, true);

            $element.hide(); //first hide the grid so that its not freaking the screen out

            //set the right styling on the container
            $element.addClass("kgGrid")
                    .addClass("ui-widget")
                    .addClass(grid.gridId.toString());
        },
        link: function postLink(scope, iElement, iAttrs) {
            var $element = $(iElement),
                grid = GridService.getGrid($element);
            //subscribe to the columns and recrate the grid if they change
            scope.$watch(grid.config.columnDefs, function () {
                var oldgrid = GridService.getGrid(element);
                var oldgridId = oldgrid.gridId.toString();
                $(element).empty();
                $(element).removeClass("ngGrid")
                          .removeClass("ui-widget")
                          .removeClass(oldgridId);
                GridService.removeGrid(oldgridId);
            });
            //walk the element's graph and the correct properties on the grid
            ng.domUtility.assignGridContainers(element, grid);
            //now use the manager to assign the event handlers
            GridService.assignGridEventHandlers(grid);
            //call update on the grid, which will refresh the dome measurements asynchronously
            grid.update();
        }
    };
});

/***********************************************
* FILE: ..\src\directives\ng-headerCell.js
***********************************************/
/*
ko.bindingHandlers['kgHeader'] = (function () {
    var makeNewValueAccessor = function (headerCell, grid) {
        return function () {
            return {
                name: headerCell.headerTemplate || grid.config.headerCellTemplate,
                data: headerCell
            };
        };
    };
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var headerRow = bindingContext.$data,
                cell,
                property,
                options = valueAccessor(); //string of the property name

            if (options) {
                property = options.value;
                cell = headerRow.headerCellMap[property];
                if (cell) {
                    if (property !== 'rowIndex' && property !== '__kg_selected__') {
                        return { 'controlsDescendantBindings': true }
                    }
                }
            }

            
        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var headerRow = bindingContext.$data,
                grid = bindingContext.$parent,
                cell,
                property,
                options = valueAccessor(); //string of the property name

            if (options) {
                property = options.value;
                cell = headerRow.headerCellMap[property];
                if (cell) {
                    
                    //format the header cell
                    element.className += " kgHeaderCell col" + cell.colIndex + " ";
                    
                    //add the custom class in case it has been provided
                    if (cell.headerClass) {
                        element.className += " " + cell.headerClass;
                    }

                    if (property !== 'rowIndex' && property !== '__kg_selected__') {
                        //render the cell template
                        return ko.bindingHandlers.template.update(element, makeNewValueAccessor(cell, grid), allBindingsAccessor, viewModel, bindingContext);
                    }
                }
            }
        }
    }
} ());
*/

/***********************************************
* FILE: ..\src\directives\ng-headerRow.js
***********************************************/
/*ko.bindingHandlers['kgHeaderRow'] = (function () {

    var buildHeaders = function (grid) {
        var cols = grid.columns(),
            cell,
            headerRow = new kg.HeaderRow();

        kg.utils.forEach(cols, function (col, i) {
            cell = new kg.HeaderCell(col);
            cell.colIndex = i;

            headerRow.headerCells.push(cell);
            headerRow.headerCellMap[col.field] = cell;
        });

        grid.headerRow = headerRow;
        grid.headerRow.height = grid.config.headerRowHeight;
    };

    var makeNewValueAccessor = function (grid) {
        return function () {
            return { name: grid.config.headerTemplate, data: grid.headerRow };
        }
    };

    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid = bindingContext.$data;

            buildHeaders(grid);

            return ko.bindingHandlers.template.init(element, makeNewValueAccessor(grid), allBindingsAccessor, grid, bindingContext);
        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var grid = bindingContext.$data;

            return ko.bindingHandlers.template.update(element, makeNewValueAccessor(grid), allBindingsAccessor, grid, bindingContext);
        }
    }
} ());
*/

/***********************************************
* FILE: ..\src\directives\ng-row.js
***********************************************/
/*
ko.bindingHandlers['kgRow'] = (function () {
    return {
        'init': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        },
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var row = valueAccessor(),
                classes = 'kgRow',
                grid = bindingContext.$parent,
                rowManager = bindingContext.$parent.rowManager,
                rowSubscription;

            if (grid.config.canSelectRows) {
                classes += ' kgCanSelect';
            }
            classes += (row.rowIndex % 2) === 0 ? ' even' : ' odd';

            element['__kg_rowIndex__'] = row.rowIndex;
            element.style.top = row.offsetTop + 'px';
            element.className = classes;

            //ensure we know the node to dispose later!

            rowSubscription = rowManager.rowSubscriptions[row.rowIndex];
            if (rowSubscription) {
                rowSubscription.node = element;
            }
        }
    };
} ());
*/

/***********************************************
* FILE: ..\src\directives\ng-rows.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/*
ngGridDirectives.directive('ngRows', function factory() {
    // figures out what rows already exist in DOM and 
    // what rows need to be added as new DOM nodes
    //
    // the 'currentNodeCache' is dictionary of currently existing
    // DOM nodes indexed by rowIndex
    var compareRows = function (rows, rowSubscriptions) {
        var rowMap = {},
            newRows = [],
            rowSubscriptionsToRemove = [];
        
        //figure out what rows need to be added
        ng.utils.arrayForEach(rows, function (row) {
            rowMap[row.rowIndex] = row;
            
            // make sure that we create new rows when sorting/filtering happen.
            // The rowKey tells us whether the row for that rowIndex is different or not
            var possibleRow = rowSubscriptions[row.rowIndex];
            if (!possibleRow) {
                newRows.push(row);
            } else if (possibleRow.rowKey !== row.rowKey) {
                newRows.push(row);
            }
        });
        //figure out what needs to be deleted
        ng.utils.forIn(rowSubscriptions, function (rowSubscription, index) {
            
            //get the row we might be able to compare to
            var compareRow = rowMap[index];
            
            // if there is no compare row, we want to remove the row from the DOM
            // if there is a compare row and the rowKeys are different, we want to remove from the DOM
            //  bc its most likely due to sorting etc..
            if (!compareRow) {
                rowSubscriptionsToRemove.push(rowSubscription);
            } else if (compareRow.rowKey !== rowSubscription.rowKey) {
                rowSubscriptionsToRemove.push(rowSubscription);
            }
        });
        return {
            add: newRows,
            remove: rowSubscriptionsToRemove
        };
    };
    return function(scope, iElement, iAttrs){ //TODO: need to make this actually work.
        var rowManager = scope.rowManager,
        rows = scope.rows,
        grid = bindingContext.$data,
        rowChanges;
        //figure out what needs to change
        rowChanges = compareRows(rows, rowManager.rowSubscriptions || {});
        // FIRST!! We need to remove old ones in case we are sorting and simply replacing the data at the same rowIndex            
        ng.utils.arrayForEach(rowChanges.remove, function (rowSubscription) {
            if (rowSubscription.node) {
                ko.removeNode(rowSubscription.node);
            }
            rowSubscription.subscription.dispose();
            delete rowManager.rowSubscriptions[rowSubscription.rowIndex];
        });
        // and then we add the new row after removing the old rows
        ng.utils.arrayForEach(rowChanges.add, function (row) {
            var newBindingCtx,
                rowSubscription,
                divNode = document.createElement('DIV');
            //make sure the bindingContext of the template is the row and not the grid!
            newBindingCtx = bindingContext.createChildContext(row);
            //create a node in the DOM to replace, because KO doesn't give us a good hook to just do this...
            element.appendChild(divNode);
            //create a row subscription to add data to
            rowSubscription = new rowSubscription();
            rowSubscription.rowKey = row.rowKey;
            rowSubscription.rowIndex = row.rowIndex;
            rowManager.rowSubscriptions[row.rowIndex] = rowSubscription;
            rowSubscription.subscription = ko.renderTemplate(grid.config.rowTemplate, newBindingCtx, null, divNode, 'replaceNode');
        });
        //only measure the row and cell differences when data changes
        if (grid.elementsNeedMeasuring && grid.initPhase > 0) {
            //Measure the cell and row differences after rendering
            kg.domUtility.measureRow($(element), grid);
        }
    };
});
*/

/***********************************************
* FILE: ..\src\directives\ng-size.js
***********************************************/
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>


ngGridDirectives.directive('ngSize', function factory() {
    var ngSize = {
        scope: false,
        compile: function compile(tElement, tAttrs, transclude) {
            
        },
        link: function postLink(scope, iElement, iAttrs) {  
            var $container = $(iElement),
            $parent = $container.parent(),
            dim = iAttrs.dim,
            oldHt = $container.outerHeight(),
            oldWdth = $container.outerWidth();
            
            if (dim != undefined) {
                if (dim.autoFitHeight) {
                    dim.outerHeight = $parent.height();
                }
                if (dim.innerHeight && dim.innerWidth) {
                    $container.height(dim.innerHeight);
                    $container.width(dim.innerWidth);
                    return;
                };
                if (oldHt !== dim.outerHeight || oldWdth !== dim.outerWidth) {
                    //now set it to the new dimension, remeasure, and set it to the newly calculated
                    $container.height(dim.outerHeight).width(dim.outerWidth);
                    
                    //remeasure
                    oldHt = $container.outerHeight();
                    oldWdth = $container.outerWidth();
                    
                    dim.heightDiff = oldHt - $container.height();
                    dim.widthDiff = oldWdth - $container.width();
                    
                    $container.height(dim.outerHeight - dim.heightDiff);
                    $container.width(dim.outerWidth - dim.widthDiff);
                }
            }
        }
    };
    return ngSize;
});

/***********************************************
* FILE: ..\src\init.js
***********************************************/
/// <reference path="../lib/jquery-1.8.2.min" />
/// <reference path="../lib/angular.js" />
/// <reference path="../src/constants.js"/>
/// <reference path="../src/namespace.js" />
/// <reference path="../src/navigation.js"/>
/// <reference path="../src/utils.js"/>

// initialization of services intot he main module
angular.module('ngGrid', ['ngGrid.filters', 'ngGrid.services', 'ngGrid.directives']).
    run(function(FilerService, GridService, RowService, SelectionService, SortService, TemplateService){
        
    });


}(window));
