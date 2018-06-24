(function() {
  'use strict';
  /**
   * @ngdoc object
   * @name ui.grid.class:GridRowColumn
   * @param {GridRow} row The row for this pair
   * @param {GridColumn} column The column for this pair
   * @description A row and column pair that represents the intersection of these two entities.
   * Must be instantiated as a constructor using the `new` keyword.
   */
  angular.module('ui.grid')
  .factory('GridRowColumn', ['$parse', '$filter',
    function GridRowColumnFactory($parse, $filter) {
      var GridRowColumn = function GridRowColumn(row, col) {
        if ( !(this instanceof GridRowColumn)) {
          throw "Using GridRowColumn as a function insead of as a constructor. Must be called with `new` keyword";
        }

        /**
         * @ngdoc object
         * @name row
         * @propertyOf ui.grid.class:GridRowColumn
         * @description {@link ui.grid.class:GridRow }
         */
        this.row = row;
        /**
         * @ngdoc object
         * @name col
         * @propertyOf ui.grid.class:GridRowColumn
         * @description {@link ui.grid.class:GridColumn }
         */
        this.col = col;
      };

      /**
       * @ngdoc function
       * @name getIntersectionValueRaw
       * @methodOf ui.grid.class:GridRowColumn
       * @description Gets the intersection of where the row and column meet.
       * @returns {String|Number|Object} The value from the grid data that this GridRowColumn points too.
       *          If the column has a cellFilter this will NOT return the filtered value.
       */
      GridRowColumn.prototype.getIntersectionValueRaw = function() {
        var getter = $parse(this.row.getEntityQualifiedColField(this.col));
        var context = this.row;
        return getter(context);
      };
      return GridRowColumn;
    }
  ]);
})();
