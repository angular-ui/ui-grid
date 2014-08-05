angular.module('ngGrid.services').factory('$sortService', ['$parse', '$utilityService', function($parse, $utils) {
    var sortService = {};
    sortService.colSortFnCache = {}; // cache of sorting functions. Once we create them, we don't want to keep re-doing it
    sortService.isCustomSort = false; // track if we're using an internal sort or a user provided sort
    // this takes an piece of data from the cell and tries to determine its type and what sorting
    // function to use for it
    // @item - the cell data
    sortService.guessSortFn = function(item) {
        var itemType = typeof(item);
        //check for numbers and booleans
        switch (itemType) {
            case "number":
                return sortService.sortNumber;
            case "boolean":
                return sortService.sortBool;
            case "string":
                // if number string return number string sort fn. else return the str
                return item.match(/^[-+]?[£$¤]?[\d,.]+%?$/) ? sortService.sortNumberStr : sortService.sortAlpha;
            default:
                //check if the item is a valid Date
                if (Object.prototype.toString.call(item) === '[object Date]') {
                    return sortService.sortDate;
                }
                else {
                    //finally just sort the basic sort...
                    return sortService.basicSort;
                }
        }
    };
    //#region Sorting Functions
    sortService.basicSort = function(a, b) {
        if (a === b) {
            return 0;
        }
        if (a < b) {
            return -1;
        }
        return 1;
    };
    sortService.sortNumber = function(a, b) {
        return a - b;
    };
    sortService.sortNumberStr = function(a, b) {
        var numA, numB, badA = false, badB = false;
        numA = parseFloat(a.replace(/[^0-9.-]/g, ''));
        if (isNaN(numA)) {
            badA = true;
        }
        numB = parseFloat(b.replace(/[^0-9.-]/g, ''));
        if (isNaN(numB)) {
            badB = true;
        }
        // we want bad ones to get pushed to the bottom... which effectively is "greater than"
        if (badA && badB) {
            return 0;
        }
        if (badA) {
            return 1;
        }
        if (badB) {
            return -1;
        }
        return numA - numB;
    };
    sortService.sortAlpha = function(a, b) {
        var strA = a.toLowerCase(),
            strB = b.toLowerCase();
        return strA === strB ? 0 : (strA < strB ? -1 : 1);
    };
    sortService.sortDate = function(a, b) {
        var timeA = a.getTime(),
            timeB = b.getTime();
        return timeA === timeB ? 0 : (timeA < timeB ? -1 : 1);
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
    //#endregion
    // the core sorting logic trigger
    sortService.sortData = function(sortInfo, data /*datasource*/) {
        // first make sure we are even supposed to do work
        if (!data || !sortInfo) {
            return;
        }
        var l = sortInfo.fields.length,
            order = sortInfo.fields,
            col,
            direction,
            // IE9 HACK.... omg, I can't reference data array within the sort fn below. has to be a separate reference....!!!!
            d = data.slice(0);
        //now actually sort the data
        data.sort(function (itemA, itemB) {
            var tem = 0,
                indx = 0,
                res,
                sortFn;
            while (tem === 0 && indx < l) {
                // grab the metadata for the rest of the logic
                col = sortInfo.columns[indx];
                direction = sortInfo.directions[indx];
                sortFn = sortService.getSortFn(col, d);

                var propA = $utils.evalProperty(itemA, order[indx]);
                var propB = $utils.evalProperty(itemB, order[indx]);
                // if user provides custom sort, we want them to have full control of the sort
                if (sortService.isCustomSort) {
                    res = sortFn(propA, propB);
                    tem = direction === ASC ? res : 0 - res;
                } else {
                    // we want to allow zero values to be evaluated in the sort function
                    if (propA == null || propB == null) {
                        // we want to force nulls and such to the bottom when we sort... which effectively is "greater than"
                        if (propB == null && propA == null) {
                            tem = 0;
                        }
                        else if (propA == null) {
                            tem = 1;
                        }
                        else if (propB == null) {
                            tem = -1;
                        }
                    }
                    else {
                        // this will keep nulls at the bottom regardless of ordering
                        res = sortFn(propA, propB);
                        tem = direction === ASC ? res : 0 - res;
                    }
                }
                indx++;
            }
            return tem;
        });
    };
    sortService.Sort = function(sortInfo, data) {
        if (sortService.isSorting) {
            return;
        }
        sortService.isSorting = true;
        sortService.sortData(sortInfo, data);
        sortService.isSorting = false;
    };
    sortService.getSortFn = function(col, data) {
        var sortFn, item;
        //see if we already figured out what to use to sort the column
        if (sortService.colSortFnCache[col.field]) {
            sortFn = sortService.colSortFnCache[col.field];
        }
        else if (col.sortingAlgorithm !== undefined) {
            sortFn = col.sortingAlgorithm;
            sortService.colSortFnCache[col.field] = col.sortingAlgorithm;
            sortService.isCustomSort = true;
        }
        else { // try and guess what sort function to use
            item = data[0];
            if (!item) {
                return sortFn;
            }
            sortFn = sortService.guessSortFn($parse('entity[\''+col.field.replace(DOT_REGEXP, '\'][\'')+'\']')({entity:item}));
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
        return sortFn;
    };
    return sortService;
}]);
