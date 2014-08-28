(function() {

var module = angular.module('ui.grid');

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
    colSortFnCache: []
  };

  // Guess which sort function to use on this item
  rowSorter.guessSortFn = function guessSortFn(itemType) {

    // Check for numbers and booleans
    switch (itemType) {
      case "number":
        return rowSorter.sortNumber;
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

  // Basic sorting function
  rowSorter.basicSort = function basicSort(a, b) {
      if (a === b) {
          return 0;
      }
      if (a < b) {
          return -1;
      }
      return 1;
  };

  // Number sorting function
  rowSorter.sortNumber = function sortNumber(a, b) {
      return a - b;
  };

  rowSorter.sortNumberStr = function sortNumberStr(a, b) {
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
  };

  // String sorting function
  rowSorter.sortAlpha = function sortAlpha(a, b) {
    var strA = a.toLowerCase(),
        strB = b.toLowerCase();

    return strA === strB ? 0 : (strA < strB ? -1 : 1);
  };

  // Date sorting function
  rowSorter.sortDate = function sortDate(a, b) {
    var timeA = a.getTime(),
        timeB = b.getTime();

    return timeA === timeB ? 0 : (timeA < timeB ? -1 : 1);
  };

  // Boolean sorting function
  rowSorter.sortBool = function sortBool(a, b) {
    if (a && b) {
      return 0;
    }

    if (!a && !b) {
      return 0;
    }
    else {
      return a ? 1 : -1;
    }
  };

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
    else if (a.sort.priority) {
      return -1;
    }
    // Only B has a priority
    else if (b.sort.priority) {
      return 1;
    }
    // Neither has a priority
    else {
      return 0;
    }
  };

  rowSorter.sort = function rowSorterSort(grid, rows, columns) {
    // first make sure we are even supposed to do work
    if (!rows) {
      return;
    }

    // Build the list of columns to sort by
    var sortCols = [];
    columns.forEach(function (col) {
      if (col.sort && col.sort.direction && (col.sort.direction === uiGridConstants.ASC || col.sort.direction === uiGridConstants.DESC)) {
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

    // IE9-11 HACK.... the 'rows' variable would be empty where we call rowSorter.getSortFn(...) below. We have to use a separate reference
    // var d = data.slice(0);
    var r = rows.slice(0);

    // Now actually sort the data
    return rows.sort(function rowSortFn(rowA, rowB) {
      var tem = 0,
          idx = 0,
          sortFn;

      while (tem === 0 && idx < sortCols.length) {
        // grab the metadata for the rest of the logic
        col = sortCols[idx];
        direction = sortCols[idx].sort.direction;

        sortFn = rowSorter.getSortFn(grid, col, r);
        
        var propA = grid.getCellValue(rowA, col);
        var propB = grid.getCellValue(rowB, col);

        // We want to allow zero values to be evaluated in the sort function
        if ((!propA && propA !== 0) || (!propB && propB !== 0)) {
          // We want to force nulls and such to the bottom when we sort... which effectively is "greater than"
          if (!propB && !propA) {
            tem = 0;
          }
          else if (!propA) {
            tem = 1;
          }
          else if (!propB) {
            tem = -1;
          }
        }
        else {
          tem = sortFn(propA, propB);
        }

        idx++;
      }

      // Made it this far, we don't have to worry about null & undefined
      if (direction === uiGridConstants.ASC) {
        return tem;
      } else {
        return 0 - tem;
      }
    });
  };

  return rowSorter;
}]);

})();