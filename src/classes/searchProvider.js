var ngSearchProvider = function ($scope, grid, $filter) {
    var self = this,
        searchConditions = [];

    self.extFilter = grid.config.filterOptions.useExternalFilter;
    $scope.showFilter = grid.config.showFilter;
    $scope.filterText = '';

    self.fieldMap = {};

    var searchEntireRow = function(condition, item, fieldMap){
        var result;
        for (var prop in item) {
            if (item.hasOwnProperty(prop)) {
                var c = fieldMap[prop.toLowerCase()];
                if (!c) {
                    continue;
                }
                var pVal = item[prop];
                if(typeof pVal === 'object'){
                    return searchEntireRow(condition, pVal, c);
                } else {
                    var f = null,
                        s = null;
                    if (c && c.cellFilter) {
                        s = c.cellFilter.split(':');
                        f = $filter(s[0]);
                    }
                    if (pVal !== null && pVal !== undefined) {
                        if (typeof f === "function") {
                            var filterRes = f(pVal, s[1]).toString();
                            result = condition.regex.test(filterRes);
                        } else {
                            result = condition.regex.test(pVal.toString());
                        }
                        if (result) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };

    var searchColumn = function(condition, item){
        var result;
        var col = self.fieldMap[condition.columnDisplay];
        if (!col) {
            return false;
        }
        var sp = col.cellFilter.split(':');
        var filter = col.cellFilter ? $filter(sp[0]) : null;
        var value = item[condition.column] || item[col.field.split('.')[0]];
        if (value === null || value === undefined) {
            return false;
        }
        if (typeof filter === "function") {
            var filterResults = filter(typeof value === "object" ? evalObject(value, col.field) : value, sp[1]).toString();
            result = condition.regex.test(filterResults);
        }
        else {
            result = condition.regex.test(typeof value === "object" ? evalObject(value, col.field).toString() : value.toString());
        }
        if (result) {
            return true;
        }
        return false;
    };

    var filterFunc = function(item) {
        for (var x = 0, len = searchConditions.length; x < len; x++) {
            var condition = searchConditions[x];
            var result;
            if (!condition.column) {
                result = searchEntireRow(condition, item, self.fieldMap);
            } else {
                result = searchColumn(condition, item);
            }     
            if(!result) {
                return false;
            }      
        }
        return true;
    };

    self.evalFilter = function () {
        if (searchConditions.length === 0) {
            grid.filteredRows = grid.rowCache;
        } else {
            grid.filteredRows = grid.rowCache.filter(function(row) {
                return filterFunc(row.entity);
            });
        }
        for (var i = 0; i < grid.filteredRows.length; i++)
        {
            grid.filteredRows[i].rowIndex = i;
            
        }
        grid.rowFactory.filteredRowsChanged();
    };

    //Traversing through the object to find the value that we want. If fail, then return the original object.
    var evalObject = function (obj, columnName) {
        if (typeof obj !== "object" || typeof columnName !== "string") {
            return obj;
        }
        var args = columnName.split('.');
        var cObj = obj;
        if (args.length > 1) {
            for (var i = 1, len = args.length; i < len; i++) {
                cObj = cObj[args[i]];
                if (!cObj) {
                    return obj;
                }
            }
            return cObj;
        }
        return obj;
    };
    var getRegExp = function (str, modifiers) {
        try {
            return new RegExp(str, modifiers);
        } catch (err) {
            //Escape all RegExp metacharacters.
            return new RegExp(str.replace(/(\^|\$|\(|\)|<|>|\[|\]|\{|\}|\\|\||\.|\*|\+|\?)/g, '\\$1'));
        }
    };
    var buildSearchConditions = function (a) {
        //reset.
        searchConditions = [];
        var qStr;
        if (!(qStr = $.trim(a))) {
            return;
        }
        var columnFilters = qStr.split(";");
        for (var i = 0; i < columnFilters.length; i++) {
            var args = columnFilters[i].split(':');
            if (args.length > 1) {
                var columnName = $.trim(args[0]);
                var columnValue = $.trim(args[1]);
                if (columnName && columnValue) {
                    searchConditions.push({
                        column: columnName,
                        columnDisplay: columnName.replace(/\s+/g, '').toLowerCase(),
                        regex: getRegExp(columnValue, 'i')
                    });
                }
            } else {
                var val = $.trim(args[0]);
                if (val) {
                    searchConditions.push({
                        column: '',
                        regex: getRegExp(val, 'i')
                    });
                }
            }
        }
    };

    if (!self.extFilter) {
        $scope.$watch('columns', function (cs) {
            for (var i = 0; i < cs.length; i++) {
                var col = cs[i];
                if (col.field) {
                    if(col.field.match(/\./g)){
                        var properties = col.field.split('.');
                        var currentProperty = self.fieldMap;
                        for(var j = 0; j < properties.length - 1; j++) {
                            currentProperty[ properties[j] ] =  currentProperty[ properties[j] ] || {};
                            currentProperty = currentProperty[properties[j]];
                        }
                        currentProperty[ properties[properties.length - 1] ] = col;
                    } else {
                        self.fieldMap[col.field.toLowerCase()] = col;
                    }
                }
                if (col.displayName) {
                    self.fieldMap[col.displayName.toLowerCase().replace(/\s+/g, '')] = col;
                }
            }
        });
    }

    $scope.$watch(
        function () {
            return grid.config.filterOptions.filterText;
        },
        function (a) {
            $scope.filterText = a;
        }
    );

    $scope.$watch('filterText', function(a){
        if (!self.extFilter) {
            $scope.$emit('ngGridEventFilter', a);
            buildSearchConditions(a);
            self.evalFilter();
        }
    });
};