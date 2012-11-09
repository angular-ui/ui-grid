ngGridFilters.filter('checkmark', function () {
    return function (input) {
        return input ? '\u2714' : '\u2718';
    };
});