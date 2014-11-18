(function() {
  'use strict';
  /**
   * @ngdoc overview
   * @name ui.grid.paging
   *
   * @description
   *
   * #ui.grid.paging
   * This module provides paging support to ui-grid
   */
   
  var module = angular.module('ui.grid.paging', ['ui.grid']);

  /**
   * @ngdoc service
   * @name ui.grid.paging.service:uiGridPagingService
   *
   * @description Service for the paging feature
   */
  module.service('uiGridPagingService', ['gridUtil', 
    function (gridUtil) {
      var service = {
      /**
       * @ngdoc method
       * @name initializeGrid
       * @methodOf ui.grid.paging.service:uiGridPagingService
       * @description Attaches the service to a certain grid
       * @param {Grid} grid The grid we want to work with
       */
        initializeGrid: function (grid) {
          service.defaultGridOptions(grid.options);

          /**
          * @ngdoc object
          * @name ui.grid.paging.api:PublicAPI
          *
          * @description Public API for the paging feature
          */
          var publicApi = {
            events: {
              paging: {
              /**
               * @ngdoc event
               * @name pagingChanged
               * @eventOf ui.grid.paging.api:PublicAPI
               * @description This event fires when the pageSize or currentPage changes
               * @param {currentPage} requested page number
               * @param {pageSize} requested page size 
               */
                pagingChanged: function (currentPage, pageSize) { }
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
            if (grid.options.useExternalPaging || !grid.options.enablePaging) {
              return renderableRows;
            }
            //client side paging
            var pageSize = parseInt(grid.options.pagingPageSize, 10);
            var currentPage = parseInt(grid.options.pagingCurrentPage, 10);

            var firstRow = (currentPage - 1) * pageSize;
            return renderableRows.slice(firstRow, firstRow + pageSize);
          });

        },
        defaultGridOptions: function (gridOptions) {
          /**
           * @ngdoc property
           * @name enablePaging
           * @propertyOf ui.grid.class:GridOptions
           * @description Enables paging, defaults to true
           */
          gridOptions.enablePaging = gridOptions.enablePaging !== false;
          /**
           * @ngdoc property
           * @name useExternalPaging
           * @propertyOf ui.grid.class:GridOptions
           * @description Disables client side paging. When true, handle the pagingChanged event and set data and totalItems
           * defaults to false
           */           
          gridOptions.useExternalPaging = gridOptions.useExternalPaging === true;
          /**
           * @ngdoc property
           * @name totalItems
           * @propertyOf ui.grid.class:GridOptions
           * @description Total number of items, set automatically when client side paging, needs set by user for server side paging
           */
          if (gridUtil.isNullOrUndefined(gridOptions.totalItems)) {
            gridOptions.totalItems = 0;
          }
          /**
           * @ngdoc property
           * @name pagingPageSizes
           * @propertyOf ui.grid.class:GridOptions
           * @description Array of page sizes
           * defaults to [250, 500, 1000]
           */
          if (gridUtil.isNullOrUndefined(gridOptions.pagingPageSizes)) {
            gridOptions.pagingPageSizes = [250, 500, 1000];
          }
          /**
           * @ngdoc property
           * @name pagingPageSize
           * @propertyOf ui.grid.class:GridOptions
           * @description Page size
           * defaults to the first item in pagingPageSizes, or 0 if pagingPageSizes is empty
           */
          if (gridUtil.isNullOrUndefined(gridOptions.pagingPageSize)) {
            if (gridOptions.pagingPageSizes.length > 0) {
              gridOptions.pagingPageSize = gridOptions.pagingPageSizes[0];
            } else {              
              gridOptions.pagingPageSize = 0;
            }
          }
          /**
           * @ngdoc property
           * @name pagingCurrentPage
           * @propertyOf ui.grid.class:GridOptions
           * @description Current page number
           * default 1
           */
          if (gridUtil.isNullOrUndefined(gridOptions.pagingCurrentPage)) {
            gridOptions.pagingCurrentPage = 1;
          }
        },
        /**
         * @ngdoc method
         * @methodOf ui.grid.paging.service:uiGridPagingService
         * @name uiGridPagingService
         * @description  Raises pagingChanged and calls refresh for client side paging
         * @param {grid} the grid for which the paging changed
         * @param {currentPage} requested page number
         * @param {pageSize} requested page size 
         */
        onPagingChanged: function (grid, currentPage, pageSize) {
            grid.api.paging.raise.pagingChanged(currentPage, pageSize);
            if (!grid.options.useExternalPaging) {
              grid.refresh(); //client side paging
            }
        }
      };
      
      return service;
    }
  ]);
  /**
   *  @ngdoc directive
   *  @name ui.grid.paging.directive:uiGridPaging
   *  @element div
   *  @restrict A
   *
   *  @description Adds paging features to grid
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.paging']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Alex', car: 'Toyota' },
        { name: 'Sam', car: 'Lexus' },
        { name: 'Joe', car: 'Dodge' },
        { name: 'Bob', car: 'Buick' },
        { name: 'Cindy', car: 'Ford' },
        { name: 'Brian', car: 'Audi' },
        { name: 'Malcom', car: 'Mercedes Benz' },
        { name: 'Dave', car: 'Ford' },
        { name: 'Stacey', car: 'Audi' },
        { name: 'Amy', car: 'Acura' },
        { name: 'Scott', car: 'Toyota' },
        { name: 'Ryan', car: 'BMW' },
      ];

      $scope.gridOptions = {
        data: 'data',
        pagingPageSizes: [5, 10, 25],
        pagingPageSize: 5,
        columnDefs: [
          {name: 'name'},
          {name: 'car'}
        ];
       }
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="gridOptions" ui-grid-paging></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridPaging', ['gridUtil', 'uiGridPagingService', 
    function (gridUtil, uiGridPagingService) {
    /**
     * @ngdoc property
     * @name pagingTemplate
     * @propertyOf ui.grid.class:GridOptions
     * @description a custom template for the pager.  The default
     * is ui-grid/ui-grid-paging
     */
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

  /**
   *  @ngdoc directive
   *  @name ui.grid.paging.directive:uiGridPager
   *  @element div
   *
   *  @description Panel for handling paging
   */
  module.directive('uiGridPager', ['uiGridPagingService', 'uiGridConstants', 'gridUtil', 'i18nService',
    function (uiGridPagingService, uiGridConstants, gridUtil, i18nService) {
      return {
        priority: -200,
        scope: true,
        require: '^uiGrid',
        link: function ($scope, $elm, $attr, uiGridCtrl) {

          $scope.sizesLabel = i18nService.getSafeText('paging.sizes');
          $scope.totalItemsLabel = i18nService.getSafeText('paging.totalItems');
          
          var options = $scope.grid.options;
          
          uiGridCtrl.grid.renderContainers.body.registerViewportAdjuster(function (adjustment) {
            adjustment.height = adjustment.height - gridUtil.elementHeight($elm);
            return adjustment;
          });
          
          uiGridCtrl.grid.registerDataChangeCallback(function (grid) {
            if (!grid.options.useExternalPaging) {
              grid.options.totalItems = grid.rows.length;
            }
          }, [uiGridConstants.dataChange.ROW]);

          var setShowing = function () {
            $scope.showingLow = ((options.pagingCurrentPage - 1) * options.pagingPageSize) + 1;
            $scope.showingHigh = Math.min(options.pagingCurrentPage * options.pagingPageSize, options.totalItems);
          };

          var getMaxPages = function () {
            return (options.totalItems === 0) ? 1 : Math.ceil(options.totalItems / options.pagingPageSize);
          };

          var deregT = $scope.$watch('grid.options.totalItems + grid.options.pagingPageSize', function () {
              $scope.currentMaxPages = getMaxPages();
              setShowing();
            }
          );

          var deregP = $scope.$watch('grid.options.pagingCurrentPage + grid.options.pagingPageSize', function (newValues, oldValues) {
              if (newValues === oldValues) { 
                return; 
              }

              if (!angular.isNumber(options.pagingCurrentPage) || options.pagingCurrentPage < 1) {
                options.pagingCurrentPage = 1;
                return;
              }

              if (options.totalItems > 0 && options.pagingCurrentPage > getMaxPages()) {
                options.pagingCurrentPage = getMaxPages();
                return;
              }

              setShowing();
              uiGridPagingService.onPagingChanged($scope.grid, options.pagingCurrentPage, options.pagingPageSize);
            }
          );

          $scope.$on('$destroy', function() {
            deregT();
            deregP();
          });

          $scope.pageForward = function () {
            if (options.totalItems > 0) {
              options.pagingCurrentPage = Math.min(options.pagingCurrentPage + 1, $scope.currentMaxPages);
            } else {
              options.pagingCurrentPage++;
            }
          };

          $scope.pageBackward = function () {
            options.pagingCurrentPage = Math.max(options.pagingCurrentPage - 1, 1);
          };

          $scope.pageToFirst = function () {
            options.pagingCurrentPage = 1;
          };

          $scope.pageToLast = function () {
            options.pagingCurrentPage = $scope.currentMaxPages;
          };

          $scope.cantPageForward = function () {
            if (options.totalItems > 0) {
              return options.pagingCurrentPage >= $scope.currentMaxPages;
            } else {
              return options.data.length < 1;
            }
          };
          
          $scope.cantPageToLast = function () {
            if (options.totalItems > 0) {
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