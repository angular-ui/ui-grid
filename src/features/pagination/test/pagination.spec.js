describe('ui.grid.pagination uiGridPaginationService', function () {
  'use strict';

  var gridApi;
  var gridElement;
  var $rootScope;
  var $timeout;

  beforeEach(module('ui.grid'));
  beforeEach(module('ui.grid.pagination'));

  beforeEach(inject(function (_$rootScope_, _$timeout_, $compile) {
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;

    $rootScope.gridOptions = {
      columnDefs: [
        {name: 'col1'},
        {name: 'col2'},
        {name: 'col3'},
        {name: 'col4'}
      ],
      data: [
        {col1: '1_1', col2: 'G', col3: '1_3', col4: '1_4'},
        {col1: '2_1', col2: 'B', col3: '2_3', col4: '2_4'},
        {col1: '3_1', col2: 'K', col3: '3_3', col4: '3_4'},
        {col1: '4_1', col2: 'J', col3: '4_3', col4: '4_4'},
        {col1: '5_1', col2: 'A', col3: '5_3', col4: '5_4'},
        {col1: '6_1', col2: 'C', col3: '6_3', col4: '6_4'},
        {col1: '7_1', col2: 'D', col3: '7_3', col4: '7_4'},
        {col1: '8_1', col2: 'P', col3: '8_3', col4: '8_4'},
        {col1: '9_1', col2: 'Q', col3: '9_3', col4: '9_4'},
        {col1: '10_1', col2: 'X', col3: '10_3', col4: '10_4'},
        {col1: '11_1', col2: 'H', col3: '11_3', col4: '11_4'},
        {col1: '12_1', col2: 'Y', col3: '12_3', col4: '12_4'},
        {col1: '13_1', col2: 'I', col3: '13_3', col4: '13_4'},
        {col1: '14_1', col2: 'L', col3: '14_3', col4: '14_4'},
        {col1: '15_1', col2: 'T', col3: '15_3', col4: '15_4'},
        {col1: '16_1', col2: 'W', col3: '16_3', col4: '16_4'},
        {col1: '17_1', col2: 'E', col3: '17_3', col4: '17_4'},
        {col1: '18_1', col2: 'N', col3: '18_3', col4: '18_4'},
        {col1: '19_1', col2: 'F', col3: '19_3', col4: '19_4'},
        {col1: '20_1', col2: 'Z', col3: '20_3', col4: '20_4'},
        {col1: '21_1', col2: 'V', col3: '21_3', col4: '21_4'},
        {col1: '22_1', col2: 'O', col3: '22_3', col4: '22_4'},
        {col1: '23_1', col2: 'M', col3: '23_3', col4: '23_4'},
        {col1: '24_1', col2: 'U', col3: '24_3', col4: '24_4'},
        {col1: '25_1', col2: 'S', col3: '25_3', col4: '25_4'},
        {col1: '26_1', col2: 'R', col3: '26_3', col4: '26_4'}
      ],
      onRegisterApi: function (api) {
        gridApi = api;
      },
      enablePagination: true,
      paginationPageSize: 10
    };

    var element = angular.element('<div ui-grid="gridOptions" ui-grid-pagination></div>');
    document.body.appendChild(element[0]);
    gridElement = $compile(element)($rootScope);
    $rootScope.$digest();
  }));

  describe('initialisation', function () {
    it('registers the API and methods', function () {
      expect(gridApi.pagination.getPage).toEqual(jasmine.any(Function));
      expect(gridApi.pagination.getFirstRowIndex).toEqual(jasmine.any(Function));
      expect(gridApi.pagination.getLastRowIndex).toEqual(jasmine.any(Function));
      expect(gridApi.pagination.getTotalPages).toEqual(jasmine.any(Function));
      expect(gridApi.pagination.nextPage).toEqual(jasmine.any(Function));
      expect(gridApi.pagination.previousPage).toEqual(jasmine.any(Function));
      expect(gridApi.pagination.seek).toEqual(jasmine.any(Function));
    });
  });

  describe('pagination', function () {
    it('starts at page 1 with 10 records', function () {
      var gridRows = gridElement.find('div.ui-grid-row');

      expect(gridApi.pagination.getPage()).toBe(1);
      expect(gridRows.length).toBe(10);

      var firstCell = gridRows.eq(0).find('div.ui-grid-cell:first-child');
      expect(firstCell.text()).toBe('1_1');

      var lastCell = gridRows.eq(9).find('div.ui-grid-cell:last-child');
      expect(lastCell.text()).toBe('10_4');
    });

    it('calculates the total number of pages correctly', function () {
      expect(gridApi.pagination.getTotalPages()).toBe(3);
    });

    it('displays page 2 if I call nextPage()', function () {
      gridApi.pagination.nextPage();
      $rootScope.$digest();
      $timeout.flush();

      var gridRows = gridElement.find('div.ui-grid-row');

      expect(gridApi.pagination.getPage()).toBe(2);
      expect(gridRows.length).toBe(10);

      var firstCell = gridRows.eq(0).find('div.ui-grid-cell:first-child');
      expect(firstCell.text()).toBe('11_1');

      var lastCell = gridRows.eq(9).find('div.ui-grid-cell:last-child');
      expect(lastCell.text()).toBe('20_4');
    });

    it('displays only 6 rows on page 3', function () {
      gridApi.pagination.seek(3);
      $rootScope.$digest();
      $timeout.flush();

      var gridRows = gridElement.find('div.ui-grid-row');

      expect(gridApi.pagination.getPage()).toBe(3);
      expect(gridRows.length).toBe(6);

      var firstCell = gridRows.eq(0).find('div.ui-grid-cell:first-child');
      expect(firstCell.text()).toBe('21_1');

      var lastCell = gridRows.eq(5).find('div.ui-grid-cell:last-child');
      expect(lastCell.text()).toBe('26_4');
    });

    it('displays page 1 if I move to page 2 and back again', function () {
      gridApi.pagination.nextPage();
      gridApi.pagination.previousPage();
      $rootScope.$digest();

      expect(gridApi.pagination.getPage()).toBe(1);
    });

    it('does not allow to move before page 1', function () {
      gridApi.pagination.previousPage();
      $rootScope.$digest();

      expect(gridApi.pagination.getPage()).toBe(1);
    });

    it('does not allow to move past page 3', function () {
      gridApi.pagination.nextPage();
      gridApi.pagination.nextPage();
      gridApi.pagination.nextPage();
      $rootScope.$digest();

      expect(gridApi.pagination.getPage()).toBe(3);
    });

    it('paginates correctly on a sorted grid', function() {
      gridApi.grid.sortColumn(gridApi.grid.columns[1]).then(function () {
        $rootScope.$digest();
        $timeout.flush();

        var gridRows = gridElement.find('div.ui-grid-row');
        expect(gridApi.pagination.getPage()).toBe(1);
        expect(gridRows.eq(0).find('div.ui-grid-cell').eq(1).text()).toBe('A');
        expect(gridRows.eq(1).find('div.ui-grid-cell').eq(1).text()).toBe('B');
        expect(gridRows.eq(2).find('div.ui-grid-cell').eq(1).text()).toBe('C');
        expect(gridRows.eq(3).find('div.ui-grid-cell').eq(1).text()).toBe('D');
        expect(gridRows.eq(4).find('div.ui-grid-cell').eq(1).text()).toBe('E');
        expect(gridRows.eq(5).find('div.ui-grid-cell').eq(1).text()).toBe('F');
        expect(gridRows.eq(6).find('div.ui-grid-cell').eq(1).text()).toBe('G');
        expect(gridRows.eq(7).find('div.ui-grid-cell').eq(1).text()).toBe('H');
        expect(gridRows.eq(8).find('div.ui-grid-cell').eq(1).text()).toBe('I');
        expect(gridRows.eq(9).find('div.ui-grid-cell').eq(1).text()).toBe('J');

        gridApi.pagination.nextPage();
        $rootScope.$digest();

        gridRows = gridElement.find('div.ui-grid-row');
        expect(gridApi.pagination.getPage()).toBe(2);
        expect(gridRows.eq(0).find('div.ui-grid-cell').eq(1).text()).toBe('K');
      });
    });
  });

  describe('custom pagination', function () {

    var pages = ['COSU', 'DJLPQTVX', 'ABFGHIKNRY', 'EMWZ'];

    function getPage(data, pageNumber) {
      return data.filter(function(datum) {
        return pages[pageNumber-1].indexOf(datum.col2) >= 0;
      });
    }

    beforeEach(inject(function (_$rootScope_, _$timeout_, $compile) {
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;

      $rootScope.gridOptions.useCustomPagination = true;
      $rootScope.gridOptions.useExternalPagination = true;
      $rootScope.gridOptions.paginationPageSizes = [4,8,10,4];

      var data = $rootScope.gridOptions.data;
      $rootScope.gridOptions.data = getPage(data, 1);
      gridApi.pagination.on.paginationChanged($rootScope, function (pageNumber) {
        $rootScope.gridOptions.data = getPage(data, pageNumber);
      });

      $rootScope.$digest();
    }));

    it('starts at page 1 with 4 records', function () {
      var gridRows = gridElement.find('div.ui-grid-row');

      expect(gridApi.pagination.getPage()).toBe(1);
      expect(gridRows.length).toBe(4);

      var firstCell = gridRows.eq(0).find('div.ui-grid-cell:first-child');
      expect(firstCell.text()).toBe('6_1');

      var lastCell = gridRows.eq(3).find('div.ui-grid-cell:last-child');
      expect(lastCell.text()).toBe('25_4');
    });

    it('calculates the total number of pages correctly', function () {
      expect(gridApi.pagination.getTotalPages()).toBe(4);
    });

    it('displays page 2 if I call nextPage()', function () {
      gridApi.pagination.nextPage();
      $rootScope.$digest();
      $timeout.flush();

      var gridRows = gridElement.find('div.ui-grid-row');

      expect(gridApi.pagination.getPage()).toBe(2);
      expect(gridRows.length).toBe(8);

      var firstCell = gridRows.eq(0).find('div.ui-grid-cell:first-child');
      expect(firstCell.text()).toBe('4_1');

      var lastCell = gridRows.eq(7).find('div.ui-grid-cell:last-child');
      expect(lastCell.text()).toBe('21_4');
    });

    it('displays 10 rows on page 3', function () {
      gridApi.pagination.seek(3);
      $rootScope.$digest();
      $timeout.flush();

      var gridRows = gridElement.find('div.ui-grid-row');

      expect(gridApi.pagination.getPage()).toBe(3);
      expect(gridRows.length).toBe(10);

      var firstCell = gridRows.eq(0).find('div.ui-grid-cell:first-child');
      expect(firstCell.text()).toBe('1_1');

      var lastCell = gridRows.eq(9).find('div.ui-grid-cell:last-child');
      expect(lastCell.text()).toBe('26_4');
    });

    it('paginates correctly on a sorted grid', function() {
      gridApi.grid.sortColumn(gridApi.grid.columns[1]).then(function () {
        gridApi.pagination.seek(3);
        $rootScope.$digest();
        $timeout.flush();

        var gridRows = gridElement.find('div.ui-grid-row');
        expect(gridApi.pagination.getPage()).toBe(1);
        expect(gridRows.eq(0).find('div.ui-grid-cell').eq(1).text()).toBe('A');
        expect(gridRows.eq(1).find('div.ui-grid-cell').eq(1).text()).toBe('B');
        expect(gridRows.eq(2).find('div.ui-grid-cell').eq(1).text()).toBe('F');
        expect(gridRows.eq(3).find('div.ui-grid-cell').eq(1).text()).toBe('G');
        expect(gridRows.eq(4).find('div.ui-grid-cell').eq(1).text()).toBe('H');
        expect(gridRows.eq(5).find('div.ui-grid-cell').eq(1).text()).toBe('I');
        expect(gridRows.eq(6).find('div.ui-grid-cell').eq(1).text()).toBe('K');
        expect(gridRows.eq(7).find('div.ui-grid-cell').eq(1).text()).toBe('N');
        expect(gridRows.eq(8).find('div.ui-grid-cell').eq(1).text()).toBe('R');
        expect(gridRows.eq(9).find('div.ui-grid-cell').eq(1).text()).toBe('Y');

        gridApi.pagination.nextPage();
        $rootScope.$digest();

        gridRows = gridElement.find('div.ui-grid-row');
        expect(gridApi.pagination.getPage()).toBe(2);
        expect(gridRows.eq(0).find('div.ui-grid-cell').eq(1).text()).toBe('E');
      });
    });
  });
});
