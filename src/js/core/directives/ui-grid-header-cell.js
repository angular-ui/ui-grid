(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridHeaderCell', ['$log', '$compile', '$timeout', '$window', '$document', 'gridUtil', 'uiGridConstants', 
  function ($log, $compile, $timeout, $window, $document, gridUtil, uiGridConstants) {
    // Do stuff after mouse has been down this many ms on the header cell
    var mousedownTimeout = 500;

    var uiGridHeaderCell = {
      priority: 0,
      scope: {
        col: '=',
        row: '=',
        renderIndex: '='
      },
      require: '?^uiGrid',
      replace: true,
      compile: function() {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            var cellHeader = $compile($scope.col.headerCellTemplate)($scope);
            $elm.append(cellHeader);
          },
          
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            $scope.grid = uiGridCtrl.grid;
            
            /**
             * @ngdoc event
             * @name filterChanged
             * @eventOf  ui.grid.core.api:PublicApi
             * @description  is raised after the filter is changed.  The nature
             * of the watch expression doesn't allow notification of what changed,
             * so the receiver of this event will need to re-extract the filter 
             * conditions from the columns.
             * 
             */
            if (!$scope.grid.api.core.raise.filterChanged){
              $scope.grid.api.registerEvent( 'core', 'filterChanged' );
            }
                        
    
            $elm.addClass($scope.col.getColClass(false));
    // shane - No need for watch now that we trackby col name
    //        $scope.$watch('col.index', function (newValue, oldValue) {
    //          if (newValue === oldValue) { return; }
    //          var className = $elm.attr('class');
    //          className = className.replace(uiGridConstants.COL_CLASS_PREFIX + oldValue, uiGridConstants.COL_CLASS_PREFIX + newValue);
    //          $elm.attr('class', className);
    //        });
    
            // Hide the menu by default
            $scope.menuShown = false;
    
            // Put asc and desc sort directions in scope
            $scope.asc = uiGridConstants.ASC;
            $scope.desc = uiGridConstants.DESC;
    
            // Store a reference to menu element
            var $colMenu = angular.element( $elm[0].querySelectorAll('.ui-grid-header-cell-menu') );
    
            var $contentsElm = angular.element( $elm[0].querySelectorAll('.ui-grid-cell-contents') );
    
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
                if ( $scope.col.colDef && !$scope.col.colDef.disableColumnMenu ){
                  uiGridCtrl.columnMenuScope.showMenu($scope.col, $elm);
                }
              });
            });
    
            $contentsElm.on('mouseup touchend', function () {
              $timeout.cancel(cancelMousedownTimeout);
            });

            $scope.$on('$destroy', function () {
              $contentsElm.off('mousedown touchstart');
            });
    
            /** 
            * @ngdoc property
            * @name disableColumnMenu
            * @propertyOf ui.grid.class:GridOptions.columnDef
            * @description if column menus are enabled, disables column menus for this specific
            * column
            *
            */
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
              $contentsElm.on('click', function(evt) {
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
