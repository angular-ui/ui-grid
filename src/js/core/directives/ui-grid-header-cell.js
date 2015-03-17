(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridHeaderCell', ['$compile', '$timeout', '$window', '$document', 'gridUtil', 'uiGridConstants', 'ScrollEvent',
  function ($compile, $timeout, $window, $document, gridUtil, uiGridConstants, ScrollEvent) {
    // Do stuff after mouse has been down this many ms on the header cell
    var mousedownTimeout = 500;

    var uiGridHeaderCell = {
      priority: 0,
      scope: {
        col: '=',
        row: '=',
        renderIndex: '='
      },
      require: ['?^uiGrid', '^uiGridRenderContainer'],
      replace: true,
      compile: function() {
        return {
          pre: function ($scope, $elm, $attrs) {
            var cellHeader = $compile($scope.col.headerCellTemplate)($scope);
            $elm.append(cellHeader);
          },
          
          post: function ($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var renderContainerCtrl = controllers[1];

            $scope.grid = uiGridCtrl.grid;

            $scope.renderContainer = uiGridCtrl.grid.renderContainers[renderContainerCtrl.containerId];
            
            var initColClass = $scope.col.getColClass(false);
            $elm.addClass(initColClass);
    
            // Hide the menu by default
            $scope.menuShown = false;
    
            // Put asc and desc sort directions in scope
            $scope.asc = uiGridConstants.ASC;
            $scope.desc = uiGridConstants.DESC;
    
            // Store a reference to menu element
            var $colMenu = angular.element( $elm[0].querySelectorAll('.ui-grid-header-cell-menu') );
    
            var $contentsElm = angular.element( $elm[0].querySelectorAll('.ui-grid-cell-contents') );
    

            // apply any headerCellClass
            var classAdded;
            var updateHeaderOptions = function( grid ){
              var contents = $elm;
              if ( classAdded ){
                contents.removeClass( classAdded );
                classAdded = null;
              }
  
              if (angular.isFunction($scope.col.headerCellClass)) {
                classAdded = $scope.col.headerCellClass($scope.grid, $scope.row, $scope.col, $scope.rowRenderIndex, $scope.colRenderIndex);
              }
              else {
                classAdded = $scope.col.headerCellClass;
              }
              contents.addClass(classAdded);
              
              var rightMostContainer = $scope.grid.renderContainers['right'] ? $scope.grid.renderContainers['right'] : $scope.grid.renderContainers['body'];
              $scope.isLastCol = ( $scope.col === rightMostContainer.visibleColumnCache[ rightMostContainer.visibleColumnCache.length - 1 ] );

              // Figure out whether this column is sortable or not
              if (uiGridCtrl.grid.options.enableSorting && $scope.col.enableSorting) {
                $scope.sortable = true;
              }
              else {
                $scope.sortable = false;
              }
      
              // Figure out whether this column is filterable or not
              if (uiGridCtrl.grid.options.enableFiltering && $scope.col.enableFiltering) {
                $scope.filterable = true;
              }
              else {
                $scope.filterable = false;
              }
              
              // figure out whether we support column menus
              if ($scope.col.grid.options && $scope.col.grid.options.enableColumnMenus !== false && 
                      $scope.col.colDef && $scope.col.colDef.enableColumnMenu !== false){
                $scope.colMenu = true;
              } else {
                $scope.colMenu = false;
              }
              
              /**
              * @ngdoc property
              * @name enableColumnMenu
              * @propertyOf ui.grid.class:GridOptions.columnDef
              * @description if column menus are enabled, controls the column menus for this specific
              * column (i.e. if gridOptions.enableColumnMenus, then you can control column menus
              * using this option. If gridOptions.enableColumnMenus === false then you get no column
              * menus irrespective of the value of this option ).  Defaults to true.
              *
              */
              /**
              * @ngdoc property
              * @name enableColumnMenus
              * @propertyOf ui.grid.class:GridOptions.columnDef
              * @description Override for column menus everywhere - if set to false then you get no
              * column menus.  Defaults to true.
              *
              */
  
              var downEvent = gridUtil.isTouchEnabled() ? 'touchstart' : 'mousedown';
              if ($scope.sortable || $scope.colMenu) {
                // Long-click (for mobile)
                var cancelMousedownTimeout;
                var mousedownStartTime = 0;
  
                $contentsElm.on(downEvent, function(event) {
                  event.stopPropagation();
  
                  if (typeof(event.originalEvent) !== 'undefined' && event.originalEvent !== undefined) {
                    event = event.originalEvent;
                  }
        
                  // Don't show the menu if it's not the left button
                  if (event.button && event.button !== 0) {
                    return;
                  }
        
                  mousedownStartTime = (new Date()).getTime();
        
                  cancelMousedownTimeout = $timeout(function() { }, mousedownTimeout);
        
                  cancelMousedownTimeout.then(function () {
                    if ( $scope.colMenu ) {
                      uiGridCtrl.columnMenuScope.showMenu($scope.col, $elm, event);
                    }
                  });
  
                  uiGridCtrl.fireEvent(uiGridConstants.events.COLUMN_HEADER_CLICK, {event: event, columnName: $scope.col.colDef.name});
                });
          
                var upEvent = gridUtil.isTouchEnabled() ? 'touchend' : 'mouseup';
                $contentsElm.on(upEvent, function () {
                  $timeout.cancel(cancelMousedownTimeout);
                });
    
                $scope.$on('$destroy', function () {
                  $contentsElm.off('mousedown touchstart');
                });
              } else {
                $contentsElm.off(downEvent);
              } 

              // If this column is sortable, add a click event handler
              var clickEvent = gridUtil.isTouchEnabled() ? 'touchend' : 'click';
              if ($scope.sortable) {
                $contentsElm.on(clickEvent, function(event) {
                  event.stopPropagation();
      
                  $timeout.cancel(cancelMousedownTimeout);
      
                  var mousedownEndTime = (new Date()).getTime();
                  var mousedownTime = mousedownEndTime - mousedownStartTime;
      
                  if (mousedownTime > mousedownTimeout) {
                    // long click, handled above with mousedown
                  }
                  else {
                    // short click
                    handleClick(event);
                  }
                });
      
                $scope.$on('$destroy', function () {
                  // Cancel any pending long-click timeout
                  $timeout.cancel(cancelMousedownTimeout);
                });
              } else {
                $contentsElm.off(clickEvent);
              }
      
              // if column is filterable add a filter watcher
              var filterDeregisters = [];
              if ($scope.filterable) {
                $scope.col.filters.forEach( function(filter, i) {
                  filterDeregisters.push($scope.$watch('col.filters[' + i + '].term', function(n, o) {
                    if (n !== o) {
                      uiGridCtrl.grid.api.core.raise.filterChanged();
                      uiGridCtrl.grid.refresh(true);
                    }
                  }));  
                });
                $scope.$on('$destroy', function() {
                  filterDeregisters.forEach( function(filterDeregister) {
                    filterDeregister();
                  });
                });
              } else {
                filterDeregisters.forEach( function(filterDeregister) {
                  filterDeregister();
                });
              }                          
            };

            $scope.$watch('col', function (n, o) {
              if (n !== o) {
                // See if the column's internal class has changed
                var newColClass = $scope.col.getColClass(false);
                if (newColClass !== initColClass) {
                  $elm.removeClass(initColClass);
                  $elm.addClass(newColClass);
                  initColClass = newColClass;
                }
              }
            });
  
            updateHeaderOptions();
            
            // Register a data change watch that would get triggered whenever someone edits a cell or modifies column defs
            var dataChangeDereg = $scope.grid.registerDataChangeCallback( updateHeaderOptions, [uiGridConstants.dataChange.COLUMN]);

            $scope.$on( '$destroy', dataChangeDereg );            

            function handleClick(event) {
              // If the shift key is being held down, add this column to the sort
              var add = false;
              if (event.shiftKey) {
                add = true;
              }
    
              // Sort this column then rebuild the grid's rows
              uiGridCtrl.grid.sortColumn($scope.col, add)
                .then(function () {
                  if (uiGridCtrl.columnMenuScope) { uiGridCtrl.columnMenuScope.hideMenu(); }
                  uiGridCtrl.grid.refresh();
                });
            }
    

            $scope.toggleMenu = function(event) {
              event.stopPropagation();
    
              // If the menu is already showing...
              if (uiGridCtrl.columnMenuScope.menuShown) {
                // ... and we're the column the menu is on...
                if (uiGridCtrl.columnMenuScope.col === $scope.col) {
                  // ... hide it
                  uiGridCtrl.columnMenuScope.hideMenu();
                }
                // ... and we're NOT the column the menu is on
                else {
                  // ... move the menu to our column
                  uiGridCtrl.columnMenuScope.showMenu($scope.col, $elm);
                }
              }
              // If the menu is NOT showing
              else {
                // ... show it on our column
                uiGridCtrl.columnMenuScope.showMenu($scope.col, $elm);
              }
            };
          }
        };
      }
    };

    return uiGridHeaderCell;
  }]);

})();
