  (function(){

angular.module('ui.grid')
.factory('GridOptions', ['gridUtil','uiGridConstants', function(gridUtil,uiGridConstants) {

  /**
   * @ngdoc function
   * @name ui.grid.class:GridOptions
   * @description Default GridOptions class.  GridOptions are defined by the application developer and overlaid
   * over this object.  Setting gridOptions within your controller is the most common method for an application 
   * developer to configure the behaviour of their ui-grid
   * 
   * @example To define your gridOptions within your controller:
   * <pre>$scope.gridOptions = {
   *   data: $scope.myData,
   *   columnDefs: [ 
   *     { name: 'field1', displayName: 'pretty display name' },
   *     { name: 'field2', visible: false }
   *  ]
   * };</pre>
   * 
   * You can then use this within your html template, when you define your grid:
   * <pre>&lt;div ui-grid="gridOptions"&gt;&lt;/div&gt;</pre>
   *
   * To provide default options for all of the grids within your application, use an angular
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
  return {
    initialize: function( baseOptions ){
      baseOptions.onRegisterApi = baseOptions.onRegisterApi || angular.noop();
  
      /**
       * @ngdoc object
       * @name data
       * @propertyOf ui.grid.class:GridOptions
       * @description (mandatory) Array of data to be rendered into the grid, providing the data source or data binding for 
       * the grid.  The most common case is an array of objects, where each object has a number of attributes.
       * Each attribute automatically becomes a column in your grid.  This array could, for example, be sourced from
       * an angularJS $resource query request.  The array can also contain complex objects.
       * 
       */
      baseOptions.data = baseOptions.data || [];
  
      /**
       * @ngdoc array
       * @name columnDefs
       * @propertyOf  ui.grid.class:GridOptions
       * @description Array of columnDef objects.  Only required property is name.
       * The individual options available in columnDefs are documented in the
       * {@link ui.grid.class:GridOptions.columnDef columnDef} section
       * </br>_field property can be used in place of name for backwards compatibility with 2.x_
       *  @example
       *
       * <pre>var columnDefs = [{name:'field1'}, {name:'field2'}];</pre>
       *
       */
      baseOptions.columnDefs = baseOptions.columnDefs || [];
  
      /**
       * @ngdoc object
       * @name ui.grid.class:GridOptions.columnDef
       * @description Definition / configuration of an individual column, which would typically be
       * one of many column definitions within the gridOptions.columnDefs array
       * @example
       * <pre>{name:'field1', field: 'field1', filter: { term: 'xxx' }}</pre>
       *
       */
  
          
      /**
       * @ngdoc array
       * @name excludeProperties
       * @propertyOf  ui.grid.class:GridOptions
       * @description Array of property names in data to ignore when auto-generating column names.  Provides the
       * inverse of columnDefs - columnDefs is a list of columns to include, excludeProperties is a list of columns
       * to exclude. 
       * 
       * If columnDefs is defined, this will be ignored.
       * 
       * Defaults to ['$$hashKey']
       */
      
      baseOptions.excludeProperties = baseOptions.excludeProperties || ['$$hashKey'];
  
      /**
       * @ngdoc boolean
       * @name enableRowHashing
       * @propertyOf ui.grid.class:GridOptions
       * @description True by default. When enabled, this setting allows uiGrid to add
       * `$$hashKey`-type properties (similar to Angular) to elements in the `data` array. This allows
       * the grid to maintain state while vastly speeding up the process of altering `data` by adding/moving/removing rows.
       * 
       * Note that this DOES add properties to your data that you may not want, but they are stripped out when using `angular.toJson()`. IF
       * you do not want this at all you can disable this setting but you will take a performance hit if you are using large numbers of rows
       * and are altering the data set often.
       */
      baseOptions.enableRowHashing = baseOptions.enableRowHashing !== false;
  
      /**
       * @ngdoc function
       * @name rowIdentity
       * @methodOf ui.grid.class:GridOptions
       * @description This function is used to get and, if necessary, set the value uniquely identifying this row.
       * 
       * By default it returns the `$$hashKey` property if it exists. If it doesn't it uses gridUtil.nextUid() to generate one
       */
      baseOptions.rowIdentity = baseOptions.rowIdentity || function rowIdentity(row) {
        return gridUtil.hashKey(row);
      };
  
      /**
       * @ngdoc function
       * @name getRowIdentity
       * @methodOf ui.grid.class:GridOptions
       * @description This function returns the identity value uniquely identifying this row.
       * 
       * By default it returns the `$$hashKey` property but can be overridden to use any property or set of properties you want.
       */
      baseOptions.getRowIdentity = baseOptions.getRowIdentity || function getRowIdentity(row) {
        return row.$$hashKey;
      };
  
      baseOptions.headerRowHeight = typeof(baseOptions.headerRowHeight) !== "undefined" ? baseOptions.headerRowHeight : 30;
      baseOptions.rowHeight = baseOptions.rowHeight || 30;
      baseOptions.maxVisibleRowCount = baseOptions.maxVisibleRowCount || 200;
  
      /**
       * @ngdoc integer
       * @name minRowsToShow
       * @propertyOf ui.grid.class:GridOptions
       * @description Minimum number of rows to show when the grid doesn't have a defined height. Defaults to "10".
       */
      baseOptions.minRowsToShow = typeof(baseOptions.minRowsToShow) !== "undefined" ? baseOptions.minRowsToShow : 10;
  
      baseOptions.showFooter = baseOptions.showFooter === true;
      baseOptions.footerRowHeight = typeof(baseOptions.footerRowHeight) !== "undefined" ? baseOptions.footerRowHeight : 30;
  
      baseOptions.columnWidth = typeof(baseOptions.columnWidth) !== "undefined" ? baseOptions.columnWidth : 50;
      baseOptions.maxVisibleColumnCount = typeof(baseOptions.maxVisibleColumnCount) !== "undefined" ? baseOptions.maxVisibleColumnCount : 200;
  
      // Turn virtualization on when number of data elements goes over this number
      baseOptions.virtualizationThreshold = typeof(baseOptions.virtualizationThreshold) !== "undefined" ? baseOptions.virtualizationThreshold : 20;
  
      baseOptions.columnVirtualizationThreshold = typeof(baseOptions.columnVirtualizationThreshold) !== "undefined" ? baseOptions.columnVirtualizationThreshold : 10;
  
      // Extra rows to to render outside of the viewport
      baseOptions.excessRows = typeof(baseOptions.excessRows) !== "undefined" ? baseOptions.excessRows : 4;
      baseOptions.scrollThreshold = typeof(baseOptions.scrollThreshold) !== "undefined" ? baseOptions.scrollThreshold : 4;
  
      // Extra columns to to render outside of the viewport
      baseOptions.excessColumns = typeof(baseOptions.excessColumns) !== "undefined" ? baseOptions.excessColumns : 4;
      baseOptions.horizontalScrollThreshold = typeof(baseOptions.horizontalScrollThreshold) !== "undefined" ? baseOptions.horizontalScrollThreshold : 2;
  
      // Default time to throttle scroll events to.
      baseOptions.scrollThrottle = typeof(baseOptions.scrollThrottle) !== "undefined" ? baseOptions.scrollThrottle : 70;
  
      /**
       * @ngdoc boolean
       * @name enableSorting
       * @propertyOf ui.grid.class:GridOptions
       * @description True by default. When enabled, this setting adds sort
       * widgets to the column headers, allowing sorting of the data for the entire grid.
       * Sorting can then be disabled on individual columns using the columnDefs.
       */
      baseOptions.enableSorting = baseOptions.enableSorting !== false;
  
      /**
       * @ngdoc boolean
       * @name enableFiltering
       * @propertyOf ui.grid.class:GridOptions
       * @description False by default. When enabled, this setting adds filter 
       * boxes to each column header, allowing filtering within the column for the entire grid.
       * Filtering can then be disabled on individual columns using the columnDefs. 
       */
      baseOptions.enableFiltering = baseOptions.enableFiltering === true;
  
      /**
       * @ngdoc boolean
       * @name enableColumnMenus
       * @propertyOf ui.grid.class:GridOptions
       * @description True by default. When enabled, this setting displays a column
       * menu within each column.
       */
      baseOptions.enableColumnMenus = baseOptions.enableColumnMenus !== false;
  
      /**
       * @ngdoc boolean
       * @name enableVerticalScrollbar
       * @propertyOf ui.grid.class:GridOptions
       * @description uiGridConstants.scrollbars.ALWAYS by default. This settings controls the vertical scrollbar for the grid.
       * Supported values: uiGridConstants.scrollbars.ALWAYS, uiGridConstants.scrollbars.NEVER, uiGridConstants.scrollbars.WHEN_NEEDED.
       */
      baseOptions.enableVerticalScrollbar = typeof(baseOptions.enableVerticalScrollbar) !== "undefined" ? baseOptions.enableVerticalScrollbar : uiGridConstants.scrollbars.ALWAYS;
      
      /**
       * @ngdoc boolean
       * @name enableHorizontalScrollbar
       * @propertyOf ui.grid.class:GridOptions
       * @description uiGridConstants.scrollbars.ALWAYS by default. This settings controls the horizontal scrollbar for the grid.
       * Supported values: uiGridConstants.scrollbars.ALWAYS, uiGridConstants.scrollbars.NEVER, uiGridConstants.scrollbars.WHEN_NEEDED.
       */
      baseOptions.enableHorizontalScrollbar = typeof(baseOptions.enableHorizontalScrollbar) !== "undefined" ? baseOptions.enableHorizontalScrollbar : uiGridConstants.scrollbars.ALWAYS;
  
      // Columns can't be smaller than 10 pixels
      baseOptions.minimumColumnSize = typeof(baseOptions.minimumColumnSize) !== "undefined" ? baseOptions.minimumColumnSize : 10;
  
      /**
       * @ngdoc function
       * @name rowEquality
       * @methodOf ui.grid.class:GridOptions
       * @description By default, rows are compared using object equality.  This option can be overridden
       * to compare on any data item property or function
       * @param {object} entityA First Data Item to compare
       * @param {object} entityB Second Data Item to compare
       */
      baseOptions.rowEquality = baseOptions.rowEquality || function(entityA, entityB) {
        return entityA === entityB;
      };
  
      /**
       * @ngdoc string
       * @name headerTemplate
       * @propertyOf ui.grid.class:GridOptions
       * @description Null by default. When provided, this setting uses a custom header
       * template, rather than the default template. Can be set to either the name of a template file:
       * <pre>  $scope.gridOptions.headerTemplate = 'header_template.html';</pre>
       * inline html 
       * <pre>  $scope.gridOptions.headerTemplate = '<div class="ui-grid-top-panel" style="text-align: center">I am a Custom Grid Header</div>'</pre>
       * or the id of a precompiled template (TBD how to use this).  
       * </br>Refer to the custom header tutorial for more information.
       * If you want no header at all, you can set to an empty div:
       * <pre>  $scope.gridOptions.headerTemplate = '<div></div>';</pre>
       * 
       * If you want to only have a static header, then you can set to static content.  If
       * you want to tailor the existing column headers, then you should look at the
       * current 'ui-grid-header.html' template in github as your starting point.
       * 
       */
      baseOptions.headerTemplate = baseOptions.headerTemplate || null;
  
      /**
       * @ngdoc string
       * @name footerTemplate
       * @propertyOf ui.grid.class:GridOptions
       * @description (optional) Null by default. When provided, this setting uses a custom footer
       * template. Can be set to either the name of a template file 'footer_template.html', inline html
       * <pre>'<div class="ui-grid-bottom-panel" style="text-align: center">I am a Custom Grid Footer</div>'</pre>, or the id
       * of a precompiled template (TBD how to use this).  Refer to the custom footer tutorial for more information.
       */
      baseOptions.footerTemplate = baseOptions.footerTemplate || null;
  
      /**
       * @ngdoc string
       * @name rowTemplate
       * @propertyOf ui.grid.class:GridOptions
       * @description 'ui-grid/ui-grid-row' by default. When provided, this setting uses a 
       * custom row template.  Can be set to either the name of a template file:
       * <pre> $scope.gridOptions.rowTemplate = 'row_template.html';</pre>
       * inline html 
       * <pre>  $scope.gridOptions.rowTemplate = '<div style="background-color: aquamarine" ng-click="getExternalScopes().fnOne(row)" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>';</pre>
       * or the id of a precompiled template (TBD how to use this) can be provided.  
       * </br>Refer to the custom row template tutorial for more information.
       */
      baseOptions.rowTemplate = baseOptions.rowTemplate || 'ui-grid/ui-grid-row';
      
      return baseOptions;
    }     
  };


}]);

})();
