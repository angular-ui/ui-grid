(function(){
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
    function GridRowColumnFactory($parse, $filter){
      var GridRowColumn = function GridRowColumn(row, col) {
        if ( !(this instanceof GridRowColumn)){
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
      GridRowColumn.prototype.getIntersectionValueRaw = function(){
        var getter = $parse(this.row.getEntityQualifiedColField(this.col));
        var context = this.row;
        return getter(context);
      };
      /**
       * @ngdoc function
       * @name getIntersectionValueFiltered
       * @methodOf ui.grid.class:GridRowColumn
       * @description Gets the intersection of where the row and column meet.
       * @returns {String|Number|Object} The value from the grid data that this GridRowColumn points too.
       *          If the column has a cellFilter this will also apply the filter to it and return the value that the filter displays.
       */
      GridRowColumn.prototype.getIntersectionValueFiltered = function(){
        var value = this.getIntersectionValueRaw();
        if (this.col.cellFilter && this.col.cellFilter !== ''){
          var getFilterIfExists = function(filterName){
            try {
              return $filter(filterName);
            } catch (e){
              return null;
            }
          };
          var filter = getFilterIfExists(this.col.cellFilter);
          if (filter) { // Check if this is filter name or a filter string
            value = filter(value);
          } else { // We have the template version of a filter so we need to parse it apart
            // Get the filter params out using a regex
            // Test out this regex here https://regex101.com/r/rC5eR5/2
            var re = /([^:]*):([^:]*):?([\s\S]+)?/;
            var matches;
            if ((matches = re.exec(this.col.cellFilter)) !== null) {
                // View your result using the matches-variable.
                // eg matches[0] etc.
                value = $filter(matches[1])(value, matches[2], matches[3]);
            }
          }
        }
        return value;
      };
      return GridRowColumn;
    }
  ]);
})();
