ngGridDirectives.directive('ngGrid', ['$compile', 'GridService', 'SortService', 'DomUtilityService', function ($compile, gridService, sortService, domUtilityService) {
    var ngGrid = {
        scope: true,
        compile: function () {
            return {
                pre: function ($scope, iElement, iAttrs) {
                    var $element = $(iElement);
                    var options = $scope.$eval(iAttrs.ngGrid);
                    var gridDim = new ng.Dimension({ outerHeight: $($element).height(), outerWidth: $($element).width() });
                    var grid = new ng.Grid($scope, options, gridDim, SortService, DomUtilityService);
                    var htmlText = ng.defaultGridTemplate(grid.config);
                    GridService.StoreGrid($element, grid);
                    grid.footerController = new ng.Footer($scope, grid);
                    DomUtilityService.MeasureGrid($element, grid, true);
                    // if it is a string we can watch for data changes. otherwise you won't be able to update the grid data
                    if (typeof options.data == "string") {
                        $scope.$parent.$watch(options.data, function (a) {
                            if (!a) return;
                            grid.sortedData = $.extend(true, [], a);
                            grid.searchProvider.evalFilter();
                            grid.refreshDomSizes();
                        }, options.watchDataItems);
                    }
                    //set the right styling on the container
                    $element.addClass("ngGrid")
                        .addClass("ui-widget")
                        .addClass(grid.gridId.toString());
                    //call update on the grid, which will refresh the dome measurements asynchronously
                    grid.initPhase = 1;
                    iElement.append($compile(htmlText)($scope));// make sure that if any of these change, we re-fire the calc logic
                    //walk the element's graph and the correct properties on the grid
                    DomUtilityService.AssignGridContainers($element, grid);
                    //now use the manager to assign the event handlers
                    GridService.AssignGridEventHandlers($scope, grid);
                    grid.aggregateProvider = new ng.AggregateProvider(grid, $scope.$new(), gridService, domUtilityService);
                    //initialize plugins.
                    angular.forEach(options.plugins, function (p) {
                        p.init($scope.$new(), grid, { GridService: gridService, SortService: sortService, DomUtilityService: domUtilityService });
                    });
                    grid.update();
                    return null;
                }
            };
        }
    };
    return ngGrid;
}]);
