(function(){

angular.module('ui.grid')
.factory('GridColumn', ['gridUtil', 'uiGridConstants', function(gridUtil, uiGridConstants) {

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
    * @ngdoc property
    * @name ui.grid.class:GridColumn.name
    * @propertyOf ui.grid.class:GridColumn
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description (mandatory) each column should have a name, although for backward
    * compatibility with 2.x name can be omitted if field is present
    *
    */
    
    /** 
    * @ngdoc property
    * @name ui.grid.class:GridColumn.displayName
    * @propertyOf ui.grid.class:GridColumn
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description name is used for displayName if displayName is not
    * provided.  If provided then displayName is used in the header.
    *
    */
    
    /** 
    * @ngdoc property
    * @name ui.grid.class:GridColumn.field
    * @propertyOf ui.grid.class:GridColumn
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description field must be provided if you wish to bind to a 
    * property in the data source.  Should be an angular expression that evaluates against grid.options.data 
    * array element.  Can be a complex expression: <code>employee.address.city</code>, or can be a function: <code>employee.getFullAddress()</code>.
    * See the angular docs on binding expressions.
    *
    */
    
    /** 
    * @ngdoc property
    * @name ui.grid.class:GridColumn.filter
    * @propertyOf ui.grid.class:GridColumn
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description Filter to insert against this column.  
    * @example
    * <pre>{ term: 'text' }</pre>
    *
    */
    
   
  function GridColumn(colDef, index, grid) {
    var self = this;

    self.grid = grid;
    colDef.index = index;

    self.updateColumnDef(colDef);
  }

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
    * @name ui.grid.class:GridOptions.columnDef.width
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
    * @name ui.grid.class:GridOptions.columnDef.minWidth
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description sets the minimum column width.  Should be a number.
    * @example
    * <pre>  $scope.gridOptions.columnDefs = [ { field: 'field1', minWidth: 100}]; </pre>
    *
    */

   /** 
    * @ngdoc property
    * @name ui.grid.class:GridOptions.columnDef.maxWidth
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description sets the maximum column width.  Should be a number.
    * @example
    * <pre>  $scope.gridOptions.columnDefs = [ { field: 'field1', maxWidth: 100}]; </pre>
    *
    */

   /** 
    * @ngdoc property
    * @name ui.grid.class:GridOptions.columnDef.visible
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
   * @ngdoc constant
   * @name ui.grid.class:GridOptions.columnDef.sort
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description Can be used to set the sort direction for the column, values are
   * uiGridConstants.ASC or uiGridConstants.DESC
   * @example
   * <pre>  $scope.gridOptions.columnDefs = [ { field: 'field1', sort: { direction: uiGridConstants.ASC }}] </pre>
   */
  

    /** 
    * @ngdoc property
    * @name ui.grid.class:GridColumn.sortingAlgorithm
    * @propertyOf ui.grid.class:GridColumn
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description Algorithm to use for sorting this column. Takes 'a' and 'b' parameters 
    * like any normal sorting function.
    *
    */
      
   /** 
    * @ngdoc array
    * @name ui.grid.class:GridOptions.columnDef.filters
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description unclear what this does or how it's used, but it does something.
    *
    */   

   /** 
    * @ngdoc array
    * @name ui.grid.class:GridOptions.columnDef.menuItems
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description used to add menu items to a column.  Refer to the tutorial on this 
    * functionality.
    * @example
    * <pre>  $scope.gridOptions.columnDefs = [ 
    *   { field: 'field1', menuItems: [
    *     {
    *       title: 'Outer Scope Alert',
    *       icon: 'ui-grid-icon-info-circled',
    *       action: function($event) {
    *         this.context.blargh(); // $scope.blargh() would work too, this is just an example
    *       },
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
  GridColumn.prototype.updateColumnDef = function(colDef, index) {
    var self = this;

    self.colDef = colDef;

    //position of column
    self.index = (typeof(index) === 'undefined') ? colDef.index : index;

    if (colDef.name === undefined) {
      throw new Error('colDef.name is required for column at index ' + self.index);
    }

    var parseErrorMsg = "Cannot parse column width '" + colDef.width + "' for column named '" + colDef.name + "'";

    // If width is not defined, set it to a single star
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
        else if (!colDef.width.match(/^\*+$/)) {
          throw new Error(parseErrorMsg);
        }
      }
      // Is a number, use it as the width
      else {
        self.width = colDef.width;
      }
    }

    // Remove this column from the grid sorting
    GridColumn.prototype.unsort = function () {
      this.sort = {};
    };

    self.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
    self.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;

    //use field if it is defined; name if it is not
    self.field = (colDef.field === undefined) ? colDef.name : colDef.field;

    // Use colDef.displayName as long as it's not undefined, otherwise default to the field name
    self.displayName = (colDef.displayName === undefined) ? gridUtil.readableColumnName(colDef.name) : colDef.displayName;

    //self.originalIndex = index;

    self.aggregationType = angular.isDefined(colDef.aggregationType) ? colDef.aggregationType : null;
    self.footerCellTemplate = angular.isDefined(colDef.footerCellTemplate) ? colDef.footerCellTemplate : null;

    self.cellClass = colDef.cellClass;
    self.cellFilter = colDef.cellFilter ? colDef.cellFilter : "";

    self.visible = gridUtil.isNullOrUndefined(colDef.visible) || colDef.visible;

    self.headerClass = colDef.headerClass;
    //self.cursor = self.sortable ? 'pointer' : 'default';

    self.visible = true;

    // Turn on sorting by default
    self.enableSorting = typeof(colDef.enableSorting) !== 'undefined' ? colDef.enableSorting : true;
    self.sortingAlgorithm = colDef.sortingAlgorithm;

    // Turn on filtering by default (it's disabled by default at the Grid level)
    self.enableFiltering = typeof(colDef.enableFiltering) !== 'undefined' ? colDef.enableFiltering : true;

    // self.menuItems = colDef.menuItems;
    self.setPropertyOrDefault(colDef, 'menuItems', []);

    // Use the column definition sort if we were passed it
    self.setPropertyOrDefault(colDef, 'sort');

    /*

      self.filters = [
        {
          term: 'search term'
          condition: uiGridContants.filter.CONTAINS
        }
      ]

    */

    self.setPropertyOrDefault(colDef, 'filter');
    self.setPropertyOrDefault(colDef, 'filters', []);
  };




    /**
     * @ngdoc function
     * @name getColClass
     * @methodOf ui.grid.class:GridColumn
     * @description Returns the class name for the column
     * @param {bool} prefixDot  if true, will return .className instead of className
     */
    GridColumn.prototype.getColClass = function (prefixDot) {
      var cls = uiGridConstants.COL_CLASS_PREFIX + this.index;

      return prefixDot ? '.' + cls : cls;
    };

    /**
     * @ngdoc function
     * @name getColClassDefinition
     * @methodOf ui.grid.class:GridColumn
     * @description Returns the class definition for th column
     */
    GridColumn.prototype.getColClassDefinition = function () {
      return ' .grid' + this.grid.id + ' ' + this.getColClass(true) + ' { width: ' + this.drawnWidth + 'px; }';
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
     * @ngdoc function
     * @name hideColumn
     * @methodOf ui.grid.class:GridColumn
     * @description Hides the column by setting colDef.visible = false
     */
    GridColumn.prototype.hideColumn = function() {
        this.colDef.visible = false;
    };

    /**
     * @ngdoc function
     * @name getAggregationValue
     * @methodOf ui.grid.class:GridColumn
     * @description gets the aggregation value based on the aggregation type for this column
     */
    GridColumn.prototype.getAggregationValue = function () {
      var self = this;
      var result = 0;
      var visibleRows = self.grid.getVisibleRows();
      var cellValues = [];
      angular.forEach(visibleRows, function (row) {
        var cellValue = self.grid.getCellValue(row, self);
        if (angular.isNumber(cellValue)) {
          cellValues.push(cellValue);
        }
      });
      if (angular.isFunction(self.aggregationType)) {
        return self.aggregationType(visibleRows, self);
      }
      else if (self.aggregationType === 'count') {
        //TODO: change to i18n
        return 'total rows: ' + self.grid.getVisibleRowCount();
      }
      else if (self.aggregationType === 'sum') {
        angular.forEach(cellValues, function (value) {
          result += value;
        });
        //TODO: change to i18n
        return 'total: ' + result;
      }
      else if (self.aggregationType === 'avg') {
        angular.forEach(cellValues, function (value) {
          result += value;
        });
        result = result / cellValues.length;
        //TODO: change to i18n
        return 'avg: ' + result;
      }
      else if (self.aggregationType === 'min') {
        return 'min: ' + Math.min.apply(null, cellValues);
      }
      else if (self.aggregationType === 'max') {
        return 'max: ' + Math.max.apply(null, cellValues);
      }
      else {
        return null;
      }
    };

    return GridColumn;
  }]);

})();
