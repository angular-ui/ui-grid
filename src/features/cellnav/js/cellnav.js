(function () {
  'use strict';
  var module = angular.module('ui.grid.cellNav', ['ui.grid']);

  function RowCol(row, col) {
    this.row = row;
    this.col = col;
  }

  /**
   *  @ngdoc object
   *  @name ui.grid.cellNav.constant:uiGridCellNavConstants
   *
   *  @description constants available in cellNav
   */
  module.constant('uiGridCellNavConstants', {
    FEATURE_NAME: 'gridCellNav',
    CELL_NAV_EVENT: 'cellNav',
    direction: {LEFT: 0, RIGHT: 1, UP: 2, DOWN: 3, PG_UP: 4, PG_DOWN: 5},
    EVENT_TYPE: {
      KEYDOWN: 0,
      CLICK: 1
    }
  });


  module.factory('uiGridCellNavFactory', ['gridUtil', 'uiGridConstants', 'uiGridCellNavConstants', '$q',
    function (gridUtil, uiGridConstants, uiGridCellNavConstants, $q) {
      /**
       *  @ngdoc object
       *  @name ui.grid.cellNav.object:CellNav
       *  @description returns a CellNav prototype function
       *  @param {object} rowContainer container for rows
       *  @param {object} colContainer parent column container
       *  @param {object} leftColContainer column container to the left of parent
       *  @param {object} rightColContainer column container to the right of parent
       */
      var UiGridCellNav = function UiGridCellNav(rowContainer, colContainer, leftColContainer, rightColContainer) {
        this.rows = rowContainer.visibleRowCache;
        this.columns = colContainer.visibleColumnCache;
        this.leftColumns = leftColContainer ? leftColContainer.visibleColumnCache : [];
        this.rightColumns = rightColContainer ? rightColContainer.visibleColumnCache : [];
        this.bodyContainer = rowContainer;
      };

      /** returns focusable columns of all containers */
      UiGridCellNav.prototype.getFocusableCols = function () {
        var allColumns = this.leftColumns.concat(this.columns, this.rightColumns);

        return allColumns.filter(function (col) {
          return col.colDef.allowCellFocus;
        });
      };

      /**
       *  @ngdoc object
       *  @name ui.grid.cellNav.api:GridRow
       *
       *  @description GridRow settings for cellNav feature, these are available to be
       *  set only internally (for example, by other features)
       */

      /**
       *  @ngdoc object
       *  @name allowCellFocus
       *  @propertyOf  ui.grid.cellNav.api:GridRow
       *  @description Enable focus on a cell within this row.  If set to false then no cells
       *  in this row can be focused - group header rows as an example would set this to false.
       *  <br/>Defaults to true
       */
      /** returns focusable rows */
      UiGridCellNav.prototype.getFocusableRows = function () {
        return this.rows.filter(function(row) {
          return row.allowCellFocus !== false;
        });
      };

      UiGridCellNav.prototype.getNextRowCol = function (direction, curRow, curCol) {
        switch (direction) {
          case uiGridCellNavConstants.direction.LEFT:
            return this.getRowColLeft(curRow, curCol);
          case uiGridCellNavConstants.direction.RIGHT:
            return this.getRowColRight(curRow, curCol);
          case uiGridCellNavConstants.direction.UP:
            return this.getRowColUp(curRow, curCol);
          case uiGridCellNavConstants.direction.DOWN:
            return this.getRowColDown(curRow, curCol);
          case uiGridCellNavConstants.direction.PG_UP:
            return this.getRowColPageUp(curRow, curCol);
          case uiGridCellNavConstants.direction.PG_DOWN:
            return this.getRowColPageDown(curRow, curCol);
        }

      };

      UiGridCellNav.prototype.getRowColLeft = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 1
        if (curColIndex === -1) {
          curColIndex = 1;
        }

        var nextColIndex = curColIndex === 0 ? focusableCols.length - 1 : curColIndex - 1;

        //get column to left
        if (nextColIndex > curColIndex) {
          if (curRowIndex === 0) {
            return new RowCol(curRow, focusableCols[nextColIndex]); //return same row
          }
          else {
            //up one row and far right column
            return new RowCol(focusableRows[curRowIndex - 1], focusableCols[nextColIndex]);
          }
        }
        else {
          return new RowCol(curRow, focusableCols[nextColIndex]);
        }
      };

      UiGridCellNav.prototype.getRowColRight = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }
        var nextColIndex = curColIndex === focusableCols.length - 1 ? 0 : curColIndex + 1;

        if (nextColIndex < curColIndex) {
          if (curRowIndex === focusableRows.length - 1) {
            return new RowCol(curRow, focusableCols[nextColIndex]); //return same row
          }
          else {
            //down one row and far left column
            return new RowCol(focusableRows[curRowIndex + 1], focusableCols[nextColIndex]);
          }
        }
        else {
          return new RowCol(curRow, focusableCols[nextColIndex]);
        }
      };

      UiGridCellNav.prototype.getRowColDown = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }

        if (curRowIndex === focusableRows.length - 1) {
          return new RowCol(curRow, focusableCols[curColIndex]); //return same row
        }
        else {
          //down one row
          return new RowCol(focusableRows[curRowIndex + 1], focusableCols[curColIndex]);
        }
      };

      UiGridCellNav.prototype.getRowColPageDown = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }

        var pageSize = this.bodyContainer.minRowsToRender();
        if (curRowIndex >= focusableRows.length - pageSize) {
          return new RowCol(focusableRows[focusableRows.length - 1], focusableCols[curColIndex]); //return last row
        }
        else {
          //down one page
          return new RowCol(focusableRows[curRowIndex + pageSize], focusableCols[curColIndex]);
        }
      };

      UiGridCellNav.prototype.getRowColUp = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }

        if (curRowIndex === 0) {
          return new RowCol(curRow, focusableCols[curColIndex]); //return same row
        }
        else {
          //up one row
          return new RowCol(focusableRows[curRowIndex - 1], focusableCols[curColIndex]);
        }
      };

      UiGridCellNav.prototype.getRowColPageUp = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var focusableRows = this.getFocusableRows();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = focusableRows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }

        var pageSize = this.bodyContainer.minRowsToRender();
        if (curRowIndex - pageSize < 0) {
          return new RowCol(focusableRows[0], focusableCols[curColIndex]); //return first row
        }
        else {
          //up one page
          return new RowCol(focusableRows[curRowIndex - pageSize], focusableCols[curColIndex]);
        }
      };
      return UiGridCellNav;
    }]);

  /**
   *  @ngdoc service
   *  @name ui.grid.cellNav.service:uiGridCellNavService
   *
   *  @description Services for cell navigation features. If you don't like the key maps we use,
   *  or the direction cells navigation, override with a service decorator (see angular docs)
   */
  module.service('uiGridCellNavService', ['gridUtil', 'uiGridConstants', 'uiGridCellNavConstants', '$q', 'uiGridCellNavFactory', 'ScrollEvent',
    function (gridUtil, uiGridConstants, uiGridCellNavConstants, $q, UiGridCellNav, ScrollEvent) {

      var service = {

        initializeGrid: function (grid) {
          grid.registerColumnBuilder(service.cellNavColumnBuilder);

          //create variables for state
          grid.cellNav = {};
          grid.cellNav.lastRowCol = null;
          grid.cellNav.focusedCells = [];

          service.defaultGridOptions(grid.options);

          /**
           *  @ngdoc object
           *  @name ui.grid.cellNav.api:PublicApi
           *
           *  @description Public Api for cellNav feature
           */
          var publicApi = {
            events: {
              cellNav: {
                /**
                 * @ngdoc event
                 * @name navigate
                 * @eventOf  ui.grid.cellNav.api:PublicApi
                 * @description raised when the active cell is changed
                 * <pre>
                 *      gridApi.cellNav.on.navigate(scope,function(newRowcol, oldRowCol){})
                 * </pre>
                 * @param {object} newRowCol new position
                 * @param {object} oldRowCol old position
                 */
                navigate: function (newRowCol, oldRowCol) {
                }
              }
            },
            methods: {
              cellNav: {
                /**
                 * @ngdoc function
                 * @name scrollTo
                 * @methodOf  ui.grid.cellNav.api:PublicApi
                 * @description brings the specified row and column into view
                 * @param {object} $scope a scope we can broadcast events from
                 * @param {object} rowEntity gridOptions.data[] array instance to make visible
                 * @param {object} colDef to make visible
                 */
                scrollTo: function ($scope, rowEntity, colDef) {
                  service.scrollTo(grid, $scope, rowEntity, colDef);
                },

                /**
                 * @ngdoc function
                 * @name scrollToFocus
                 * @methodOf  ui.grid.cellNav.api:PublicApi
                 * @description brings the specified row and column into view, and sets focus
                 * to that cell
                 * @param {object} $scope a scope we can broadcast events from
                 * @param {object} rowEntity gridOptions.data[] array instance to make visible and set focus
                 * @param {object} colDef to make visible and set focus
                 */
                scrollToFocus: function ($scope, rowEntity, colDef) {
                  service.scrollToFocus(grid, $scope, rowEntity, colDef);
                },

                /**
                 * @ngdoc function
                 * @name scrollToFocus
                 * @methodOf  ui.grid.cellNav.api:PublicApi
                 * @description brings the specified row and column fully into view if it isn't already
                 * @param {object} $scope a scope we can broadcast events from
                 * @param {GridRow} row grid row that we should make fully visible
                 * @param {GridCol} col grid col to make fully visible
                 */
                scrollToIfNecessary: function ($scope, row, col) {
                  service.scrollToIfNecessary(grid, $scope, row, col);
                },

                /**
                 * @ngdoc function
                 * @name getFocusedCell
                 * @methodOf  ui.grid.cellNav.api:PublicApi
                 * @description returns the current (or last if Grid does not have focus) focused row and column
                 * <br> value is null if no selection has occurred
                 */
                getFocusedCell: function () {
                  return grid.cellNav.lastRowCol;
                },

                /**
                 * @ngdoc function
                 * @name getCurrentSelection
                 * @methodOf  ui.grid.cellNav.api:PublicApi
                 * @description returns an array containing the current selection
                 * <br> array is empty if no selection has occurred
                 */
                getCurrentSelection: function () {
                  return grid.cellNav.focusedCells;
                },

                /**
                 * @ngdoc function
                 * @name rowColSelectIndex
                 * @methodOf  ui.grid.cellNav.api:PublicApi
                 * @description returns the index in the order in which the RowCol was selected, returns -1 if the RowCol
                 * isn't selected
                 * @param {object} rowCol the rowCol to evaluate
                 */
                rowColSelectIndex: function (rowCol) {
                  //return gridUtil.arrayContainsObjectWithProperty(grid.cellNav.focusedCells, 'col.uid', rowCol.col.uid) &&
                  var index = -1;
                  for (var i = 0; i < grid.cellNav.focusedCells.length; i++) {
                    if (grid.cellNav.focusedCells[i].col.uid === rowCol.col.uid &&
                      grid.cellNav.focusedCells[i].row.uid === rowCol.row.uid) {
                      index = i;
                      break;
                    }
                  }
                  return index;
                }
              }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);

          grid.api.registerMethodsFromObject(publicApi.methods);

        },

        defaultGridOptions: function (gridOptions) {
          /**
           *  @ngdoc object
           *  @name ui.grid.cellNav.api:GridOptions
           *
           *  @description GridOptions for cellNav feature, these are available to be
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           *  @ngdoc object
           *  @name modifierKeysToMultiSelectCells
           *  @propertyOf  ui.grid.cellNav.api:GridOptions
           *  @description Enable multiple cell selection only when using the ctrlKey or shiftKey.
           *  <br/>Defaults to false
           */
          gridOptions.modifierKeysToMultiSelectCells = gridOptions.modifierKeysToMultiSelectCells === true;

        },

        /**
         * @ngdoc service
         * @name decorateRenderContainers
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @description  decorates grid renderContainers with cellNav functions
         */
        decorateRenderContainers: function (grid) {

          var rightContainer = grid.hasRightContainer() ? grid.renderContainers.right : null;
          var leftContainer = grid.hasLeftContainer() ? grid.renderContainers.left : null;

          if (leftContainer !== null) {
            grid.renderContainers.left.cellNav = new UiGridCellNav(grid.renderContainers.body, leftContainer, rightContainer, grid.renderContainers.body);
          }
          if (rightContainer !== null) {
            grid.renderContainers.right.cellNav = new UiGridCellNav(grid.renderContainers.body, rightContainer, grid.renderContainers.body, leftContainer);
          }

          grid.renderContainers.body.cellNav = new UiGridCellNav(grid.renderContainers.body, grid.renderContainers.body, leftContainer, rightContainer);
        },

        /**
         * @ngdoc service
         * @name getDirection
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @description  determines which direction to for a given keyDown event
         * @returns {uiGridCellNavConstants.direction} direction
         */
        getDirection: function (evt) {
          if (evt.keyCode === uiGridConstants.keymap.LEFT ||
            (evt.keyCode === uiGridConstants.keymap.TAB && evt.shiftKey)) {
            return uiGridCellNavConstants.direction.LEFT;
          }
          if (evt.keyCode === uiGridConstants.keymap.RIGHT ||
            evt.keyCode === uiGridConstants.keymap.TAB) {
            return uiGridCellNavConstants.direction.RIGHT;
          }

          if (evt.keyCode === uiGridConstants.keymap.UP ||
            (evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey) ) {
            return uiGridCellNavConstants.direction.UP;
          }

          if (evt.keyCode === uiGridConstants.keymap.PG_UP){
            return uiGridCellNavConstants.direction.PG_UP;
          }

          if (evt.keyCode === uiGridConstants.keymap.DOWN ||
            evt.keyCode === uiGridConstants.keymap.ENTER) {
            return uiGridCellNavConstants.direction.DOWN;
          }

          if (evt.keyCode === uiGridConstants.keymap.PG_DOWN){
            return uiGridCellNavConstants.direction.PG_DOWN;
          }

          return null;
        },

        /**
         * @ngdoc service
         * @name cellNavColumnBuilder
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @description columnBuilder function that adds cell navigation properties to grid column
         * @returns {promise} promise that will load any needed templates when resolved
         */
        cellNavColumnBuilder: function (colDef, col, gridOptions) {
          var promises = [];

          /**
           *  @ngdoc object
           *  @name ui.grid.cellNav.api:ColumnDef
           *
           *  @description Column Definitions for cellNav feature, these are available to be
           *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
           */

          /**
           *  @ngdoc object
           *  @name allowCellFocus
           *  @propertyOf  ui.grid.cellNav.api:ColumnDef
           *  @description Enable focus on a cell within this column.
           *  <br/>Defaults to true
           */
          colDef.allowCellFocus = colDef.allowCellFocus === undefined ? true : colDef.allowCellFocus;

          return $q.all(promises);
        },

        /**
         * @ngdoc method
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @name scrollTo
         * @description Scroll the grid such that the specified
         * row and column is in view
         * @param {Grid} grid the grid you'd like to act upon, usually available
         * from gridApi.grid
         * @param {object} $scope a scope we can broadcast events from
         * @param {object} rowEntity gridOptions.data[] array instance to make visible
         * @param {object} colDef to make visible
         */
        scrollTo: function (grid, $scope, rowEntity, colDef) {
          var gridRow = null, gridCol = null;

          if (rowEntity !== null && typeof(rowEntity) !== 'undefined' ) {
            gridRow = grid.getRow(rowEntity);
          }

          if (colDef !== null && typeof(colDef) !== 'undefined' ) {
            gridCol = grid.getColumn(colDef.name ? colDef.name : colDef.field);
          }
          this.scrollToInternal(grid, $scope, gridRow, gridCol);
        },

        /**
         * @ngdoc method
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @name scrollToFocus
         * @description Scroll the grid such that the specified
         * row and column is in view, and set focus to the cell in that row and column
         * @param {Grid} grid the grid you'd like to act upon, usually available
         * from gridApi.grid
         * @param {object} $scope a scope we can broadcast events from
         * @param {object} rowEntity gridOptions.data[] array instance to make visible and set focus to
         * @param {object} colDef to make visible and set focus to
         */
        scrollToFocus: function (grid, $scope, rowEntity, colDef) {
          var gridRow = null, gridCol = null;

          if (rowEntity !== null) {
            gridRow = grid.getRow(rowEntity);
          }

          if (colDef !== null) {
            gridCol = grid.getColumn(colDef.name ? colDef.name : colDef.field);
          }
          this.scrollToInternal(grid, $scope, gridRow, gridCol);

          var rowCol = { row: gridRow, col: gridCol };

          // Broadcast the navigation
          grid.cellNav.broadcastCellNav(rowCol);

        },

        /**
         * @ngdoc method
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @name scrollToInternal
         * @description Like scrollTo, but takes gridRow and gridCol.
         * In calculating the scroll height we have to deal with wanting
         * 0% for the first row, and 100% for the last row.  Normal maths
         * for a 10 row list would return 1/10 = 10% for the first row, so
         * we need to tweak the numbers to add an extra 10% somewhere.  The
         * formula if we're trying to get to row 0 in a 10 row list (assuming our
         * index is zero based, so the last row is row 9) is:
         * <pre>
         *   0 + 0 / 10 = 0%
         * </pre>
         *
         * To get to row 9 (i.e. the last row) in the same list, we want to
         * go to:
         * <pre>
         *  ( 9 + 1 ) / 10 = 100%
         * </pre>
         * So we need to apportion one whole row within the overall grid scroll,
         * the formula is:
         * <pre>
         *   ( index + ( index / (total rows - 1) ) / total rows
         * </pre>
         * @param {Grid} grid the grid you'd like to act upon, usually available
         * from gridApi.grid
         * @param {object} $scope a scope we can broadcast events from
         * @param {GridRow} gridRow row to make visible
         * @param {GridCol} gridCol column to make visible
         */
        scrollToInternal: function (grid, $scope, gridRow, gridCol) {
          var scrollEvent = new ScrollEvent(grid,null,null,'uiGridCellNavService.scrollToInternal');

          if (gridRow !== null) {
            var seekRowIndex = grid.renderContainers.body.visibleRowCache.indexOf(gridRow);
            var totalRows = grid.renderContainers.body.visibleRowCache.length;
            var percentage = ( seekRowIndex + ( seekRowIndex / ( totalRows - 1 ) ) ) / totalRows;
            scrollEvent.y = { percentage:  percentage  };
          }

          if (gridCol !== null) {
            scrollEvent.x = { percentage: this.getLeftWidth(grid, gridCol) / this.getLeftWidth(grid, grid.renderContainers.body.visibleColumnCache[grid.renderContainers.body.visibleColumnCache.length - 1] ) };
          }

          if (scrollEvent.y || scrollEvent.x) {
            scrollEvent.fireScrollingEvent();
          }
        },

        /**
         * @ngdoc method
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @name scrollToIfNecessary
         * @description Scrolls the grid to make a certain row and column combo visible,
         *   in the case that it is not completely visible on the screen already.
         * @param {Grid} grid the grid you'd like to act upon, usually available
         * from gridApi.grid
         * @param {object} $scope a scope we can broadcast events from
         * @param {GridRow} gridRow row to make visible
         * @param {GridCol} gridCol column to make visible
         */
        scrollToIfNecessary: function (grid, $scope, gridRow, gridCol) {
          var scrollEvent = new ScrollEvent(grid,null,null,'uiGridCellNavService.scrollToIfNecessary');

          // Alias the visible row and column caches
          var visRowCache = grid.renderContainers.body.visibleRowCache;
          var visColCache = grid.renderContainers.body.visibleColumnCache;

          /*-- Get the top, left, right, and bottom "scrolled" edges of the grid --*/

          // The top boundary is the current Y scroll position PLUS the header height, because the header can obscure rows when the grid is scrolled downwards
          var topBound = grid.renderContainers.body.prevScrollTop + grid.headerHeight;

          // Don't the let top boundary be less than 0
          topBound = (topBound < 0) ? 0 : topBound;

          // The left boundary is the current X scroll position
          var leftBound = grid.renderContainers.body.prevScrollLeft;

          // The bottom boundary is the current Y scroll position, plus the height of the grid, but minus the header height.
          //   Basically this is the viewport height added on to the scroll position
          var bottomBound = grid.renderContainers.body.prevScrollTop + grid.gridHeight - grid.headerHeight;

          // If there's a horizontal scrollbar, remove its height from the bottom boundary, otherwise we'll be letting it obscure rows
          //if (grid.horizontalScrollbarHeight) {
          //  bottomBound = bottomBound - grid.horizontalScrollbarHeight;
          //}

          // The right position is the current X scroll position minus the grid width
          var rightBound = grid.renderContainers.body.prevScrollLeft + grid.gridWidth;

          // If there's a vertical scrollbar, subtract it from the right boundary or we'll allow it to obscure cells
          //if (grid.verticalScrollbarWidth) {
          //  rightBound = rightBound - grid.verticalScrollbarWidth;
          //}

          // We were given a row to scroll to
          if (gridRow !== null) {
            // This is the index of the row we want to scroll to, within the list of rows that can be visible
            var seekRowIndex = visRowCache.indexOf(gridRow);

            // Total vertical scroll length of the grid
            var scrollLength = (grid.renderContainers.body.getCanvasHeight() - grid.renderContainers.body.getViewportHeight());

            // Add the height of the native horizontal scrollbar to the scroll length, if it's there. Otherwise it will mask over the final row
            //if (grid.horizontalScrollbarHeight && grid.horizontalScrollbarHeight > 0) {
            //  scrollLength = scrollLength + grid.horizontalScrollbarHeight;
            //}

            // This is the minimum amount of pixels we need to scroll vertical in order to see this row.
            var pixelsToSeeRow = ((seekRowIndex + 1) * grid.options.rowHeight);

            // Don't let the pixels required to see the row be less than zero
            pixelsToSeeRow = (pixelsToSeeRow < 0) ? 0 : pixelsToSeeRow;

            var scrollPixels, percentage;

            // If the scroll position we need to see the row is LESS than the top boundary, i.e. obscured above the top of the grid...
            if (pixelsToSeeRow < topBound) {
              // Get the different between the top boundary and the required scroll position and subtract it from the current scroll position\
              //   to get the full position we need
              scrollPixels = grid.renderContainers.body.prevScrollTop - (topBound - pixelsToSeeRow);

              // Turn the scroll position into a percentage and make it an argument for a scroll event
              percentage = scrollPixels / scrollLength;
              scrollEvent.y = { percentage: percentage  };
            }
            // Otherwise if the scroll position we need to see the row is MORE than the bottom boundary, i.e. obscured below the bottom of the grid...
            else if (pixelsToSeeRow > bottomBound) {
              // Get the different between the bottom boundary and the required scroll position and add it to the current scroll position
              //   to get the full position we need
              scrollPixels = pixelsToSeeRow - bottomBound + grid.renderContainers.body.prevScrollTop;

              // Turn the scroll position into a percentage and make it an argument for a scroll event
              percentage = scrollPixels / scrollLength;
              scrollEvent.y = { percentage: percentage  };
            }
          }

          // We were given a column to scroll to
          if (gridCol !== null) {
            // This is the index of the row we want to scroll to, within the list of rows that can be visible
            var seekColumnIndex = visColCache.indexOf(gridCol);

            // Total vertical scroll length of the grid
            var horizScrollLength = (grid.renderContainers.body.getCanvasWidth() - grid.renderContainers.body.getViewportWidth());

            // Add the height of the native horizontal scrollbar to the scroll length, if it's there. Otherwise it will mask over the final row
            // if (grid.verticalScrollbarWidth && grid.verticalScrollbarWidth > 0) {
            //   horizScrollLength = horizScrollLength + grid.verticalScrollbarWidth;
            // }

            // This is the minimum amount of pixels we need to scroll vertical in order to see this column
            var columnLeftEdge = 0;
            for (var i = 0; i < seekColumnIndex; i++) {
              var col = visColCache[i];
              columnLeftEdge += col.drawnWidth;
            }
            columnLeftEdge = (columnLeftEdge < 0) ? 0 : columnLeftEdge;

            var columnRightEdge = columnLeftEdge + gridCol.drawnWidth;

            // Don't let the pixels required to see the column be less than zero
            columnRightEdge = (columnRightEdge < 0) ? 0 : columnRightEdge;

            var horizScrollPixels, horizPercentage;

            // If the scroll position we need to see the row is LESS than the top boundary, i.e. obscured above the top of the grid...
            if (columnLeftEdge < leftBound) {
              // Get the different between the top boundary and the required scroll position and subtract it from the current scroll position\
              //   to get the full position we need
              horizScrollPixels = grid.renderContainers.body.prevScrollLeft - (leftBound - columnLeftEdge);

              // Turn the scroll position into a percentage and make it an argument for a scroll event
              horizPercentage = horizScrollPixels / horizScrollLength;
              horizPercentage = (horizPercentage > 1) ? 1 : horizPercentage;
              scrollEvent.x = { percentage: horizPercentage  };
            }
            // Otherwise if the scroll position we need to see the row is MORE than the bottom boundary, i.e. obscured below the bottom of the grid...
            else if (columnRightEdge > rightBound) {
              // Get the different between the bottom boundary and the required scroll position and add it to the current scroll position
              //   to get the full position we need
              horizScrollPixels = columnRightEdge - rightBound + grid.renderContainers.body.prevScrollLeft;

              // Turn the scroll position into a percentage and make it an argument for a scroll event
              horizPercentage = horizScrollPixels / horizScrollLength;
              horizPercentage = (horizPercentage > 1) ? 1 : horizPercentage;
              scrollEvent.x = { percentage: horizPercentage  };
            }
          }

          // If we need to scroll on either the x or y axes, fire a scroll event
          if (scrollEvent.y || scrollEvent.x) {
            scrollEvent.fireScrollingEvent();
          }
        },

        /**
         * @ngdoc method
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @name getLeftWidth
         * @description Get the current drawn width of the columns in the
         * grid up to the numbered column, and add an apportionment for the
         * column that we're on.  So if we are on column 0, we want to scroll
         * 0% (i.e. exclude this column from calc).  If we're on the last column
         * we want to scroll to 100% (i.e. include this column in the calc). So
         * we include (thisColIndex / totalNumberCols) % of this column width
         * @param {Grid} grid the grid you'd like to act upon, usually available
         * from gridApi.grid
         * @param {gridCol} upToCol the column to total up to and including
         */
        getLeftWidth: function (grid, upToCol) {
          var width = 0;

          if (!upToCol) {
            return width;
          }

          var lastIndex = grid.renderContainers.body.visibleColumnCache.indexOf( upToCol );

          // total column widths up-to but not including the passed in column
          grid.renderContainers.body.visibleColumnCache.forEach( function( col, index ) {
            if ( index < lastIndex ){
              width += col.drawnWidth;
            }
          });

          // pro-rata the final column based on % of total columns.
          var percentage = lastIndex === 0 ? 0 : (lastIndex + 1) / grid.renderContainers.body.visibleColumnCache.length;
          width += upToCol.drawnWidth * percentage;

          return width;
        }
      };

      return service;
    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.cellNav.directive:uiCellNav
   *  @element div
   *  @restrict EA
   *
   *  @description Adds cell navigation features to the grid columns
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.cellNav']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
      ];

      $scope.columnDefs = [
        {name: 'name'},
        {name: 'title'}
      ];
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="{ data: data, columnDefs: columnDefs }" ui-grid-cellnav></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridCellnav', ['gridUtil', 'uiGridCellNavService', 'uiGridCellNavConstants',
    function (gridUtil, uiGridCellNavService, uiGridCellNavConstants) {
      return {
        replace: true,
        priority: -150,
        require: '^uiGrid',
        scope: false,
        controller: function () {},
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              var _scope = $scope;

              var grid = uiGridCtrl.grid;
              uiGridCellNavService.initializeGrid(grid);

              uiGridCtrl.cellNav = {};

              uiGridCtrl.cellNav.focusCell = function (row, col) {
                uiGridCtrl.cellNav.broadcastCellNav({ row: row, col: col });
              };

              //  gridUtil.logDebug('uiGridEdit preLink');
              uiGridCtrl.cellNav.broadcastCellNav = grid.cellNav.broadcastCellNav = function (newRowCol, modifierDown) {
                modifierDown = !(modifierDown === undefined || !modifierDown);
                uiGridCtrl.cellNav.broadcastFocus(newRowCol, modifierDown);
                _scope.$broadcast(uiGridCellNavConstants.CELL_NAV_EVENT, newRowCol, modifierDown);
              };

              uiGridCtrl.cellNav.broadcastFocus = function (rowCol, modifierDown) {
                modifierDown = !(modifierDown === undefined || !modifierDown);

                var row = rowCol.row,
                  col = rowCol.col;

                var rowColSelectIndex = uiGridCtrl.grid.api.cellNav.rowColSelectIndex(rowCol);

                if (grid.cellNav.lastRowCol === null || rowColSelectIndex === -1) {
                  var newRowCol = new RowCol(row, col);
                  grid.api.cellNav.raise.navigate(newRowCol, grid.cellNav.lastRowCol);
                  grid.cellNav.lastRowCol = newRowCol;
                  if (uiGridCtrl.grid.options.modifierKeysToMultiSelectCells && modifierDown) {
                    grid.cellNav.focusedCells.push(rowCol);
                  } else {
                    grid.cellNav.focusedCells = [rowCol];
                  }
                } else if (grid.options.modifierKeysToMultiSelectCells && modifierDown &&
                  rowColSelectIndex >= 0) {

                  grid.cellNav.focusedCells.splice(rowColSelectIndex, 1);
                }
              };

              uiGridCtrl.cellNav.handleKeyDown = function (evt) {
                var direction = uiGridCellNavService.getDirection(evt);
                if (direction === null) {
                  return true;
                }

                var containerId = 'body';
                if (evt.uiGridTargetRenderContainerId) {
                  containerId = evt.uiGridTargetRenderContainerId;
                }

                // Get the last-focused row+col combo
                var lastRowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
                if (lastRowCol) {
                  // Figure out which new row+combo we're navigating to
                  var rowCol = uiGridCtrl.grid.renderContainers[containerId].cellNav.getNextRowCol(direction, lastRowCol.row, lastRowCol.col);

                  rowCol.eventType = uiGridCellNavConstants.EVENT_TYPE.KEYDOWN;

                  // Broadcast the navigation
                  uiGridCtrl.cellNav.broadcastCellNav(rowCol);

                  // Scroll to the new cell, if it's not completely visible within the render container's viewport
                  uiGridCellNavService.scrollToIfNecessary(grid, $scope, rowCol.row, rowCol.col);

                  evt.stopPropagation();
                  evt.preventDefault();

                  return false;
                }
              };
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }]);

  module.directive('uiGridRenderContainer', ['$timeout', '$document', 'gridUtil', 'uiGridConstants', 'uiGridCellNavService', 'uiGridCellNavConstants',
    function ($timeout, $document, gridUtil, uiGridConstants, uiGridCellNavService, uiGridCellNavConstants) {
      return {
        replace: true,
        priority: -99999, //this needs to run very last
        require: ['^uiGrid', 'uiGridRenderContainer', '?^uiGridCellnav'],
        scope: false,
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, controllers) {
              var uiGridCtrl = controllers[0],
                 renderContainerCtrl = controllers[1];

              // Skip attaching cell-nav specific logic if the directive is not attached above us
              if (!uiGridCtrl.grid.api.cellNav) { return; }

              var containerId = renderContainerCtrl.containerId;

              var grid = uiGridCtrl.grid;

              // Needs to run last after all renderContainers are built
              uiGridCellNavService.decorateRenderContainers(grid);

              // Let the render container be focus-able
              $elm.attr("tabindex", -1);

              // Bind to keydown events in the render container
              $elm.on('keydown', function (evt) {
                evt.uiGridTargetRenderContainerId = containerId;
                return uiGridCtrl.cellNav.handleKeyDown(evt);
              });

              var needFocus = false;
              
              // When there's a scroll event we need to make sure to re-focus the right row, because the cell contents may have changed
              grid.api.core.on.scrollEvent($scope, function (args) {
                // Skip if not this grid that the event was broadcast for
                if (args.grid && args.grid.id !== uiGridCtrl.grid.id) {
                  return;
                }

                // Skip if there's no currently-focused cell
                if (uiGridCtrl.grid.api.cellNav.getFocusedCell() == null) {
                  return;
                }
                
                /*
                 * If we have scrolled due to cellNav, we want to set the focus to the new cell after the 
                 * virtualisation has run, and after scroll.  If we scrolled through the browser scroll
                 * bar or other user action, we're going to discard the focus, because it will no longer 
                 * be valid (and, noting #2423, trying to keep it causes problems)
                 * 
                 * If cellNav triggers the scroll, we get a scrollToIfNecessary, then a viewport scroll. We
                 * want to wait for the viewport scroll to finish, then do a refocus.  
                 * 
                 * If someone manually scrolls we get just the viewport scroll, no scrollToIfNecessary.  We
                 * want to just clear the focus
                 * 
                 * Logic is:
                 *  - if cellNav scroll, set a flag that will be resolved in the native scroll
                 *  - if native scroll, look for the cellNav promise and resolve it
                 *    - if not present, then use a timeout to clear focus
                 *    - if it is present, then instead use a timeout to set focus
                 */ 
                
                // We have to wrap in TWO timeouts so that we run AFTER the scroll event is resolved.
                if ( args.source === 'uiGridCellNavService.scrollToIfNecessary'){
                  needFocus = true;
/*
                  focusTimeout = $timeout(function () {
                    if ( clearFocusTimeout ){
                      $timeout.cancel(clearFocusTimeout);
                    }
                    focusTimeout = $timeout(function () {
                      if ( clearFocusTimeout ){
                        $timeout.cancel(clearFocusTimeout);
                      }
                      // Get the last row+col combo
                      var lastRowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
  
                      // If the body element becomes active, re-focus on the render container so we can capture cellNav events again.
                      //   NOTE: this happens when we navigate LET from the left-most cell (RIGHT from the right-most) and have to re-render a new
                      //   set of cells. The cell element we are navigating to doesn't exist and focus gets lost. This will re-capture it, imperfectly...
                      if ($document.activeElement === $document.body) {
                        $elm[0].focus();
                      }
  
                      // broadcast a cellNav event so we clear the focus on all cells
                      uiGridCtrl.cellNav.broadcastCellNav(lastRowCol);
                    });
                  });
                  */
                } else {
                  if ( needFocus ){
                    $timeout(function () {
                      $timeout(function () {
                        // Get the last row+col combo
                        var lastRowCol = uiGridCtrl.grid.api.cellNav.getFocusedCell();
    
                        // If the body element becomes active, re-focus on the render container so we can capture cellNav events again.
                        //   NOTE: this happens when we navigate LET from the left-most cell (RIGHT from the right-most) and have to re-render a new
                        //   set of cells. The cell element we are navigating to doesn't exist and focus gets lost. This will re-capture it, imperfectly...
                        if ($document.activeElement === $document.body) {
                          $elm[0].focus();
                        }
    
                        // broadcast a cellNav event so we clear the focus on all cells
                        uiGridCtrl.cellNav.broadcastCellNav(lastRowCol);
                        
                        needFocus = false;
                      });
                    });
                  } else {
                    $timeout(function() {
                      // make a dummy roCol
                      var rowCol = { col: { uid: null }, row: { uid: null } };
    
                      // broadcast a cellNav event so we clear the focus on all cells
                      uiGridCtrl.cellNav.broadcastCellNav(rowCol);
                    });
                  }
                }
              });  
             
            }
          };
        }
      };
    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.cellNav.directive:uiGridCell
   *  @element div
   *  @restrict A
   *  @description Stacks on top of ui.grid.uiGridCell to provide cell navigation
   */
  module.directive('uiGridCell', ['$timeout', '$document', 'uiGridCellNavService', 'gridUtil', 'uiGridCellNavConstants', 'uiGridConstants',
    function ($timeout, $document, uiGridCellNavService, gridUtil, uiGridCellNavConstants, uiGridConstants) {
      return {
        priority: -150, // run after default uiGridCell directive and ui.grid.edit uiGridCell
        restrict: 'A',
        require: '^uiGrid',
        scope: false,
        link: function ($scope, $elm, $attrs, uiGridCtrl) {
          // Skip attaching cell-nav specific logic if the directive is not attached above us
          if (!uiGridCtrl.grid.api.cellNav) { return; }

          if (!$scope.col.colDef.allowCellFocus) {
            return;
          }

          setTabEnabled();

          // When a cell is clicked, broadcast a cellNav event saying that this row+col combo is now focused
          $elm.find('div').on('click', function (evt) {
            uiGridCtrl.cellNav.broadcastCellNav(new RowCol($scope.row, $scope.col), evt.ctrlKey || evt.metaKey);

            evt.stopPropagation();
          });

          // This event is fired for all cells.  If the cell matches, then focus is set
          $scope.$on(uiGridCellNavConstants.CELL_NAV_EVENT, function (evt, rowCol, modifierDown) {
            if (rowCol.row === $scope.row &&
              rowCol.col === $scope.col) {
              if (uiGridCtrl.grid.options.modifierKeysToMultiSelectCells && modifierDown &&
                uiGridCtrl.grid.api.cellNav.rowColSelectIndex(rowCol) === -1) {
                clearFocus();
              } else {
                setFocused();
              }

              // This cellNav event came from a keydown event so we can safely refocus
              if (rowCol.hasOwnProperty('eventType') && rowCol.eventType === uiGridCellNavConstants.EVENT_TYPE.KEYDOWN) {
                $elm.find('div')[0].focus();
              }
            }
            else if (!(uiGridCtrl.grid.options.modifierKeysToMultiSelectCells && modifierDown)) {
              clearFocus();
            }
          });

          function setTabEnabled() {
            $elm.find('div').attr("tabindex", -1);
          }

          function setFocused() {
            var div = $elm.find('div');
            div.addClass('ui-grid-cell-focus');
          }

          function clearFocus() {
            var div = $elm.find('div');
            div.removeClass('ui-grid-cell-focus');
          }

          $scope.$on('$destroy', function () {
            $elm.find('div').off('click');
          });
        }
      };
    }]);

})();
