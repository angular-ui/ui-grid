(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridHeaderCell', ['$compile', '$timeout', '$window', '$document', 'gridUtil', 'uiGridConstants', 'ScrollEvent', 'i18nService',
  function ($compile, $timeout, $window, $document, gridUtil, uiGridConstants, ScrollEvent, i18nService) {
    // Do stuff after mouse has been down this many ms on the header cell
    var mousedownTimeout = 500;
    var changeModeTimeout = 500;    // length of time between a touch event and a mouse event being recognised again, and vice versa

    var uiGridHeaderCell = {
      priority: 0,
      scope: {
        col: '=',
        row: '=',
        renderIndex: '='
      },
      require: ['^uiGrid', '^uiGridRenderContainer'],
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

            $scope.i18n = {
              headerCell: i18nService.getSafeText('headerCell'),
              sort: i18nService.getSafeText('sort')
            };
            $scope.isSortPriorityVisible = function() {
              //show sort priority if column is sorted and there is at least one other sorted column
              return angular.isNumber($scope.col.sort.priority) && $scope.grid.columns.some(function(element, index){
                  return angular.isNumber(element.sort.priority) && element !== $scope.col;
                });
            };
            $scope.getSortDirectionAriaLabel = function(){
              var col = $scope.col;
              //Trying to recreate this sort of thing but it was getting messy having it in the template.
              //Sort direction {{col.sort.direction == asc ? 'ascending' : ( col.sort.direction == desc ? 'descending':'none')}}. {{col.sort.priority ? {{columnPriorityText}} {{col.sort.priority}} : ''}
              var sortDirectionText = col.sort.direction === uiGridConstants.ASC ? $scope.i18n.sort.ascending : ( col.sort.direction === uiGridConstants.DESC ? $scope.i18n.sort.descending : $scope.i18n.sort.none);
              var label = sortDirectionText;

              if ($scope.isSortPriorityVisible()) {
                label = label + '. ' + $scope.i18n.headerCell.priority + ' ' + col.sort.priority;
              }
              return label;
            };

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
            var previousMouseX;

            // filter watchers
            var filterDeregisters = [];


            /*
             * Our basic approach here for event handlers is that we listen for a down event (mousedown or touchstart).
             * Once we have a down event, we need to work out whether we have a click, a drag, or a
             * hold.  A click would sort the grid (if sortable).  A drag would be used by moveable, so
             * we ignore it.  A hold would open the menu.
             *
             * So, on down event, we put in place handlers for move and up events, and a timer.  If the
             * timer expires before we see a move or up, then we have a long press and hence a column menu open.
             * If the up happens before the timer, then we have a click, and we sort if the column is sortable.
             * If a move happens before the timer, then we are doing column move, so we do nothing, the moveable feature
             * will handle it.
             *
             * To deal with touch enabled devices that also have mice, we only create our handlers when
             * we get the down event, and we create the corresponding handlers - if we're touchstart then
             * we get touchmove and touchend, if we're mousedown then we get mousemove and mouseup.
             *
             * We also suppress the click action whilst this is happening - otherwise after the mouseup there
             * will be a click event and that can cause the column menu to close
             *
             */

            $scope.downFn = function( event ){
              event.stopPropagation();

              if (typeof(event.originalEvent) !== 'undefined' && event.originalEvent !== undefined) {
                event = event.originalEvent;
              }

              // Don't show the menu if it's not the left button
              if (event.button && event.button !== 0) {
                return;
              }
              previousMouseX = event.pageX;

              $scope.mousedownStartTime = (new Date()).getTime();
              $scope.mousedownTimeout = $timeout(function() { }, mousedownTimeout);

              $scope.mousedownTimeout.then(function () {
                if ( $scope.colMenu ) {
                  uiGridCtrl.columnMenuScope.showMenu($scope.col, $elm, event);
                }
              });

              uiGridCtrl.fireEvent(uiGridConstants.events.COLUMN_HEADER_CLICK, {event: event, columnName: $scope.col.colDef.name});

              $scope.offAllEvents();
              if ( event.type === 'touchstart'){
                $document.on('touchend', $scope.upFn);
                $document.on('touchmove', $scope.moveFn);
              } else if ( event.type === 'mousedown' ){
                $document.on('mouseup', $scope.upFn);
                $document.on('mousemove', $scope.moveFn);
              }
            };

            $scope.upFn = function( event ){
              event.stopPropagation();
              $timeout.cancel($scope.mousedownTimeout);
              $scope.offAllEvents();
              $scope.onDownEvents(event.type);

              var mousedownEndTime = (new Date()).getTime();
              var mousedownTime = mousedownEndTime - $scope.mousedownStartTime;

              if (mousedownTime > mousedownTimeout) {
                // long click, handled above with mousedown
              }
              else {
                // short click
                if ( $scope.sortable ){
                  $scope.handleClick(event);
                }
              }
            };

            $scope.moveFn = function( event ){
              // Chrome is known to fire some bogus move events.
              var changeValue = event.pageX - previousMouseX;
              if ( changeValue === 0 ){ return; }

              // we're a move, so do nothing and leave for column move (if enabled) to take over
              $timeout.cancel($scope.mousedownTimeout);
              $scope.offAllEvents();
              $scope.onDownEvents(event.type);
            };

            $scope.clickFn = function ( event ){
              event.stopPropagation();
              $contentsElm.off('click', $scope.clickFn);
            };


            $scope.offAllEvents = function(){
              $contentsElm.off('touchstart', $scope.downFn);
              $contentsElm.off('mousedown', $scope.downFn);

              $document.off('touchend', $scope.upFn);
              $document.off('mouseup', $scope.upFn);

              $document.off('touchmove', $scope.moveFn);
              $document.off('mousemove', $scope.moveFn);

              $contentsElm.off('click', $scope.clickFn);
            };

            $scope.onDownEvents = function( type ){
              // If there is a previous event, then wait a while before
              // activating the other mode - i.e. if the last event was a touch event then
              // don't enable mouse events for a wee while (500ms or so)
              // Avoids problems with devices that emulate mouse events when you have touch events

              switch (type){
                case 'touchmove':
                case 'touchend':
                  $contentsElm.on('click', $scope.clickFn);
                  $contentsElm.on('touchstart', $scope.downFn);
                  $timeout(function(){
                    $contentsElm.on('mousedown', $scope.downFn);
                  }, changeModeTimeout);
                  break;
                case 'mousemove':
                case 'mouseup':
                  $contentsElm.on('click', $scope.clickFn);
                  $contentsElm.on('mousedown', $scope.downFn);
                  $timeout(function(){
                    $contentsElm.on('touchstart', $scope.downFn);
                  }, changeModeTimeout);
                  break;
                default:
                  $contentsElm.on('click', $scope.clickFn);
                  $contentsElm.on('touchstart', $scope.downFn);
                  $contentsElm.on('mousedown', $scope.downFn);
              }
            };


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

              $timeout(function (){
                var rightMostContainer = $scope.grid.renderContainers['right'] ? $scope.grid.renderContainers['right'] : $scope.grid.renderContainers['body'];
                $scope.isLastCol = ( $scope.col === rightMostContainer.visibleColumnCache[ rightMostContainer.visibleColumnCache.length - 1 ] );
              });

              // Figure out whether this column is sortable or not
              if ($scope.col.enableSorting) {
                $scope.sortable = true;
              }
              else {
                $scope.sortable = false;
              }

              // Figure out whether this column is filterable or not
              var oldFilterable = $scope.filterable;
              if (uiGridCtrl.grid.options.enableFiltering && $scope.col.enableFiltering) {
                $scope.filterable = true;
              }
              else {
                $scope.filterable = false;
              }

              if ( oldFilterable !== $scope.filterable){
                if ( typeof($scope.col.updateFilters) !== 'undefined' ){
                  $scope.col.updateFilters($scope.filterable);
                }

                // if column is filterable add a filter watcher
                if ($scope.filterable) {
                  $scope.col.filters.forEach( function(filter, i) {
                    filterDeregisters.push($scope.$watch('col.filters[' + i + '].term', function(n, o) {
                      if (n !== o) {
                        uiGridCtrl.grid.api.core.raise.filterChanged();
                        uiGridCtrl.grid.api.core.notifyDataChange( uiGridConstants.dataChange.COLUMN );
                        uiGridCtrl.grid.queueGridRefresh();
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

              $scope.offAllEvents();

              if ($scope.sortable || $scope.colMenu) {
                $scope.onDownEvents();

                $scope.$on('$destroy', function () {
                  $scope.offAllEvents();
                });
              }
            };

/*
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
*/
            updateHeaderOptions();

            // Register a data change watch that would get triggered whenever someone edits a cell or modifies column defs
            var dataChangeDereg = $scope.grid.registerDataChangeCallback( updateHeaderOptions, [uiGridConstants.dataChange.COLUMN]);

            $scope.$on( '$destroy', dataChangeDereg );

            $scope.handleClick = function(event) {
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
            };


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
