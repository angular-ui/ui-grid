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
  module.service('uiGridMoveColumnService', ['$q', '$timeout', function ($q, $timeout) {

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
                self.redrawColumnAtPosition(grid, originalPosition, finalPosition);
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

        //Function to find column position for a render index, ths is needed to take care of
        // invisible columns and row headers
        var findPositionForRenderIndex = function (index) {
          var position = index;
          for (var i = 0; i <= position; i++) {
            if ((angular.isDefined(columns[i].colDef.visible) && columns[i].colDef.visible === false) || columns[i].isRowHeader === true) {
              position++;
            }
          }
          return position;
        };

        originalPosition = findPositionForRenderIndex(originalPosition);
        newPosition = findPositionForRenderIndex(newPosition);
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
   *  On mouseUp event column is repositioned at position where mouse is released and coned header cell is removed.
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
  module.directive('uiGridHeaderCell', ['$q', 'gridUtil', 'uiGridMoveColumnService', '$document',
    function ($q, gridUtil, uiGridMoveColumnService, $document) {
      return {
        priority: -10,
        require: '^uiGrid',
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              if ($scope.col.colDef.enableColumnMoving) {

                var mouseDownHandler = function (evt) {
                  if (evt.target.className !== 'ui-grid-icon-angle-down' && evt.target.tagName !== 'I') {

                    //Cloning header cell and appending to current header cell.
                    var movingElm = $elm.clone();
                    $elm.append(movingElm);

                    //Left of cloned element should be aligned to original header cell.
                    movingElm.addClass('movingColumn');
                    var movingElementStyles = {};
                    var gridLeft = $scope.grid.element[0].getBoundingClientRect().left;
                    var elmLeft = $elm[0].getBoundingClientRect().left;
                    movingElementStyles.left = (elmLeft - gridLeft) + 'px';
                    var gridRight = $scope.grid.element[0].getBoundingClientRect().right;
                    var elmRight = $elm[0].getBoundingClientRect().right;
                    var reducedWidth;
                    if (elmRight > gridRight) {
                      reducedWidth = $scope.col.drawnWidth + (gridRight - elmRight);
                      movingElementStyles.width = reducedWidth + 'px';
                    }
                    //movingElementStyles.visibility = 'hidden';
                    movingElm.css(movingElementStyles);

                    //Setting some variables required for calculations.
                    var previousMouseX = evt.pageX;
                    var totalMouseMovement = 0;
                    var rightMoveLimit = gridLeft + $scope.grid.getViewportWidth() - $scope.grid.verticalScrollbarWidth;

                    //Clone element should move horizontally with mouse.
                    var mouseMoveHandler = function (evt) {
                      uiGridCtrl.fireEvent('hide-menu');
                      var currentElmLeft = movingElm[0].getBoundingClientRect().left - 1;
                      var currentElmRight = movingElm[0].getBoundingClientRect().right;
                      var changeValue = evt.pageX - previousMouseX;
                      var newElementLeft = currentElmLeft - gridLeft + changeValue;
                      newElementLeft = newElementLeft < rightMoveLimit ? newElementLeft : rightMoveLimit;
                      if ((currentElmLeft >= gridLeft || changeValue > 0) && (currentElmRight <= rightMoveLimit || changeValue < 0)) {
                        movingElm.css({visibility: 'visible', 'left': newElementLeft + 'px'});
                      }
                      else {
                        changeValue *= 5;
                        uiGridCtrl.fireScrollingEvent({ x: { pixels: changeValue * 2.5} });
                      }
                      totalMouseMovement += changeValue;
                      previousMouseX = evt.pageX;
                      if (reducedWidth < $scope.col.drawnWidth) {
                        reducedWidth += Math.abs(changeValue);
                        movingElm.css({'width': reducedWidth + 'px'});
                      }
                    };

                    // On scope destroy, remove the mouse event handlers from the document body
                    $scope.$on('$destroy', function () {
                      $document.off('mousemove', mouseMoveHandler);
                      $document.off('mouseup', mouseUpHandler);
                    });

                    $document.on('mousemove', mouseMoveHandler);
                    var mouseUpHandler = function (evt) {
                      var renderIndexDefer = $q.defer();

                      var renderIndex;
                      $attrs.$observe('renderIndex', function (n, o) {
                        renderIndex = $scope.$eval(n);
                        renderIndexDefer.resolve();
                      });

                      renderIndexDefer.promise.then(function () {

                        //Remove the cloned element on mouse up.
                        if (movingElm) {
                          movingElm.remove();
                        }

                        var renderedColumns = $scope.grid.renderContainers['body'].renderedColumns;

                        //This method will calculate the number of columns hidden in lift due to scroll
                        //renderContainer.prevColumnScrollIndex could also have been used but this is more accurate
                        var scrolledColumnCount = 0;
                        var columns = $scope.grid.columns;
                        for (var i = 0; i < columns.length; i++) {
                          if (columns[i].colDef.name !== renderedColumns[0].colDef.name) {
                            scrolledColumnCount++;
                          }
                          else {
                            break;
                          }
                        }

                        //Case where column should be moved to a position on its left
                        if (totalMouseMovement < 0) {
                          var totalColumnsLeftWidth = 0;
                          for (var il = renderIndex - 1; il >= 0; il--) {
                            totalColumnsLeftWidth += renderedColumns[il].drawnWidth;
                            if (totalColumnsLeftWidth > Math.abs(totalMouseMovement)) {
                              uiGridMoveColumnService.redrawColumnAtPosition
                              ($scope.grid, scrolledColumnCount + renderIndex, scrolledColumnCount + il + 1);
                              break;
                            }
                          }
                          //Case where column should be moved to beginning of the grid.
                          if (totalColumnsLeftWidth < Math.abs(totalMouseMovement)) {
                            uiGridMoveColumnService.redrawColumnAtPosition
                            ($scope.grid, scrolledColumnCount + renderIndex, scrolledColumnCount + 0);
                          }
                        }
                        //Case where column should be moved to a position on its right
                        else if (totalMouseMovement > 0) {
                          var totalColumnsRightWidth = 0;
                          for (var ir = renderIndex + 1; ir < renderedColumns.length; ir++) {
                            totalColumnsRightWidth += renderedColumns[ir].drawnWidth;
                            if (totalColumnsRightWidth > totalMouseMovement) {
                              uiGridMoveColumnService.redrawColumnAtPosition
                              ($scope.grid, scrolledColumnCount + renderIndex, scrolledColumnCount + ir - 1);
                              break;
                            }
                          }
                          //Case where column should be moved to end of the grid.
                          if (totalColumnsRightWidth < totalMouseMovement) {
                            uiGridMoveColumnService.redrawColumnAtPosition
                            ($scope.grid, scrolledColumnCount + renderIndex, scrolledColumnCount + renderedColumns.length - 1);
                          }
                        }
                        else if (totalMouseMovement === 0) {
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

                        $document.off('mousemove', mouseMoveHandler);
                        $document.off('mouseup', mouseUpHandler);
                      });
                    };

                    $document.on('mouseup', mouseUpHandler);
                  }
                };

                $elm.on('mousedown', mouseDownHandler);
              }
            }
          };
        }
      };
    }]);
})();
