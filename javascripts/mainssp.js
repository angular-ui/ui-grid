/// <reference path="../plugins/ng-grid-reorderable.js" />
/// <reference path="../ng-grid-1.0.0.debug.js" />

function userController($scope) {
    var self = this;
    $scope.mySelections = [];
    $scope.filterOptions = {
        filterText: "",
        useExternalFilter: true
    },
    $scope.pagingOptions = {
        pageSizes: [250, 500, 1000], //page Sizes
        pageSize: 250, //Size of Paging data
        totalServerItems: 0, //how many items are on the server (for paging)
        currentPage: 1 //what page they are currently on
    };
    self.getPagedDataAsync = function (pageSize, page, searchText) {
        setTimeout(function () {
            var data;
            if (searchText) {
                var ft = searchText.toLowerCase();
                data = largeLoad().filter(function(item) {
                    return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                });
            } else {
                data = largeLoad();
            }
            var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
            $scope.myData = pagedData;
            $scope.pagingOptions.totalServerItems = data.length;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }, 100);
    };
    $scope.$watch('pagingOptions', function () {
        self.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
    }, true);
    $scope.$watch('filterOptions', function () {
        self.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
    }, true);
    
    $scope.myData = self.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    $scope.gridOptions = {
		data: 'myData',
		jqueryUITheme: false,
		jqueryUIDraggable: false,
        selectedItems: $scope.mySelections,
        displaySelectionCheckbox: true,
        multiSelect: true,
        showGroupPanel: true,
        showColumnMenu: true,
        enablePaging: true,
        pagingOptions: $scope.pagingOptions,
        filterOptions: $scope.filterOptions,
        columnDefs: [{ field: 'name', displayName: 'Very Long Name Title'},
                     { field: 'allowance', width: 'auto', aggLabelFilter: 'currency', cellTemplate: '<div ng-class="{red: row.entity[col.field] > 30}"><div class="ngCellText">{{row.entity[col.field] | currency}}</div></div>' },
                     { field: 'birthday', width: '120px', cellFilter: 'date' },
                     { field: 'paid', width: '*',  cellFilter: 'checkmark' }]
    };
};