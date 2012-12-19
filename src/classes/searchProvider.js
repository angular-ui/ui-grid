ng.SearchProvider = function($scope, grid, $filter) {
    var self = this,
        searchConditions = [];
    self.extFilter = grid.config.filterOptions.useExternalFilter;
    $scope.showFilter = grid.config.showFilter;
    $scope.filterText = grid.config.filterOptions.filterText;

    self.fieldMap = {};

    self.evalFilter = function() {
        if (searchConditions.length === 0) {
            grid.filteredData = grid.sortedData;
        } else {
            grid.filteredData = grid.sortedData.filter(function(item) {
                for (var i = 0, len = searchConditions.length; i < len; i++) {
                    var condition = searchConditions[i];
                    //Search entire row
                    if (!condition.column) {
                        for (var prop in item) {
                            if (item.hasOwnProperty(prop)) {
                                if (prop == SELECTED_PROP) {
                                    continue;
                                }
                                var c = self.fieldMap[prop];
                                var f = (c && c.cellFilter) ? $filter(c.cellFilter) : null;
                                var pVal = item[prop];
                                if (pVal && (condition.regex.test(pVal.toString()) || (f && condition.regex.test(f(pVal).toString())))) {
                                    return true;
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
                    var value = item[condition.column] || item[col.field];
                    if ((!value || !condition.regex.test(value.toString())) && !(typeof filter == "function" && condition.regex.test(filter(value)))) {
                        return false;
                    }
                }
                return true;
            });
        }
        grid.rowFactory.filteredDataChanged();
    };
    var getRegExp = function(str, modifiers) {
        try {
            return new RegExp(str, modifiers);
        } catch(err) {
            //Escape all RegExp metacharacters.
            return new RegExp(str.replace(/(\^|\$|\(|\)|\<|\>|\[|\]|\{|\}|\\|\||\.|\*|\+|\?)/g, '\\$1'));
        }
    };
    var buildSearchConditions = function(a) {
        //reset.
        searchConditions = [];
        var qStr = '';
        if (!(qStr = $.trim(a))) {
            return;
        }
        var columnFilters = qStr.split(";");
        $.each(columnFilters, function(i, filter) {
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
    $scope.$watch('filterText', function(a) {
        if (!self.extFilter) {
            buildSearchConditions(a);
            self.evalFilter();
        }
    });
    if (!self.extFilter) {
        $scope.$watch('columns', function(a) {
            angular.forEach(a, function(col) {
                self.fieldMap[col.field] = col;
                self.fieldMap[col.displayName.toLowerCase().replace(/\s+/g, '')] = col;
            });
        });
    }
};