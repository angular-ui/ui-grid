(function() {

"use strict";

/* jasmine specs for filters go here */

describe('filter', function() {
    var $checkmark;
    var $columns;
    beforeEach(module('ngGrid.filters'));
    beforeEach(inject(function($filter) {
        $checkmark = $filter('checkmark');
        $columns = $filter('ngColumns');
    }));


    describe('checkmark filter', function() {
        it('returns the appropriate unicode character based on a boolean value', function() {
            expect($checkmark(true)).toEqual('\u2714');
            expect($checkmark(false)).toEqual('\u2718');
        });
    });

    describe('ngColumns filter', function() {
        it('returns columns that are not aggregate columns', function() {
            var columns = [{ isAggCol: true }, { isAggCol: true }, { isAggCol: false }, { isAggCol: false }, { isAggCol: false }];
            var fCols = $columns(columns);
            expect(fCols.length).toEqual(3);
        });
    });
});

})();