/// <reference path="../classes/grid.js" />
/// <reference path="../services/FilterService.js" />
/// <reference path="../services/GridService.js" />
/// <reference path="../services/SelectionService.js" />
/// <reference path="../classes/grid.js" />
/// <reference path="../services/FilterService.js" />
/// <reference path="../services/GridService.js" />
/// <reference path="../services/SelectionService.js" />
/// <reference path="../services/RowService.js" />
/// <reference path="../services/TemplateService.js" />
/// <reference path="../services/SortService.js" />
/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../classes/footer.js" />
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ngGridDirectives.directive('ngGrid', function ($compile, GridService, RowService, SelectionService, SortService) {
    var ngGrid = {
        scope: true,
        compile: function (iElement, iAttrs, transclude) {
            return {
                pre: function preLink($scope, iElement, iAttrs, controller) {
                    var htmlText = ng.defaultGridTemplate();
                    var $element = $(iElement);
                    var options = $scope[iAttrs.ngGrid];
                    var grid = new ng.Grid($scope, options, $($element).height(), $($element).width(), RowService, SelectionService, SortService);
                    
                    GridService.StoreGrid($element, grid);
                    grid.footerController = new ng.Footer($scope, grid);

                    ng.domUtility.measureGrid($element, grid, true);

                    //set the right styling on the container
                    $element.addClass("ngGrid")
                        .addClass("ui-widget")
                        .addClass(grid.gridId.toString());

                    $scope.$watch(grid.finalData, function() {
                        if (grid.config.selectedItems) {
                            var lastItemIndex = grid.config.selectedItems.length - 1;
                            if (lastItemIndex <= 0) {
                                var item = grid.config.selectedItems[lastItemIndex];
                                if (item) {
                                    grid.scrollIntoView(item);
                                }
                            }
                        }
                    });
                    $scope.$watch($scope.data, $scope.refreshDomSizesTrigger);
                    angular.forEach($scope.columns, function(column) {
                        $scope.$watch(column.sortDirection, function() {
                            return function(dir) {
                                if (dir) {
                                    $scope.sortData(column, dir);
                                }
                            };
                        });
                    });

                    $scope.toggleSelectAll = $scope.toggleSelectAll;
                    $scope.filterIsOpen = $scope.filterIsOpen;
                    //walk the element's graph and the correct properties on the grid
                    ng.domUtility.assignGridContainers($element, grid);
                    //now use the manager to assign the event handlers
                    GridService.AssignGridEventHandlers($scope, grid);
                    //call update on the grid, which will refresh the dome measurements asynchronously
                    //grid.update();

                    $scope.initPhase = 1;

                    iElement.append($compile(htmlText)($scope));
                    return null;
                }
            };
        }
    };
    return ngGrid;
});