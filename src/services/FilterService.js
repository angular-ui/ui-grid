/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ngGridServices.factory('FilterService', ['$scope', function ($scope) {
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