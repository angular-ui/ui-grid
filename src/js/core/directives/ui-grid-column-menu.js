(function() {

angular.module('ui.grid')
.service('uiGridColumnMenuService', [ 'i18nService', 'uiGridConstants', 'gridUtil',
function ( i18nService, uiGridConstants, gridUtil ) {
/**
 *  @ngdoc service
 *  @name ui.grid.service:uiGridColumnMenuService
 *
 *  @description Services for working with column menus, factored out
 *  to make the code easier to understand
 */

  var service = {
    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name initialize
     * @description  Sets defaults, puts a reference to the $scope on
     * the uiGridController
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * @param {controller} uiGridCtrl the uiGridController for the grid
     * we're on
     *
     */
    initialize: function( $scope, uiGridCtrl ) {
      $scope.grid = uiGridCtrl.grid;

      // Store a reference to this link/controller in the main uiGrid controller
      // to allow showMenu later
      uiGridCtrl.columnMenuScope = $scope;

      // Save whether we're shown or not so the columns can check
      $scope.menuShown = false;
    },


    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name setColMenuItemWatch
     * @description  Setup a watch on $scope.col.menuItems, and update
     * menuItems based on this.  $scope.col needs to be set by the column
     * before calling the menu.
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     */
    setColMenuItemWatch: function ( $scope ) {
      var deregFunction = $scope.$watch('col.menuItems', function (n) {
        if (typeof(n) !== 'undefined' && n && angular.isArray(n)) {
          n.forEach(function (item) {
            if (typeof(item.context) === 'undefined' || !item.context) {
              item.context = {};
            }
            item.context.col = $scope.col;
          });

          $scope.menuItems = $scope.defaultMenuItems.concat(n);
        }
        else {
          $scope.menuItems = $scope.defaultMenuItems;
        }
      });

      $scope.$on( '$destroy', deregFunction );
    },


    /**
     * @ngdoc boolean
     * @name enableSorting
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description (optional) True by default. When enabled, this setting adds sort
     * widgets to the column header, allowing sorting of the data in the individual column.
     */
    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name sortable
     * @description  determines whether this column is sortable
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     *
     */
    sortable: function( $scope ) {
      return Boolean( $scope.grid.options.enableSorting && typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.enableSorting);
    },

    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name isActiveSort
     * @description  determines whether the requested sort direction is current active, to
     * allow highlighting in the menu
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * @param {string} direction the direction that we'd have selected for us to be active
     *
     */
    isActiveSort: function( $scope, direction ) {
      return Boolean(typeof($scope.col) !== 'undefined' && typeof($scope.col.sort) !== 'undefined' &&
              typeof($scope.col.sort.direction) !== 'undefined' && $scope.col.sort.direction === direction);
    },

    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name suppressRemoveSort
     * @description  determines whether we should suppress the removeSort option
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     *
     */
    suppressRemoveSort: function( $scope ) {
      return Boolean($scope.col && $scope.col.suppressRemoveSort);
    },


    /**
     * @ngdoc boolean
     * @name enableHiding
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description (optional) True by default. When set to false, this setting prevents a user from hiding the column
     * using the column menu or the grid menu.
     */
    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name hideable
     * @description  determines whether a column can be hidden, by checking the enableHiding columnDef option
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     *
     */
    hideable: function( $scope ) {
      return !(typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.colDef && $scope.col.colDef.enableHiding === false );
    },


    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name getDefaultMenuItems
     * @description  returns the default menu items for a column menu
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     *
     */
    getDefaultMenuItems: function( $scope ) {
      return [
        {
          title: function() {return i18nService.getSafeText('sort.ascending');},
          icon: 'ui-grid-icon-sort-alt-up',
          action: function($event) {
            $event.stopPropagation();
            $scope.sortColumn($event, uiGridConstants.ASC);
          },
          shown: function () {
            return service.sortable( $scope );
          },
          active: function() {
            return service.isActiveSort( $scope, uiGridConstants.ASC);
          }
        },
        {
          title: function() {return i18nService.getSafeText('sort.descending');},
          icon: 'ui-grid-icon-sort-alt-down',
          action: function($event) {
            $event.stopPropagation();
            $scope.sortColumn($event, uiGridConstants.DESC);
          },
          shown: function() {
            return service.sortable( $scope );
          },
          active: function() {
            return service.isActiveSort( $scope, uiGridConstants.DESC);
          }
        },
        {
          title: function() {return i18nService.getSafeText('sort.remove');},
          icon: 'ui-grid-icon-cancel',
          action: function ($event) {
            $event.stopPropagation();
            $scope.unsortColumn();
          },
          shown: function() {
            return service.sortable( $scope ) &&
                   typeof($scope.col) !== 'undefined' && (typeof($scope.col.sort) !== 'undefined' &&
                   typeof($scope.col.sort.direction) !== 'undefined') && $scope.col.sort.direction !== null &&
                  !service.suppressRemoveSort( $scope );
          }
        },
        {
          title: function() {return i18nService.getSafeText('column.hide');},
          icon: 'ui-grid-icon-cancel',
          shown: function() {
            return service.hideable( $scope );
          },
          action: function ($event) {
            $event.stopPropagation();
            $scope.hideColumn();
          }
        }
      ];
    },


    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name getColumnElementPosition
     * @description  gets the position information needed to place the column
     * menu below the column header
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * @param {GridColumn} column the column we want to position below
     * @param {element} $columnElement the column element we want to position below
     * @returns {hash} containing left, top, offset, height, width
     *
     */
    getColumnElementPosition: function( $scope, column, $columnElement ) {
      var positionData = {};

      positionData.left = $columnElement[0].offsetLeft;
      positionData.top = $columnElement[0].offsetTop;
      positionData.parentLeft = $columnElement[0].offsetParent.offsetLeft;

      // Get the grid scrollLeft
      positionData.offset = 0;
      if (column.grid.options.offsetLeft) {
        positionData.offset = column.grid.options.offsetLeft;
      }

      positionData.height = gridUtil.elementHeight($columnElement, true);
      positionData.width = gridUtil.elementWidth($columnElement, true);

      return positionData;
    },


    /**
     * @ngdoc method
     * @methodOf ui.grid.service:uiGridColumnMenuService
     * @name repositionMenu
     * @description  Reposition the menu below the new column.  If the menu has no child nodes
     * (i.e. it's not currently visible) then we guess it's width at 100, we'll be called again
     * later to fix it
     * @param {$scope} $scope the $scope from the uiGridColumnMenu
     * @param {GridColumn} column the column we want to position below
     * @param {hash} positionData a hash containing left, top, offset, height, width
     * @param {element} $elm the column menu element that we want to reposition
     * @param {element} $columnElement the column element that we want to reposition underneath
     *
     */
    repositionMenu: function( $scope, column, positionData, $elm, $columnElement ) {
      var menu = $elm[0].querySelectorAll('.ui-grid-menu');

      // It's possible that the render container of the column we're attaching to is
      // offset from the grid (i.e. pinned containers), we need to get the difference in the offsetLeft
      // between the render container and the grid
      var renderContainerElm = gridUtil.closestElm($columnElement, '.ui-grid-render-container'),
        renderContainerOffset = renderContainerElm.getBoundingClientRect().left - $scope.grid.element[0].getBoundingClientRect().left,
        containerScrollLeft = renderContainerElm.querySelectorAll('.ui-grid-viewport')[0].scrollLeft;

      // repositionMenu is now always called after it's visible in the DOM,
      // allowing us to simply get the width every time the menu is opened
      var myWidth = gridUtil.elementWidth(menu, true),
        paddingRight = column.lastMenuPaddingRight ? column.lastMenuPaddingRight : ( $scope.lastMenuPaddingRight ? $scope.lastMenuPaddingRight : 10);

      if ( menu.length !== 0 ) {
        var mid = menu[0].querySelectorAll('.ui-grid-menu-mid');

        if ( mid.length !== 0 ) {
          // TODO(c0bra): use padding-left/padding-right based on document direction (ltr/rtl), place menu on proper side
          // Get the column menu right padding
          paddingRight = parseInt(gridUtil.getStyles(angular.element(menu)[0])['paddingRight'], 10);
          $scope.lastMenuPaddingRight = paddingRight;
          column.lastMenuPaddingRight = paddingRight;
        }
      }

      var left = positionData.left + renderContainerOffset - containerScrollLeft + positionData.parentLeft + positionData.width + paddingRight;

      if (left < positionData.offset + myWidth) {
        left = Math.max(positionData.left - containerScrollLeft + positionData.parentLeft - paddingRight + myWidth, positionData.offset + myWidth);
      }

      $elm.css('left', left + 'px');
      $elm.css('top', (positionData.top + positionData.height) + 'px');
    }
  };
  return service;
}])


.directive('uiGridColumnMenu', ['$timeout', 'gridUtil', 'uiGridConstants', 'uiGridColumnMenuService', '$document',
function ($timeout, gridUtil, uiGridConstants, uiGridColumnMenuService, $document) {
/**
 * @ngdoc directive
 * @name ui.grid.directive:uiGridColumnMenu
 * @description  Provides the column menu framework, leverages uiGridMenu underneath
 *
 */

  return {
    priority: 0,
    scope: true,
    require: '^uiGrid',
    templateUrl: 'ui-grid/uiGridColumnMenu',
    replace: true,
    link: function ($scope, $elm, $attrs, uiGridCtrl) {
      uiGridColumnMenuService.initialize( $scope, uiGridCtrl );

      $scope.defaultMenuItems = uiGridColumnMenuService.getDefaultMenuItems( $scope );

      // Set the menu items for use with the column menu. The user can later add additional items via the watch
      $scope.menuItems = $scope.defaultMenuItems;
      uiGridColumnMenuService.setColMenuItemWatch( $scope );


      /**
       * @ngdoc method
       * @methodOf ui.grid.directive:uiGridColumnMenu
       * @name showMenu
       * @description Shows the column menu.  If the menu is already displayed it
       * calls the menu to ask it to hide (it will animate), then it repositions the menu
       * to the right place whilst hidden (it will make an assumption on menu width),
       * then it asks the menu to show (it will animate), then it repositions the menu again
       * once we can calculate it's size.
       * @param {GridColumn} column the column we want to position below
       * @param {element} $columnElement the column element we want to position below
       */
      $scope.showMenu = function(column, $columnElement, event) {
        // Swap to this column
        $scope.col = column;

        // Get the position information for the column element
        var colElementPosition = uiGridColumnMenuService.getColumnElementPosition( $scope, column, $columnElement );

        if ($scope.menuShown) {
          // we want to hide, then reposition, then show, but we want to wait for animations
          // we set a variable, and then rely on the menu-hidden event to call the reposition and show
          $scope.colElement = $columnElement;
          $scope.colElementPosition = colElementPosition;
          $scope.hideThenShow = true;

          $scope.$broadcast('hide-menu', { originalEvent: event });
        } else {
          $scope.menuShown = true;

          $scope.colElement = $columnElement;
          $scope.colElementPosition = colElementPosition;
          $scope.$broadcast('show-menu', { originalEvent: event });
        }
      };


      /**
       * @ngdoc method
       * @methodOf ui.grid.directive:uiGridColumnMenu
       * @name hideMenu
       * @description Hides the column menu.
       * @param {boolean} broadcastTrigger true if we were triggered by a broadcast
       * from the menu itself - in which case don't broadcast again as we'll get
       * an infinite loop
       */
      $scope.hideMenu = function( broadcastTrigger ) {
        $scope.menuShown = false;
        if ( !broadcastTrigger ) {
          $scope.$broadcast('hide-menu');
        }
      };


      $scope.$on('menu-hidden', function() {
        var menuItems = angular.element($elm[0].querySelector('.ui-grid-menu-items'))[0];

        $elm[0].removeAttribute('style');

        if ( $scope.hideThenShow ) {
          delete $scope.hideThenShow;

          $scope.$broadcast('show-menu');

          $scope.menuShown = true;
        } else {
          $scope.hideMenu( true );

          if ($scope.col) {
            // Focus on the menu button
            gridUtil.focus.bySelector($document, '.ui-grid-header-cell.' + $scope.col.getColClass()+ ' .ui-grid-column-menu-button', $scope.col.grid, false);
          }
        }

        if (menuItems) {
          menuItems.onkeydown = null;
          angular.forEach(menuItems.children, function removeHandlers(item) {
            item.onkeydown = null;
          });
        }
      });

      $scope.$on('menu-shown', function() {
        $timeout(function() {
          uiGridColumnMenuService.repositionMenu( $scope, $scope.col, $scope.colElementPosition, $elm, $scope.colElement );

          // automatically set the focus to the first button element in the now open menu.
          gridUtil.focus.bySelector($document, '.ui-grid-menu-items .ui-grid-menu-item:not(.ng-hide)', true);
          delete $scope.colElementPosition;
          delete $scope.columnElement;
          addKeydownHandlersToMenu();
        });
      });


      /* Column methods */
      $scope.sortColumn = function (event, dir) {
        event.stopPropagation();

        $scope.grid.sortColumn($scope.col, dir, true)
          .then(function () {
            $scope.grid.refresh();
            $scope.hideMenu();
          }).catch(angular.noop);
      };

      $scope.unsortColumn = function () {
        $scope.col.unsort();

        $scope.grid.refresh();
        $scope.hideMenu();
      };

      function addKeydownHandlersToMenu() {
        var menu = angular.element($elm[0].querySelector('.ui-grid-menu-items'))[0],
          menuItems,
          visibleMenuItems = [];

        if (menu) {
          menu.onkeydown = function closeMenu(event) {
            if (event.keyCode === uiGridConstants.keymap.ESC) {
              event.preventDefault();
              $scope.hideMenu();
            }
          };

          menuItems = menu.querySelectorAll('.ui-grid-menu-item:not(.ng-hide)');
          angular.forEach(menuItems, function filterVisibleItems(item) {
            if (item.offsetParent !== null) {
              this.push(item);
            }
          }, visibleMenuItems);

          if (visibleMenuItems.length) {
            if (visibleMenuItems.length === 1) {
              visibleMenuItems[0].onkeydown = function singleItemHandler(event) {
                circularFocusHandler(event, true);
              };
            } else {
              visibleMenuItems[0].onkeydown = function firstItemHandler(event) {
                circularFocusHandler(event, false, event.shiftKey, visibleMenuItems.length - 1);
              };
              visibleMenuItems[visibleMenuItems.length - 1].onkeydown = function lastItemHandler(event) {
                circularFocusHandler(event, false, !event.shiftKey, 0);
              };
            }
          }
        }

        function circularFocusHandler(event, isSingleItem, shiftKeyStatus, index) {
          if (event.keyCode === uiGridConstants.keymap.TAB) {
            if (isSingleItem) {
              event.preventDefault();
            } else if (shiftKeyStatus) {
              event.preventDefault();
              visibleMenuItems[index].focus();
            }
          }
        }
      }

      // Since we are hiding this column the default hide action will fail so we need to focus somewhere else.
      var setFocusOnHideColumn = function() {
        $timeout(function() {
          // Get the UID of the first
          var focusToGridMenu = function() {
            return gridUtil.focus.byId('grid-menu', $scope.grid);
          };

          var thisIndex;
          $scope.grid.columns.some(function(element, index) {
            if (angular.equals(element, $scope.col)) {
              thisIndex = index;
              return true;
            }
          });

          var previousVisibleCol;
          // Try and find the next lower or nearest column to focus on
          $scope.grid.columns.some(function(element, index) {
            if (!element.visible) {
              return false;
            } // This columns index is below the current column index
            else if ( index < thisIndex) {
              previousVisibleCol = element;
            } // This elements index is above this column index and we haven't found one that is lower
            else if ( index > thisIndex && !previousVisibleCol) {
              // This is the next best thing
              previousVisibleCol = element;
              // We've found one so use it.
              return true;
            } // We've reached an element with an index above this column and the previousVisibleCol variable has been set
            else if (index > thisIndex && previousVisibleCol) {
              // We are done.
              return true;
            }
          });
          // If found then focus on it
          if (previousVisibleCol) {
            var colClass = previousVisibleCol.getColClass();
            gridUtil.focus.bySelector($document, '.ui-grid-header-cell.' + colClass+ ' .ui-grid-header-cell-primary-focus', true).then(angular.noop, function(reason) {
              if (reason !== 'canceled') { // If this is canceled then don't perform the action
                // The fallback action is to focus on the grid menu
                return focusToGridMenu();
              }
            }).catch(angular.noop);
          } else {
            // Fallback action to focus on the grid menu
            focusToGridMenu();
          }
        });
      };

      $scope.hideColumn = function () {
        $scope.col.colDef.visible = false;
        $scope.col.visible = false;

        $scope.grid.queueGridRefresh();
        $scope.hideMenu();
        $scope.grid.api.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
        $scope.grid.api.core.raise.columnVisibilityChanged( $scope.col );

        // We are hiding so the default action of focusing on the button that opened this menu will fail.
        setFocusOnHideColumn();
      };
    },

    controller: ['$scope', function ($scope) {
      var self = this;

      $scope.$watch('menuItems', function (n) {
        self.menuItems = n;
      });
    }]
  };
}]);
})();
