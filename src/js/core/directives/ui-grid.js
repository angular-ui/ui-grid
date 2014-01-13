(function () {
  'use strict';
  var module = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body', 'ui.grid.row', 'ui.grid.style', 'ui.grid.scrollbar', 'ui.grid.util']);

  module.constant('uiGridConstants', {
    CUSTOM_FILTERS: /CUSTOM_FILTERS/g,
    COL_FIELD: /COL_FIELD/g,
    DISPLAY_CELL_TEMPLATE: /DISPLAY_CELL_TEMPLATE/g,
    EDITABLE_CELL_TEMPLATE: /EDITABLE_CELL_TEMPLATE/g,
    TEMPLATE_REGEXP: /<.+>/
  });


  module.service('gridClassFactory', ['gridUtil', '$q', '$templateCache', 'uiGridConstants',
        function (gridUtil, $q, $templateCache, uiGridConstants) {

    var service = {
      /**
       * @ngdoc method
       * @name createGrid
       * @methodOf ui.grid.directive:uiGrid
       * @description Creates a new grid instnace
       * @returns {Grid} grid
       */
      createGrid : function(){
        var grid = new Grid(gridUtil.newId());
        grid.registerColumnBuilder(service.defaultColumnBuilder);
        return grid;
      },

      /**
       * Processes designTime column definitions and creates runtime column properties
       * @param grid - reference to grid
       * @returns a promise
       */
      defaultColumnBuilder: function (grid) {
        if (!grid.options.columnDefs && !grid.options.columnDefs.length) {
          throw new Error('argument colDefs is not an array');
        }

        var templateGetPromises = [];

        grid.options.columnDefs.forEach(function (colDef, index) {
          if (!colDef.field) {
            throw new Error('colDef.field property is required');
          }
          var col = grid.getColumn(colDef.field);

          if (!col) {
            col = new GridColumn(colDef,index);
            grid.columns.push(col);
          }

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
        });

        return $q.all(templateGetPromises);
      }

    };

    //class definitions

    /**
     * @description Grid defines a logical grid.  Any non-dom properties and elements needed by the grid should
     *              be defined in this class
     * @param id
     * @constructor
     */
    var Grid = function (id) {
      this.id = id;
      this.options = new Options();
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
    };

    Grid.prototype.registerColumnBuilder = function (columnsProcessor) {
      this.columnBuilders.push(columnsProcessor);
    };

    Grid.prototype.getColumn = function (field) {
       var columns = this.columns.filter(function(column){return column.colDef.field === field;});
       return columns.length > 0 ? columns[0] : null;
    };

    Grid.prototype.buildColumns = function () {
      var self = this;
      var builderPromises = [];
      self.columnBuilders.forEach(function (builder) {
        builderPromises.push(builder.call(self,self));
      });
      return $q.all(builderPromises);
    };

    Grid.prototype.modifyRows = function(newRawData) {
      var self = this;

      if (self.rows.length === 0 && newRawData.length > 0) {
        self.addRows(newRawData);
        return;
      }

      //look for new rows
      var newRows = newRawData.filter(function (newItem) {
         return !self.rows.some(function(oldRow) {
           return self.options.rowEquality(oldRow.entity,newItem);
         });
      });

      for (i = 0; i < newRows.length; i++) {
        self.addRows([newRows[i]]);
      }

      //look for deleted rows
      var deletedRows = self.rows.filter(function(oldRow){
        return !newRawData.some(function(newItem){
          return self.options.rowEquality(newItem,oldRow.entity);
        });
      });

      for (var i = 0; i < deletedRows.length; i++) {
          self.rows.splice( self.rows.indexOf(deletedRows[i] ), 1 );
      }

    };

    Grid.prototype.addRows = function(newRawData) {
      var self = this;

      for(var i=0; i < newRawData.length; i++) {
        self.rows.push( self.processRowBuilders(new GridRow(newRawData[i],i)) );
      }
    };

    Grid.prototype.processRowBuilders = function(gridRow) {
      var self = this;

      self.rowBuilders.forEach(function (builder) {
        builder.call(self,gridRow);
      });

      return gridRow;
    };


    Grid.prototype.registerStyleComputation = function (styleComputation) {
      this.styleComputations.push(styleComputation);
    };

    Grid.prototype.setRenderedRows = function (newRows) {
      for (var i = 0; i < newRows.length; i++) {
        this.renderedRows.length = newRows.length;

        this.renderedRows[i] =newRows[i];
      }
    };

    Grid.prototype.buildStyles = function ($scope) {
      var self = this;
      self.styleComputations.forEach(function (comp) {
        comp.call(self, $scope);
      });
    };

    Grid.prototype.minRowsToRender = function () {
      return Math.ceil(this.getViewportHeight() / this.options.rowHeight);
    };

    // NOTE: viewport drawable height is the height of the grid minus the header row height (including any border)
    // TODO(c0bra): account for footer height
    Grid.prototype.getViewportHeight = function () {
      return this.gridHeight - this.headerHeight;
    };

    Grid.prototype.getCanvasHeight = function () {
      return this.options.rowHeight * this.rows.length;
    };

    Grid.prototype.getTotalRowHeight = function () {
      return this.options.rowHeight * this.rows.length;
    };


    //Grid Options defaults
    function Options() {
      this.data = [];
      this.columnDefs = [];
      this.headerRowHeight = 30;
      this.rowHeight = 30;
      this.maxVisibleRowCount = 200;

      // Turn virtualization on when number of data elements goes over this number
      this.virtualizationThreshold = 50;

      // Extra rows to to render outside of the viewport
      this.excessRows = 4;

      this.scrollThreshold = 4;

      //rows are compared via reference by default.  This can be overridden to compare on whatever you like
      this.rowEquality = function(itemA,itemB) {
        return itemA === itemB;
      };
    }

    /**
     *
     * @param entity (the item from options.data
     * @param index current position of row
     * @constructor
     */
    function GridRow(entity, index) {
      this.entity = entity;
      this.index = index;
    }

    /**
     * @constructor GridColumn is a runtime representation of a column
     * @param colDef Designtime column definition
     */
    function GridColumn(colDef, index) {
      var self = this;
      self.colDef = colDef;

      //position of column
      self.index = index;

      self.width = colDef.width;
      self.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
      self.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;

      // Use colDef.displayName as long as it's not undefined, otherwise default to the field name
      self.displayName = (colDef.displayName === undefined) ? gridUtil.readableColumnName(colDef.field) : colDef.displayName;

      //self.originalIndex = index;

      self.cellClass = colDef.cellClass;
      self.cellFilter = colDef.cellFilter ? colDef.cellFilter : "";

      self.visible = gridUtil.isNullOrUndefined(colDef.visible) || colDef.visible;


      self.headerClass = colDef.headerClass;
      self.cursor = self.sortable ? 'pointer' : 'default';

    }

    return service;
  }]);

  module.controller('uiGridController',['$scope', '$element', '$attrs','$log','gridUtil','$q','uiGridConstants',
    '$templateCache','gridClassFactory',
    function ($scope, $elm, $attrs, $log, gridUtil, $q, uiGridConstants, $templateCache, gridClassFactory) {
      $log.debug('ui-grid controller');

      var self = this;

      self.grid = gridClassFactory.createGrid();

      //extend options with ui-grid attribute reference
      angular.extend(self.grid.options, $scope.uiGrid);

      //all properties of grid are available on scope
      $scope.grid = self.grid;

      if ($attrs.uiGridColumns) {
        $attrs.$observe('uiGridColumns', function(value) {
          self.grid.options.columnDefs =  value;
          self.grid.buildColumns()
            .then(function(){
              self.refreshCanvas();
            });
        });
      }
      else {
        if (self.grid.options.columnDefs.length > 0) {
           self.grid.buildColumns();
        }
      }


      var dataWatchCollectionDereg;
      if (angular.isString($scope.uiGrid.data)) {
        dataWatchCollectionDereg = $scope.$parent.$watchCollection($scope.uiGrid.data, dataWatchFunction);
      }
      else {
        dataWatchCollectionDereg = $scope.$parent.$watchCollection(function() { return $scope.uiGrid.data; }, dataWatchFunction);
      }

      function dataWatchFunction(n) {
        $log.debug('dataWatch fired');
        var promises = [];

        if (n) {
          //load columns if needed
          if (!$attrs.uiGridColumns && self.grid.options.columnDefs.length === 0) {
              self.grid.options.columnDefs =  gridUtil.getColumnsFromData(n);
              promises.push(self.grid.buildColumns());
          }

          $q.all(promises).then(function() {
            //wrap data in a gridRow
            $log.debug('Modifying rows');
            self.grid.modifyRows(n);

            //todo: move this to the ui-body-directive and define how we handle ordered event registration
            if (self.viewport) {
              var scrollTop = self.viewport[0].scrollTop;
              self.adjustScrollVertical(scrollTop, null, true);
            }

            $scope.$evalAsync(function() {
              self.refreshCanvas();
            });
          });
        }
      }


      $scope.$on('$destroy', dataWatchCollectionDereg);


      $scope.$watch(function () { return self.grid.styleComputations; }, function() {
        self.grid.buildStyles($scope);
      });

      // Refresh the canvas drawable size
      self.refreshCanvas = function() {
        if (self.header) {
          self.grid.headerHeight = gridUtil.outerElementHeight(self.header);
        }

        self.grid.buildStyles($scope);
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

              uiGridCtrl.grid.gridWidth = $scope.gridWidth = $elm[0].clientWidth;
              uiGridCtrl.grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

              uiGridCtrl.refreshCanvas();
            }
          };
        }
      };
    }
  ]);


  module.directive('uiGridCell', ['$compile','uiGridConstants', function ($compile,uiGridConstants) {
    var ngCell = {
      scope: false,
      compile: function() {
        return {
          pre: function($scope, iElement) {
            var html = $scope.col.cellTemplate.replace(uiGridConstants.COL_FIELD, 'row.entity.' + $scope.col.colDef.field);

//            if ($scope.col.enableCellEdit) {
//              html =  $scope.col.cellEditTemplate;
//              html = html.replace(DISPLAY_CELL_TEMPLATE, cellTemplate);
//              html = html.replace(EDITABLE_CELL_TEMPLATE, $scope.col.editableCellTemplate.replace(COL_FIELD, 'row.entity.' + $scope.col.field));
//            } else {
//              html = cellTemplate;
//            }

            var cellElement = $compile(html)($scope);

//            if ($scope.enableCellSelection && cellElement[0].className.indexOf('ngSelectionCell') === -1) {
//              cellElement[0].setAttribute('tabindex', 0);
//              cellElement.addClass('ngCellElement');
//            }

            iElement.append(cellElement);
          },
          post: function($scope, iElement) {
//            if ($scope.enableCellSelection) {
//              $scope.domAccessProvider.selectionHandlers($scope, iElement);
//            }
//
//            $scope.$on('ngGridEventDigestCell', function() {
//              domUtilityService.digest($scope);
//            });
          }
        };
      }
    };

    return ngCell;
  }]);

})();