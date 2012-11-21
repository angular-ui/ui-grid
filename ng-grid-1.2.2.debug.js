/***********************************************
* ng-grid JavaScript Library
* Authors: https://github.com/Crash8308/ng-grid/blob/master/README.md
* License: MIT (http://www.opensource.org/licenses/mit-license.php)
* Compiled At: 11/21/2012 12:38:16
***********************************************/

(function(window, undefined){

/***********************************************
* FILE: ..\src\namespace.js
***********************************************/
window.ng = {};
var ngGridServices = angular.module('ngGrid.services', []);
var ngGridDirectives = angular.module('ngGrid.directives', []);
var ngGridFilters = angular.module('ngGrid.filters', []);
// Declare app level module which depends on filters, and services


/***********************************************
* FILE: ..\src\constants.js
***********************************************/
var ROW_KEY = '__ng_rowIndex__';
var SELECTED_PROP = '__ng_selected__'; 
var GRID_KEY = '__koGrid__';
// the # of rows we want to add to the top and bottom of the rendered grid rows 
var EXCESS_ROWS = 26;
var SCROLL_THRESHOLD = 20;
var ASC = "asc"; // constant for sorting direction
var DESC = "desc"; // constant for sorting direction
var NG_FIELD = '_ng_field_';
var NG_DEPTH = '_ng_depth_';
var NG_HIDDEN = '_ng_hidden_';
var NG_COLUMN = '_ng_column_';
var CUSTOM_FILTERS = /CUSTOM_FILTERS/g;

/***********************************************
* FILE: ..\src\navigation.js
***********************************************/

//set event binding on the grid so we can select using the up/down keys
ng.moveSelectionHandler = function ($scope, grid, evt) {
    // null checks 
    if (grid === null || grid === undefined) return true;
    if (grid.config.selectedItems === undefined) return true;
    
    var offset,
        charCode = (evt.which) ? evt.which : event.keyCode;
    
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
    var items = grid.sortedData,
        n = items.length,
        index = ng.utils.arrayIndexOf(items, grid.selectionService.lastClickedRow.entity) + offset,
        rowCache = grid.rowFactory.rowCache,
        selected,
        itemToView;

    // now find the item we arrowed to, and select it
    if (index >= 0 && index < n) {
        selected = items[index];
        var row = rowCache[selected[ROW_KEY]];
        if (row) {
            row.toggleSelected(evt);
            itemToView = ng.utils.getElementsByClassName("selected");
            // finally scroll it into view as we arrow through
            if (itemToView && itemToView[0]) {
                if (!Element.prototype.scrollIntoViewIfNeeded) {
                    itemToView[0].scrollIntoView(false);
                    grid.$viewport.focus();
                } else {
                    itemToView[0].scrollIntoViewIfNeeded();
                }
            }
        }
        if (!$scope.$$phase) {
            $scope.$apply();
        }
        // fire the selection
        return false;
    }
    return false;
}; 

/***********************************************
* FILE: ..\src\utils.js
***********************************************/
if (!Array.prototype.indexOf)
{
	Array.prototype.indexOf = function(elt /*, from*/){
		var len = this.length >>> 0;
		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0) from += len;
		for (; from < len; from++){
			if (from in this && this[from] === elt) return from;
		}
		return -1;
	};
}

if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {
    "use strict";
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")throw new TypeError();
    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }
    return res;
  };
}

