(function() {

"use strict";

/* jasmine specs for directives go here */

describe('directives', function () {
    var $dUtils;
    var $scope;
    var $linker;
    var $cache;
    var elm, scope;

    // Load the ngGrid module
    beforeEach(module('ngGrid'));

    beforeEach(inject(function ($rootScope, $domUtilityService, $templateCache, $compile) {
        $scope = $rootScope.$new();
        $dUtils = $domUtilityService;
        $linker = $compile;
        $cache = $templateCache;

        elm = angular.element(
            '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
        );

        scope = $rootScope;
        scope.myData = [{name: "Moroni", age: 50},
                      {name: "Tiancum", age: 43},
                      {name: "Jacob", age: 27},
                      {name: "Nephi", age: 29},
                      {name: "Enos", age: 34}];
        scope.gridOptions = { data: 'myData' };

        $compile(elm)(scope);
        scope.$digest();
    }));

    describe('ng-cell-has-focus', function() {
        it('should do something', function() {
            //add work here
        });
    });
    describe('ng-cell-text', function () {
        it('should do something', function () {
            //add work here
        });
    });
    describe('ng-cell', function () {
        it('should do something', function () {
            //add work here
        });
    });

    describe('ng-header-cell', function () {
        it('should do something', function () {
            //add work here
        });
    });
    describe('ng-header-row', function () {
        it('should do something', function () {
            //add work here
        });
    });
    describe('ng-if', function () {
        it('should do something', function () {
            //add work here
        });
    });
    describe('ng-input', function () {
        it('should do something', function () {
            //add work here
        });
    });
    describe('ng-row', function () {
        it('should do something', function () {
            //add work here
        });
    });
    describe('ng-viewport', function () {
        it('should do something', function () {
            //add work here
        });
    });
    describe('ng-grid', function () {
        describe('grid classes', function () {
            describe('aggregate', function () {
                it('should do something', function () {
                    //add work here
                });
            });

            describe('column', function () {
                it('should allow colDef.enableCellEdit to override config.enableCellEdit', inject(function ($rootScope, $compile) {
                    elm = angular.element(
                        '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
                    );

                    $rootScope.myData = [{name: "Moroni", age: 50},
                                    {name: "Tiancum", age: 43},
                                    {name: "Jacob", age: 27},
                                    {name: "Nephi", age: 29},
                                    {name: "Enos", age: 34}];

                    $rootScope.gridOptions = {
                        data: 'myData',
                        enableCellEdit: true,
                        columnDefs: [
                            {field:'name', enableCellEdit: false },
                            {field:'age' }
                        ]
                    };

                    var element = $compile(elm)($rootScope);
                    $rootScope.$digest();

                    var cell = element.find('.ngRow:eq(0) .ngCell.col0 [ng-dblclick]');

                    // Have to use jasmine's async testing helpers to get around the setTimeout(..., 0) in ng-cell-has-focus.editCell()
                    runs(function() {
                        browserTrigger(cell, 'dblclick');
                    });
                    waits(200);
                    runs(function() {
                        expect(cell.find('input').length).toEqual(0);
                    });
                }));
            });

            describe('column', function () {
                describe('cell editing', function () {
                    var elm, element, $scope, $compile, $sniffer;

                    beforeEach(inject(function ($rootScope, _$compile_, _$sniffer_) {
                        $compile = _$compile_;
                        $scope = $rootScope;
                        $sniffer = _$sniffer_;
                        elm = angular.element(
                            '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
                        );

                        $scope.myData = [{name: "Moroni", age: 'test' },
                                        {name: "Tiancum", age: 43},
                                        {name: "Jacob", age: 27},
                                        {name: "Nephi", age: 29},
                                        {name: "Enos", age: 34}];

                        $scope.gridOptions = {
                            data: 'myData',
                            enableCellEdit: true,
                            columnDefs: [
                                {field:'name', enableCellEdit: false },
                                {field:'age' }
                            ]
                        };

                        element = $compile(elm)($scope);
                        $scope.$digest();
                    }));

                    it('should allow colDef.enableCellEdit to override config.enableCellEdit', function() {
                        var cell = element.find('.ngRow:eq(0) .ngCell.col0 [ng-dblclick]');

                        // Have to use jasmine's async testing helpers to get around the setTimeout(..., 0) in ng-cell-has-focus.editCell()
                        runs(function() {
                            browserTrigger(cell, 'dblclick');
                        });
                        waits(200);
                        runs(function() {
                            expect(cell.find('input').length).toEqual(0);
                        });
                    });

                    it('should not throw an exception when the column contains a non-string', function() {
                        var cell = element.find('.ngRow:eq(0) .ngCell.col1 [ng-dblclick]');

                        runs(function() {
                            browserTrigger(cell, 'dblclick');
                        });
                        waits(200);
                        runs(function() {
                            expect(function(){
                                // Trigger the input handler
                                var input = cell.find('input');
                                input.triggerHandler('keyup');
                            }).not.toThrow();
                        });
                    });

                    it('should allow editing of complex properties', function() {
                        // Update the grid data to use complex properties
                        elm = angular.element(
                            '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
                        );

                        $scope.myData = [
                            {
                                address: '123 Main St',
                                person: {
                                    name: 'Bob',
                                    age: 20
                                }
                            },
                            {
                                address: '1600 Pennsylvania Ave.',
                                person: {
                                    name: 'Barack',
                                    age: 51
                                }
                            }
                        ];
                        $scope.gridOptions.columnDefs =  [
                            { field: 'person.name' },
                            { field: 'person.age' },
                            { field: 'address' }
                        ];

                        // Recompile the grid
                        element = $compile(elm)($scope);
                        $scope.$digest();

                        // Get the first editable cell
                        var cell = element.find('.ngRow:eq(0) .ngCell.col0 [ng-dblclick]');

                        runs(function() {
                            // Double-click on the first editable cell
                            browserTrigger(cell, 'dblclick');
                        });
                        waits(200);
                        runs(function() {
                            var input = cell.find('input');

                            expect(input.val()).toEqual('Bob');

                            // Change the value to 'Test'
                            var testName = 'Test Name';
                            input.val(testName);

                            browserTrigger(input, $sniffer.hasEvent('input') ? 'input' : 'change');

                            // The value of the input should stay 'Test'
                            expect(input.val()).toEqual(testName);

                            // The change should be reflected in the data array
                            expect($scope.myData[0].person.name).toEqual(testName);

                            // Blur so the input goes away
                            input.blur();

                            // 'Test' should be visible in the cell html
                            expect(element.find('.ngRow:eq(0) .ngCell.col0').text()).toContain(testName);
                        });
                    });

                    // TODO: add a test for enter key modifying the inputted contents
                });

                describe('displayName option', function() {
                    beforeEach(inject(function ($rootScope, $domUtilityService, $templateCache, $compile) {
                        $scope = $rootScope.$new();
                        $dUtils = $domUtilityService;
                        $linker = $compile;
                        $cache = $templateCache;

                        elm = angular.element(
                            '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
                        );
                        scope = $rootScope;
                        scope.myData = [{name: "Moroni", age: 50},
                                      {name: "Tiancum", age: 43},
                                      {name: "Jacob", age: 27},
                                      {name: "Nephi", age: 29},
                                      {name: "Enos", age: 34}];
                        scope.gridOptions = {
                            data: 'myData',
                            columnDefs: [
                                { field : 'name' },
                                { field : 'age', displayName: '' },
                            ]
                        };
                        $compile(elm)(scope);
                        scope.$digest();
                    }));

                    it('should default to the field name when undefined', function() {
                        expect(elm.find('.ngHeaderText:eq(0)').text()).toEqual('name');
                    });

                    it('should not default to the column field name when set to an empty string', function () {
                        expect(elm.find('.ngHeaderText:eq(1)').text()).toEqual('');
                    });
                });
            });

            describe('domAccessProvider', function () {
                it('should do something', function () {
                    //add work here
                });
            });
            describe('eventProvider', function () {
                it('should do something', function () {
                    //add work here
                });
            });
            describe('footer', function () {
                var scope,
                    elm,
                    element,
                    comp;

                beforeEach(inject(function ($rootScope, $compile) {
                    scope = $rootScope;
                    comp = $compile;

                    elm = angular.element(
                        '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
                    );

                    scope.myData = [{name: "Moroni", age: 50},
                                         {name: "Tiancum", age: 43},
                                         {name: "Jacob", age: 27},
                                         {name: "Nephi", age: 29},
                                         {name: "Enos", age: 34}];

                    scope.gridOptions = {
                        data: 'myData',
                        totalServerItems: 357
                    };
                }));

                it('should show the proper number of total items when it is a number', function(){
                    // Compile the grid as-is with a stringy totalServerItems
                    element = comp(elm)(scope);
                    scope.$digest();

                    expect(element.find('.ngFooterTotalItems').text()).toContain(5);
                });

                it('should update the total items when totalServerItems is increased', function () {
                    // Compile the grid with a stringy totalServerItems
                    scope.serverItems = 357;
                    scope.gridOptions.totalServerItems = 'serverItems';
                    element = comp(elm)(scope);
                    scope.$digest();

                    // The number should be correct of the bat
                    expect(element.find('.ngFooterTotalItems').text()).toContain(357);

                    // If we update the totalServerItems...
                    scope.serverItems = 308;
                    scope.$digest();

                    // ...totalServerItems in the grid's scope should be updated.
                    expect(element.scope().totalServerItems).toEqual(308);

                    // ...it should be reflected in the default footer template
                    expect(element.find('.ngFooterTotalItems').text()).toContain(308);
                });
            });
            describe('grid', function () {
                describe('initTemplates', function() {
                   it('should not call Array.forEach() on the template list (IE8 does not support)', inject(function ($rootScope, $compile) {
                        var elm = angular.element(
                            '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
                        );
                        $compile(elm)($rootScope);

                        spyOn(angular, 'forEach');
                        spyOn(Array.prototype, 'forEach');

                        // Manually call the initTemplates() function again
                        elm.scope().gridOptions.ngGrid.initTemplates();

                        // dump(Array.prototype.forEach.mostRecentCall);

                        expect(angular.forEach).toHaveBeenCalled();
                    }));
                });

                describe('sortData', function (){
                    it('should properly sort even when no event is passed ( programatically )', inject(function($rootScope, $compile) {
                        var sortOptions = angular.extend( scope.gridOptions, {
                            useExternalSorting: true,
                            columnDefs: [
                                { field:'name' },
                                { field:'age' }
                            ],
                            sortInfo: { fields: ['name'], directions: [ 'asc' ] }
                        });

                        var elm = angular.element(
                            '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
                        );
                        $compile(elm)($rootScope);
                        $rootScope.$digest();

                        //checking that the arrow is displayed on the correct row in the correct orientation
                        //and the other columns are not changed
                        expect( elm.find('.ngHeaderSortColumn:last .ngSortButtonUp').hasClass('ng-hide')).toBe( true );
                        expect( elm.find('.ngHeaderSortColumn:first .ngSortButtonUp').hasClass('ng-hide')).toBe( true );
                        expect( elm.find('.ngHeaderSortColumn:last .ngSortButtonDown').hasClass('ng-hide')).toBe( true );
                        expect( elm.find('.ngHeaderSortColumn:first .ngSortButtonDown').hasClass('ng-hide')).toBe( false ); //the first column ( name ) show be sorted asc

                        //programatically trigger sort
                        sortOptions.sortInfo.fields[0] = 'age';
                        $rootScope.$digest();

                        //checking that the arrow is displayed on the correct row in the correct orientation
                        //and the other columns are not changed
                        expect( elm.find('.ngHeaderSortColumn:last .ngSortButtonUp').hasClass('ng-hide')).toBe( true );
                        expect( elm.find('.ngHeaderSortColumn:first .ngSortButtonUp').hasClass('ng-hide')).toBe( true );
                        expect( elm.find('.ngHeaderSortColumn:last .ngSortButtonDown').hasClass('ng-hide')).toBe( false ); //the second column ( age ) show be sorted asc
                        expect( elm.find('.ngHeaderSortColumn:first .ngSortButtonDown').hasClass('ng-hide')).toBe( true );

                        //programatically trigger sort
                        sortOptions.sortInfo.fields[0] = 'name';
                        sortOptions.sortInfo.directions[0] = 'desc';
                        $rootScope.$digest();

                        //checking that the arrow is displayed on the correct row in the correct orientation
                        //and the other columns are not changed
                        expect( elm.find('.ngHeaderSortColumn:last .ngSortButtonUp').hasClass('ng-hide')).toBe( true );
                        expect( elm.find('.ngHeaderSortColumn:first .ngSortButtonUp').hasClass('ng-hide')).toBe( false ); //the first column ( name ) show be sorted desc
                        expect( elm.find('.ngHeaderSortColumn:last .ngSortButtonDown').hasClass('ng-hide')).toBe( true );
                        expect( elm.find('.ngHeaderSortColumn:first .ngSortButtonDown').hasClass('ng-hide')).toBe( true );

                    }));
                });

                describe('sortActual', function(){
                    it('should maintain row selection post-sort', function(){
                        scope.gridOptions.selectItem(0, true);
                        scope.$digest();
                        scope.gridOptions.sortBy('age');
                        scope.$digest();

                        var oldRow = elm.find('.ngRow:last');
                        expect(oldRow.html()).toMatch(/.+\s+.+\s+.+Moroni/);
                        expect(oldRow.html()).toMatch(/\s+.+50.+/);
                        expect(oldRow.hasClass('selected')).toBe(true);
                    });

                    it('should allow newly created rows to be selected', function(){
                        // Create a new row
                        var rowIndex = scope.myData.push({ name: 'Bob', age: '8' });
                        scope.$digest();
                        scope.gridOptions.selectItem(rowIndex-1, true);
                        scope.$digest();

                        var newRow = elm.find('.ngRow:nth-child(' + (rowIndex) + ')');
                        expect(newRow.hasClass('selected')).toBe(true);
                    });
                });
            });
            describe('row', function () {
                it('should do something', function () {
                    //add work here
                });
            });
            describe('rowFactory', function () {
                it('should do something', function () {
                    //add work here
                });
            });
            describe('searchProvider', function () {
                beforeEach(inject(function ($rootScope, $domUtilityService, $templateCache, $compile) {
                    $scope = $rootScope.$new();
                    $dUtils = $domUtilityService;
                    $linker = $compile;
                    $cache = $templateCache;

                    elm = angular.element(
                        '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
                    );
                    scope = $rootScope;

                    scope.filterOptions = {
                    filterText: ''
                    };

                    scope.myData = [
                        {name: "Moroni",  obj1: {age: 50}, birthdate: new Date(1963, 9, 13, 5,6,7,0), obj2: {grade: 'one'} },
                        {name: "Tiancum", obj1: {age: 43}, birthdate: new Date(1970, 2, 13, 8,5,4,0), obj2: {grade: 'two'} },
                        {name: "Jacob",   obj1: {age: 27}, birthdate: new Date(1989, 3, 13, 4,4,3,0), obj2: {grade: 'three'} },
                        {name: "Nephi",   obj1: {age: 29}, birthdate: new Date(1987, 4, 13, 7,3,2,0), obj2: {grade: 'four'} },
                        {name: "Enos",    obj1: {age: 34}, birthdate: new Date(1979, 5, 13, 9,2,1,0), obj2: {grade: 'five'} }];

                    scope.gridOptions = {
                    data: 'myData',
                    filterOptions: scope.filterOptions,
                    showFooter: true,
                    columnDefs: [
                                 { field: 'name' },
                                 { field: 'obj1.age' },
                                 { field: 'birthdate', cellFilter: "date:'MM-dd-yyyy'" },
                                 { field: 'obj2.grade'}
                                 ]
                    };

                    $compile(elm)(scope);
                    scope.$digest();
                }));

                it('should find values in properties that come after the first object', function() {
                    expect(elm.find('.ngFooterTotalItems').text()).toContain(5);

                    // Enter search text
                    scope.filterOptions.filterText = 'two';
                    scope.$digest();
                    expect(elm.find('.ngFooterTotalItems').text()).toContain('Showing Items: 1');
                });
                it('should find formatted dates', function() {
                    expect(elm.find('.ngFooterTotalItems').text()).toContain(5);

                    // Enter search text
                    scope.filterOptions.filterText = '10-13-1963';
                    scope.$digest();
                    expect(elm.find('.ngFooterTotalItems').text()).toContain('Showing Items: 1');

                    scope.filterOptions.filterText = '-13-';
                    scope.$digest();
                    expect(elm.find('.ngFooterTotalItems').text()).toContain('Showing Items: 5');
                });
                it('should find values string fields case insensitively', function() {
                    expect(elm.find('.ngFooterTotalItems').text()).toContain(5);

                    // Enter search text (should find enos and nephi) + (one and three)
                    scope.filterOptions.filterText = 'E';
                    scope.$digest();
                    expect(elm.find('.ngFooterTotalItems').text()).toContain('Showing Items: 4');
                });
            });

            describe('searchProvider cellFilter bug #1170', function () {
                beforeEach(inject(function ($rootScope, $domUtilityService, $templateCache, $compile) {
                    $linker = $compile;

                    scope = $rootScope;
                    scope.filterOptions = {
                        filterText: ''
                    };

                    scope.myData = [
                        {name: "Moroni",  birthdate: new Date(1963, 9, 13, 5,6,7,0) },
                        {name: "Tiancum", birthdate: new Date(1970, 2, 13, 8,5,4,0) },
                        {name: "Jacob",   birthdate: new Date(1989, 3, 13, 4,4,3,0) },
                        {name: "Nephi",   birthdate: new Date(1987, 4, 13, 7,3,2,0) },
                        {name: "Enos",    birthdate: new Date(1979, 5, 13, 9,2,1,0) }
                    ];

                    scope.gridOptions = {
                        data: 'myData',
                        filterOptions: scope.filterOptions,
                        showFooter: true,
                        columnDefs: [
                            { field: 'name' },
                            { field: 'birthdate' }
                        ]
                    };

                    // install filter that accepts a no-quoted param. param must be true or false
                    angular.module('ngGrid').filter('reverse', function() {
                        return function(value, param) {
                            if (param === 'true') {
                                return value.split('').reverse().join('');
                            }
                            return value;
                        };
                    });
                }));

                it('should find values filtered through a $filter with quoted parameter', function() {
                    var element = angular.element(
                        '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
                    );
                    scope.gridOptions.columnDefs[1].cellFilter = "date:'MM-dd-yyyy'";
                    $linker(element)(scope);
                    scope.$digest();

                    // verify everything is right
                    expect(element.find('.ngFooterTotalItems').text()).toContain(5);

                    // Enter search text
                    scope.filterOptions.filterText = '-13-197'; // XX-13-197X
                    scope.$digest();
                    expect(element.find('.ngFooterTotalItems').text()).toContain('Showing Items: 2');
                });

                it('should find values filtered through a $filter without parameters', function() {
                    var element = angular.element(
                        '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
                    );
                    scope.gridOptions.columnDefs[1].cellFilter = 'date';
                    $linker(element)(scope);
                    scope.$digest();

                    // verify everything is right
                    expect(element.find('.ngFooterTotalItems').text()).toContain(5);

                    // Enter search text
                    scope.filterOptions.filterText = '197'; // looking for year 197X
                    scope.$digest();
                    expect(element.find('.ngFooterTotalItems').text()).toContain('Showing Items: 2');
                });

                it('should find values filtered through a $filter with no-quoted parameter', function() {
                    var element = angular.element(
                        '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
                    );
                    scope.gridOptions.columnDefs[0].cellFilter = 'reverse:true';
                    $linker(element)(scope);
                    scope.$digest();

                    // verify everything is right
                    expect(element.find('.ngFooterTotalItems').text()).toContain(5);

                    // Enter search text
                    scope.filterOptions.filterText = 'mucnaiT'; // looking for year 197X
                    scope.$digest();
                    expect(element.find('.ngFooterTotalItems').text()).toContain('Showing Items: 1');
                });
            });

            describe('selectionProvider', function () {
                it('should do something', function () {
                    //add work here
                });
            });
            describe('styleProvider', function () {
                it('should do something', function () {
                    //add work here
                });
            });
        });
        describe('templates', function () {
            describe('aggregateTemplate', function () {
                it('should do something', function () {
                    //add work here
                });
            });
            describe('checkboxCellTemplate', function () {
                it('should do something', function () {
                    //add work here
                });
            });
            describe('checkboxHeaderTemplate', function () {
                it('should do something', function () {
                    //add work here
                });
            });
            describe('headerRowTemplate', function () {
                it('should do something', function () {
                    //add work here
                });
            });
            describe('rowTemplate', function () {
                it('should do something', function () {
                    //add work here
                });
            });
        });
        describe('scope functions', function () {
            it('should do something', function () {
                //add work here
            });
        });
        describe('grid functions', function () {
            it('should do something', function () {
                //add work here
            });
        });
    });
});

})();
