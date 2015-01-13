(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.moveColumns
   * @description
   * # ui.grid.moveColumns
   * This module provides column moving capability to ui.grid. It enables to change the position of columns.
   * <div doc-module-components="ui.grid.moveColumns"></div>
   */
  var module = angular.module('ui.grid.moveColumns', ['ui.grid']);

  /**
   *  @ngdoc service
   *  @name ui.grid.moveColumns.service:uiGridMoveColumnService
   *  @description Service for column moving feature.
   */
  module.service('uiGridMoveColumnService', ['$q', '$timeout', '$log', 'ScrollEvent', function ($q, $timeout, $log, ScrollEvent) {

    var service = {
      initializeGrid: function (grid) {
        var self = this;
        this.registerPublicApi(grid);
        this.defaultGridOptions(grid.options);
        grid.registerColumnBuilder(self.movableColumnBuilder);
      },
      registerPublicApi: function (grid) {
        var self = this;
        /**
         *  @ngdoc object
         *  @name ui.grid.moveColumns.api:PublicApi
         *  @description Public Api for column moving feature.
         */
        var publicApi = {
          events: {
            /**
             * @ngdoc event
             * @name columnPositionChanged
             * @eventOf  ui.grid.moveColumns.api:PublicApi
             * @description raised when column is moved
             * <pre>
             *      gridApi.colMovable.on.columnPositionChanged(scope,function(colDef, originalPosition, newPosition){})
             * </pre>
             * @param {object} colDef the column that was moved
             * @param {integer} originalPosition of the column
             * @param {integer} finalPosition of the column
             */
            colMovable: {
              columnPositionChanged: function (colDef, originalPosition, newPosition) {
              }
            }
          },
          methods: {
            /**
             * @ngdoc method
             * @name moveColumn
             * @methodOf  ui.grid.moveColumns.api:PublicApi
             * @description Method can be used to change column position.
             * <pre>
             *      gridApi.colMovable.on.moveColumn(oldPosition, newPosition)
             * </pre>
             * @param {integer} originalPosition of the column
             * @param {integer} finalPosition of the column
             */
            colMovable: {
              moveColumn: function (originalPosition, finalPosition) {
                var columns = grid.columns;
                var findPositionForRenderIndex = function (index) {
                  var position = index;
                  for (var i = 0; i <= position; i++) {
                    if (angular.isDefined(columns[i]) && ((angular.isDefined(columns[i].colDef.visible) && columns[i].colDef.visible === false) || columns[i].isRowHeader === true)) {
                      position++;
                    }
                  }
                  return position;
                };
                self.redrawColumnAtPosition(grid, findPositionForRenderIndex(originalPosition), findPositionForRenderIndex(finalPosition));
              }
            }
          }
        };
        grid.api.registerEventsFromObject(publicApi.events);
        grid.api.registerMethodsFromObject(publicApi.methods);
      },
      defaultGridOptions: function (gridOptions) {
        /**
         *  @ngdoc object
         *  @name ui.grid.moveColumns.api:GridOptions
         *
         *  @description Options for configuring the move column feature, these are available to be
         *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
         */
        /**
         *  @ngdoc object
         *  @name enableColumnMoving
         *  @propertyOf  ui.grid.moveColumns.api:GridOptions
         *  @description If defined, sets the default value for the colMovable flag on each individual colDefs
         *  if their individual enableColumnMoving configuration is not defined. Defaults to true.
         */
        gridOptions.enableColumnMoving = gridOptions.enableColumnMoving !== false;
      },
      movableColumnBuilder: function (colDef, col, gridOptions) {
        var promises = [];
        /**
         *  @ngdoc object
         *  @name ui.grid.moveColumns.api:ColumnDef
         *
         *  @description Column Definition for move column feature, these are available to be
         *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
         */
        /**
         *  @ngdoc object
         *  @name enableColumnMoving
         *  @propertyOf  ui.grid.moveColumns.api:ColumnDef
         *  @description Enable column moving for the column.
         */
        colDef.enableColumnMoving = colDef.enableColumnMoving === undefined ? gridOptions.enableColumnMoving
          : colDef.enableColumnMoving;
        return $q.all(promises);
      },
      redrawColumnAtPosition: function (grid, originalPosition, newPosition) {

        var columns = grid.columns;

        var originalColumn = columns[originalPosition];
        if (originalColumn.colDef.enableColumnMoving) {
          if (originalPosition > newPosition) {
            for (var i1 = originalPosition; i1 > newPosition; i1--) {
              columns[i1] = columns[i1 - 1];
            }
          }
          else if (newPosition > originalPosition) {
            for (var i2 = originalPosition; i2 < newPosition; i2++) {
              columns[i2] = columns[i2 + 1];
            }
          }
          columns[newPosition] = originalColumn;
          $timeout(function () {
            grid.refresh();
            grid.api.colMovable.raise.columnPositionChanged(originalColumn.colDef, originalPosition, newPosition);
          });
        }
      }
    };
    return service;
  }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.moveColumns.directive:uiGridMoveColumns
   *  @element div
   *  @restrict A
   *  @description Adds column moving features to the ui-grid directive.
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.moveColumns']);
   app.controller('MainCtrl', ['$scope', function ($scope) {
        $scope.data = [
          { name: 'Bob', title: 'CEO', age: 45 },
          { name: 'Frank', title: 'Lowly Developer', age: 25 },
          { name: 'Jenny', title: 'Highly Developer', age: 35 }
        ];
        $scope.columnDefs = [
          {name: 'name'},
          {name: 'title'},
          {name: 'age'}
        ];
      }]);
   </file>
   <file name="main.css">
   .grid {
      width: 100%;
      height: 150px;
    }
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div class="grid" ui-grid="{ data: data, columnDefs: columnDefs }" ui-grid-move-columns></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridMoveColumns', ['uiGridMoveColumnService', function (uiGridMoveColumnService) {
    return {
      replace: true,
      priority: 0,
      require: '^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            uiGridMoveColumnService.initializeGrid(uiGridCtrl.grid);
          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
          }
        };
      }
    };
  }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.moveColumns.directive:uiGridHeaderCell
   *  @element div
   *  @restrict A
   *
   *  @description Stacks on top of ui.grid.uiGridHeaderCell to provide capability to be able to move it to reposition column.
   *
   *  On receiving mouseDown event headerCell is cloned, now as the mouse moves the cloned header cell also moved in the grid.
   *  In case the moving cloned header cell reaches the left or right extreme of grid, grid scrolling is triggered (if horizontal scroll exists).
   *  On mouseUp event column is repositioned at position where mouse is released and cloned header cell is removed.
   *
   *  Events that invoke cloning of header cell:
   *    - mousedown
   *
   *  Events that invoke movement of cloned header cell:
   *    - mousemove
   *
   *  Events that invoke repositioning of column:
   *    - mouseup
   */
  module.directive('uiGridHeaderCell', ['$q', 'gridUtil', 'uiGridMoveColumnService', '$document', '$log', 'uiGridConstants', 'ScrollEvent',
    function ($q, gridUtil, uiGridMoveColumnService, $document, $log, uiGridConstants, ScrollEvent) {
      return {
        priority: -10,
        require: '^uiGrid',
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, uiGridCtrl) {

              if ($scope.col.colDef.enableColumnMoving) {

                $scope.$on(uiGridConstants.events.COLUMN_HEADER_CLICK, function (event, args) {

                  if (args.columnName === $scope.col.colDef.name) {

                    var evt = args.event;
                    if (evt.target.className !== 'ui-grid-icon-angle-down' && evt.target.tagName !== 'I' &&
                      evt.target.className.indexOf('ui-grid-filter-input') < 0) {

                      //Setting some variables required for calculations.
                      var gridLeft = $scope.grid.element[0].getBoundingClientRect().left;
                      var previousMouseX = evt.pageX;
                      var totalMouseMovement = 0;
                      var rightMoveLimit = gridLeft + $scope.grid.getViewportWidth();// - $scope.grid.verticalScrollbarWidth;

                      //Clone element should move horizontally with mouse.
                      var elmCloned = false;
                      var movingElm;
                      var reducedWidth;

                      var cloneElement = function () {
                        elmCloned = true;

                        //Cloning header cell and appending to current header cell.
                        movingElm = $elm.clone();
                        $elm.parent().append(movingElm);

                        //Left of cloned element should be aligned to original header cell.
                        movingElm.addClass('movingColumn');
                        var movingElementStyles = {};
                        var elmLeft = $elm[0].getBoundingClientRect().left;
                        movingElementStyles.left = (elmLeft - gridLeft) + 'px';
                        var gridRight = $scope.grid.element[0].getBoundingClientRect().right;
                        var elmRight = $elm[0].getBoundingClientRect().right;
                        if (elmRight > gridRight) {
                          reducedWidth = $scope.col.drawnWidth + (gridRight - elmRight);
                          movingElementStyles.width = reducedWidth + 'px';
                        }
                        movingElm.css(movingElementStyles);
                      };

                      var moveElement = function (changeValue) {
                        //Hide column menu
                        uiGridCtrl.fireEvent('hide-menu');

                        //Calculate new position of left of column
                        var currentElmLeft = movingElm[0].getBoundingClientRect().left - 1;
                        var currentElmRight = movingElm[0].getBoundingClientRect().right;
                        var newElementLeft;
                        if (gridUtil.detectBrowser() === 'ie') {
                          newElementLeft = currentElmLeft + changeValue;
                        }
                        else {
                          newElementLeft = currentElmLeft - gridLeft + changeValue;
                        }
                        newElementLeft = newElementLeft < rightMoveLimit ? newElementLeft : rightMoveLimit;

                        //Update css of moving column to adjust to new left value or fire scroll in case column has reached edge of grid
                        if ((currentElmLeft >= gridLeft || changeValue > 0) && (currentElmRight <= rightMoveLimit || changeValue < 0)) {
                          movingElm.css({visibility: 'visible', 'left': newElementLeft + 'px'});
                        }
                        else {
                          changeValue *= 8;
                          var scrollEvent = new ScrollEvent($scope.col.grid, null, null, 'uiGridHeaderCell.moveElement');
                          scrollEvent.x = {pixels: changeValue};
                          scrollEvent.fireScrollingEvent();
                        }
                        totalMouseMovement += changeValue;

                        //Increase width of moving column, in case the rightmost column was moved and its width was
                        //decreased because of overflow
                        if (reducedWidth < $scope.col.drawnWidth) {
                          reducedWidth += Math.abs(changeValue);
                          movingElm.css({'width': reducedWidth + 'px'});
                        }
                      };

                      var mouseMoveHandler = function (evt) {
                        var changeValue = evt.pageX - previousMouseX;
                        if (!elmCloned && Math.abs(changeValue) > 50) {
                          cloneElement();
                        }
                        else if (elmCloned) {
                          moveElement(changeValue);
                          previousMouseX = evt.pageX;
                        }
                      };

                      /*
                       //Commenting these lines as they are creating trouble with column moving when grid has huge scroll
                       // On scope destroy, remove the mouse event handlers from the document body
                       $scope.$on('$destroy', function () {
                       $document.off('mousemove', mouseMoveHandler);
                       $document.off('mouseup', mouseUpHandler);
                       });
                       */
                      $document.on('mousemove', mouseMoveHandler);

                      var mouseUpHandler = function (evt) {

                        //Remove the cloned element on mouse up.
                        if (movingElm) {
                          movingElm.remove();
                        }

                        var columns = $scope.grid.columns;
                        var columnIndex = 0;
                        for (var i = 0; i < columns.length; i++) {
                          if (columns[i].colDef.name !== $scope.col.colDef.name) {
                            columnIndex++;
                          }
                          else {
                            break;
                          }
                        }

                        //Case where column should be moved to a position on its left
                        if (totalMouseMovement < 0) {
                          var totalColumnsLeftWidth = 0;
                          for (var il = columnIndex - 1; il >= 0; il--) {
                            if (angular.isUndefined(columns[il].colDef.visible) || columns[il].colDef.visible === true) {
                              totalColumnsLeftWidth += columns[il].drawnWidth || columns[il].width || columns[il].colDef.width;
                              if (totalColumnsLeftWidth > Math.abs(totalMouseMovement)) {
                                uiGridMoveColumnService.redrawColumnAtPosition
                                ($scope.grid, columnIndex, il + 1);
                                break;
                              }
                            }
                          }
                          //Case where column should be moved to beginning of the grid.
                          if (totalColumnsLeftWidth < Math.abs(totalMouseMovement)) {
                            uiGridMoveColumnService.redrawColumnAtPosition
                            ($scope.grid, columnIndex, 0);
                          }
                        }

                        //Case where column should be moved to a position on its right
                        else if (totalMouseMovement > 0) {
                          var totalColumnsRightWidth = 0;
                          for (var ir = columnIndex + 1; ir < columns.length; ir++) {
                            if (angular.isUndefined(columns[ir].colDef.visible) || columns[ir].colDef.visible === true) {
                              totalColumnsRightWidth += columns[ir].drawnWidth || columns[ir].width || columns[ir].colDef.width;
                              if (totalColumnsRightWidth > totalMouseMovement) {
                                uiGridMoveColumnService.redrawColumnAtPosition
                                ($scope.grid, columnIndex, ir - 1);
                                break;
                              }
                            }
                          }
                          //Case where column should be moved to end of the grid.
                          if (totalColumnsRightWidth < totalMouseMovement) {
                            uiGridMoveColumnService.redrawColumnAtPosition
                            ($scope.grid, columnIndex, columns.length - 1);
                          }
                        }

                        else if (totalMouseMovement === 0) {
                          if (uiGridCtrl.grid.options.enableSorting && $scope.col.enableSorting) {
                            //sort the current column
                            var add = false;
                            if (evt.shiftKey) {
                              add = true;
                            }

                            // Sort this column then rebuild the grid's rows
                            uiGridCtrl.grid.sortColumn($scope.col, add)
                              .then(function () {
                                if (uiGridCtrl.columnMenuScope) {
                                  uiGridCtrl.columnMenuScope.hideMenu();
                                }
                                uiGridCtrl.grid.refresh();
                              });
                          }
                        }

                        $document.off('mousemove', mouseMoveHandler);
                        $document.off('mouseup', mouseUpHandler);
                      };

                      //Binding the mouseup event handler
                      $document.on('mouseup', mouseUpHandler);
                    }
                  }
                });
              }
            }
          };
        }
      };
    }]);
})();
