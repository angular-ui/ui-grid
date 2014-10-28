(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridHeaderCell', ['$compile', '$timeout', '$window', '$document', 'gridUtil', 'uiGridConstants', 
  function ($compile, $timeout, $window, $document, gridUtil, uiGridConstants) {
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
            $scope.getExternalScopes = uiGridCtrl.getExternalScopes;

            $scope.renderContainer = uiGridCtrl.grid.renderContainers[renderContainerCtrl.containerId];
            
            $elm.addClass($scope.col.getColClass(false));
    
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
            var updateClass = function( grid ){
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
            };
  
            if ($scope.col.headerCellClass) {
              updateClass();
            }
            
            // Register a data change watch that would get triggered whenever someone edits a cell or modifies column defs
            var watchUid = $scope.grid.registerDataChangeCallback( updateClass, [uiGridConstants.dataChange.COLUMN]);

            var deregisterFunction = function() {
              $scope.grid.deregisterDataChangeCallback( watchUid ); 
            };

            $scope.$on( '$destroy', deregisterFunction );            


            // Figure out whether this column is sortable or not
            if (uiGridCtrl.grid.options.enableSorting && $scope.col.enableSorting) {
              $scope.sortable = true;
            }
            else {
              $scope.sortable = false;
            }
    
            if (uiGridCtrl.grid.options.enableFiltering && $scope.col.enableFiltering) {
              $scope.filterable = true;
            }
            else {
              $scope.filterable = false;
            }
    
            function handleClick(evt) {
              // If the shift key is being held down, add this column to the sort
              var add = false;
              if (evt.shiftKey) {
                add = true;
              }
    
              // Sort this column then rebuild the grid's rows
              uiGridCtrl.grid.sortColumn($scope.col, add)
                .then(function () {
                  if (uiGridCtrl.columnMenuScope) { uiGridCtrl.columnMenuScope.hideMenu(); }
                  uiGridCtrl.grid.refresh();
                });
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

            // Long-click (for mobile)
            var cancelMousedownTimeout;
            var mousedownStartTime = 0;
            $contentsElm.on('mousedown touchstart', function(event) {
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
                if ($scope.col.grid.options && $scope.col.grid.options.enableColumnMenus !== false && 
                    $scope.col.colDef && $scope.col.colDef.enableColumnMenu !== false) {
                  uiGridCtrl.columnMenuScope.showMenu($scope.col, $elm, event);
                }
              });
            });
    
            $contentsElm.on('mouseup touchend', function () {
              $timeout.cancel(cancelMousedownTimeout);
            });

            $scope.$on('$destroy', function () {
              $contentsElm.off('mousedown touchstart');
            });


            $scope.toggleMenu = function($event) {
              $event.stopPropagation();
    
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
    
            // If this column is sortable, add a click event handler
            if ($scope.sortable) {
              $contentsElm.on('click touchend', function(evt) {
                evt.stopPropagation();
    
                $timeout.cancel(cancelMousedownTimeout);
    
                var mousedownEndTime = (new Date()).getTime();
                var mousedownTime = mousedownEndTime - mousedownStartTime;
    
                if (mousedownTime > mousedownTimeout) {
                  // long click, handled above with mousedown
                }
                else {
                  // short click
                  handleClick(evt);
                }
              });
    
              $scope.$on('$destroy', function () {
                // Cancel any pending long-click timeout
                $timeout.cancel(cancelMousedownTimeout);
              });
            }
    
            if ($scope.filterable) {
              var filterDeregisters = [];
              angular.forEach($scope.col.filters, function(filter, i) {
                filterDeregisters.push($scope.$watch('col.filters[' + i + '].term', function(n, o) {
                  uiGridCtrl.grid.api.core.raise.filterChanged();
                  uiGridCtrl.grid.refresh()
                    .then(function () {
                      if (uiGridCtrl.prevScrollArgs && uiGridCtrl.prevScrollArgs.y && uiGridCtrl.prevScrollArgs.y.percentage) {
                         uiGridCtrl.fireScrollingEvent({ y: { percentage: uiGridCtrl.prevScrollArgs.y.percentage } });
                      }
                      // uiGridCtrl.fireEvent('force-vertical-scroll');
                    });
                }));  
              });
              $scope.$on('$destroy', function() {
                angular.forEach(filterDeregisters, function(filterDeregister) {
                  filterDeregister();
                });
              });
            }
          }
        };
      }
    };

    return uiGridHeaderCell;
  }]);

})();
