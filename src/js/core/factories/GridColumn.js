(function(){

angular.module('ui.grid')
.factory('GridColumn', ['gridUtil', function(gridUtil) {

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
          var percent = parseInt(percentStr, 10);
          if (isNaN(percent)) {
            throw new Error(parseErrorMsg);
          }
          self.width = colDef.width;
        }
        // And see if it's a number string
        else if (colDef.width.match(/^(\d+)$/)) {
          self.width = parseInt(colDef.width.match(/^(\d+)$/)[1], 10);
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

  return GridColumn;
}]);

})();