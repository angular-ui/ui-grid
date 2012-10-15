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