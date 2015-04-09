(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.grouping
   * @description
   *
   *  # ui.grid.grouping
   * This module provides grouping of rows based on the data in them, similar
   * in concept to excel grouping.  You can group multiple columns, resulting in 
   * nested grouping.
   * 
   * In concept this feature is similar to sorting + grid footer/aggregation, it
   * sorts the data based on the grouped columns, then creates group rows that
   * reflect a break in the data.  Each of those group rows can have aggregations for
   * the data within that group.
   * 
   * Design information:
   * -------------------
   * 
   * Each column will get new menu items - group by, and aggregate by.  Group by
   * will cause this column to be sorted (if not already), and will move this column
   * to the front of the sorted columns (i.e. grouped columns take precedence over
   * sorted columns).  It will respect the sort order already set if there is one,
   * and it will allow the sorting logic to change that sort order, it just forces
   * the column to the front of the sorting.  You can group by multiple columns, the
   * logic will add this column to the sorting after any already grouped columns.
   * 
   * Once a grouping is defined, grouping logic is added to the rowsProcessors.  This
   * will process the rows, identifying a break in the data value, and inserting a grouping row.
   * Grouping rows have specific attributes on them:
   * 
   *  - internalRow = true: tells us that this isn't a real row, so we can ignore it 
   *    from any processing that it looking at core data rows.  This is used by the core
   *    logic (or will be one day), as it's not grouping specific
   *  - groupHeader = true: tells us this is a groupHeader.  This is used by the grouping logic
   *    to know if this is a groupHeader row or not
   *  - groupLevel = num: first level is 0, tells us what level of grouping the row relates to
   *  - expandedState = object: pointer to the node in the grid.grouping.rowExpandedStates that refers
   *    to this row, allowing us to manipulate the state
   * 
   * Since the logic is baked into the rowsProcessors, it should get triggered whenever
   * row order or filtering or anything like that is changed.  We recall the expanded state
   * across invocations of the rowsProcessors by putting it into the grid.grouping.rowExpandedStates hash.
   * 
   * By default rows are collapsed, which means all data rows have their visible property
   * set to false, and only level 0 group rows are set to visible.
   * 
   * We rely on the rowsProcessors to do the actual expanding and collapsing, so we set the flags we want into
   * grid.grouping.rowExpandedStates, then call refresh.  This is because we can't easily change the visible
   * row cache without calling the processors, and once we've built the logic into the rowProcessors we may as
   * well use it all the time.
   *  
   * Note that we don't really manipulate row visibility directly - we set the reasonInvisible.grouping
   * flag, and then ask the row to calculate it's own visibility.  This means we should work fine with 
   * filtering - filtered rows wouldn't get included in our grouping logic.
   * 
   * <br/>
   * <br/>
   *
   * <div doc-module-components="ui.grid.grouping"></div>
   */

  var module = angular.module('ui.grid.grouping', ['ui.grid']);

  /**
   *  @ngdoc object
   *  @name ui.grid.grouping.constant:uiGridGroupingConstants
   *
   *  @description constants available in grouping module
   * 
   *  Of particular note are:
   *  ```
   *    uiGridGroupingConstants.aggregation.COUNT
   *    uiGridGroupingConstants.aggregation.SUM
   *    uiGridGroupingConstants.aggregation.MAX
   *    uiGridGroupingConstants.aggregation.MIN
   *    uiGridGroupingConstants.aggregation.AVG
   *  ```
   */
  module.constant('uiGridGroupingConstants', {
    featureName: "grouping",
    groupingRowHeaderColName: 'groupingRowHeaderCol',
    EXPANDED: 'expanded',
    COLLAPSED: 'collapsed',
    aggregation: {
      COUNT: 'count',
      SUM: 'sum',
      MAX: 'max',
      MIN: 'min',
      AVG: 'avg',
      FIELD: '##@@aggregation_running_count@@##'
    }
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.grouping.service:uiGridGroupingService
   *
   *  @description Services for grouping features
   */
  module.service('uiGridGroupingService', ['$q', 'uiGridGroupingConstants', 'gridUtil', 'GridRow', 'gridClassFactory', 'i18nService', 'uiGridConstants',
    function ($q, uiGridGroupingConstants, gridUtil, GridRow, gridClassFactory, i18nService, uiGridConstants) {

      var service = {

        initializeGrid: function (grid, $scope) {

          //add feature namespace and any properties to grid for needed
          /**
           *  @ngdoc object
           *  @name ui.grid.grouping.grid:grouping
           *
           *  @description Grid properties and functions added for grouping
           */
          grid.grouping = {};

          /**
           *  @ngdoc property
           *  @propertyOf ui.grid.grouping.grid:grouping
           *  @name numberLevels
           *
           *  @description Total number of grouping levels currently turned on (i.e. number
           *   of grouped columns)
           */
          grid.grouping.numberLevels = 0;

          /**
           *  @ngdoc property
           *  @propertyOf ui.grid.grouping.grid:grouping
           *  @name expandAll
           *
           *  @description Whether or not the expandAll box is selected
           */
          grid.grouping.expandAll = false;
          
          /**
           *  @ngdoc property
           *  @propertyOf ui.grid.grouping.grid:grouping
           *  @name rowExpandedStates
           *
           *  @description Hash that holds all the expanded states based on the group
           *  columns.  So if I've grouped on two columns - gender and age - then I might
           *  expect this object to contain:
           *  ```
           *    {
           *      male: {
           *        state: 'expanded',
           *        10: { state: 'expanded' },
           *        11: { state: 'collapsed' },
           *        19: { state: 'expanded' },
           *        20: { state: 'collapsed' }
           *      },
           *      female: {
           *        state: 'collapsed',
           *        15: { state: 'expanded' },
           *        18: { state: 'collapsed' },
           *        38: { state: 'expanded' }
           *      }
           *    }
           *  ```
           *  Missing values are false - meaning they aren't expanded.
           * 
           *  This is used because the rowProcessors run every time the grid is refreshed, so
           *  we'd lose the expanded state every time the grid was refreshed.  This instead gives
           *  us a reliable lookup that persists across rowProcessors.
           *  
           *  The hash gets reset when the group conditions change.
           * 
           */
          grid.grouping.rowExpandedStates = {};

          service.defaultGridOptions(grid.options);
          
          grid.registerRowsProcessor(service.groupRows, 400);
          
          grid.registerColumnsProcessor(service.groupingColumnProcessor);
          
          /**
           *  @ngdoc object
           *  @name ui.grid.grouping.api:PublicApi
           *
           *  @description Public Api for grouping feature
           */
          var publicApi = {
            events: {
              grouping: {
              }
            },
            methods: {
              grouping: {
                /**
                 * @ngdoc function
                 * @name expandAllRows
                 * @methodOf  ui.grid.grouping.api:PublicApi
                 * @description Expands all grouped rows
                 */
                expandAllRows: function () {
                  service.expandAllRows(grid);
                },
                
                /**
                 * @ngdoc function
                 * @name collapseAllRows
                 * @methodOf  ui.grid.grouping.api:PublicApi
                 * @description collapse all grouped rows
                 */
                collapseAllRows: function () {
                  service.collapseAllRows(grid);
                },
                
                /**
                 * @ngdoc function
                 * @name toggleRowGroupingState
                 * @methodOf  ui.grid.grouping.api:PublicApi
                 * @description  call expand if the row is collapsed, collapse if it is expanded
                 * @param {gridRow} row the row you wish to toggle
                 */
                toggleRowGroupingState: function (row) {
                  service.toggleRowGroupingState(grid, row);
                },
                
                /**
                 * @ngdoc function
                 * @name expandRow
                 * @methodOf  ui.grid.grouping.api:PublicApi
                 * @description expand the immediate children of the specified row
                 * @param {gridRow} row the row you wish to expand
                 */
                expandRow: function (row) {
                  service.expandRow(grid, row);
                },
                
                /**
                 * @ngdoc function
                 * @name expandRowChildren
                 * @methodOf  ui.grid.grouping.api:PublicApi
                 * @description expand all children of the specified row
                 * @param {gridRow} row the row you wish to expand
                 */
                expandRowChildren: function (row) {
                  service.expandRowChildren(grid, row);
                },
                
                /**
                 * @ngdoc function
                 * @name collapseRow
                 * @methodOf  ui.grid.grouping.api:PublicApi
                 * @description collapse all children of the specified row.  When
                 * you expand the row again, all grandchildren will be collapsed
                 * @param {gridRow} row the row you wish to expand
                 */
                collapseRow: function ( row ) {
                  service.collapseRow(grid, row);
                },

                /**
                 * @ngdoc function
                 * @name getGrouping
                 * @methodOf  ui.grid.grouping.api:PublicApi
                 * @description Get the grouping configuration for this grid,
                 * used by the saveState feature
                 * Returned grouping is an object 
                 *   `{ grouping: groupArray, aggregations: aggregateArray, expandedState: hash }` 
                 * where grouping contains an array of objects: 
                 *   `{ field: column.field, colName: column.name, groupPriority: column.grouping.groupPriority }`
                 * and aggregations contains an array of objects:
                 *   `{ field: column.field, colName: column.name, aggregation: column.grouping.aggregation }`
                 * and expandedState is a hash of the currently expanded nodes
                 * 
                 * The groupArray will be sorted by groupPriority.
                 * 
                 * @param {boolean} getExpanded whether or not to return the expanded state
                 * @returns {object} grouping configuration
                 */
                getGrouping: function ( getExpanded ) {
                  var grouping = service.getGrouping(grid);
                  
                  grouping.grouping.forEach( function( group ) {
                    group.colName = group.col.name;
                    delete group.col;
                  });

                  grouping.aggregations.forEach( function( aggregation ) {
                    aggregation.colName = aggregation.col.name;
                    delete aggregation.col;
                  });
                  
                  if ( getExpanded ){
                    grouping.rowExpandedStates = grid.grouping.rowExpandedStates;
                  }
                  
                  return grouping;
                },

                /**
                 * @ngdoc function
                 * @name setGrouping
                 * @methodOf  ui.grid.grouping.api:PublicApi
                 * @description Set the grouping configuration for this grid, 
                 * used by the saveState feature, but can also be used by any
                 * user to specify a combined grouping and aggregation configuration
                 * @param {object} config the config you want to apply, in the format
                 * provided out by getGrouping
                 */
                setGrouping: function ( config ) {
                  service.setGrouping(grid, config);
                },
                
                /**
                 * @ngdoc function
                 * @name groupColumn
                 * @methodOf  ui.grid.grouping.api:PublicApi
                 * @description Adds this column to the existing grouping, at the end of the priority order.
                 * If the column doesn't have a sort, adds one, by default ASC
                 * 
                 * This column will move to the left of any non-group columns, the
                 * move is handled in a columnProcessor, so gets called as part of refresh
                 * 
                 * @param {string} columnName the name of the column we want to group
                 */
                groupColumn: function( columnName ) {
                  var column = grid.getColumn(columnName);
                  service.groupColumn(grid, column);
                },

                /**
                 * @ngdoc function
                 * @name ungroupColumn
                 * @methodOf  ui.grid.grouping.api:PublicApi
                 * @description Removes the groupPriority from this column.  If the
                 * column was previously aggregated the aggregation will come back. 
                 * The sort will remain.  
                 * 
                 * This column will move to the right of any other group columns, the
                 * move is handled in a columnProcessor, so gets called as part of refresh
                 * 
                 * @param {string} columnName the name of the column we want to ungroup
                 */
                ungroupColumn: function( columnName ) {
                  var column = grid.getColumn(columnName);
                  service.ungroupColumn(grid, column);
                },
                
                /**
                 * @ngdoc function
                 * @name clearGrouping
                 * @methodOf  ui.grid.grouping.api:PublicApi
                 * @description Clear any grouped columns and any aggregations.  Doesn't remove sorting,
                 * as we don't know whether that sorting was added by grouping or was there beforehand
                 * 
                 */
                clearGrouping: function() {
                  service.clearGrouping(grid);
                },
                
                /**
                 * @ngdoc function
                 * @name aggregateColumn
                 * @methodOf  ui.grid.grouping.api:PublicApi
                 * @description Sets the aggregation type on a column, if the 
                 * column is currently grouped then it removes the grouping first.
                 * If the aggregationType is null then will result in the aggregation
                 * being removed
                 * 
                 * @param {string} columnName the column we want to aggregate
                 * @param {string} aggregationType one of the recognised types
                 * from uiGridGroupingConstants
                 */
                aggregateColumn: function( columnName, aggregationType){
                  var column = grid.getColumn(columnName);
                  service.aggregateColumn( grid, column, aggregationType );
                }
              }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);

          grid.api.registerMethodsFromObject(publicApi.methods);
          
          grid.api.core.on.sortChanged( $scope, service.tidyPriorities);

        },

        defaultGridOptions: function (gridOptions) {
          //default option to true unless it was explicitly set to false
          /**
           *  @ngdoc object
           *  @name ui.grid.grouping.api:GridOptions
           *
           *  @description GridOptions for grouping feature, these are available to be
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           *  @ngdoc object
           *  @name enableGrouping
           *  @propertyOf  ui.grid.grouping.api:GridOptions
           *  @description Enable row grouping for entire grid.
           *  <br/>Defaults to true
           */
          gridOptions.enableGrouping = gridOptions.enableGrouping !== false;

          /**
           *  @ngdoc object
           *  @name groupingRowHeaderWidth
           *  @propertyOf  ui.grid.grouping.api:GridOptions
           *  @description Base width of the grouping header, provides for a single level of grouping.  This
           *  is incremented by `groupingIndent` for each extra level
           *  <br/>Defaults to 30
           */
          gridOptions.groupingRowHeaderBaseWidth = gridOptions.groupingRowHeaderBaseWidth || 30;

          /**
           *  @ngdoc object
           *  @name groupingIndent
           *  @propertyOf  ui.grid.grouping.api:GridOptions
           *  @description Number of pixels of indent for the icon at each grouping level, wider indents are visually more pleasing,
           *  but will make the group row header wider
           *  <br/>Defaults to 10
           */
          gridOptions.groupingIndent = gridOptions.groupingIndent || 10;
          
          /**
           *  @ngdoc object
           *  @name groupingRowHeaderAlwaysVisible
           *  @propertyOf  ui.grid.grouping.api:GridOptions
           *  @description forces the groupRowHeader to always be present, even if nothing is grouped.  In some situations this
           *  may be preferable to having the groupHeader come and go
           *  <br/>Defaults to false
           */
          gridOptions.groupingRowHeaderAlwaysVisible = gridOptions.groupingRowHeaderAlwaysVisible === true;

          /**
           *  @ngdoc object
           *  @name groupingShowCounts
           *  @propertyOf  ui.grid.grouping.api:GridOptions
           *  @description shows counts on the groupHeader rows
           *  <br/>Defaults to true
           */
          gridOptions.groupingShowCounts = gridOptions.groupingShowCounts !== false;
        },


        /**
         * @ngdoc function
         * @name groupingColumnBuilder
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Sets the grouping defaults based on the columnDefs
         * 
         * @param {object} colDef columnDef we're basing on
         * @param {GridCol} col the column we're to update
         * @param {object} gridOptions the options we should use
         * @returns {promise} promise for the builder - actually we do it all inline so it's immediately resolved
         */
        groupingColumnBuilder: function (colDef, col, gridOptions) {
          /**
           *  @ngdoc object
           *  @name ui.grid.grouping.api:ColumnDef
           *
           *  @description ColumnDef for grouping feature, these are available to be 
           *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
           */

          /**
           *  @ngdoc object
           *  @name enableGrouping
           *  @propertyOf  ui.grid.grouping.api:ColumnDef
           *  @description Enable grouping on this column
           *  <br/>Defaults to true.
           */
          if (colDef.enableGrouping === false){
            return;
          }
          
          /**
           *  @ngdoc object
           *  @name grouping
           *  @propertyOf  ui.grid.grouping.api:ColumnDef
           *  @description Set the grouping for a column.  Format is:
           *  ```
           *    {
           *      groupPriority: <number, starts at 0, if less than 0 or undefined then we're aggregating in this column>,
           *      aggregation: <one of uiGridGroupingConstants.aggregation.XXXX>
           *    }
           *  ```
           *  We group in the priority order given, this will also put these columns to the high order of the sort irrespective
           *  of the sort priority given them.  If there is no sort defined then we sort ascending, if there is a sort defined then
           *  we use that sort.
           * 
           *  If the groupPriority is undefined or less than 0, then we expect to be aggregating, and we look at the aggregation
           *  types to determine what sort of aggregation we can do.  Values are in the constants file, but include SUM, COUNT, MAX, MIN
           * 
           *  groupPriorities should generally be sequential, if they're not then the next time getGrouping is called we'll renumber them
           *  to be sequential.
           *  <br/>Defaults to undefined.
           */

          if ( typeof(col.grouping) === 'undefined' && typeof(colDef.grouping) !== 'undefined') {
            col.grouping = angular.copy(colDef.grouping);
          } else if (typeof(col.grouping) === 'undefined'){
            col.grouping = {};
          }
          
          if (typeof(col.grouping) !== 'undefined' && typeof(col.grouping.groupPriority) !== undefined && col.grouping.groupPriority >= 0){
            col.suppressRemoveSort = true;
          } 
          
          /**
           *  @ngdoc object
           *  @name groupingSuppressAggregationText
           *  @propertyOf  ui.grid.grouping.api:ColumnDef
           *  @description Don't print the aggregation text on this column - useful if you have a cellFilter on the column, which 
           *  would otherwise be impacted by the text
           *  <br/>Defaults to false.
           */
          col.groupingSuppressAggregationText = colDef.groupingSuppressAggregationText === true;
          
          var groupColumn = {
            name: 'ui.grid.grouping.group',
            title: i18nService.get().grouping.group,
            icon: 'ui-grid-icon-indent-right',
            shown: function () {
              return typeof(this.context.col.grouping) === 'undefined' || 
                     typeof(this.context.col.grouping.groupPriority) === 'undefined' ||
                     this.context.col.grouping.groupPriority < 0;
            },
            action: function () {
              service.groupColumn( this.context.col.grid, this.context.col );
            }
          };

          var ungroupColumn = {
            name: 'ui.grid.grouping.ungroup',
            title: i18nService.get().grouping.ungroup,
            icon: 'ui-grid-icon-indent-left',
            shown: function () {
              return typeof(this.context.col.grouping) !== 'undefined' && 
                     typeof(this.context.col.grouping.groupPriority) !== 'undefined' &&
                     this.context.col.grouping.groupPriority >= 0;
            },
            action: function () {
              service.ungroupColumn( this.context.col.grid, this.context.col );
            }
          };
          
          var aggregateRemove = {
            name: 'ui.grid.grouping.aggregateRemove',
            title: i18nService.get().grouping.aggregate_remove,
            shown: function () {
              return typeof(this.context.col.grouping) !== 'undefined' && 
                     typeof(this.context.col.grouping.aggregation) !== 'undefined' &&
                     this.context.col.grouping.aggregation !== null;
            },
            action: function () {
              service.aggregateColumn( this.context.col.grid, this.context.col, null);
            }
          };

          // generic adder for the aggregation menus, which follow a pattern
          var addAggregationMenu = function(type){
            var menuItem = {
              name: 'ui.grid.grouping.aggregate' + type,
              title: i18nService.get().grouping['aggregate_' + type],
              shown: function () {
                return typeof(this.context.col.grouping) === 'undefined' || 
                       typeof(this.context.col.grouping.aggregation) === 'undefined' ||
                       this.context.col.grouping.aggregation !== type;
              },
              action: function () {
                service.aggregateColumn( this.context.col.grid, this.context.col, type);
              }
            };

            if (!gridUtil.arrayContainsObjectWithProperty(col.menuItems, 'name', 'ui.grid.grouping.aggregate' + type)) {
              col.menuItems.push(menuItem);
            }
          };
          
          if (!gridUtil.arrayContainsObjectWithProperty(col.menuItems, 'name', 'ui.grid.grouping.group')) {
            col.menuItems.push(groupColumn);
          }

          if (!gridUtil.arrayContainsObjectWithProperty(col.menuItems, 'name', 'ui.grid.grouping.ungroup')) {
            col.menuItems.push(ungroupColumn);
          }
          
          addAggregationMenu(uiGridGroupingConstants.aggregation.COUNT);
          addAggregationMenu(uiGridGroupingConstants.aggregation.SUM);
          addAggregationMenu(uiGridGroupingConstants.aggregation.MAX);
          addAggregationMenu(uiGridGroupingConstants.aggregation.MIN);
          addAggregationMenu(uiGridGroupingConstants.aggregation.AVG);

          if (!gridUtil.arrayContainsObjectWithProperty(col.menuItems, 'name', 'ui.grid.grouping.aggregateRemove')) {
            col.menuItems.push(aggregateRemove);
          }
        },
        
        
        
        /**
         * @ngdoc function
         * @name groupingColumnProcessor
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Updates the visibility of the groupingRowHeader based on whether or not
         * there are any grouped columns
         *
         * @param {array} columns the columns to consider rendering
         * @param {array} rows the grid rows, which we don't use but are passed to us 
         * @returns {array} updated columns array
         */
        groupingColumnProcessor: function( columns, rows ) {
          var grid = this;
          columns.forEach( function(column, index){
            // position used to make stable sort in moveGroupColumns
            column.groupingPosition = index;
            
            // find groupingRowHeader
            if (column.name === uiGridGroupingConstants.groupingRowHeaderColName) {
              var groupingConfig = service.getGrouping(column.grid);
              // decide whether to make it visible
              if (typeof(grid.options.groupingRowHeaderAlwaysVisible) === 'undefined' || grid.options.groupingRowHeaderAlwaysVisible === false) {
                if (groupingConfig.grouping.length > 0){
                  column.visible = true;
                } else {
                  column.visible = false;
                }
              }
              // set the width based on the depth of grouping
              var indent = ( groupingConfig.grouping.length - 1 ) * grid.options.groupingIndent;
              indent = indent > 0 ? indent : 0;
              column.width = grid.options.groupingRowHeaderBaseWidth + indent; 
            }
            
          });
          
          columns = service.moveGroupColumns(this, columns, rows);
          return columns;
        },
        
        
        /**
         * @ngdoc function
         * @name moveGroupColumns
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Moves the column order so that the grouped columns are lined up
         * to the left (well, unless you're RTL, then it's the right).  By doing this in 
         * the columnsProcessor, we make it transient - when the column is ungrouped it'll
         * go back to where it was.
         * 
         * Does nothing if the option `moveGroupColumns` is set to false.
         * 
         * @param {Grid} grid grid object
         * @param {array} columns the columns that we should process/move
         * @param {array} rows the grid rows
         * @returns {array} updated columns
         */
        moveGroupColumns: function( grid, columns, rows ){
          if ( grid.options.moveGroupColumns === false){
            return;
          }
          
          // optimisation - this can be done in the groupingColumnProcessor since we were already
          // iterating.  But commented out and left here to make the code a little more understandable
          //
          // columns.forEach( function(column, index) {
          //   column.groupingPosition = index;
          // });
          
          columns.sort(function(a, b){
            var a_group, b_group;
            if ( typeof(a.grouping) === 'undefined' || typeof(a.grouping.groupPriority) === 'undefined' || a.grouping.groupPriority < 0){
              a_group = null;
            } else {
              a_group = a.grouping.groupPriority;
            }

            if ( typeof(b.grouping) === 'undefined' || typeof(b.grouping.groupPriority) === 'undefined' || b.grouping.groupPriority < 0){
              b_group = null;
            } else {
              b_group = b.grouping.groupPriority;
            }
            
            // groups get sorted to the top
            if ( a_group !== null && b_group === null) { return -1; }
            if ( b_group !== null && a_group === null) { return 1; }
            if ( a_group !== null && b_group !== null) {return a_group - b_group; }

            return a.groupingPosition - b.groupingPosition;
          });
          
          columns.forEach( function(column, index) {
            delete column.groupingPosition;
          });
          
          return columns;
        },


        /**
         * @ngdoc function
         * @name groupColumn
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Adds this column to the existing grouping, at the end of the priority order.
         * If the column doesn't have a sort, adds one, by default ASC
         * 
         * This column will move to the left of any non-group columns, the
         * move is handled in a columnProcessor, so gets called as part of refresh
         * 
         * @param {Grid} grid grid object
         * @param {GridCol} column the column we want to group
         */
        groupColumn: function( grid, column){
          if ( typeof(column.grouping) === 'undefined' ){
            column.grouping = {};
          }
          
          // set the group priority to the next number in the hierarchy
          var existingGrouping = service.getGrouping( grid );
          column.grouping.groupPriority = existingGrouping.grouping.length;
          
          // add sort if not present
          if ( !column.sort ){
            column.sort = { direction: uiGridConstants.ASC };
          } else if ( typeof(column.sort.direction) === 'undefined' || column.sort.direction === null ){
            column.sort.direction = uiGridConstants.ASC;
          }
          
          service.tidyPriorities( grid );
          
          grid.queueGridRefresh();
        },


         /**
         * @ngdoc function
         * @name ungroupColumn
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Removes the groupPriority from this column.  If the
         * column was previously aggregated the aggregation will come back. 
         * The sort will remain.  
         * 
         * This column will move to the right of any other group columns, the
         * move is handled in a columnProcessor, so gets called as part of refresh
         * 
         * @param {Grid} grid grid object
         * @param {GridCol} column the column we want to ungroup
         */
        ungroupColumn: function( grid, column){
          if ( typeof(column.grouping) === 'undefined' ){
            return;
          }
          
          delete column.grouping.groupPriority;
          
          service.tidyPriorities( grid );
          
          grid.queueGridRefresh();
        },
        

        /**
         * @ngdoc function
         * @name aggregateColumn
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Sets the aggregation type on a column, if the 
         * column is currently grouped then it removes the grouping first.
         * 
         * @param {Grid} grid grid object
         * @param {GridCol} column the column we want to aggregate
         * @param {string} aggregationType one of the recognised types
         * from uiGridGroupingConstants
         */
        aggregateColumn: function( grid, column, aggregationType){
          if (typeof(column.grouping) === 'undefined') {
            column.grouping = {};
          }
          
          if (typeof(column.grouping.groupPriority) !== 'undefined' && column.grouping.groupPriority >= 0){
            service.ungroupColumn( grid, column );
          }
          
          column.grouping.aggregation = aggregationType;
          
          grid.queueGridRefresh();
        },
        

       /**
         * @ngdoc function
         * @name setGrouping
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Set the grouping based on a config object, used by the save state feature 
         * (more specifically, by the restore function in that feature )
         * 
         * @param {Grid} grid grid object
         * @param {object} config the config we want to set, same format as that returned by getGrouping
         */
        setGrouping: function ( grid, config ){
          if ( typeof(config) === 'undefined' ){
            return;
          }
          
          // first remove any existing grouping
          service.clearGrouping(grid);
          
          if ( config.grouping && config.grouping.length && config.grouping.length > 0 ){
            config.grouping.forEach( function( group ) {
              var col = grid.getColumn(group.colName);
              
              if ( col ) {
                service.groupColumn( grid, col );
              }
            });
          }

          if ( config.aggregations && config.aggregations.length && config.aggregations.length > 0 ){
            config.aggregations.forEach( function( aggregation ) {
              var col = grid.getColumn(aggregation.colName);
              
              if ( col ) {
                service.aggregateColumn( grid, col, aggregation.aggregation );
              }
            });
          }
          
          if ( config.rowExpandedStates ){
            grid.grouping.rowExpandedStates = config.rowExpandedStates;
          }
        },
        
        
       /**
         * @ngdoc function
         * @name clearGrouping
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Clear any grouped columns and any aggregations.  Doesn't remove sorting,
         * as we don't know whether that sorting was added by grouping or was there beforehand
         * 
         * @param {Grid} grid grid object
         */
        clearGrouping: function( grid ) {
          var currentGrouping = service.getGrouping(grid);
          
          if ( currentGrouping.grouping.length > 0 ){
            currentGrouping.grouping.forEach( function( group ) {
              if (!group.col){
                // should have a group.colName if there's no col
                group.col = grid.getColumn(group.colName);
              }
              service.ungroupColumn(grid, group.col);
            });
          }
          
          if ( currentGrouping.aggregations.length > 0 ){
            currentGrouping.aggregations.forEach( function( aggregation ){
              if (!aggregation.col){
                // should have a group.colName if there's no col
                aggregation.col = grid.getColumn(aggregation.colName);
              }
              service.aggregateColumn(grid, aggregation.col, null);
            });
          }
          
        },
        
        
        /**
         * @ngdoc function
         * @name tidyPriorities
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Renumbers groupPriority and sortPriority such that
         * groupPriority is contiguous, and sortPriority either matches
         * groupPriority (for group columns), and otherwise is contiguous and 
         * higher than groupPriority. 
         * 
         * @param {Grid} grid grid object
         */
        tidyPriorities: function( grid ){
          // if we're called from sortChanged, grid is in this, not passed as param
          if ( typeof(grid) === 'undefined' && typeof(this.grid) !== 'undefined' ) {
            grid = this.grid;
          }
          
          var groupArray = [];
          var sortArray = [];
          
          grid.columns.forEach( function(column, index){
            if ( typeof(column.grouping) !== 'undefined' && typeof(column.grouping.groupPriority) !== 'undefined' && column.grouping.groupPriority >= 0){
              groupArray.push(column);
            } else if ( typeof(column.sort) !== 'undefined' && typeof(column.sort.priority) !== 'undefined' && column.sort.priority >= 0){
              sortArray.push(column);
            }
          });
          
          groupArray.sort(function(a, b){ return a.grouping.groupPriority - b.grouping.groupPriority; });
          groupArray.forEach( function(column, index){
            column.grouping.groupPriority = index;
            column.suppressRemoveSort = true;
            if ( typeof(column.sort) === 'undefined'){
              column.sort = {};
            }
            column.sort.priority = index;
          });

          var i = groupArray.length;
          sortArray.sort(function(a, b){ return a.sort.priority - b.sort.priority; });
          sortArray.forEach( function(column, index){
            column.sort.priority = i;
            column.suppressRemoveSort = column.colDef.suppressRemoveSort;
            i++;
          });
        },
        
        
        /**
         * @ngdoc function
         * @name expandAllRows
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Makes each row of the grid visible (from a grouping perspective,
         * they may still be invisible for other reasons)
         * 
         * @param {Grid} grid grid object
         */
        expandAllRows: function (grid) {
          service.setAllNodes( grid.grouping.rowExpandedStates, uiGridGroupingConstants.EXPANDED );
          grid.queueGridRefresh();
        },
 
        
        /**
         * @ngdoc function
         * @name collapseAllRows
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Makes each row of the grid invisible (from a grouping perspective)
         * 
         * @param {Grid} grid grid object
         */
        collapseAllRows: function (grid) {
          service.setAllNodes( grid.grouping.rowExpandedStates, uiGridGroupingConstants.COLLAPSED );
          grid.queueGridRefresh();
        },


        /**
         * @ngdoc function
         * @name setAllNodes
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Works through a subset of grid.grouping.rowExpandedStates, setting
         * all child nodes (and their descendents) of the provided node to the given state.
         * 
         * Calls itself recursively on all nodes so as to achieve this.
         * 
         * @param {object} expandedStatesSubset the portion of the tree that we want to update
         */
        setAllNodes: function (expandedStatesSubset, targetState) {
          // set this node
          expandedStatesSubset.state = targetState;
          
          // set all child nodes
          angular.forEach(expandedStatesSubset, function( childNode, key){
            if (key !== 'state'){
              service.setAllNodes(childNode, targetState);
            }
          });
        },

        
        /**
         * @ngdoc function
         * @name toggleRowGroupingState
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Toggles the expand or collapse state of this grouped row.
         * If the row isn't a groupHeader, does nothing.
         * 
         * @param {Grid} grid grid object
         * @param {GridRow} row the row we want to toggle
         */
        toggleRowGroupingState: function ( grid, row ){
          if (!row.groupHeader){
            return;
          }
          
          if (row.expandedState.state === uiGridGroupingConstants.EXPANDED){
            row.expandedState.state = uiGridGroupingConstants.COLLAPSED;
          } else {
            row.expandedState.state = uiGridGroupingConstants.EXPANDED;
          }
          
          grid.queueGridRefresh();
        },
        

        /**
         * @ngdoc function
         * @name expandRow
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Expands this specific row, showing only immediate children.
         * 
         * If this row isn't a groupHeader, we do nothing 
         * 
         * @param {Grid} grid grid object
         * @param {GridRow} row the row we want to expand
         */
        expandRow: function ( grid, row ){
          if (!row.groupHeader){
            return;
          }
          
          row.expandedState.state = uiGridGroupingConstants.EXPANDED;
          grid.queueGridRefresh();
        },
        

        /**
         * @ngdoc function
         * @name expandRowChildren
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Expands this specific row, showing all children.
         * 
         * If this row isn't a groupHeader, we do nothing 
         * 
         * @param {Grid} grid grid object
         * @param {GridRow} row the row we want to expand
         */
        expandRowChildren: function ( grid, row ){
          if (!row.groupHeader){
            return;
          }
          
          service.setAllNodes(row.expandedState, uiGridGroupingConstants.COLLAPSED);
          grid.queueGridRefresh();
        },
        

       /**
         * @ngdoc function
         * @name collapseRow
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Collapses this specific row
         *
         * @param {Grid} grid grid object
         * @param {GridRow} row the row we want to collapse
         */
        collapseRow: function( grid, row ){
          if (!row.groupHeader){
            return;
          }

          row.expandedState.state = uiGridGroupingConstants.COLLAPSED;
          grid.queueGridRefresh();
        },
        
        
       /**
         * @ngdoc function
         * @name collapseRowChildren
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Collapses this specific row and all children
         *
         * @param {Grid} grid grid object
         * @param {GridRow} row the row we want to collapse
         */
        collapseRowChildren: function( grid, row ){
          if (!row.groupHeader){
            return;
          }

          service.setAllNodes(row.expandedState, uiGridGroupingConstants.COLLAPSED);
          grid.queueGridRefresh();
        },

        
       /**
         * @ngdoc function
         * @name groupRows
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description The rowProcessor that creates the groupHeaders (i.e. does
         * the actual grouping).
         * 
         * Assumes it is always called after the sorting processor (TODO: how do we prove that?)
         * 
         * Processes all the rows in order, inserting a groupHeader row whenever there is a change
         * in value of a grouped row, the groupHeader will also cause an update to (or insertion into) the
         * grid.grouping.rowExpandedStates hash, and a reference to that entry (including it's sub-tree) to be held 
         * on the gridRow itself in row.expandedState.
         * 
         * Aggregates any configured row values whilst it goes, and updates those aggregations into
         * the previously created groupHeader upon the break in value (aggregations are maintained at each level
         * of grouping)
         * 
         * Uses the `grid.grouping.rowExpandedStates` to decide which rows are visible, the rule is that once any parent
         * node is collapsed, all nodes below that will be invisible.
         * 
         * As it processes it maintains a `groupingProcessingState` array. This records, for each level of grouping we're
         * working with, the following information:
         * ```
         *   {
         *     fieldName: name,
         *     col: col,
         *     initialised: boolean,
         *     currentValue: value,
         *     currentGroupHeader: gridRow,
         *     runningAggregations 
         *       field: {type: xxxx, value: 1234},
         *       field: {type: yyyy, value: 2345)
         *     }
         *   }
         * ```
         * We look for changes in the currentValue at any of the levels.  Where we find a change we:
         * 
         * - write out any aggregations to the currentGroupHeader, and reset them
         * - create a new groupHeader row in the array
         * 
         * If there is no change, we just run the aggregations
         * 
         * @param {array} renderableRows the rows we want to process, usually the output from the previous rowProcessor
         * @returns {array} the updated rows, including our new group rows
         */
        groupRows: function( renderableRows ) {
          if (renderableRows.length === 0){
            return renderableRows;
          }

          var grid = this;
          var groupingProcessingState = service.initialiseProcessingState( grid );
          
          // processes each of the fields we are grouping by, checks if the value has changed and inserts a groupHeader, 
          // otherwise aggregates.  Broken out as shouldn't create functions in a loop.
          var updateProcessingState = function( groupFieldState, stateIndex ) {
            var fieldValue = grid.getCellValue(row, groupFieldState.col); 
            if ( typeof(fieldValue) === 'undefined' || fieldValue === null ){
              return;
            }
            
            if ( !row.visible ){
              return;
            }
            
            // look for change of value - and insert a header
            if ( !groupFieldState.initialised || fieldValue !== groupFieldState.currentValue ){
              service.insertGroupHeader( grid, renderableRows, i, groupingProcessingState, stateIndex );
              i++;
            }
            service.aggregate( grid, row, groupFieldState );
          };
          
          // use a for loop because it's tolerant of the array length changing whilst we go - we can 
          // manipulate the iterator when we insert groupHeader rows
          for (var i = 0; i < renderableRows.length; i++ ){
            var row = renderableRows[i];
            
            groupingProcessingState.forEach( updateProcessingState);
            
            service.setVisibility( grid, row, groupingProcessingState );
          }
          
          // write out the last aggregation amounts
          service.writeOutAggregations( grid, groupingProcessingState, 0);

          
          return renderableRows.filter(function (row) { return row.visible; });
        },
        
        
       /**
         * @ngdoc function
         * @name initialiseProcessingState
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description The rowProcessor that creates the groupHeaders (i.e. does
         * the actual grouping).
         * 
         * @param {Grid} grid grid object
         * @returns {array} an array in the format described in the groupRows method, 
         * initialised with blank values
         */
        initialiseProcessingState: function( grid ){
          var processingState = [];
          var columnSettings = service.getGrouping( grid );
          
          columnSettings.grouping.forEach( function( groupItem, index){
            // get the aggregation config to copy in - do this multiple times as shallow copying it
            // was harder than it looked, and as much work as just creating it again
            var aggregations = [];
            if (grid.options.groupingShowCounts){
              aggregations.push({type: uiGridGroupingConstants.aggregation.COUNT, fieldName: uiGridGroupingConstants.aggregation.FIELD, value: null });
            } else {
            }
            columnSettings.aggregations.forEach( function(aggregation, index){
              
              if (aggregation.aggregation === uiGridGroupingConstants.aggregation.AVG){
                aggregations.push({ type: aggregation.aggregation, fieldName: aggregation.field, col: aggregation.col, value: null, sum: null, count: null });
              } else {
                aggregations.push({ type: aggregation.aggregation, fieldName: aggregation.field, col: aggregation.col, value: null });  
              }
            });
            
            processingState.push({ 
              fieldName: groupItem.field,
              col: groupItem.col,
              initialised: false,
              currentValue: null,
              currentGroupHeader: null,
              runningAggregations: aggregations
            });
          });
          
          return processingState;          
        },

        
       /**
         * @ngdoc function
         * @name getGrouping
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Get the grouping settings from the columns.  As a side effect
         * this always renumbers the grouping starting at 0
         * @param {Grid} grid grid object
         * @returns {array} an array of the group fields, in order of priority
         */
        getGrouping: function( grid ){
          var groupArray = [];
          var aggregateArray = [];
          
          // get all the grouping
          grid.columns.forEach( function(column, columnIndex){
            if ( column.grouping ){
              if ( typeof(column.grouping.groupPriority) !== 'undefined' && column.grouping.groupPriority >= 0){
                groupArray.push({ field: column.field, col: column, groupPriority: column.grouping.groupPriority, grouping: column.grouping });  
              } else if ( column.grouping.aggregation ){
                aggregateArray.push({ field: column.field, col: column, aggregation: column.grouping.aggregation });
              }
            }
          });

          // sort grouping into priority order
          groupArray.sort( function(a, b){
            return a.groupPriority - b.groupPriority;
          });
          
          // renumber the priority in case it was somewhat messed up, then remove the grouping reference
          groupArray.forEach( function( group, index) {
            group.grouping.groupPriority = index;
            group.groupPriority = index;
            delete group.grouping;
          }); 
          
          return { grouping: groupArray, aggregations: aggregateArray };
        },
        
        
       /**
         * @ngdoc function
         * @name insertGroupHeader
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Create a group header row, and link it to the various configuration
         * items that we use.  Write out any grouping aggregation for this group and groups that are children of this one
         * @param {Grid} grid grid object
         * @param {array} renderableRows the rows that we are processing
         * @param {number} rowIndex the row we were up to processing
         * @param {array} groupingProcessingState the state we're up to - we update this when we write out
         * the aggregation
         * @param {number} stateIndex the processing state item that we were on when we triggered a new group header - 
         * i.e. the column that we want to create a header for
         */
        insertGroupHeader: function( grid, renderableRows, rowIndex, groupingProcessingState, stateIndex ) {
          // write out aggregations for this column grouping and any child groupings, and reinitialise those states
          service.writeOutAggregations( grid, groupingProcessingState, stateIndex);
          
          var headerRow = new GridRow( {}, null, grid );
          
          gridClassFactory.rowTemplateAssigner.call(grid, headerRow);          
          
          // set the value that caused the end of a group into the header row and the processing state
          var fieldName = groupingProcessingState[stateIndex].fieldName;
          var col = groupingProcessingState[stateIndex].col;

          // TODO: can't just use entity like this, have to use get cell value, need col for that
          var newValue = grid.getCellValue(renderableRows[rowIndex], col);
          headerRow.entity[fieldName] = newValue;
          headerRow.groupLevel = stateIndex;
          headerRow.groupHeader = true;
          headerRow.internalRow = true;
          headerRow.enableEditing = false;
          headerRow.enableSelection = false;
          groupingProcessingState[stateIndex].initialised = true;
          groupingProcessingState[stateIndex].currentValue = newValue;
          groupingProcessingState[stateIndex].currentGroupHeader = headerRow;
          
          headerRow.expandedState = service.getExpandedState( grid, groupingProcessingState, stateIndex);
          service.setVisibility( grid, headerRow, groupingProcessingState );
          
          // insert our new header row
          renderableRows.splice(rowIndex, 0, headerRow);
        },
        
        
       /**
         * @ngdoc function
         * @name writeOutAggregations
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Write out the aggregations for the group that has changed, and any children of that group, which 
         * by definition have changed as well.  Reset the processing state to reflect that all children of the group now
         * triggered a new group as well
         * @param {Grid} grid grid object
         * @param {array} groupingProcessingState the state we're up to - we update this when we write out
         * the aggregation
         * @param {number} stateIndex the processing state item that we were on when we triggered a new group header - 
         * i.e. the column that we want to create a header for
         */
        writeOutAggregations: function( grid, groupingProcessingState, stateIndex ) {
          for (var i = stateIndex; i < groupingProcessingState.length; i++ ){
            service.writeOutAggregation( grid, groupingProcessingState[i] );
          }
        },
        
        
       /**
         * @ngdoc function
         * @name writeOutAggregation
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Writes a single aggregation to the linked groupingHeader, and clears the processing state
         * for that group 
         * @param {Grid} grid grid object
         * @param {object} processingState the specific group column that we're writing out state for, and resetting
         * the aggregation
         */
        writeOutAggregation: function( grid, processingState ) {
          if ( processingState.currentGroupHeader ){
            processingState.runningAggregations.forEach( function( aggregation, index ){
              if (aggregation.fieldName === uiGridGroupingConstants.aggregation.FIELD){
                // running total to include in the groupHeader
                processingState.currentGroupHeader.entity[processingState.fieldName] = processingState.currentValue + ' (' + aggregation.value + ')';
                aggregation.value = null; 
              } else {
                if (aggregation.col.groupingSuppressAggregationText){
                  processingState.currentGroupHeader.entity[aggregation.fieldName] = aggregation.value;
                } else {
                  processingState.currentGroupHeader.entity[aggregation.fieldName] = i18nService.get().aggregation[aggregation.type] + aggregation.value;
                }
                aggregation.value = null;
                if ( aggregation.sum ){
                  aggregation.sum = null;
                }
                if ( aggregation.count ){
                  aggregation.count = null;
                }
              }
            });
          }
          processingState.currentGroupHeader = null;
          processingState.currentValue = null;
          processingState.initialised = false;
        },
        

       /**
         * @ngdoc function
         * @name getExpandedState
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Gets the expanded state reference from the `grid.grouping.rowExpandedStates` for 
         * the given processingState and state index.  In effect this is finding the entry for a given 
         * groupingHeader so that we can store a reference to it on the groupHeader, and use it to work
         * out visibility.
         * 
         * @param {Grid} grid grid object
         * @param {array} groupingProcessingState the state we're currently in (contains the current values
         * of each of the groups)
         * @param {number} stateIndex the index of the processing state (i.e. column) that we want the reference for
         */
        getExpandedState: function( grid, groupingProcessingState, stateIndex){
          var currentNode = grid.grouping.rowExpandedStates;
          
          for ( var i = 0; i <= stateIndex; i++ ){
            // if no node for this group value, then create it
            if ( !currentNode[groupingProcessingState[i].currentValue] ){
              currentNode[groupingProcessingState[i].currentValue] = { state: uiGridGroupingConstants.COLLAPSED };
            }
            currentNode = currentNode[groupingProcessingState[i].currentValue];
          }
          
          return currentNode;
        },
        
        
       /**
         * @ngdoc function
         * @name setVisibility
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Determine the visibility of a row based on the processing state, which contains references to the
         * row headers, and therefore to the relevant rowExpandedStates.
         * 
         * @param {Grid} grid grid object
         * @param {GridRow} row the row we want to set grouping visibility on
         * @param {array} groupingProcessingState the state we're currently in (contains the current values
         * of each of the groups)
         */
        setVisibility: function( grid, row, groupingProcessingState ){
          // don't set visibility on an already invisible row
          if (!row.visible){
            return;
          }
          
          var groupLevel = typeof(row.groupLevel) !== 'undefined' ? row.groupLevel : groupingProcessingState.length;
          for (var i = 0; i < groupLevel; i++){
            if ( groupingProcessingState[i].currentGroupHeader.expandedState.state === uiGridGroupingConstants.COLLAPSED ){
             row.visible = false;
            }
          }
        },
        
        
       /**
         * @ngdoc function
         * @name aggregate
         * @methodOf  ui.grid.grouping.service:uiGridGroupingService
         * @description Accumulate the data from this row onto the aggregation for each processingState (for each level of grouping).
         * 
         * @param {Grid} grid grid object
         * @param {GridRow} row the row we want to set grouping visibility on
         * @param {object} groupFieldState the processing state for the field/column/group we're currently processing for
         */
        aggregate: function( grid, row, groupFieldState ){
          // TODO: check data types, cast as necessary, all that jazz
          groupFieldState.runningAggregations.forEach(  function( aggregation, index ){
            if (aggregation.type === uiGridGroupingConstants.aggregation.COUNT){
              // don't need getCellValue for counting, and column isn't present sometimes
              aggregation.value++;
            } else {
              var fieldValue = grid.getCellValue(row, aggregation.col);
              var numValue = Number(fieldValue);
              switch (aggregation.type) {
                case uiGridGroupingConstants.aggregation.SUM:
                  if (!isNaN(numValue)){
                    aggregation.value += numValue;
                  }
                  break;
                case uiGridGroupingConstants.aggregation.MIN:
                  if (fieldValue !== undefined && fieldValue !== null && (fieldValue < aggregation.value || aggregation.value === null)){
                    aggregation.value = fieldValue;
                  }
                  break;
                case uiGridGroupingConstants.aggregation.MAX:
                  if (fieldValue !== undefined && fieldValue > aggregation.value){
                    aggregation.value = fieldValue;
                  }
                  break;
                case uiGridGroupingConstants.aggregation.AVG:
                  aggregation.count++;
                  if (!isNaN(numValue)){
                    aggregation.sum += numValue;
                  }
                  aggregation.value = aggregation.sum / aggregation.count;
                  break;
              }
            }
          });
        }
      };

      return service;

    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.grouping.directive:uiGridGrouping
   *  @element div
   *  @restrict A
   *
   *  @description Adds grouping features to grid
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.grouping']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
      ];

      $scope.columnDefs = [
        {name: 'name', enableCellEdit: true},
        {name: 'title', enableCellEdit: true}
      ];
      
      $scope.gridOptions = { columnDefs: $scope.columnDefs, data: $scope.data };
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="gridOptions" ui-grid-grouping></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridGrouping', ['uiGridGroupingConstants', 'uiGridGroupingService', '$templateCache',
    function (uiGridGroupingConstants, uiGridGroupingService, $templateCache) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              if (uiGridCtrl.grid.options.enableGrouping !== false){
                uiGridGroupingService.initializeGrid(uiGridCtrl.grid, $scope);
                var groupingRowHeaderDef = {
                  name: uiGridGroupingConstants.groupingRowHeaderColName,
                  displayName: '',
                  width:  uiGridCtrl.grid.options.groupingRowHeaderWidth,
                  minWidth: 10,
                  cellTemplate: 'ui-grid/groupingRowHeader',
                  headerCellTemplate: 'ui-grid/groupingHeaderCell',
                  enableColumnResizing: false,
                  enableColumnMenu: false,
                  exporterSuppressExport: true,
                  allowCellFocus: true
                };
  
                uiGridCtrl.grid.addRowHeaderColumn(groupingRowHeaderDef);
                uiGridCtrl.grid.registerColumnBuilder( uiGridGroupingService.groupingColumnBuilder);
              }
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {

            }
          };
        }
      };
    }]);


  /**
   *  @ngdoc directive
   *  @name ui.grid.grouping.directive:uiGridGroupingRowHeaderButtons
   *  @element div
   *
   *  @description Provides the expand/collapse button on groupHeader rows 
   */
  module.directive('uiGridGroupingRowHeaderButtons', ['$templateCache', 'uiGridGroupingService',
    function ($templateCache, uiGridGroupingService) {
      return {
        replace: true,
        restrict: 'E',
        template: $templateCache.get('ui-grid/groupingRowHeaderButtons'),
        scope: true,
        require: '^uiGrid',
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var self = uiGridCtrl.grid;
          $scope.groupButtonClick = function(row, evt) {
            uiGridGroupingService.toggleRowGroupingState(self, row, evt);
          };
        }
      };
    }]);


  /**
   *  @ngdoc directive
   *  @name ui.grid.grouping.directive:uiGridGroupingExpandAllButtons
   *  @element div
   *
   *  @description Provides the expand/collapse all button 
   */
  module.directive('uiGridGroupingExpandAllButtons', ['$templateCache', 'uiGridGroupingService',
    function ($templateCache, uiGridGroupingService) {
      return {
        replace: true,
        restrict: 'E',
        template: $templateCache.get('ui-grid/groupingExpandAllButtons'),
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var self = $scope.col.grid;

          $scope.headerButtonClick = function(row, evt) {
            if ( self.grouping.expandAll ){
              uiGridGroupingService.collapseAllRows(self, evt);
              self.grouping.expandAll = false;
            } else {
              uiGridGroupingService.expandAllRows(self, evt);
              self.grouping.expandAll = true;
            }
          };
        }
      };
    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.grouping.directive:uiGridViewport
   *  @element div
   *
   *  @description Stacks on top of ui.grid.uiGridViewport to set formatting on a group header row
   */
  module.directive('uiGridViewport',
    ['$compile', 'uiGridConstants', 'uiGridGroupingConstants', 'gridUtil', '$parse', 'uiGridGroupingService',
      function ($compile, uiGridConstants, uiGridGroupingConstants, gridUtil, $parse, uiGridGroupingService) {
        return {
          priority: -200, // run after default  directive
          scope: false,
          compile: function ($elm, $attrs) {
            var rowRepeatDiv = angular.element($elm.children().children()[0]);

            var existingNgClass = rowRepeatDiv.attr("ng-class");
            var newNgClass = '';
            if ( existingNgClass ) {
              newNgClass = existingNgClass.slice(0, -1) + ",'ui-grid-group-header-row': row.groupLevel > -1}";
            } else {
              newNgClass = "{'ui-grid-group-header-row': row.groupLevel > -1}";
            }
            rowRepeatDiv.attr("ng-class", newNgClass);

            return {
              pre: function ($scope, $elm, $attrs, controllers) {

              },
              post: function ($scope, $elm, $attrs, controllers) {
              }
            };
          }
        };
      }]);

})();
