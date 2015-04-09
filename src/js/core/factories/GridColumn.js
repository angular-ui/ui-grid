(function(){

angular.module('ui.grid')
.factory('GridColumn', ['gridUtil', 'uiGridConstants', 'i18nService', function(gridUtil, uiGridConstants, i18nService) {

  /**
   * @ngdoc function
   * @name ui.grid.class:GridColumn
   * @description Represents the viewModel for each column.  Any state or methods needed for a Grid Column
   * are defined on this prototype
   * @param {ColDef} colDef Column definition.
   * @param {number} index the current position of the column in the array
   * @param {Grid} grid reference to the grid
   */
   
  /**
   * ******************************************************************************************
   * PaulL1: Ugly hack here in documentation.  These properties are clearly properties of GridColumn, 
   * and need to be noted as such for those extending and building ui-grid itself.
   * However, from an end-developer perspective, they interact with all these through columnDefs,
   * and they really need to be documented there.  I feel like they're relatively static, and
   * I can't find an elegant way for ngDoc to reference to both....so I've duplicated each
   * comment block.  Ugh.
   * 
   */

  /** 
   * @ngdoc property
   * @name name
   * @propertyOf ui.grid.class:GridColumn
   * @description (mandatory) each column should have a name, although for backward
   * compatibility with 2.x name can be omitted if field is present
   *
   */

  /** 
   * @ngdoc property
   * @name name
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description (mandatory) each column should have a name, although for backward
   * compatibility with 2.x name can be omitted if field is present
   *
   */
    
  /** 
   * @ngdoc property
   * @name displayName
   * @propertyOf ui.grid.class:GridColumn
   * @description Column name that will be shown in the header.  If displayName is not
   * provided then one is generated using the name.
   *
   */

  /** 
   * @ngdoc property
   * @name displayName
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description Column name that will be shown in the header.  If displayName is not
   * provided then one is generated using the name.
   *
   */
       
  /** 
   * @ngdoc property
   * @name field
   * @propertyOf ui.grid.class:GridColumn
   * @description field must be provided if you wish to bind to a 
   * property in the data source.  Should be an angular expression that evaluates against grid.options.data 
   * array element.  Can be a complex expression: <code>employee.address.city</code>, or can be a function: <code>employee.getFullAddress()</code>.
   * See the angular docs on binding expressions.
   *
   */
    
  /** 
   * @ngdoc property
   * @name field
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description field must be provided if you wish to bind to a 
   * property in the data source.  Should be an angular expression that evaluates against grid.options.data 
   * array element.  Can be a complex expression: <code>employee.address.city</code>, or can be a function: <code>employee.getFullAddress()</code>.    * See the angular docs on binding expressions.    *
   */
    
  /** 
   * @ngdoc property
   * @name filter
   * @propertyOf ui.grid.class:GridColumn
   * @description Filter on this column.  
   * @example
   * <pre>{ term: 'text', condition: uiGridConstants.filter.STARTS_WITH, placeholder: 'type to filter...', flags: { caseSensitive: false }, type: uiGridConstants.filter.SELECT, [ { value: 1, label: 'male' }, { value: 2, label: 'female' } ] }</pre>
   *
   */
    
  /**
   * @ngdoc method
   * @methodOf ui.grid.class:GridColumn
   * @name GridColumn
   * @description Initializes a gridColumn
   * @param {ColumnDef} colDef the column def to associate with this column
   * @param {number} uid the unique and immutable uid we'd like to allocate to this column
   * @param {Grid} grid the grid we'd like to create this column in
   */ 
  function GridColumn(colDef, uid, grid) {
    var self = this;

    self.grid = grid;
    self.uid = uid;

    self.updateColumnDef(colDef, true);

    /**
     * @ngdoc function
     * @name hideColumn
     * @methodOf ui.grid.class:GridColumn
     * @description Hides the column by setting colDef.visible = false
     */
    GridColumn.prototype.hideColumn = function() {
      this.colDef.visible = false;
    };

    self.aggregationValue = undefined;

    var updateAggregationValue = function() {

     // gridUtil.logDebug('getAggregationValue for Column ' + self.colDef.name);

      if (!self.aggregationType) {
        self.aggregationValue = undefined;
        return;
      }

      var result = 0;
      var visibleRows = self.grid.getVisibleRows();

      var cellValues = function(){
        var values = [];
        visibleRows.forEach(function (row) {
          var cellValue = self.grid.getCellValue(row, self);
          var cellNumber = Number(cellValue);
          if (!isNaN(cellNumber)) {
            values.push(cellNumber);
          }
        });
        return values;
      };

      if (angular.isFunction(self.aggregationType)) {
        self.aggregationValue = self.aggregationType(visibleRows, self);
      }
      else if (self.aggregationType === uiGridConstants.aggregationTypes.count) {
        self.aggregationValue = self.grid.getVisibleRowCount();
      }
      else if (self.aggregationType === uiGridConstants.aggregationTypes.sum) {
        cellValues().forEach(function (value) {
          result += value;
        });
        self.aggregationValue = result;
      }
      else if (self.aggregationType === uiGridConstants.aggregationTypes.avg) {
        cellValues().forEach(function (value) {
          result += value;
        });
        result = result / cellValues().length;
        self.aggregationValue = result;
      }
      else if (self.aggregationType === uiGridConstants.aggregationTypes.min) {
        self.aggregationValue = Math.min.apply(null, cellValues());
      }
      else if (self.aggregationType === uiGridConstants.aggregationTypes.max) {
        self.aggregationValue = Math.max.apply(null, cellValues());
      }
      else {
        self.aggregationValue = '\u00A0';
      }
    };

    var throttledUpdateAggregationValue = gridUtil.throttle(updateAggregationValue, self.grid.options.aggregationCalcThrottle);




    /**
     * @ngdoc function
     * @name getAggregationValue
     * @methodOf ui.grid.class:GridColumn
     * @description gets the aggregation value based on the aggregation type for this column.
     * Debounced using scrollDebounce option setting
     */
    this.getAggregationValue =  function() {
      if (!self.grid.isScrollingVertically && !self.grid.isScrollingHorizontally) {
        throttledUpdateAggregationValue();
      }

      return self.aggregationValue;
    } ;



  }


  /**
   * @ngdoc method
   * @methodOf ui.grid.class:GridColumn
   * @name setPropertyOrDefault
   * @description Sets a property on the column using the passed in columnDef, and
   * setting the defaultValue if the value cannot be found on the colDef
   * @param {ColumnDef} colDef the column def to look in for the property value
   * @param {string} propName the property name we'd like to set
   * @param {object} defaultValue the value to use if the colDef doesn't provide the setting
   */ 
  GridColumn.prototype.setPropertyOrDefault = function (colDef, propName, defaultValue) {
    var self = this;

    // Use the column definition filter if we were passed it
    if (typeof(colDef[propName]) !== 'undefined' && colDef[propName]) {
      self[propName] = colDef[propName];
    }
    // Otherwise use our own if it's set
    else if (typeof(self[propName]) !== 'undefined') {
      self[propName] = self[propName];
    }
    // Default to empty object for the filter
    else {
      self[propName] = defaultValue ? defaultValue : {};
    }
  };

  
  
  /** 
   * @ngdoc property
   * @name width
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description sets the column width.  Can be either 
   * a number or a percentage, or an * for auto.
   * @example
   * <pre>  $scope.gridOptions.columnDefs = [ { field: 'field1', width: 100},
   *                                          { field: 'field2', width: '20%'},
   *                                          { field: 'field3', width: '*' }]; </pre>
   *
   */

  /** 
   * @ngdoc property
   * @name minWidth
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description sets the minimum column width.  Should be a number.
   * @example
   * <pre>  $scope.gridOptions.columnDefs = [ { field: 'field1', minWidth: 100}]; </pre>
   *
   */

  /** 
   * @ngdoc property
   * @name maxWidth
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description sets the maximum column width.  Should be a number.
   * @example
   * <pre>  $scope.gridOptions.columnDefs = [ { field: 'field1', maxWidth: 100}]; </pre>
   *
   */

  /** 
   * @ngdoc property
   * @name visible
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description sets whether or not the column is visible
   * </br>Default is true
   * @example
   * <pre>  $scope.gridOptions.columnDefs = [ 
   *     { field: 'field1', visible: true},
   *     { field: 'field2', visible: false }
   *   ]; </pre>
   *
   */
   
  /**
   * @ngdoc property
   * @name sort
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description Can be used to set the sort direction for the column, values are
   * uiGridConstants.ASC or uiGridConstants.DESC
   * @example
   * <pre>  $scope.gridOptions.columnDefs = [ { field: 'field1', sort: { direction: uiGridConstants.ASC }}] </pre>
   */
  

  /** 
   * @ngdoc property
   * @name sortingAlgorithm
   * @propertyOf ui.grid.class:GridColumn
   * @description Algorithm to use for sorting this column. Takes 'a' and 'b' parameters 
   * like any normal sorting function.
   *
   */

  /** 
   * @ngdoc property
   * @name sortingAlgorithm
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description Algorithm to use for sorting this column. Takes 'a' and 'b' parameters 
   * like any normal sorting function.
   *
   */
      
  /** 
   * @ngdoc array
   * @name filters
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description Specify multiple filter fields.
   * @example
   * <pre>$scope.gridOptions.columnDefs = [ 
   *   {
   *     field: 'field1', filters: [
   *       {
   *         term: 'aa',
   *         condition: uiGridConstants.filter.STARTS_WITH,
   *         placeholder: 'starts with...',
   *         flags: { caseSensitive: false },
   *         type: uiGridConstants.filter.SELECT,
   *         selectOptions: [ { value: 1, label: 'male' }, { value: 2, label: 'female' } ]
   *       },
   *       {
   *         condition: uiGridConstants.filter.ENDS_WITH,
   *         placeholder: 'ends with...'
   *       }
   *     ]
   *   }
   * ]; </pre>
   *
   * 
   */ 
   
  /** 
   * @ngdoc array
   * @name filters
   * @propertyOf ui.grid.class:GridColumn
   * @description Filters for this column. Includes 'term' property bound to filter input elements.
   * @example
   * <pre>[
   *   {
   *     term: 'foo', // ngModel for <input>
   *     condition: uiGridConstants.filter.STARTS_WITH,
   *     placeholder: 'starts with...',
   *     flags: { caseSensitive: false },
   *     type: uiGridConstants.filter.SELECT,
   *     selectOptions: [ { value: 1, label: 'male' }, { value: 2, label: 'female' } ]
   *   },
   *   {
   *     term: 'baz',
   *     condition: uiGridConstants.filter.ENDS_WITH,
   *     placeholder: 'ends with...'
   *   }
   * ] </pre>
   *
   * 
   */   

  /** 
   * @ngdoc array
   * @name menuItems
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description used to add menu items to a column.  Refer to the tutorial on this 
   * functionality.  A number of settings are supported:
   * 
   * - title: controls the title that is displayed in the menu
   * - icon: the icon shown alongside that title
   * - action: the method to call when the menu is clicked
   * - shown: a function to evaluate to determine whether or not to show the item
   * - active: a function to evaluate to determine whether or not the item is currently selected
   * - context: context to pass to the action function, available in this.context in your handler
   * - leaveOpen: if set to true, the menu should stay open after the action, defaults to false
   * @example
   * <pre>  $scope.gridOptions.columnDefs = [ 
   *   { field: 'field1', menuItems: [
   *     {
   *       title: 'Outer Scope Alert',
   *       icon: 'ui-grid-icon-info-circled',
   *       action: function($event) {
   *         this.context.blargh(); // $scope.blargh() would work too, this is just an example
   *       },
   *       shown: function() { return true; },
   *       active: function() { return true; },
   *       context: $scope
   *     },
   *     {
   *       title: 'Grid ID',
   *       action: function() {
   *         alert('Grid ID: ' + this.grid.id);
   *       }
   *     }
   *   ] }]; </pre>
   *
   */   

  /**
   * @ngdoc method
   * @methodOf ui.grid.class:GridColumn
   * @name updateColumnDef
   * @description Moves settings from the columnDef down onto the column,
   * and sets properties as appropriate
   * @param {ColumnDef} colDef the column def to look in for the property value
   * @param {boolean} isNew whether the column is being newly created, if not
   * we're updating an existing column, and some items such as the sort shouldn't
   * be copied down
   */ 
  GridColumn.prototype.updateColumnDef = function(colDef, isNew) {
    var self = this;

    self.colDef = colDef;

    if (colDef.name === undefined) {
      throw new Error('colDef.name is required for column at index ' + self.grid.options.columnDefs.indexOf(colDef));
    }

    self.displayName = (colDef.displayName === undefined) ? gridUtil.readableColumnName(colDef.name) : colDef.displayName;
    
    var parseErrorMsg = "Cannot parse column width '" + colDef.width + "' for column named '" + colDef.name + "'";

    // If width is not defined, set it to a single star
    if (gridUtil.isNullOrUndefined(self.width) || !angular.isNumber(self.width)) {
      if (gridUtil.isNullOrUndefined(colDef.width)) {
        self.width = '*';
      }
      else {
        // If the width is not a number
        if (!angular.isNumber(colDef.width)) {
          // See if it ends with a percent
          if (gridUtil.endsWith(colDef.width, '%')) {
            // If so we should be able to parse the non-percent-sign part to a number
            var percentStr = colDef.width.replace(/%/g, '');
            var percent = parseInt(percentStr, 10);
            if (isNaN(percent)) {
              throw new Error(parseErrorMsg);
            }
            self.width = colDef.width;
          }
          // And see if it's a number string
          else if (colDef.width.match(/^(\d+)$/)) {
            self.width = parseInt(colDef.width.match(/^(\d+)$/)[1], 10);
          }
          // Otherwise it should be a string of asterisks
          else if (colDef.width.match(/^\*+$/)) {
            self.width = colDef.width;
          }
          // No idea, throw an Error
          else {
            throw new Error(parseErrorMsg);
          }
        }
        // Is a number, use it as the width
        else {
          self.width = colDef.width;
        }
      }
    }

    self.minWidth = !colDef.minWidth ? 30 : colDef.minWidth;
    self.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;

    //use field if it is defined; name if it is not
    self.field = (colDef.field === undefined) ? colDef.name : colDef.field;
    
    if ( typeof( self.field ) !== 'string' ){
      gridUtil.logError( 'Field is not a string, this is likely to break the code, Field is: ' + self.field );
    }
    
    self.name = colDef.name;

    // Use colDef.displayName as long as it's not undefined, otherwise default to the field name
    self.displayName = (colDef.displayName === undefined) ? gridUtil.readableColumnName(colDef.name) : colDef.displayName;

    //self.originalIndex = index;

    self.aggregationType = angular.isDefined(colDef.aggregationType) ? colDef.aggregationType : null;
    self.footerCellTemplate = angular.isDefined(colDef.footerCellTemplate) ? colDef.footerCellTemplate : null;

    /**
     * @ngdoc property
     * @name tooltip
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description Whether or not to show a tooltip when a user hovers over the cell.
     * If set to false, no tooltip.  If true, the cell value is shown in the tooltip (useful
     * if you have long values in your cells), if a function then that function is called
     * passing in the row and the col `cellTooltip( row, col )`, and the return value is shown in the tooltip.
     * 
     * Defaults to false
     *
     */
    if ( typeof(colDef.cellTooltip) === 'undefined' || colDef.cellTooltip === false ) {
      self.cellTooltip = false;
    } else if ( colDef.cellTooltip === true ){
      self.cellTooltip = function(row, col) {
        return self.grid.getCellValue( row, col );
      };
    } else {
      self.cellTooltip = colDef.cellTooltip;
    }

    /**
     * @ngdoc property
     * @name footerCellClass
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description footerCellClass can be a string specifying the class to append to a cell
     * or it can be a function(row,rowRenderIndex, col, colRenderIndex) that returns a class name
     *
     */
    self.footerCellClass = colDef.footerCellClass;

    /**
     * @ngdoc property
     * @name cellClass
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description cellClass can be a string specifying the class to append to a cell
     * or it can be a function(row,rowRenderIndex, col, colRenderIndex) that returns a class name
     *
     */
    self.cellClass = colDef.cellClass;

    /**
     * @ngdoc property
     * @name headerCellClass
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description headerCellClass can be a string specifying the class to append to a cell
     * or it can be a function(row,rowRenderIndex, col, colRenderIndex) that returns a class name
     *
     */
    self.headerCellClass = colDef.headerCellClass;

    /**
     * @ngdoc property
     * @name cellFilter
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description cellFilter is a filter to apply to the content of each cell
     * @example
     * <pre>
     *   gridOptions.columnDefs[0].cellFilter = 'date'
     *
     */
    self.cellFilter = colDef.cellFilter ? colDef.cellFilter : "";

    /**
     * @ngdoc property
     * @name headerCellFilter
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description headerCellFilter is a filter to apply to the content of the column header
     * @example
     * <pre>
     *   gridOptions.columnDefs[0].headerCellFilter = 'translate'
     *
     */
    self.headerCellFilter = colDef.headerCellFilter ? colDef.headerCellFilter : "";

    /**
     * @ngdoc property
     * @name footerCellFilter
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description footerCellFilter is a filter to apply to the content of the column footer
     * @example
     * <pre>
     *   gridOptions.columnDefs[0].footerCellFilter = 'date'
     *
     */
    self.footerCellFilter = colDef.footerCellFilter ? colDef.footerCellFilter : "";

    self.visible = gridUtil.isNullOrUndefined(colDef.visible) || colDef.visible;

    self.headerClass = colDef.headerClass;
    //self.cursor = self.sortable ? 'pointer' : 'default';

    // Turn on sorting by default
    self.enableSorting = typeof(colDef.enableSorting) !== 'undefined' ? colDef.enableSorting : true;
    self.sortingAlgorithm = colDef.sortingAlgorithm;

    /**
     * @ngdoc boolean
     * @name suppressRemoveSort
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description (optional) False by default. When enabled, this setting hides the removeSort option
     * in the menu, and prevents users from manually removing the sort
     */
    if ( typeof(self.suppressRemoveSort) === 'undefined'){
      self.suppressRemoveSort = typeof(colDef.suppressRemoveSort) !== 'undefined' ? colDef.suppressRemoveSort : false;
    }
    
    /**
     * @ngdoc property
     * @name enableFiltering
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description turn off filtering for an individual column, where
     * you've turned on filtering for the overall grid
     * @example
     * <pre>
     *   gridOptions.columnDefs[0].enableFiltering = false;
     *
     */
    // Turn on filtering by default (it's disabled by default at the Grid level)
    self.enableFiltering = typeof(colDef.enableFiltering) !== 'undefined' ? colDef.enableFiltering : true;

    // self.menuItems = colDef.menuItems;
    self.setPropertyOrDefault(colDef, 'menuItems', []);

    // Use the column definition sort if we were passed it, but only if this is a newly added column
    if ( isNew ){
      self.setPropertyOrDefault(colDef, 'sort');
    }

    // Set up default filters array for when one is not provided.
    //   In other words, this (in column def):
    //   
    //       filter: { term: 'something', flags: {}, condition: [CONDITION] }
    //       
    //   is just shorthand for this:
    //   
    //       filters: [{ term: 'something', flags: {}, condition: [CONDITION] }]
    //       
    var defaultFilters = [];
    if (colDef.filter) {
      defaultFilters.push(colDef.filter);
    }
    else if ( colDef.filters ){
      defaultFilters = colDef.filters;
    } else {
      // Add an empty filter definition object, which will
      // translate to a guessed condition and no pre-populated
      // value for the filter <input>.
      defaultFilters.push({});
    }

    /** 
     * @ngdoc property
     * @name filter
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description Specify a single filter field on this column.
     * 
     * A filter consists of a condition, a term, and a placeholder:
     * 
     * - condition defines how rows are chosen as matching the filter term. This can be set to
     * one of the constants in uiGridConstants.filter, or you can supply a custom filter function
     * that gets passed the following arguments: [searchTerm, cellValue, row, column].
     * - term: If set, the filter field will be pre-populated
     * with this value.
     * - placeholder: String that will be set to the `<input>.placeholder` attribute.
     * - noTerm: set this to true if you have defined a custom function in condition, and
     * your custom function doesn't require a term (so it can run even when the term is null)
     * - flags: only flag currently available is `caseSensitive`, set to false if you don't want
     * case sensitive matching
     * - type: defaults to uiGridConstants.filter.INPUT, which gives a text box.  If set to uiGridConstants.filter.SELECT
     * then a select box will be shown with options selectOptions
     * - selectOptions: options in the format `[ { value: 1, label: 'male' }]`.  No i18n filter is provided, you need
     * to perform the i18n on the values before you provide them
     * @example
     * <pre>$scope.gridOptions.columnDefs = [ 
     *   {
     *     field: 'field1',
     *     filter: {
     *       term: 'xx',
     *       condition: uiGridConstants.filter.STARTS_WITH,
     *       placeholder: 'starts with...',
     *       flags: { caseSensitive: false },
     *       type: uiGridConstants.filter.SELECT,
     *       selectOptions: [ { value: 1, label: 'male' }, { value: 2, label: 'female' } ]
     *     }
     *   }
     * ]; </pre>
     *
     */
  
    /*

      self.filters = [
        {
          term: 'search term'
          condition: uiGridConstants.filter.CONTAINS,
          placeholder: 'my placeholder',
          flags: {
            caseSensitive: true
          }
        }
      ]

    */

    // Only set filter if this is a newly added column, if we're updating an existing
    // column then we don't want to put the default filter back if the user may have already
    // removed it.
    // However, we do want to keep the settings if they change, just not the term
    if ( isNew ) {
      self.setPropertyOrDefault(colDef, 'filter');
      self.setPropertyOrDefault(colDef, 'filters', defaultFilters);
    } else if ( self.filters.length === defaultFilters.length ) {
      self.filters.forEach( function( filter, index ){
        if (typeof(defaultFilters[index].placeholder) !== 'undefined') {
          filter.placeholder = defaultFilters[index].placeholder;
        }
        if (typeof(defaultFilters[index].flags) !== 'undefined') {
          filter.flags = defaultFilters[index].flags;
        }
        if (typeof(defaultFilters[index].type) !== 'undefined') {
          filter.type = defaultFilters[index].type;
        }
        if (typeof(defaultFilters[index].selectOptions) !== 'undefined') {
          filter.selectOptions = defaultFilters[index].selectOptions;
        }
      });
    }

    // Remove this column from the grid sorting, include inside build columns so has
    // access to self - all seems a bit dodgy but doesn't work otherwise so have left
    // as is
    GridColumn.prototype.unsort = function () {
      this.sort = {};
      self.grid.api.core.raise.sortChanged( self, self.grid.getColumnSorting() );
    };
  
  };


  /**
   * @ngdoc function
   * @name getColClass
   * @methodOf ui.grid.class:GridColumn
   * @description Returns the class name for the column
   * @param {bool} prefixDot  if true, will return .className instead of className
   */
  GridColumn.prototype.getColClass = function (prefixDot) {
    var cls = uiGridConstants.COL_CLASS_PREFIX + this.uid;

    return prefixDot ? '.' + cls : cls;
  };

    /**
     * @ngdoc function
     * @name isPinnedLeft
     * @methodOf ui.grid.class:GridColumn
     * @description Returns true if column is in the left render container
     */
    GridColumn.prototype.isPinnedLeft = function () {
      return this.renderContainer === 'left';
    };

    /**
     * @ngdoc function
     * @name isPinnedRight
     * @methodOf ui.grid.class:GridColumn
     * @description Returns true if column is in the right render container
     */
    GridColumn.prototype.isPinnedRight = function () {
      return this.renderContainer === 'right';
    };


    /**
   * @ngdoc function
   * @name getColClassDefinition
   * @methodOf ui.grid.class:GridColumn
   * @description Returns the class definition for th column
   */
  GridColumn.prototype.getColClassDefinition = function () {
    return ' .grid' + this.grid.id + ' ' + this.getColClass(true) + ' { min-width: ' + this.drawnWidth + 'px; max-width: ' + this.drawnWidth + 'px; }';
  };

  /**
   * @ngdoc function
   * @name getRenderContainer
   * @methodOf ui.grid.class:GridColumn
   * @description Returns the render container object that this column belongs to.
   *
   * Columns will be default be in the `body` render container if they aren't allocated to one specifically.
   */
  GridColumn.prototype.getRenderContainer = function getRenderContainer() {
    var self = this;

    var containerId = self.renderContainer;

    if (containerId === null || containerId === '' || containerId === undefined) {
      containerId = 'body';
    }

    return self.grid.renderContainers[containerId];
  };

  /**
   * @ngdoc function
   * @name showColumn
   * @methodOf ui.grid.class:GridColumn
   * @description Makes the column visible by setting colDef.visible = true
   */
  GridColumn.prototype.showColumn = function() {
      this.colDef.visible = true;
  };


  /** 
   * @ngdoc property
   * @name aggregationHideLabel
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description defaults to false, if set to true hides the label text
   * in the aggregation footer, so only the value is displayed.
   *
   */
  /**
   * @ngdoc function
   * @name getAggregationText
   * @methodOf ui.grid.class:GridColumn
   * @description Gets the aggregation label from colDef.aggregationLabel if
   * specified or by using i18n, including deciding whether or not to display
   * based on colDef.aggregationHideLabel.
   *
   * @param {string} label the i18n lookup value to use for the column label
   * 
   */
  GridColumn.prototype.getAggregationText = function () {
    var self = this;
    if ( self.colDef.aggregationHideLabel ){
      return '';
    }
    else if ( self.colDef.aggregationLabel ) {
      return self.colDef.aggregationLabel;
    }
    else {
      switch ( self.colDef.aggregationType ){
        case uiGridConstants.aggregationTypes.count:
          return i18nService.getSafeText('aggregation.count');
        case uiGridConstants.aggregationTypes.sum:
          return i18nService.getSafeText('aggregation.sum');
        case uiGridConstants.aggregationTypes.avg:
          return i18nService.getSafeText('aggregation.avg');
        case uiGridConstants.aggregationTypes.min:
          return i18nService.getSafeText('aggregation.min');
        case uiGridConstants.aggregationTypes.max:
          return i18nService.getSafeText('aggregation.max');
        default:
          return '';
      }
    }
  };

  GridColumn.prototype.getCellTemplate = function () {
    var self = this;

    return self.cellTemplatePromise;
  };

  GridColumn.prototype.getCompiledElementFn = function () {
    var self = this;

    return self.compiledElementFnDefer.promise;
  };

  return GridColumn;
}]);

})();
