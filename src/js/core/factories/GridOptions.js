(function() {
angular.module('ui.grid')
.factory('GridOptions', ['gridUtil','uiGridConstants', function(gridUtil, uiGridConstants) {

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
   * <pre>
   * app.config(function($provide) {
   *   $provide.decorator('GridOptions',function($delegate) {
   *     var gridOptions;
   *     gridOptions = angular.copy($delegate);
   *     gridOptions.initialize = function(options) {
   *       var initOptions;
   *       initOptions = $delegate.initialize(options);
   *       initOptions.enableColumnMenus = false;
   *       return initOptions;
   *     };
   *     return gridOptions;
   *   });
   * });
   * </pre>
   */
  return {
    initialize: function( baseOptions ) {
      /**
       * @ngdoc function
       * @name onRegisterApi
       * @propertyOf ui.grid.class:GridOptions
       * @description A callback that returns the gridApi once the grid is instantiated, which is
       * then used to interact with the grid programatically.
       *
       * Note that the gridApi.core.renderingComplete event is identical to this
       * callback, but has the advantage that it can be called from multiple places
       * if needed
       *
       * @example
       * <pre>
       *   $scope.gridOptions.onRegisterApi = function ( gridApi ) {
       *     $scope.gridApi = gridApi;
       *     $scope.gridApi.selection.selectAllRows( $scope.gridApi.grid );
       *   };
       * </pre>
       *
       */
      baseOptions.onRegisterApi = baseOptions.onRegisterApi || angular.noop();

      /**
       * @ngdoc object
       * @name data
       * @propertyOf ui.grid.class:GridOptions
       * @description (mandatory) Array of data to be rendered into the grid, providing the data source or data binding for
       * the grid.
       *
       * Most commonly the data is an array of objects, where each object has a number of attributes.
       * Each attribute automatically becomes a column in your grid.  This array could, for example, be sourced from
       * an angularJS $resource query request.  The array can also contain complex objects, refer the binding tutorial
       * for examples of that.
       *
       * The most flexible usage is to set your data on $scope:
       *
       * `$scope.data = data;`
       *
       * And then direct the grid to resolve whatever is in $scope.data:
       *
       * `$scope.gridOptions.data = 'data';`
       *
       * This is the most flexible approach as it allows you to replace $scope.data whenever you feel like it without
       * getting pointer issues.
       *
       * Alternatively you can directly set the data array:
       *
       * `$scope.gridOptions.data = [ ];`
       * or
       *
       * `$http.get('/data/100.json')
       * .success(function(data) {
       *   $scope.myData = data;
       *   $scope.gridOptions.data = $scope.myData;
       *  });`
       *
       * Where you do this, you need to take care in updating the data - you can't just update `$scope.myData` to some other
       * array, you need to update $scope.gridOptions.data to point to that new array as well.
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
       * <pre>var columnDefs = [{name: 'field1'}, {name: 'field2'}];</pre>
       *
       */
      baseOptions.columnDefs = baseOptions.columnDefs || [];

      /**
       * @ngdoc object
       * @name ui.grid.class:GridOptions.columnDef
       * @description Definition / configuration of an individual column, which would typically be
       * one of many column definitions within the gridOptions.columnDefs array
       * @example
       * <pre>{name: 'field1', field: 'field1', filter: { term: 'xxx' }}</pre>
       *
       */

      /**
       * @ngdoc object
       * @name enableGridMenu
       * @propertyOf ui.grid.class:GridOptions
       * @description Takes a boolean that adds a settings icon in the top right of the grid, which floats above
       * the column header, when true. The menu by default gives access to show/hide columns, but can be
       * customised to show additional actions.
       *
       * See the {@link #!/tutorial/121_grid_menu Grid Menu tutorial} for more detailed information.
       */

      /**
       * @ngdoc array
       * @name excludeProperties
       * @propertyOf ui.grid.class:GridOptions
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
       * @description This function is used to get and, if necessary, set the value uniquely identifying this row (i.e. if an identity is not present it will set one).
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
       * @description This function returns the identity value uniquely identifying this row, if one is not present it does not set it.
       *
       * By default it returns the `$$hashKey` property but can be overridden to use any property or set of properties you want.
       */
      baseOptions.getRowIdentity = baseOptions.getRowIdentity || function getRowIdentity(row) {
        return row.$$hashKey;
      };

      /**
       * @ngdoc property
       * @name flatEntityAccess
       * @propertyOf ui.grid.class:GridOptions
       * @description Set to true if your columns are all related directly to fields in a flat object structure - i.e.
       * each of your columns associate directly with a property on each of the entities in your data array.
       *
       * In that situation we can avoid all the logic associated with complex binding to functions or to properties of sub-objects,
       * which can provide a significant speed improvement with large data sets when filtering or sorting.
       *
       * By default false
       */
      baseOptions.flatEntityAccess = baseOptions.flatEntityAccess === true;

      /**
       * @ngdoc property
       * @name showHeader
       * @propertyOf ui.grid.class:GridOptions
       * @description True by default. When set to false, this setting will replace the
       * standard header template with '<div></div>', resulting in no header being shown.
       */
      baseOptions.showHeader = typeof(baseOptions.showHeader) !== "undefined" ? baseOptions.showHeader : true;

      /**
       * @ngdoc property
       * @name headerRowHeight
       * @propertyOf ui.grid.class:GridOptions
       * @description The height of the header in pixels, defaults to 30.
       * Although, we recommend that you alter header height with CSS rather than using this option:
       *
       * <pre>
       *     .grid .ui-grid-header-cell {
       *         height: 60px;
       *     }
       * </pre>
       **/
      if (!baseOptions.showHeader) {
        baseOptions.headerRowHeight = 0;
      }
      else {
        baseOptions.headerRowHeight = typeof(baseOptions.headerRowHeight) !== "undefined" ? baseOptions.headerRowHeight : 30;
      }

      /**
       * @ngdoc property
       * @name rowHeight
       * @propertyOf ui.grid.class:GridOptions
       * @description The height of the row in pixels,  Can be passed as integer or string. defaults to 30.
       *
       */

      if (typeof baseOptions.rowHeight === "string") {
        baseOptions.rowHeight = parseInt(baseOptions.rowHeight) || 30;
      }

      else {
        baseOptions.rowHeight = baseOptions.rowHeight || 30;
      }

      /**
       * @ngdoc integer
       * @name minRowsToShow
       * @propertyOf ui.grid.class:GridOptions
       * @description Minimum number of rows to show when the grid doesn't have a defined height. Defaults to "10".
       */
      baseOptions.minRowsToShow = typeof(baseOptions.minRowsToShow) !== "undefined" ? baseOptions.minRowsToShow : 10;

      /**
       * @ngdoc property
       * @name showGridFooter
       * @propertyOf ui.grid.class:GridOptions
       * @description Whether or not to show the footer, defaults to false
       * The footer display Total Rows and Visible Rows (filtered rows)
       */
      baseOptions.showGridFooter = baseOptions.showGridFooter === true;

      /**
       * @ngdoc property
       * @name showColumnFooter
       * @propertyOf ui.grid.class:GridOptions
       * @description Whether or not to show the column footer, defaults to false
       * The column footer displays column aggregates
       */
      baseOptions.showColumnFooter = baseOptions.showColumnFooter === true;

      /**
       * @ngdoc property
       * @name columnFooterHeight
       * @propertyOf ui.grid.class:GridOptions
       * @description The height of the footer rows (column footer and grid footer) in pixels
       *
       */
      baseOptions.columnFooterHeight = typeof(baseOptions.columnFooterHeight) !== "undefined" ? baseOptions.columnFooterHeight : 30;
      baseOptions.gridFooterHeight = typeof(baseOptions.gridFooterHeight) !== "undefined" ? baseOptions.gridFooterHeight : 30;

      baseOptions.columnWidth = typeof(baseOptions.columnWidth) !== "undefined" ? baseOptions.columnWidth : 50;

      /**
       * @ngdoc property
       * @name maxVisibleColumnCount
       * @propertyOf ui.grid.class:GridOptions
       * @description Defaults to 200
       *
       */
      baseOptions.maxVisibleColumnCount = typeof(baseOptions.maxVisibleColumnCount) !== "undefined" ? baseOptions.maxVisibleColumnCount : 200;

      /**
       * @ngdoc property
       * @name virtualizationThreshold
       * @propertyOf ui.grid.class:GridOptions
       * @description Turn virtualization on when number of data elements goes over this number, defaults to 20
       */
      baseOptions.virtualizationThreshold = typeof(baseOptions.virtualizationThreshold) !== "undefined" ? baseOptions.virtualizationThreshold : 20;

      /**
       * @ngdoc property
       * @name columnVirtualizationThreshold
       * @propertyOf ui.grid.class:GridOptions
       * @description Turn virtualization on when number of columns goes over this number, defaults to 10
       */
      baseOptions.columnVirtualizationThreshold = typeof(baseOptions.columnVirtualizationThreshold) !== "undefined" ? baseOptions.columnVirtualizationThreshold : 10;

      /**
       * @ngdoc property
       * @name excessRows
       * @propertyOf ui.grid.class:GridOptions
       * @description Extra rows to to render outside of the viewport, which helps with smoothness of scrolling.
       * Defaults to 4
       */
      baseOptions.excessRows = typeof(baseOptions.excessRows) !== "undefined" ? baseOptions.excessRows : 4;

      /**
       * @ngdoc property
       * @name scrollThreshold
       * @propertyOf ui.grid.class:GridOptions
       * @description Throttles the grid scrolling by the amount of rows set, which helps with smoothness of scrolling.
       * Defaults to 4.
       */
      baseOptions.scrollThreshold = typeof(baseOptions.scrollThreshold) !== "undefined" ? baseOptions.scrollThreshold : 4;

      /**
       * @ngdoc property
       * @name excessColumns
       * @propertyOf ui.grid.class:GridOptions
       * @description Extra columns to to render outside of the viewport, which helps with smoothness of scrolling.
       * Defaults to 4
       */
      baseOptions.excessColumns = typeof(baseOptions.excessColumns) !== "undefined" ? baseOptions.excessColumns : 4;

      /**
       * @ngdoc property
       * @name aggregationCalcThrottle
       * @propertyOf ui.grid.class:GridOptions
       * @description Default time in milliseconds to throttle aggregation calcuations, defaults to 500ms
       */
      baseOptions.aggregationCalcThrottle = typeof(baseOptions.aggregationCalcThrottle) !== "undefined" ? baseOptions.aggregationCalcThrottle : 500;

      /**
       * @ngdoc property
       * @name wheelScrollThrottle
       * @propertyOf ui.grid.class:GridOptions
       * @description Default time in milliseconds to throttle scroll events to, defaults to 70ms
       */
      baseOptions.wheelScrollThrottle = typeof(baseOptions.wheelScrollThrottle) !== "undefined" ? baseOptions.wheelScrollThrottle : 70;


      /**
       * @ngdoc property
       * @name scrollDebounce
       * @propertyOf ui.grid.class:GridOptions
       * @description Default time in milliseconds to debounce scroll events, defaults to 300ms
       */
      baseOptions.scrollDebounce = typeof(baseOptions.scrollDebounce) !== "undefined" ? baseOptions.scrollDebounce : 300;

      /**
       * @ngdoc boolean
       * @name enableSorting
       * @propertyOf ui.grid.class:GridOptions
       * @description True by default. When enabled, this setting adds sort
       * widgets to the column headers, allowing sorting of the data for the entire grid.
       * Sorting can then be disabled / enabled on individual columns using the columnDefs,
       * if it set, it will override GridOptions enableSorting setting.
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
       * By default column menu's trigger is hidden before mouse over, but you can always force it to be visible with CSS:
       *
       * <pre>
       *  .ui-grid-column-menu-button {
       *    display: block;
       *  }
       * </pre>
       */
      baseOptions.enableColumnMenus = baseOptions.enableColumnMenus !== false;

      /**
       * @ngdoc boolean
       * @name enableVerticalScrollbar
       * @propertyOf ui.grid.class:GridOptions
       * @description {@link ui.grid.service:uiGridConstants#properties_scrollbars uiGridConstants.scrollbars.ALWAYS} by default.
       * This settings controls the vertical scrollbar for the grid.
       * Supported values: uiGridConstants.scrollbars.ALWAYS, uiGridConstants.scrollbars.NEVER, uiGridConstants.scrollbars.WHEN_NEEDED
       */
      baseOptions.enableVerticalScrollbar = typeof(baseOptions.enableVerticalScrollbar) !== "undefined" ? baseOptions.enableVerticalScrollbar : uiGridConstants.scrollbars.ALWAYS;

      /**
       * @ngdoc boolean
       * @name enableHorizontalScrollbar
       * @propertyOf ui.grid.class:GridOptions
       * @description {@link ui.grid.service:uiGridConstants#properties_scrollbars uiGridConstants.scrollbars.ALWAYS} by default.
       * This settings controls the horizontal scrollbar for the grid.
       * Supported values: uiGridConstants.scrollbars.ALWAYS, uiGridConstants.scrollbars.NEVER, uiGridConstants.scrollbars.WHEN_NEEDED
       */
      baseOptions.enableHorizontalScrollbar = typeof(baseOptions.enableHorizontalScrollbar) !== "undefined" ? baseOptions.enableHorizontalScrollbar : uiGridConstants.scrollbars.ALWAYS;

      /**
       * @ngdoc boolean
       * @name enableMinHeightCheck
       * @propertyOf ui.grid.class:GridOptions
       * @description True by default. When enabled, a newly initialized grid will check to see if it is tall enough to display
       * at least one row of data.  If the grid is not tall enough, it will resize the DOM element to display minRowsToShow number
       * of rows.
       */
       baseOptions.enableMinHeightCheck = baseOptions.enableMinHeightCheck !== false;

      /**
       * @ngdoc boolean
       * @name minimumColumnSize
       * @propertyOf ui.grid.class:GridOptions
       * @description Sets the default minimum column width, in other words,
       * it defines the default value for a column minWidth attribute if that is not otherwise specified.
       * Should be a number. Defaults to 30 pixels.
       */
      baseOptions.minimumColumnSize = typeof(baseOptions.minimumColumnSize) !== "undefined" ? baseOptions.minimumColumnSize : 30;

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
       * @description (optional) ui-grid/ui-grid-footer by default.  This footer shows the per-column
       * aggregation totals.
       * When provided, this setting uses a custom footer template. Can be set to either the name of a template file 'footer_template.html', inline html
       * <pre>'<div class="ui-grid-bottom-panel" style="text-align: center">I am a Custom Grid Footer</div>'</pre>, or the id
       * of a precompiled template (TBD how to use this).  Refer to the custom footer tutorial for more information.
       */
      baseOptions.footerTemplate = baseOptions.footerTemplate || 'ui-grid/ui-grid-footer';

      /**
       * @ngdoc string
       * @name gridFooterTemplate
       * @propertyOf ui.grid.class:GridOptions
       * @description (optional) ui-grid/ui-grid-grid-footer by default. This template by default shows the
       * total items at the bottom of the grid, and the selected items if selection is enabled.
       */
      baseOptions.gridFooterTemplate = baseOptions.gridFooterTemplate || 'ui-grid/ui-grid-grid-footer';

      /**
       * @ngdoc string
       * @name rowTemplate
       * @propertyOf ui.grid.class:GridOptions
       * @description 'ui-grid/ui-grid-row' by default. When provided, this setting uses a
       * custom row template.  Can be set to either the name of a template file:
       * <pre> $scope.gridOptions.rowTemplate = 'row_template.html';</pre>
       * inline html
       * <pre>  $scope.gridOptions.rowTemplate = '<div style="background-color: aquamarine" ng-click="grid.appScope.fnOne(row)" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>';</pre>
       * or the id of a precompiled template (TBD how to use this) can be provided.
       * </br>Refer to the custom row template tutorial for more information.
       */
      baseOptions.rowTemplate = baseOptions.rowTemplate || 'ui-grid/ui-grid-row';

      /**
      * @ngdoc string
      * @name gridMenuTemplate
      * @propertyOf ui.grid.class:GridOptions
      * @description 'ui-grid/uiGridMenu' by default. When provided, this setting uses a
      * custom grid menu template.
      */
      baseOptions.gridMenuTemplate = baseOptions.gridMenuTemplate || 'ui-grid/uiGridMenu';

      /**
       * @ngdoc object
       * @name appScopeProvider
       * @propertyOf ui.grid.class:GridOptions
       * @description by default, the parent scope of the ui-grid element will be assigned to grid.appScope
       * this property allows you to assign any reference you want to grid.appScope
       */
      baseOptions.appScopeProvider = baseOptions.appScopeProvider || null;

      return baseOptions;
    }
  };
}]);
})();
