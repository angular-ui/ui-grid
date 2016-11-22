(function() {

var module = angular.module('ui.grid');

/**
 * @ngdoc object
 * @name ui.grid.class:rowSorter
 * @description rowSorter provides the default sorting mechanisms,
 * including guessing column types and applying appropriate sort
 * algorithms
 *
 */

module.service('rowSorter', ['$parse', 'uiGridConstants', function ($parse, uiGridConstants) {
  var currencyRegexStr =
    '(' +
    uiGridConstants.CURRENCY_SYMBOLS
      .map(function (a) { return '\\' + a; }) // Escape all the currency symbols ($ at least will jack up this regex)
      .join('|') + // Join all the symbols together with |s
    ')?';

  // /^[-+]?[£$¤¥]?[\d,.]+%?$/
  var numberStrRegex = new RegExp('^[-+]?' + currencyRegexStr + '[\\d,.]+' + currencyRegexStr + '%?$');

  var rowSorter = {
    // Cache of sorting functions. Once we create them, we don't want to keep re-doing it
    //   this takes a piece of data from the cell and tries to determine its type and what sorting
    //   function to use for it
    colSortFnCache: {}
  };


  /**
   * @ngdoc method
   * @methodOf ui.grid.class:rowSorter
   * @name guessSortFn
   * @description Assigns a sort function to use based on the itemType in the column
   * @param {string} itemType one of 'number', 'boolean', 'string', 'date', 'object'.  And
   * error will be thrown for any other type.
   * @returns {function} a sort function that will sort that type
   */
  rowSorter.guessSortFn = function guessSortFn(itemType) {
    switch (itemType) {
      case "number":
        return rowSorter.sortNumber;
      case "numberStr":
        return rowSorter.sortNumberStr;
      case "boolean":
        return rowSorter.sortBool;
      case "string":
        return rowSorter.sortAlpha;
      case "date":
        return rowSorter.sortDate;
      case "object":
        return rowSorter.basicSort;
      default:
        throw new Error('No sorting function found for type:' + itemType);
    }
  };


  /**
   * @ngdoc method
   * @methodOf ui.grid.class:rowSorter
   * @name handleNulls
   * @description Sorts nulls and undefined to the bottom (top when
   * descending).  Called by each of the internal sorters before
   * attempting to sort.  Note that this method is available on the core api
   * via gridApi.core.sortHandleNulls
   * @param {object} a sort value a
   * @param {object} b sort value b
   * @returns {number} null if there were no nulls/undefineds, otherwise returns
   * a sort value that should be passed back from the sort function
   */
  rowSorter.handleNulls = function handleNulls(a, b) {
    // We want to allow zero values and false values to be evaluated in the sort function
    if ((!a && a !== 0 && a !== false) || (!b && b !== 0 && b !== false)) {
      // We want to force nulls and such to the bottom when we sort... which effectively is "greater than"
      if ((!a && a !== 0 && a !== false) && (!b && b !== 0 && b !== false)) {
        return 0;
      }
      else if (!a && a !== 0 && a !== false) {
        return 1;
      }
      else if (!b && b !== 0 && b !== false) {
        return -1;
      }
    }
    return null;
  };


  /**
   * @ngdoc method
   * @methodOf ui.grid.class:rowSorter
   * @name basicSort
   * @description Sorts any values that provide the < method, including strings
   * or numbers.  Handles nulls and undefined through calling handleNulls
   * @param {object} a sort value a
   * @param {object} b sort value b
   * @returns {number} normal sort function, returns -ve, 0, +ve
   */
  rowSorter.basicSort = function basicSort(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      if (a === b) {
        return 0;
      }
      if (a < b) {
        return -1;
      }
      return 1;
    }
  };


  /**
   * @ngdoc method
   * @methodOf ui.grid.class:rowSorter
   * @name sortNumber
   * @description Sorts numerical values.  Handles nulls and undefined through calling handleNulls
   * @param {object} a sort value a
   * @param {object} b sort value b
   * @returns {number} normal sort function, returns -ve, 0, +ve
   */
  rowSorter.sortNumber = function sortNumber(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      return a - b;
    }
  };


  /**
   * @ngdoc method
   * @methodOf ui.grid.class:rowSorter
   * @name sortNumberStr
   * @description Sorts numerical values that are stored in a string (i.e. parses them to numbers first).
   * Handles nulls and undefined through calling handleNulls
   * @param {object} a sort value a
   * @param {object} b sort value b
   * @returns {number} normal sort function, returns -ve, 0, +ve
   */
  rowSorter.sortNumberStr = function sortNumberStr(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      var numA, // The parsed number form of 'a'
          numB, // The parsed number form of 'b'
          badA = false,
          badB = false;

      // Try to parse 'a' to a float
      numA = parseFloat(a.replace(/[^0-9.-]/g, ''));

      // If 'a' couldn't be parsed to float, flag it as bad
      if (isNaN(numA)) {
          badA = true;
      }

      // Try to parse 'b' to a float
      numB = parseFloat(b.replace(/[^0-9.-]/g, ''));

      // If 'b' couldn't be parsed to float, flag it as bad
      if (isNaN(numB)) {
          badB = true;
      }

      // We want bad ones to get pushed to the bottom... which effectively is "greater than"
      if (badA && badB) {
          return 0;
      }

      if (badA) {
          return 1;
      }

      if (badB) {
          return -1;
      }

      return numA - numB;
    }
  };


  /**
   * @ngdoc method
   * @methodOf ui.grid.class:rowSorter
   * @name sortAlpha
   * @description Sorts string values. Handles nulls and undefined through calling handleNulls
   * @param {object} a sort value a
   * @param {object} b sort value b
   * @returns {number} normal sort function, returns -ve, 0, +ve
   */
  rowSorter.sortAlpha = function sortAlpha(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      var strA = a.toString().toLowerCase(),
          strB = b.toString().toLowerCase();

      return strA === strB ? 0 : strA.localeCompare(strB);
    }
  };


  /**
   * @ngdoc method
   * @methodOf ui.grid.class:rowSorter
   * @name sortDate
   * @description Sorts date values. Handles nulls and undefined through calling handleNulls.
   * Handles date strings by converting to Date object if not already an instance of Date
   * @param {object} a sort value a
   * @param {object} b sort value b
   * @returns {number} normal sort function, returns -ve, 0, +ve
   */
  rowSorter.sortDate = function sortDate(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      if (!(a instanceof Date)) {
        a = new Date(a);
      }
      if (!(b instanceof Date)){
        b = new Date(b);
      }
      var timeA = a.getTime(),
          timeB = b.getTime();

      return timeA === timeB ? 0 : (timeA < timeB ? -1 : 1);
    }
  };


  /**
   * @ngdoc method
   * @methodOf ui.grid.class:rowSorter
   * @name sortBool
   * @description Sorts boolean values, true is considered larger than false.
   * Handles nulls and undefined through calling handleNulls
   * @param {object} a sort value a
   * @param {object} b sort value b
   * @returns {number} normal sort function, returns -ve, 0, +ve
   */
  rowSorter.sortBool = function sortBool(a, b) {
    var nulls = rowSorter.handleNulls(a, b);
    if ( nulls !== null ){
      return nulls;
    } else {
      if (a && b) {
        return 0;
      }

      if (!a && !b) {
        return 0;
      }
      else {
        return a ? 1 : -1;
      }
    }
  };


  /**
   * @ngdoc method
   * @methodOf ui.grid.class:rowSorter
   * @name getSortFn
   * @description Get the sort function for the column.  Looks first in
   * rowSorter.colSortFnCache using the column name, failing that it
   * looks at col.sortingAlgorithm (and puts it in the cache), failing that
   * it guesses the sort algorithm based on the data type.
   *
   * The cache currently seems a bit pointless, as none of the work we do is
   * processor intensive enough to need caching.  Presumably in future we might
   * inspect the row data itself to guess the sort function, and in that case
   * it would make sense to have a cache, the infrastructure is in place to allow
   * that.
   *
   * @param {Grid} grid the grid to consider
   * @param {GridCol} col the column to find a function for
   * @param {array} rows an array of grid rows.  Currently unused, but presumably in future
   * we might inspect the rows themselves to decide what sort of data might be there
   * @returns {function} the sort function chosen for the column
   */
  rowSorter.getSortFn = function getSortFn(grid, col, rows) {
    var sortFn, item;

    // See if we already figured out what to use to sort the column and have it in the cache
    if (rowSorter.colSortFnCache[col.colDef.name]) {
      sortFn = rowSorter.colSortFnCache[col.colDef.name];
    }
    // If the column has its OWN sorting algorithm, use that
    else if (col.sortingAlgorithm !== undefined) {
      sortFn = col.sortingAlgorithm;
      rowSorter.colSortFnCache[col.colDef.name] = col.sortingAlgorithm;
    }
    // Always default to sortAlpha when sorting after a cellFilter
    else if ( col.sortCellFiltered && col.cellFilter ){
      sortFn = rowSorter.sortAlpha;
      rowSorter.colSortFnCache[col.colDef.name] = sortFn;
    }
    // Try and guess what sort function to use
    else {
      // Guess the sort function
      sortFn = rowSorter.guessSortFn(col.colDef.type);

      // If we found a sort function, cache it
      if (sortFn) {
        rowSorter.colSortFnCache[col.colDef.name] = sortFn;
      }
      else {
        // We assign the alpha sort because anything that is null/undefined will never get passed to
        // the actual sorting function. It will get caught in our null check and returned to be sorted
        // down to the bottom
        sortFn = rowSorter.sortAlpha;
      }
    }

    return sortFn;
  };



  /**
   * @ngdoc method
   * @methodOf ui.grid.class:rowSorter
   * @name prioritySort
   * @description Used where multiple columns are present in the sort criteria,
   * we determine which column should take precedence in the sort by sorting
   * the columns based on their sort.priority
   *
   * @param {gridColumn} a column a
   * @param {gridColumn} b column b
   * @returns {number} normal sort function, returns -ve, 0, +ve
   */
  rowSorter.prioritySort = function (a, b) {
    // Both columns have a sort priority
    if (a.sort.priority !== undefined && b.sort.priority !== undefined) {
      // A is higher priority
      if (a.sort.priority < b.sort.priority) {
        return -1;
      }
      // Equal
      else if (a.sort.priority === b.sort.priority) {
        return 0;
      }
      // B is higher
      else {
        return 1;
      }
    }
    // Only A has a priority
    else if (a.sort.priority !== undefined) {
      return -1;
    }
    // Only B has a priority
    else if (b.sort.priority !== undefined) {
      return 1;
    }
    // Neither has a priority
    else {
      return 0;
    }
  };


  /**
   * @ngdoc object
   * @name useExternalSorting
   * @propertyOf ui.grid.class:GridOptions
   * @description Prevents the internal sorting from executing.  Events will
   * still be fired when the sort changes, and the sort information on
   * the columns will be updated, allowing an external sorter (for example,
   * server sorting) to be implemented.  Defaults to false.
   *
   */
  /**
   * @ngdoc method
   * @methodOf ui.grid.class:rowSorter
   * @name sort
   * @description sorts the grid
   * @param {Object} grid the grid itself
   * @param {array} rows the rows to be sorted
   * @param {array} columns the columns in which to look
   * for sort criteria
   * @returns {array} sorted rows
   */
  rowSorter.sort = function rowSorterSort(grid, rows, columns) {
    // first make sure we are even supposed to do work
    if (!rows) {
      return;
    }

    if (grid.options.useExternalSorting){
      return rows;
    }

    // Build the list of columns to sort by
    var sortCols = [];
    columns.forEach(function (col) {
      if (col.sort && !col.sort.ignoreSort && col.sort.direction && (col.sort.direction === uiGridConstants.ASC || col.sort.direction === uiGridConstants.DESC)) {
        sortCols.push(col);
      }
    });

    // Sort the "sort columns" by their sort priority
    sortCols = sortCols.sort(rowSorter.prioritySort);

    // Now rows to sort by, maintain original order
    if (sortCols.length === 0) {
      return rows;
    }

    // Re-usable variables
    var col, direction;

    // put a custom index field on each row, used to make a stable sort out of unstable sorts (e.g. Chrome)
    var setIndex = function( row, idx ){
      row.entity.$$uiGridIndex = idx;
    };
    rows.forEach(setIndex);

    // IE9-11 HACK.... the 'rows' variable would be empty where we call rowSorter.getSortFn(...) below. We have to use a separate reference
    // var d = data.slice(0);
    var r = rows.slice(0);

    // Now actually sort the data
    var rowSortFn = function (rowA, rowB) {
      var tem = 0,
          idx = 0,
          sortFn;

      while (tem === 0 && idx < sortCols.length) {
        // grab the metadata for the rest of the logic
        col = sortCols[idx];
        direction = sortCols[idx].sort.direction;

        sortFn = rowSorter.getSortFn(grid, col, r);

        var propA, propB;

        if ( col.sortCellFiltered ){
          propA = grid.getCellDisplayValue(rowA, col);
          propB = grid.getCellDisplayValue(rowB, col);
        } else {
          propA = grid.getCellValue(rowA, col);
          propB = grid.getCellValue(rowB, col);
        }

        tem = sortFn(propA, propB, rowA, rowB, direction, col);

        idx++;
      }

      // Chrome doesn't implement a stable sort function.  If our sort returns 0
      // (i.e. the items are equal), and we're at the last sort column in the list,
      // then return the previous order using our custom
      // index variable
      if (tem === 0 ) {
        return rowA.entity.$$uiGridIndex - rowB.entity.$$uiGridIndex;
      }

      // Made it this far, we don't have to worry about null & undefined
      if (direction === uiGridConstants.ASC) {
        return tem;
      } else {
        return 0 - tem;
      }
    };

    var newRows = rows.sort(rowSortFn);

    // remove the custom index field on each row, used to make a stable sort out of unstable sorts (e.g. Chrome)
    var clearIndex = function( row, idx ){
       delete row.entity.$$uiGridIndex;
    };
    rows.forEach(clearIndex);

    return newRows;
  };

  return rowSorter;
}]);

})();
