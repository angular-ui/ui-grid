(function(){

angular.module('ui.grid')
.factory('GridRenderContainer', ['gridUtil', function(gridUtil) {
  function GridRenderContainer(grid) {
    this.grid = grid;
    
    this.rowCache = [];
    this.columnCache = [];

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
    this.rowCache.length = 0;
    this.columnCache.length = 0;

    this.visibleColumnCache.length = 0;
    this.visibleRowCache.length = 0;

    this.renderedRows.length = 0;
    this.renderedColumns.length = 0;
  };

  // TODO(c0bra): calculate size?? Should this be in a stackable directive?

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

  GridRenderContainer.prototype.getCanvasHeight = function getCanvasHeight() {
    var self = this;

    var ret =  self.options.rowHeight * self.getVisibleRowCount();

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
      hiddenColumnsWidth += this.columnCache[i].drawnWidth;
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

    this.grid.refreshCanvas();
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

    this.grid.refreshCanvas();
  };

  GridRenderContainer.prototype.adjustColumns = function adjustColumns(scrollLeft, scrollPercentage) {
    var self = this;

    var minCols = self.minColumnsToRender();

    var columnCache = self.columnCache;
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
      var maxLen = self.columnCache.length;
      newRange = [0, Math.max(maxLen, minCols + self.grid.options.excessColumns)];
    }
    
    // TODO(c0bra): make this method!
    self.updateViewableColumnRange(newRange);

    self.prevColumnScrollIndex = colIndex;
  };

  return GridRenderContainer;
}]);

})();