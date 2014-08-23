  (function(){

angular.module('ui.grid')
.factory('GridOptions', ['gridUtil', function(gridUtil) {

  /**
   * @ngdoc function
   * @name ui.grid.class:GridOptions
   * @description Default GridOptions class.  GridOptions are defined by the application developer and overlaid
   * over this object.
   *
   * @example To provide default options for all of the grids within your application, use an angular
   * decorator to modify the GridOptions factory.
   * <pre>app.config(function($provide){
   *    $provide.decorator('GridOptions',function($delegate){
   *      return function(){
   *        var defaultOptions = new $delegate();
   *        defaultOptions.excludeProperties = ['id' ,'$$hashKey'];
   *        return defaultOptions;
   *      };
   *    })
   *  })</pre>
   */
  function GridOptions() {

    this.onRegisterApi = angular.noop();

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
    
    /**
     * @ngdoc array
     * @name excludeProperties
     * @propertyOf  ui.grid.class:GridOptions
     * @description (optional) Array of property names in data to ignore when auto-generating column names. defaults to ['$$hashKey']
     * If columnDefs is defined, this will be ignored.
     */
    
    this.excludeProperties = ['$$hashKey'];

    /**
     * @ngdoc boolean
     * @name enableRowHashing
     * @propertyOf ui.grid.class:GridOptions
     * @description (optional) True by default. When enabled, this setting allows uiGrid to add
     * `$$hashKey`-type properties (similar to Angular) to elements in the `data` array. This allows
     * the grid to maintain state while vastly speeding up the process of altering `data` by adding/moving/removing rows.
     * 
     * Note that this DOES add properties to your data that you may not want, but they are stripped out when using `angular.toJson()`. IF
     * you do not want this at all you can disable this setting but you will take a performance hit if you are using large numbers of rows
     * and are altering the data set often.
     */
    this.enableRowHashing = true;

    /**
     * @ngdoc function
     * @name rowIdentity
     * @methodOf ui.grid.class:GridOptions
     * @description (optional) This function is used to get and, if necessary, set the value uniquely identifying this row.
     * 
     * By default it returns the `$$hashKey` property if it exists. If it doesn't it uses gridUtil.nextUid() to generate one
     */
    this.rowIdentity = function rowIdentity(row) {
        return gridUtil.hashKey(row);
    };

    /**
     * @ngdoc function
     * @name getRowIdentity
     * @methodOf ui.grid.class:GridOptions
     * @description (optional) This function returns the identity value uniquely identifying this row.
     * 
     * By default it returns the `$$hashKey` property but can be overridden to use any property or set of properties you want.
     */
    this.getRowIdentity = function rowIdentity(row) {
        return row.$$hashKey;
    };

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

    // Sorting on by default
    this.enableSorting = true;

    // Filtering off by default
    this.enableFiltering = false;

    // Column menu can be used by default
    this.enableColumnMenu = true;

    // Native scrolling on by default
    this.enableNativeScrolling = true;

    // Virtual scrolling off by default, overrides enableNativeScrolling if set
    this.enableVirtualScrolling = false;

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

    // Template for rows
    this.rowTemplate = 'ui-grid/ui-grid-row';
  }

  return GridOptions;

}]);

})();
