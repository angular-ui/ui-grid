(function(){

angular.module('ui.grid')
.factory('GridRow', ['gridUtil', function(gridUtil) {

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

    // Default to true
    this.visible = true;

    this.isSelected = false;
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

  return GridRow;
}]);

})();