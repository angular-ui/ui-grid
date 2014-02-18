(function () {
  'use strict';
  /**
   *  @ngdoc object
   *  @name ui.grid.service:gridClassFactory
   *
   *  @description factory to return dom specific instances of a grid
   *
   */
  angular.module('ui.grid').service('gridClassFactory', ['gridUtil', '$q', '$templateCache', 'uiGridConstants', '$log', 'GridColumn',
    function (gridUtil, $q, $templateCache, uiGridConstants, $log, GridColumn) {

      var service = {
        /**
         * @ngdoc method
         * @name createGrid
         * @methodOf ui.grid.service:gridClassFactory
         * @description Creates a new grid instance. Each instance will have a unique id
         * @returns {Grid} grid
         */
        createGrid : function() {
          var grid = new Grid(gridUtil.newId());
          grid.registerColumnBuilder(service.defaultColumnBuilder);
          return grid;
        },

        /**
         * @ngdoc function
         * @name defaultColumnBuilder
         * @methodOf ui.grid.service:gridClassFactory
         * @description Processes designTime column definitions and applies them to col for the
         *              core grid features
         * @param {object} colDef reference to column definition
         * @param {GridColumn} col reference to gridCol
         * @param {object} gridOptions reference to grid options
         */
        defaultColumnBuilder: function (colDef, col, gridOptions) {

          var templateGetPromises = [];

          col.headerCellTemplate = colDef.headerCellTemplate || $templateCache.get('ui-grid/uiGridHeaderCell');

          col.cellTemplate = colDef.cellTemplate ||
            $templateCache.get('ui-grid/uiGridCell')
              .replace(uiGridConstants.CUSTOM_FILTERS, col.cellFilter ? "|" + col.cellFilter : "");

          if (colDef.cellTemplate && !uiGridConstants.TEMPLATE_REGEXP.test(colDef.cellTemplate)) {
            templateGetPromises.push(
              gridUtil.getTemplate(colDef.cellTemplate)
                .then(function (contents) {
                  col.cellTemplate = contents;
                })
            );
          }

          if (colDef.headerCellTemplate && !uiGridConstants.TEMPLATE_REGEXP.test(colDef.headerCellTemplate)) {
            templateGetPromises.push(
              gridUtil.getTemplate(colDef.headerCellTemplate)
                .then(function (contents) {
                  col.headerCellTemplate = contents;
                })
            );
          }

          return $q.all(templateGetPromises);
        }

      };

      //class definitions


      /**
       * @ngdoc function
       * @name ui.grid.class:Grid
       * @description Grid defines a logical grid.  Any non-dom properties and elements needed by the grid should
       *              be defined in this class
       * @param {string} id id to assign to grid
       */
      var Grid = function (id) {
        this.id = id;
        this.options = new GridOptions();
        this.headerHeight = this.options.headerRowHeight;
        this.gridHeight = 0;
        this.gridWidth = 0;
        this.columnBuilders = [];
        this.rowBuilders = [];
        this.styleComputations = [];


        //representation of the rows on the grid.
        //these are wrapped references to the actual data rows (options.data)
        this.rows = [];

        //represents the columns on the grid
        this.columns = [];

        //current rows that are rendered on the DOM
        this.renderedRows = [];
        this.renderedColumns = [];
      };

      /**
       * @ngdoc function
       * @name registerColumnBuilder
       * @methodOf ui.grid.class:Grid
       * @description When the build creates columns from column definitions, the columnbuilders will be called to add
       * additional properties to the column.
       * @param {function(colDef, col, gridOptions)} columnsProcessor function to be called
       */
      Grid.prototype.registerColumnBuilder = function (columnsProcessor) {
        this.columnBuilders.push(columnsProcessor);
      };

      /**
       * @ngdoc function
       * @name registerRowBuilder
       * @methodOf ui.grid.class:Grid
       * @description When the build creates rows from gridOptions.data, the rowBuilders will be called to add
       * additional properties to the row.
       * @param {function(colDef, col, gridOptions)} columnsProcessor function to be called
       */
      Grid.prototype.registerRowBuilder = function (rowBuilder) {
        this.rowBuilders.push(rowBuilder);
      };

      /**
       * @ngdoc function
       * @name getColumn
       * @methodOf ui.grid.class:Grid
       * @description returns a grid column for the column name
       * @param {string} name column name
       */
      Grid.prototype.getColumn = function (name) {
        var columns = this.columns.filter(function (column) {
          return column.colDef.name === name;
        });
        return columns.length > 0 ? columns[0] : null;
      };

      /**
       * @ngdoc function
       * @name buildColumns
       * @methodOf ui.grid.class:Grid
       * @description creates GridColumn objects from the columnDefinition.  Calls each registered
       * columnBuilder to further process the column
       * @returns {Promise} a promise to load any needed column resources
       */
      Grid.prototype.buildColumns = function () {
        $log.debug('buildColumns');
        var self = this;
        var builderPromises = [];

        self.options.columnDefs.forEach(function (colDef, index) {
          self.preprocessColDef(colDef);
          var col = self.getColumn(colDef.name);

          if (!col) {
            col = new GridColumn(colDef, index);
            self.columns.push(col);
          }
          else {
            col.updateColumnDef(colDef, col.index);
          }

          self.columnBuilders.forEach(function (builder) {
            builderPromises.push(builder.call(self, colDef, col, self.options));
          });

        });

        return $q.all(builderPromises);
      };

      /**
       * undocumented function
       * @name preprocessColDef
       * @methodOf ui.grid.class:Grid
       * @description defaults the name property from field to maintain backwards compatibility with 2.x
       * validates that name or field is present
       */
      Grid.prototype.preprocessColDef = function (colDef) {
        if (!colDef.field && !colDef.name) {
          throw new Error('colDef.name or colDef.field property is required');
        }

        //maintain backwards compatibility with 2.x
        //field was required in 2.x.  now name is required
        if (colDef.name === undefined && colDef.field !== undefined) {
          colDef.name = colDef.field;
        }
      };

      /**
       * @ngdoc function
       * @name modifyRows
       * @methodOf ui.grid.class:Grid
       * @description creates or removes GridRow objects from the newRawData array.  Calls each registered
       * rowBuilder to further process the row
       *
       * Rows are identified using the gridOptions.rowEquality function
       */
      Grid.prototype.modifyRows = function(newRawData) {
        var self = this;

        if (self.rows.length === 0 && newRawData.length > 0) {
          self.addRows(newRawData);
          return;
        }

        //look for new rows
        var newRows = newRawData.filter(function (newItem) {
          return !self.rows.some(function(oldRow) {
            return self.options.rowEquality(oldRow.entity, newItem);
          });
        });

        for (i = 0; i < newRows.length; i++) {
          self.addRows([newRows[i]]);
        }

        //look for deleted rows
        var deletedRows = self.rows.filter(function (oldRow) {
          return !newRawData.some(function (newItem) {
            return self.options.rowEquality(newItem, oldRow.entity);
          });
        });

        for (var i = 0; i < deletedRows.length; i++) {
          self.rows.splice( self.rows.indexOf(deletedRows[i] ), 1 );
        }

      };

      /**
       * Private Undocumented Method
       * @name addRows
       * @methodOf ui.grid.class:Grid
       * @description adds the newRawData array of rows to the grid and calls all registered
       * rowBuilders. this keyword will reference the grid
       */
      Grid.prototype.addRows = function(newRawData) {
        var self = this;

        for (var i=0; i < newRawData.length; i++) {
          self.rows.push( self.processRowBuilders(new GridRow(newRawData[i], i)) );
        }
      };

      /**
       * @ngdoc function
       * @name processRowBuilders
       * @methodOf ui.grid.class:Grid
       * @description processes all RowBuilders for the gridRow
       * @param {GridRow} gridRow reference to gridRow
       * @returns {GridRow} the gridRow with all additional behavior added
       */
      Grid.prototype.processRowBuilders = function(gridRow) {
        var self = this;

        self.rowBuilders.forEach(function (builder) {
          builder.call(self,gridRow, self.gridOptions);
        });

        return gridRow;
      };

      /**
       * @ngdoc function
       * @name registerStyleComputation
       * @methodOf ui.grid.class:Grid
       * @description registered a styleComputation function
       * @param {function($scope)} styleComputation function
       */
      Grid.prototype.registerStyleComputation = function (styleComputationInfo) {
        this.styleComputations.push(styleComputationInfo);
      };

      Grid.prototype.setRenderedRows = function (newRows) {
        this.renderedRows.length = newRows.length;
        for (var i = 0; i < newRows.length; i++) {
          this.renderedRows[i] = newRows[i];
        }
      };

      Grid.prototype.setRenderedColumns = function (newColumns) {
        this.renderedColumns.length = newColumns.length;
        for (var i = 0; i < newColumns.length; i++) {
          this.renderedColumns[i] = newColumns[i];
        }
      };

      /**
       * @ngdoc function
       * @name buildStyles
       * @methodOf ui.grid.class:Grid
       * @description calls each styleComputation function
       */
      Grid.prototype.buildStyles = function ($scope) {
        var self = this;
        self.styleComputations
          .sort(function(a, b) {
            if (a.priority === null) { return 1; }
            if (b.priority === null) { return -1; }
            if (a.priority === null && b.priority === null) { return 0; }
            return a.priority - b.priority;
          })
          .forEach(function (compInfo) {
            compInfo.func.call(self, $scope);
          });
      };

      Grid.prototype.minRowsToRender = function () {
        return Math.ceil(this.getViewportHeight() / this.options.rowHeight);
      };

      Grid.prototype.minColumnsToRender = function () {
        var self = this;
        var viewport = this.getViewportWidth();

        var min = 0;
        var totalWidth = 0;
        self.columns.forEach(function(col, i) {
          if (totalWidth < viewport) {
            totalWidth += col.drawnWidth;
            min++;
          }
          else {
            var currWidth = 0;
            for (var j = i; j >= i - min; j--) {
              currWidth += self.columns[j].drawnWidth;
            }
            if (currWidth < viewport) {
              min++;
            }
          }
        });

        return min;
      };

      // NOTE: viewport drawable height is the height of the grid minus the header row height (including any border)
      // TODO(c0bra): account for footer height
      Grid.prototype.getViewportHeight = function () {
        var viewPortHeight = this.gridHeight - this.headerHeight;
        return viewPortHeight;
      };

      Grid.prototype.getViewportWidth = function () {
        var viewPortWidth = this.gridWidth;
        return viewPortWidth;
      };

      Grid.prototype.getCanvasHeight = function () {
        return this.options.rowHeight * this.rows.length;
      };

      Grid.prototype.getCanvasWidth = function () {
        return this.canvasWidth;
      };

      Grid.prototype.getTotalRowHeight = function () {
        return this.options.rowHeight * this.rows.length;
      };

      // Is the grid currently scrolling?
      Grid.prototype.isScrolling = function() {
        return this.scrolling ? true : false;
      };

      Grid.prototype.setScrolling = function(scrolling) {
        this.scrolling = scrolling;
      };


      /**
       * @ngdoc function
       * @name ui.grid.class:GridOptions
       * @description Default GridOptions class.  GridOptions are defined by the application developer and overlaid
       * over this object.
       * @param {string} id id to assign to grid
       */
      function GridOptions() {
        /**
         * @ngdoc object
         * @name data
         * @propertyOf  ui.grid.class:GridOptions
         * @description Array of data to be rendered to grid.  Array can contain complex objects
         */
        this.data = [];

        /**
         * @ngdoc object
         * @name columnDefs
         * @propertyOf  ui.grid.class:GridOptions
         * @description (optional) Array of columnDef objects.  Only required property is name.
         * _field property can be used in place of name for backwards compatibilty with 2.x_
         *  @example

         var columnDefs = [{name:'field1'}, {name:'field2'}];

         */
        this.columnDefs = [];

        this.headerRowHeight = 30;
        this.rowHeight = 30;
        this.maxVisibleRowCount = 200;

        this.columnWidth = 50;
        this.maxVisibleColumnCount = 200;

        // Turn virtualization on when number of data elements goes over this number
        this.virtualizationThreshold = 20;

        this.columnVirtualizationThreshold = 10;

        // Extra rows to to render outside of the viewport
        this.excessRows = 4;
        this.scrollThreshold = 4;

        // Extra columns to to render outside of the viewport
        this.excessColumns = 4;
        this.horizontalScrollThreshold = 2;

        // Resizing columns, off by default
        this.enableColumnResizing = false;

        // Columns can't be smaller than 10 pixels
        this.minimumColumnSize = 10;

        /**
         * @ngdoc function
         * @name rowEquality
         * @methodOf ui.grid.class:GridOptions
         * @description By default, rows are compared using object equality.  This option can be overridden
         * to compare on any data item property or function
         * @param {object} entityA First Data Item to compare
         * @param {object} entityB Second Data Item to compare
         */
        this.rowEquality = function(entityA, entityB) {
          return entityA === entityB;
        };

        // Custom template for header row
        this.headerTemplate = null;
      }

      /**
       * @ngdoc function
       * @name ui.grid.class:GridRow
       * @description Wrapper for the GridOptions.data rows.  Allows for needed properties and functions
       * to be assigned to a grid row
       * @param {object} entity the array item from GridOptions.data
       * @param {number} index the current position of the row in the array
       */
      function GridRow(entity, index) {
        this.entity = entity;
        this.index = index;
      }

      /**
       * @ngdoc function
       * @name getQualifiedColField
       * @methodOf ui.grid.class:GridRow
       * @description returns the qualified field name as it exists on scope
       * ie: row.entity.fieldA
       * @param {GridCol} col column instance
       * @returns {string} resulting name that can be evaluated on scope
       */
      GridRow.prototype.getQualifiedColField = function(col) {
        return 'row.entity.' + col.field;
      };

      GridRow.prototype.getEntityQualifiedColField = function(col) {
        return 'entity.' + col.field;
      };

      return service;
    }]);

})();