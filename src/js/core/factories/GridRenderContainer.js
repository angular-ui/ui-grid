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
.factory('GridRenderContainer', ['gridUtil', 'uiGridConstants', function(gridUtil, uiGridConstants) {
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

    /**
     *  @ngdoc boolean
     *  @name hasHScrollbar
     *  @propertyOf  ui.grid.class:GridRenderContainer
     *  @description flag to signal that container has a horizontal scrollbar
     */
    self.hasHScrollbar = false;

    /**
     *  @ngdoc boolean
     *  @name hasVScrollbar
     *  @propertyOf  ui.grid.class:GridRenderContainer
     *  @description flag to signal that container has a vertical scrollbar
     */
    self.hasVScrollbar = false;

    /**
     *  @ngdoc boolean
     *  @name canvasHeightShouldUpdate
     *  @propertyOf  ui.grid.class:GridRenderContainer
     *  @description flag to signal that container should recalculate the canvas size
     */
    self.canvasHeightShouldUpdate = true;

    /**
     *  @ngdoc boolean
     *  @name canvasHeight
     *  @propertyOf  ui.grid.class:GridRenderContainer
     *  @description last calculated canvas height value
     */
    self.$$canvasHeight = 0;

    if (options && angular.isObject(options)) {
      angular.extend(self, options);
    }

    grid.registerStyleComputation({
      priority: 5,
      func: function () {
        self.updateColumnWidths();
        return self.columnStyles;
      }
    });
  }


  GridRenderContainer.prototype.reset = function reset() {
    // this.rowCache.length = 0;
    // this.columnCache.length = 0;

    this.visibleColumnCache.length = 0;
    this.visibleRowCache.length = 0;

    this.renderedRows.length = 0;
    this.renderedColumns.length = 0;
  };

  // TODO(c0bra): calculate size?? Should this be in a stackable directive?


  GridRenderContainer.prototype.containsColumn = function (col) {
     return this.visibleColumnCache.indexOf(col) !== -1;
  };

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
  GridRenderContainer.prototype.removeViewportAdjuster = function removeViewportAdjuster(func) {
    var idx = this.viewportAdjusters.indexOf(func);

    if (idx > -1) {
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

  GridRenderContainer.prototype.getMargin = function getMargin(side) {
    var self = this;

    var amount = 0;

    self.viewportAdjusters.forEach(function (func) {
      var adjustment = func.call(this, { height: 0, width: 0 });

      if (adjustment.side && adjustment.side === side) {
        amount += adjustment.width * -1;
      }
    });

    return amount;
  };

  GridRenderContainer.prototype.getViewportHeight = function getViewportHeight() {
    var self = this;

    var headerHeight = (self.headerHeight) ? self.headerHeight : self.grid.headerHeight;

    var viewPortHeight = self.grid.gridHeight - headerHeight - self.grid.footerHeight;


    var adjustment = self.getViewportAdjustment();

    viewPortHeight = viewPortHeight + adjustment.height;

    return viewPortHeight;
  };

  GridRenderContainer.prototype.getViewportWidth = function getViewportWidth() {
    var self = this;

    var viewportWidth = self.grid.gridWidth;

    //if (typeof(self.grid.verticalScrollbarWidth) !== 'undefined' && self.grid.verticalScrollbarWidth !== undefined && self.grid.verticalScrollbarWidth > 0) {
    //  viewPortWidth = viewPortWidth - self.grid.verticalScrollbarWidth;
    //}

    // var viewportWidth = 0;\
    // self.visibleColumnCache.forEach(function (column) {
    //   viewportWidth += column.drawnWidth;
    // });

    var adjustment = self.getViewportAdjustment();

    viewportWidth = viewportWidth + adjustment.width;

    return viewportWidth;
  };

  GridRenderContainer.prototype.getHeaderViewportWidth = function getHeaderViewportWidth() {
    var self = this;

    var viewportWidth = this.getViewportWidth();

    //if (typeof(self.grid.verticalScrollbarWidth) !== 'undefined' && self.grid.verticalScrollbarWidth !== undefined && self.grid.verticalScrollbarWidth > 0) {
    //  viewPortWidth = viewPortWidth + self.grid.verticalScrollbarWidth;
    //}

    // var adjustment = self.getViewportAdjustment();
    // viewPortWidth = viewPortWidth + adjustment.width;

    return viewportWidth;
  };


  /**
   * @ngdoc function
   * @name getCanvasHeight
   * @methodOf ui.grid.class:GridRenderContainer
   * @description Returns the total canvas height.   Only recalculates if canvasHeightShouldUpdate = false
   * @returns {number} total height of all the visible rows in the container
   */
  GridRenderContainer.prototype.getCanvasHeight = function getCanvasHeight() {
    var self = this;

    if (!self.canvasHeightShouldUpdate) {
      return self.$$canvasHeight;
    }

    var oldCanvasHeight = self.$$canvasHeight;

    self.$$canvasHeight =  0;

    self.visibleRowCache.forEach(function(row){
      self.$$canvasHeight += row.height;
    });


    self.canvasHeightShouldUpdate = false;

    self.grid.api.core.raise.canvasHeightChanged(oldCanvasHeight, self.$$canvasHeight);

    return self.$$canvasHeight;
  };

  GridRenderContainer.prototype.getVerticalScrollLength = function getVerticalScrollLength() {
    return this.getCanvasHeight() - this.getViewportHeight() + this.grid.scrollbarHeight !== 0 ? this.getCanvasHeight() - this.getViewportHeight() + this.grid.scrollbarHeight : -1;
  };

  GridRenderContainer.prototype.getHorizontalScrollLength = function getHorizontalScrollLength() {
    return this.getCanvasWidth() - this.getViewportWidth() + this.grid.scrollbarWidth !== 0 ? this.getCanvasWidth() - this.getViewportWidth() + this.grid.scrollbarWidth : -1;
  };

  GridRenderContainer.prototype.getCanvasWidth = function getCanvasWidth() {
    var self = this;

    var ret = self.canvasWidth;

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

  GridRenderContainer.prototype.scrollVertical = function (newScrollTop) {
    var vertScrollPercentage = -1;

    if (newScrollTop !== this.prevScrollTop) {
      var yDiff = newScrollTop - this.prevScrollTop;

      if (yDiff > 0 ) { this.grid.scrollDirection = uiGridConstants.scrollDirection.DOWN; }
      if (yDiff < 0 ) { this.grid.scrollDirection = uiGridConstants.scrollDirection.UP; }

      var vertScrollLength = this.getVerticalScrollLength();

      vertScrollPercentage = newScrollTop / vertScrollLength;

      // console.log('vert', vertScrollPercentage, newScrollTop, vertScrollLength);

      if (vertScrollPercentage > 1) { vertScrollPercentage = 1; }
      if (vertScrollPercentage < 0) { vertScrollPercentage = 0; }

      this.adjustScrollVertical(newScrollTop, vertScrollPercentage);
      return vertScrollPercentage;
    }
  };

  GridRenderContainer.prototype.scrollHorizontal = function(newScrollLeft){
    var horizScrollPercentage = -1;

    // Handle RTL here

    if (newScrollLeft !== this.prevScrollLeft) {
      var xDiff = newScrollLeft - this.prevScrollLeft;

      if (xDiff > 0) { this.grid.scrollDirection = uiGridConstants.scrollDirection.RIGHT; }
      if (xDiff < 0) { this.grid.scrollDirection = uiGridConstants.scrollDirection.LEFT; }

      var horizScrollLength = this.getHorizontalScrollLength();
      if (horizScrollLength !== 0) {
        horizScrollPercentage = newScrollLeft / horizScrollLength;
      }
      else {
        horizScrollPercentage = 0;
      }

      this.adjustScrollHorizontal(newScrollLeft, horizScrollPercentage);
      return horizScrollPercentage;
    }
  };

  GridRenderContainer.prototype.adjustScrollVertical = function adjustScrollVertical(scrollTop, scrollPercentage, force) {
    if (this.prevScrollTop === scrollTop && !force) {
      return;
    }

    if (typeof(scrollTop) === 'undefined' || scrollTop === undefined || scrollTop === null) {
      scrollTop = (this.getCanvasHeight() - this.getViewportHeight()) * scrollPercentage;
    }

    this.adjustRows(scrollTop, scrollPercentage, false);

    this.prevScrollTop = scrollTop;
    this.prevScrolltopPercentage = scrollPercentage;

    this.grid.queueRefresh();
  };

  GridRenderContainer.prototype.adjustScrollHorizontal = function adjustScrollHorizontal(scrollLeft, scrollPercentage, force) {
    if (this.prevScrollLeft === scrollLeft && !force) {
      return;
    }

    if (typeof(scrollLeft) === 'undefined' || scrollLeft === undefined || scrollLeft === null) {
      scrollLeft = (this.getCanvasWidth() - this.getViewportWidth()) * scrollPercentage;
    }

    this.adjustColumns(scrollLeft, scrollPercentage);

    this.prevScrollLeft = scrollLeft;
    this.prevScrollleftPercentage = scrollPercentage;

    this.grid.queueRefresh();
  };

  GridRenderContainer.prototype.adjustRows = function adjustRows(scrollTop, scrollPercentage, postDataLoaded) {
    var self = this;

    var minRows = self.minRowsToRender();

    var rowCache = self.visibleRowCache;

    var maxRowIndex = rowCache.length - minRows;

    // console.log('scroll%1', scrollPercentage);

    // Calculate the scroll percentage according to the scrollTop location, if no percentage was provided
    if ((typeof(scrollPercentage) === 'undefined' || scrollPercentage === null) && scrollTop) {
      scrollPercentage = scrollTop / self.getVerticalScrollLength();
    }

    var rowIndex = Math.ceil(Math.min(maxRowIndex, maxRowIndex * scrollPercentage));

    // console.log('maxRowIndex / scroll%', maxRowIndex, scrollPercentage, rowIndex);

    // Define a max row index that we can't scroll past
    if (rowIndex > maxRowIndex) {
      rowIndex = maxRowIndex;
    }

    var newRange = [];
    if (rowCache.length > self.grid.options.virtualizationThreshold) {
      if (!(typeof(scrollTop) === 'undefined' || scrollTop === null)) {
        // Have we hit the threshold going down?
        if ( !self.grid.suppressParentScrollDown && self.prevScrollTop < scrollTop && rowIndex < self.prevRowScrollIndex + self.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
          return;
        }
        //Have we hit the threshold going up?
        if ( !self.grid.suppressParentScrollUp && self.prevScrollTop > scrollTop && rowIndex > self.prevRowScrollIndex - self.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
          return;
        }
      }
      var rangeStart = {};
      var rangeEnd = {};

      rangeStart = Math.max(0, rowIndex - self.grid.options.excessRows);
      rangeEnd = Math.min(rowCache.length, rowIndex + minRows + self.grid.options.excessRows);

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

    // Calculate the scroll percentage according to the scrollLeft location, if no percentage was provided
    if ((typeof(scrollPercentage) === 'undefined' || scrollPercentage === null) && scrollLeft) {
      scrollPercentage = scrollLeft / self.getHorizontalScrollLength();
    }

    var colIndex = Math.ceil(Math.min(maxColumnIndex, maxColumnIndex * scrollPercentage));

    // Define a max row index that we can't scroll past
    if (colIndex > maxColumnIndex) {
      colIndex = maxColumnIndex;
    }

    var newRange = [];
    if (columnCache.length > self.grid.options.columnVirtualizationThreshold && self.getCanvasWidth() > self.getViewportWidth()) {
      /* Commented the following lines because otherwise the moved column wasn't visible immediately on the new position
       * in the case of many columns with horizontal scroll, one had to scroll left or right and then return in order to see it
      // Have we hit the threshold going down?
      if (self.prevScrollLeft < scrollLeft && colIndex < self.prevColumnScrollIndex + self.grid.options.horizontalScrollThreshold && colIndex < maxColumnIndex) {
        return;
      }
      //Have we hit the threshold going up?
      if (self.prevScrollLeft > scrollLeft && colIndex > self.prevColumnScrollIndex - self.grid.options.horizontalScrollThreshold && colIndex < maxColumnIndex) {
        return;
      }*/

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

  GridRenderContainer.prototype.headerCellWrapperStyle = function () {
    var self = this;

    if (self.currentFirstColumn !== 0) {
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

    /**
     *  @ngdoc boolean
     *  @name updateColumnWidths
     *  @propertyOf  ui.grid.class:GridRenderContainer
     *  @description Determine the appropriate column width of each column across all render containers.
     *
     *  Column width is easy when each column has a specified width.  When columns are variable width (i.e.
     *  have an * or % of the viewport) then we try to calculate so that things fit in.  The problem is that
     *  we have multiple render containers, and we don't want one render container to just take the whole viewport
     *  when it doesn't need to - we want things to balance out across the render containers.
     *
     *  To do this, we use this method to calculate all the renderContainers, recognising that in a given render
     *  cycle it'll get called once per render container, so it needs to return the same values each time.
     *
     *  The constraints on this method are therefore:
     *  - must return the same value when called multiple times, to do this it needs to rely on properties of the
     *    columns, but not properties that change when this is called (so it shouldn't rely on drawnWidth)
     *
     *  The general logic of this method is:
     *  - calculate our total available width
     *  - look at all the columns across all render containers, and work out which have widths and which have
     *    constraints such as % or * or something else
     *  - for those with *, count the total number of * we see and add it onto a running total, add this column to an * array
     *  - for those with a %, allocate the % as a percentage of the viewport, having consideration of min and max
     *  - for those with manual width (in pixels) we set the drawnWidth to the specified width
     *  - we end up with an asterisks array still to process
     *  - we look at our remaining width.  If it's greater than zero, we divide it up among the asterisk columns, then process
     *    them for min and max width constraints
     *  - if it's zero or less, we set the asterisk columns to their minimum widths
     *  - we use parseInt quite a bit, as we try to make all our column widths integers
     */
  GridRenderContainer.prototype.updateColumnWidths = function () {
    var self = this;

    var asterisksArray = [],
        asteriskNum = 0,
        usedWidthSum = 0,
        ret = '';

    // Get the width of the viewport
    var availableWidth = self.grid.getViewportWidth() - self.grid.scrollbarWidth;

    // get all the columns across all render containers, we have to calculate them all or one render container
    // could consume the whole viewport
    var columnCache = [];
    angular.forEach(self.grid.renderContainers, function( container, name){
      columnCache = columnCache.concat(container.visibleColumnCache);
    });

    // look at each column, process any manual values or %, put the * into an array to look at later
    columnCache.forEach(function(column, i) {
      var width = 0;
      // Skip hidden columns
      if (!column.visible) { return; }

      if (angular.isNumber(column.width)) {
        // pixel width, set to this value
        width = parseInt(column.width, 10);
        usedWidthSum = usedWidthSum + width;
        column.drawnWidth = width;

      } else if (gridUtil.endsWith(column.width, "%")) {
        // percentage width, set to percentage of the viewport
        width = parseFloat(parseInt(column.width.replace(/%/g, ''), 10) / 100 * availableWidth);

        if ( width > column.maxWidth ){
          width = column.maxWidth;
        }

        if ( width < column.minWidth ){
          width = column.minWidth;
        }

        usedWidthSum = usedWidthSum + width;
        column.drawnWidth = width;
      } else if (angular.isString(column.width) && column.width.indexOf('*') !== -1) {
        // is an asterisk column, the gridColumn already checked the string consists only of '****'
        asteriskNum = asteriskNum + column.width.length;
        asterisksArray.push(column);
      }
    });

    // Get the remaining width (available width subtracted by the used widths sum)
    var remainingWidth = availableWidth - usedWidthSum;

    var i, column, colWidth;

    if (asterisksArray.length > 0) {
      // the width that each asterisk value would be assigned (this can be negative)
      var asteriskVal = remainingWidth / asteriskNum;

      asterisksArray.forEach(function( column ){
        var width = parseInt(column.width.length * asteriskVal, 10);

        if ( width > column.maxWidth ){
          width = column.maxWidth;
        }

        if ( width < column.minWidth ){
          width = column.minWidth;
        }

        usedWidthSum = usedWidthSum + width;
        column.drawnWidth = width;
      });
    }

    // If the grid width didn't divide evenly into the column widths and we have pixels left over, or our
    // calculated widths would have the grid narrower than the available space,
    // dole the remainder out one by one to make everything fit
    var processColumnUpwards = function(column){
      if ( column.drawnWidth < column.maxWidth && leftoverWidth > 0) {
        column.drawnWidth++;
        usedWidthSum++;
        leftoverWidth--;
        columnsToChange = true;
      }
    };

    var leftoverWidth = availableWidth - usedWidthSum;
    var columnsToChange = true;

    while (leftoverWidth > 0 && columnsToChange) {
      columnsToChange = false;
      asterisksArray.forEach(processColumnUpwards);
    }

    // We can end up with too much width even though some columns aren't at their max width, in this situation
    // we can trim the columns a little
    var processColumnDownwards = function(column){
      if ( column.drawnWidth > column.minWidth && excessWidth > 0) {
        column.drawnWidth--;
        usedWidthSum--;
        excessWidth--;
        columnsToChange = true;
      }
    };

    var excessWidth =  usedWidthSum - availableWidth;
    columnsToChange = true;

    while (excessWidth > 0 && columnsToChange) {
      columnsToChange = false;
      asterisksArray.forEach(processColumnDownwards);
    }


    // all that was across all the renderContainers, now we need to work out what that calculation decided for
    // our renderContainer
    var canvasWidth = 0;
    self.visibleColumnCache.forEach(function(column){
      if ( column.visible ){
        canvasWidth = canvasWidth + column.drawnWidth;
      }
    });

    // Build the CSS
    columnCache.forEach(function (column) {
      ret = ret + column.getColClassDefinition();
    });

    self.canvasWidth = canvasWidth;

    // Return the styles back to buildStyles which pops them into the `customStyles` scope variable
    // return ret;

    // Set this render container's column styles so they can be used in style computation
    this.columnStyles = ret;
  };

  GridRenderContainer.prototype.needsHScrollbarPlaceholder = function () {
    return this.grid.options.enableHorizontalScrollbar && !this.hasHScrollbar && !this.grid.disableScrolling;
  };

  GridRenderContainer.prototype.getViewportStyle = function () {
    var self = this;
    var styles = {};

    self.hasHScrollbar = false;
    self.hasVScrollbar = false;

    if (self.grid.disableScrolling) {
      styles['overflow-x'] = 'hidden';
      styles['overflow-y'] = 'hidden';
      return styles;
    }

    if (self.name === 'body') {
      self.hasHScrollbar = self.grid.options.enableHorizontalScrollbar !== uiGridConstants.scrollbars.NEVER;
      if (!self.grid.isRTL()) {
        if (!self.grid.hasRightContainerColumns()) {
          self.hasVScrollbar = self.grid.options.enableVerticalScrollbar !== uiGridConstants.scrollbars.NEVER;
        }
      }
      else {
        if (!self.grid.hasLeftContainerColumns()) {
          self.hasVScrollbar = self.grid.options.enableVerticalScrollbar !== uiGridConstants.scrollbars.NEVER;
        }
      }
    }
    else if (self.name === 'left') {
      self.hasVScrollbar = self.grid.isRTL() ? self.grid.options.enableVerticalScrollbar !== uiGridConstants.scrollbars.NEVER : false;
    }
    else {
      self.hasVScrollbar = !self.grid.isRTL() ? self.grid.options.enableVerticalScrollbar !== uiGridConstants.scrollbars.NEVER : false;
    }

    styles['overflow-x'] = self.hasHScrollbar ? 'scroll' : 'hidden';
    styles['overflow-y'] = self.hasVScrollbar ? 'scroll' : 'hidden';


    return styles;


  };

  return GridRenderContainer;
}]);

})();
