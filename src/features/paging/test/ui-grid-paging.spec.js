/**
 * Created by malcolm on 11/4/14.
 */
describe('ui.grid.paging uiGridPagingService', function () {
    'use strict';
    var $scope, element,gridApi,gridElement,$rootScope;
    var data = [
        { "name": "Ethel Price", "gender": "female", "age": 25, "company": "Enersol", phone: '111'},
        { "name": "Claudine Neal", "gender": "female", "age": 30, "company": "Sealoud", phone: '111'},
        { "name": "Beryl Rice", "gender": "female", "age": 35, "company": "Velity", phone: '111'},
        { "name": "Wilder Gonzales", "gender": "male", "age": 40, "company": "Geekko", phone: '111'},
        { "name": "Price", "gender": "female", "age": 25, "company": "Enersol", phone: '111'},
        { "name": "Neal", "gender": "female", "age": 30, "company": "Sealoud", phone: '111'},
        { "name": "Rice", "gender": "female", "age": 35, "company": "Velity", phone: '111'},
        { "name": "Gonzales", "gender": "male", "age": 40, "company": "Geekko", phone: '111'},
        { "name": "Ethel", "gender": "female", "age": 25, "company": "Enersol", phone: '111'},
        { "name": "Claudine", "gender": "female", "age": 30, "company": "Sealoud", phone: '111'},
        { "name": "Beryl", "gender": "female", "age": 35, "company": "Velity", phone: '111'},
        { "name": "Wilder", "gender": "male", "age": 40, "company": "Geekko", phone: '111'}
    ];
    var data2=[
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
        {col1: '26_1', col2: 'R', col3: '26_3', col4: '26_4'}];

    beforeEach(module('ui.grid'));
    beforeEach(module('ui.grid.paging'));

    beforeEach(inject(function (_$rootScope_, $compile) {
        $rootScope = _$rootScope_;

        $rootScope.gridOptions = {
            data: data,
            pagingPageSizes: [5, 10, 25, 50],
            pagingPageSize: 5,
            pagingCurrentPage: 1,
            totalItems: data.length,
            useExternalPaging:false,
            onRegisterApi: function (api) {
                gridApi = api;
            }
        };

        var element = angular.element('<div ui-grid="gridOptions" ui-grid-paging ></div>');
        document.body.appendChild(element[0]);
        gridElement = $compile(element)($rootScope);
        $rootScope.$digest();
    }));

    describe('pagination', function () {
        it('starts at page 1 with 5 records', function () {
            var gridRows = gridElement.find('div.ui-grid-row');

            // expect(gridApi.pagination.getPage()).toBe(1);
            expect(gridRows.length).toBe(5);

            var firstCell = gridRows.eq(0).find('div.ui-grid-cell:first-child');
            expect(firstCell.text()).toBe('Ethel Price');

            var lastCell = gridRows.eq(4).find('div.ui-grid-cell:last-child');
            expect(lastCell.text()).toBe('111');
        });
    });
});