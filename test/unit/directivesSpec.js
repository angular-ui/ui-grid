'use strict';

/* jasmine specs for directives go here */

describe('directives', function () {
    var $dUtils;
    var $scope;
    var $linker;
    var $cache;
    beforeEach(module('ngGrid'));
    beforeEach(inject(function ($rootScope, $domUtilityService, $templateCache, $compile) {
        $scope = $rootScope.$new();
        $dUtils = $domUtilityService;
        $linker = $compile;
        $cache = $templateCache;
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
                it('should do something', function () {
                    //add work here
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
