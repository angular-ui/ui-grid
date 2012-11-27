ng.SearchProvider = function($scope, grid) {
    var self = this;
    self.field = "";
    self.value = "";
    self.extFilter = grid.config.filterOptions.useExternalFilter;
    $scope.showFilter = grid.config.showFilter;
    $scope.filterText = grid.config.filterOptions.filterText;

    self.fieldMap = {};

    self.evalFilter = function() {
        var ft = $scope.filterText.toLowerCase();
        var v = self.value;
        grid.filteredData = grid.sortedData.filter(function(item) {
            if (!$scope.filterText) {
                return true;
            } else if (!self.field) {
                return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
            } else if (item[self.field] && self.value) {
                return item[self.field].toString().toLowerCase().indexOf(v) != -1;
            } else if (item[self.fieldMap[self.field]] && self.value) {
                return item[self.fieldMap[self.field]].toString().toLowerCase().indexOf(v) != -1;
            }
            return true;
        });
        grid.rowFactory.filteredDataChanged();
    };
    $scope.$watch('filterText', function(a) {
        grid.config.filterOptions.filterText = a;
        if (self.extFilter) return;
        self.premise = a.split(':');
        if (self.premise.length > 1) {
            self.field = self.premise[0].toLowerCase().replace(' ', '_');
            self.value = self.premise[1].toLowerCase();
        } else {
            self.field = "";
            self.value = self.premise[0].toLowerCase();
        }
        self.evalFilter();
    });
    if (!self.extFilter) {
        $scope.$watch('columns', function(a) {
            angular.forEach(a, function(col) {
                self.fieldMap[col.displayName.toLowerCase().replace(' ', '_')] = col.field;
            });
        });
    }
};