ng.utils = {
    visualLength: function (node) {
        var elem = document.getElementById('testDataLength');
        if (!elem) {
            elem = document.createElement('SPAN');
            elem.id = "testDataLength";
            elem.style.visibility = "hidden";
            document.body.appendChild(elem);
        }
        var font = $(node).css('font');
        $(elem).css('font', font);
        elem.innerHTML = $(node).text();
        return elem.offsetWidth;
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
    evalProperty: function (entity, path) {
        var propPath = path.split('.');
        var tempProp = entity[propPath[0]];

        for (var j = 1; j < propPath.length; j++) {
            if (tempProp) {
                tempProp = tempProp[propPath[j]];
            } else {
                break;
            }
        }
        return tempProp;
    },
    endsWith: function (str, suffix) {
        if (!str || !suffix || typeof str != "string") return false;
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
                intMatch,
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
    })()
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
* FILE: ..\src\filters\ngColumns.js
***********************************************/
ngGridFilters.filter('ngColumns', function () {
    return function (input) {
        return input.filter(function(col) {
            return !col.isAggCol;
        });
    };
});

/***********************************************
* FILE: ..\src\filters\checkmark.js
***********************************************/
ngGridFilters.filter('checkmark', function () {
    return function (input) {
        return input ? '\u2714' : '\u2718';
    };
});

/***********************************************
* FILE: ..\src\services\GridService.js
***********************************************/

ngGridServices.factory('GridService', function () {
    var gridService = {};
    gridService.gridCache = {};
    gridService.eventStorage = {};
    gridService.getIndexOfCache = function() {
        var indx = -1;   
        for (var grid in gridService.gridCache) {
            indx++;
            if (!gridService.gridCache.hasOwnProperty(grid)) continue;
            return indx;
        }
        return indx;
    };
    gridService.StoreGrid = function (element, grid) {
        gridService.gridCache[grid.gridId] = grid;
        element[GRID_KEY] = grid.gridId;
    };
        
    gridService.RemoveGrid = function(gridId) {
        delete gridService.gridCache[gridId];
    };
    
    gridService.GetGrid = function (element) {
        var grid;
        if (element[GRID_KEY]) {
            grid = gridService.gridCache[element[GRID_KEY]];
            return grid;
        }
        return false;
    };
    
    gridService.ClearGridCache = function () {
        gridService.gridCache = {};
    };
    
    gridService.AssignGridEventHandlers = function ($scope, grid) {
        grid.$viewport.scroll(function (e) {
            var scrollLeft = e.target.scrollLeft,
            scrollTop = e.target.scrollTop;
            grid.adjustScrollLeft(scrollLeft);
            grid.adjustScrollTop(scrollTop);
        });
        grid.$viewport.off('keydown');
        grid.$viewport.on('keydown', function (e) {
            return ng.moveSelectionHandler($scope, grid, e);
        });
        //Chrome and firefox both need a tab index so the grid can recieve focus.
        //need to give the grid a tabindex if it doesn't already have one so
        //we'll just give it a tab index of the corresponding gridcache index 
        //that way we'll get the same result every time it is run.
        //configurable within the options.
        if (grid.config.tabIndex === -1){
            grid.$viewport.attr('tabIndex', gridService.getIndexOfCache(grid.gridId));
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
});

/***********************************************
* FILE: ..\src\services\SortService.js
***********************************************/

ngGridServices.factory('SortService', function () {
    var sortService = { };
    sortService.colSortFnCache = {}; // cache of sorting functions. Once we create them, we don't want to keep re-doing it
    sortService.dateRE = /^(\d\d?)[\/\.-](\d\d?)[\/\.-]((\d\d)?\d\d)$/; // nasty regex for date parsing
    // this takes an piece of data from the cell and tries to determine its type and what sorting
    // function to use for it
    // @item - the cell data
    sortService.guessSortFn = function(item) {
        var sortFn, // sorting function that is guessed
            itemType, // the typeof item
            dateParts, // for date parsing
            month, // for date parsing
            day; // for date parsing

        if (item === undefined || item === null || item === '') return null;
        itemType = typeof(item);
        //check for numbers and booleans
        switch (itemType) {
        case "number":
            sortFn = sortService.sortNumber;
            break;
        case "boolean":
            sortFn = sortService.sortBool;
            break;
        }
        //if we found one, return it
        if (sortFn) return sortFn;
        //check if the item is a valid Date
        if (Object.prototype.toString.call(item) === '[object Date]') return sortService.sortDate;
        // if we aren't left with a string, return a basic sorting function...
        if (itemType !== "string") return sortService.basicSort;
        // now lets string check..
        //check if the item data is a valid number
        if (item.match(/^-?[£$¤]?[\d,.]+%?$/)) return sortService.sortNumberStr;
        // check for a date: dd/mm/yyyy or dd/mm/yy
        // can have / or . or - as separator
        // can be mm/dd as well
        dateParts = item.match(sortService.dateRE);
        if (dateParts) {
            // looks like a date
            month = parseInt(dateParts[1]);
            day = parseInt(dateParts[2]);
            if (month > 12) {
                // definitely dd/mm
                return sortService.sortDDMMStr;
            } else if (day > 12) {
                return sortService.sortMMDDStr;
            } else {
                // looks like a date, but we can't tell which, so assume that it's MM/DD
                return sortService.sortMMDDStr;
            }
        }
        //finally just sort the normal string...
        return sortService.sortAlpha;
    };
    //#region Sorting Functions
    sortService.basicSort = function (a, b) {
        if (a == b) return 0;
        if (a < b) return -1;
        return 1;
    };
    sortService.sortNumber = function(a, b) {
        return a - b;
    };
    sortService.sortNumberStr = function(a, b) {
        var numA, numB, badA, badB;
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
    sortService.sortAlpha = function(a, b) {
        var strA = a.toLowerCase(),
            strB = b.toLowerCase();
        return strA == strB ? 0 : (strA < strB ? -1 : 1);
    };
    sortService.sortDate = function(a, b) {
        var timeA = a.getTime(),
            timeB = b.getTime();
        return timeA == timeB ? 0 : (timeA < timeB ? -1 : 1);
    };
    sortService.sortBool = function(a, b) {
        if (a && b) {
            return 0;
        }
        if (!a && !b) {
            return 0;
        } else {
            return a ? 1 : -1;
        }
    };
    sortService.sortDDMMStr = function(a, b) {
        var dateA, dateB, mtch, m, d, y;
        mtch = a.match(sortService.dateRE);
        y = mtch[3];
        m = mtch[2];
        d = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateA = y + m + d;
        mtch = b.match(sortService.dateRE);
        y = mtch[3];
        m = mtch[2];
        d = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateB = y + m + d;
        if (dateA == dateB) return 0;
        if (dateA < dateB) return -1;
        return 1;
    };
    sortService.sortMMDDStr = function(a, b) {
        var dateA, dateB, mtch, m, d, y;
        mtch = a.match(sortService.dateRE);
        y = mtch[3];
        d = mtch[2];
        m = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateA = y + m + d;
        mtch = b.match(dateRE);
        y = mtch[3];
        d = mtch[2];
        m = mtch[1];
        if (m.length == 1) m = '0' + m;
        if (d.length == 1) d = '0' + d;
        dateB = y + m + d;
        if (dateA == dateB) return 0;
        if (dateA < dateB) return -1;
        return 1;
    };
    //#endregion
    // the core sorting logic trigger
    sortService.sortData = function(data /*datasource*/, sortInfo) {
        // first make sure we are even supposed to do work
        if (!data || !sortInfo) {
            return;
        }
        // grab the metadata for the rest of the logic
        var col = sortInfo.column,
            direction = sortInfo.direction,
            sortFn,
            item;

        //see if we already figured out what to use to sort the column
        if (sortService.colSortFnCache[col.field]) {
            sortFn = sortService.colSortFnCache[col.field];
        } else if (col.sortingAlgorithm != undefined) {
            sortFn = col.sortingAlgorithm;
            sortService.colSortFnCache[col.field] = col.sortingAlgorithm;
        } else { // try and guess what sort function to use
            item = data[0];
            sortFn = sortService.guessSortFn(item[col.field]);
            //cache it
            if (sortFn) {
                sortService.colSortFnCache[col.field] = sortFn;
            } else {
                // we assign the alpha sort because anything that is null/undefined will never get passed to
                // the actual sorting function. It will get caught in our null check and returned to be sorted
                // down to the bottom
                sortFn = sortService.sortAlpha;
            }
        }
        //now actually sort the data
        data.sort(function(itemA, itemB) {
            var propA = ng.utils.evalProperty(itemA, col.field);
            var propB = ng.utils.evalProperty(itemB, col.field);
            // we want to force nulls and such to the bottom when we sort... which effectively is "greater than"
            if (!propB && !propA) {
                return 0;
            } else if (!propA) {
                return 1;
            } else if (!propB) {
                return -1;
            }
            //made it this far, we don't have to worry about null & undefined
            if (direction === ASC) {
                return sortFn(propA, propB);
            } else {
                return 0 - sortFn(propA, propB);
            }
        });
        return;
    };
    sortService.Sort = function (sortInfo, data) {
        if (sortService.isSorting) return;
        sortService.isSorting = true;
        sortService.sortData(data, sortInfo);
        sortService.isSorting = false;
    };
    return sortService;
});

/***********************************************
* FILE: ..\src\templates\gridTemplate.js
***********************************************/

ng.defaultGridTemplate = function () {
    var b = new ng.utils.StringBuilder();
    b.append('<div ng-class="{\'ui-widget\': jqueryUITheme}">');
    b.append('	 <div class="ngTopPanel" ng-class="{\'ui-widget-header\':jqueryUITheme, \'ui-corner-top\': jqueryUITheme}" ng-style="topPanelStyle()">');
    b.append('	 	<div class="ngGroupPanel" ng-show="showGroupPanel()" ng-style="headerStyle()">');
	b.append('	 		<div class="ngGroupPanelDescription" ng-show="configGroups.length == 0">Drag a column header here and drop it to group by that column</div>');
	b.append('	 		<ul ng-show="configGroups.length > 0" class="ngGroupList">');
	b.append('	 			<li class="ngGroupItem" ng-repeat="group in configGroups"><span class="ngGroupElement"><span class="ngGroupName">{{group.displayName}}<span ng-click="removeGroup($index)" class="ngRemoveGroup">x</span></span><span ng-hide="$last" class="ngGroupArrow"></span></span></li>');
	b.append('	 		</ul>');
	b.append('	 	</div>');
	b.append('      <div class="ngHeaderContainer" ng-style="headerStyle()">');
	b.append('         <div class="ngHeaderScroller" ng-style="headerScrollerStyle()" ng-header-row></div>');
	b.append('    	</div>');
	b.append('      <div class="ngHeaderButton" ng-show="showColumnMenu || showFilter" ng-click="toggleShowMenu()"><div class="ngHeaderButtonArrow" ng-click=""></div></div>');
	b.append('      <div ng-show="showMenu" class="ngColMenu"><div ng-show="showFilter"><input placeholder="Seach Field:Value" type="text" ng-model="filterText"/></div ng-show="showColumnMenu"><div ng-show="showColumnMenu"><span class="ngMenuText">Choose Columns:</span><ul class="ngColList"><li class="ngColListItem" ng-repeat="col in columns | ngColumns"><label><input type="checkbox" class="ngColListCheckbox" ng-model="col.visible"/> {{col.displayName}}</label></li></ul></div></div>');
	b.append('	 </div>');
	b.append('	 <div class="ngViewport" ng-class="{\'ui-widget-content\': jqueryUITheme}" ng-style="viewportStyle()">');
    b.append('    	 <div class="ngCanvas" ng-style="canvasStyle()">');
    b.append('           <div ng-style="rowStyle(row)" ng-repeat="row in renderedRows" ng-click="row.toggleSelected($event)" class="ngRow" ng-class="{\'selected\': row.selected}" ng-class-odd="row.alternatingRowClass()" ng-class-even="row.alternatingRowClass()" ng-row></div>');
    b.append('       </div>');
    b.append('	 </div>');
    b.append('	 <div class="ngFooterPanel" ng-class="{\'ui-widget-content\': jqueryUITheme, \'ui-corner-bottom\': jqueryUITheme}" ng-style="footerStyle()">');
    b.append('       <div class="ngTotalSelectContainer" ng-show="footerVisible">');
    b.append('           <div class="ngFooterTotalItems" ng-class="{\'ngNoMultiSelect\': !multiSelect}" >');
    b.append('          		 <span class="ngLabel">Total Items: {{maxRows}}</span><span ng-show="filterText.length > 0" class="ngLabel">(Showing Items: {{totalFilteredItemsLength()}})</span>');
    b.append('       	 </div>');
    b.append('       	 <div class="ngFooterSelectedItems" ng-show="multiSelect">');
    b.append('       	    <span class="ngLabel">Selected Items: {{selectedItems.length}}</span>');
    b.append('       	 </div>');
    b.append('       </div>');
    b.append('       <div class="ngPagerContainer" style="float: right; margin-top: 10px;" ng-show="footerVisible && enablePaging" ng-class="{\'ngNoMultiSelect\': !multiSelect}">');
    b.append('          <div style="float:left; margin-right: 10px;" class="ngRowCountPicker">');
    b.append('             <span style="float: left; margin-top: 3px;" class="ngLabel">Page Size:</span>');
    b.append('             <select style="float: left;height: 27px; width: 100px" ng-model="pagingOptions.pageSize" >');
    b.append('                <option ng-repeat="size in pagingOptions.pageSizes">{{size}}</option>');
    b.append('             </select>');
    b.append('          </div>');
    b.append('          <div style="float:left; margin-right: 10px; line-height:25px;" class="ngPagerControl" style="float: left; min-width: 135px;">');
    b.append('             <button class="ngPagerButton" ng-click="pageToFirst()" ng-disabled="cantPageBackward()" title="First Page"><div class="ngPagerFirstTriangle"><div class="ngPagerFirstBar"></div></div></button>');
    b.append('             <button class="ngPagerButton" ng-click="pageBackward()" ng-disabled="cantPageBackward()" title="Previous Page"><div class="ngPagerFirstTriangle ngPagerPrevTriangle"></div></button>');
    b.append('             <input class="ngPagerCurrent" type="text" style="width:50px; height: 24px; margin-top: 1px; padding: 0px 4px;" ng-model="pagingOptions.currentPage"/>');
    b.append('             <button class="ngPagerButton" ng-click="pageForward()" ng-disabled="cantPageForward()" title="Next Page"><div class="ngPagerLastTriangle ngPagerNextTriangle"></div></button>');
    b.append('             <button class="ngPagerButton" ng-click="pageToLast()" ng-disabled="cantPageForward()" title="Last Page"><div class="ngPagerLastTriangle"><div class="ngPagerLastBar"></div></div></button>');
    b.append('          </div>');
    b.append('       </div>');
    b.append('   </div>');
    b.append('</div>');
    return b.toString();
};

/***********************************************
* FILE: ..\src\templates\rowTemplate.js
***********************************************/

ng.defaultRowTemplate = function () {
    return '<div ng-repeat="col in visibleColumns()" class="ngCell col{{$index}} {{col.cellClass}}" ng-class="{\'ui-widget-content\':jqueryUITheme}" ng-cell></div>';
};

/***********************************************
* FILE: ..\src\templates\aggregateTemplate.js
***********************************************/

ng.aggregateTemplate = function () {
    return '<div ng-click="row.toggleExpand()" ng-style="{ \'left\': row.offsetleft}" class="ngAggregate"><span class="ngAggregateText">{{row.label CUSTOM_FILTERS}} ({{row.totalChildren()}} items)</span><div class="{{row.aggClass()}}"></div></div>';
};

/***********************************************
* FILE: ..\src\templates\headerRowTemplate.js
***********************************************/

ng.defaultHeaderRowTemplate = function () {
    return '<div ng-repeat="col in visibleColumns()" class="ngHeaderCell col{{$index}}" ng-header-cell><div>';
};

/***********************************************
* FILE: ..\src\templates\headerCellTemplate.js
***********************************************/

ng.defaultHeaderCellTemplate = function () {
    var b = new ng.utils.StringBuilder();
    b.append('<div ng-click="col.sort()" class="ngHeaderSortColumn" ng-class="{ \'ngSorted\': !noSortVisible }">');
    b.append('   <div class="ngHeaderText colt{{$index}}">{{col.displayName}}</div>');
    b.append('   <div class="ngSortButtonDown" ng-show="col.showSortButtonDown()"></div>');
    b.append('   <div class="ngSortButtonUp" ng-show="col.showSortButtonUp()"></div>');
    b.append('</div>');
    b.append('<div ng-show="col.allowResize" class="ngHeaderGrip" ng-click="col.gripClick($event)" ng-mousedown="col.gripOnMouseDown($event)"></div>');
    return b.toString();
};

/***********************************************
* FILE: ..\src\classes\aggregate.js
***********************************************/

ng.Aggregate = function (aggEntity, rowFactory) {
    var self = this;
    self.index = 0;
    self.offsetTop = 0;
    self.entity = aggEntity;
    self.label = aggEntity.gLabel;
    self.field = aggEntity.gField;
    self.depth = aggEntity.gDepth;
    self.parent = aggEntity.parent;
    self.children = aggEntity.children;
    self.aggChildren = aggEntity.aggChildren;
    self.aggIndex = aggEntity.aggIndex;
    self.collapsed = true;
    self.isAggRow = true;
    self.offsetleft = aggEntity.gDepth * 25;
    self.aggLabelFilter = aggEntity.aggLabelFilter;
    self.toggleExpand = function() {
        self.collapsed = self.collapsed ? false : true;
        self.notifyChildren();
    };
    self.setExpand = function (state) {
        self.collapsed = state;
        self.notifyChildren();
    };
    self.notifyChildren = function() {
        angular.forEach(self.aggChildren, function(child) {
            child.entity[NG_HIDDEN] = self.collapsed;
            if (self.collapsed) {
                child.setExpand(self.collapsed);
            }
        });
        angular.forEach(self.children, function(child) {
            child[NG_HIDDEN] = self.collapsed;
        });
        rowFactory.rowCache = [];
        var foundMyself = false;
        angular.forEach(rowFactory.aggCache, function(agg, i) {
            if (foundMyself) {
                var offset = (30 * self.children.length);
                agg.offsetTop = self.collapsed ? agg.offsetTop - offset : agg.offsetTop + offset;
            } else {
                if (i == self.aggIndex) {
                    foundMyself = true;
                }
            }
        });
        rowFactory.renderedChange();
    };
    self.aggClass = function() {
        return self.collapsed ? "ngAggArrowCollapsed" : "ngAggArrowExpanded";
    };
    self.totalChildren = function() {
        if (self.aggChildren.length > 0) {
            var i = 0;
            var recurse = function (cur) {
                if (cur.aggChildren.length > 0) {
                    angular.forEach(cur.aggChildren, function (a) {
                        recurse(a);
                    });
                } else {
                    i += cur.children.length;
                }
            };
            recurse(self);
            return i;
        } else {
            return self.children.length;
        }
    };
}; 

/***********************************************
* FILE: ..\src\classes\aggregateProvider.js
***********************************************/
ng.AggregateProvider = function (grid, $scope, gridService) {

    var self = this;
    // The init method gets called during the ng-grid directive execution.

    self.colToMove = undefined;
	self.groupToMove = undefined;
    self.assignEvents = function () {
        // Here we set the onmousedown event handler to the header container.
		if(grid.config.jqueryUIDraggable){
			grid.$groupPanel.droppable({
				addClasses: false,
				drop: function(event) {
					self.onGroupDrop(event);
				}
			});
			$(document).ready(self.setDraggables);	
		} else {
			grid.$groupPanel.on('mousedown', self.onGroupMouseDown).on('dragover', self.dragOver).on('drop', self.onGroupDrop);
			grid.$headerScroller.on('mousedown', self.onHeaderMouseDown).on('dragover', self.dragOver).on('drop', self.onHeaderDrop);
			if (grid.config.enableRowRerodering) {
				grid.$viewport.on('mousedown', self.onRowMouseDown).on('dragover', self.dragOver).on('drop', self.onRowDrop);
			}
		}
		$scope.$watch('columns', self.setDraggables, true);	
		
    };
    self.dragOver = function(evt) {
        evt.preventDefault();
    };	
	
	//For JQueryUI
	self.setDraggables = function(){
		if(!grid.config.jqueryUIDraggable){	
			$('.ngHeaderSortColumn').attr('draggable', 'true').on('dragstart', self.onHeaderDragStart).on('dragend', self.onHeaderDragStop);
		} else {
			$('.ngHeaderSortColumn').draggable({
				helper: "clone",
				appendTo: 'body',
				addClasses: false,
				start: function(event){
					self.onHeaderMouseDown(event);
				}
			}).droppable({
				drop: function(event) {
					self.onHeaderDrop(event);
				}
			});
		}
	};
    
    self.onGroupDragStart = function () {
        // color the header so we know what we are moving
        if (self.groupToMove) {
            self.groupToMove.header.css('background-color', 'rgb(255, 255, 204)');
        }
    };	
    
    self.onGroupDragStop = function () {
        // Set the column to move header color back to normal
        if (self.groupToMove) {
            self.groupToMove.header.css('background-color', 'rgb(247,247,247)');
        }
    };

    self.onGroupMouseDown = function(event) {
        var groupItem = $(event.target);
        // Get the scope from the header container
		if(groupItem[0].className != 'ngRemoveGroup'){
			var groupItemScope = angular.element(groupItem).scope();
			if (groupItemScope) {
				// set draggable events
				if(!grid.config.jqueryUIDraggable){
					groupItem.attr('draggable', 'true');
					groupItem.on('dragstart', self.onGroupDragStart).on('dragend', self.onGroupDragStop);
				}
				// Save the column for later.
				self.groupToMove = { header: groupItem, groupName: groupItemScope.group, index: groupItemScope.$index };
			}
		} else {
			self.groupToMove = undefined;
		}
    };

    self.onGroupDrop = function(event) {
        // clear out the colToMove object
        var groupContainer;
        var groupScope;
        if (self.groupToMove) {
			self.onGroupDragStop();
            // Get the closest header to where we dropped
            groupContainer = $(event.target).closest('.ngGroupElement'); // Get the scope from the header.
            if (groupContainer.context.className == 'ngGroupPanel') {
                $scope.configGroups.splice(self.groupToMove.index, 1);
                $scope.configGroups.push(self.groupToMove.groupName);
            } else {
                groupScope = angular.element(groupContainer).scope();
                if (groupScope) {
                    // If we have the same column, do nothing.
                    if (self.groupToMove.index != groupScope.$index){
						// Splice the columns
						$scope.configGroups.splice(self.groupToMove.index, 1);
						$scope.configGroups.splice(groupScope.$index, 0, self.groupToMove.groupName);
					}
                }
            }			
			self.groupToMove = undefined;
        } else {	
			self.onHeaderDragStop();
            if ($scope.configGroups.indexOf(self.colToMove.col) == -1) {
                groupContainer = $(event.target).closest('.ngGroupElement'); // Get the scope from the header.
				if (groupContainer.context.className == 'ngGroupPanel' || groupContainer.context.className == 'ngGroupPanelDescription') {
					$scope.configGroups.push(self.colToMove.col);
				} else {
				    groupScope = angular.element(groupContainer).scope();
				    if (groupScope) {
						// Splice the columns
						$scope.configGroups.splice(groupScope.$index + 1, 0, self.colToMove.col);
					}
				}	
            }			
			self.colToMove = undefined;
        }
        $scope.$apply();
    };
	
    //Header functions
    self.onHeaderMouseDown = function (event) {
        // Get the closest header container from where we clicked.
        var headerContainer = $(event.target).closest('.ngHeaderSortColumn');
        // Get the scope from the header container
        var headerScope = angular.element(headerContainer).scope();
        if (headerScope) {
            // Save the column for later.
            self.colToMove = { header: headerContainer, col: headerScope.col };
        }
    };
    
    self.onHeaderDragStart = function () {
        // color the header so we know what we are moving
        if (self.colToMove) {
            self.colToMove.header.css('background-color', 'rgb(255, 255, 204)');
        }
    };
    
    self.onHeaderDragStop = function () {
        // Set the column to move header color back to normal
        if (self.colToMove) {
            self.colToMove.header.css('background-color', 'rgb(234, 234, 234)');
        }
    };

    self.onHeaderDrop = function (event) {
        if (!self.colToMove) return;
        self.onHeaderDragStop();
        // Get the closest header to where we dropped
        var headerContainer = $(event.target).closest('.ngHeaderSortColumn');
        // Get the scope from the header.
        var headerScope = angular.element(headerContainer).scope();
        if (headerScope) {
            // If we have the same column, do nothing.
            if (self.colToMove.col == headerScope.col) return;
            // Splice the columns
            $scope.columns.splice(self.colToMove.col.index, 1);
            $scope.columns.splice(headerScope.col.index, 0, self.colToMove.col);
            grid.fixColumnIndexes();
            // Finally, rebuild the CSS styles.
            grid.cssBuilder.buildStyles(true);
            // clear out the colToMove object
            self.colToMove = undefined;
        }
    };
    
    // Row functions
    self.onRowMouseDown = function (event) {
        // Get the closest row element from where we clicked.
        var targetRow = $(event.target).closest('.ngRow');
        // Get the scope from the row element
        var rowScope = angular.element(targetRow).scope();
        if (rowScope) {
            // set draggable events
            targetRow.attr('draggable', 'true');
            // Save the row for later.
            gridService.eventStorage.rowToMove = { targetRow: targetRow, scope: rowScope };
        }
    };

    self.onRowDrop = function (event) {
        // Get the closest row to where we dropped
        var targetRow = $(event.target).closest('.ngRow');
        // Get the scope from the row element.
        var rowScope = angular.element(targetRow).scope();
        if (rowScope) {
            // If we have the same Row, do nothing.
            var prevRow = gridService.eventStorage.rowToMove;
            if (prevRow.scope.row == rowScope.row) return;
            // Splice the Rows via the actual datasource
            var i = grid.sortedData.indexOf(prevRow.scope.row.entity);
            var j = grid.sortedData.indexOf(rowScope.row.entity);
            grid.sortedData.splice(i, 1);
            grid.sortedData.splice(j, 0, prevRow.scope.row.entity);
            grid.searchProvider.evalFilter();
            // clear out the rowToMove object
            gridService.eventStorage.rowToMove = undefined;
            // if there isn't an apply already in progress lets start one
        }
    };
    // In this example we want to assign grid events.
    self.assignEvents();
};

/***********************************************
* FILE: ..\src\classes\column.js
***********************************************/
ng.Column = function (config) {
    var self = this,
        colDef = config.colDef;
    
    self.width = colDef.width;
    self.widthIsConfigured = false;
    self.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
    self.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;
    self.headerRowHeight = config.headerRowHeight;
    self.widthWatcher = null;
    self.isAggCol = config.isAggCol;
    self.field = colDef.field;
    self.aggLabelFilter = colDef.cellFilter || colDef.aggLabelFilter;
    self.visible = colDef.visible == undefined ? true : colDef.visible;
    self.toggleVisible = function() {
        self.visible = !self.visible;
    };
    if (!colDef.displayName) {
        // Allow empty column names -- do not check for empty string
        colDef.displayName = colDef.field;
    }
    self.displayName = colDef.displayName;
    self.index = config.index;

    //sorting
    if (colDef.sortable === undefined || colDef.sortable === null) {
        colDef.sortable = true;
    }

    //resizing
    if (colDef.resizable === undefined || colDef.resizable === null) {
        colDef.resizable = true;
    }

    self.allowSort = colDef.sortable;
    self.allowResize = config.enableResize ? colDef.resizable : false;
    
    self.sortDirection = undefined;
    self.sortingAlgorithm = colDef.sortFn;

    //cell Template
    self.cellTemplate = function() {
        return colDef.cellTemplate || '<div class="ngCellText colt{{$index}}">{{row.getProperty(col.field) CUSTOM_FILTERS}}</div>'.replace(CUSTOM_FILTERS, self.cellFilter);
    };
    self.hasCellTemplate = (self.cellTemplate ? true : false);

    self.cellClass = colDef.cellClass;
    self.cellFilter = colDef.cellFilter ? "|" + colDef.cellFilter : "";
    self.headerClass = colDef.headerClass;

    self.headerCellTemplate = function() {
        return colDef.headerCellTemplate || ng.defaultHeaderCellTemplate();
    };
    
    self.showSortButtonUp = function () {
        return self.allowSort ? self.sortDirection === DESC : self.allowSort;
    };
    self.showSortButtonDown = function () {
        return self.allowSort ? self.sortDirection === ASC : self.allowSort;
    };    
  
    self.noSortVisible = function () {
        return !self.sortDirection;
    };

    self.sort = function () {
        if (!self.allowSort) {
            return; // column sorting is disabled, do nothing
        }
        var dir = self.sortDirection === ASC ? DESC : ASC;
        self.sortDirection = dir;
        config.sortCallback(self, dir);
    };
    var delay = 500,
        clicks = 0,
        timer = null;
    
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
            config.cssBuilder.buildStyles(true);
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
        config.cssBuilder.buildStyles();
        return false;
    };
    self.gripOnMouseUp = function () {
        $(document).off('mousemove');
        $(document).off('mouseup');
        document.body.style.cursor = 'default';
        config.cssBuilder.apply();
        return false;
    };
};

/***********************************************
* FILE: ..\src\classes\dimension.js
***********************************************/
ng.Dimension = function (options) {
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
ng.Footer = function ($scope, grid) {
    $scope.maxRows = Math.max($scope.pagingOptions.totalServerItems || grid.sortedData.length, 1);
    
    $scope.multiSelect = (grid.config.canSelectRows && grid.config.multiSelect);
    $scope.selectedItemCount = grid.selectedItemCount;
    $scope.maxPages = function () {
        $scope.maxRows = Math.max($scope.pagingOptions.totalServerItems || grid.sortedData.length, 1);
        return Math.ceil($scope.maxRows / $scope.pagingOptions.pageSize);
    };

    $scope.pageForward = function() {
        var page = $scope.pagingOptions.currentPage;
        $scope.pagingOptions.currentPage = Math.min(page + 1, $scope.maxPages());
    };

    $scope.pageBackward = function () {
        var page = $scope.pagingOptions.currentPage;
        $scope.pagingOptions.currentPage = Math.max(page - 1, 1);
    };

    $scope.pageToFirst = function () {
        $scope.pagingOptions.currentPage = 1;
    };

    $scope.pageToLast = function () {
        var maxPages = $scope.maxPages();
        $scope.pagingOptions.currentPage = maxPages;
    };

    $scope.cantPageForward = function () {
        var curPage = $scope.pagingOptions.currentPage;
        var maxPages = $scope.maxPages();
        return !(curPage < maxPages);
    };

    $scope.cantPageBackward = function () {
        var curPage = $scope.pagingOptions.currentPage;
        return !(curPage > 1);
    };
};

/***********************************************
* FILE: ..\src\classes\rowFactory.js
***********************************************/
ng.RowFactory = function (grid, $scope) {
    var self = this;
    // we cache rows when they are built, and then blow the cache away when sorting
    self.rowCache = [];
    self.aggCache = {};
    self.parentCache = []; // Used for grouping and is cleared each time groups are calulated.
    self.dataChanged = true;
    self.parsedData = [];
    self.rowConfig = {};
    self.selectionService = grid.selectionService;
    self.rowHeight = 30;
    self.numberOfAggregates = 0;
    self.groupedData = undefined;
    self.rowHeight = grid.config.rowHeight;
    self.rowConfig = {
        canSelectRows: grid.config.canSelectRows,
        rowClasses: grid.config.rowClasses,
        selectedItems: grid.config.selectedItems,
        selectWithCheckboxOnly: grid.config.selectWithCheckboxOnly,
        beforeSelectionChangeCallback: grid.config.beforeSelectionChange,
        afterSelectionChangeCallback: grid.config.afterSelectionChange
    };
    
    self.renderedRange = new ng.Range(0, grid.minRowsToRender() + EXCESS_ROWS);
    // Builds rows for each data item in the 'filteredData'
    // @entity - the data item
    // @rowIndex - the index of the row
    self.buildEntityRow = function (entity, rowIndex, pagingOffset) {
        var row = self.rowCache[rowIndex]; // first check to see if we've already built it
        if (!row) {
            // build the row
            row = new ng.Row(entity, self.rowConfig, self.selectionService);
            row.rowIndex = rowIndex + 1; //not a zero-based rowIndex
            row.rowDisplayIndex = row.rowIndex + pagingOffset;
            row.offsetTop = self.rowHeight * rowIndex;
            row.selected = entity[SELECTED_PROP];
            // finally cache it for the next round
            self.rowCache[rowIndex] = row;
        }
        // store the row's index on the entity for future ref
        entity[ROW_KEY] = rowIndex;
        return row;
    };

    self.buildAggregateRow = function (aggEntity, rowIndex) {
        var agg = self.aggCache[aggEntity.aggIndex]; // first check to see if we've already built it 
        if (!agg) {
            // build the row
            agg = new ng.Aggregate(aggEntity, self);
            self.aggCache[aggEntity.aggIndex] = agg;
        }
        agg.index = rowIndex + 1; //not a zero-based rowIndex
        agg.offsetTop = self.rowHeight * rowIndex;
        // finally cache it for the next round
        // store the row's index on the entity for future ref
        aggEntity[ROW_KEY] = rowIndex;
        return agg;
    };
    self.UpdateViewableRange = function (newRange) {
        self.prevViewableRange = self.renderedRange;
        self.renderedRange = newRange;
        self.renderedChange();
    };
    self.filteredDataChanged = function () {
        // check for latebound autogenerated columns
        if (grid.lateBoundColumns && grid.filteredData.length > 1) {
            grid.config.columnDefs = undefined;
            grid.buildColumns();
            grid.lateBoundColumns = false;
        }
        self.dataChanged = true;
        self.rowCache = []; //if data source changes, kill this!
        self.selectionService.toggleSelectAll(false);
        if (grid.config.groups.length > 0) {
            self.getGrouping(grid.config.groups);
        }
        self.UpdateViewableRange(self.renderedRange);
    };

    self.renderedChange = function () {
        if (!self.groupedData || grid.config.groups.length < 1) {
            self.renderedChangeNoGroups();
            grid.refreshDomSizes();
            return;
        }
        self.parentCache = [];
        var rowArr = [];
        var dataArray = self.parsedData.filter(function (e) {
             return e[NG_HIDDEN] === false;
        }).slice(self.renderedRange.bottomRow, self.renderedRange.topRow);
        angular.forEach(dataArray, function (item, indx) {
            var row;
            if (item.isAggRow) {
                row = self.buildAggregateRow(item, self.renderedRange.bottomRow + indx);
            } else {
                row = self.buildEntityRow(item, self.renderedRange.bottomRow + indx);
            }
            //add the row to our return array
            rowArr.push(row);
        });
        grid.setRenderedRows(rowArr);
        grid.refreshDomSizes();
    };

    self.renderedChangeNoGroups = function () {
        var rowArr = [];
        var pagingOffset = ($scope.pagingOptions.pageSize * ($scope.pagingOptions.currentPage - 1));
        var dataArr = grid.filteredData.slice(self.renderedRange.bottomRow, self.renderedRange.topRow);
        angular.forEach(dataArr, function (item, i) {
            var row = self.buildEntityRow(item, self.renderedRange.bottomRow + i, pagingOffset);
            //add the row to our return array
            rowArr.push(row);
        });
        grid.setRenderedRows(rowArr);
    };
    
    //magical recursion. it works. I swear it. I figured it out in the shower one day.
    self.parseGroupData = function (g) {
        if (g.values) {
            angular.forEach(g.values, function (item) {
                // get the last parent in the array because that's where our children want to be
                self.parentCache[self.parentCache.length - 1].children.push(item);
                //add the row to our return array
                self.parsedData.push(item);
            });
        } else {
            for (var prop in g) {
                // exclude the meta properties.
                if (prop == NG_FIELD || prop == NG_DEPTH || prop == NG_COLUMN) {
                    continue;
                } else if (g.hasOwnProperty(prop)) {
                    //build the aggregate row
                    var agg = self.buildAggregateRow({
                        gField: g[NG_FIELD],
                        gLabel: prop,
                        gDepth: g[NG_DEPTH],
                        isAggRow: true,
                        '_ng_hidden_': false,
                        children: [],
                        aggChildren: [],
                        aggIndex: self.numberOfAggregates++,
                        aggLabelFilter: g[NG_COLUMN].aggLabelFilter
                    }, 0);
                    //set the aggregate parent to the parent in the array that is one less deep.
                    agg.parent = self.parentCache[agg.depth - 1];
                    // if we have a parent, set the parent to not be collapsed and append the current agg to its children
                    if (agg.parent) {
                        agg.parent.collapsed = false;
                        agg.parent.aggChildren.push(agg);
                    }
                    // add the aggregate row to the parsed data.
                    self.parsedData.push(agg.entity);
                    // the current aggregate now the parent of the current depth
                    self.parentCache[agg.depth] = agg;
                    // dig deeper for more aggregates or children.
                    self.parseGroupData(g[prop]);
                }
            }
        }
    };
    //Shuffle the data into their respective groupings.
    self.getGrouping = function (groups) {
        self.aggCache = [];
        self.rowCache = [];
        self.numberOfAggregates = 0;
        self.groupedData = {};
        // Here we set the onmousedown event handler to the header container.
        var data = grid.filteredData;
        var maxDepth = groups.length;
        var cols = $scope.columns;

        angular.forEach(data, function (item) {
            item[NG_HIDDEN] = true;
            var ptr = self.groupedData;
            angular.forEach(groups, function (group, depth) {
                if (!cols[depth].isAggCol && depth <= maxDepth) {
                    cols.splice(item.gDepth, 0, new ng.Column({
                        colDef: {
                            field: '',
                            width: 25,
                            sortable: false,
                            resizable: false,
                            headerCellTemplate: '<div class="ngAggHeader"></div>',
                        },
                        isAggCol: true,
                        index: item.gDepth,
                        headerRowHeight: grid.config.headerRowHeight
                    }));
                }
                var col = cols.filter(function (c) { return c.field == group; })[0];
                var val = ng.utils.evalProperty(item, group).toString();
                if (!ptr[val]) ptr[val] = {};
                if (!ptr[NG_FIELD]) ptr[NG_FIELD] = group;
                if (!ptr[NG_DEPTH]) ptr[NG_DEPTH] = depth;
                if (!ptr[NG_COLUMN]) ptr[NG_COLUMN] = col;
                ptr = ptr[val];
            });
            if (!ptr.values) ptr.values = [];
            ptr.values.push(item);
        });
        grid.fixColumnIndexes();
        self.parsedData.length = 0;
        self.parseGroupData(self.groupedData);
    };

    if (grid.config.groups.length > 0 && grid.filteredData.length > 0) {
        self.getGrouping(grid.config.groups);
    }
}

/***********************************************
* FILE: ..\src\classes\grid.js
***********************************************/

ng.Grid = function ($scope, options, gridDim, sortService) {
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
        self.cssBuilder.buildStyles(true);
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
                    cssBuilder: self.cssBuilder,
                    enableResize: self.config.enableColumnResize
                });
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
        self.sortService = sortService;
        self.searchProvider = new ng.SearchProvider($scope, self);
        self.styleProvider = new ng.StyleProvider($scope, self);
        self.cssBuilder = new ng.CssBuilder($scope, self);
        self.buildColumns();
        self.sortService.columns = $scope.columns,
        $scope.$watch('sortInfo', self.sortService.updateSortInfo);
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
            self.cssBuilder.buildStyles(true);
        }, true);
        self.maxCanvasHt = self.calcMaxCanvasHeight();
        self.cssBuilder.buildStyles(true);
        $scope.initPhase = 1;
    };
    self.update = function () {
        var updater = function () {
            self.refreshDomSizes();
            self.cssBuilder.buildStyles(true);
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
        self.cssBuilder.buildStyles(true);
    };
    self.sortData = function(col, direction) {
        sortInfo = {
            column: col,
            direction: direction
        };
        self.clearSortingData(col);
        self.sortService.Sort(sortInfo, self.sortedData);
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

    $scope.removeGroup = function(index) {
        $scope.columns.splice(index, 1);
        $scope.configGroups.splice(index, 1);
        if ($scope.configGroups.length == 0) {
            self.fixColumnIndexes();
            self.cssBuilder.apply();
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
                    col.width = (col.displayName.length * ng.domUtility.letterW) + 30;
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

/***********************************************
* FILE: ..\src\classes\headerRow.js
***********************************************/
ng.HeaderRow = function () {
    this.headerCells = [];
    this.height = null;
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

ng.Row = function (entity, config, selectionService) {
    var self = this, // constant for the selection property that we add to each data item
        canSelectRows = config.canSelectRows;

    self.rowClasses = config.rowClasses;
    self.selectedItems = config.selectedItems;
    self.entity = entity;
    self.selectionService = selectionService;
    //selectify the entity
    if (self.entity[SELECTED_PROP] === undefined) {
        self.entity[SELECTED_PROP] = false;
    }
    self.selected = false;

    self.toggleSelected = function (event) {
        if (!canSelectRows) {
            return true;
        }
        var element = event.target || event;
        //check and make sure its not the bubbling up of our checked 'click' event 
        if (element.type == "checkbox" && element.parentElement.className != "ngSelectionCell ng-scope") {
            return true;
        } 
        if (config.selectWithCheckboxOnly && element.type != "checkbox"){
            return true;
        } else {
            if (self.beforeSelectionChange(self)) {
                self.selectionService.ChangeSelection(self, event);
                return self.afterSelectionChange();
            }
        }
        return false;
    };
    self.rowIndex = 0;
    self.offsetTop = 0;
    self.rowKey = ng.utils.newId();
    self.rowDisplayIndex = 0;
    self.alternatingRowClass = function () {
        if (self.rowIndex % 2 == 0)
            return "even";
		return "odd";
    };
    self.beforeSelectionChange = config.beforeSelectionChangeCallback;
    self.afterSelectionChange = config.afterSelectionChangeCallback;
    self.propertyCache = {};
    self.getProperty = function (path) {
        return self.propertyCache[path] || ng.utils.evalProperty(self.entity, path);
    };
}; 

/***********************************************
* FILE: ..\src\classes\searchProvider.js
***********************************************/
ng.SearchProvider = function ($scope, grid) {
    var self = this;
    self.field = "";
    self.value = "";
    self.extFilter = grid.config.filterOptions.useExternalFilter;
    $scope.showFilter = grid.config.showFilter;
    $scope.filterText = grid.config.filterOptions.filterText;
    
    self.fieldMap = {};
    
    self.evalFilter = function () {
        var ft = $scope.filterText.toLowerCase();
        var v = self.value;
        grid.filteredData = grid.sortedData.filter(function (item) {
            if (!$scope.filterText) {
                return true;
            } else if (!self.field) {
                return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
            } else if (item[self.field] && self.value) {
                return item[self.field].toString().toLowerCase().indexOf(v) != -1;
            } else if (item[self.fieldMap[self.field]] && self.value) {
                return item[self.fieldMap[self.field]].toString().toLowerCase().indexOf(v) != -1;
            }
            return true;
        });
        grid.rowFactory.filteredDataChanged();
    };
    $scope.$watch('filterText', function (a) {
        grid.config.filterOptions.filterText = a;
        if (self.extFilter) return;
        self.premise = a.split(':');
        if (self.premise.length > 1) {
            self.field = self.premise[0].toLowerCase().replace(' ', '_');
            self.value = self.premise[1].toLowerCase();
        } else {
            self.field = "";
            self.value = self.premise[0].toLowerCase();
        }
        self.evalFilter();
    });
    if (!self.extFilter) {
        $scope.$watch('columns', function (a) {
            angular.forEach(a, function (col) {
                self.fieldMap[col.displayName.toLowerCase().replace(' ', '_')] = col.field;
            });
        });
    }
}

/***********************************************
* FILE: ..\src\classes\selectionService.js
***********************************************/
ng.SelectionService = function (grid) {
    var self = this;
    self.multi = grid.config.multiSelect;
    self.selectedItems = grid.config.selectedItems;
    self.selectedIndex = grid.config.selectedIndex;
    self.lastClickedRow = undefined;
    self.ignoreSelectedItemChanges = false; // flag to prevent circular event loops keeping single-select var in sync

    self.rowFactory = {};
	self.Initialize = function (rowFactory) {
        self.rowFactory = rowFactory;
    };
		
	// function to manage the selection action of a data item (entity)
	self.ChangeSelection = function (rowItem, evt) {
	    if (!self.multi) {
	        if (self.lastClickedRow && self.lastClickedRow.selected) {
	            self.setSelection(self.lastClickedRow, false);
	        }
	    } else if (evt && evt.shiftKey) {
            if (self.lastClickedRow) {
                var thisIndx = ng.utils.arrayIndexOf(grid.filteredData, rowItem.entity);
                var prevIndx = ng.utils.arrayIndexOf(grid.filteredData, self.lastClickedRow.entity);
                if (thisIndx == prevIndx) return false;
                prevIndx++;
                if (thisIndx < prevIndx) {
                    thisIndx = thisIndx ^ prevIndx;
                    prevIndx = thisIndx ^ prevIndx;
                    thisIndx = thisIndx ^ prevIndx;
                }
                for (; prevIndx <= thisIndx; prevIndx++) {
                    self.setSelection(self.rowFactory.rowCache[prevIndx], self.lastClickedRow.selected);
                }
                self.lastClickedRow = rowItem;
                return true;
            }
	    }
	    if (grid.config.keepLastSelected && !self.multi) {
	        self.setSelection(rowItem, true);
	    } else {
	        self.setSelection(rowItem, rowItem.selected ? false : true);
	    }
	    
	    self.lastClickedRow = rowItem;
        return true;
    };

    // just call this func and hand it the rowItem you want to select (or de-select)    
    self.setSelection = function(rowItem, isSelected) {
        rowItem.selected = isSelected ;
        rowItem.entity[SELECTED_PROP] = isSelected;
        if (!isSelected) {
            var indx = self.selectedItems.indexOf(rowItem.entity);
            self.selectedItems.splice(indx, 1);
        } else {
            if (self.selectedItems.indexOf(rowItem.entity) === -1) {
                self.selectedItems.push(rowItem.entity);
            }
        }
    };
    
    // @return - boolean indicating if all items are selected or not
    // @val - boolean indicating whether to select all/de-select all
    self.toggleSelectAll = function (checkAll) {
        var selectedlength = self.selectedItems.length;
        if (selectedlength > 0) {
            self.selectedItems.splice(0, selectedlength);
        }
        angular.forEach(grid.filteredData, function (item) {
            item[SELECTED_PROP] = checkAll;
            if (checkAll) {
                self.selectedItems.push(item);
            }
        });
        angular.forEach(self.rowFactory.rowCache, function (row) {
            row.selected = checkAll;
        });
    };
};

/***********************************************
* FILE: ..\src\classes\styleProvider.js
***********************************************/
ng.StyleProvider = function ($scope, grid) {
    $scope.topPanelStyle = function () {
        return { "height": $scope.topPanelHeight() + "px" };
    };
    $scope.headerCellStyle = function (col) {
        return { "height": col.headerRowHeight + "px" };
    };
    $scope.rowStyle = function (row) {
        return { "top": row.offsetTop + "px", "height": $scope.rowHeight + "px" };
    };
    $scope.canvasStyle = function () {
        return { "height": grid.maxCanvasHt.toString() + "px" };
    };
    $scope.headerScrollerStyle = function () {
        return { "height": grid.config.headerRowHeight + "px" };
    };
    $scope.topPanelStyle = function () {
        return { "width": $scope.rootDim.outerWidth + "px", "height": $scope.topPanelHeight() + "px" };
    };
    $scope.headerStyle = function () {
        return { "width": ($scope.rootDim.outerWidth) + "px", "height": grid.config.headerRowHeight + "px" };
    };
    $scope.viewportStyle = function () {
        return { "width": $scope.rootDim.outerWidth + "px", "height": $scope.viewportDimHeight() + "px" };
    };
    $scope.footerStyle = function () {
        return { "width": $scope.rootDim.outerWidth + "px", "height": grid.config.footerRowHeight + "px" };
    };
}

/***********************************************
* FILE: ..\src\domManipulation\cssBuilder.js
***********************************************/

ng.CssBuilder = function ($scope, grid) {
    var self = this;
    self.buildStyles = function(apply) {
        var rowHeight = (grid.config.rowHeight - grid.elementDims.rowHdiff),
            headerRowHeight = grid.config.headerRowHeight,
            $style = grid.$styleSheet,
            gridId = grid.gridId,
            css = new ng.utils.StringBuilder(),
            cols = $scope.visibleColumns(),
            sumWidth = 0;
        
        if (!$style) $style = $("<style type='text/css' rel='stylesheet' />").appendTo($('html'));
        $style.empty();
        var trw = $scope.totalRowWidth();
        css.append(".{0} .ngCanvas { width: {1}px; }", gridId, trw);
        css.append(".{0} .ngRow { width: {1}px; }", gridId, trw);
        css.append(".{0} .ngCell { height: {1}px; }", gridId, rowHeight);
        css.append(".{0} .ngCanvas { width: {1}px; }", gridId, trw);
        css.append(".{0} .ngHeaderCell { top: 0; bottom: 0; }", gridId, headerRowHeight);
        css.append(".{0} .ngHeaderScroller { line-height: {1}px; width: {2}px}", gridId, headerRowHeight, (trw + ng.domUtility.scrollH + 2));
        angular.forEach(cols, function(col, i) {
            css.append(".{0} .col{1} { width: {2}px; left: {3}px; right: {4}px; height: {5}px }", gridId, i, col.width, sumWidth, (trw - sumWidth - col.width), rowHeight);
            css.append(".{0} .colt{1} { width: {2}px; }", gridId, i, col.width);
            sumWidth += col.width;
        });
        if (ng.utils.isIe) { // IE
            $style[0].styleSheet.cssText = css.toString(" ");
        } else {
            $style[0].appendChild(document.createTextNode(css.toString(" ")));
        }
        grid.$styleSheet = $style;
        if (apply) self.apply();
    };
    self.apply = function() {
        if (!$scope.$$phase) {
            $scope.$digest();
        }
    };
};

/***********************************************
* FILE: ..\src\domManipulation\domUtility.js
***********************************************/

ng.domUtility = (new function () {
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
        grid.$topPanel = grid.$root.find(".ngTopPanel");
        grid.$groupPanel = grid.$root.find(".ngGroupPanel");
        grid.$headerContainer = grid.$topPanel.find(".ngHeaderContainer");
        grid.$headerScroller = grid.$topPanel.find(".ngHeaderScroller");
        grid.$headers = grid.$headerScroller.children();
        //Viewport
        grid.$viewport = grid.$root.find(".ngViewport");
        //Canvas
        grid.$canvas = grid.$viewport.find(".ngCanvas");
        //Footers
        grid.$footerPanel = grid.$root.find(".ngFooterPanel");
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
        var $testContainer = $container.clone();
        $testContainer.appendTo($container.parent().first());
        dims.minWidth = 0;
        dims.minHeight = 0;
        //since its cloned... empty it out
        $testContainer.empty();
        var $test = $("<div style='height: 0x; width: 0px;'></div>");
        $testContainer.append($test);
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
        dims.minHeight = Math.max(grid.elementDims.rootMaxH, dims.minHeight);
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
            $canvas.append('<div class="ngRow"></div>');
            $row = $canvas.children().first();
            isDummyRow = true;
        }

        $cell = $row.children().first();
        if ($cell.length === 0) {
            //add a dummy cell
            $row.append('<div class="ngCell col0"></div>');
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
    this.letterW = 10;
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
* FILE: ..\src\directives\ng-grid.js
***********************************************/
ngGridDirectives.directive('ngGrid', ['$compile', 'GridService', 'SortService', function ($compile, GridService, SortService) {
    var ngGrid = {
        scope: true,
        compile: function () {
            return {
                pre: function ($scope, iElement, iAttrs) {
                    var $element = $(iElement);
                    var options = $scope.$eval(iAttrs.ngGrid);
                    var gridDim = new ng.Dimension({ outerHeight: $($element).height(), outerWidth: $($element).width() });
                    var grid = new ng.Grid($scope, options, gridDim, SortService);
                    var htmlText = ng.defaultGridTemplate(grid.config);
                    GridService.StoreGrid($element, grid);
                    grid.footerController = new ng.Footer($scope, grid);
                    ng.domUtility.measureGrid($element, grid, true);
                    // if it is a string we can watch for data changes. otherwise you won't be able to update the grid data
                    if (typeof options.data == "string") {
                        $scope.$parent.$watch(options.data, function (a) {
                            if (!a) return;
                            grid.sortedData = $.extend(true, [], a);
                            grid.searchProvider.evalFilter();
                            grid.refreshDomSizes();
                        }, options.watchDataItems);
                    }
                    //set the right styling on the container
                    $element.addClass("ngGrid")
                        .addClass("ui-widget")
                        .addClass(grid.gridId.toString());
                    //call update on the grid, which will refresh the dome measurements asynchronously
                    grid.initPhase = 1;
                    iElement.append($compile(htmlText)($scope));// make sure that if any of these change, we re-fire the calc logic
                    //walk the element's graph and the correct properties on the grid
                    ng.domUtility.assignGridContainers($element, grid);
                    //now use the manager to assign the event handlers
                    GridService.AssignGridEventHandlers($scope, grid);
                    grid.aggregateProvider = new ng.AggregateProvider(grid, $scope.$new(), GridService);
                    //initialize plugins.
                    angular.forEach(options.plugins, function (p) {
                        p.init($scope.$new(), grid, { GridService: GridService, SortService: SortService });
                    });
                    grid.update();
                    return null;
                }
            };
        }
    };
    return ngGrid;
}]);

/***********************************************
* FILE: ..\src\directives\ng-row.js
***********************************************/
ngGridDirectives.directive('ngRow', ['$compile', function ($compile) {
    var ngRow = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    var html;
                    if ($scope.row.isAggRow) {
                        html = ng.aggregateTemplate();
                        if ($scope.row.aggLabelFilter) {
                            html = html.replace(CUSTOM_FILTERS, '| ' + $scope.row.aggLabelFilter);
                        } else {
                            html = html.replace(CUSTOM_FILTERS, "");
                        }
                    } else {
                        html = $scope.$parent.rowTemplate();
                    }
                    iElement.append($compile(html)($scope));
                }
            };
        }
    };
    return ngRow;
}]);

/***********************************************
* FILE: ..\src\directives\ng-cell.js
***********************************************/
ngGridDirectives.directive('ngCell', ['$compile', function($compile) {
    var ngCell = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    var html = $scope.col.cellTemplate();
                    iElement.append($compile(html)($scope));
                }
            };
        }
    };
    return ngCell;
}]);

/***********************************************
* FILE: ..\src\directives\ng-header-row.js
***********************************************/
ngGridDirectives.directive('ngHeaderRow', ['$compile', function($compile) {
    var ngHeaderRow = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    if (iElement.children().length == 0) {
                        var html = $scope.headerRowTemplate();
                        iElement.append($compile(html)($scope));
                    }
                }
            };
        }
    };
    return ngHeaderRow;
}]);

/***********************************************
* FILE: ..\src\directives\ng-header-cell.js
***********************************************/
ngGridDirectives.directive('ngHeaderCell', ['$compile', function ($compile) {
    var ngHeaderCell = {
        scope: false,
        compile: function () {
            return {
                pre: function ($scope, iElement) {
                    var html = $scope.col.headerCellTemplate();
                    iElement.html(html);
                    $compile(iElement.children())($scope);
                }
            };
        }
    };
    return ngHeaderCell;
}]);

/***********************************************
* FILE: ..\src\init.js
***********************************************/
// initialization of services into the main module
angular.module('ngGrid', ['ngGrid.services', 'ngGrid.directives', 'ngGrid.filters']);
}(window));
