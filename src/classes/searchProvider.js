ng.SearchProvider = function ($scope, grid, $filter) {
    var self = this,
        searchConditions = [];
    self.extFilter = grid.config.filterOptions.useExternalFilter;
    $scope.showFilter = grid.config.showFilter;
    $scope.filterText = '';

    self.fieldMap = {};

    self.evalFilter = function () {
        if (searchConditions.length === 0) {
            grid.filteredData = grid.sortedData;
        } else {
            grid.filteredData = grid.sortedData.filter(function (item) {
                for (var i = 0, len = searchConditions.length; i < len; i++) {
                    var condition = searchConditions[i];
                    //Search entire row
                    if (!condition.column) {
                        for (var prop in item) {
                            if (item.hasOwnProperty(prop)) {
                                var c = self.fieldMap[prop];
                                if (!c) continue;
                                var f = (c && c.cellFilter) ? $filter(c.cellFilter) : null;
                                var pVal = item[prop];
								if(pVal != null){ 								
									var result;
									if(typeof f == 'function'){
										var filterRes = f(typeof pVal === 'object' ? evalObject(pVal, c.field) : pVal).toString();
										result = condition.regex.test(filterRes);
									} else {
										result = condition.regex.test(typeof pVal === 'object' ? evalObject(pVal, c.field).toString() : pVal.toString())
									}
									if (pVal &&  result) {
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
                    var filter = col.cellFilter ? $filter(col.cellFilter) : null;
                    var value = item[condition.column] || item[col.field.split('.')[0]];                  
					if(value == null) return false;
					var result;
					if(typeof filter == 'function'){
						var filterResults = filter(typeof value === 'object' ? evalObject(value, col.field) : value).toString();
						result = condition.regex.test(filterResults);
					} else {
						result = condition.regex.test(typeof value === 'object' ? evalObject(value, col.field).toString() : value.toString())
					}
					if (!value || !result) {
						return false;
					}				
                }
                return true;
            });
        }
        grid.rowFactory.filteredDataChanged();
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
        var qStr = '';
        if (!(qStr = $.trim(a))) {
            return;
        }
        var columnFilters = qStr.split(";");
        $.each(columnFilters, function (i, filter) {
            var args = filter.split(':');
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
        });
    };
	$scope.$watch(grid.config.filterOptions.filterText, function(a){
		$scope.filterText = a;
	});
	$scope.$watch('filterText', function(a){
		if(!self.extFilter){
			$scope.$emit('filterChanged', a);
            buildSearchConditions(a);
            self.evalFilter();
        }
	});
    if (!self.extFilter) {
        $scope.$watch('columns', function (a) {
            angular.forEach(a, function (col) {
                self.fieldMap[col.field.split('.')[0]] = col;
                self.fieldMap[col.displayName.toLowerCase().replace(/\s+/g, '')] = col;
            });
        });
    }
};