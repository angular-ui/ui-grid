(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.treeView
   * @description
   *
   *  # ui.grid.treeView
   * This module provides a tree view of the data that it is provided, with nodes in that
   * tree and leaves.  Unlike grouping, the tree is an inherent property of the data and must 
   * be provided with your data array.  If you are using treeView you probably should disable sorting.
   * 
   * Filtering is plausible, but requires some reworking to work with treeView - ideally the
   * parent nodes would be shown whenever a child node or leaf node under them matched the filter
   * 
   * Design information:
   * -------------------
   * 
   * The raw data that is provided must come with a $$treeLevel on any non-leaf node.  TreeView
   * will run a rowsProcessor to set expand buttons alongside these nodes, and will maintain the
   * expand/collapse state of each node.
   * 
   * In future a count of the direct children of each node could optionally be calculated and displayed
   * alongside the node - the current issue is deciding where to display that.  For now we calculate it 
   * but don't display it.
   * 
   * In future the count could be used to remove the + from a row that doesn't actually have any children.
   * 
   * Optionally the treeView can be populated only when nodes are clicked on.  This will provide callbacks when
   * nodes are expanded, requesting the additional data.  The node will be set to expanded, and when the data
   * is added to the grid then it will automatically be displayed by the rowsProcessor.
   * 
   *  Treeview adds information to the rows 
   *  - treeLevel - if present and > -1 tells us the level (level 0 is the top level) 
   *  - expandedState = object: pointer to the node in the grid.treeView.rowExpandedStates that refers
   *    to this row, allowing us to manipulate the state
   * 
   * Since the logic is baked into the rowsProcessors, it should get triggered whenever
   * row order or filtering or anything like that is changed.  We recall the expanded state
   * across invocations of the rowsProcessors by putting it into the grid.treeView.rowExpandedStates hash.
   * 
   * By default rows are collapsed, which means all data rows have their visible property
   * set to false, and only level 0 group rows are set to visible.
   * 
   * We rely on the rowsProcessors to do the actual expanding and collapsing, so we set the flags we want into
   * grid.treeView.rowExpandedStates, then call refresh.  This is because we can't easily change the visible
   * row cache without calling the processors, and once we've built the logic into the rowProcessors we may as
   * well use it all the time.
   *  
   * <br/>
   * <br/>
   *
   * <div doc-module-components="ui.grid.treeView"></div>
   */

  var module = angular.module('ui.grid.treeView', ['ui.grid']);

  /**
   *  @ngdoc object
   *  @name ui.grid.treeView.constant:uiGridTreeViewConstants
   *
   *  @description constants available in treeView module
   * 
   */
  module.constant('uiGridTreeViewConstants', {
    featureName: "treeView",
    treeViewRowHeaderColName: 'treeViewRowHeaderCol',
    EXPANDED: 'expanded',
    COLLAPSED: 'collapsed'
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.treeView.service:uiGridTreeViewService
   *
   *  @description Services for treeView features
   */
  module.service('uiGridTreeViewService', ['$q', 'uiGridTreeViewConstants', 'gridUtil', 'GridRow', 'gridClassFactory', 'i18nService', 'uiGridConstants',
    function ($q, uiGridTreeViewConstants, gridUtil, GridRow, gridClassFactory, i18nService, uiGridConstants) {

      var service = {

        initializeGrid: function (grid, $scope) {

          //add feature namespace and any properties to grid for needed
          /**
           *  @ngdoc object
           *  @name ui.grid.treeView.grid:treeView
           *
           *  @description Grid properties and functions added for treeView
           */
          grid.treeView = {};

          /**
           *  @ngdoc property
           *  @propertyOf ui.grid.treeView.grid:treeView
           *  @name numberLevels
           *
           *  @description Total number of tree levels currently used, calculated by the rowsProcessor by 
           *  retaining the highest tree level it sees 
           */
          grid.treeView.numberLevels = 0;

          /**
           *  @ngdoc property
           *  @propertyOf ui.grid.treeView.grid:treeView
           *  @name expandAll
           *
           *  @description Whether or not the expandAll box is selected
           */
          grid.treeView.expandAll = false;
          
          /**
           *  @ngdoc property
           *  @propertyOf ui.grid.treeView.grid:treeView
           *  @name rowExpandedStates
           *
           *  @description Nested hash that holds all the expanded states based on the nodes.
           *  We use the row.uid as the key into the hash, only because we need a key.  
           *  
           *  ```
           *    {
           *      uiGrid-DXNP: {
           *        state: 'expanded',
           *        uiGrid-DAP: { state: 'expanded' },
           *        uiGrid-BBB: { state: 'collapsed' },
           *        uiGrid-AAA: { state: 'expanded' },
           *        uiGrid-CCC: { state: 'collapsed' }
           *      },
           *      uiGrid-DXNG: {
           *        state: 'collapsed',
           *        uiGrid-DDD: { state: 'expanded' },
           *        uiGrid-XXX: { state: 'collapsed' },
           *        uiGrid-YYY: { state: 'expanded' }
           *      }
           *    }
           *  ```
           *  Missing values are false - meaning they aren't expanded.
           * 
           *  This is used because the rowProcessors run every time the grid is refreshed, so
           *  we'd lose the expanded state every time the grid was refreshed.  This instead gives
           *  us a reliable lookup that persists across rowProcessors.
           * 
           */
          grid.treeView.rowExpandedStates = {};

          service.defaultGridOptions(grid.options);
          
          grid.registerRowsProcessor(service.treeRows, 410);
          
          /**
           *  @ngdoc object
           *  @name ui.grid.treeView.api:PublicApi
           *
           *  @description Public Api for treeView feature
           */
          var publicApi = {
            events: {
              treeView: {
                /**
                 * @ngdoc event
                 * @eventOf ui.grid.treeView.api:PublicApi
                 * @name rowExpanded
                 * @description raised whenever a row is expanded.  If you are dynamically 
                 * rendering your tree you can listen to this event, and then retrieve
                 * the children of this row and load them into the grid data.
                 * 
                 * When the data is loaded the grid will automatically refresh to show these new rows
                 * 
                 * <pre>
                 *      gridApi.treeView.on.rowExpanded(scope,function(row){})
                 * </pre>
                 * @param {gridRow} row the row that was expanded.  You can also 
                 * retrieve the grid from this row with row.grid
                 */
                rowExpanded: {},

                /**
                 * @ngdoc event
                 * @eventOf ui.grid.treeView.api:PublicApi
                 * @name rowCollapsed
                 * @description raised whenever a row is collapsed.  Doesn't really have
                 * a purpose at the moment, included for symmetry
                 * 
                 * <pre>
                 *      gridApi.treeView.on.rowCollapsed(scope,function(row){})
                 * </pre>
                 * @param {gridRow} row the row that was collapsed.  You can also 
                 * retrieve the grid from this row with row.grid
                 */
                rowCollapsed: {}
              }
            },
            methods: {
              treeView: {
                /**
                 * @ngdoc function
                 * @name expandAllRows
                 * @methodOf  ui.grid.treeView.api:PublicApi
                 * @description Expands all tree rows
                 */
                expandAllRows: function () {
                  service.expandAllRows(grid);
                },
                
                /**
                 * @ngdoc function
                 * @name collapseAllRows
                 * @methodOf  ui.grid.treeView.api:PublicApi
                 * @description collapse all tree rows
                 */
                collapseAllRows: function () {
                  service.collapseAllRows(grid);
                },
                
                /**
                 * @ngdoc function
                 * @name toggleRowTreeViewState
                 * @methodOf  ui.grid.treeView.api:PublicApi
                 * @description  call expand if the row is collapsed, collapse if it is expanded
                 * @param {gridRow} row the row you wish to toggle
                 */
                toggleRowTreeViewState: function (row) {
                  service.toggleRowTreeViewState(grid, row);
                },
                
                /**
                 * @ngdoc function
                 * @name expandRow
                 * @methodOf  ui.grid.treeView.api:PublicApi
                 * @description expand the immediate children of the specified row
                 * @param {gridRow} row the row you wish to expand
                 */
                expandRow: function (row) {
                  service.expandRow(grid, row);
                },
                
                /**
                 * @ngdoc function
                 * @name expandRowChildren
                 * @methodOf  ui.grid.treeView.api:PublicApi
                 * @description expand all children of the specified row
                 * @param {gridRow} row the row you wish to expand
                 */
                expandRowChildren: function (row) {
                  service.expandRowChildren(grid, row);
                },
                
                /**
                 * @ngdoc function
                 * @name collapseRow
                 * @methodOf  ui.grid.treeView.api:PublicApi
                 * @description collapse  the specified row.  When
                 * you expand the row again, all grandchildren will retain their state
                 * @param {gridRow} row the row you wish to collapse
                 */
                collapseRow: function ( row ) {
                  service.collapseRow(grid, row);
                },

                /**
                 * @ngdoc function
                 * @name collapseRowChildren
                 * @methodOf  ui.grid.treeView.api:PublicApi
                 * @description collapse all children of the specified row.  When
                 * you expand the row again, all grandchildren will be collapsed
                 * @param {gridRow} row the row you wish to collapse children for
                 */
                collapseRowChildren: function ( row ) {
                  service.collapseRowChildren(grid, row);
                },

                /**
                 * @ngdoc function
                 * @name getGrouping
                 * @methodOf  ui.grid.treeView.api:PublicApi
                 * @description Get the tree state for this grid,
                 * used by the saveState feature
                 * Returned treeView is an object 
                 *   `{ expandedState: hash }` 
                 * where expandedState is a hash of the currently expanded nodes
                 * 
                 * @returns {object} treeView state
                 */
                getTreeView: function () {
                  return { expandedState: grid.treeView.rowExpandedStates };
                },

                /**
                 * @ngdoc function
                 * @name setTreeView
                 * @methodOf  ui.grid.treeView.api:PublicApi
                 * @description Set the expanded states of the tree
                 * @param {object} config the config you want to apply, in the format
                 * provided out by getTreeView
                 */
                setTreeView: function ( config ) {
                  if ( typeof(config.expandedState) !== 'undefined' ){
                    grid.treeView.rowExpandedStates = config.expandedState;
                  }
                }
              }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);

          grid.api.registerMethodsFromObject(publicApi.methods);

        },

        defaultGridOptions: function (gridOptions) {
          //default option to true unless it was explicitly set to false
          /**
           *  @ngdoc object
           *  @name ui.grid.treeView.api:GridOptions
           *
           *  @description GridOptions for treeView feature, these are available to be
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           *  @ngdoc object
           *  @name enableTreeView
           *  @propertyOf  ui.grid.treeView.api:GridOptions
           *  @description Enable row tree view for entire grid.
           *  <br/>Defaults to true
           */
          gridOptions.enableTreeView = gridOptions.enableTreeView !== false;

          /**
           *  @ngdoc object
           *  @name treeViewRowHeaderBaseWidth
           *  @propertyOf  ui.grid.treeView.api:GridOptions
           *  @description Base width of the treeView header, provides for a single level of tree.  This
           *  is incremented by `treeViewIndent` for each extra level
           *  <br/>Defaults to 30
           */
          gridOptions.treeViewRowHeaderBaseWidth = gridOptions.treeViewRowHeaderBaseWidth || 30;

          /**
           *  @ngdoc object
           *  @name treeViewIndent
           *  @propertyOf  ui.grid.treeView.api:GridOptions
           *  @description Number of pixels of indent for the icon at each treeView level, wider indents are visually more pleasing,
           *  but will make the tree view row header wider
           *  <br/>Defaults to 10
           */
          gridOptions.treeViewIndent = gridOptions.treeViewIndent || 10;

          /**
           *  @ngdoc object
           *  @name showTreeViewRowHeader
           *  @propertyOf  ui.grid.treeView.api:GridOptions
           *  @description If set to false, don't create the row header.  Youll need to programatically control the expand
           *  states
           *  <br/>Defaults to true
           */
          gridOptions.showTreeViewRowHeader = gridOptions.showTreeViewRowHeader !== false;
        },

        
        /**
         * @ngdoc function
         * @name expandAllRows
         * @methodOf  ui.grid.treeView.service:uiGridTreeViewService
         * @description Expands all nodes in the tree
         * 
         * @param {Grid} grid grid object
         */
        expandAllRows: function (grid) {
          service.setAllNodes( grid, grid.treeView.rowExpandedStates, uiGridTreeViewConstants.EXPANDED );
          grid.queueGridRefresh();
        },
 
        
        /**
         * @ngdoc function
         * @name collapseAllRows
         * @methodOf  ui.grid.treeView.service:uiGridTreeViewService
         * @description Collapses all nodes in the tree
         * 
         * @param {Grid} grid grid object
         */
        collapseAllRows: function (grid) {
          service.setAllNodes( grid, grid.treeView.rowExpandedStates, uiGridTreeViewConstants.COLLAPSED );
          grid.queueGridRefresh();
        },


        /**
         * @ngdoc function
         * @name setAllNodes
         * @methodOf  ui.grid.treeView.service:uiGridTreeViewService
         * @description Works through a subset of grid.treeView.rowExpandedStates, setting
         * all child nodes (and their descendents) of the provided node to the given state.
         * 
         * Calls itself recursively on all nodes so as to achieve this.
         *
         * @param {Grid} grid the grid we're operating on (so we can raise events) 
         * @param {object} expandedStatesSubset the portion of the tree that we want to update
         * @param {string} targetState the state we want to set it to
         */
        setAllNodes: function (grid, expandedStatesSubset, targetState) {
          // set this node - if this is a node (first invocation in the recursion doesn't have a root node)
          if ( typeof(expandedStatesSubset.state) !== 'undefined' && expandedStatesSubset.state !== targetState ){
            expandedStatesSubset.state = targetState;
            if ( targetState === uiGridTreeViewConstants.EXPANDED ){
              grid.api.treeView.raise.rowExpanded(expandedStatesSubset.row);
            } else {
              grid.api.treeView.raise.rowCollapsed(expandedStatesSubset.row);
            }
          }
          
          // set all child nodes
          angular.forEach(expandedStatesSubset, function( childNode, key){
            if (key !== 'state' && key !== 'row'){
              service.setAllNodes(grid, childNode, targetState);
            }
          });
        },

        
        /**
         * @ngdoc function
         * @name toggleRowTreeViewState
         * @methodOf  ui.grid.treeView.service:uiGridTreeViewService
         * @description Toggles the expand or collapse state of this grouped row.
         * If the row isn't a groupHeader, does nothing.
         * 
         * @param {Grid} grid grid object
         * @param {GridRow} row the row we want to toggle
         */
        toggleRowTreeViewState: function ( grid, row ){
          if ( typeof(row.treeLevel) === 'undefined' || row.treeLevel === null || row.treeLevel < 0 ){
            return;
          }
          
          if (row.treeExpandedState.state === uiGridTreeViewConstants.EXPANDED){
            service.collapseRow(grid, row);
          } else {
            service.expandRow(grid, row);
          }
          
          grid.queueGridRefresh();
        },
        

        /**
         * @ngdoc function
         * @name expandRow
         * @methodOf  ui.grid.treeView.service:uiGridTreeViewService
         * @description Expands this specific row, showing only immediate children.
         * 
         * @param {Grid} grid grid object
         * @param {GridRow} row the row we want to expand
         */
        expandRow: function ( grid, row ){
          if ( typeof(row.treeLevel) === 'undefined' || row.treeLevel === null || row.treeLevel < 0 ){
            return;
          }
          
          if ( row.treeExpandedState.state !== uiGridTreeViewConstants.EXPANDED ){
            row.treeExpandedState.state = uiGridTreeViewConstants.EXPANDED;
            grid.api.treeView.raise.rowExpanded(row);
            grid.queueGridRefresh();
          }
        },
        

        /**
         * @ngdoc function
         * @name expandRowChildren
         * @methodOf  ui.grid.treeView.service:uiGridTreeViewService
         * @description Expands this specific row, showing all children.
         * 
         * @param {Grid} grid grid object
         * @param {GridRow} row the row we want to expand
         */
        expandRowChildren: function ( grid, row ){
          if ( typeof(row.treeLevel) === 'undefined' || row.treeLevel === null || row.treeLevel < 0 ){
            return;
          }
          
          service.setAllNodes(grid, row.treeExpandedState, uiGridTreeViewConstants.EXPANDED);
          grid.queueGridRefresh();
        },
        

       /**
         * @ngdoc function
         * @name collapseRow
         * @methodOf  ui.grid.treeView.service:uiGridTreeViewService
         * @description Collapses this specific row
         *
         * @param {Grid} grid grid object
         * @param {GridRow} row the row we want to collapse
         */
        collapseRow: function( grid, row ){
          if ( typeof(row.treeLevel) === 'undefined' || row.treeLevel === null || row.treeLevel < 0 ){
            return;
          }

          if ( row.treeExpandedState.state !== uiGridTreeViewConstants.COLLAPSED ){
            row.treeExpandedState.state = uiGridTreeViewConstants.COLLAPSED;
            grid.api.treeView.raise.rowCollapsed(row);
            grid.queueGridRefresh();
          }
        },
        
        
       /**
         * @ngdoc function
         * @name collapseRowChildren
         * @methodOf  ui.grid.treeView.service:uiGridTreeViewService
         * @description Collapses this specific row and all children
         *
         * @param {Grid} grid grid object
         * @param {GridRow} row the row we want to collapse
         */
        collapseRowChildren: function( grid, row ){
          if ( typeof(row.treeLevel) === 'undefined' || row.treeLevel === null || row.treeLevel < 0 ){
            return;
          }

          service.setAllNodes(grid, row.treeExpandedState, uiGridTreeViewConstants.COLLAPSED);
          grid.queueGridRefresh();
        },

        
       /**
         * @ngdoc function
         * @name treeRows
         * @methodOf  ui.grid.treeView.service:uiGridTreeViewService
         * @description The rowProcessor that adds the nodes to the tree, and sets the visible
         * state of each row based on it's parent state
         * 
         * Assumes it is always called after the sorting processor
         * 
         * Processes all the rows in order, setting the group level based on the $$treeLevel in the associated
         * entity, and setting the visible state based on the parent's state.
         * 
         * Calculates the deepest level of tree whilst it goes, and updates that so that the header column can be correctly 
         * sized.
         * 
         * @param {array} renderableRows the rows we want to process, usually the output from the previous rowProcessor
         * @returns {array} the updated rows, including our new group rows
         */
        treeRows: function( renderableRows ) {
          if (renderableRows.length === 0){
            return renderableRows;
          }

          var grid = this;
          var currentLevel = 0;
          var currentState = uiGridTreeViewConstants.EXPANDED;
          var parents = [];
          
          var updateState = function( row ) {
            row.treeLevel = row.entity.$$treeLevel;

            if ( !row.visible ){
              return;
            }
            
            if ( row.treeLevel <= currentLevel ){
              // pop any levels that aren't parents of this level
              while ( row.treeLevel <= currentLevel ){
                parents.pop();
                currentLevel--;
              }

              // reset our current state based on the new parent, set to expanded if this is a root node
              if ( parents.length > 0 ){
                currentState = service.setCurrentState(parents);
              } else {
                currentState = uiGridTreeViewConstants.EXPANDED;
              }
            }
            
            // set visibility based on the parent's state
            if ( currentState === uiGridTreeViewConstants.COLLAPSED ){
              row.visible = false;
            } else {
              row.visible = true;
            }

            // if this row is a node, then add it to the parents array
            if ( typeof(row.treeLevel) !== 'undefined' && row.treeLevel > -1 ){
              service.addOrUseState(grid, row, parents);
              currentLevel++;
              currentState = service.setCurrentState(parents);
            }
            
            
            // update the tree number of levels, so we can set header width if we need to
            if ( grid.treeView.numberLevels < row.treeLevel ){
              grid.treeView.numberLevels = row.treeLevel;
            }
          };
          
          renderableRows.forEach(updateState);
          
          var newWidth = grid.options.treeViewRowHeaderBaseWidth + grid.options.treeViewIndent * grid.treeView.numberLevels;
          var rowHeader = grid.getColumn(uiGridTreeViewConstants.treeViewRowHeaderColName);
          if ( rowHeader && newWidth !== rowHeader.width ){
            rowHeader.width = newWidth;
            grid.queueRefresh();
          }          
          return renderableRows.filter(function (row) { return row.visible; });
        },
        
       /**
         * @ngdoc function
         * @name addOrUseState
         * @methodOf  ui.grid.treeView.service:uiGridTreeViewService
         * @description If a state already exists for this row with the right parents, use that state,
         * otherwise create a new state for this row and set it's expand/collapse to the same as it's parent.
         * 
         * @param {grid} grid the grid we're operating on
         * @param {gridRow} row the row we want to set
         * @param {array} parents an array of the parents this row should have
         * @returns {undefined} updates the parents array, updates the row to have a treeExpandedState, and updates the
         * grid.treeView.expandedStates
         */
        addOrUseState: function( grid, row, parents ){
          if ( row.entity.$$treeLevel === 0 ){
            if ( typeof(grid.treeView.rowExpandedStates[row.uid]) === 'undefined' ) {
              grid.treeView.rowExpandedStates[row.uid] = { state: uiGridTreeViewConstants.COLLAPSED, row: row };
            }
            row.treeExpandedState = grid.treeView.rowExpandedStates[row.uid];
          } else {
            var parentState = parents[parents.length - 1].treeExpandedState; 
            if ( typeof(parentState[row.uid]) === 'undefined') {
              parentState[row.uid] = { state: parentState.state, row: row };
            }
            row.treeExpandedState = parentState[row.uid];
          }
          parents.push(row);
        },
        
        
       /**
         * @ngdoc function
         * @name setCurrentState
         * @methodOf  ui.grid.treeView.service:uiGridTreeViewService
         * @description Looks at the parents array to determine our current state.
         * If any node in the hierarchy is collapsed, then return collapsed, otherwise return
         * expanded.
         * 
         * @param {array} parents an array of the parents this row should have
         * @returns {string} the state we should be setting to any nodes we see
         */
        setCurrentState: function( parents ){
          var currentState = uiGridTreeViewConstants.EXPANDED;
          parents.forEach( function(parent){
            if ( parent.treeExpandedState.state === uiGridTreeViewConstants.COLLAPSED ){
              currentState = uiGridTreeViewConstants.COLLAPSED;
            }
          });
          
          return currentState;
        }
        
      };

      return service;

    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.treeView.directive:uiGridTreeView
   *  @element div
   *  @restrict A
   *
   *  @description Adds treeView features to grid
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.treeView']);

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
   <div ui-grid="gridOptions" ui-grid-tree-view></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridTreeView', ['uiGridTreeViewConstants', 'uiGridTreeViewService', '$templateCache',
    function (uiGridTreeViewConstants, uiGridTreeViewService, $templateCache) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              if (uiGridCtrl.grid.options.enableTreeView !== false){
                uiGridTreeViewService.initializeGrid(uiGridCtrl.grid, $scope);
                
                if ( uiGridCtrl.grid.options.showTreeViewRowHeader ){
                  var treeViewRowHeaderDef = {
                    name: uiGridTreeViewConstants.treeViewRowHeaderColName,
                    displayName: '',
                    width:  uiGridCtrl.grid.options.treeViewRowHeaderBaseWidth,
                    minWidth: 10,
                    cellTemplate: 'ui-grid/treeViewRowHeader',
                    headerCellTemplate: 'ui-grid/treeViewHeaderCell',
                    enableColumnResizing: false,
                    enableColumnMenu: false,
                    exporterSuppressExport: true,
                    allowCellFocus: true
                  };
    
                  uiGridCtrl.grid.addRowHeaderColumn(treeViewRowHeaderDef);
                }
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
   *  @name ui.grid.treeView.directive:uiGridTreeViewRowHeaderButtons
   *  @element div
   *
   *  @description Provides the expand/collapse button on groupHeader rows 
   */
  module.directive('uiGridTreeViewRowHeaderButtons', ['$templateCache', 'uiGridTreeViewService',
    function ($templateCache, uiGridTreeViewService) {
      return {
        replace: true,
        restrict: 'E',
        template: $templateCache.get('ui-grid/treeViewRowHeaderButtons'),
        scope: true,
        require: '^uiGrid',
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var self = uiGridCtrl.grid;
          $scope.treeViewButtonClick = function(row, evt) {
            uiGridTreeViewService.toggleRowTreeViewState(self, row, evt);
          };
        }
      };
    }]);


  /**
   *  @ngdoc directive
   *  @name ui.grid.treeView.directive:uiGridTreeViewExpandAllButtons
   *  @element div
   *
   *  @description Provides the expand/collapse all button 
   */
  module.directive('uiGridTreeViewExpandAllButtons', ['$templateCache', 'uiGridTreeViewService',
    function ($templateCache, uiGridTreeViewService) {
      return {
        replace: true,
        restrict: 'E',
        template: $templateCache.get('ui-grid/treeViewExpandAllButtons'),
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var self = $scope.col.grid;

          $scope.headerButtonClick = function(row, evt) {
            if ( self.treeView.expandAll ){
              uiGridTreeViewService.collapseAllRows(self, evt);
              self.treeView.expandAll = false;
            } else {
              uiGridTreeViewService.expandAllRows(self, evt);
              self.treeView.expandAll = true;
            }
          };
        }
      };
    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.treeView.directive:uiGridViewport
   *  @element div
   *
   *  @description Stacks on top of ui.grid.uiGridViewport to set formatting on a tree view header row
   */
  module.directive('uiGridViewport',
    ['$compile', 'uiGridConstants', 'uiGridTreeViewConstants', 'gridUtil', '$parse', 'uiGridTreeViewService',
      function ($compile, uiGridConstants, uiGridTreeViewConstants, gridUtil, $parse, uiGridTreeViewService) {
        return {
          priority: -200, // run after default  directive
          scope: false,
          compile: function ($elm, $attrs) {
            var rowRepeatDiv = angular.element($elm.children().children()[0]);

            var existingNgClass = rowRepeatDiv.attr("ng-class");
            var newNgClass = '';
            if ( existingNgClass ) {
              newNgClass = existingNgClass.slice(0, -1) + ",'ui-grid-tree-view-header-row': row.treeLevel > -1}";
            } else {
              newNgClass = "{'ui-grid-tree-view-header-row': row.treeLevel > -1}";
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
