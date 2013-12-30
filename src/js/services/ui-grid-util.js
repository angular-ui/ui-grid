(function() {

var app = angular.module('ui.grid.util', []);

function getStyles (elem) {
  return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
  var i = extra === ( isBorderBox ? 'border' : 'content' ) ?
          // If we already have the right measurement, avoid augmentation
          4 :
          // Otherwise initialize for horizontal or vertical properties
          name === 'width' ? 1 : 0,

          val = 0;

  angular.forEach(['Top', 'Right', 'Bottom', 'Left'], function (side) {
    // both box models exclude margin, so add it if we want it
    if ( extra === 'margin' ) {
      val += parseFloat(styles[extra + side]);
    }

    if ( isBorderBox ) {
      // border-box includes padding, so remove it if we want content
      if ( extra === 'content' ) {
        val -= parseFloat(styles['padding' + side]);
      }

      // at this point, extra isn't border nor margin, so remove border
      if ( extra !== 'margin' ) {
        val -= parseFloat(styles['border' + side + 'Width']);
      }
    }
    else {
      // at this point, extra isn't content, so add padding
      val += parseFloat(styles['padding' + side]);

      // at this point, extra isn't content nor padding, so add border
      if ( extra !== 'padding') {
        val += parseFloat(styles['border' + side + 'Width']);
      }
    }
  });

  return val;
}

function getWidthOrHeight( elem, name, extra ) {
  // Start with offset property, which is equivalent to the border-box value
  var valueIsBorderBox = true,
          val = name === 'width' ? elem.offsetWidth : elem.offsetHeight,
          styles = getStyles(elem),
          isBorderBox = styles['boxSizing'] === 'border-box';

  // some non-html elements return undefined for offsetWidth, so check for null/undefined
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
  // if ( val <= 0 || val == null ) {
  //         // Fall back to computed then uncomputed css if necessary
  //         val = curCSS( elem, name, styles );
  //         if ( val < 0 || val == null ) {
  //                 val = elem.style[ name ];
  //         }

  //         // Computed unit is not pixels. Stop here and return.
  //         if ( rnumnonpx.test(val) ) {
  //                 return val;
  //         }

  //         // we need the check for style in case a browser which returns unreliable values
  //         // for getComputedStyle silently falls back to the reliable elem.style
  //         valueIsBorderBox = isBorderBox &&
  //                 ( support.boxSizingReliable() || val === elem.style[ name ] );

  //         // Normalize "", auto, and prepare for extra
  //         val = parseFloat( val ) || 0;
  // }

  // use the active box-sizing model to add/subtract irrelevant styles
  return ( val +
          augmentWidthOrHeight(
                  elem,
                  name,
                  extra || ( isBorderBox ? "border" : "content" ),
                  valueIsBorderBox,
                  styles
          )
  );
}

/**
 *  @ngdoc service
 *  @name ui.grid.util.service:GridUtil
 *  
 *  @description Grid utility functions
 */
app.service('GridUtil', ['$window', function ($window) {
  var s = {

    /**
     * @ngdoc method
     * @name readableColumnName
     * @methodOf ui.grid.util.service:GridUtil
     *
     * @param {string} columnName Column name as a string
     * @returns {string} Column name appropriately capitalized and split apart
     *
       @example
       <example module="app">
        <file name="app.js">
          var app = angular.module('app', ['ui.grid.util']);

          app.controller('MainCtrl', ['$scope', 'GridUtil', function ($scope, GridUtil) {
            $scope.name = 'firstName';
            $scope.columnName = function(name) {
              return GridUtil.readableColumnName(name);
            };
          }]);
        </file>
        <file name="index.html">
          <div ng-controller="MainCtrl">
            <strong>Column name:</strong> <input ng-model="name" />
            <br>
            <strong>Output:</strong> <span ng-bind="columnName(name)"></span>
          </div>
        </file>
      </example>
     */
    readableColumnName: function (columnName) {
      // Convert underscores to spaces
      if (typeof(columnName) === 'undefined' || columnName === undefined || columnName === null) { return columnName; }

      if (typeof(columnName) !== 'string') {
        columnName = String(columnName);
      }

      return columnName.replace(/_+/g, ' ')
        // Replace a completely all-capsed word with a first-letter-capitalized version
        .replace(/^[A-Z]+$/, function (match) {
          return angular.lowercase(angular.uppercase(match.charAt(0)) + match.slice(1));
        })
        // Capitalize the first letter of words
        .replace(/(\w+)/g, function (match) {
          return angular.uppercase(match.charAt(0)) + match.slice(1);
        })
        // Put a space in between words that have partial capilizations (i.e. 'firstName' becomes 'First Name')
        // .replace(/([A-Z]|[A-Z]\w+)([A-Z])/g, "$1 $2");
        // .replace(/(\w+?|\w)([A-Z])/g, "$1 $2");
        .replace(/(\w+?(?=[A-Z]))/g, '$1 ');
    },

    /**
     * @ngdoc method
     * @name getColumnsFromData
     * @methodOf ui.grid.util.service:GridUtil
     * @description Return a list of column names, given a data set
     *
     * @param {string} data Data array for grid
     * @returns {Object} Column definitions with field accessor and column name
     *
     * @example
       <pre>
         var data = [
           { firstName: 'Bob', lastName: 'Jones' },
           { firstName: 'Frank', lastName: 'Smith' }
         ];

         var columnDefs = GridUtil.getColumnsFromData(data);

         columnDefs == [
          {
            field: 'firstName',
            name: 'First Name'
          },
          {
            field: 'lastName',
            name: 'Last Name'
          }
         ];
       </pre>
     */
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
    },

    /**
     * @ngdoc method
     * @name newId
     * @methodOf ui.grid.util.service:GridUtil
     * @description Return a unique ID string
     *
     * @returns {string} Unique string
     *
     * @example
       <pre>
        var id = GridUtil.newId();

        # 1387305700482;
       </pre>
     */
    newId: (function() {
      var seedId = new Date().getTime();
      return function() {
          return seedId += 1;
      };
    })(),

    /**
    * @ngdoc method
    * @name elementWidth
    * @methodOf ui.grid.util.service:GridUtil
    *
    * @param {element} DOM element
    *
    * @returns {number} Element width in pixels, accounting for any borders, etc.
    */
    elementWidth: function (elem) {
      
    },

    /**
    * @ngdoc method
    * @name elementHeight
    * @methodOf ui.grid.util.service:GridUtil
    *
    * @param {element} DOM element
    *
    * @returns {number} Element height in pixels, accounting for any borders, etc.
    */
    elementHeight: function (elem) {
      
    }
  };

  angular.forEach(['width', 'height'], function(name){
    var capsName = angular.uppercase(name.charAt(0)) + name.substr(1);
    s['element' + capsName] = function (elem, extra) {
      var e = elem;
      if (typeof(e.length) !== 'undefined' && e.length) {
        e = elem[0];
      }
      
      return getWidthOrHeight( e, name, extra );
    };
  });

  return s;
}]);

})();