(function(){

angular.module('ui.grid')
.factory('Grid', ['$q', '$compile', '$parse', 'gridUtil', 'uiGridConstants', 'GridOptions', 'GridColumn', 'GridRow', 'GridApi', 'rowSorter', 'rowSearcher', 'GridRenderContainer', '$timeout',
    function($q, $compile, $parse, gridUtil, uiGridConstants, GridOptions, GridColumn, GridRow, GridApi, rowSorter, rowSearcher, GridRenderContainer, $timeout) {

/**
 * @ngdoc object
 * @name ui.grid.core.api:PublicApi
 * @description Public Api for the core grid features
 *
 */


/**
   * @ngdoc function
   * @name ui.grid.class:Grid
   * @description Grid is the main viewModel.  Any properties or methods needed to maintain state are defined in
 * * this prototype.  One instance of Grid is created per Grid directive instance.
   * @param {object} options Object map of options to pass into the grid. An 'id' property is expected.
   */
  var Grid = function Grid(options) {
    var self = this;
  // Get the id out of the options, then remove it
  if (options !== undefined && typeof(options.id) !== 'undefined' && options.id) {
    if (!/^[_a-zA-Z0-9-]+$/.test(options.id)) {
      throw new Error("Grid id '" + options.id + '" is invalid. It must follow CSS selector syntax rules.');
    }
  }
  else {
    throw new Error('No ID provided. An ID must be given when creating a grid.');
  }

  self.id = options.id;
  delete options.id;

  // Get default options
  self.options = GridOptions.initialize( options );

  self.headerHeight = self.options.headerRowHeight;
  self.footerHeight = self.options.showFooter === true ? self.options.footerRowHeight : 0;

  self.rtl = false;
  self.gridHeight = 0;
  self.gridWidth = 0;
  self.columnBuilders = [];
  self.rowBuilders = [];
  self.rowsProcessors = [];
  self.columnsProcessors = [];
  self.styleComputations = [];
  self.viewportAdjusters = [];
  self.rowHeaderColumns = [];
  self.dataChangeCallbacks = {};

  // self.visibleRowCache = [];

  // Set of 'render' containers for self grid, which can render sets of rows
  self.renderContainers = {};

  // Create a
  self.renderContainers.body = new GridRenderContainer('body', self);

  self.cellValueGetterCache = {};

  // Cached function to use with custom row templates
  self.getRowTemplateFn = null;


  //representation of the rows on the grid.
  //these are wrapped references to the actual data rows (options.data)
  self.rows = [];

  //represents the columns on the grid
  self.columns = [];

  /**
   * @ngdoc boolean
   * @name isScrollingVertically
   * @propertyOf ui.grid.class:Grid
   * @description set to true when Grid is scrolling vertically. Set to false via debounced method
   */
  self.isScrollingVertically = false;

  /**
   * @ngdoc boolean
   * @name isScrollingHorizontally
   * @propertyOf ui.grid.class:Grid
   * @description set to true when Grid is scrolling horizontally. Set to false via debounced method
   */
  self.isScrollingHorizontally = false;

  var debouncedVertical = gridUtil.debounce(function () {
    self.isScrollingVertically = false;
  }, 300);

  var debouncedHorizontal = gridUtil.debounce(function () {
    self.isScrollingHorizontally = false;
  }, 300);


  /**
   * @ngdoc function
   * @name flagScrollingVertically
   * @methodOf ui.grid.class:Grid
   * @description sets isScrollingVertically to true and sets it to false in a debounced function
   */
  self.flagScrollingVertically = function() {
    self.isScrollingVertically = true;
    debouncedVertical();
  };

  /**
   * @ngdoc function
   * @name flagScrollingHorizontally
   * @methodOf ui.grid.class:Grid
   * @description sets isScrollingHorizontally to true and sets it to false in a debounced function
   */
  self.flagScrollingHorizontally = function() {
    self.isScrollingHorizontally = true;
    debouncedHorizontal();
  };



  self.api = new GridApi(self);

  /**
   * @ngdoc function
   * @name refresh
   * @methodOf ui.grid.core.api:PublicApi
   * @description Refresh the rendered grid on screen.
   * 
   */
  self.api.registerMethod( 'core', 'refresh', this.refresh );

  /**
   * @ngdoc function
   * @name refreshRows
   * @methodOf ui.grid.core.api:PublicApi
   * @description Refresh the rendered grid on screen?  Note: not functional at present
   * @returns {promise} promise that is resolved when render completes?
   * 
   */
  self.api.registerMethod( 'core', 'refreshRows', this.refreshRows );

  /**
   * @ngdoc function
   * @name handleWindowResize
   * @methodOf ui.grid.core.api:PublicApi
   * @description Trigger a grid resize, normally this would be picked
   * up by a watch on window size, but in some circumstances it is necessary
   * to call this manually
   * @returns {promise} promise that is resolved when render completes?
   * 
   */
  self.api.registerMethod( 'core', 'handleWindowResize', this.handleWindowResize );


  /**
   * @ngdoc function
   * @name addRowHeaderColumn
   * @methodOf ui.grid.core.api:PublicApi
   * @description adds a row header column to the grid
   * @param {object} column def
   * 
   */
  self.api.registerMethod( 'core', 'addRowHeaderColumn', this.addRowHeaderColumn );


  /**
   * @ngdoc function
   * @name sortHandleNulls
   * @methodOf ui.grid.core.api:PublicApi
   * @description A null handling method that can be used when building custom sort
   * functions
   * @example
   * <pre>
   *   mySortFn = function(a, b) {
   *   var nulls = $scope.gridApi.core.sortHandleNulls(a, b);
   *   if ( nulls !== null ){
   *     return nulls;
   *   } else {
   *     // your code for sorting here
   *   };
   * </pre>
   * @param {object} a sort value a
   * @param {object} b sort value b
   * @returns {number} null if there were no nulls/undefineds, otherwise returns
   * a sort value that should be passed back from the sort function
   * 
   */
  self.api.registerMethod( 'core', 'sortHandleNulls', rowSorter.handleNulls );


  /**
   * @ngdoc function
   * @name sortChanged
   * @methodOf  ui.grid.core.api:PublicApi
   * @description The sort criteria on one or more columns has
   * changed.  Provides as parameters the grid and the output of
   * getColumnSorting, which is an array of gridColumns
   * that have sorting on them, sorted in priority order. 
   * 
   * @param {Grid} grid the grid
   * @param {array} sortColumns an array of columns with 
   * sorts on them, in priority order
   * 
   * @example
   * <pre>
   *      gridApi.core.on.sortChanged( grid, sortColumns );
   * </pre>
   */
  self.api.registerEvent( 'core', 'sortChanged' );

  /**
   * @ngdoc method
   * @name notifyDataChange
   * @methodOf ui.grid.core.api:PublicApi
   * @description Notify the grid that a data or config change has occurred,
   * where that change isn't something the grid was otherwise noticing.  This 
   * might be particularly relevant where you've changed values within the data
   * and you'd like cell classes to be re-evaluated, or changed config within 
   * the columnDef and you'd like headerCellClasses to be re-evaluated.
   * @param {Grid} grid the grid
   * @param {string} type one of the 
   * uiGridConstants.dataChange values (ALL, ROW, EDIT, COLUMN), which tells
   * us which refreshes to fire.
   * 
   */
  self.api.registerMethod( 'core', 'notifyDataChange', this.notifyDataChange );
  
  self.registerDataChangeCallback( self.columnRefreshCallback, [uiGridConstants.dataChange.COLUMN]);
};

    /**
     * @ngdoc function
     * @name isRTL
     * @methodOf ui.grid.class:Grid
     * @description Returns true if grid is RightToLeft
     */
    Grid.prototype.isRTL = function () {
      return this.rtl;
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
   * @param {function(row, gridOptions)} rowBuilder function to be called
   */
  Grid.prototype.registerRowBuilder = function registerRowBuilder(rowBuilder) {
    this.rowBuilders.push(rowBuilder);
  };


  /**
   * @ngdoc function
   * @name registerDataChangeCallback
   * @methodOf ui.grid.class:Grid
   * @description When a data change occurs, the data change callbacks of the specified type
   * will be called.  The rules are:
   * 
   * - when the data watch fires, that is considered a ROW change (the data watch only notices
   *   added or removed rows)
   * - when the api is called to inform us of a change, the declared type of that change is used
   * - when a cell edit completes, the EDIT callbacks are triggered
   * - when the columnDef watch fires, the COLUMN callbacks are triggered
   * 
   * For a given event:
   * - ALL calls ROW, EDIT, COLUMN and ALL callbacks
   * - ROW calls ROW and ALL callbacks
   * - EDIT calls EDIT and ALL callbacks
   * - COLUMN calls COLUMN and ALL callbacks
   * 
   * @param {function(grid)} callback function to be called
   * @param {array} types the types of data change you want to be informed of.  Values from 
   * the uiGridConstants.dataChange values ( ALL, EDIT, ROW, COLUMN ).  Optional and defaults to
   * ALL 
   * @returns {string} uid of the callback, can be used to deregister it again
   */
  Grid.prototype.registerDataChangeCallback = function registerDataChangeCallback(callback, types) {
    var uid = gridUtil.nextUid();
    if ( !types ){
      types = [uiGridConstants.dataChange.ALL];
    }
    if ( !Array.isArray(types)){
      gridUtil.logError("Expected types to be an array or null in registerDataChangeCallback, value passed was: " + types );
    }
    this.dataChangeCallbacks[uid] = { callback: callback, types: types };
    return uid;
  };

  /**
   * @ngdoc function
   * @name deregisterDataChangeCallback
   * @methodOf ui.grid.class:Grid
   * @description Delete the callback identified by the id.
   * @param {string} uid the uid of the function that is to be deregistered
   */
  Grid.prototype.deregisterDataChangeCallback = function deregisterDataChangeCallback(uid) {
    delete this.dataChangeCallbacks[uid];
  };

  /**
   * @ngdoc function
   * @name callDataChangeCallbacks
   * @methodOf ui.grid.class:Grid
   * @description Calls the callbacks based on the type of data change that
   * has occurred. Always calls the ALL callbacks, calls the ROW, EDIT, and COLUMN callbacks if the 
   * event type is matching, or if the type is ALL.
   * @param {number} type the type of event that occurred - one of the 
   * uiGridConstants.dataChange values (ALL, ROW, EDIT, COLUMN)
   */
  Grid.prototype.callDataChangeCallbacks = function callDataChangeCallbacks(type, options) {
    angular.forEach( this.dataChangeCallbacks, function( callback, uid ){
      if ( callback.types.indexOf( uiGridConstants.dataChange.ALL ) !== -1 ||
           callback.types.indexOf( type ) !== -1 ||
           type === uiGridConstants.dataChange.ALL ) {
        callback.callback( this );
      }
    }, this);
  };
  
  /**
   * @ngdoc function
   * @name notifyDataChange
   * @methodOf ui.grid.class:Grid
   * @description Notifies us that a data change has occurred, used in the public
   * api for users to tell us when they've changed data or some other event that 
   * our watches cannot pick up
   * @param {Grid} grid the grid
   * @param {string} type the type of event that occurred - one of the 
   * uiGridConstants.dataChange values (ALL, ROW, EDIT, COLUMN)
   */
  Grid.prototype.notifyDataChange = function notifyDataChange(grid, type) {
    var constants = uiGridConstants.dataChange;
    if ( type === constants.ALL || 
         type === constants.COLUMN ||
         type === constants.EDIT ||
         type === constants.ROW ){
      grid.callDataChangeCallbacks( type );
    } else {
      gridUtil.logError("Notified of a data change, but the type was not recognised, so no action taken, type was: " + type);
    }
  };
  
  
  /**
   * @ngdoc function
   * @name columnRefreshCallback
   * @methodOf ui.grid.class:Grid
   * @description refreshes the grid when a column refresh
   * is notified, which triggers handling of the visible flag 
   * @param {string} name column name
   */
  Grid.prototype.columnRefreshCallback = function columnRefreshCallback( grid ){
    grid.refresh();
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
  /**
   * @ngdoc property
   * @name type
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description the type of the column, used in sorting.  If not provided then the 
   * grid will guess the type.  Add this only if the grid guessing is not to your
   * satisfaction.  Refer to {@link ui.grid.service:GridUtil.guessType gridUtil.guessType} for
   * a list of values the grid knows about.
   *
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
          gridUtil.logWarn('Unable to assign type from data, so defaulting to string');
          colDef.type = 'string';
        }
      }
    });
  };

  /**
  * @ngdoc function
  * @name addRowHeaderColumn
  * @methodOf ui.grid.class:Grid
  * @description adds a row header column to the grid
  * @param {object} column def
  */
  Grid.prototype.addRowHeaderColumn = function addRowHeaderColumn(colDef) {
    var self = this;
    //self.createLeftContainer();
    var rowHeaderCol = new GridColumn(colDef, self.rowHeaderColumns.length, self);
    rowHeaderCol.isRowHeader = true;
    if (self.isRTL()) {
      self.createRightContainer();
      rowHeaderCol.renderContainer = 'right';
    }
    else {
      self.createLeftContainer();
      rowHeaderCol.renderContainer = 'left';
    }

    // relies on the default column builder being first in array, as it is instantiated
    // as part of grid creation
    self.columnBuilders[0](colDef,rowHeaderCol,self.options)
      .then(function(){
        rowHeaderCol.enableFiltering = false;
        rowHeaderCol.enableSorting = false;
        rowHeaderCol.enableHiding = false;
        self.rowHeaderColumns.push(rowHeaderCol);
        self.buildColumns()
          .then( function() {
            self.preCompileCellTemplates();
            self.handleWindowResize();
          });
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
    // gridUtil.logDebug('buildColumns');
    var self = this;
    var builderPromises = [];
    var headerOffset = self.rowHeaderColumns.length;
    var i;

    // Remove any columns for which a columnDef cannot be found
    // Deliberately don't use forEach, as it doesn't like splice being called in the middle
    // Also don't cache columns.length, as it will change during this operation
    for (i = 0; i < self.columns.length; i++){
      if (!self.getColDef(self.columns[i].name)) {
        self.columns.splice(i, 1);
        i--;
      }
    }

    //add row header columns to the grid columns array _after_ columns without columnDefs have been removed
    self.rowHeaderColumns.forEach(function (rowHeaderColumn) {
      self.columns.unshift(rowHeaderColumn);
    });


    // look at each column def, and update column properties to match.  If the column def
    // doesn't have a column, then splice in a new gridCol
    self.options.columnDefs.forEach(function (colDef, index) {
      self.preprocessColDef(colDef);
      var col = self.getColumn(colDef.name);

      if (!col) {
        col = new GridColumn(colDef, gridUtil.nextUid(), self);
        self.columns.splice(index + headerOffset, 0, col);
      }
      else {
        col.updateColumnDef(colDef);
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
    var self = this;
    this.columns.forEach(function (col) {
      var html = col.cellTemplate.replace(uiGridConstants.MODEL_COL_FIELD, self.getQualifiedColField(col));
      html = html.replace(uiGridConstants.COL_FIELD, 'grid.getCellValue(row, col)');


      var compiledElementFn = $compile(html);
      col.compiledElementFn = compiledElementFn;

      if (col.compiledElementFnDefer) {
        col.compiledElementFnDefer.resolve(col.compiledElementFn);
      }
    });
  };

  /**
   * @ngdoc function
   * @name getGridQualifiedColField
   * @methodOf ui.grid.class:Grid
   * @description Returns the $parse-able accessor for a column within its $scope
   * @param {GridColumn} col col object
   */
  Grid.prototype.getQualifiedColField = function (col) {
    return 'row.entity.' + gridUtil.preEval(col.field);
  };

  /**
   * @ngdoc function
   * @name createLeftContainer
   * @methodOf ui.grid.class:Grid
   * @description creates the left render container if it doesn't already exist
   */
  Grid.prototype.createLeftContainer = function() {
    if (!this.hasLeftContainer()) {
      this.renderContainers.left = new GridRenderContainer('left', this, { disableColumnOffset: true });
    }
  };

  /**
   * @ngdoc function
   * @name createRightContainer
   * @methodOf ui.grid.class:Grid
   * @description creates the right render container if it doesn't already exist
   */
  Grid.prototype.createRightContainer = function() {
    if (!this.hasRightContainer()) {
      this.renderContainers.right = new GridRenderContainer('right', this, { disableColumnOffset: true });
    }
  };

  /**
   * @ngdoc function
   * @name hasLeftContainer
   * @methodOf ui.grid.class:Grid
   * @description returns true if leftContainer exists
   */
  Grid.prototype.hasLeftContainer = function() {
    return this.renderContainers.left !== undefined;
  };

  /**
   * @ngdoc function
   * @name hasLeftContainer
   * @methodOf ui.grid.class:Grid
   * @description returns true if rightContainer exists
   */
  Grid.prototype.hasRightContainer = function() {
    return this.renderContainers.right !== undefined;
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
    for (var i = 0; i < n.length; i++) {
      var nV = nAccessor ? n[i][nAccessor] : n[i];
      
      var found = false;
      for (var j = 0; j < o.length; j++) {
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
        rowhash,
        found,
        newRow;
    if ((self.options.useExternalSorting || self.getColumnSorting().length === 0) && newRawData.length > 0) {
        var oldRowHash = self.rowHashMap;
        if (!oldRowHash) {
           oldRowHash = {get: function(){return null;}};
        }
        self.createRowHashMap();
        rowhash = self.rowHashMap;
        var wasEmpty = self.rows.length === 0;
        self.rows.length = 0;
        for (i = 0; i < newRawData.length; i++) {
            var newRawRow = newRawData[i];
            found = oldRowHash.get(newRawRow);
            if (found) {
              newRow = found.row; 
            }
            else {
              newRow = self.processRowBuilders(new GridRow(newRawRow, i, self));
            }
            self.rows.push(newRow);
            rowhash.put(newRawRow, {
                i: i,
                entity: newRawRow,
                row:newRow
            });
        }
        //now that we have data, it is save to assign types to colDefs
        if (wasEmpty) {
           self.assignTypes();
        }
    } else {
    if (self.rows.length === 0 && newRawData.length > 0) {
      if (self.options.enableRowHashing) {
        if (!self.rowHashMap) {
          self.createRowHashMap();
        }

        for (i = 0; i < newRawData.length; i++) {
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
        rowhash = self.rowHashMap;
        
        // Make sure every new row has a hash
        for (i = 0; i < newRawData.length; i++) {
          newRow = newRawData[i];

          // Flag this row as needing to be manually found if it didn't come in with a $$hashKey
          var mustFind = false;
          if (!self.options.getRowIdentity(newRow)) {
            mustFind = true;
          }

          // See if the new row is already in the rowhash
          found = rowhash.get(newRow);
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
    for (var i = 0; i < newRawData.length; i++) {
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
    // gridUtil.logDebug('setVisibleRows');

    var self = this;

    //var newVisibleRowCache = [];

    // Reset all the render container row caches
    for (var i in self.renderContainers) {
      var container = self.renderContainers[i];

      container.visibleRowCache.length = 0;
    }
    
    // rows.forEach(function (row) {
    for (var ri = 0; ri < rows.length; ri++) {
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
    // gridUtil.logDebug('setVisibleColumns');

    var self = this;

    // Reset all the render container row caches
    for (var i in self.renderContainers) {
      var container = self.renderContainers[i];

      container.visibleColumnCache.length = 0;
    }

    for (var ci = 0; ci < columns.length; ci++) {
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

  /**
   * @ngdoc function
   * @name handleWindowResize
   * @methodOf ui.grid.class:Grid
   * @description Triggered when the browser window resizes; automatically resizes the grid
   */
  Grid.prototype.handleWindowResize = function handleWindowResize($event) {
    var self = this;

    self.gridWidth = gridUtil.elementWidth(self.element);
    self.gridHeight = gridUtil.elementHeight(self.element);

    self.queueRefresh();
  };

  /**
   * @ngdoc function
   * @name queueRefresh
   * @methodOf ui.grid.class:Grid
   * @description todo: @c0bra can you document this method?
   */
  Grid.prototype.queueRefresh = function queueRefresh() {
    var self = this;
    if (self.refreshCanceller) {
      $timeout.cancel(self.refreshCanceller);
    }

    self.refreshCanceller = $timeout(function () {
      self.refreshCanvas(true);
    });

    self.refreshCanceller.then(function () {
      self.refreshCanceller = null;
    });

    return self.refreshCanceller;
  };

  /**
   * @ngdoc function
   * @name buildStyles
   * @methodOf ui.grid.class:Grid
   * @description calls each styleComputation function
   */
  // TODO: this used to take $scope, but couldn't see that it was used
  Grid.prototype.buildStyles = function buildStyles() {
    // gridUtil.logDebug('buildStyles');

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
        // this used to provide $scope as a second parameter, but I couldn't find any 
        // style builders that used it, so removed it as part of moving to grid from controller
        var ret = compInfo.func.call(self);

        if (angular.isString(ret)) {
          self.customStyles += '\n' + ret;
        }
      });
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

    // gridUtil.logDebug('viewPortHeight', viewPortHeight);

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

    // gridUtil.logDebug('getviewPortWidth', viewPortWidth);

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


  Grid.prototype.searchRows = function searchRows(renderableRows) {
    return rowSearcher.search(this, renderableRows, this.columns);
  };

  Grid.prototype.sortByColumn = function sortByColumn(renderableRows) {
    return rowSorter.sort(this, renderableRows, this.columns);
  };

  /**
   * @ngdoc function
   * @name getCellValue
   * @methodOf ui.grid.class:Grid
   * @description Gets the value of a cell for a particular row and column
   * @param {GridRow} row Row to access
   * @param {GridColumn} col Column to access
   */
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

    var sortedCols = [], myCols;

    // Iterate through all the columns, sorted by priority
    // Make local copy of column list, because sorting is in-place and we do not want to
    // change the original sequence of columns
    myCols = self.columns.slice(0);
    myCols.sort(rowSorter.prioritySort).forEach(function (col) {
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
   * Emits the sortChanged event whenever the sort criteria are changed.
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
        if ( column.colDef && column.colDef.suppressRemoveSort ){
          column.sort.direction = uiGridConstants.ASC;
        } else {
          column.sort.direction = null;
        }
      }
      else {
        column.sort.direction = uiGridConstants.ASC;
      }
    }
    else {
      column.sort.direction = direction;
    }
    
    self.api.core.raise.sortChanged( self, self.getColumnSorting() );

    return $q.when(column);
  };
  
  /**
   * communicate to outside world that we are done with initial rendering
   */
  Grid.prototype.renderingComplete = function(){
    if (angular.isFunction(this.options.onRegisterApi)) {
      this.options.onRegisterApi(this.api);
    }
    this.api.core.raise.renderingComplete( this.api );
  };

  Grid.prototype.createRowHashMap = function createRowHashMap() {
    var self = this;

    var hashMap = new RowHashMap();
    hashMap.grid = self;

    self.rowHashMap = hashMap;
  };
  
  
  /**
   * @ngdoc function
   * @name refresh
   * @methodOf ui.grid.class:Grid
   * @description Refresh the rendered grid on screen.
   * 
   */
  Grid.prototype.refresh = function refresh() {
    // gridUtil.logDebug('grid refresh');
    
    var self = this;
    
    var p1 = self.processRowsProcessors(self.rows).then(function (renderableRows) {
      self.setVisibleRows(renderableRows);
    });

    var p2 = self.processColumnsProcessors(self.columns).then(function (renderableColumns) {
      self.setVisibleColumns(renderableColumns);
    });

    return $q.all([p1, p2]).then(function () {
      self.redrawInPlace();

      self.refreshCanvas(true);
    });
  };  
  
  /**
   * @ngdoc function
   * @name refreshRows
   * @methodOf ui.grid.class:Grid
   * @description Refresh the rendered rows on screen?  Note: not functional at present 
   * @returns {promise} promise that is resolved when render completes?
   * 
   */
  Grid.prototype.refreshRows = function refreshRows() {
    var self = this;
    
    return self.processRowsProcessors(self.rows)
      .then(function (renderableRows) {
        self.setVisibleRows(renderableRows);

        // TODO: this method doesn't exist, so clearly refreshRows doesn't work.
        self.redrawRows();

        self.refreshCanvas();
      });
  };

  /**
   * @ngdoc function
   * @name redrawCanvas
   * @methodOf ui.grid.class:Grid
   * @description TBD
   * @params {object} buildStyles optional parameter.  Use TBD
   * @returns {promise} promise that is resolved when the canvas
   * has been refreshed
   * 
   */
  Grid.prototype.refreshCanvas = function(buildStyles) {
    var self = this;
    
    if (buildStyles) {
      self.buildStyles();
    }

    var p = $q.defer();

    // Get all the header heights
    var containerHeadersToRecalc = [];
    for (var containerId in self.renderContainers) {
      if (self.renderContainers.hasOwnProperty(containerId)) {
        var container = self.renderContainers[containerId];

        if (container.header) {
          containerHeadersToRecalc.push(container);
        }
      }
    }

    if (containerHeadersToRecalc.length > 0) {
      // Putting in a timeout as it's not calculating after the grid element is rendered and filled out
      $timeout(function() {
        // var oldHeaderHeight = self.grid.headerHeight;
        // self.grid.headerHeight = gridUtil.outerElementHeight(self.header);

        var rebuildStyles = false;

        // Get all the header heights
        var maxHeight = 0;
        var i, container;
        for (i = 0; i < containerHeadersToRecalc.length; i++) {
          container = containerHeadersToRecalc[i];

          if (container.header) {
            var oldHeaderHeight = container.headerHeight;
            var headerHeight = gridUtil.outerElementHeight(container.header);

            container.headerHeight = parseInt(headerHeight, 10);

            if (oldHeaderHeight !== headerHeight) {
              rebuildStyles = true;
            }

            // Get the "inner" header height, that is the height minus the top and bottom borders, if present. We'll use it to make sure all the headers have a consistent height
            var topBorder = gridUtil.getBorderSize(container.header, 'top');
            var bottomBorder = gridUtil.getBorderSize(container.header, 'bottom');
            var innerHeaderHeight = parseInt(headerHeight - topBorder - bottomBorder, 10);

            innerHeaderHeight  = innerHeaderHeight < 0 ? 0 : innerHeaderHeight;

            container.innerHeaderHeight = innerHeaderHeight;

            // Save the largest header height for use later
            if (innerHeaderHeight > maxHeight) {
              maxHeight = innerHeaderHeight;
            }
          }
        }

        // Go through all the headers
        for (i = 0; i < containerHeadersToRecalc.length; i++) {
          container = containerHeadersToRecalc[i];

          // If this header's height is less than another header's height, then explicitly set it so they're the same and one isn't all offset and weird looking
          if (container.headerHeight < maxHeight) {
            container.explicitHeaderHeight = maxHeight;
          }
        }

        // Rebuild styles if the header height has changed
        //   The header height is used in body/viewport calculations and those are then used in other styles so we need it to be available
        if (buildStyles && rebuildStyles) {
          self.buildStyles();
        }

        p.resolve();
      });
    }
    else {
      // Timeout still needs to be here to trigger digest after styles have been rebuilt
      $timeout(function() {
        p.resolve();
      });
    }

    return p.promise;
  };


  /**
   * @ngdoc function
   * @name redrawCanvas
   * @methodOf ui.grid.class:Grid
   * @description Redraw the rows and columns based on our current scroll position
   * 
   */
  Grid.prototype.redrawInPlace = function redrawInPlace() {
    // gridUtil.logDebug('redrawInPlace');
    
    var self = this;

    for (var i in self.renderContainers) {
      var container = self.renderContainers[i];

      // gridUtil.logDebug('redrawing container', i);

      container.adjustRows(container.prevScrollTop, null);
      container.adjustColumns(container.prevScrollLeft, null);
    }
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
