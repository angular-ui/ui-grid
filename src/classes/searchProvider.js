var ngSearchProvider = function ($scope, grid, $filter) {
    var self = this,
        searchConditions = [];
    self.extFilter = grid.config.filterOptions.useExternalFilter;
    $scope.showFilter = grid.config.showFilter;
    $scope.filterText = '';

    self.fieldMap = {};

    self.evalFilter = function () {
        var filterFunc = function(item) {
            for (var x = 0, len = searchConditions.length; x < len; x++) {
                var condition = searchConditions[x];
                //Search entire row
                var result;
                if (!condition.column) {
                    for (var prop in item) {
                        if (item.hasOwnProperty(prop)) {
                            var c = self.fieldMap[prop];
                            if (!c)
                                continue;
                            var f = null,
                                s = null;
                            if (c && c.cellFilter) {
                                s = c.cellFilter.split(':');
                                f = $filter(s[0]);
                            }
                            var pVal = item[prop];
                            if (pVal != null) {
                                if (typeof f == 'function') {
                                    var filterRes = f(typeof pVal === 'object' ? evalObject(pVal, c.field) : pVal, s[1]).toString();
                                    result = condition.regex.test(filterRes);
                                } else {
                                    result = condition.regex.test(typeof pVal === 'object' ? evalObject(pVal, c.field).toString() : pVal.toString());
                                }
                                if (pVal && result) {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }
                //Search by column.
                var col = self.fieldMap[condition.columnDisplay];
                if (!col) {
                    return false;
                }
                var sp = col.cellFilter.split(':');
                var filter = col.cellFilter ? $filter(sp[0]) : null;
                var value = item[condition.column] || item[col.field.split('.')[0]];
                if (value == null)
                    return false;
                if (typeof filter == 'function') {
                    var filterResults = filter(typeof value === 'object' ? evalObject(value, col.field) : value, sp[1]).toString();
                    result = condition.regex.test(filterResults);
                } else {
                    result = condition.regex.test(typeof value === 'object' ? evalObject(value, col.field).toString() : value.toString());
                }
                if (!value || !result) {
                    return false;
                }
            }
            return true;
        };
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
        if (typeof obj != 'object' || typeof columnName != 'string')
            return obj;
        var args = columnName.split('.');
        var cObj = obj;
        if (args.length > 1) {
            for (var i = 1, len = args.length; i < len; i++) {
                cObj = cObj[args[i]];
                if (!cObj)
                    return obj;
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
            return new RegExp(str.replace(/(\^|\$|\(|\)|\<|\>|\[|\]|\{|\}|\\|\||\.|\*|\+|\?)/g, '\\$1'));
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
        };
    };
	$scope.$watch(function() {
	    return grid.config.filterOptions.filterText;
	}, function(a){
		$scope.filterText = a;
	});
	$scope.$watch('filterText', function(a){
		if(!self.extFilter){
			$scope.$emit('ngGridEventFilter', a);
            buildSearchConditions(a);
            self.evalFilter();
        }
	});
    if (!self.extFilter) {
        $scope.$watch('columns', function (cs) {
            for (var i = 0; i < cs.length; i++) {
                var col = cs[i];
				if(col.field)
					self.fieldMap[col.field.split('.')[0]] = col;
				if(col.displayName)
					self.fieldMap[col.displayName.toLowerCase().replace(/\s+/g, '')] = col;
            };
        });
    }
};