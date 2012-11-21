ng.SearchProvider = function ($scope, grid) {
    var self = this;
    self.field = "";
    self.value = "";
    $scope.showFilter = grid.config.showFilter;
    $scope.filterText = "";
   
    self.evalFilter = function () {
        var ft = $scope.filterText.toLowerCase();
        var v = self.value.toLowerCase();
        grid.filteredData = grid.sortedData.filter(function (item) {
            if (!$scope.filterText) {
                return true;
            } else if (!self.field) {
                return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
            } else if (item[self.field] && self.value) {
                return item[self.field].toString().toLowerCase().indexOf(v) != -1;
            }
            return false;
        });
        grid.rowFactory.filteredDataChanged();
    };
    $scope.$watch('filterText', function (a) {
        self.premise = a.split(':');
        if (self.premise.length > 1) {
            self.field = self.premise[0];
            self.value = self.premise[1];
        } else {
            self.field = "";
            self.value = self.premise[0];
        }
        self.evalFilter();
    });
}