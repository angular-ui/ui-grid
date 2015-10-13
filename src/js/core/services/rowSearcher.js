(function() {

var module = angular.module('ui.grid');

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


/**
 *  @ngdoc service
 *  @name ui.grid.service:rowSearcher
 *
 *  @description Service for searching/filtering rows based on column value conditions.
 */
module.service('rowSearcher', ['gridUtil', 'uiGridConstants', function (gridUtil, uiGridConstants) {
  var defaultCondition = uiGridConstants.filter.CONTAINS;

  var rowSearcher = {};

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
  
  
  /**
   * @ngdoc function
   * @name setupFilters
   * @methodOf ui.grid.service:rowSearcher
   * @description For a given columns filters (either col.filters, or [col.filter] can be passed in),
   * do all the parsing and pre-processing and store that data into a new filters object.  The object
   * has the condition, the flags, the stripped term, and a parsed reg exp if there was one.
   * 
   * We could use a forEach in here, since it's much less performance sensitive, but since we're using 
   * for loops everywhere else in this module...
   * 
   * @param {array} filters the filters from the column (col.filters or [col.filter])
   * @returns {array} An array of parsed/preprocessed filters
   */
  rowSearcher.setupFilters = function setupFilters( filters ){
    var newFilters = [];
    
    var filtersLength = filters.length;
    for ( var i = 0; i < filtersLength; i++ ){
      var filter = filters[i];
      
      if ( filter.noTerm || !gridUtil.isNullOrUndefined(filter.term) ){
        var newFilter = {};
        
        var regexpFlags = '';
        if (!filter.flags || !filter.flags.caseSensitive) {
          regexpFlags += 'i';
        }
    
        if ( !gridUtil.isNullOrUndefined(filter.term) ){
          // it is possible to have noTerm.  We don't need to copy that across, it was just a flag to avoid
          // getting the filter ignored if the filter was a function that didn't use a term
          newFilter.term = rowSearcher.stripTerm(filter);
        }
        
        if ( filter.condition ){
          newFilter.condition = filter.condition;
        } else {
          newFilter.condition = rowSearcher.guessCondition(filter);
        }

        newFilter.flags = angular.extend( { caseSensitive: false, date: false }, filter.flags );

        if (newFilter.condition === uiGridConstants.filter.STARTS_WITH) {
          newFilter.startswithRE = new RegExp('^' + newFilter.term, regexpFlags);
        }
        
         if (newFilter.condition === uiGridConstants.filter.ENDS_WITH) {
          newFilter.endswithRE = new RegExp(newFilter.term + '$', regexpFlags);
        }

        if (newFilter.condition === uiGridConstants.filter.CONTAINS) {
          newFilter.containsRE = new RegExp(newFilter.term, regexpFlags);
        }

        if (newFilter.condition === uiGridConstants.filter.EXACT) {
          newFilter.exactRE = new RegExp('^' + newFilter.term + '$', regexpFlags);
        }
        
        newFilters.push(newFilter);
      }
    }
    return newFilters;
  };
  

  /**
   * @ngdoc function
   * @name runColumnFilter
   * @methodOf ui.grid.service:rowSearcher
   * @description Runs a single pre-parsed filter against a cell, returning true
   * if the cell matches that one filter.
   * 
   * @param {Grid} grid the grid we're working against
   * @param {GridRow} row the row we're matching against
   * @param {GridCol} column the column that we're working against
   * @param {object} filter the specific, preparsed, filter that we want to test
   * @returns {boolean} true if we match (row stays visible)
   */
  rowSearcher.runColumnFilter = function runColumnFilter(grid, row, column, filter) {
    // Cache typeof condition
    var conditionType = typeof(filter.condition);

    // Term to search for.
    var term = filter.term;

    // Get the column value for this row
    var value;
    if ( column.filterCellFiltered ){
      value = grid.getCellDisplayValue(row, column);
    } else {
      value = grid.getCellValue(row, column);
    }


    // If the filter's condition is a RegExp, then use it
    if (filter.condition instanceof RegExp) {
      return filter.condition.test(value);
    }

    // If the filter's condition is a function, run it
    if (conditionType === 'function') {
      return filter.condition(term, value, row, column);
    }

    if (filter.startswithRE) {
      return filter.startswithRE.test(value);
    }

    if (filter.endswithRE) {
      return filter.endswithRE.test(value);
    }

    if (filter.containsRE) {
      return filter.containsRE.test(value);
    }

    if (filter.exactRE) {
      return filter.exactRE.test(value);
    }

    if (filter.condition === uiGridConstants.filter.NOT_EQUAL) {
      var regex = new RegExp('^' + term + '$');
      return !regex.exec(value);
    }

    if (typeof(value) === 'number' && typeof(term) === 'string' ){
      // if the term has a decimal in it, it comes through as '9\.4', we need to take out the \
      // the same for negative numbers
      // TODO: I suspect the right answer is to look at escapeRegExp at the top of this code file, maybe it's not needed?
      var tempFloat = parseFloat(term.replace(/\\\./,'.').replace(/\\\-/,'-'));
      if (!isNaN(tempFloat)) {
        term = tempFloat;
      }
    }

    if (filter.flags.date === true) {
      value = new Date(value);
      // If the term has a dash in it, it comes through as '\-' -- we need to take out the '\'.
      term = new Date(term.replace(/\\/g, ''));
    }

    if (filter.condition === uiGridConstants.filter.GREATER_THAN) {
      return (value > term);
    }

    if (filter.condition === uiGridConstants.filter.GREATER_THAN_OR_EQUAL) {
      return (value >= term);
    }

    if (filter.condition === uiGridConstants.filter.LESS_THAN) {
      return (value < term);
    }

    if (filter.condition === uiGridConstants.filter.LESS_THAN_OR_EQUAL) {
      return (value <= term);
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
   * @description Process provided filters on provided column against a given row. If the row meets 
   * the conditions on all the filters, return true.
   * @param {Grid} grid Grid to search in
   * @param {GridRow} row Row to search on
   * @param {GridCol} column Column with the filters to use
   * @param {array} filters array of pre-parsed/preprocessed filters to apply
   * @returns {boolean} Whether the column matches or not.
   */
  rowSearcher.searchColumn = function searchColumn(grid, row, column, filters) {
    if (grid.options.useExternalFiltering) {
      return true;
    }

    var filtersLength = filters.length;
    for (var i = 0; i < filtersLength; i++) {
      var filter = filters[i];

      var ret = rowSearcher.runColumnFilter(grid, row, column, filter);
      if (!ret) {
        return false;
      }
    }

    return true;
  };


  /**
   * @ngdoc function
   * @name search
   * @methodOf ui.grid.service:rowSearcher
   * @description Run a search across the given rows and columns, marking any rows that don't 
   * match the stored col.filters or col.filter as invisible.
   * @param {Grid} grid Grid instance to search inside
   * @param {Array[GridRow]} rows GridRows to filter
   * @param {Array[GridColumn]} columns GridColumns with filters to process
   */
  rowSearcher.search = function search(grid, rows, columns) {
    /*
     * Added performance optimisations into this code base, as this logic creates deeply nested
     * loops and is therefore very performance sensitive.  In particular, avoiding forEach as
     * this impacts some browser optimisers (particularly Chrome), using iterators instead
     */

    // Don't do anything if we weren't passed any rows
    if (!rows) {
      return;
    }

    // don't filter if filtering currently disabled
    if (!grid.options.enableFiltering){
      return rows;
    }

    // Build list of filters to apply
    var filterData = [];

    var colsLength = columns.length;

    var hasTerm = function( filters ) {
      var hasTerm = false;

      filters.forEach( function (filter) {
        if ( !gridUtil.isNullOrUndefined(filter.term) && filter.term !== '' || filter.noTerm ){
          hasTerm = true;
        }
      });

      return hasTerm;
    };

    for (var i = 0; i < colsLength; i++) {
      var col = columns[i];

      if (typeof(col.filters) !== 'undefined' && hasTerm(col.filters) ) {
        filterData.push( { col: col, filters: rowSearcher.setupFilters(col.filters) } );
      }
    }

    if (filterData.length > 0) {
      // define functions outside the loop, performance optimisation
      var foreachRow = function(grid, row, col, filters){
        if ( row.visible && !rowSearcher.searchColumn(grid, row, col, filters) ) {
          row.visible = false;
        }
      };

      var foreachFilterCol = function(grid, filterData){
        var rowsLength = rows.length;
        for ( var i = 0; i < rowsLength; i++){
          foreachRow(grid, rows[i], filterData.col, filterData.filters);  
        }
      };

      // nested loop itself - foreachFilterCol, which in turn calls foreachRow
      var filterDataLength = filterData.length;
      for ( var j = 0; j < filterDataLength; j++){
        foreachFilterCol( grid, filterData[j] );  
      }

      if (grid.api.core.raise.rowsVisibleChanged) {
        grid.api.core.raise.rowsVisibleChanged();
      }

      // drop any invisible rows
      // keeping these, as needed with filtering for trees - we have to come back and make parent nodes visible if child nodes are selected in the filter
      // rows = rows.filter(function(row){ return row.visible; });

    }

    return rows;
  };

  return rowSearcher;
}]);

})();
