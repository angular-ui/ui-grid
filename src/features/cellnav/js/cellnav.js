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
    direction: {LEFT: 0, RIGHT: 1, UP: 2, DOWN: 3}
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
      };

      /** returns focusable columns of all containers */
      UiGridCellNav.prototype.getFocusableCols = function () {
        var allColumns = this.leftColumns.concat(this.columns, this.rightColumns);

        return allColumns.filter(function (col) {
          return col.colDef.allowCellFocus;
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
        }

      };

      UiGridCellNav.prototype.getRowColLeft = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = this.rows.indexOf(curRow);

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
            return new RowCol(this.rows[curRowIndex - 1], focusableCols[nextColIndex]);
          }
        }
        else {
          return new RowCol(curRow, focusableCols[nextColIndex]);
        }
      };

      UiGridCellNav.prototype.getRowColRight = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = this.rows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }
        var nextColIndex = curColIndex === focusableCols.length - 1 ? 0 : curColIndex + 1;

        if (nextColIndex < curColIndex) {
          if (curRowIndex === this.rows.length - 1) {
            return new RowCol(curRow, focusableCols[nextColIndex]); //return same row
          }
          else {
            //down one row and far left column
            return new RowCol(this.rows[curRowIndex + 1], focusableCols[nextColIndex]);
          }
        }
        else {
          return new RowCol(curRow, focusableCols[nextColIndex]);
        }
      };

      UiGridCellNav.prototype.getRowColDown = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = this.rows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }

        if (curRowIndex === this.rows.length - 1) {
          return new RowCol(curRow, focusableCols[curColIndex]); //return same row
        }
        else {
          //down one row
          return new RowCol(this.rows[curRowIndex + 1], focusableCols[curColIndex]);
        }
      };

      UiGridCellNav.prototype.getRowColUp = function (curRow, curCol) {
        var focusableCols = this.getFocusableCols();
        var curColIndex = focusableCols.indexOf(curCol);
        var curRowIndex = this.rows.indexOf(curRow);

        //could not find column in focusable Columns so set it to 0
        if (curColIndex === -1) {
          curColIndex = 0;
        }

        if (curRowIndex === 0) {
          return new RowCol(curRow, focusableCols[curColIndex]); //return same row
        }
        else {
          //up one row
          return new RowCol(this.rows[curRowIndex - 1], focusableCols[curColIndex]);
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
  module.service('uiGridCellNavService', ['gridUtil', 'uiGridConstants', 'uiGridCellNavConstants', '$q', 'uiGridCellNavFactory',
    function (gridUtil, uiGridConstants, uiGridCellNavConstants, $q, UiGridCellNav) {

      var service = {

        initializeGrid: function (grid) {
          grid.registerColumnBuilder(service.cellNavColumnBuilder);

          //create variables for state
          grid.cellNav = {};
          grid.cellNav.lastRowCol = null;

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
                 * @param {Grid} grid the grid you'd like to act upon, usually available
                 * from gridApi.grid
                 * @param {object} $scope a scope we can broadcast events from
                 * @param {object} rowEntity gridOptions.data[] array instance to make visible
                 * @param {object} colDef to make visible
                 */
                scrollTo: function (grid, $scope, rowEntity, colDef) {
                  service.scrollTo(grid, $scope, rowEntity, colDef);
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
                }
              }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);

          grid.api.registerMethodsFromObject(publicApi.methods);

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
            (evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey)) {
            return uiGridCellNavConstants.direction.UP;
          }

          if (evt.keyCode === uiGridConstants.keymap.DOWN ||
            evt.keyCode === uiGridConstants.keymap.ENTER) {
            return uiGridCellNavConstants.direction.DOWN;
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
           *  @description Enable focus on a cell.
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

          if (rowEntity !== null) {
            gridRow = grid.getRow(rowEntity);
          }

          if (colDef !== null) {
            gridCol = grid.getColumn(colDef.name ? colDef.name : colDef.field);
          }
          this.scrollToInternal(grid, $scope, gridRow, gridCol);
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
          var args = {};

          if (gridRow !== null) {
            var seekRowIndex = grid.renderContainers.body.visibleRowCache.indexOf(gridRow);
            var totalRows = grid.renderContainers.body.visibleRowCache.length;
            var percentage = ( seekRowIndex + ( seekRowIndex / ( totalRows - 1 ) ) ) / totalRows;
            args.y = { percentage:  percentage  };
          }

          if (gridCol !== null) {
            args.x = { percentage: this.getLeftWidth(grid, gridCol) / this.getLeftWidth(grid, grid.renderContainers.body.visibleColumnCache[grid.renderContainers.body.visibleColumnCache.length - 1] ) };
          }

          if (args.y || args.x) {
            $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);
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
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {

              var grid = uiGridCtrl.grid;
              uiGridCellNavService.initializeGrid(grid);

              uiGridCtrl.cellNav = {};

              //  gridUtil.logDebug('uiGridEdit preLink');
              uiGridCtrl.cellNav.broadcastCellNav = function (newRowCol) {
                $scope.$broadcast(uiGridCellNavConstants.CELL_NAV_EVENT, newRowCol);
                uiGridCtrl.cellNav.broadcastFocus(newRowCol.row, newRowCol.col);
              };

              uiGridCtrl.cellNav.broadcastFocus = function (row, col) {
                if (grid.cellNav.lastRowCol === null || (grid.cellNav.lastRowCol.row !== row || grid.cellNav.lastRowCol.col !== col)) {
                  var newRowCol = new RowCol(row, col);
                  grid.api.cellNav.raise.navigate(newRowCol, grid.cellNav.lastRowCol);
                  grid.cellNav.lastRowCol = newRowCol;
                }
              };

            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }]);

  module.directive('uiGridRenderContainer', ['gridUtil', 'uiGridCellNavService', 'uiGridCellNavConstants',
    function (gridUtil, uiGridCellNavService, uiGridCellNavConstants) {
      return {
        replace: true,
        priority: -99999, //this needs to run very last
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              var grid = uiGridCtrl.grid;
              //needs to run last after all renderContainers are built
              uiGridCellNavService.decorateRenderContainers(grid);
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
  module.directive('uiGridCell', ['uiGridCellNavService', 'gridUtil', 'uiGridCellNavConstants',
    function (uiGridCellNavService, gridUtil, uiGridCellNavConstants) {
      return {
        priority: -150, // run after default uiGridCell directive and ui.grid.edit uiGridCell
        restrict: 'A',
        require: '^uiGrid',
        scope: false,
        link: function ($scope, $elm, $attrs, uiGridCtrl) {
          if (!$scope.col.colDef.allowCellFocus) {
            return;
          }

          setTabEnabled();

          $elm.on('keydown', function (evt) {
            var direction = uiGridCellNavService.getDirection(evt);
            if (direction === null) {
              return true;
            }

            var rowCol = $scope.colContainer.cellNav.getNextRowCol(direction, $scope.row, $scope.col);

            uiGridCtrl.cellNav.broadcastCellNav(rowCol);
            setTabEnabled();

            evt.stopPropagation();
            evt.preventDefault();

            return false;
          });

          $elm.find('div').on('focus', function (evt) {
            uiGridCtrl.cellNav.broadcastFocus($scope.row, $scope.col);
          });

          //this event is fired for all cells.  If the cell matches, then focus is set
          $scope.$on(uiGridCellNavConstants.CELL_NAV_EVENT, function (evt, rowCol) {
            if (rowCol.row === $scope.row &&
              rowCol.col === $scope.col) {
              setFocused();
            }
          });

          function setTabEnabled() {
            $elm.find('div').attr("tabindex", -1);
          }

          function setFocused() {
            var div = $elm.find('div');
            // gridUtil.logDebug('setFocused: ' + div[0].parentElement.className);
            div[0].focus();
            div.attr("tabindex", 0);
            $scope.grid.queueRefresh();
          }

        }
      };
    }]);

})();