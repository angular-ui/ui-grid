ngGridDirectives.directive('ngGrid', ['$compile', '$filter', 'SortService', 'DomUtilityService', function($compile, $filter, sortService, domUtilityService) {
    var ngGrid = {
        scope: true,
        compile: function() {
            return {
                pre: function($scope, iElement, iAttrs) {
                    var $element = $(iElement);
                    var options = $scope.$eval(iAttrs.ngGrid);
                    options.gridDim = new ng.Dimension({ outerHeight: $($element).height(), outerWidth: $($element).width() });
                    var grid = new ng.Grid($scope, options, sortService, domUtilityService, $filter);
                    // if columndefs are a string of a property ont he scope watch for changes and rebuild columns.
                    if (typeof options.columnDefs == "string") {
                        $scope.$parent.$watch(options.columnDefs, function(a) {
                            $scope.columns = [];
                            grid.config.columnDefs = a;
                            grid.buildColumns();
                            grid.configureColumnWidths();
                            domUtilityService.BuildStyles($scope, grid);
                            grid.eventProvider.assignEvents();
                        });
                    }
                    
                    // if it is a string we can watch for data changes. otherwise you won't be able to update the grid data
                    if (typeof options.data == "string") {
                        var prevlength = 0;
                        var dataWatcher = function (a) {
                            prevlength = a ? a.length:0;
                            grid.sortedData = $scope.$eval(options.data) || [];
                            grid.searchProvider.evalFilter();
                            grid.configureColumnWidths();
                            grid.refreshDomSizes();
                            if (grid.config.sortInfo) {
                                if (!grid.config.sortInfo.column) {
                                    grid.config.sortInfo.column = $scope.columns.filter(function(c) {
                                        return c.field == grid.config.sortInfo.field;
                                    })[0];
                                    if (!grid.config.sortInfo.column) {
                                        return;
                                    }
                                }
                                grid.config.sortInfo.column.sortDirection = grid.config.sortInfo.direction.toLowerCase();
                                grid.sortData(grid.config.sortInfo.column);
                            }
                        };
                        $scope.$parent.$watch(options.data, dataWatcher);
                        $scope.$parent.$watch(options.data + '.length', function(a) {
                            if (a != prevlength) {
                                dataWatcher($scope.$eval(options.data));
                            }
                        });
                    }
                    var htmlText = ng.defaultGridTemplate(grid.config);
                    grid.footerController = new ng.Footer($scope, grid);
                    //set the right styling on the container
                    iElement.addClass("ngGrid").addClass(grid.gridId.toString());
                    if (options.jqueryUITheme) {
                        iElement.addClass('ui-widget');
                    }
                    iElement.append($compile(htmlText)($scope)); // make sure that if any of these change, we re-fire the calc logic
                    //walk the element's graph and the correct properties on the grid
                    domUtilityService.AssignGridContainers(iElement, grid);
                    grid.configureColumnWidths();
                    //now use the manager to assign the event handlers
                    grid.eventProvider = new ng.EventProvider(grid, $scope, domUtilityService);
                    //initialize plugins.
                    angular.forEach(options.plugins, function(p) {
                        p.init($scope.$new(), grid, { SortService: sortService, DomUtilityService: domUtilityService });
                    });
                    return null;
                }
            };
        }
    };
    return ngGrid;
}]);