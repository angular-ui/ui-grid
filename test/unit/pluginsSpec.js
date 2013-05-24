(function() {

"use strict";

/* jasmine specs for plugins go here */

describe('plugins', function () {
    var elm, scope;

    var initalizeHelper = function(gridOptions) {
        return inject(function($rootScope, $compile) {
            elm = angular.element(
                '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
            );

            scope = $rootScope;
            scope.myData = [{ name: "Moroni", age: 50 },
                { name: "Tiancum", age: 43 },
                { name: "Jacob", age: 27 },
                { name: "Nephi", age: 29 },
                { name: "Enos", age: 34 }];
            
            scope.gridOptions = $.extend(true, { data: 'myData' }, gridOptions);

            $compile(elm)(scope);
            
            scope.$digest();
        });
    };
    // Load the ngGrid module
    beforeEach(module('ngGrid'));

    describe('ng-grid-wysiwyg-export', function () {
        describe('initialization', function () {
            var testData = function(data) {
                expect(data.columns.length).toBe(2);
                expect(data.columns[0]).toBe('name');
                expect(data.columns[1]).toBe('age');

                expect(data.data.length / data.columns.length).toBe(scope.myData.length);
                expect(data.data.length % data.columns.length).toBe(0);
            };

            describe('function-literal', function() {
                beforeEach(initalizeHelper({ plugins: [ngGridWYSIWYGPlugin] }));

                it('should work if the plugin being passed in is a function literal', function() {
                    testData(scope.gridOptions.plugins['ngGridWYSIWYGPlugin'].exportData());
                });
            });

            describe('instance', function() {
                beforeEach(initalizeHelper({ plugins: [new ngGridWYSIWYGPlugin()] }));

                it('should work if the plugin being passed in is an instance', function() {
                    testData(scope.gridOptions.plugins['ngGridWYSIWYGPlugin'].exportData());
                });
            });
        });
        //describe('filtering', function () {
        //    var testData = function (data) {
        //        expect(data.columns.length).toBe(2);
        //        expect(data.columns[0]).toBe('name');
        //        expect(data.columns[1]).toBe('age');

        //        expect(data.data.length).toBe(2);
        //    };

        //    describe('function-literal', function () {
        //        beforeEach(initalizeHelper({
        //            plugins: [ngGridWYSIWYGPlugin],
        //            filterOptions: { filterText: '', useExternalFilter: false },
        //        }));

        //        it('should work if the plugin being passed in is a function literal', function () {
        //            testData(scope.gridOptions.plugins['ngGridWYSIWYGPlugin'].export());
        //        });
        //    });

        //    describe('instance', function () {
        //        beforeEach(initalizeHelper({
        //            plugins: [new ngGridWYSIWYGPlugin()],
        //            filterOptions: { filterText: 'Jacob', useExternalFilter: false },
        //        }));

        //        it('should work if the plugin being passed in is an instance', function () {
        //            var flag = false;
        //            runs(function () {
        //                scope.$digest();
        //                setTimeout(function () {
        //                    flag = true;
        //                    scope.$digest();
        //                }, 500);
        //            });
        //            waitsFor(function () {
        //                return flag;
        //            });
        //            runs(function () {
        //                testData(scope.gridOptions.plugins['ngGridWYSIWYGPlugin'].export());
        //            });
        //        });
        //    });
        //});
    });

});

})();