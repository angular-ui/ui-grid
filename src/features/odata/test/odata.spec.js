/* global _ */
(function () {
  'use strict';
  describe('ui.grid.odata uiGridOdataService', function () {
    var uiGridOdataService;
    var grid;
    var gridClassFactory;
    var uiGridConstants;
    var $rootScope;
    var $scope;

    beforeEach(module('ui.grid.odata'));

    beforeEach(inject(function (_uiGridOdataService_, _gridClassFactory_, _uiGridConstants_, _$rootScope_) {
      uiGridOdataService = _uiGridOdataService_;
      gridClassFactory = _gridClassFactory_;
      uiGridConstants = _uiGridConstants_;
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();

      grid = gridClassFactory.createGrid({});

      grid = {
        enableCellEditOnFocus: true,
        enableCellSelection: true,
        enableSorting: true,
        enableGridMenu: true,
        enableColumnResizing: true,
        enableFiltering: true,
        treeRowHeaderAlwaysVisible: true,   //???
        //paginationPageSize: 5,
        enablePagination: false,
        //paginationPageSizes: [5,10,15],
        enableRowSelection: true,
        expandableRowTemplate: 'ui-grid/odataExpandableRowTemplate',

        //https://cdn.rawgit.com/angular-ui/ui-grid.info/gh-pages/data/500_complex.json
        odata: {
          metadatatype: 'xml',
          datatype: 'json',
          expandable: 'subgrid',
          entitySet: 'Products',
          dataurl: "http://services.odata.org/V4/OData/OData.svc/Products",
          metadataurl: 'http://services.odata.org/V4/OData/OData.svc/$metadata',
          gencolumns: true
        }
      };

      grid.onRegisterApi = function (gridApi) {
        gridApi.expandable.on.rowExpandedStateChanged($scope, function(row) {
          //gridUtil.logDebug('expanded: ' + row.entity.Description);
        });

        gridApi.odata.on.success($scope, function(grid) {
          //gridUtil.logDebug('succeeded');
        });

        gridApi.odata.on.error($scope, function(data, message) {
          //gridUtil.logError(message);
        });
      };

      uiGridOdataService.initializeGrid(grid, $scope);
    }));
  });
})();
