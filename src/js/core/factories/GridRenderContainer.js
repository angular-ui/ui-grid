(function(){

angular.module('ui.grid')
.factory('GridRenderContainer', ['gridUtil', function(gridUtil) {
  function GridRenderContainer(grid) {
    this.grid = grid;
    
    // this.rowCache = [];
    // this.columnCache = [];

    this.visibleRowCache = [];
    this.visibleColumnCache = [];

    this.renderedRows = [];
    this.renderedColumns = [];

    this.prevScrollTop = 0;
    this.prevScrolltopPercentage = 0;
    this.prevRowScrollIndex = 0;

    this.prevScrollLeft = 0;
    this.prevScrollLeftPercentage = 0;
    this.prevColumnScrollIndex = 0;
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
    return Math.ceil(self.getViewportHeight() / self.grid.options.rowHeight);
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
        totalWidth += col.drawnWidth;
        min++;
      }
      else {
        var currWidth = 0;
        for (var j = i; j >= i - min; j--) {
          currWidth += self.visibleColumnCache[j].drawnWidth;
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

  GridRenderContainer.prototype.getViewportHeight = function getViewportHeight() {
    var self = this;

    var viewPortHeight = self.grid.gridHeight - self.grid.headerHeight;

    // Account for native horizontal scrollbar, if present
    if (typeof(self.horizontalScrollbarHeight) !== 'undefined' && self.horizontalScrollbarHeight !== undefined && self.horizontalScrollbarHeight > 0) {
      viewPortHeight = viewPortHeight - self.horizontalScrollbarHeight;
    }

    return viewPortHeight;
  };

  GridRenderContainer.prototype.getViewportWidth = function getViewportWidth() {
    var self = this;

    var viewPortWidth = self.grid.gridWidth;

    if (typeof(self.verticalScrollbarWidth) !== 'undefined' && self.verticalScrollbarWidth !== undefined && self.verticalScrollbarWidth > 0) {
      viewPortWidth = viewPortWidth - self.verticalScrollbarWidth;
    }

    return viewPortWidth;
  };

  GridRenderContainer.prototype.getHeaderViewportWidth = function getHeaderViewportWidth() {
    var viewPortWidth = this.getViewportWidth();

    if (typeof(this.grid.verticalScrollbarWidth) !== 'undefined' && this.grid.verticalScrollbarWidth !== undefined && this.grid.verticalScrollbarWidth > 0) {
      viewPortWidth = viewPortWidth + this.grid.verticalScrollbarWidth;
    }

    return viewPortWidth;
  };

  GridRenderContainer.prototype.getCanvasHeight = function getCanvasHeight() {
    var self = this;

    var ret =  self.grid.options.rowHeight * self.getVisibleRowCount();

    if (typeof(self.horizontalScrollbarHeight) !== 'undefined' && self.horizontalScrollbarHeight !== undefined && self.horizontalScrollbarHeight > 0) {
      ret = ret - self.horizontalScrollbarHeight;
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

    self.maxColumnIndex = maxColumnIndex;

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
      styles['margin-left'] = self.columnOffset + 'px';
    }

    return styles;
  };

  GridRenderContainer.prototype.columnStyle = function (index) {
    var self = this;
    
    if (index === 0 && self.currentFirstColumn !== 0) {
      var offset = self.columnOffset;

      return { 'margin-left': offset + 'px' };
    }

    return null;
  };

  return GridRenderContainer;
}]);

})();