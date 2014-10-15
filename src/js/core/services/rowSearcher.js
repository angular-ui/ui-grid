(function() {

var module = angular.module('ui.grid');

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function QuickCache() {
  var c = function(get, set) {
    // Return the cached value of 'get' if it's stored
    if (get && c.cache[get]) {
      return c.cache[get];
    }
    // Otherwise set it and return it
    else if (get && set) {
      c.cache[get] = set;
      return c.cache[get];
    }
    else {
      return undefined;
    }
  };

  c.cache = {};

  c.clear = function () {
    c.cache = {};
  };

  return c;
}

/**
 *  @ngdoc service
 *  @name ui.grid.service:rowSearcher
 *
 *  @description Service for searching/filtering rows based on column value conditions.
 */
module.service('rowSearcher', ['gridUtil', 'uiGridConstants', function (gridUtil, uiGridConstants) {
  var defaultCondition = uiGridConstants.filter.STARTS_WITH;

  var rowSearcher = {};

  // rowSearcher.searchColumn = function searchColumn(condition, item) {
  //   var result;

  //   var col = self.fieldMap[condition.columnDisplay];

  //   if (!col) {
  //       return false;
  //   }
  //   var sp = col.cellFilter.split(':');
  //   var filter = col.cellFilter ? $filter(sp[0]) : null;
  //   var value = item[condition.column] || item[col.field.split('.')[0]];
  //   if (value === null || value === undefined) {
  //       return false;
  //   }
  //   if (typeof filter === "function") {
  //       var filterResults = filter(typeof value === "object" ? evalObject(value, col.field) : value, sp[1]).toString();
  //       result = condition.regex.test(filterResults);
  //   }
  //   else {
  //       result = condition.regex.test(typeof value === "object" ? evalObject(value, col.field).toString() : value.toString());
  //   }
  //   if (result) {
  //       return true;
  //   }
  //   return false;
  // };

  /**
   * @ngdoc function
   * @name getTerm
   * @methodOf ui.grid.service:rowSearcher
   * @description Get the term from a filter
   * Trims leading and trailing whitespace
   * @param {object} filter object to use
   * @returns {object} Parsed term
   */
  rowSearcher.getTerm = function getTerm(filter) {
    if (typeof(filter.term) === 'undefined') { return filter.term; }
    
    var term = filter.term;

    // Strip leading and trailing whitespace if the term is a string
    if (typeof(term) === 'string') {
      term = term.trim();
    }

    return term;
  };

  /**
   * @ngdoc function
   * @name stripTerm
   * @methodOf ui.grid.service:rowSearcher
   * @description Remove leading and trailing asterisk (*) from the filter's term
   * @param {object} filter object to use
   * @returns {uiGridConstants.filter<int>} Value representing the condition constant value
   */
  rowSearcher.stripTerm = function stripTerm(filter) {
    var term = rowSearcher.getTerm(filter);

    if (typeof(term) === 'string') {
      return escapeRegExp(term.replace(/(^\*|\*$)/g, ''));
    }
    else {
      return term;
    }
  };

  /**
   * @ngdoc function
   * @name guessCondition
   * @methodOf ui.grid.service:rowSearcher
   * @description Guess the condition for a filter based on its term
   * <br>
   * Defaults to STARTS_WITH. Uses CONTAINS for strings beginning and ending with *s (*bob*).
   * Uses STARTS_WITH for strings ending with * (bo*). Uses ENDS_WITH for strings starting with * (*ob).
   * @param {object} filter object to use
   * @returns {uiGridConstants.filter<int>} Value representing the condition constant value
   */
  rowSearcher.guessCondition = function guessCondition(filter) {
    if (typeof(filter.term) === 'undefined' || !filter.term) {
      return defaultCondition;
    }

    var term = rowSearcher.getTerm(filter);
    
    // Term starts with and ends with a *, use 'contains' condition
    // if (/^\*[\s\S]+?\*$/.test(term)) {
    //   return uiGridConstants.filter.CONTAINS;
    // }
    // // Term starts with a *, use 'ends with' condition
    // else if (/^\*/.test(term)) {
    //   return uiGridConstants.filter.ENDS_WITH;
    // }
    // // Term ends with a *, use 'starts with' condition
    // else if (/\*$/.test(term)) {
    //   return uiGridConstants.filter.STARTS_WITH;
    // }
    // // Default to default condition
    // else {
    //   return defaultCondition;
    // }

    // If the term has *s then turn it into a regex
    if (/\*/.test(term)) {
      var regexpFlags = '';
      if (!filter.flags || !filter.flags.caseSensitive) {
        regexpFlags += 'i';
      }

      var reText = term.replace(/(\\)?\*/g, function ($0, $1) { return $1 ? $0 : '[\\s\\S]*?'; });
      return new RegExp('^' + reText + '$', regexpFlags);
    }
    // Otherwise default to default condition
    else {
      return defaultCondition;
    }
  };

  rowSearcher.runColumnFilter = function runColumnFilter(grid, row, column, termCache, i, filter) {
    // Cache typeof condition
    var conditionType = typeof(filter.condition);

    // Default to CONTAINS condition
    if (conditionType === 'undefined' || !filter.condition) {
      filter.condition = uiGridConstants.filter.CONTAINS;
    }

    // Term to search for.
    var term = rowSearcher.stripTerm(filter);

    if (term === null || term === undefined || term === '') {
      return true;
    }

    // Get the column value for this row
    var value = grid.getCellValue(row, column);

    var regexpFlags = '';
    if (!filter.flags || !filter.flags.caseSensitive) {
      regexpFlags += 'i';
    }

    var cacheId = column.field + i;

    // If the filter's condition is a RegExp, then use it
    if (filter.condition instanceof RegExp) {
      if (!filter.condition.test(value)) {
        return false;
      }
    }
    // If the filter's condition is a function, run it
    else if (conditionType === 'function') {
      return filter.condition(term, value, row, column);
    }
    else if (filter.condition === uiGridConstants.filter.STARTS_WITH) {
      var startswithRE = termCache(cacheId) ? termCache(cacheId) : termCache(cacheId, new RegExp('^' + term, regexpFlags));

      if (!startswithRE.test(value)) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.ENDS_WITH) {
      var endswithRE = termCache(cacheId) ? termCache(cacheId) : termCache(cacheId, new RegExp(term + '$', regexpFlags));

      if (!endswithRE.test(value)) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.CONTAINS) {
      var containsRE = termCache(cacheId) ? termCache(cacheId) : termCache(cacheId, new RegExp(term, regexpFlags));

      if (!containsRE.test(value)) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.EXACT) {
      var exactRE = termCache(cacheId) ? termCache(cacheId) : termCache(cacheId,  new RegExp('^' + term + '$', regexpFlags));

      if (!exactRE.test(value)) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.GREATER_THAN) {
      if (value <= term) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.GREATER_THAN_OR_EQUAL) {
      if (value < term) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.LESS_THAN) {
      if (value >= term) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.LESS_THAN_OR_EQUAL) {
      if (value > term) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.NOT_EQUAL) {
      if (!angular.equals(value, term)) {
        return false;
      }
    }

    return true;
  };

  /**
   * @ngdoc boolean
   * @name useExternalFiltering
   * @propertyOf ui.grid.class:GridOptions
   * @description False by default. When enabled, this setting suppresses the internal filtering.
   * All UI logic will still operate, allowing filter conditions to be set and modified.
   * 
   * The external filter logic can listen for the `filterChange` event, which fires whenever
   * a filter has been adjusted.
   */
  /**
   * @ngdoc function
   * @name searchColumn
   * @methodOf ui.grid.service:rowSearcher
   * @description Process filters on a given column against a given row. If the row meets the conditions on all the filters, return true.
   * @param {Grid} grid Grid to search in
   * @param {GridRow} row Row to search on
   * @param {GridCol} column Column with the filters to use
   * @returns {boolean} Whether the column matches or not.
   */
  rowSearcher.searchColumn = function searchColumn(grid, row, column, termCache) {
    var filters = [];

    if (grid.options.useExternalFiltering) {
      return true;
    }
    
    if (typeof(column.filters) !== 'undefined' && column.filters && column.filters.length > 0) {
      filters = column.filters;
    } else {
      // If filters array is not there, assume no filters for this column. 
      // This array should have been built in GridColumn::updateColumnDef.
      return true;
    }
    
    for (var i in filters) {
      var filter = filters[i];

      /*
        filter: {
          term: 'blah', // Search term to search for, could be a string, integer, etc.
          condition: uiGridConstants.filter.CONTAINS // Type of match to do. Defaults to CONTAINS (i.e. looking in a string), but could be EXACT, GREATER_THAN, etc.
          flags: { // Flags for the conditions
            caseSensitive: false // Case-sensitivity defaults to false
          }
        }
      */
     
      // Check for when no condition is supplied. In this case, guess the condition
      // to use based on the filter's term. Cache this result.
      if (!filter.condition) {
        // Cache custom conditions, building the RegExp takes time
        var conditionCacheId = 'cond-' + column.field + '-' + filter.term;
        var condition = termCache(conditionCacheId) ? termCache(conditionCacheId) : termCache(conditionCacheId, rowSearcher.guessCondition(filter));

        // Create a surrogate filter so as not to change
        // the actual columnDef.filters.
        filter = {
          // Copy over the search term
          term: filter.term,
          // Use the guessed condition
          condition: condition,
          // Set flags, using passed flags if present
          flags: angular.extend({
            caseSensitive: false
          }, filter.flags)
        };
      }

      var ret = rowSearcher.runColumnFilter(grid, row, column, termCache, i, filter);
      if (!ret) {
        return false;
      }
    }

    return true;
    // }
    // else {
    //   // No filter conditions, default to true
    //   return true;
    // }
  };

  /**
   * @ngdoc function
   * @name search
   * @methodOf ui.grid.service:rowSearcher
   * @description Run a search across
   * @param {Grid} grid Grid instance to search inside
   * @param {Array[GridRow]} rows GridRows to filter
   * @param {Array[GridColumn]} columns GridColumns with filters to process
   */
  rowSearcher.search = function search(grid, rows, columns) {
    // Don't do anything if we weren't passed any rows
    if (!rows) {
      return;
    }

    // Create a term cache
    var termCache = new QuickCache();

    // Build filtered column list
    var filterCols = [];
    columns.forEach(function (col) {
      if (typeof(col.filters) !== 'undefined' && col.filters.length > 0) {
        filterCols.push(col);
      }
      else if (typeof(col.filter) !== 'undefined' && col.filter && typeof(col.filter.term) !== 'undefined' && col.filter.term) {
        filterCols.push(col);
      }
    });
    
    if (filterCols.length > 0) {
      filterCols.forEach(function foreachFilterCol(col) {
        rows.forEach(function foreachRow(row) {
          if (row.forceInvisible || !rowSearcher.searchColumn(grid, row, col, termCache)) {
            row.visible = false;
          }
        });
      });

      if (grid.api.core.raise.rowsVisibleChanged) {
        grid.api.core.raise.rowsVisibleChanged();
      }

      // rows.forEach(function (row) {
      //   var matchesAllColumns = true;

      //   for (var i in filterCols) {
      //     var col = filterCols[i];

      //     if (!rowSearcher.searchColumn(grid, row, col, termCache)) {
      //       matchesAllColumns = false;

      //       // Stop processing other terms
      //       break;
      //     }
      //   }

      //   // Row doesn't match all the terms, don't display it
      //   if (!matchesAllColumns) {
      //     row.visible = false;
      //   }
      //   else {
      //     row.visible = true;
      //   }
      // });
    }

    // Reset the term cache
    termCache.clear();

    return rows;
  };

  return rowSearcher;
}]);

})();