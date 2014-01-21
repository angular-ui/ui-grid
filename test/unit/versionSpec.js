(function() {

"use strict";

describe('version', function () {
    // Load the ngGrid module
    beforeEach(module('ngGrid'));
    
    describe('version available for ng-grid module', function() {
        it('should have a properly formatted version object that is globally accessable', function () {
            expect(ngGrid.version.full.length).toBeTruthy();
            expect(ngGrid.version.full).toEqual(ngGrid.version.get());
        });
    });
});

})();