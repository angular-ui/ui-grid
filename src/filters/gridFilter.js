/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ngGridServices.factory('FilterService', ['$rootScope', function ($scope) {
    var filterService = {};	
	$scope._filterService = {};
    
    // array that we use to manage the filtering before it updates the final data
    $scope._filterService.internalFilteredData = [];
    
    filterService.Initialize = function (options){
        var wildcard = options.filterWildcard || "*", // the wildcard character used by the user
            regExCache = { }; // a cache of filterString to regex objects, eg: { 'abc%' : RegExp("abc[^\']*, "gi") }
        
        $scope._filterService.initPhase = 0;     
        $scope._filterService.options = options;
        // first check the wildcard as we only support * and % currently
        if (wildcard === '*' || wildcard === '%') {
            // do nothing
        } else {
            throw new Error("You can only declare a percent sign (%) or an asterisk (*) as a wildcard character");
        }

        // map of column.field values to filterStrings
        $scope._filterService.filterInfo = options.filterInfo;
        // the array of data that the user defined
        $scope._filterService.data = options.data;

        // utility function for checking data validity
        $scope._filterService.isEmpty = function (data) {
            return (data === null || data === undefined || data === '');
        };
        // performs regex matching on data strings
        $scope._filterService.matchString = function (itemStr, filterStr) {
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
        $scope._filterService.filterData = function () {
            var fi = $scope._filterService.filterInfo,
            data = $scope._filterService.data,
            keepRow = false, // flag to say if the row will be removed or kept in the viewport
            match = true, // flag for matching logic
            newArr, // the filtered array
            f, // the field of the column that we are filtering
            itemData, // the data from the specific row's column
            itemDataStr, // the stringified version of itemData
            filterStr; // the user-entered filtering criteria
            // filter the destroyed items
            data = $scope._filterService.internalFilteredData;
            // make sure we even have work to do before we get started
            if (!fi || $.isEmptyObject(fi) || options.useExternalFiltering) {
                $scope._filterService.internalFilteredData = data;
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
                        if (!$scope._filterService.isEmpty(filterStr) && filterStr !== wildcard) {
                            // execute regex matching
                            if ($scope._filterService.isEmpty(itemData)) {
                                match = false;
                            } else if (typeof itemData === "string") {
                                match = $scope._filterService.matchString(itemData, filterStr);
                            } else {
                                itemDataStr = itemData.toString();
                                match = $scope._filterService.matchString(itemDataStr, filterStr);
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
            $scope._filterService.internalFilteredData = newArr;
        };
        //create subscriptions
        $scope.$watch($scope._filterService.data, function(filterData){
			$scope._filterService.filterData();
		});		
        $scope.$watch($scope._filterService.filterInfo, function(filterData){
			$scope._filterService.filterData();
		});		
        //increase this after initialization so that the computeds fire correctly
        $scope._filterService.initPhase = 1;
    };

    filterService.FilterInfo = $scope._filterService.filterInfo;

    filterService.FilteredData = $scope._filterService.internalFilteredData;
    
    // the grid uses this to asign the change handlers to the filter boxes during initialization
    filterService.CreateFilterChangeCallback = function (col) {
        // the callback
        return function (newFilterVal) {
            var info = $scope._filterService.filterInfo;
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
            $scope._filterService.filterInfo = info;
            if (options && options.currentPage) {
                options.currentPage = 1;
            }
        };
    };
    return filterService;
}]);