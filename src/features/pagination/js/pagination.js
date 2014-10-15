(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.pagination
   *
   * @description
   *
   * #ui.grid.pagination
   * This module provides pagination support to ui-grid
   */
  var module = angular.module('ui.grid.pagination', ['ui.grid']);

  /**
   * @ngdoc service
   * @name ui.grid.pagination.service:uiGridPaginationService
   *
   * @description Service for the pagination feature
   */
  module.service('uiGridPaginationService', function () {
    var service = {

      /**
       * @ngdoc method
       * @name initializeGrid
       * @methodOf ui.grid.pagination.service:uiGridPaginationService
       * @description Attaches the service to a certain grid
       * @param {Grid} grid The grid we want to work with
       */
      initializeGrid: function (grid) {
        service.defaultGridOptions(grid.options);
        grid.pagination = {page: 1, totalPages: 1};

        /**
         * @ngdoc object
         * @name ui.grid.pagination.api:PublicAPI
         *
         * @description Public API for the pagination feature
         */
        var publicApi = {
          methods: {
            pagination: {
              /**
               * @ngdoc method
               * @name getPage
               * @methodOf ui.grid.pagination.api:PublicAPI
               * @description Returns the number of the current page
               */
              getPage: function () {
                return grid.pagination.page;
              },
              /**
               * @ngdoc method
               * @name getTotalPages
               * @methodOf ui.grid.pagination.api:PublicAPI
               * @description Returns the total number of pages
               */
              getTotalPages: function () {
                return grid.pagination.totalPages;
              },
              /**
               * @ngdoc method
               * @name nextPage
               * @methodOf ui.grid.pagination.api:PublicAPI
               * @description Moves to the next page, if possible
               */
              nextPage: function () {
                grid.pagination.page++;
                grid.refresh();
              },
              /**
               * @ngdoc method
               * @name previousPage
               * @methodOf ui.grid.pagination.api:PublicAPI
               * @description Moves to the previous page, if we're not on the first page
               */
              previousPage: function () {
                grid.pagination.page = Math.max(1, grid.pagination.page - 1);
                grid.refresh();
              },
              seek: function (page) {
                if (!angular.isNumber(page) || page < 1) {
                  throw 'Invalid page number: ' + page;
                }

                grid.pagination.page = page;
                grid.refresh();
              }
            }
          }
        };
        grid.api.registerMethodsFromObject(publicApi.methods);
        grid.registerRowsProcessor(function (renderableRows) {
          if (!grid.options.enablePagination) {
            return renderableRows;
          }
          grid.pagination.totalPages = Math.max(
            1,
            Math.ceil(renderableRows.length / grid.options.rowsPerPage)
          );

          var firstRow = (grid.pagination.page - 1) * grid.options.rowsPerPage;
          if (firstRow >= renderableRows.length) {
            grid.pagination.page = grid.pagination.totalPages;
            firstRow = (grid.pagination.page - 1) * grid.options.rowsPerPage;
          }

          return renderableRows.slice(
            firstRow,
            firstRow + grid.options.rowsPerPage
          );
        });
      },

      defaultGridOptions: function (gridOptions) {
        /**
         *  @ngdoc object
         *  @name ui.grid.pagination.api:GridOptions
         *
         *  @description GridOptions for the pagination feature, these are available to be
         *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
         */

        /**
         *  @ngdoc object
         *  @name enablePagination
         *  @propertyOf  ui.grid.pagination.api:GridOptions
         *  @description Enable pagination for this grid
         *  <br/>Defaults to true
         */
        gridOptions.enablePagination = gridOptions.enablePagination !== false;

        /**
         *  @ngdoc object
         *  @name rowsPerPage
         *  @propertyOf  ui.grid.pagination.api:GridOptions
         *  @description The number of rows that should be displayed per page
         *  <br/>Defaults to 10
         */
        gridOptions.rowsPerPage = angular.isNumber(gridOptions.rowsPerPage) ? gridOptions.rowsPerPage : 10;
      }
    };

    return service;
  });

  /**
   * @ngdoc directive
   * @name ui.grid.pagination.directive:uiGridPagination
   * @element div
   * @restrict A
   *
   * @description Adds pagination support to a grid.
   */
  module.directive('uiGridPagination', ['uiGridPaginationService', function (uiGridPaginationService) {
    return {
      priority: -400,
      scope: false,
      require: '^uiGrid',
      link: {
        pre: function (scope, element, attrs, uiGridCtrl) {
          uiGridPaginationService.initializeGrid(uiGridCtrl.grid);
        }
      }
    };
  }]);
})();
