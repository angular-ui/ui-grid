(function() {

"use strict";

/* jasmine specs for directives go here */

describe('i18n', function () {
    var elm, resetElm, scope, compileGrid;
    var defaultLang = 'en';

    // Load the ngGrid module
    beforeEach(module('ngGrid'));
    
    describe('language', function() {
        // Loop over each available language in the i18n
        angular.forEach(window.ngGrid.i18n, function(langSpec, lang) {
            describe(lang, function() {
                describe('should have property', function() {
                    // Make sure each language has all the properties that the default language does
                    angular.forEach(window.ngGrid.i18n[defaultLang], function(value, key) {
                        it(key, function() {
                            expect(langSpec[key]).toBeDefined();
                        });
                    });
                });

                // TOOD: Need a better way a doing this. The idea is to make sure that for every language and every property in that language,
                //   it shows up in the compiled grid. The problem with using toContain() on the grid html is that when it fails you get an
                //   enormous dump in the console and it's impossible to debug.  And I'm not sure that we HAVE to test this...
                //
                // describe('properties', function() {
                //     beforeEach(inject(function ($rootScope, $domUtilityService, $templateCache, $compile) {
                //         var resetElm = angular.element(
                //             '<div ng-grid="gridOptions" style="width: 1000px; height: 1000px"></div>'
                //         );

                //         scope = $rootScope;
                //         scope.myData = [{name: "Moroni", age: 50},
                //                       {name: "Tiancum", age: 43},
                //                       {name: "Jacob", age: 27},
                //                       {name: "Nephi", age: 29},
                //                       {name: "Enos", age: 34}];

                //         scope.gridOptions = {
                //             data: 'myData',
                //             i18n: lang,
                //             groups: ['name']
                //         };

                //         // Re-usable compile function
                //         compileGrid = function() {
                //             elm = resetElm;
                //             $compile(elm)(scope);
                //             scope.$digest();
                //             // dump('compiling!');
                //         };
                //         compileGrid();
                //     }));

                //     // scope.gridOptions.i18n = lang;
                //     // compileGrid();

                //     it('should be properly set in the grid DOM', function() {
                //         angular.forEach(window.ngGrid.i18n[lang], function(value, key) {
                //             // expect(elm.html()).toContain(value);
                //         });
                //     });
                // });
            });
        });
    });
});

})();