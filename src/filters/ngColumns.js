ngGridFilters.filter('ngColumns', function() {
    return function(input) {
        return input.filter(function(col) {
            return !col.isAggCol;
        });
    };
});