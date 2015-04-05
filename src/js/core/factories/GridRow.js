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


    this.$$height = grid.options.rowHeight;

  }

    /**
     *  @ngdoc object
     *  @name height
     *  @propertyOf  ui.grid.class:GridRow
     *  @description height of each individual row. changing the height will flag all
     *  row renderContainers to recalculate their canvas height
     */
    Object.defineProperty(GridRow.prototype, 'height', {
      get: function() {
        return this.$$height;
      },
      set: function(height) {
        if (height !== this.$$height) {
          this.grid.updateCanvasHeight();
          this.$$height = height;
        }
      }
    });

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
   * be invisible. Emits the rowsVisibleChanged event if it changed the row visibility.
   * 
   * This method can be called from the api, passing in the gridRow we want
   * altered.  It should really work by calling gridRow.setRowInvisible, but that's
   * not the way I coded it, and too late to change now.  Changed to just call
   * the internal function row.setThisRowInvisible().
   * 
   * @param {GridRow} row the row we want to set to invisible
   * 
   */
  GridRow.prototype.setRowInvisible = function ( row ) {
    if (row && row.setThisRowInvisible){
      row.setThisRowInvisible( 'user' );
    }
  };
  
  
  /**
   * @ngdoc function
   * @name clearRowInvisible
   * @methodOf  ui.grid.class:GridRow
   * @description Clears an override on the row that forces it to always
   * be invisible. Emits the rowsVisibleChanged event if it changed the row visibility.
   * 
   * This method can be called from the api, passing in the gridRow we want
   * altered.  It should really work by calling gridRow.clearRowInvisible, but that's
   * not the way I coded it, and too late to change now.  Changed to just call
   * the internal function row.clearThisRowInvisible().
   * 
   * @param {GridRow} row the row we want to clear the invisible flag
   * 
   */
  GridRow.prototype.clearRowInvisible = function ( row ) {
    if (row && row.clearThisRowInvisible){
      row.clearThisRowInvisible( 'user' );
    }
  };
  
  
  /**
   * @ngdoc function
   * @name setThisRowInvisible
   * @methodOf  ui.grid.class:GridRow
   * @description Sets an override on the row that forces it to always
   * be invisible. Emits the rowsVisibleChanged event if it changed the row visibility
   *
   * @param {string} reason the reason (usually the module) for the row to be invisible.
   * E.g. grouping, user, filter
   * @param {boolean} fromRowsProcessor whether we were called from a rowsProcessor, passed through to evaluateRowVisibility
   */
  GridRow.prototype.setThisRowInvisible = function ( reason, fromRowsProcessor ) {
    if ( !this.invisibleReason ){
      this.invisibleReason = {};
    }
    this.invisibleReason[reason] = true;
    this.evaluateRowVisibility( fromRowsProcessor);
  };


  /**
   * @ngdoc function
   * @name clearRowInvisible
   * @methodOf ui.grid.class:GridRow
   * @description Clears any override on the row visibility, returning it 
   * to normal visibility calculations.  Emits the rowsVisibleChanged
   * event
   * 
   * @param {string} reason the reason (usually the module) for the row to be invisible.
   * E.g. grouping, user, filter
   * @param {boolean} fromRowsProcessor whether we were called from a rowsProcessor, passed through to evaluateRowVisibility
   */
  GridRow.prototype.clearThisRowInvisible = function ( reason, fromRowsProcessor ) {
    if (typeof(this.invisibleReason) !== 'undefined' ) {
      delete this.invisibleReason.user;
    }
    this.evaluateRowVisibility( fromRowsProcessor );
  };


  /**
   * @ngdoc function
   * @name evaluateRowVisibility
   * @methodOf ui.grid.class:GridRow
   * @description Determines whether the row should be visible based on invisibleReason, 
   * and if it changes the row visibility, then emits the rowsVisibleChanged event.
   * 
   * Queues a grid refresh, but doesn't call it directly to avoid hitting lots of grid refreshes.
   * @param {boolean} fromRowProcessor if true, then it won't raise events or queue the refresh, the
   * row processor does that already
   */
  GridRow.prototype.evaluateRowVisibility = function ( fromRowProcessor ) {
    var newVisibility = true;
    if ( typeof(this.invisibleReason) !== 'undefined' ){
      angular.forEach(this.invisibleReason, function( value, key ){
        if ( value ){
          newVisibility = false;
        }
      });
    }
    
    if ( typeof(this.visible) === 'undefined' || this.visible !== newVisibility ){
      this.visible = newVisibility;
      if ( !fromRowProcessor ){
        this.grid.queueGridRefresh();
        this.grid.api.core.raise.rowsVisibleChanged(this);
      }
    }
  };
  

  return GridRow;
}]);

})();