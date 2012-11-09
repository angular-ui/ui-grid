ngGridGroupable = function (config) {
    var self = this;
    var NG_FIELD = '_ng_field_';
    var NG_LABEL = '_ng_label_';
    var NG_DEPTH = '_ng_depth_';
    var defaults = { group: {} };
    self.config = $.extend(defaults, config);
    
    self.$scope = null;
    self.myGrid = null;
    self.services = null;
    self.groupedData = {};
    // The init method gets called during the ng-grid directive execution.
    self.init = function ($scope, grid, services) {
        // The directive passes in the grid scope and the grid object which we will want to save for manipulation later.
        self.$scope = $scope;
        self.myGrid = grid;
        self.services = services;
        // In this example we are grouping data.
        self.setOverrides();
        self.getGrouping(self.config.group);
    };

    self.setOverrides = function() {
        self.myGrid.rowFactory.renderedChange = self.renderedChangeOverride;
    };

    self.getGrouping = function (groupDef) {
        self.groupedData = {};
        // Here we set the onmousedown event handler to the header container.
        var data = self.myGrid.sortedData;
        angular.forEach(data, function (item) {
            var ptr = self.groupedData;
            var current = groupDef;
            var depth = 0;
            while (current) {
                var i = item[current.field].toString();
                if (!ptr[i]) {
                    ptr[i] = {};
                }
                if (!ptr[NG_FIELD]) {
                    ptr[NG_FIELD] = current.field;
                }
                if (!ptr[NG_LABEL]) {
                    ptr[NG_LABEL] = current.label;
                }
                if (!ptr[NG_DEPTH]) {
                    ptr[NG_DEPTH] = depth++;
                }
                ptr = ptr[i];
                current = current.group;
            }
            if (!ptr.values) {
                ptr.values = [];
            }
            ptr.values.push(item);
        });
    };
    
    self.renderedChangeOverride = function() {
        var rowArr = [];
        var groupArr = [];
        var parseGroup = function(g) {
            if(g.values) {
                angular.forEach(g.values, function (item) {
                    //add the row to our return array
                    groupArr.push(item);
                });
            } else {
                if (g.hasOwnProperty(NG_LABEL)) {
                    groupArr.push({ gField: g[NG_FIELD], gLabel: g[NG_LABEL], gDepth: g[NG_DEPTH], isAggRow: true });
                }
                for (var prop in g) {
                    if (prop == NG_FIELD || prop == NG_LABEL) {
                        continue;
                    } else if (g.hasOwnProperty(prop)) {
                        parseGroup(g[prop]);
                    }
                } 
            }
        };
        parseGroup(self.groupedData);

        var dataArray = groupArr.slice(self.myGrid.rowFactory.renderedRange.bottomRow, self.myGrid.rowFactory.renderedRange.topRow);
        var maxDepth = -1;
        var cols = self.$scope.columns;
        $.each(dataArray, function (indx, item) {
            if (item.isAggRow && maxDepth < item.gDepth) {
                maxDepth = Math.max(maxDepth, item.gDepth);
                cols.splice(item.gDepth, 0, new ng.Column({
                    colDef: {
                        field: '',
                        width: 25,
                        sortable: false,
                        resizable: false,
                        headerCellTemplate: '<div></div>',
                        cellTemplate: '<div style="overflow: visible;">{{row.label}}</div>'
                    },
                    index: item.gDepth,
                    headerRowHeight: self.myGrid.config.headerRowHeight
                }));
            }
            var row = self.myGrid.rowFactory.buildRowFromEntity(item, self.myGrid.rowFactory.renderedRange.bottomRow + indx);
            //add the row to our return array
            rowArr.push(row);
        });
        angular.forEach(cols, function (col, i) {
            col.index = i;
        });
        self.$scope.columns = cols;
        self.myGrid.setRenderedRows(rowArr);
    };
};
