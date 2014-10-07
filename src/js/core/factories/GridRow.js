(function(){

angular.module('ui.grid')
.factory('GridRow', ['gridUtil', function(gridUtil) {

   /**
   * @ngdoc function
   * @name ui.grid.class:GridRow
   * @description GridRow is the viewModel for one logical row on the grid.  A grid Row is not necessarily a one-to-one
   * relation to gridOptions.data.
   * @param {object} entity the array item from GridOptions.data
   * @param {number} index the current position of the row in the array
   * @param {Grid} reference to the parent grid
   */
  function GridRow(entity, index, grid) {

     /**
      *  @ngdoc object
      *  @name grid
      *  @propertyOf  ui.grid.class:GridRow
      *  @description A reference back to the grid
      */
     this.grid = grid;

     /**
      *  @ngdoc object
      *  @name entity
      *  @propertyOf  ui.grid.class:GridRow
      *  @description A reference to an item in gridOptions.data[]
      */
    this.entity = entity;

     /**
      *  @ngdoc object
      *  @name uid
      *  @propertyOf  ui.grid.class:GridRow
      *  @description  UniqueId of row
      */
     this.uid = gridUtil.nextUid();

     /**
      *  @ngdoc object
      *  @name visible
      *  @propertyOf  ui.grid.class:GridRow
      *  @description If true, the row will be rendered
      */
    // Default to true
    this.visible = true;

  /**
    *  @ngdoc object
    *  @name height
    *  @propertyOf  ui.grid.class:GridRow
    *  @description height of each individual row
    */
    this.height = grid.options.rowHeight;
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
    return 'row.' + this.getEntityQualifiedColField(col);
  };

    /**
     * @ngdoc function
     * @name getEntityQualifiedColField
     * @methodOf ui.grid.class:GridRow
     * @description returns the qualified field name minus the row path
     * ie: entity.fieldA
     * @param {GridCol} col column instance
     * @returns {string} resulting name that can be evaluated against a row
     */
  GridRow.prototype.getEntityQualifiedColField = function(col) {
    return gridUtil.preEval('entity.' + col.field);
  };
  
  
  /**
   * @ngdoc function
   * @name setRowInvisible
   * @methodOf  ui.grid.class:GridRow
   * @description Sets an override on the row that forces it to always
   * be invisible, and if the row is currently visible then marks it
   * as invisible and refreshes the grid.  Emits the rowsVisibleChanged
   * event if it changed the row visibility
   * @param {GridRow} row row to force invisible, needs to be a GridRow,
   * which can be found from your data entity using grid.findRow
   */
  GridRow.prototype.setRowInvisible = function (row) {
    if (row !== null) {
      row.forceInvisible = true;
      
      if ( row.visible ){
        row.visible = false;
        row.grid.refresh();
        row.grid.api.core.raise.rowsVisibleChanged();
      }
    }        
  };

  /**
   * @ngdoc function
   * @name clearRowInvisible
   * @methodOf ui.grid.class:GridRow
   * @description Clears any override on the row visibility, returning it 
   * to normal visibility calculations.  If the row is currently invisible
   * then sets it to visible and calls refresh and emits the rowsVisibleChanged
   * event
   * TODO: if filter in action, then is this right?
   * @param {GridRow} row row clear force invisible, needs to be a GridRow,
   * which can be found from your data entity using grid.findRow
   */
  GridRow.prototype.clearRowInvisible = function (row) {
    if (row !== null) {
      row.forceInvisible = false;
      
      if ( !row.visible ){
        row.visible = true;
        row.grid.refresh();
        row.grid.api.core.raise.rowsVisibleChanged();
      }
    }        
  };

  /**
   * @ngdoc function
   * @name getVisibleRows
   * @methodOf ui.grid.class:GridRow
   * @description Returns all the visible rows
   * @param {Grid} grid the grid to return rows from
   * @returns {array} rows that are currently visible, returns the
   * GridRows rather than gridRow.entity
   * TODO: should this come from visible row cache instead?
   */
  GridRow.prototype.getVisibleRows = function ( grid ) {
    return grid.rows.filter(function (row) {
      return row.visible;
    });
  };  

  return GridRow;
}]);

})();