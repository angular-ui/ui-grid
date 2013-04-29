'use strict';

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
                it('should do something', function () {
                    //add work here
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
                it('should do something', function () {
                    //add work here
                });
            });
            describe('grid', function () {
                describe('sortActual', function(){
                    it('should maintain row selection post-sort', function(){
                        scope.gridOptions.selectItem(0, true);
                        scope.$digest();
                        scope.gridOptions.sortBy('age');
                        scope.$digest();

                        var oldRow = elm.find('.ngRow:last');
                        expect(oldRow.html()).toMatch(/Moroni.+?50/);
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
                it('should do something', function () {
                    //add work here
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
