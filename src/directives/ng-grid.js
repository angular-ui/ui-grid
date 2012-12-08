ngGridDirectives.directive('ngGrid', ['$compile', '$http', 'GridService', 'SortService', 'DomUtilityService', function ($compile, $http, gridService, sortService, domUtilityService) {
    var ngGrid = {
        scope: true,
        compile: function () {
            return {
                pre: function ($scope, iElement, iAttrs) {
                    window.ng.$http = $http;
                    var $element = $(iElement);
                    var options = $scope.$eval(iAttrs.ngGrid);
                    options.gridDim = new ng.Dimension({ outerHeight: $($element).height(), outerWidth: $($element).width() });
                    var grid = new ng.Grid($scope, options, sortService, domUtilityService);
                    // if columndefs are a string of a property ont he scope watch for changes and rebuild columns.
                    if (typeof options.columnDefs == "string") {
                        $scope.$parent.$watch(options.columnDefs, function (a) {
                            $scope.columns.length = 0;
                            grid.config.columnDefs = a;
                            grid.buildColumns();
                            grid.configureColumnWidths();
                            domUtilityService.BuildStyles($scope, grid);
                            grid.aggregateProvider.assignEvents();
                        }, true);
                    }
                    // if it is a string we can watch for data changes. otherwise you won't be able to update the grid data
                    if (typeof options.data == "string") {
                        $scope.$parent.$watch(options.data, function (a) {
                            grid.sortedData = $.extend(true, [], a);
                            grid.searchProvider.evalFilter();
                            grid.configureColumnWidths();
                            grid.refreshDomSizes();
                            if (grid.config.sortInfo) {
                                if (!grid.config.sortInfo.column) {
                                    grid.config.sortInfo.column = $scope.columns.filter(function (c) {
                                        return c.field == grid.config.sortInfo.field;
                                    })[0];
                                    if (!grid.config.sortInfo.column) return;
                                } 
                                grid.config.sortInfo.column.sortDirection = grid.config.sortInfo.direction.toUpperCase();
                                grid.sortData(grid.config.sortInfo.column);
                            }
                        }, true);
                    }
                    var htmlText = ng.defaultGridTemplate(grid.config);
                    gridService.StoreGrid($element, grid);
                    grid.footerController = new ng.Footer($scope, grid);
                    //set the right styling on the container
                    $element.addClass("ngGrid")
                        .addClass("ui-widget")
                        .addClass(grid.gridId.toString());
                    //call update on the grid, which will refresh the dome measurements asynchronously
                    grid.initPhase = 1;
                    iElement.append($compile(htmlText)($scope));// make sure that if any of these change, we re-fire the calc logic
                    //walk the element's graph and the correct properties on the grid
                    domUtilityService.AssignGridContainers($element, grid);
                    grid.configureColumnWidths();
                    //now use the manager to assign the event handlers
                    gridService.AssignGridEventHandlers($scope, grid);
                    grid.aggregateProvider = new ng.AggregateProvider(grid, $scope.$new(), gridService, domUtilityService);
                   
                    //initialize plugins.
                    angular.forEach(options.plugins, function (p) {
                        p.init($scope.$new(), grid, { GridService: gridService, SortService: sortService, DomUtilityService: domUtilityService });
                    });
                    return null;
                }
            };
        }
    };
    return ngGrid;
}]);
