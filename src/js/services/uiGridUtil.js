(function() {

var app = angular.module('ui.grid.util', []);

app.service('GridUtil', function () {

  var s = {
    // Given a column name, return a readable version of it
    readableColumnName: function (columnName) {
      // Convert underscores to spaces
      return columnName.replace(/_/g, ' ')
        // Replace a completely all-capsed word with a first-letter-capitalized version
        .replace(/^[A-Z]+$/, function (match) {
          return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
        })
        // Capitalize the first letter of words
        .replace(/(\w+)/g, function (match) {
          return match.charAt(0).toUpperCase() + match.slice(1);
        })
        // Put a space in between words that have partial capilizations (i.e. 'firstName' becomes 'First Name')
        .replace(/([A-Z]|[A-Z]\w+)([A-Z])/g, "$1 $2");
    },

    // Return a list of column names, given a data set
    getColumnsFromData: function (data) {
      var columnDefs = [];

      var item = data[0];
      
      angular.forEach(item, function (prop, propName) {
        columnDefs.push({
          field: propName,
          name: s.readableColumnName(propName)
        });
      });

      return columnDefs;
    }
  };

  return s;
});

})();