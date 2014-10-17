(function(){

angular.module('ui.grid')
  
  /**
   * @ngdoc function
   * @name ui.grid.class:GridRenderContainer
   * @description The grid has render containers, allowing the ability to have pinned columns.  If the grid
   * is right-to-left then there may be a right render container, if left-to-right then there may 
   * be a left render container.  There is always a body render container.
   * @param {string} name The name of the render container ('body', 'left', or 'right')
   * @param {Grid} grid the grid the render container is in
   * @param {object} options the render container options
   */
.factory('GridRenderContainer', ['gridUtil', function(gridUtil) {
  function GridRenderContainer(name, grid, options) {
    var self = this;

    // if (gridUtil.type(grid) !== 'Grid') {
    //   throw new Error('Grid argument is not a Grid object');
    // }

    self.name = name;

    self.grid = grid;
    
    // self.rowCache = [];
    // self.columnCache = [];

    self.visibleRowCache = [];
    self.visibleColumnCache = [];

    self.renderedRows = [];
    self.renderedColumns = [];

    self.prevScrollTop = 0;
    self.prevScrolltopPercentage = 0;
    self.prevRowScrollIndex = 0;

    self.prevScrollLeft = 0;
    self.prevScrollleftPercentage = 0;
    self.prevColumnScrollIndex = 0;

    self.columnStyles = "";

    self.viewportAdjusters = [];

    if (options && angular.isObject(options)) {
      angular.extend(self, options);
    }

    grid.registerStyleComputation({
      priority: 5,
      func: function () {
        return self.columnStyles;
      }
    });
  }

  // GridRenderContainer.prototype.addRenderable = function addRenderable(renderable) {
  //   this.renderables.push(renderable);
  // };

  GridRenderContainer.prototype.reset = function reset() {
    // this.rowCache.length = 0;
    // this.columnCache.length = 0;

    this.visibleColumnCache.length = 0;
    this.visibleRowCache.length = 0;

    this.renderedRows.length = 0;
    this.renderedColumns.length = 0;
  };

  // TODO(c0bra): calculate size?? Should this be in a stackable directive?

  GridRenderContainer.prototype.minRowsToRender = function minRowsToRender() {
    var self = this;
    var minRows = 0;
    var rowAddedHeight = 0;
    var viewPortHeight = self.getViewportHeight();
    for (var i = self.visibleRowCache.length - 1; rowAddedHeight < viewPortHeight && i >= 0; i--) {
      rowAddedHeight += self.visibleRowCache[i].height;
      minRows++;
    }
    return minRows;
  };

  GridRenderContainer.prototype.minColumnsToRender = function minColumnsToRender() {
    var self = this;
    var viewportWidth = this.getViewportWidth();

    var min = 0;
    var totalWidth = 0;
    // self.columns.forEach(function(col, i) {
    for (var i = 0; i < self.visibleColumnCache.length; i++) {
      var col = self.visibleColumnCache[i];

      if (totalWidth < viewportWidth) {
        totalWidth += col.drawnWidth ? col.drawnWidth : 0;
        min++;
      }
      else {
        var currWidth = 0;
        for (var j = i; j >= i - min; j--) {
          currWidth += self.visibleColumnCache[j].drawnWidth ? self.visibleColumnCache[j].drawnWidth : 0;
        }
        if (currWidth < viewportWidth) {
          min++;
        }
      }
    }

    return min;
  };

  GridRenderContainer.prototype.getVisibleRowCount = function getVisibleRowCount() {
    return this.visibleRowCache.length;
  };

  /**
   * @ngdoc function
   * @name registerViewportAdjuster
   * @methodOf ui.grid.class:GridRenderContainer
   * @description Registers an adjuster to the render container's available width or height.  Adjusters are used
   * to tell the render container that there is something else consuming space, and to adjust it's size
   * appropriately.  
   * @param {function} func the adjuster function we want to register
   */

  GridRenderContainer.prototype.registerViewportAdjuster = function registerViewportAdjuster(func) {
    this.viewportAdjusters.push(func);
  };

  /**
   * @ngdoc function
   * @name removeViewportAdjuster
   * @methodOf ui.grid.class:GridRenderContainer
   * @description Removes an adjuster, should be used when your element is destroyed
   * @param {function} func the adjuster function we want to remove
   */
  GridRenderContainer.prototype.removeViewportAdjuster = function registerViewportAdjuster(func) {
    var idx = this.viewportAdjusters.indexOf(func);

    if (typeof(idx) !== 'undefined' && idx !== undefined) {
      this.viewportAdjusters.splice(idx, 1);
    }
  };

  /**
   * @ngdoc function
   * @name getViewportAdjustment
   * @methodOf ui.grid.class:GridRenderContainer
   * @description Gets the adjustment based on the viewportAdjusters.  
   * @returns {object} a hash of { height: x, width: y }.  Usually the values will be negative
   */
  GridRenderContainer.prototype.getViewportAdjustment = function getViewportAdjustment() {
    var self = this;

    var adjustment = { height: 0, width: 0 };

    self.viewportAdjusters.forEach(function (func) {
      adjustment = func.call(this, adjustment);
    });

    return adjustment;
  };

  GridRenderContainer.prototype.getViewportHeight = function getViewportHeight() {
    var self = this;

    var headerHeight = (self.headerHeight) ? self.headerHeight : self.grid.headerHeight;

    var viewPortHeight = self.grid.gridHeight - headerHeight - self.grid.footerHeight;

    // Account for native horizontal scrollbar, if present
    if (typeof(self.horizontalScrollbarHeight) !== 'undefined' && self.horizontalScrollbarHeight !== undefined && self.horizontalScrollbarHeight > 0) {
      viewPortHeight = viewPortHeight - self.horizontalScrollbarHeight;
    }

    var adjustment = self.getViewportAdjustment();
    
    viewPortHeight = viewPortHeight + adjustment.height;

    return viewPortHeight;
  };

  GridRenderContainer.prototype.getViewportWidth = function getViewportWidth() {
    var self = this;

    var viewPortWidth = self.grid.gridWidth;

    if (typeof(self.grid.verticalScrollbarWidth) !== 'undefined' && self.grid.verticalScrollbarWidth !== undefined && self.grid.verticalScrollbarWidth > 0) {
      viewPortWidth = viewPortWidth - self.grid.verticalScrollbarWidth;
    }

    var adjustment = self.getViewportAdjustment();
    
    viewPortWidth = viewPortWidth + adjustment.width;

    return viewPortWidth;
  };

  GridRenderContainer.prototype.getHeaderViewportWidth = function getHeaderViewportWidth() {
    var self = this;

    var viewPortWidth = this.getViewportWidth();

    if (typeof(self.grid.verticalScrollbarWidth) !== 'undefined' && self.grid.verticalScrollbarWidth !== undefined && self.grid.verticalScrollbarWidth > 0) {
      viewPortWidth = viewPortWidth + self.grid.verticalScrollbarWidth;
    }

    // var adjustment = self.getViewportAdjustment();
    // viewPortWidth = viewPortWidth + adjustment.width;

    return viewPortWidth;
  };

  GridRenderContainer.prototype.getCanvasHeight = function getCanvasHeight() {
    var self = this;

    var ret =  0;

    self.visibleRowCache.forEach(function(row){
      ret += row.height;
    });

    if (typeof(self.grid.horizontalScrollbarHeight) !== 'undefined' && self.grid.horizontalScrollbarHeight !== undefined && self.grid.horizontalScrollbarHeight > 0) {
      ret = ret - self.grid.horizontalScrollbarHeight;
    }

    return ret;
  };

  GridRenderContainer.prototype.getCanvasWidth = function getCanvasWidth() {
    var self = this;

    var ret = self.canvasWidth;

    if (typeof(self.verticalScrollbarWidth) !== 'undefined' && self.verticalScrollbarWidth !== undefined && self.verticalScrollbarWidth > 0) {
      ret = ret - self.verticalScrollbarWidth;
    }

    return ret;
  };

  GridRenderContainer.prototype.setRenderedRows = function setRenderedRows(newRows) {
    this.renderedRows.length = newRows.length;
    for (var i = 0; i < newRows.length; i++) {
      this.renderedRows[i] = newRows[i];
    }
  };

  GridRenderContainer.prototype.setRenderedColumns = function setRenderedColumns(newColumns) {
    var self = this;

    // OLD:
    this.renderedColumns.length = newColumns.length;
    for (var i = 0; i < newColumns.length; i++) {
      this.renderedColumns[i] = newColumns[i];
    }
    
    this.updateColumnOffset();
  };

  GridRenderContainer.prototype.updateColumnOffset = function updateColumnOffset() {
    // Calculate the width of the columns on the left side that are no longer rendered.
    //  That will be the offset for the columns as we scroll horizontally.
    var hiddenColumnsWidth = 0;
    for (var i = 0; i < this.currentFirstColumn; i++) {
      hiddenColumnsWidth += this.visibleColumnCache[i].drawnWidth;
    }

    this.columnOffset = hiddenColumnsWidth;
  };

  GridRenderContainer.prototype.adjustScrollVertical = function adjustScrollVertical(scrollTop, scrollPercentage, force) {
    if (this.prevScrollTop === scrollTop && !force) {
      return;
    }

    scrollTop = this.getCanvasHeight() * scrollPercentage;

    this.adjustRows(scrollTop, scrollPercentage);

    this.prevScrollTop = scrollTop;
    this.prevScrolltopPercentage = scrollPercentage;

    this.grid.queueRefresh();
  };

  GridRenderContainer.prototype.adjustScrollHorizontal = function adjustScrollHorizontal(scrollLeft, scrollPercentage, force) {
    if (this.prevScrollLeft === scrollLeft && !force) {
      return;
    }

    // scrollLeft = uiGridCtrl.canvas[0].scrollWidth * scrollPercentage;
    scrollLeft = this.getCanvasWidth() * scrollPercentage;

    //gridUtil.logDebug('scrollPercentage', scrollPercentage);

    this.adjustColumns(scrollLeft, scrollPercentage);

    this.prevScrollLeft = scrollLeft;
    this.prevScrollleftPercentage = scrollPercentage;

    this.grid.queueRefresh();
  };

  GridRenderContainer.prototype.adjustRows = function adjustRows(scrollTop, scrollPercentage) {
    var self = this;

    var minRows = self.minRowsToRender();

    var rowCache = self.visibleRowCache;

    var maxRowIndex = rowCache.length - minRows;
    self.maxRowIndex = maxRowIndex;

    var curRowIndex = self.prevRowScrollIndex;

    // Calculate the scroll percentage according to the scrollTop location, if no percentage was provided
    if ((typeof(scrollPercentage) === 'undefined' || scrollPercentage === null) && scrollTop) {
      scrollPercentage = scrollTop / self.getCanvasHeight();
    }
    
    var rowIndex = Math.ceil(Math.min(maxRowIndex, maxRowIndex * scrollPercentage));

    // Define a max row index that we can't scroll past
    if (rowIndex > maxRowIndex) {
      rowIndex = maxRowIndex;
    }
    
    var newRange = [];
    if (rowCache.length > self.grid.options.virtualizationThreshold) {
      // Have we hit the threshold going down?
      if (self.prevScrollTop < scrollTop && rowIndex < self.prevRowScrollIndex + self.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
        return;
      }
      //Have we hit the threshold going up?
      if (self.prevScrollTop > scrollTop && rowIndex > self.prevRowScrollIndex - self.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
        return;
      }

      var rangeStart = Math.max(0, rowIndex - self.grid.options.excessRows);
      var rangeEnd = Math.min(rowCache.length, rowIndex + minRows + self.grid.options.excessRows);

      newRange = [rangeStart, rangeEnd];
    }
    else {
      var maxLen = self.visibleRowCache.length;
      newRange = [0, Math.max(maxLen, minRows + self.grid.options.excessRows)];
    }

    self.updateViewableRowRange(newRange);

    self.prevRowScrollIndex = rowIndex;
  };

  GridRenderContainer.prototype.adjustColumns = function adjustColumns(scrollLeft, scrollPercentage) {
    var self = this;

    var minCols = self.minColumnsToRender();

    var columnCache = self.visibleColumnCache;
    var maxColumnIndex = columnCache.length - minCols;

    // Calculate the scroll percentage according to the scrollTop location, if no percentage was provided
    if ((typeof(scrollPercentage) === 'undefined' || scrollPercentage === null) && scrollLeft) {
      scrollPercentage = scrollLeft / self.getCanvasWidth();
    }

    var colIndex = Math.ceil(Math.min(maxColumnIndex, maxColumnIndex * scrollPercentage));

    // Define a max row index that we can't scroll past
    if (colIndex > maxColumnIndex) {
      colIndex = maxColumnIndex;
    }
    
    var newRange = [];
    if (columnCache.length > self.grid.options.columnVirtualizationThreshold && self.getCanvasWidth() > self.getViewportWidth()) {
      // Have we hit the threshold going down?
      if (self.prevScrollLeft < scrollLeft && colIndex < self.prevColumnScrollIndex + self.grid.options.horizontalScrollThreshold && colIndex < maxColumnIndex) {
        return;
      }
      //Have we hit the threshold going up?
      if (self.prevScrollLeft > scrollLeft && colIndex > self.prevColumnScrollIndex - self.grid.options.horizontalScrollThreshold && colIndex < maxColumnIndex) {
        return;
      }

      var rangeStart = Math.max(0, colIndex - self.grid.options.excessColumns);
      var rangeEnd = Math.min(columnCache.length, colIndex + minCols + self.grid.options.excessColumns);

      newRange = [rangeStart, rangeEnd];
    }
    else {
      var maxLen = self.visibleColumnCache.length;

      newRange = [0, Math.max(maxLen, minCols + self.grid.options.excessColumns)];
    }
    
    self.updateViewableColumnRange(newRange);

    self.prevColumnScrollIndex = colIndex;
  };

  // Method for updating the visible rows
  GridRenderContainer.prototype.updateViewableRowRange = function updateViewableRowRange(renderedRange) {
    // Slice out the range of rows from the data
    // var rowArr = uiGridCtrl.grid.rows.slice(renderedRange[0], renderedRange[1]);
    var rowArr = this.visibleRowCache.slice(renderedRange[0], renderedRange[1]);

    // Define the top-most rendered row
    this.currentTopRow = renderedRange[0];

    // TODO(c0bra): make this method!
    this.setRenderedRows(rowArr);
  };

  // Method for updating the visible columns
  GridRenderContainer.prototype.updateViewableColumnRange = function updateViewableColumnRange(renderedRange) {
    // Slice out the range of rows from the data
    // var columnArr = uiGridCtrl.grid.columns.slice(renderedRange[0], renderedRange[1]);
    var columnArr = this.visibleColumnCache.slice(renderedRange[0], renderedRange[1]);

    // Define the left-most rendered columns
    this.currentFirstColumn = renderedRange[0];

    this.setRenderedColumns(columnArr);
  };

  GridRenderContainer.prototype.rowStyle = function (index) {
    var self = this;

    var styles = {};
    
    if (index === 0 && self.currentTopRow !== 0) {
      // The row offset-top is just the height of the rows above the current top-most row, which are no longer rendered
      var hiddenRowWidth = (self.currentTopRow) * self.grid.options.rowHeight;

      // return { 'margin-top': hiddenRowWidth + 'px' };
      styles['margin-top'] = hiddenRowWidth + 'px';
    }

    if (self.currentFirstColumn !== 0) {
      if (self.grid.isRTL()) {
        styles['margin-right'] = self.columnOffset + 'px';
      }
      else {
        styles['margin-left'] = self.columnOffset + 'px';
      }
    }

    return styles;
  };

  GridRenderContainer.prototype.columnStyle = function (index) {
    var self = this;
    
    if (index === 0 && self.currentFirstColumn !== 0) {
      var offset = self.columnOffset;

      if (self.grid.isRTL()) {
        return { 'margin-right': offset + 'px' };
      }
      else {
        return { 'margin-left': offset + 'px' };
      }
    }

    return null;
  };

  GridRenderContainer.prototype.updateColumnWidths = function () {
    var self = this;

    var asterisksArray = [],
        percentArray = [],
        manualArray = [],
        asteriskNum = 0,
        totalWidth = 0;

    // Get the width of the viewport
    var availableWidth = self.getViewportWidth();

    if (typeof(self.grid.verticalScrollbarWidth) !== 'undefined' && self.grid.verticalScrollbarWidth !== undefined && self.grid.verticalScrollbarWidth > 0) {
      availableWidth = availableWidth + self.grid.verticalScrollbarWidth;
    }

    // The total number of columns
    // var equalWidthColumnCount = columnCount = uiGridCtrl.grid.options.columnDefs.length;
    // var equalWidth = availableWidth / equalWidthColumnCount;

    // The last column we processed
    var lastColumn;

    var manualWidthSum = 0;

    var canvasWidth = 0;

    var ret = '';


    // uiGridCtrl.grid.columns.forEach(function(column, i) {

    var columnCache = self.visibleColumnCache;

    columnCache.forEach(function(column, i) {
      // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + i + ' { width: ' + equalWidth + 'px; left: ' + left + 'px; }';
      //var colWidth = (typeof(c.width) !== 'undefined' && c.width !== undefined) ? c.width : equalWidth;

      // Skip hidden columns
      if (!column.visible) { return; }

      var colWidth,
          isPercent = false;

      if (!angular.isNumber(column.width)) {
        isPercent = isNaN(column.width) && gridUtil.endsWith(column.width, "%");
      }

      if (angular.isString(column.width) && column.width.indexOf('*') !== -1) { //  we need to save it until the end to do the calulations on the remaining width.
        asteriskNum = parseInt(asteriskNum + column.width.length, 10);
        
        asterisksArray.push(column);
      }
      else if (isPercent) { // If the width is a percentage, save it until the very last.
        percentArray.push(column);
      }
      else if (angular.isNumber(column.width)) {
        manualWidthSum = parseInt(manualWidthSum + column.width, 10);
        
        canvasWidth = parseInt(canvasWidth, 10) + parseInt(column.width, 10);

        column.drawnWidth = column.width;
      }
    });

    // Get the remaining width (available width subtracted by the manual widths sum)
    var remainingWidth = availableWidth - manualWidthSum;

    var i, column, colWidth;

    if (percentArray.length > 0) {
      // Pre-process to make sure they're all within any min/max values
      for (i = 0; i < percentArray.length; i++) {
        column = percentArray[i];

        var percent = parseInt(column.width.replace(/%/g, ''), 10) / 100;

        colWidth = parseInt(percent * remainingWidth, 10);

        if (column.colDef.minWidth && colWidth < column.colDef.minWidth) {
          colWidth = column.colDef.minWidth;

          remainingWidth = remainingWidth - colWidth;

          canvasWidth += colWidth;
          column.drawnWidth = colWidth;

          // Remove this element from the percent array so it's not processed below
          percentArray.splice(i, 1);
        }
        else if (column.colDef.maxWidth && colWidth > column.colDef.maxWidth) {
          colWidth = column.colDef.maxWidth;

          remainingWidth = remainingWidth - colWidth;

          canvasWidth += colWidth;
          column.drawnWidth = colWidth;

          // Remove this element from the percent array so it's not processed below
          percentArray.splice(i, 1);
        }
      }

      percentArray.forEach(function(column) {
        var percent = parseInt(column.width.replace(/%/g, ''), 10) / 100;
        var colWidth = parseInt(percent * remainingWidth, 10);

        canvasWidth += colWidth;

        column.drawnWidth = colWidth;
      });
    }

    if (asterisksArray.length > 0) {
      var asteriskVal = parseInt(remainingWidth / asteriskNum, 10);

       // Pre-process to make sure they're all within any min/max values
      for (i = 0; i < asterisksArray.length; i++) {
        column = asterisksArray[i];

        colWidth = parseInt(asteriskVal * column.width.length, 10);

        if (column.colDef.minWidth && colWidth < column.colDef.minWidth) {
          colWidth = column.colDef.minWidth;

          remainingWidth = remainingWidth - colWidth;
          asteriskNum--;

          canvasWidth += colWidth;
          column.drawnWidth = colWidth;

          lastColumn = column;

          // Remove this element from the percent array so it's not processed below
          asterisksArray.splice(i, 1);
        }
        else if (column.colDef.maxWidth && colWidth > column.colDef.maxWidth) {
          colWidth = column.colDef.maxWidth;

          remainingWidth = remainingWidth - colWidth;
          asteriskNum--;

          canvasWidth += colWidth;
          column.drawnWidth = colWidth;

          // Remove this element from the percent array so it's not processed below
          asterisksArray.splice(i, 1);
        }
      }

      // Redo the asterisk value, as we may have removed columns due to width constraints
      asteriskVal = parseInt(remainingWidth / asteriskNum, 10);

      asterisksArray.forEach(function(column) {
        var colWidth = parseInt(asteriskVal * column.width.length, 10);

        canvasWidth += colWidth;

        column.drawnWidth = colWidth;
      });
    }

    // If the grid width didn't divide evenly into the column widths and we have pixels left over, dole them out to the columns one by one to make everything fit
    var leftoverWidth = availableWidth - parseInt(canvasWidth, 10);

    if (leftoverWidth > 0 && canvasWidth > 0 && canvasWidth < availableWidth) {
      var variableColumn = false;
      // uiGridCtrl.grid.columns.forEach(function(col) {
      columnCache.forEach(function(col) {
        if (col.width && !angular.isNumber(col.width)) {
          variableColumn = true;
        }
      });

      if (variableColumn) {
        var remFn = function (column) {
          if (leftoverWidth > 0) {
            column.drawnWidth = column.drawnWidth + 1;
            canvasWidth = canvasWidth + 1;
            leftoverWidth--;
          }
        };
        while (leftoverWidth > 0) {
          columnCache.forEach(remFn);
        }
      }
    }

    if (canvasWidth < availableWidth) {
      canvasWidth = availableWidth;
    }

    // Build the CSS
    columnCache.forEach(function (column) {
      ret = ret + column.getColClassDefinition();
    });

    // Add the vertical scrollbar width back in to the canvas width, it's taken out in getCanvasWidth
    if (self.grid.verticalScrollbarWidth) {
      canvasWidth = canvasWidth + self.grid.verticalScrollbarWidth;
    }
    // canvasWidth = canvasWidth + 1;

    self.canvasWidth = parseInt(canvasWidth, 10);

    // Return the styles back to buildStyles which pops them into the `customStyles` scope variable
    // return ret;

    // Set this render container's column styles so they can be used in style computation
    this.columnStyles = ret;
  };

  return GridRenderContainer;
}]);

})();
