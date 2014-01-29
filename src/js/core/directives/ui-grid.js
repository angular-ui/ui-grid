(function () {
  'use strict';
  var module = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body', 'ui.grid.row', 'ui.grid.style', 'ui.grid.scrollbar', 'ui.grid.util']);

  module.constant('uiGridConstants', {
    CUSTOM_FILTERS: /CUSTOM_FILTERS/g,
    COL_FIELD: /COL_FIELD/g,
    DISPLAY_CELL_TEMPLATE: /DISPLAY_CELL_TEMPLATE/g,
    TEMPLATE_REGEXP: /<.+>/,
    events: {
      GRID_SCROLL: 'uiGridScroll',
      GRID_SCROLLING: 'uiGridScrolling'
    },
    // copied from http://www.lsauer.com/2011/08/javascript-keymap-keycodes-in-json.html
    keymap: {
      TAB: 9,
      STRG: 17,
      CTRL: 17,
      CTRLRIGHT: 18,
      CTRLR: 18,
      SHIFT: 16,
      RETURN: 13,
      ENTER: 13,
      BACKSPACE: 8,
      BCKSP: 8,
      ALT: 18,
      ALTR: 17,
      ALTRIGHT: 17,
      SPACE: 32,
      WIN: 91,
      MAC: 91,
      FN: null,
      UP: 38,
      DOWN: 40,
      LEFT: 37,
      RIGHT: 39,
      ESC: 27,
      DEL: 46,
      F1: 112,
      F2: 113,
      F3: 114,
      F4: 115,
      F5: 116,
      F6: 117,
      F7: 118,
      F8: 119,
      F9: 120,
      F10: 121,
      F11: 122,
      F12: 123
    }
  });

  /**
   *  @ngdoc object
   *  @name ui.grid.service:gridClassFactory
   *
   *  @description factory to return dom specific instances of a grid
   *
   */
  module.service('gridClassFactory', ['gridUtil', '$q', '$templateCache', 'uiGridConstants', '$log',
        function (gridUtil, $q, $templateCache, uiGridConstants, $log) {

    var service = {
      /**
       * @ngdoc method
       * @name createGrid
       * @methodOf ui.grid.service:gridClassFactory
       * @description Creates a new grid instance. Each instance will have a unique id
       * @returns {Grid} grid
       */
      createGrid : function() {
        var grid = new Grid(gridUtil.newId());
        grid.registerColumnBuilder(service.defaultColumnBuilder);
        return grid;
      },

      /**
       * @ngdoc function
       * @name defaultColumnBuilder
       * @methodOf ui.grid.service:gridClassFactory
       * @description Processes designTime column definitions and applies them to col for the
       *              core grid features
       * @param {object} colDef reference to column definition
       * @param {GridColumn} col reference to gridCol
       * @param {object} gridOptions reference to grid options
       */
      defaultColumnBuilder: function (colDef, col, gridOptions) {

        var templateGetPromises = [];

        col.headerCellTemplate = colDef.headerCellTemplate || $templateCache.get('ui-grid/uiGridHeaderCell');

        col.cellTemplate = colDef.cellTemplate ||
          $templateCache.get('ui-grid/uiGridCell')
            .replace(uiGridConstants.CUSTOM_FILTERS, col.cellFilter ? "|" + col.cellFilter : "");

        if (colDef.cellTemplate && !uiGridConstants.TEMPLATE_REGEXP.test(colDef.cellTemplate)) {
          templateGetPromises.push(
            gridUtil.getTemplate(colDef.cellTemplate)
              .then(function (contents) {
                col.cellTemplate = contents;
              })
          );
        }

        if (colDef.headerCellTemplate && !uiGridConstants.TEMPLATE_REGEXP.test(colDef.headerCellTemplate)) {
          templateGetPromises.push(
            gridUtil.getTemplate(colDef.headerCellTemplate)
              .then(function (contents) {
                col.headerCellTemplate = contents;
              })
          );
        }

        return $q.all(templateGetPromises);
      }

    };

    //class definitions


    /**
     * @ngdoc function
     * @name ui.grid.class:Grid
     * @description Grid defines a logical grid.  Any non-dom properties and elements needed by the grid should
     *              be defined in this class
     * @param {string} id id to assign to grid
     */
    var Grid = function (id) {
      this.id = id;
      this.options = new GridOptions();
      this.headerHeight = this.options.headerRowHeight;
      this.gridHeight = 0;
      this.gridWidth = 0;
      this.columnBuilders = [];
      this.rowBuilders = [];
      this.styleComputations = [];


      //representation of the rows on the grid.
      //these are wrapped references to the actual data rows (options.data)
      this.rows = [];

      //represents the columns on the grid
      this.columns = [];

      //current rows that are rendered on the DOM
      this.renderedRows = [];
      this.renderedColumns = [];
    };

    /**
     * @ngdoc function
     * @name registerColumnBuilder
     * @methodOf ui.grid.class:Grid
     * @description When the build creates columns from column definitions, the columnbuilders will be called to add
     * additional properties to the column.
     * @param {function(colDef, col, gridOptions)} columnsProcessor function to be called
     */
    Grid.prototype.registerColumnBuilder = function (columnsProcessor) {
      this.columnBuilders.push(columnsProcessor);
    };

    /**
     * @ngdoc function
     * @name getColumn
     * @methodOf ui.grid.class:Grid
     * @description returns a grid column for the column name
     * @param {string} name column name
     */
    Grid.prototype.getColumn = function (name) {
      var columns = this.columns.filter(function (column) {
        return column.colDef.name === name;
      });
      return columns.length > 0 ? columns[0] : null;
    };

    /**
     * @ngdoc function
     * @name buildColumns
     * @methodOf ui.grid.class:Grid
     * @description creates GridColumn objects from the columnDefinition.  Calls each registered
     * columnBuilder to further process the column
     * @returns {Promise} a promise to load any needed column resources
     */
    Grid.prototype.buildColumns = function () {
      $log.debug('buildColumns');
      var self = this;
      var builderPromises = [];

      self.options.columnDefs.forEach(function (colDef, index) {
        self.preprocessColDef(colDef);
        var col = self.getColumn(colDef.name);

        if (!col) {
          col = new GridColumn(colDef, index);
          self.columns.push(col);
        }
        else {
          col.updateColumnDef(colDef, col.index);
        }

        self.columnBuilders.forEach(function (builder) {
          builderPromises.push(builder.call(self, colDef, col, self.options));
        });
        
      });

      return $q.all(builderPromises);
    };

    /**
     * undocumented function
     * @name preprocessColDef
     * @methodOf ui.grid.class:Grid
     * @description defaults the name property from field to maintain backwards compatibility with 2.x
     * validates that name or field is present
     */
    Grid.prototype.preprocessColDef = function (colDef) {
      if (!colDef.field && !colDef.name) {
        throw new Error('colDef.name or colDef.field property is required');
      }

      //maintain backwards compatibility with 2.x
      //field was required in 2.x.  now name is required
      if (colDef.name === undefined && colDef.field !== undefined) {
        colDef.name = colDef.field;
      }
    };

    /**
     * @ngdoc function
     * @name modifyRows
     * @methodOf ui.grid.class:Grid
     * @description creates or removes GridRow objects from the newRawData array.  Calls each registered
     * rowBuilder to further process the row
     *
     * Rows are identified using the gridOptions.rowEquality function
     */
    Grid.prototype.modifyRows = function(newRawData) {
      var self = this;

      if (self.rows.length === 0 && newRawData.length > 0) {
        self.addRows(newRawData);
        return;
      }

      //look for new rows
      var newRows = newRawData.filter(function (newItem) {
         return !self.rows.some(function(oldRow) {
           return self.options.rowEquality(oldRow.entity, newItem);
         });
      });

      for (i = 0; i < newRows.length; i++) {
        self.addRows([newRows[i]]);
      }

      //look for deleted rows
      var deletedRows = self.rows.filter(function (oldRow) {
        return !newRawData.some(function (newItem) {
          return self.options.rowEquality(newItem, oldRow.entity);
        });
      });

      for (var i = 0; i < deletedRows.length; i++) {
          self.rows.splice( self.rows.indexOf(deletedRows[i] ), 1 );
      }

    };

  /**
    * Private Undocumented Method
    * @name addRows
    * @methodOf ui.grid.class:Grid
    * @description adds the newRawData array of rows to the grid and calls all registered
    * rowBuilders
    */
    Grid.prototype.addRows = function(newRawData) {
      var self = this;

      for (var i=0; i < newRawData.length; i++) {
        self.rows.push( self.processRowBuilders(new GridRow(newRawData[i], i)) );
      }
    };

    /**
     * @ngdoc function
     * @name processRowBuilders
     * @methodOf ui.grid.class:Grid
     * @description processes all RowBuilders for the gridRow
     * @param {GridRow} gridRow reference to gridRow
     * @returns {GridRow} the gridRow with all additional behavior added
     */
    Grid.prototype.processRowBuilders = function(gridRow) {
      var self = this;

      self.rowBuilders.forEach(function (builder) {
        builder.call(self,gridRow);
      });

      return gridRow;
    };

    /**
     * @ngdoc function
     * @name registerStyleComputation
     * @methodOf ui.grid.class:Grid
     * @description registered a styleComputation function
     * @param {function($scope)} styleComputation function
     */
    Grid.prototype.registerStyleComputation = function (styleComputation) {
      this.styleComputations.push(styleComputation);
    };

    Grid.prototype.setRenderedRows = function (newRows) {
      this.renderedRows.length = newRows.length;
      for (var i = 0; i < newRows.length; i++) {
        this.renderedRows[i] = newRows[i];
      }
    };

    Grid.prototype.setRenderedColumns = function (newColumns) {
      this.renderedColumns.length = newColumns.length;
      for (var i = 0; i < newColumns.length; i++) {
        this.renderedColumns[i] = newColumns[i];
      }
    };

    /**
     * @ngdoc function
     * @name buildStyles
     * @methodOf ui.grid.class:Grid
     * @description calls each styleComputation function
     */
    Grid.prototype.buildStyles = function ($scope) {
      var self = this;
      self.styleComputations.forEach(function (comp) {
        comp.call(self, $scope);
      });
    };

    Grid.prototype.minRowsToRender = function () {
      return Math.ceil(this.getViewportHeight() / this.options.rowHeight);
    };

    Grid.prototype.minColumnsToRender = function () {
      return Math.ceil(this.getViewportWidth() / this.options.columnWidth);
    };

    // NOTE: viewport drawable height is the height of the grid minus the header row height (including any border)
    // TODO(c0bra): account for footer height
    Grid.prototype.getViewportHeight = function () {
      var viewPortHeight = this.gridHeight - this.headerHeight;
      return viewPortHeight;
    };

    Grid.prototype.getViewportWidth = function () {
      var viewPortWidth = this.gridWidth;
      return viewPortWidth;
    };

    Grid.prototype.getCanvasHeight = function () {
      return this.options.rowHeight * this.rows.length;
    };

    Grid.prototype.getCanvasWidth = function () {
      return this.canvasWidth;
    };

    Grid.prototype.getTotalRowHeight = function () {
      return this.options.rowHeight * this.rows.length;
    };

    // Is the grid currently scrolling?
    Grid.prototype.isScrolling = function() {
      return this.scrolling ? true : false;
    };

    Grid.prototype.setScrolling = function(scrolling) {
      this.scrolling = scrolling;
    };


    /**
     * @ngdoc function
     * @name ui.grid.class:GridOptions
     * @description Default GridOptions class.  GridOptions are defined by the application developer and overlaid
     * over this object.
     * @param {string} id id to assign to grid
     */
    function GridOptions() {
      /**
       * @ngdoc object
       * @name data
       * @propertyOf  ui.grid.class:GridOptions
       * @description Array of data to be rendered to grid.  Array can contain complex objects
       */
      this.data = [];

      /**
       * @ngdoc object
       * @name columnDefs
       * @propertyOf  ui.grid.class:GridOptions
       * @description (optional) Array of columnDef objects.  Only required property is name.
       * _field property can be used in place of name for backwards compatibilty with 2.x_
       *  @example

       var columnDefs = [{name:'field1'}, {name:'field2'}];

       */
      this.columnDefs = [];

      this.headerRowHeight = 30;
      this.rowHeight = 30;
      this.maxVisibleRowCount = 200;

      this.columnWidth = 50;
      this.maxVisibleColumnCount = 200;

      // Turn virtualization on when number of data elements goes over this number
      this.virtualizationThreshold = 50;

      this.columnVirtualizationThreshold = 20;

      // Extra rows to to render outside of the viewport
      this.excessRows = 4;

      // Extra columns to to render outside of the viewport
      this.excessColumns = 8;

      this.scrollThreshold = 4;

      this.horizontalScrollThreshold = 2;

      /**
       * @ngdoc function
       * @name rowEquality
       * @methodOf ui.grid.class:GridOptions
       * @description By default, rows are compared using object equality.  This option can be overridden
       * to compare on any data item property or function
       * @param {object} entityA First Data Item to compare
       * @param {object} entityB Second Data Item to compare
       */
      this.rowEquality = function(entityA, entityB) {
        return entityA === entityB;
      };

      // Custom template for header row
      this.headerTemplate = null;
    }

    /**
     * @ngdoc function
     * @name ui.grid.class:GridRow
     * @description Wrapper for the GridOptions.data rows.  Allows for needed properties and functions
     * to be assigned to a grid row
     * @param {object} entity the array item from GridOptions.data
     * @param {number} index the current position of the row in the array
     */
    function GridRow(entity, index) {
      this.entity = entity;
      this.index = index;
    }

    /**
     * @ngdoc function
     * @name getQualifiedColField
     * @methodOf ui.grid.class:GridRow
     * @description returns the qualified field name as it exists on scope
     * ie: row.entity.fieldA
     * @param {GridCol} col column instance
     * @returns {string} resulting name that can be evaluated on scope
     */
    GridRow.prototype.getQualifiedColField = function(col) {
      return 'row.entity.' + col.field;
    };

    GridRow.prototype.getEntityQualifiedColField = function(col) {
      return 'entity.' + col.field;
    };

    /**
     * @ngdoc function
     * @name ui.grid.class:GridColumn
     * @description Wrapper for the GridOptions.colDefs items.  Allows for needed properties and functions
     * to be assigned to a grid column
     * @param {ColDef} colDef Column definition.
      <br/>Required properties
      <ul>
        <li>
          name - name of field
       </li>
      </ul>

      <br/>Optional properties
      <ul>
        <li>
          field - angular expression that evaluates against grid.options.data array element.
          <br/>can be complex - employee.address.city
          <br/>Can also be a function - employee.getFullAddress()
          <br/>see angular docs on binding expressions
       </li>
       <li>displayName - column name when displayed on screen.  defaults to name</li>
       <li>todo: add other optional fields as implementation matures</li>
      </ul>
     *
     * @param {number} index the current position of the column in the array
     */
    function GridColumn(colDef, index) {
      var self = this;

      colDef.index = index;

      self.updateColumnDef(colDef);
    }

    GridColumn.prototype.updateColumnDef = function(colDef, index) {
      var self = this;

      self.colDef = colDef;

      //position of column
      self.index = (typeof(index) === 'undefined') ? colDef.index : index;

      if (colDef.name === undefined) {
        throw new Error('colDef.name is required for column at index ' + self.index);
      }

      var parseErrorMsg = "Cannot parse column width '" + colDef.width + "' for column named '" + colDef.name + "'";

      // If width is not defined, set it to a single star
      if (gridUtil.isNullOrUndefined(colDef.width)) {
        self.width = '*';
      }
      else {
        // If the width is not a number
        if (! angular.isNumber(colDef.width)) {
          // See if it ends with a percent
          if (gridUtil.endsWith(colDef.width, '%')) {
            // If so we should be able to parse the non-percent-sign part to a number
            var percentStr = colDef.width.replace(/%/g, '');
            var percent = parseFloat(percentStr);
            if (isNaN(percent)) {
              throw new Error(parseErrorMsg);
            }
          }
          // And see if it's a number string
          else if (colDef.width.match(/^(\d+)$/)) {
            self.width = parseFloat(colDef.width.match(/^(\d+)$/)[1]);
          }
          // Otherwise it should be a string of asterisks
          else if (! colDef.width.match(/^\*+$/)) {
            throw new Error(parseErrorMsg);
          }
        }
        // Is a number, use it as the width
        else {
          self.width = colDef.width;
        }
      }

      self.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
      self.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;


      //use field if it is defined; name if it is not
      self.field = (colDef.field === undefined) ? colDef.name : colDef.field;

      // Use colDef.displayName as long as it's not undefined, otherwise default to the field name
      self.displayName = (colDef.displayName === undefined) ? gridUtil.readableColumnName(colDef.name) : colDef.displayName;

      //self.originalIndex = index;

      self.cellClass = colDef.cellClass;
      self.cellFilter = colDef.cellFilter ? colDef.cellFilter : "";

      self.visible = gridUtil.isNullOrUndefined(colDef.visible) || colDef.visible;

      self.headerClass = colDef.headerClass;
      //self.cursor = self.sortable ? 'pointer' : 'default';

      self.visible = true;
    };

    return service;
  }]);

  module.controller('uiGridController', ['$scope', '$element', '$attrs', '$log', 'gridUtil', '$q', 'uiGridConstants',
                    '$templateCache', 'gridClassFactory', '$timeout', '$parse',
    function ($scope, $elm, $attrs, $log, gridUtil, $q, uiGridConstants,
              $templateCache, gridClassFactory, $timeout, $parse) {
      $log.debug('ui-grid controller');

      var self = this;

      self.grid = gridClassFactory.createGrid();

      // Extend options with ui-grid attribute reference
      angular.extend(self.grid.options, $scope.uiGrid);

      //all properties of grid are available on scope
      $scope.grid = self.grid;

      if ($attrs.uiGridColumns) {
        $attrs.$observe('uiGridColumns', function(value) {
          self.grid.options.columnDefs = value;
          self.grid.buildColumns()
            .then(function(){
              // self.columnSizeCalculated = false;
              // self.renderedColumns = self.grid.columns;
              self.refreshCanvas();
            });
        });
      }
      else {
        if (self.grid.options.columnDefs.length > 0) {
        //   self.grid.buildColumns();
        }
      }


      var dataWatchCollectionDereg;
      if (angular.isString($scope.uiGrid.data)) {
        dataWatchCollectionDereg = $scope.$parent.$watchCollection($scope.uiGrid.data, dataWatchFunction);
      }
      else {
        dataWatchCollectionDereg = $scope.$parent.$watchCollection(function() { return $scope.uiGrid.data; }, dataWatchFunction);
      }

      var columnDefWatchDereg = $scope.$parent.$watchCollection(function() { return $scope.uiGrid.columnDefs; }, function(n, o) {
        if (n && n !== o) {
          self.grid.options.columnDefs = n;
          self.grid.buildColumns()
            .then(function(){
              // self.columnSizeCalculated = false;
              // self.renderedColumns = self.grid.columns;
              self.refreshCanvas();
            });
        }
      });

      function dataWatchFunction(n) {
        $log.debug('dataWatch fired');
        var promises = [];

        if (n) {
          //load columns if needed
          if (!$attrs.uiGridColumns && self.grid.options.columnDefs.length === 0) {
              self.grid.options.columnDefs =  gridUtil.getColumnsFromData(n);
          }
          promises.push(self.grid.buildColumns());

          $q.all(promises).then(function() {
            //wrap data in a gridRow
            $log.debug('Modifying rows');
            self.grid.modifyRows(n);

            //todo: move this to the ui-body-directive and define how we handle ordered event registration
            if (self.viewport) {
              var scrollTop = self.viewport[0].scrollTop;
              var scrollLeft = self.viewport[0].scrollLeft;
              self.adjustScrollVertical(scrollTop, 0, true);
              self.adjustScrollHorizontal(scrollLeft, 0, true);
            }

            $scope.$evalAsync(function() {
              self.refreshCanvas();
            });
          });
        }
      }


      $scope.$on('$destroy', function() {
        dataWatchCollectionDereg();
        columnDefWatchDereg();
      });


      $scope.$watch(function () { return self.grid.styleComputations; }, function() {
        self.refreshCanvas();
      });

      // Refresh the canvas drawable size
      $scope.grid.refreshCanvas = self.refreshCanvas = function() {
        // if (self.header) {
        //   // If we haven't calculated the sizes of the columns, calculate them!
        //   if (! self.columnSizeCalculated) {
        //     // Total width of header
        //     var totalWidth = 0;

        //     // All the header cell elements
        //     var headerColumnElms = self.header[0].getElementsByClassName('ui-grid-header-cell');
            
        //     if (headerColumnElms.length > 0) {
        //       // Go through all the header column elements
        //       for (var i = 0; i < headerColumnElms.length; i++) {
        //         var columnElm = headerColumnElms[i];

        //         // Get the related column definition
        //         var column = angular.element(columnElm).scope().col;

        //         // Save the width so we can reset it
        //         var savedWidth = columnElm.style.width;

        //         // Change the width to 'auto' so it will expand out
        //         columnElm.style.width = 'auto';

        //         // Get the "drawn" width
        //         var drawnWidth = gridUtil.outerElementWidth(columnElm);

        //         // Save it in the columns defs
        //         column.drawnWidth = drawnWidth;

        //         // Reset the column width
        //         columnElm.style.width = savedWidth;

        //         // Increment the total header width by this column's drawn width
        //         totalWidth = totalWidth + drawnWidth;
        //       }

        //       // If the total width of the header would be larger than the viewport, use it as the canvas width
        //       if (totalWidth > self.grid.getViewportWidth()) {
        //         self.grid.canvasWidth = totalWidth;

        //         // Tell the grid to use the column drawn widths, if available
        //         self.grid.useColumnDrawnWidths = true;
        //       }
        //       else {
        //         self.grid.canvasWidth = self.grid.getViewportWidth();
        //       }

        //       // Evaluate all the stylings in another digest cycle
        //       $scope.$evalAsync(function() {
        //         self.grid.buildStyles($scope);
        //       });

        //       self.columnSizeCalculated = true;
        //     }
        //   }
        // }

        self.grid.buildStyles($scope);

        if (self.header) {
          // Putting in a timeout as it's not calculating after the grid element is rendered and filled out
          $timeout(function() {
            self.grid.headerHeight = gridUtil.outerElementHeight(self.header);
          }, 0);
        }
      };

      var cellValueGetterCache = {};
      self.getCellValue = function(row,col){
        if(!cellValueGetterCache[col.colDef.name]){
          cellValueGetterCache[col.colDef.name] = $parse(row.getEntityQualifiedColField(col));
        }
        return cellValueGetterCache[col.colDef.name](row);
      };

      //todo: throttle this event?
      self.fireScrollingEvent = function() {
        $scope.$broadcast(uiGridConstants.events.GRID_SCROLLING);
      };

    }]);

/**
 *  @ngdoc directive
 *  @name ui.grid.directive:uiGrid
 *  @element div
 *  @restrict EA
 *  @param {Object} uiGrid Options for the grid to use
 *  
 *  @description Create a very basic grid.
 *
 *  @example
    <example module="app">
      <file name="app.js">
        var app = angular.module('app', ['ui.grid']);

        app.controller('MainCtrl', ['$scope', function ($scope) {
          $scope.data = [
            { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
          ];
        }]);
      </file>
      <file name="index.html">
        <div ng-controller="MainCtrl">
          <div ui-grid="{ data: data }"></div>
        </div>
      </file>
    </example>
 */
module.directive('uiGrid',
  [
    '$log',
    '$compile',
    '$templateCache',
    'gridUtil',
    function(
      $log,
      $compile,
      $templateCache,
      gridUtil
      ) {
      return {
        templateUrl: 'ui-grid/ui-grid',
        scope: {
          uiGrid: '='
        },
        replace: true,
        controller: 'uiGridController',
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              $log.debug('ui-grid postlink');

              uiGridCtrl.grid.element = $elm;

              uiGridCtrl.grid.gridWidth = $scope.gridWidth = gridUtil.elementWidth($elm);

              // Default canvasWidth to the grid width, in case we don't get any column definitions to calculate it from
              uiGridCtrl.grid.canvasWidth = uiGridCtrl.grid.gridWidth;

              uiGridCtrl.grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);
              
              uiGridCtrl.grid.columnOffset = 0;

              uiGridCtrl.refreshCanvas();
            }
          };
        }
      };
    }
  ]);


  module.directive('uiGridCell', ['$compile', 'uiGridConstants', '$log', '$parse', function ($compile, uiGridConstants, $log, $parse) {
    var uiGridCell = {
      priority: 0,
      scope: false,
      compile: function() {
        return {
          pre: function($scope, $elm) {
            // $log.debug('uiGridCell pre-link');
            var html = $scope.col.cellTemplate
              .replace(uiGridConstants.COL_FIELD, 'getCellValue(row,col)');
            var cellElement = $compile(html)($scope);
            $elm.append(cellElement);
          },
          post: function($scope, $elm, $attrs) {

          }
        };
      }
    };

    return uiGridCell;
  }]);

})();