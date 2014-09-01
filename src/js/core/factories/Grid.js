(function(){

angular.module('ui.grid')
.factory('Grid', ['$log', '$q', '$compile', '$parse', 'gridUtil', 'uiGridConstants', 'GridOptions', 'GridColumn', 'GridRow', 'GridApi', 'rowSorter', 'rowSearcher', 'GridRenderContainer',
    function($log, $q, $compile, $parse, gridUtil, uiGridConstants, GridOptions, GridColumn, GridRow, GridApi, rowSorter, rowSearcher, GridRenderContainer) {

/**
   * @ngdoc function
   * @name ui.grid.class:Grid
   * @description Grid is the main viewModel.  Any properties or methods needed to maintain state are defined in
 * * this prototype.  One instance of Grid is created per Grid directive instance.
   * @param {object} options Object map of options to pass into the grid. An 'id' property is expected.
   */
  var Grid = function Grid(options) {
  // Get the id out of the options, then remove it
  if (options !== undefined && typeof(options.id) !== 'undefined' && options.id) {
    if (!/^[_a-zA-Z0-9-]+$/.test(options.id)) {
      throw new Error("Grid id '" + options.id + '" is invalid. It must follow CSS selector syntax rules.');
    }
  }
  else {
    throw new Error('No ID provided. An ID must be given when creating a grid.');
  }

  this.id = options.id;
  delete options.id;

  // Get default options
  this.options = new GridOptions();

  // Extend the default options with what we were passed in
  angular.extend(this.options, options);

  this.headerHeight = this.options.headerRowHeight;
  this.footerHeight = this.options.showFooter === true ? this.options.footerRowHeight : 0;

  this.gridHeight = 0;
  this.gridWidth = 0;
  this.columnBuilders = [];
  this.rowBuilders = [];
  this.rowsProcessors = [];
  this.columnsProcessors = [];
  this.styleComputations = [];
  this.viewportAdjusters = [];

  // this.visibleRowCache = [];

  // Set of 'render' containers for this grid, which can render sets of rows
  this.renderContainers = {};

  // Create a
  this.renderContainers.body = new GridRenderContainer('body', this);

  this.cellValueGetterCache = {};

  // Cached function to use with custom row templates
  this.getRowTemplateFn = null;

  // Validate options
  if (!this.options.enableNativeScrolling && !this.options.enableVirtualScrolling) {
    throw "Either native or virtual scrolling must be enabled.";
  }


  //representation of the rows on the grid.
  //these are wrapped references to the actual data rows (options.data)
  this.rows = [];

  //represents the columns on the grid
  this.columns = [];

  //current rows that are rendered on the DOM
  this.renderedRows = [];
  this.renderedColumns = [];

  this.api = new GridApi(this);
};

  /**
   * @ngdoc function
   * @name registerColumnBuilder
   * @methodOf ui.grid.class:Grid
   * @description When the build creates columns from column definitions, the columnbuilders will be called to add
   * additional properties to the column.
   * @param {function(colDef, col, gridOptions)} columnsProcessor function to be called
   */
  Grid.prototype.registerColumnBuilder = function registerColumnBuilder(columnBuilder) {
    this.columnBuilders.push(columnBuilder);
  };

  /**
   * @ngdoc function
   * @name buildColumnDefsFromData
   * @methodOf ui.grid.class:Grid
   * @description Populates columnDefs from the provided data
   * @param {function(colDef, col, gridOptions)} rowBuilder function to be called
   */
  Grid.prototype.buildColumnDefsFromData = function (dataRows){
    this.options.columnDefs =  gridUtil.getColumnsFromData(dataRows,  this.options.excludeProperties);
  };

  /**
   * @ngdoc function
   * @name registerRowBuilder
   * @methodOf ui.grid.class:Grid
   * @description When the build creates rows from gridOptions.data, the rowBuilders will be called to add
   * additional properties to the row.
   * @param {function(colDef, col, gridOptions)} rowBuilder function to be called
   */
  Grid.prototype.registerRowBuilder = function registerRowBuilder(rowBuilder) {
    this.rowBuilders.push(rowBuilder);
  };

  /**
   * @ngdoc function
   * @name getColumn
   * @methodOf ui.grid.class:Grid
   * @description returns a grid column for the column name
   * @param {string} name column name
   */
  Grid.prototype.getColumn = function getColumn(name) {
    var columns = this.columns.filter(function (column) {
      return column.colDef.name === name;
    });
    return columns.length > 0 ? columns[0] : null;
  };

  /**
   * @ngdoc function
   * @name getColDef
   * @methodOf ui.grid.class:Grid
   * @description returns a grid colDef for the column name
   * @param {string} name column.field
   */
  Grid.prototype.getColDef = function getColDef(name) {
    var colDefs = this.options.columnDefs.filter(function (colDef) {
      return colDef.name === name;
    });
    return colDefs.length > 0 ? colDefs[0] : null;
  };

  /**
   * @ngdoc function
   * @name assignTypes
   * @methodOf ui.grid.class:Grid
   * @description uses the first row of data to assign colDef.type for any types not defined.
   */
  Grid.prototype.assignTypes = function(){
    var self = this;
    self.options.columnDefs.forEach(function (colDef, index) {

      //Assign colDef type if not specified
      if (!colDef.type) {
        var col = new GridColumn(colDef, index, self);
        var firstRow = self.rows.length > 0 ? self.rows[0] : null;
        if (firstRow) {
          colDef.type = gridUtil.guessType(self.getCellValue(firstRow, col));
        }
        else {
          $log.log('Unable to assign type from data, so defaulting to string');
          colDef.type = 'string';
        }
      }
    });
  };

  /**
   * @ngdoc function
   * @name buildColumns
   * @methodOf ui.grid.class:Grid
   * @description creates GridColumn objects from the columnDefinition.  Calls each registered
   * columnBuilder to further process the column
   * @returns {Promise} a promise to load any needed column resources
   */
  Grid.prototype.buildColumns = function buildColumns() {
    $log.debug('buildColumns');
    var self = this;
    var builderPromises = [];

    // Synchronize self.columns with self.options.columnDefs so that columns can also be removed.
    if (self.columns.length > self.options.columnDefs.length) {
        self.columns.forEach(function (column, index) {
            if (!self.getColDef(column.name)) {
                self.columns.splice(index, 1);
            }
        });
    }

    self.options.columnDefs.forEach(function (colDef, index) {
      self.preprocessColDef(colDef);
      var col = self.getColumn(colDef.name);

      if (!col) {
        col = new GridColumn(colDef, index, self);
        self.columns.splice(index, 0, col);
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
 * @ngdoc function
 * @name preCompileCellTemplates
 * @methodOf ui.grid.class:Grid
 * @description precompiles all cell templates
 */
  Grid.prototype.preCompileCellTemplates = function() {
        $log.info('pre-compiling cell templates');
        this.columns.forEach(function (col) {
          var html = col.cellTemplate.replace(uiGridConstants.COL_FIELD, 'getCellValue(row, col)');

          var compiledElementFn = $compile(html);
          col.compiledElementFn = compiledElementFn;
        });
  };

  /**
   * undocumented function
   * @name preprocessColDef
   * @methodOf ui.grid.class:Grid
   * @description defaults the name property from field to maintain backwards compatibility with 2.x
   * validates that name or field is present
   */
  Grid.prototype.preprocessColDef = function preprocessColDef(colDef) {
    if (!colDef.field && !colDef.name) {
      throw new Error('colDef.name or colDef.field property is required');
    }

    //maintain backwards compatibility with 2.x
    //field was required in 2.x.  now name is required
    if (colDef.name === undefined && colDef.field !== undefined) {
      colDef.name = colDef.field;
    }

  };

  // Return a list of items that exist in the `n` array but not the `o` array. Uses optional property accessors passed as third & fourth parameters
  Grid.prototype.newInN = function newInN(o, n, oAccessor, nAccessor) {
    var self = this;

    var t = [];
    for (var i=0; i<n.length; i++) {
      var nV = nAccessor ? n[i][nAccessor] : n[i];
      
      var found = false;
      for (var j=0; j<o.length; j++) {
        var oV = oAccessor ? o[j][oAccessor] : o[j];
        if (self.options.rowEquality(nV, oV)) {
          found = true;
          break;
        }
      }
      if (!found) {
        t.push(nV);
      }
    }
    
    return t;
  };

    /**
     * @ngdoc function
     * @name getRow
     * @methodOf ui.grid.class:Grid
     * @description returns the GridRow that contains the rowEntity
     * @param {object} rowEntity the gridOptions.data array element instance
     */
    Grid.prototype.getRow = function getRow(rowEntity) {
      var rows = this.rows.filter(function (row) {
        return row.entity === rowEntity;
      });
      return rows.length > 0 ? rows[0] : null;
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
  Grid.prototype.modifyRows = function modifyRows(newRawData) {
    var self = this,
        i,
        newRow;

    if (self.rows.length === 0 && newRawData.length > 0) {
      if (self.options.enableRowHashing) {
        if (!self.rowHashMap) {
          self.createRowHashMap();
        }

        for (i=0; i<newRawData.length; i++) {
          newRow = newRawData[i];

          self.rowHashMap.put(newRow, {
            i: i,
            entity: newRow
          });
        }
      }

      self.addRows(newRawData);
      //now that we have data, it is save to assign types to colDefs
      self.assignTypes();
    }
    else if (newRawData.length > 0) {
      var unfoundNewRows, unfoundOldRows, unfoundNewRowsToFind;

      // If row hashing is turned on
      if (self.options.enableRowHashing) {
        // Array of new rows that haven't been found in the old rowset
        unfoundNewRows = [];
        // Array of new rows that we explicitly HAVE to search for manually in the old row set. They cannot be looked up by their identity (because it doesn't exist).
        unfoundNewRowsToFind = [];
        // Map of rows that have been found in the new rowset
        var foundOldRows = {};
        // Array of old rows that have NOT been found in the new rowset
        unfoundOldRows = [];

        // Create the row HashMap if it doesn't exist already
        if (!self.rowHashMap) {
          self.createRowHashMap();
        }
        var rowhash = self.rowHashMap;
        
        // Make sure every new row has a hash
        for (i = 0; i < newRawData.length; i++) {
          newRow = newRawData[i];

          // Flag this row as needing to be manually found if it didn't come in with a $$hashKey
          var mustFind = false;
          if (!self.options.getRowIdentity(newRow)) {
            mustFind = true;
          }

          // See if the new row is already in the rowhash
          var found = rowhash.get(newRow);
          // If so...
          if (found) {
            // See if it's already being used by as GridRow
            if (found.row) {
              // If so, mark this new row as being found
              foundOldRows[self.options.rowIdentity(newRow)] = true;
            }
          }
          else {
            // Put the row in the hashmap with the index it corresponds to
            rowhash.put(newRow, {
              i: i,
              entity: newRow
            });
            
            // This row has to be searched for manually in the old row set
            if (mustFind) {
              unfoundNewRowsToFind.push(newRow);
            }
            else {
              unfoundNewRows.push(newRow);
            }
          }
        }

        // Build the list of unfound old rows
        for (i = 0; i < self.rows.length; i++) {
          var row = self.rows[i];
          var hash = self.options.rowIdentity(row.entity);
          if (!foundOldRows[hash]) {
            unfoundOldRows.push(row);
          }
        }
      }

      // Look for new rows
      var newRows = unfoundNewRows || [];

      // The unfound new rows is either `unfoundNewRowsToFind`, if row hashing is turned on, or straight `newRawData` if it isn't
      var unfoundNew = (unfoundNewRowsToFind || newRawData);

      // Search for real new rows in `unfoundNew` and concat them onto `newRows`
      newRows = newRows.concat(self.newInN(self.rows, unfoundNew, 'entity'));
      
      self.addRows(newRows); 
      
      var deletedRows = self.getDeletedRows((unfoundOldRows || self.rows), newRawData);

      for (i = 0; i < deletedRows.length; i++) {
        if (self.options.enableRowHashing) {
          self.rowHashMap.remove(deletedRows[i].entity);
        }

        self.rows.splice( self.rows.indexOf(deletedRows[i]), 1 );
      }
    }
    // Empty data set
    else {
      // Reset the row HashMap
      self.createRowHashMap();

      // Reset the rows length!
      self.rows.length = 0;
    }
    
    var p1 = $q.when(self.processRowsProcessors(self.rows))
      .then(function (renderableRows) {
        return self.setVisibleRows(renderableRows);
      });

    var p2 = $q.when(self.processColumnsProcessors(self.columns))
      .then(function (renderableColumns) {
        return self.setVisibleColumns(renderableColumns);
      });

    return $q.all([p1, p2]);
  };

  Grid.prototype.getDeletedRows = function(oldRows, newRows) {
    var self = this;

    var olds = oldRows.filter(function (oldRow) {
      return !newRows.some(function (newItem) {
        return self.options.rowEquality(newItem, oldRow.entity);
      });
    });
    // var olds = self.newInN(newRows, oldRows, null, 'entity');
    // dump('olds', olds);
    return olds;
  };

  /**
   * Private Undocumented Method
   * @name addRows
   * @methodOf ui.grid.class:Grid
   * @description adds the newRawData array of rows to the grid and calls all registered
   * rowBuilders. this keyword will reference the grid
   */
  Grid.prototype.addRows = function addRows(newRawData) {
    var self = this;

    var existingRowCount = self.rows.length;
    for (var i=0; i < newRawData.length; i++) {
      var newRow = self.processRowBuilders(new GridRow(newRawData[i], i + existingRowCount, self));

      if (self.options.enableRowHashing) {
        var found = self.rowHashMap.get(newRow.entity);
        if (found) {
          found.row = newRow;
        }
      }

      self.rows.push(newRow);
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
  Grid.prototype.processRowBuilders = function processRowBuilders(gridRow) {
    var self = this;

    self.rowBuilders.forEach(function (builder) {
      builder.call(self, gridRow, self.gridOptions);
    });

    return gridRow;
  };

  /**
   * @ngdoc function
   * @name registerStyleComputation
   * @methodOf ui.grid.class:Grid
   * @description registered a styleComputation function
   * 
   * If the function returns a value it will be appended into the grid's `<style>` block
   * @param {function($scope)} styleComputation function
   */
  Grid.prototype.registerStyleComputation = function registerStyleComputation(styleComputationInfo) {
    this.styleComputations.push(styleComputationInfo);
  };


  // NOTE (c0bra): We already have rowBuilders. I think these do exactly the same thing...
  // Grid.prototype.registerRowFilter = function(filter) {
  //   // TODO(c0bra): validate filter?

  //   this.rowFilters.push(filter);
  // };

  // Grid.prototype.removeRowFilter = function(filter) {
  //   var idx = this.rowFilters.indexOf(filter);

  //   if (typeof(idx) !== 'undefined' && idx !== undefined) {
  //     this.rowFilters.slice(idx, 1);
  //   }
  // };
  
  // Grid.prototype.processRowFilters = function(rows) {
  //   var self = this;
  //   self.rowFilters.forEach(function (filter) {
  //     filter.call(self, rows);
  //   });
  // };


  /**
   * @ngdoc function
   * @name registerRowsProcessor
   * @methodOf ui.grid.class:Grid
   * @param {function(renderableRows)} rows processor function
   * @returns {Array[GridRow]} Updated renderable rows
   * @description

     Register a "rows processor" function. When the rows are updated,
     the grid calls each registered "rows processor", which has a chance
     to alter the set of rows (sorting, etc) as long as the count is not
     modified.
   */
  Grid.prototype.registerRowsProcessor = function registerRowsProcessor(processor) {
    if (!angular.isFunction(processor)) {
      throw 'Attempt to register non-function rows processor: ' + processor;
    }

    this.rowsProcessors.push(processor);
  };

  /**
   * @ngdoc function
   * @name removeRowsProcessor
   * @methodOf ui.grid.class:Grid
   * @param {function(renderableRows)} rows processor function
   * @description Remove a registered rows processor
   */
  Grid.prototype.removeRowsProcessor = function removeRowsProcessor(processor) {
    var idx = this.rowsProcessors.indexOf(processor);

    if (typeof(idx) !== 'undefined' && idx !== undefined) {
      this.rowsProcessors.splice(idx, 1);
    }
  };
  
  /**
   * Private Undocumented Method
   * @name processRowsProcessors
   * @methodOf ui.grid.class:Grid
   * @param {Array[GridRow]} The array of "renderable" rows
   * @param {Array[GridColumn]} The array of columns
   * @description Run all the registered rows processors on the array of renderable rows
   */
  Grid.prototype.processRowsProcessors = function processRowsProcessors(renderableRows) {
    var self = this;

    // Create a shallow copy of the rows so that we can safely sort them without altering the original grid.rows sort order
    var myRenderableRows = renderableRows.slice(0);
    
    // self.rowsProcessors.forEach(function (processor) {
    //   myRenderableRows = processor.call(self, myRenderableRows, self.columns);

    //   if (!renderableRows) {
    //     throw "Processor at index " + i + " did not return a set of renderable rows";
    //   }

    //   if (!angular.isArray(renderableRows)) {
    //     throw "Processor at index " + i + " did not return an array";
    //   }

    //   i++;
    // });

    // Return myRenderableRows with no processing if we have no rows processors 
    if (self.rowsProcessors.length === 0) {
      return $q.when(myRenderableRows);
    }
  
    // Counter for iterating through rows processors
    var i = 0;
    
    // Promise for when we're done with all the processors
    var finished = $q.defer();

    // This function will call the processor in self.rowsProcessors at index 'i', and then
    //   when done will call the next processor in the list, using the output from the processor
    //   at i as the argument for 'renderedRowsToProcess' on the next iteration.
    //  
    //   If we're at the end of the list of processors, we resolve our 'finished' callback with
    //   the result.
    function startProcessor(i, renderedRowsToProcess) {
      // Get the processor at 'i'
      var processor = self.rowsProcessors[i];

      // Call the processor, passing in the rows to process and the current columns
      //   (note: it's wrapped in $q.when() in case the processor does not return a promise)
      return $q.when( processor.call(self, renderedRowsToProcess, self.columns) )
        .then(function handleProcessedRows(processedRows) {
          // Check for errors
          if (!processedRows) {
            throw "Processor at index " + i + " did not return a set of renderable rows";
          }

          if (!angular.isArray(processedRows)) {
            throw "Processor at index " + i + " did not return an array";
          }

          // Processor is done, increment the counter
          i++;

          // If we're not done with the processors, call the next one
          if (i <= self.rowsProcessors.length - 1) {
            return startProcessor(i, processedRows);
          }
          // We're done! Resolve the 'finished' promise
          else {
            finished.resolve(processedRows);
          }
        });
    }

    // Start on the first processor
    startProcessor(0, myRenderableRows);
    
    return finished.promise;
  };

  Grid.prototype.setVisibleRows = function setVisibleRows(rows) {
    // $log.debug('setVisibleRows');

    var self = this;

    //var newVisibleRowCache = [];

    // Reset all the render container row caches
    for (var i in self.renderContainers) {
      var container = self.renderContainers[i];

      container.visibleRowCache.length = 0;
    }
    
    // rows.forEach(function (row) {
    for (var ri in rows) {
      var row = rows[ri];

      // If the row is visible
      if (row.visible) {
        // newVisibleRowCache.push(row);

        // If the row has a container specified
        if (typeof(row.renderContainer) !== 'undefined' && row.renderContainer) {
          self.renderContainers[row.renderContainer].visibleRowCache.push(row);
        }
        // If not, put it into the body container
        else {
          self.renderContainers.body.visibleRowCache.push(row);
        }
      }
    }
  };

  /**
   * @ngdoc function
   * @name registerColumnsProcessor
   * @methodOf ui.grid.class:Grid
   * @param {function(renderableColumns)} rows processor function
   * @returns {Array[GridColumn]} Updated renderable columns
   * @description

     Register a "columns processor" function. When the columns are updated,
     the grid calls each registered "columns processor", which has a chance
     to alter the set of columns, as long as the count is not modified.
   */
  Grid.prototype.registerColumnsProcessor = function registerColumnsProcessor(processor) {
    if (!angular.isFunction(processor)) {
      throw 'Attempt to register non-function rows processor: ' + processor;
    }

    this.columnsProcessors.push(processor);
  };

  Grid.prototype.removeColumnsProcessor = function removeColumnsProcessor(processor) {
    var idx = this.columnsProcessors.indexOf(processor);

    if (typeof(idx) !== 'undefined' && idx !== undefined) {
      this.columnsProcessors.splice(idx, 1);
    }
  };

  Grid.prototype.processColumnsProcessors = function processColumnsProcessors(renderableColumns) {
    var self = this;

    // Create a shallow copy of the rows so that we can safely sort them without altering the original grid.rows sort order
    var myRenderableColumns = renderableColumns.slice(0);

    // Return myRenderableRows with no processing if we have no rows processors 
    if (self.columnsProcessors.length === 0) {
      return $q.when(myRenderableColumns);
    }
  
    // Counter for iterating through rows processors
    var i = 0;
    
    // Promise for when we're done with all the processors
    var finished = $q.defer();

    // This function will call the processor in self.rowsProcessors at index 'i', and then
    //   when done will call the next processor in the list, using the output from the processor
    //   at i as the argument for 'renderedRowsToProcess' on the next iteration.
    //  
    //   If we're at the end of the list of processors, we resolve our 'finished' callback with
    //   the result.
    function startProcessor(i, renderedColumnsToProcess) {
      // Get the processor at 'i'
      var processor = self.columnsProcessors[i];

      // Call the processor, passing in the rows to process and the current columns
      //   (note: it's wrapped in $q.when() in case the processor does not return a promise)
      return $q.when( processor.call(self, renderedColumnsToProcess, self.rows) )
        .then(function handleProcessedRows(processedColumns) {
          // Check for errors
          if (!processedColumns) {
            throw "Processor at index " + i + " did not return a set of renderable rows";
          }

          if (!angular.isArray(processedColumns)) {
            throw "Processor at index " + i + " did not return an array";
          }

          // Processor is done, increment the counter
          i++;

          // If we're not done with the processors, call the next one
          if (i <= self.columnsProcessors.length - 1) {
            return startProcessor(i, myRenderableColumns);
          }
          // We're done! Resolve the 'finished' promise
          else {
            finished.resolve(myRenderableColumns);
          }
        });
    }

    // Start on the first processor
    startProcessor(0, myRenderableColumns);
    
    return finished.promise;
  };

  Grid.prototype.setVisibleColumns = function setVisibleColumns(columns) {
    // $log.debug('setVisibleColumns');

    var self = this;

    // Reset all the render container row caches
    for (var i in self.renderContainers) {
      var container = self.renderContainers[i];

      container.visibleColumnCache.length = 0;
    }
    
    for (var ci in columns) {
      var column = columns[ci];

      // If the column is visible
      if (column.visible) {
        // If the column has a container specified
        if (typeof(column.renderContainer) !== 'undefined' && column.renderContainer) {
          self.renderContainers[column.renderContainer].visibleColumnCache.push(column);
        }
        // If not, put it into the body container
        else {
          self.renderContainers.body.visibleColumnCache.push(column);
        }
      }
    }
  };


  Grid.prototype.setRenderedRows = function setRenderedRows(newRows) {
    this.renderedRows.length = newRows.length;
    for (var i = 0; i < newRows.length; i++) {
      this.renderedRows[i] = newRows[i];
    }
  };

  Grid.prototype.setRenderedColumns = function setRenderedColumns(newColumns) {
    var self = this;

    // OLD:
    this.renderedColumns.length = newColumns.length;
    for (var i = 0; i < newColumns.length; i++) {
      this.renderedColumns[i] = newColumns[i];
    }

    // Reset all the render container row caches
    // for (var i in self.renderContainers) {
    //   var container = self.renderContainers[i];

    //   container.columnCache.length = 0;
    // }

    // newColumns.forEach(function (column) {
    //   // If the column is visible
    //   if (column.visible) {
    //     // If the column has a container specified
    //     if (typeof(column.renderContainer) !== 'undefined' && column.renderContainer) {
    //       self.renderContainers[column.renderContainer].columnCache.push(column);
    //     }
    //     // If not, put it into the body container
    //     else {
    //       self.renderContainers.body.columnCache.push(column);
    //     }
    //   }
    // });
  };

  /**
   * @ngdoc function
   * @name buildStyles
   * @methodOf ui.grid.class:Grid
   * @description calls each styleComputation function
   */
  Grid.prototype.buildStyles = function buildStyles($scope) {
    // $log.debug('buildStyles');

    var self = this;
    
    self.customStyles = '';

    self.styleComputations
      .sort(function(a, b) {
        if (a.priority === null) { return 1; }
        if (b.priority === null) { return -1; }
        if (a.priority === null && b.priority === null) { return 0; }
        return a.priority - b.priority;
      })
      .forEach(function (compInfo) {
        var ret = compInfo.func.call(self, $scope);

        if (angular.isString(ret)) {
          self.customStyles += '\n' + ret;
        }
      });
  };

  Grid.prototype.minRowsToRender = function minRowsToRender() {
    return Math.ceil(this.getViewportHeight() / this.options.rowHeight);
  };

  Grid.prototype.minColumnsToRender = function minColumnsToRender() {
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

  Grid.prototype.getBodyHeight = function getBodyHeight() {
    // Start with the viewportHeight
    var bodyHeight = this.getViewportHeight();

    // Add the horizontal scrollbar height if there is one
    if (typeof(this.horizontalScrollbarHeight) !== 'undefined' && this.horizontalScrollbarHeight !== undefined && this.horizontalScrollbarHeight > 0) {
      bodyHeight = bodyHeight + this.horizontalScrollbarHeight;
    }

    return bodyHeight;
  };

  // NOTE: viewport drawable height is the height of the grid minus the header row height (including any border)
  // TODO(c0bra): account for footer height
  Grid.prototype.getViewportHeight = function getViewportHeight() {
    var self = this;

    var viewPortHeight = this.gridHeight - this.headerHeight - this.footerHeight;

    // Account for native horizontal scrollbar, if present
    if (typeof(this.horizontalScrollbarHeight) !== 'undefined' && this.horizontalScrollbarHeight !== undefined && this.horizontalScrollbarHeight > 0) {
      viewPortHeight = viewPortHeight - this.horizontalScrollbarHeight;
    }

    var adjustment = self.getViewportAdjustment();
    
    viewPortHeight = viewPortHeight + adjustment.height;

    // $log.debug('viewPortHeight', viewPortHeight);

    return viewPortHeight;
  };

  Grid.prototype.getViewportWidth = function getViewportWidth() {
    var self = this;

    var viewPortWidth = this.gridWidth;

    if (typeof(this.verticalScrollbarWidth) !== 'undefined' && this.verticalScrollbarWidth !== undefined && this.verticalScrollbarWidth > 0) {
      viewPortWidth = viewPortWidth - this.verticalScrollbarWidth;
    }

    var adjustment = self.getViewportAdjustment();
    
    viewPortWidth = viewPortWidth + adjustment.width;

    // $log.debug('getviewPortWidth', viewPortWidth);

    return viewPortWidth;
  };

  Grid.prototype.getHeaderViewportWidth = function getHeaderViewportWidth() {
    var viewPortWidth = this.getViewportWidth();

    if (typeof(this.verticalScrollbarWidth) !== 'undefined' && this.verticalScrollbarWidth !== undefined && this.verticalScrollbarWidth > 0) {
      viewPortWidth = viewPortWidth + this.verticalScrollbarWidth;
    }

    return viewPortWidth;
  };

  Grid.prototype.registerViewportAdjuster = function registerViewportAdjuster(func) {
    this.viewportAdjusters.push(func);
  };

  Grid.prototype.removeViewportAdjuster = function registerViewportAdjuster(func) {
    var idx = this.viewportAdjusters.indexOf(func);

    if (typeof(idx) !== 'undefined' && idx !== undefined) {
      this.viewportAdjusters.splice(idx, 1);
    }
  };

  Grid.prototype.getViewportAdjustment = function getViewportAdjustment() {
    var self = this;

    var adjustment = { height: 0, width: 0 };

    self.viewportAdjusters.forEach(function (func) {
      adjustment = func.call(this, adjustment);
    });

    return adjustment;
  };

  Grid.prototype.getVisibleRowCount = function getVisibleRowCount() {
    // var count = 0;

    // this.rows.forEach(function (row) {
    //   if (row.visible) {
    //     count++;
    //   }
    // });

    // return this.visibleRowCache.length;
    return this.renderContainers.body.visibleRowCache.length;
  };

   Grid.prototype.getVisibleRows = function getVisibleRows() {
    return this.renderContainers.body.visibleRowCache;
   };

  Grid.prototype.getVisibleColumnCount = function getVisibleColumnCount() {
    // var count = 0;

    // this.rows.forEach(function (row) {
    //   if (row.visible) {
    //     count++;
    //   }
    // });

    // return this.visibleRowCache.length;
    return this.renderContainers.body.visibleColumnCache.length;
  };

  Grid.prototype.getCanvasHeight = function getCanvasHeight() {
    var ret =  this.options.rowHeight * this.getVisibleRowCount();

    if (typeof(this.horizontalScrollbarHeight) !== 'undefined' && this.horizontalScrollbarHeight !== undefined && this.horizontalScrollbarHeight > 0) {
      ret = ret - this.horizontalScrollbarHeight;
    }

    return ret;
  };

  Grid.prototype.getCanvasWidth = function getCanvasWidth() {
    var ret = this.canvasWidth;

    if (typeof(this.verticalScrollbarWidth) !== 'undefined' && this.verticalScrollbarWidth !== undefined && this.verticalScrollbarWidth > 0) {
      ret = ret - this.verticalScrollbarWidth;
    }

    // $log.debug('canvasWidth', ret);

    return ret;
  };

  Grid.prototype.getTotalRowHeight = function getTotalRowHeight() {
    return this.options.rowHeight * this.getVisibleRowCount();
  };

  // Is the grid currently scrolling?
  Grid.prototype.isScrolling = function isScrolling() {
    return this.scrolling ? true : false;
  };

  Grid.prototype.setScrolling = function setScrolling(scrolling) {
    this.scrolling = scrolling;
  };

  Grid.prototype.searchRows = function searchRows(renderableRows) {
    return rowSearcher.search(this, renderableRows, this.columns);
  };

  Grid.prototype.sortByColumn = function sortByColumn(renderableRows) {
    return rowSorter.sort(this, renderableRows, this.columns);
  };

  Grid.prototype.getCellValue = function getCellValue(row, col){
    var self = this;

    if (!self.cellValueGetterCache[col.colDef.name]) {
      self.cellValueGetterCache[col.colDef.name] = $parse(row.getEntityQualifiedColField(col));
    }

    return self.cellValueGetterCache[col.colDef.name](row);
  };

  
  Grid.prototype.getNextColumnSortPriority = function getNextColumnSortPriority() {
    var self = this,
        p = 0;

    self.columns.forEach(function (col) {
      if (col.sort && col.sort.priority && col.sort.priority > p) {
        p = col.sort.priority;
      }
    });

    return p + 1;
  };

  /**
   * @ngdoc function
   * @name resetColumnSorting
   * @methodOf ui.grid.class:Grid
   * @description Return the columns that the grid is currently being sorted by
   * @param {GridColumn} [excludedColumn] Optional GridColumn to exclude from having its sorting reset
   */
  Grid.prototype.resetColumnSorting = function resetColumnSorting(excludeCol) {
    var self = this;

    self.columns.forEach(function (col) {
      if (col !== excludeCol) {
        col.sort = {};
      }
    });
  };

  /**
   * @ngdoc function
   * @name getColumnSorting
   * @methodOf ui.grid.class:Grid
   * @description Return the columns that the grid is currently being sorted by
   * @returns {Array[GridColumn]} An array of GridColumn objects
   */
  Grid.prototype.getColumnSorting = function getColumnSorting() {
    var self = this;

    var sortedCols = [];

    // Iterate through all the columns, sorted by priority
    self.columns.sort(rowSorter.prioritySort).forEach(function (col) {
      if (col.sort && typeof(col.sort.direction) !== 'undefined' && col.sort.direction && (col.sort.direction === uiGridConstants.ASC || col.sort.direction === uiGridConstants.DESC)) {
        sortedCols.push(col);
      }
    });

    return sortedCols;
  };

  /**
   * @ngdoc function
   * @name sortColumn
   * @methodOf ui.grid.class:Grid
   * @description Set the sorting on a given column, optionally resetting any existing sorting on the Grid.
   * @param {GridColumn} column Column to set the sorting on
   * @param {uiGridConstants.ASC|uiGridConstants.DESC} [direction] Direction to sort by, either descending or ascending.
   *   If not provided, the column will iterate through the sort directions: ascending, descending, unsorted.
   * @param {boolean} [add] Add this column to the sorting. If not provided or set to `false`, the Grid will reset any existing sorting and sort
   *   by this column only
   * @returns {Promise} A resolved promise that supplies the column.
   */
  
  Grid.prototype.sortColumn = function sortColumn(column, directionOrAdd, add) {
    var self = this,
        direction = null;

    if (typeof(column) === 'undefined' || !column) {
      throw new Error('No column parameter provided');
    }

    // Second argument can either be a direction or whether to add this column to the existing sort.
    //   If it's a boolean, it's an add, otherwise, it's a direction
    if (typeof(directionOrAdd) === 'boolean') {
      add = directionOrAdd;
    }
    else {
      direction = directionOrAdd;
    }
    
    if (!add) {
      self.resetColumnSorting(column);
      column.sort.priority = 0;
    }
    else {
      column.sort.priority = self.getNextColumnSortPriority();
    }

    if (!direction) {
      // Figure out the sort direction
      if (column.sort.direction && column.sort.direction === uiGridConstants.ASC) {
        column.sort.direction = uiGridConstants.DESC;
      }
      else if (column.sort.direction && column.sort.direction === uiGridConstants.DESC) {
        column.sort.direction = null;
      }
      else {
        column.sort.direction = uiGridConstants.ASC;
      }
    }
    else {
      column.sort.direction = direction;
    }

    return $q.when(column);
  };
  
  /**
   * communicate to outside world that we are done with initial rendering
   */
  Grid.prototype.renderingComplete = function(){
    if (angular.isFunction(this.options.onRegisterApi)) {
      this.options.onRegisterApi(this.api);
    }
  };

  Grid.prototype.createRowHashMap = function createRowHashMap() {
    var self = this;

    var hashMap = new RowHashMap();
    hashMap.grid = self;

    self.rowHashMap = hashMap;
  };

  // Blatantly stolen from Angular as it isn't exposed (yet? 2.0?)
  function RowHashMap() {}

  RowHashMap.prototype = {
    /**
     * Store key value pair
     * @param key key to store can be any type
     * @param value value to store can be any type
     */
    put: function(key, value) {
      this[this.grid.options.rowIdentity(key)] = value;
    },

    /**
     * @param key
     * @returns {Object} the value for the key
     */
    get: function(key) {
      return this[this.grid.options.rowIdentity(key)];
    },

    /**
     * Remove the key/value pair
     * @param key
     */
    remove: function(key) {
      var value = this[key = this.grid.options.rowIdentity(key)];
      delete this[key];
      return value;
    }
  };

  return Grid;

}]);

})();