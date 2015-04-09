(function() {

var module = angular.module('ui.grid');

var bindPolyfill;
if (typeof Function.prototype.bind !== "function") {
  bindPolyfill = function() {
    var slice = Array.prototype.slice;
    return function(context) {
      var fn = this,
        args = slice.call(arguments, 1);
      if (args.length) {
        return function() {
          return arguments.length ? fn.apply(context, args.concat(slice.call(arguments))) : fn.apply(context, args);
        };
      }
      return function() {
        return arguments.length ? fn.apply(context, arguments) : fn.call(context);
      };
    };
  };
}

function getStyles (elem) {
  var e = elem;
  if (typeof(e.length) !== 'undefined' && e.length) {
    e = elem[0];
  }

  return e.ownerDocument.defaultView.getComputedStyle(e, null);
}

var rnumnonpx = new RegExp( "^(" + (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source + ")(?!px)[a-z%]+$", "i" ),
    // swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
    // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
    rdisplayswap = /^(block|none|table(?!-c[ea]).+)/,
    cssShow = { position: "absolute", visibility: "hidden", display: "block" };

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
  var i = extra === ( isBorderBox ? 'border' : 'content' ) ?
          // If we already have the right measurement, avoid augmentation
          4 :
          // Otherwise initialize for horizontal or vertical properties
          name === 'width' ? 1 : 0,

          val = 0;

  var sides = ['Top', 'Right', 'Bottom', 'Left'];
  
  for ( ; i < 4; i += 2 ) {
    var side = sides[i];
    // dump('side', side);

    // both box models exclude margin, so add it if we want it
    if ( extra === 'margin' ) {
      var marg = parseFloat(styles[extra + side]);
      if (!isNaN(marg)) {
        val += marg;
      }
    }
    // dump('val1', val);

    if ( isBorderBox ) {
      // border-box includes padding, so remove it if we want content
      if ( extra === 'content' ) {
        var padd = parseFloat(styles['padding' + side]);
        if (!isNaN(padd)) {
          val -= padd;
          // dump('val2', val);
        }
      }

      // at this point, extra isn't border nor margin, so remove border
      if ( extra !== 'margin' ) {
        var bordermarg = parseFloat(styles['border' + side + 'Width']);
        if (!isNaN(bordermarg)) {
          val -= bordermarg;
          // dump('val3', val);
        }
      }
    }
    else {
      // at this point, extra isn't content, so add padding
      var nocontentPad = parseFloat(styles['padding' + side]);
      if (!isNaN(nocontentPad)) {
        val += nocontentPad;
        // dump('val4', val);
      }

      // at this point, extra isn't content nor padding, so add border
      if ( extra !== 'padding') {
        var nocontentnopad = parseFloat(styles['border' + side + 'Width']);
        if (!isNaN(nocontentnopad)) {
          val += nocontentnopad;
          // dump('val5', val);
        }
      }
    }
  }

  // dump('augVal', val);

  return val;
}

function getWidthOrHeight( elem, name, extra ) {
  // Start with offset property, which is equivalent to the border-box value
  var valueIsBorderBox = true,
          val,
          styles = getStyles(elem),
          isBorderBox = styles['boxSizing'] === 'border-box';

  // some non-html elements return undefined for offsetWidth, so check for null/undefined
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
  if ( val <= 0 || val == null ) {
    // Fall back to computed then uncomputed css if necessary
    val = styles[name];
    if ( val < 0 || val == null ) {
      val = elem.style[ name ];
    }

    // Computed unit is not pixels. Stop here and return.
    if ( rnumnonpx.test(val) ) {
      return val;
    }

    // we need the check for style in case a browser which returns unreliable values
    // for getComputedStyle silently falls back to the reliable elem.style
    valueIsBorderBox = isBorderBox &&
            ( true || val === elem.style[ name ] ); // use 'true' instead of 'support.boxSizingReliable()'

    // Normalize "", auto, and prepare for extra
    val = parseFloat( val ) || 0;
  }

  // use the active box-sizing model to add/subtract irrelevant styles
  var ret = ( val +
    augmentWidthOrHeight(
      elem,
      name,
      extra || ( isBorderBox ? "border" : "content" ),
      valueIsBorderBox,
      styles
    )
  );

  // dump('ret', ret, val);
  return ret;
}

function getLineHeight(elm) {
  elm = angular.element(elm)[0];
  var parent = elm.offsetParent;

  if (!parent) {
    parent = document.getElementsByTagName('body')[0];
  }

  return parseInt( getStyles(parent).fontSize ) || parseInt( getStyles(elm).fontSize ) || 16;
}

var uid = ['0', '0', '0'];
var uidPrefix = 'uiGrid-';

/**
 *  @ngdoc service
 *  @name ui.grid.service:GridUtil
 *  
 *  @description Grid utility functions
 */
module.service('gridUtil', ['$log', '$window', '$document', '$http', '$templateCache', '$timeout', '$injector', '$q', '$interpolate', 'uiGridConstants',
  function ($log, $window, $document, $http, $templateCache, $timeout, $injector, $q, $interpolate, uiGridConstants) {
  var s = {

    getStyles: getStyles,

    /**
     * @ngdoc method
     * @name createBoundedWrapper
     * @methodOf ui.grid.service:GridUtil
     *
     * @param {object} Object to bind 'this' to
     * @param {method} Method to bind
     * @returns {Function} The wrapper that performs the binding
     *
     * @description
     * Binds given method to given object.
     *
     * By means of a wrapper, ensures that ``method`` is always bound to
     * ``object`` regardless of its calling environment.
     * Iow, inside ``method``, ``this`` always points to ``object``.
     *
     * See http://alistapart.com/article/getoutbindingsituations
     *
     */
    createBoundedWrapper: function(object, method) {
        return function() {
            return method.apply(object, arguments);
        };
    },


    /**
     * @ngdoc method
     * @name readableColumnName
     * @methodOf ui.grid.service:GridUtil
     *
     * @param {string} columnName Column name as a string
     * @returns {string} Column name appropriately capitalized and split apart
     *
       @example
       <example module="app">
        <file name="app.js">
          var app = angular.module('app', ['ui.grid']);

          app.controller('MainCtrl', ['$scope', 'gridUtil', function ($scope, gridUtil) {
            $scope.name = 'firstName';
            $scope.columnName = function(name) {
              return gridUtil.readableColumnName(name);
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
        .replace(/([\w\u00C0-\u017F]+)/g, function (match) {
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
     * @methodOf ui.grid.service:GridUtil
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

         var columnDefs = GridUtil.getColumnsFromData(data, excludeProperties);

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
    getColumnsFromData: function (data, excludeProperties) {
      var columnDefs = [];

      if (!data || typeof(data[0]) === 'undefined' || data[0] === undefined) { return []; }
      if (angular.isUndefined(excludeProperties)) { excludeProperties = []; }

      var item = data[0];
      
      angular.forEach(item,function (prop, propName) {
        if ( excludeProperties.indexOf(propName) === -1){
          columnDefs.push({
            name: propName
          });
        }
      });

      return columnDefs;
    },

    /**
     * @ngdoc method
     * @name newId
     * @methodOf ui.grid.service:GridUtil
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
     * @name getTemplate
     * @methodOf ui.grid.service:GridUtil
     * @description Get's template from cache / element / url
     *
     * @param {string|element|promise} Either a string representing the template id, a string representing the template url,
     *   an jQuery/Angualr element, or a promise that returns the template contents to use.
     * @returns {object} a promise resolving to template contents
     *
     * @example
     <pre>
     GridUtil.getTemplate(url).then(function (contents) {
          alert(contents);
        })
     </pre>
     */
    getTemplate: function (template) {
      // Try to fetch the template out of the templateCache
      if ($templateCache.get(template)) {
        return s.postProcessTemplate($templateCache.get(template));
      }

      // See if the template is itself a promise
      if (template.hasOwnProperty('then')) {
        return template.then(s.postProcessTemplate);
      }

      // If the template is an element, return the element
      try {
        if (angular.element(template).length > 0) {
          return $q.when(template).then(s.postProcessTemplate);
        }
      }
      catch (err){
        //do nothing; not valid html
      }

      s.logDebug('fetching url', template);

      // Default to trying to fetch the template as a url with $http
      return $http({ method: 'GET', url: template})
        .then(
          function (result) {
            var templateHtml = result.data.trim();
            //put in templateCache for next call
            $templateCache.put(template, templateHtml);
            return templateHtml;
          },
          function (err) {
            throw new Error("Could not get template " + template + ": " + err);
          }
        )
        .then(s.postProcessTemplate);
    },

    // 
    postProcessTemplate: function (template) {
      var startSym = $interpolate.startSymbol(),
          endSym = $interpolate.endSymbol();

      // If either of the interpolation symbols have been changed, we need to alter this template
      if (startSym !== '{{' || endSym !== '}}') {
        template = template.replace(/\{\{/g, startSym);
        template = template.replace(/\}\}/g, endSym);
      }

      return $q.when(template);
    },

    /**
     * @ngdoc method
     * @name guessType
     * @methodOf ui.grid.service:GridUtil
     * @description guesses the type of an argument
     *
     * @param {string/number/bool/object} item variable to examine
     * @returns {string} one of the following
     * 'string'
     * 'boolean'
     * 'number'
     * 'date'
     * 'object'
     */
    guessType : function (item) {
      var itemType = typeof(item);

      // Check for numbers and booleans
      switch (itemType) {
        case "number":
        case "boolean":
        case "string":
          return itemType;
        default:
          if (angular.isDate(item)) {
            return "date";
          }
          return "object";
      }
    },


  /**
    * @ngdoc method
    * @name elementWidth
    * @methodOf ui.grid.service:GridUtil
    *
    * @param {element} element DOM element
    * @param {string} [extra] Optional modifier for calculation. Use 'margin' to account for margins on element
    *
    * @returns {number} Element width in pixels, accounting for any borders, etc.
    */
    elementWidth: function (elem) {
      
    },

    /**
    * @ngdoc method
    * @name elementHeight
    * @methodOf ui.grid.service:GridUtil
    *
    * @param {element} element DOM element
    * @param {string} [extra] Optional modifier for calculation. Use 'margin' to account for margins on element
    *
    * @returns {number} Element height in pixels, accounting for any borders, etc.
    */
    elementHeight: function (elem) {
      
    },

    // Thanks to http://stackoverflow.com/a/13382873/888165
    getScrollbarWidth: function() {
        var outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

        document.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;
        // force scrollbars
        outer.style.overflow = "scroll";

        // add innerdiv
        var inner = document.createElement("div");
        inner.style.width = "100%";
        outer.appendChild(inner);        

        var widthWithScroll = inner.offsetWidth;

        // remove divs
        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    },

    swap: function( elem, options, callback, args ) {
      var ret, name,
              old = {};

      // Remember the old values, and insert the new ones
      for ( name in options ) {
        old[ name ] = elem.style[ name ];
        elem.style[ name ] = options[ name ];
      }

      ret = callback.apply( elem, args || [] );

      // Revert the old values
      for ( name in options ) {
        elem.style[ name ] = old[ name ];
      }

      return ret;
    },

    fakeElement: function( elem, options, callback, args ) {
      var ret, name,
          newElement = angular.element(elem).clone()[0];

      for ( name in options ) {
        newElement.style[ name ] = options[ name ];
      }

      angular.element(document.body).append(newElement);

      ret = callback.call( newElement, newElement );

      angular.element(newElement).remove();

      return ret;
    },

    /**
    * @ngdoc method
    * @name normalizeWheelEvent
    * @methodOf ui.grid.service:GridUtil
    *
    * @param {event} event A mouse wheel event
    *
    * @returns {event} A normalized event
    *
    * @description
    * Given an event from this list:
    *
    * `wheel, mousewheel, DomMouseScroll, MozMousePixelScroll`
    *
    * "normalize" it
    * so that it stays consistent no matter what browser it comes from (i.e. scale it correctly and make sure the direction is right.)
    */
    normalizeWheelEvent: function (event) {
      // var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'];
      // var toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
      var lowestDelta, lowestDeltaXY;
      
      var orgEvent   = event || window.event,
          args       = [].slice.call(arguments, 1),
          delta      = 0,
          deltaX     = 0,
          deltaY     = 0,
          absDelta   = 0,
          absDeltaXY = 0,
          fn;

      // event = $.event.fix(orgEvent);
      // event.type = 'mousewheel';

      // NOTE: jQuery masks the event and stores it in the event as originalEvent
      if (orgEvent.originalEvent) {
        orgEvent = orgEvent.originalEvent;
      }

      // Old school scrollwheel delta
      if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta; }
      if ( orgEvent.detail )     { delta = orgEvent.detail * -1; }

      // At a minimum, setup the deltaY to be delta
      deltaY = delta;

      // Firefox < 17 related to DOMMouseScroll event
      if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
          deltaY = 0;
          deltaX = delta * -1;
      }

      // New school wheel delta (wheel event)
      if ( orgEvent.deltaY ) {
          deltaY = orgEvent.deltaY * -1;
          delta  = deltaY;
      }
      if ( orgEvent.deltaX ) {
          deltaX = orgEvent.deltaX;
          delta  = deltaX * -1;
      }

      // Webkit
      if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY; }
      if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = orgEvent.wheelDeltaX; }

      // Look for lowest delta to normalize the delta values
      absDelta = Math.abs(delta);
      if ( !lowestDelta || absDelta < lowestDelta ) { lowestDelta = absDelta; }
      absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
      if ( !lowestDeltaXY || absDeltaXY < lowestDeltaXY ) { lowestDeltaXY = absDeltaXY; }

      // Get a whole value for the deltas
      fn     = delta > 0 ? 'floor' : 'ceil';
      delta  = Math[fn](delta  / lowestDelta);
      deltaX = Math[fn](deltaX / lowestDeltaXY);
      deltaY = Math[fn](deltaY / lowestDeltaXY);

      return {
        delta: delta,
        deltaX: deltaX,
        deltaY: deltaY
      };
    },

    // Stolen from Modernizr
    // TODO: make this, and everythign that flows from it, robust
    //http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
    isTouchEnabled: function() {
      var bool;

      if (('ontouchstart' in $window) || $window.DocumentTouch && $document instanceof DocumentTouch) {
        bool = true;
      }

      return bool;
    },

    isNullOrUndefined: function(obj) {
      if (obj === undefined || obj === null) {
        return true;
      }
      return false;
    },

    endsWith: function(str, suffix) {
      if (!str || !suffix || typeof str !== "string") {
        return false;
      }
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },

    arrayContainsObjectWithProperty: function(array, propertyName, propertyValue) {
        var found = false;
        angular.forEach(array, function (object) {
            if (object[propertyName] === propertyValue) {
                found = true;
            }
        });
        return found;
    },

    //// Shim requestAnimationFrame
    //requestAnimationFrame: $window.requestAnimationFrame && $window.requestAnimationFrame.bind($window) ||
    //                       $window.webkitRequestAnimationFrame && $window.webkitRequestAnimationFrame.bind($window) ||
    //                       function(fn) {
    //                         return $timeout(fn, 10, false);
    //                       },

    numericAndNullSort: function (a, b) {
      if (a === null) { return 1; }
      if (b === null) { return -1; }
      if (a === null && b === null) { return 0; }
      return a - b;
    },

    // Disable ngAnimate animations on an element
    disableAnimations: function (element) {
      var $animate;
      try {
        $animate = $injector.get('$animate');
        $animate.enabled(false, element);
      }
      catch (e) {}
    },

    enableAnimations: function (element) {
      var $animate;
      try {
        $animate = $injector.get('$animate');
        $animate.enabled(true, element);
        return $animate;
      }
      catch (e) {}
    },

    // Blatantly stolen from Angular as it isn't exposed (yet. 2.0 maybe?)
    nextUid: function nextUid() {
      var index = uid.length;
      var digit;

      while (index) {
        index--;
        digit = uid[index].charCodeAt(0);
        if (digit === 57 /*'9'*/) {
          uid[index] = 'A';
          return uidPrefix + uid.join('');
        }
        if (digit === 90  /*'Z'*/) {
          uid[index] = '0';
        } else {
          uid[index] = String.fromCharCode(digit + 1);
          return uidPrefix + uid.join('');
        }
      }
      uid.unshift('0');

      return uidPrefix + uid.join('');
    },

    // Blatantly stolen from Angular as it isn't exposed (yet. 2.0 maybe?)
    hashKey: function hashKey(obj) {
      var objType = typeof obj,
          key;

      if (objType === 'object' && obj !== null) {
        if (typeof (key = obj.$$hashKey) === 'function') {
          // must invoke on object to keep the right this
          key = obj.$$hashKey();
        }
        else if (typeof(obj.$$hashKey) !== 'undefined' && obj.$$hashKey) {
          key = obj.$$hashKey;
        }
        else if (key === undefined) {
          key = obj.$$hashKey = s.nextUid();
        }
      }
      else {
        key = obj;
      }

      return objType + ':' + key;
    },

    resetUids: function () {
      uid = ['0', '0', '0'];
    },
    
    /**
     * @ngdoc method
     * @methodOf ui.grid.service:GridUtil
     * @name logError
     * @description wraps the $log method, allowing us to choose different
     * treatment within ui-grid if we so desired.  At present we only log
     * error messages if uiGridConstants.LOG_ERROR_MESSAGES is set to true
     * @param {string} logMessage message to be logged to the console
     * 
     */
    logError: function( logMessage ){
      if ( uiGridConstants.LOG_ERROR_MESSAGES ){
        $log.error( logMessage );
      }
    },

    /**
     * @ngdoc method
     * @methodOf ui.grid.service:GridUtil
     * @name logWarn
     * @description wraps the $log method, allowing us to choose different
     * treatment within ui-grid if we so desired.  At present we only log
     * warning messages if uiGridConstants.LOG_WARN_MESSAGES is set to true
     * @param {string} logMessage message to be logged to the console
     * 
     */
    logWarn: function( logMessage ){
      if ( uiGridConstants.LOG_WARN_MESSAGES ){
        $log.warn( logMessage );
      }
    },

    /**
     * @ngdoc method
     * @methodOf ui.grid.service:GridUtil
     * @name logDebug
     * @description wraps the $log method, allowing us to choose different
     * treatment within ui-grid if we so desired.  At present we only log
     * debug messages if uiGridConstants.LOG_DEBUG_MESSAGES is set to true
     * 
     */
    logDebug: function() {
      if ( uiGridConstants.LOG_DEBUG_MESSAGES ){
        $log.debug.apply($log, arguments);
      }
    }

  };

  ['width', 'height'].forEach(function (name) {
    var capsName = angular.uppercase(name.charAt(0)) + name.substr(1);
    s['element' + capsName] = function (elem, extra) {
      var e = elem;
      if (e && typeof(e.length) !== 'undefined' && e.length) {
        e = elem[0];
      }

      if (e) {
        var styles = getStyles(e);
        return e.offsetWidth === 0 && rdisplayswap.test(styles.display) ?
                  s.fakeElement(e, cssShow, function(newElm) {
                    return getWidthOrHeight( newElm, name, extra );
                  }) :
                  getWidthOrHeight( e, name, extra );
      }
      else {
        return null;
      }
    };

    s['outerElement' + capsName] = function (elem, margin) {
      return elem ? s['element' + capsName].call(this, elem, margin ? 'margin' : 'border') : null;
    };
  });

  // http://stackoverflow.com/a/24107550/888165
  s.closestElm = function closestElm(el, selector) {
    if (typeof(el.length) !== 'undefined' && el.length) {
      el = el[0];
    }

    var matchesFn;

    // find vendor prefix
    ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) {
        if (typeof document.body[fn] === 'function') {
            matchesFn = fn;
            return true;
        }
        return false;
    });

    // traverse parents
    var parent;
    while (el !== null) {
      parent = el.parentElement;
      if (parent !== null && parent[matchesFn](selector)) {
          return parent;
      }
      el = parent;
    }

    return null;
  };

  s.type = function (obj) {
    var text = Function.prototype.toString.call(obj.constructor);
    return text.match(/function (.*?)\(/)[1];
  };

  s.getBorderSize = function getBorderSize(elem, borderType) {
    if (typeof(elem.length) !== 'undefined' && elem.length) {
      elem = elem[0];
    }

    var styles = getStyles(elem);

    // If a specific border is supplied, like 'top', read the 'borderTop' style property
    if (borderType) {
      borderType = 'border' + borderType.charAt(0).toUpperCase() + borderType.slice(1);
    }
    else {
      borderType = 'border';
    }

    borderType += 'Width';

    var val = parseInt(styles[borderType], 10);

    if (isNaN(val)) {
      return 0;
    }
    else {
      return val;
    }
  };

  // http://stackoverflow.com/a/22948274/888165
  // TODO: Opera? Mobile?
  s.detectBrowser = function detectBrowser() {
    var userAgent = $window.navigator.userAgent;

    var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer|trident\//i};

    for (var key in browsers) {
      if (browsers[key].test(userAgent)) {
        return key;
      }
    }

    return 'unknown';
  };

  // Borrowed from https://github.com/othree/jquery.rtl-scroll-type
  // Determine the scroll "type" this browser is using for RTL
  s.rtlScrollType = function rtlScrollType() {
    if (rtlScrollType.type) {
      return rtlScrollType.type;
    }

    var definer = angular.element('<div dir="rtl" style="font-size: 14px; width: 1px; height: 1px; position: absolute; top: -1000px; overflow: scroll">A</div>')[0],
        type = 'reverse';

    document.body.appendChild(definer);

    if (definer.scrollLeft > 0) {
      type = 'default';
    }
    else {
      definer.scrollLeft = 1;
      if (definer.scrollLeft === 0) {
        type = 'negative';
      }
    }

    definer.remove();
    rtlScrollType.type = type;

    return type;
  };

  /**
    * @ngdoc method
    * @name normalizeScrollLeft
    * @methodOf ui.grid.service:GridUtil
    *
    * @param {element} element The element to get the `scrollLeft` from.
    *
    * @returns {int} A normalized scrollLeft value for the current browser.
    *
    * @description
    * Browsers currently handle RTL in different ways, resulting in inconsistent scrollLeft values. This method normalizes them
    */
  s.normalizeScrollLeft = function normalizeScrollLeft(element) {
    if (typeof(element.length) !== 'undefined' && element.length) {
      element = element[0];
    }

    var scrollLeft = element.scrollLeft;
    
    var dir = s.getStyles(element).direction;

    if (dir === 'rtl') {
      switch (s.rtlScrollType()) {
        case 'default':
          return element.scrollWidth - scrollLeft - element.clientWidth;
        case 'negative':
          return Math.abs(scrollLeft);
        case 'reverse':
          return scrollLeft;
      }
    }

    return scrollLeft;
  };

  /**
  * @ngdoc method
  * @name normalizeScrollLeft
  * @methodOf ui.grid.service:GridUtil
  *
  * @param {element} element The element to normalize the `scrollLeft` value for
  * @param {int} scrollLeft The `scrollLeft` value to denormalize.
  *
  * @returns {int} A normalized scrollLeft value for the current browser.
  *
  * @description
  * Browsers currently handle RTL in different ways, resulting in inconsistent scrollLeft values. This method denormalizes a value for the current browser.
  */
  s.denormalizeScrollLeft = function denormalizeScrollLeft(element, scrollLeft) {
    if (typeof(element.length) !== 'undefined' && element.length) {
      element = element[0];
    }

    var dir = s.getStyles(element).direction;

    if (dir === 'rtl') {
      switch (s.rtlScrollType()) {
        case 'default':
          // Get the max scroll for the element
          var maxScrollLeft = element.scrollWidth - element.clientWidth;

          // Subtract the current scroll amount from the max scroll
          return maxScrollLeft - scrollLeft;
        case 'negative':
          return scrollLeft * -1;
        case 'reverse':
          return scrollLeft;
      }
    }

    return scrollLeft;
  };

    /**
     * @ngdoc method
     * @name preEval
     * @methodOf ui.grid.service:GridUtil
     *
     * @param {string} path Path to evaluate
     *
     * @returns {string} A path that is normalized.
     *
     * @description
     * Takes a field path and converts it to bracket notation to allow for special characters in path
     * @example
     * <pre>
     * gridUtil.preEval('property') == 'property'
     * gridUtil.preEval('nested.deep.prop-erty') = "nested['deep']['prop-erty']"
     * </pre>
     */
  s.preEval = function (path) {
    var m = uiGridConstants.BRACKET_REGEXP.exec(path);
    if (m) {
      return (m[1] ? s.preEval(m[1]) : m[1]) + m[2] + (m[3] ? s.preEval(m[3]) : m[3]);
    } else {
      path = path.replace(uiGridConstants.APOS_REGEXP, '\\\'');
      var parts = path.split(uiGridConstants.DOT_REGEXP);
      var preparsed = [parts.shift()];    // first item must be var notation, thus skip
      angular.forEach(parts, function (part) {
        preparsed.push(part.replace(uiGridConstants.FUNC_REGEXP, '\']$1'));
      });
      return preparsed.join('[\'');
    }
  };

  /**
   * @ngdoc method
   * @name debounce
   * @methodOf ui.grid.service:GridUtil
   *
   * @param {function} func function to debounce
   * @param {number} wait milliseconds to delay
   * @param {bool} immediate execute before delay
   *
   * @returns {function} A function that can be executed as debounced function
   *
   * @description
   * Copied from https://github.com/shahata/angular-debounce
   * Takes a function, decorates it to execute only 1 time after multiple calls, and returns the decorated function
   * @example
   * <pre>
   * var debouncedFunc =  gridUtil.debounce(function(){alert('debounced');}, 500);
   * debouncedFunc();
   * debouncedFunc();
   * debouncedFunc();
   * </pre>
   */
  s.debounce =  function (func, wait, immediate) {
    var timeout, args, context, result;
    function debounce() {
      /* jshint validthis:true */
      context = this;
      args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (timeout) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
      }
      return result;
    }
    debounce.cancel = function () {
      $timeout.cancel(timeout);
      timeout = null;
    };
    return debounce;
  };

  /**
   * @ngdoc method
   * @name throttle
   * @methodOf ui.grid.service:GridUtil
   *
   * @param {function} func function to throttle
   * @param {number} wait milliseconds to delay after first trigger
   * @param {Object} params to use in throttle.
   *
   * @returns {function} A function that can be executed as throttled function
   *
   * @description
   * Adapted from debounce function (above)
   * Potential keys for Params Object are:
   *    trailing (bool) - whether to trigger after throttle time ends if called multiple times
   * @example
   * <pre>
   * var throttledFunc =  gridUtil.throttle(function(){console.log('throttled');}, 500, {trailing: true});
   * throttledFunc(); //=> logs throttled
   * throttledFunc(); //=> queues attempt to log throttled for ~500ms (since trailing param is truthy)
   * throttledFunc(); //=> updates arguments to keep most-recent request, but does not do anything else.
   * </pre>
   */
  s.throttle = function(func, wait, options){
    options = options || {};
    var lastCall = 0, queued = null, context, args;

    function runFunc(endDate){
      lastCall = +new Date();
      func.apply(context, args);
      $timeout(function(){ queued = null; }, 0);
    }

    return function(){
      /* jshint validthis:true */
      context = this;
      args = arguments;
      if (queued === null){
        var sinceLast = +new Date() - lastCall;
        if (sinceLast > wait){
          runFunc();
        }
        else if (options.trailing){
          queued = $timeout(runFunc, wait - sinceLast);
        }
      }
    };
  };

  s.on = {};
  s.off = {};
  s._events = {};

  s.addOff = function (eventName) {
    s.off[eventName] = function (elm, fn) {
      var idx = s._events[eventName].indexOf(fn);
      if (idx > 0) {
        s._events[eventName].removeAt(idx);
      }
    };
  };

  var mouseWheeltoBind = ( 'onwheel' in document || document.documentMode >= 9 ) ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
      nullLowestDeltaTimeout,
      lowestDelta;

  s.on.mousewheel = function (elm, fn) {
    if (!elm || !fn) { return; }

    var $elm = angular.element(elm);

    // Store the line height and page height for this particular element
    $elm.data('mousewheel-line-height', getLineHeight($elm));
    $elm.data('mousewheel-page-height', s.elementHeight($elm));
    if (!$elm.data('mousewheel-callbacks')) { $elm.data('mousewheel-callbacks', {}); }

    var cbs = $elm.data('mousewheel-callbacks');
    cbs[fn] = (Function.prototype.bind || bindPolyfill).call(mousewheelHandler, $elm[0], fn);

    // Bind all the mousew heel events
    for ( var i = mouseWheeltoBind.length; i; ) {
      $elm.on(mouseWheeltoBind[--i], cbs[fn]);
    }
  };
  s.off.mousewheel = function (elm, fn) {
    var $elm = angular.element(this);

    var cbs = $elm.data('mousewheel-callbacks');
    var handler = cbs[fn];

    if (handler) {
      for ( var i = mouseWheeltoBind.length; i; ) {
        $elm.off(mouseWheeltoBind[--i], handler);
      }
    }

    delete cbs[fn];

    if (Object.keys(cbs).length === 0) {
      $elm.removeData('mousewheel-line-height');
      $elm.removeData('mousewheel-page-height');
      $elm.removeData('mousewheel-callbacks');
    }
  };

  function mousewheelHandler(fn, event) {
    var $elm = angular.element(this);

    var delta      = 0,
        deltaX     = 0,
        deltaY     = 0,
        absDelta   = 0,
        offsetX    = 0,
        offsetY    = 0;

    // jQuery masks events
    if (event.originalEvent) { event = event.originalEvent; }

    if ( 'detail'      in event ) { deltaY = event.detail * -1;      }
    if ( 'wheelDelta'  in event ) { deltaY = event.wheelDelta;       }
    if ( 'wheelDeltaY' in event ) { deltaY = event.wheelDeltaY;      }
    if ( 'wheelDeltaX' in event ) { deltaX = event.wheelDeltaX * -1; }

    // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
    if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
      deltaX = deltaY * -1;
      deltaY = 0;
    }

    // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
    delta = deltaY === 0 ? deltaX : deltaY;

    // New school wheel delta (wheel event)
    if ( 'deltaY' in event ) {
      deltaY = event.deltaY * -1;
      delta  = deltaY;
    }
    if ( 'deltaX' in event ) {
      deltaX = event.deltaX;
      if ( deltaY === 0 ) { delta  = deltaX * -1; }
    }

    // No change actually happened, no reason to go any further
    if ( deltaY === 0 && deltaX === 0 ) { return; }

    // Need to convert lines and pages to pixels if we aren't already in pixels
    // There are three delta modes:
    //   * deltaMode 0 is by pixels, nothing to do
    //   * deltaMode 1 is by lines
    //   * deltaMode 2 is by pages
    if ( event.deltaMode === 1 ) {
        var lineHeight = $elm.data('mousewheel-line-height');
        delta  *= lineHeight;
        deltaY *= lineHeight;
        deltaX *= lineHeight;
    }
    else if ( event.deltaMode === 2 ) {
        var pageHeight = $elm.data('mousewheel-page-height');
        delta  *= pageHeight;
        deltaY *= pageHeight;
        deltaX *= pageHeight;
    }

    // Store lowest absolute delta to normalize the delta values
    absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

    if ( !lowestDelta || absDelta < lowestDelta ) {
      lowestDelta = absDelta;

      // Adjust older deltas if necessary
      if ( shouldAdjustOldDeltas(event, absDelta) ) {
        lowestDelta /= 40;
      }
    }

    // Get a whole, normalized value for the deltas
    delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
    deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
    deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

    event.deltaMode = 0;

    // Normalise offsetX and offsetY properties
    // if ($elm[0].getBoundingClientRect ) {
    //   var boundingRect = $(elm)[0].getBoundingClientRect();
    //   offsetX = event.clientX - boundingRect.left;
    //   offsetY = event.clientY - boundingRect.top;
    // }
    
    // event.deltaX = deltaX;
    // event.deltaY = deltaY;
    // event.deltaFactor = lowestDelta;

    var newEvent = {
      originalEvent: event,
      deltaX: deltaX,
      deltaY: deltaY,
      deltaFactor: lowestDelta,
      preventDefault: function () { event.preventDefault(); }
    };

    // Clearout lowestDelta after sometime to better
    // handle multiple device types that give
    // a different lowestDelta
    // Ex: trackpad = 3 and mouse wheel = 120
    if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
    nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

    fn.call($elm[0], newEvent);
  }

  function nullLowestDelta() {
    lowestDelta = null;
  }

  function shouldAdjustOldDeltas(orgEvent, absDelta) {
    // If this is an older event and the delta is divisable by 120,
    // then we are assuming that the browser is treating this as an
    // older mouse wheel event and that we should divide the deltas
    // by 40 to try and get a more usable deltaFactor.
    // Side note, this actually impacts the reported scroll distance
    // in older browsers and can cause scrolling to be slower than native.
    // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
    return orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
  }

  return s;
}]);

// Add 'px' to the end of a number string if it doesn't have it already
module.filter('px', function() {
  return function(str) {
    if (str.match(/^[\d\.]+$/)) {
      return str + 'px';
    }
    else {
      return str;
    }
  };
});

})();
