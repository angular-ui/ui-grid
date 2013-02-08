ngGridWYSIWYGPlugin = function (filter) {
    var self = this;
    self.grid = null;
    self.scope = null;

    self.init = function (scope, grid) {
        self.grid = grid;
        self.scope = scope;
    };

    self.export = function () {
        var ret = {
            columns: [],
            columnWidths: [],
            gridWidth: self.scope.totalRowWidth(),
            data: []
        };
        angular.forEach(self.scope.columns, function (col) {
            if (col.visible) {
                ret.columns.push(col.displayName);
                ret.columnWidths.push(col.width);
            }
        });
        angular.forEach(self.grid.filteredRows, function (item) {
            angular.forEach(self.scope.columns, function (col) {
                if (col.visible) {
                    var obj = ng.utils.evalProperty(item, col.field);
                    var val = null;
                    if (col.cellFilter) {
                        val = filter(col.cellFilter)(obj);
                    } else {
                        val = obj;
                    }
                    ret.data.push(val ? val.toString() : '');
                }
            });
        });
        return ret;
    };
    return self;
};