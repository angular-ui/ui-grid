ngGridGroupable = function (config) {
    var self = this;
    var defaults = { group: {} };
    self.config = $.extend(defaults, config);
    
    self.$scope = null;
    self.myGrid = null;
    self.services = null;
    // The init method gets called during the ng-grid directive execution.
    self.init = function ($scope, grid, services) {
        // The directive passes in the grid scope and the grid object which we will want to save for manipulation later.
        self.$scope = $scope;
        self.myGrid = grid;
        self.services = services;
        // In this example we are grouping data.
        self.setOverrides();
        self.getGrouping();
    };

    self.setOverrides = function() {
        self.myGrid.rowService.renderedChange = self.renderedChangeOverride;
    };

    self.getGrouping = function () {
        // Here we set the onmousedown event handler to the header container.
        var data = self.myGrid.rowService.sortedData;
        self.groupedData = { };
        angular.forEach(data, function (item) {
            var ptr = self.groupedData;
            var current = self.config.group;
            while (current) {
                var i = item[current.field].toString();
                if (!ptr[i]) {
                    ptr[i] = {};
                }
                if (!ptr['_ng_field_']) {
                    ptr['_ng_field_'] = current.field;
                }
                if (!ptr['_ng_label_']) {
                    ptr['_ng_label_'] = current.label;
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
                groupArr.push({ name: g['_ng_field_'], age: g['_ng_label_'], isGroupRow: true });
                for (var prop in g) {
                    if (prop == '_ng_label_' || prop == '_ng_field_' ) continue;
                    if (g.hasOwnProperty(prop)) {
                        parseGroup(g[prop]);
                    }
                } 
            }
        };
        parseGroup(self.groupedData);

        var dataArray = groupArr.slice(self.myGrid.rowService.renderedRange.bottomRow, self.myGrid.rowService.renderedRange.topRow);
        $.each(dataArray, function (indx, item) {
            if (item.isGroupRow) {
                
            }
            var row = self.myGrid.rowService.buildRowFromEntity(item, self.myGrid.rowService.renderedRange.bottomRow + indx);
            //add the row to our return array
            rowArr.push(row);
        });
        
        self.myGrid.setRenderedRows(rowArr);
    };
    //Header functions
    
    self.forIn = function (obj, action) {
        var prop;
        
    };
};
