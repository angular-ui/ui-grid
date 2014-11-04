(function() {
  'use strict';

  var module = angular.module('ui.grid.paging', ['ui.grid']);

  module.service('uiGridPagingService', ['gridUtil', 
    function (gridUtil) {
      var service = {
        initializeGrid: function (grid) {
          service.defaultGridOptions(grid.options);

          var publicApi = {
            events: {
              paging: {
                pagingChanged: function ($scope, fn) { }
              }
            },
            methods: {
              paging: {
              }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
            grid.registerRowsProcessor(function (renderableRows) {
                //client side paging
                var pageSize = parseInt(grid.options.pagingPageSize, 10);
                var currentPage = parseInt(grid.options.pagingCurrentPage, 10);
                var totalPages = Math.max(1, Math.ceil(renderableRows.length / pageSize));

                var firstRow = (currentPage - 1) * pageSize;
                return renderableRows.slice(firstRow, firstRow + pageSize);
            });

        },
        defaultGridOptions: function (gridOptions) {
          gridOptions.enablePaging = gridOptions.enablePaging !== false;

          if (gridUtil.isNullOrUndefined(gridOptions.totalServerItems)) {
            gridOptions.totalServerItems = 0;
          }

          if (gridUtil.isNullOrUndefined(gridOptions.pagingPageSizes)) {
            gridOptions.pagingPageSizes = [250, 500, 1000];
          }
          
          if (gridUtil.isNullOrUndefined(gridOptions.pagingPageSize)) {
            if (gridOptions.pagingPageSizes.length > 0) {
              gridOptions.pagingPageSize = gridOptions.pagingPageSizes[0];
            } else {              
              gridOptions.pagingPageSize = 0;
            }
          }

          if (gridUtil.isNullOrUndefined(gridOptions.pagingCurrentPage)) {
            gridOptions.pagingCurrentPage = 1;
          }

        },
        onPagingChanged: function (grid, newPage, pageSize) {
            if (grid.options.enableServerSidePaging) {
                grid.api.paging.raise.pagingChanged(newPage, pageSize);  //trigger serverside paging event
            } else {
                grid.refresh();  //call client paging
            }
        }
      };
    return service;
    }
  ]);

  module.directive('uiGridPaging', ['gridUtil', 'uiGridPagingService', 
    function (gridUtil, uiGridPagingService) {
      var defaultTemplate = 'ui-grid/ui-grid-paging';

      return {
        priority: -200,
        scope: false,
        require: 'uiGrid',
        compile: function ($scope, $elm, $attr, uiGridCtrl) {
          return {
            pre: function ($scope, $elm, $attr, uiGridCtrl) {

              uiGridPagingService.initializeGrid(uiGridCtrl.grid);

              var pagingTemplate = uiGridCtrl.grid.options.pagingTemplate || defaultTemplate;
              gridUtil.getTemplate(pagingTemplate)
                .then(function (contents) {
                  var template = angular.element(contents);
                  $elm.append(template);
                  uiGridCtrl.innerCompile(template);
                });
            },
            post: function ($scope, $elm, $attr, uiGridCtrl) {
            }
          };
        }
      };
    }
  ]);

  module.directive('uiGridPager', ['uiGridPagingService', 'gridUtil', 
    function (uiGridPagingService, gridUtil) {
      return {
        priority: -200,
        scope: true,
        require: '^uiGrid',
        link: function ($scope, $elm, $attr, uiGridCtrl) {

          uiGridCtrl.grid.renderContainers.body.registerViewportAdjuster(function (adjustment) {
          //adjustment.height = adjustment.height - gridUtil.elementHeight($elm);
          adjustment.height = adjustment.height - 35;
          return adjustment;
          });

          var options = $scope.grid.options;

          var setShowing = function () {
            $scope.showingLow = ((options.pagingCurrentPage - 1) * options.pagingPageSize) + 1;
            $scope.showingHigh = Math.min(options.pagingCurrentPage * options.pagingPageSize, options.totalServerItems);
          }

          var getMaxPages = function () {
            return (options.totalServerItems === 0)
            ? 1
            : Math.ceil(options.totalServerItems / options.pagingPageSize);
          }

          var deregS = $scope.$watchGroup(['grid.options.totalServerItems', 'grid.options.pagingPageSize']
            , function () {
              $scope.currentMaxPages = getMaxPages();
              setShowing();
            }
          );

          var deregP = $scope.$watchGroup(['grid.options.pagingCurrentPage', 'grid.options.pagingPageSize']
            , function (newValues, oldValues) {
              if (newValues === oldValues) return;

              if (!angular.isNumber(options.pagingCurrentPage) || options.pagingCurrentPage < 1) {
                options.pagingCurrentPage = 1;
                return;
              }

              if (options.totalServerItems > 0 && options.pagingCurrentPage > getMaxPages()) {
                options.pagingCurrentPage = getMaxPages();
                return;
              }

              setShowing();
              uiGridPagingService.onPagingChanged($scope.grid, options.pagingCurrentPage, options.pagingPageSize);
            }
          );

          $scope.$on('$destroy', function() {
            deregS();
            deregP();
          });

          $scope.pageForward = function () {
            if (options.totalServerItems > 0) {
              options.pagingCurrentPage = Math.min(options.pagingCurrentPage + 1, $scope.currentMaxPages);
            } else {
              options.pagingCurrentPage++;
            }
          }

          $scope.pageBackward = function () {
            options.pagingCurrentPage = Math.max(options.pagingCurrentPage - 1, 1);
          }

          $scope.pageToFirst = function () {
            options.pagingCurrentPage = 1;
          };

          $scope.pageToLast = function () {
            options.pagingCurrentPage = $scope.currentMaxPages;
          };

          $scope.cantPageForward = function () {
            if (options.totalServerItems > 0) {
              return options.pagingCurrentPage >= $scope.currentMaxPages;
            } else {
              return options.data.length < 1;
            }
          };
          
          $scope.cantPageToLast = function () {
            if (options.totalServerItems > 0) {
              return $scope.cantPageForward();
            } else {
              return true;
            }
          };
          
          $scope.cantPageBackward = function () {
            return options.pagingCurrentPage <= 1;
          };
        }
      };
    }
  ]);
})();