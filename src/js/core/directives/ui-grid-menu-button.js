(function(){

angular.module('ui.grid')
.service('uiGridGridMenuService', [ '$log', 'i18nService', function( $log, i18nService ) {
  /**
   *  @ngdoc service
   *  @name ui.grid.gridMenuService
   *
   *  @description Methods for working with the grid menu
   */

  var service = {
    /**
     * @ngdoc method
     * @methodOf ui.grid.gridMenuService
     * @name initialize
     * @description Sets up the gridMenu. Most importantly, sets our
     * scope onto the grid object as grid.gridMenuScope, allowing us
     * to operate when passed only the grid.  Second most importantly, 
     * we register the 'addToGridMenu' and 'removeFromGridMenu' methods
     * on the core api.
     * @param {$scope} $scope the scope of this gridMenu
     * @param {Grid} grid the grid to which this gridMenu is associated
     */
    initialize: function( $scope, grid ){
      grid.gridMenuScope = $scope;
      $scope.grid = grid;
      
      // not certain this is needed, but would be bad to create a memory leak
      $scope.$on('$destroy', function() {
        $scope.grid.gridMenuScope = null;
        $scope.grid = null;
        $scope.registeredMenuItems = null;
      });
      
      $scope.registeredMenuItems = [];
      
      /**
       * @ngdoc function
       * @name addToGridMenu
       * @methodOf ui.grid.core.api:PublicApi
       * @description add items to the grid menu.  Used by features
       * to add their menu items if they are enabled, can also be used by
       * end users to add menu items.  This method has the advantage of allowing
       * remove again, which can simplify management of which items are included
       * in the menu when.  (Noting that in most cases the shown and active functions
       * provide a better way to handle visibility of menu items)
       * @param {Grid} grid the grid on which we are acting
       * @param {array} items menu items in the format as described in the tutorial, with 
       * the added note that if you want to use remove you must also specify an `id` field,
       * which is provided when you want to remove an item.  The id should be unique.
       * 
       */
      grid.api.registerMethod( 'core', 'addToGridMenu', service.addToGridMenu );
  
      /**
       * @ngdoc function
       * @name removeFromGridMenu
       * @methodOf ui.grid.core.api:PublicApi
       * @description Remove an item from the grid menu based on a provided id. Assumes
       * that the id is unique, removes only the last instance of that id. Does nothing if
       * the specified id is not found
       * @param {Grid} grid the grid on which we are acting
       * @param {string} id the id we'd like to remove from the menu
       * 
       */
      grid.api.registerMethod( 'core', 'removeFromGridMenu', service.removeFromGridMenu );
    },
 
    
    /**
     * @ngdoc function
     * @name addToGridMenu
     * @propertyOf ui.grid.class:GridOptions
     * @description add items to the grid menu.  Used by features
     * to add their menu items if they are enabled, can also be used by
     * end users to add menu items.  This method has the advantage of allowing
     * remove again, which can simplify management of which items are included
     * in the menu when.  (Noting that in most cases the shown and active functions
     * provide a better way to handle visibility of menu items)
     * @param {Grid} grid the grid on which we are acting
     * @param {array} items menu items in the format as described in the tutorial, with 
     * the added note that if you want to use remove you must also specify an `id` field,
     * which is provided when you want to remove an item.  The id should be unique.
     * 
     */
    addToGridMenu: function( grid, menuItems ) {
      if ( !angular.isArray( menuItems ) ) {
        $log.error( 'addToGridMenu: menuItems must be an array, and is not, not adding any items');
      } else {
        grid.gridMenuScope.registeredMenuItems = grid.gridMenuScope.registeredMenuItems.concat( menuItems );
      }  
    },
    

    /**
     * @ngdoc function
     * @name removeFromGridMenu
     * @methodOf ui.grid.core.api:PublicApi
     * @description Remove an item from the grid menu based on a provided id.  Assumes
     * that the id is unique, removes only the last instance of that id.  Does nothing if
     * the specified id is not found
     * @param {Grid} grid the grid on which we are acting
     * @param {string} id the id we'd like to remove from the menu
     * 
     */    
    removeFromGridMenu: function( grid, id ){
      var foundIndex = -1;
      
      grid.gridMenuScope.registeredMenuItems.forEach( function( value, index ) {
        if ( value.id === id ){
          if (foundIndex > -1) {
            $log.error( 'removeFromGridMenu: found multiple items with the same id, removing only the last' );
          } else {
            
            foundIndex = index;
          }
        }
      });

      if ( foundIndex > -1 ){
        grid.gridMenuScope.registeredMenuItems.splice( foundIndex, 1 );
      }
    },
    
        
    /**
     * @ngdoc array
     * @name gridMenuCustomItems
     * @propertyOf ui.grid.class:GridOptions
     * @description (optional) An array of menu items that should be added to
     * the gridMenu.  Follow the format documented in the tutorial for column
     * menu customisation.  The context provided to the action function will 
     * include context.grid.  An alternative if working with dynamic menus is to use the 
     * provided api - core.addToGridMenu and core.removeFromGridMenu, which handles
     * some of the management of items for you.
     * 
     */
    /**
     * @ngdoc boolean
     * @name gridMenuShowHideColumns
     * @propertyOf ui.grid.class:GridOptions
     * @description true by default, whether the grid menu should allow hide/show
     * of columns
     * 
     */
    /**
     * @ngdoc method
     * @methodOf ui.grid.gridMenuService
     * @name getMenuItems
     * @description Decides the menu items to show in the menu.  This is a
     * combination of:
     * 
     * - the default menu items that are always included, 
     * - any menu items that have been provided through the addMenuItem api. These
     *   are typically added by features within the grid
     * - any menu items included in grid.options.gridMenuCustomItems.  These can be
     *   changed dynamically, as they're always recalculated whenever we show the
     *   menu
     * @param {$scope} $scope the scope of this gridMenu, from which we can find all 
     * the information that we need
     * @returns {array} an array of menu items that can be shown 
     */
    getMenuItems: function( $scope ) {
      var menuItems = [
        // this is where we add any menu items we want to always include
      ];
      
      if ( $scope.grid.options.gridMenuCustomItems ){
        if ( !angular.isArray( $scope.grid.options.gridMenuCustomItems ) ){ 
          $log.error( 'gridOptions.gridMenuCustomItems must be an array, and is not'); 
        } else {
          menuItems = menuItems.concat( $scope.grid.options.gridMenuCustomItems );
        }
      }
  
      menuItems = menuItems.concat( $scope.registeredMenuItems );
      
      if ( $scope.grid.options.gridMenuShowHideColumns !== false ){
        menuItems = menuItems.concat( service.showHideColumns( $scope ) );
      }
      
      return menuItems;
    },
    
    
    /**
     * @ngdoc method
     * @methodOf ui.grid.gridMenuService
     * @name showHideColumns
     * @description Adds two menu items for each of the columns in columnDefs.  One
     * menu item for hide, one menu item for show.  Each is visible when appropriate
     * (show when column is not visible, hide when column is visible).  Each toggles
     * the visible property on the columnDef using toggleColumnVisibility
     * @param {$scope} $scope of a gridMenu, which contains a reference to the grid
     */
    showHideColumns: function( $scope ){
      var showHideColumns = [];
      if ( !$scope.grid.options.columnDefs ) {
        $log.error( 'Something is wrong in showHideColumns, there are no columnDefs' );
        return showHideColumns;
      }
      
      // add header for columns
      showHideColumns.push({
        title: i18nService.getSafeText('gridMenu.columns')
      });
      
      $scope.grid.options.columnDefs.forEach( function( value, index ){
        if ( !value.disableHiding ){
          // add hide menu item - shows an OK icon as we only show when column is already visible
          showHideColumns.push({
            title: value.displayName || value.name || value.field,
            icon: 'ui-grid-icon-ok',
            action: function($event) {
              $event.stopPropagation();
              service.toggleColumnVisibility( this.context.gridCol );
            },
            shown: function() {
              return this.context.gridCol.colDef.visible === true || this.context.gridCol.colDef.visible === undefined;
            },
            context: { gridCol: $scope.grid.getColumn(value.name || value.field) }
          });

          // add show menu item - shows no icon as we only show when column is invisible
          showHideColumns.push({
            title: value.displayName || value.name || value.field,
            icon: 'ui-grid-icon-cancel',
            action: function($event) {
              $event.stopPropagation();
              service.toggleColumnVisibility( this.context.gridCol );
            },
            shown: function() {
              return !(this.context.gridCol.colDef.visible === true || this.context.gridCol.colDef.visible === undefined);
            },
            context: { gridCol: $scope.grid.getColumn(value.name || value.field) }
          });
        }
      });
      return showHideColumns;
    },
    
    
    /**
     * @ngdoc method
     * @methodOf ui.grid.gridMenuService
     * @name toggleColumnVisibility
     * @description Toggles the visibility of an individual column.  Expects to be
     * provided a context that has on it a gridColumn, which is the column that
     * we'll operate upon.  We change the visibility, and refresh the grid as appropriate
     * @param {GridCol} gridCol the column that we want to toggle
     * 
     */
    toggleColumnVisibility: function( gridCol ) {
      gridCol.colDef.visible = !( gridCol.colDef.visible === true || gridCol.colDef.visible === undefined ); 
      
      gridCol.grid.refresh();
    }
  };
  
  return service;
}])



.directive('uiGridMenuButton', ['$log', 'gridUtil', 'uiGridConstants', 'uiGridGridMenuService', 
function ($log, gridUtil, uiGridConstants, uiGridGridMenuService) {

  return {
    priority: 0,
    scope: true,
    require: ['?^uiGrid'],
    templateUrl: 'ui-grid/ui-grid-menu-button',
    replace: true,


    link: function ($scope, $elm, $attrs, controllers) {
      var uiGridCtrl = controllers[0];

      uiGridGridMenuService.initialize($scope, uiGridCtrl.grid);
      

      $scope.openMenu = function () {
        $scope.menuItems = uiGridGridMenuService.getMenuItems( $scope );
        $scope.$broadcast('openGridMenu');
      };
    }
  };

}])
.directive('uiGridMenuHandler', ['$log', 'gridUtil', 'uiGridConstants', '$timeout', 
function ($log, gridUtil, uiGridConstants, $timeout) {

  return {
    priority: 0,
    require: ['?^uiGrid', 'uiGridMenu'],
    link: function ($scope, $elm, $attrs, controllers) {
      var uiGridCtrl = controllers[0];
      var uiGridMenuCtrl = controllers[1];

      $scope.$on('openGridMenu', function () {
        uiGridMenuCtrl.showMenu();
        
        $timeout(function () {
          var gridElm = uiGridCtrl.grid.element;
          var gridWidth = gridUtil.elementWidth(gridElm, true);
          var menuWidth = 200;  // calculate this later

          // Put the menu inside the right of the grid
          $elm.css('left', gridWidth - menuWidth + 'px');

          // Put the menu at the top of the grid but adjust for the border
          $elm.css('top', '-1px');
        });
      });
      
      $scope.$on('hideGridMenu', function () {
        uiGridMenuCtrl.hideMenu();
      });      
    }
  };

}]);

})();