/* globals element, by */

var gridTestUtils = require('./gridTestUtils.spec.js');

function getProxyToRealMethod(gridId, method) {
    return function() {
        var callArgs = [gridId].concat(Array.prototype.slice.call(arguments));
        return gridTestUtils[method].apply(gridTestUtils, callArgs);
    };
}

/**
 * @ngdoc overview
 * @name ui.grid.e2eTestLibrary
 * @description
 * End to end test functions.
 */

/**
 * @ngdoc service
 * @name ui.grid.e2eTestLibrary.api:gridTestObject
 * @description
 * End to end test functions.
 */
module.exports = function(gridId) {
    for (var method in gridTestUtils) {
        this[method] = getProxyToRealMethod(gridId, method);
    }
};

