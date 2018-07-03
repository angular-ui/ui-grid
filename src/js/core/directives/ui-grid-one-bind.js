(function() {
  'use strict';
  /**
   * @ngdoc overview
   * @name ui.grid.directive:uiGridOneBind
   * @summary A group of directives that provide a one time bind to a dom element.
   * @description A group of directives that provide a one time bind to a dom element.
   * As one time bindings are not supported in Angular 1.2.* this directive provdes this capability.
   * This is done to reduce the number of watchers on the dom.
   * <br/>
   * <h2>Short Example ({@link ui.grid.directive:uiGridOneBindSrc ui-grid-one-bind-src})</h2>
   * <pre>
        <div ng-init="imageName = 'myImageDir.jpg'">
          <img ui-grid-one-bind-src="imageName"></img>
        </div>
     </pre>
   * Will become:
   * <pre>
       <div ng-init="imageName = 'myImageDir.jpg'">
         <img ui-grid-one-bind-src="imageName" src="myImageDir.jpg"></img>
       </div>
     </pre>
     </br>
     <h2>Short Example ({@link ui.grid.directive:uiGridOneBindText ui-grid-one-bind-text})</h2>
   * <pre>
        <div ng-init="text='Add this text'" ui-grid-one-bind-text="text"></div>
     </pre>
   * Will become:
   * <pre>
   <div ng-init="text='Add this text'" ui-grid-one-bind-text="text">Add this text</div>
     </pre>
     </br>
   * <b>Note:</b> This behavior is slightly different for the {@link ui.grid.directive:uiGridOneBindIdGrid uiGridOneBindIdGrid}
   * and {@link ui.grid.directive:uiGridOneBindAriaLabelledbyGrid uiGridOneBindAriaLabelledbyGrid} directives.
   *
   */
  // https://github.com/joshkurz/Black-Belt-AngularJS-Directives/blob/master/directives/Optimization/oneBind.js
  var oneBinders = angular.module('ui.grid');
  angular.forEach([
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindSrc
       * @memberof ui.grid.directive:uiGridOneBind
       * @element img
       * @restrict A
       * @param {String} uiGridOneBindSrc The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the src dom tag.
       *
       */
      {tag: 'Src', method: 'attr'},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindText
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindText The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the text dom tag.
       */
      {tag: 'Text', method: 'text'},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindHref
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindHref The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the href dom tag. For more information see {@link ui.grid.directive:uiGridOneBind}.
       */
      {tag: 'Href', method: 'attr'},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindClass
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindClass The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @param {Object} uiGridOneBindClass The object that you want to bind. At least one of the values in the object must be something other than null or undefined for the watcher to be removed.
       *                                    this is to prevent the watcher from being removed before the scope is initialized.
       * @param {Array} uiGridOneBindClass An array of classes to bind to this element.
       * @description One time binding for the class dom tag. For more information see {@link ui.grid.directive:uiGridOneBind}.
       */
      {tag: 'Class', method: 'addClass'},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindHtml
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindHtml The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the html method on a dom element. For more information see {@link ui.grid.directive:uiGridOneBind}.
       */
      {tag: 'Html', method: 'html'},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindAlt
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindAlt The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the alt dom tag. For more information see {@link ui.grid.directive:uiGridOneBind}.
       */
      {tag: 'Alt', method: 'attr'},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindStyle
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindStyle The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the style dom tag. For more information see {@link ui.grid.directive:uiGridOneBind}.
       */
      {tag: 'Style', method: 'css'},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindValue
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindValue The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the value dom tag. For more information see {@link ui.grid.directive:uiGridOneBind}.
       */
      {tag: 'Value', method: 'attr'},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindId
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindId The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the value dom tag. For more information see {@link ui.grid.directive:uiGridOneBind}.
       */
      {tag: 'Id', method: 'attr'},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindIdGrid
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindIdGrid The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the id dom tag.
       * <h1>Important Note!</h1>
       * If the id tag passed as a parameter does <b>not</b> contain the grid id as a substring
       * then the directive will search the scope and the parent controller (if it is a uiGridController) for the grid.id value.
       * If this value is found then it is appended to the begining of the id tag. If the grid is not found then the directive throws an error.
       * This is done in order to ensure uniqueness of id tags across the grid.
       * This is to prevent two grids in the same document having duplicate id tags.
       */
      {tag: 'Id', directiveName: 'IdGrid', method: 'attr', appendGridId: true},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindTitle
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindTitle The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the title dom tag. For more information see {@link ui.grid.directive:uiGridOneBind}.
       */
      {tag: 'Title', method: 'attr'},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindAriaLabel
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindAriaLabel The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the aria-label dom tag. For more information see {@link ui.grid.directive:uiGridOneBind}.
       *<br/>
       * <pre>
            <div ng-init="text='Add this text'" ui-grid-one-bind-aria-label="text"></div>
         </pre>
       * Will become:
       * <pre>
            <div ng-init="text='Add this text'" ui-grid-one-bind-aria-label="text" aria-label="Add this text"></div>
         </pre>
       */
      {tag: 'Label', method: 'attr', aria: true},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindAriaLabelledby
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindAriaLabelledby The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the aria-labelledby dom tag. For more information see {@link ui.grid.directive:uiGridOneBind}.
       *<br/>
       * <pre>
            <div ng-init="anId = 'gridID32'" ui-grid-one-bind-aria-labelledby="anId"></div>
         </pre>
       * Will become:
       * <pre>
            <div ng-init="anId = 'gridID32'" ui-grid-one-bind-aria-labelledby="anId" aria-labelledby="gridID32"></div>
         </pre>
       */
      {tag: 'Labelledby', method: 'attr', aria: true},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindAriaLabelledbyGrid
       * @element div
       * @restrict A
       * @param {String} uiGridOneBindAriaLabelledbyGrid The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the aria-labelledby dom tag. For more information see {@link ui.grid.directive:uiGridOneBind}.
       * Works somewhat like {@link ui.grid.directive:uiGridOneBindIdGrid} however this one supports a list of ids (seperated by a space) and will dynamically add the
       * grid id to each one.
       *<br/>
       * <pre>
            <div ng-init="anId = 'gridID32'" ui-grid-one-bind-aria-labelledby-grid="anId"></div>
         </pre>
       * Will become ([grid.id] will be replaced by the actual grid id):
       * <pre>
            <div ng-init="anId = 'gridID32'" ui-grid-one-bind-aria-labelledby-grid="anId" aria-labelledby-Grid="[grid.id]-gridID32"></div>
         </pre>
       */
      {tag: 'Labelledby', directiveName: 'LabelledbyGrid', appendGridId: true, method: 'attr', aria: true},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindAriaDescribedby
       * @element ANY
       * @restrict A
       * @param {String} uiGridOneBindAriaDescribedby The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the aria-describedby dom tag. For more information see {@link ui.grid.directive:uiGridOneBind}.
       *<br/>
       * <pre>
            <div ng-init="anId = 'gridID32'" ui-grid-one-bind-aria-describedby="anId"></div>
         </pre>
       * Will become:
       * <pre>
            <div ng-init="anId = 'gridID32'" ui-grid-one-bind-aria-describedby="anId" aria-describedby="gridID32"></div>
         </pre>
       */
      {tag: 'Describedby', method: 'attr', aria: true},
      /**
       * @ngdoc directive
       * @name ui.grid.directive:uiGridOneBindAriaDescribedbyGrid
       * @element ANY
       * @restrict A
       * @param {String} uiGridOneBindAriaDescribedbyGrid The angular string you want to bind. Does not support interpolation. Don't use <code>{{scopeElt}}</code> instead use <code>scopeElt</code>.
       * @description One time binding for the aria-labelledby dom tag. For more information see {@link ui.grid.directive:uiGridOneBind}.
       * Works somewhat like {@link ui.grid.directive:uiGridOneBindIdGrid} however this one supports a list of ids (seperated by a space) and will dynamically add the
       * grid id to each one.
       *<br/>
       * <pre>
            <div ng-init="anId = 'gridID32'" ui-grid-one-bind-aria-describedby-grid="anId"></div>
         </pre>
       * Will become ([grid.id] will be replaced by the actual grid id):
       * <pre>
            <div ng-init="anId = 'gridID32'" ui-grid-one-bind-aria-describedby-grid="anId" aria-describedby="[grid.id]-gridID32"></div>
         </pre>
       */
      {tag: 'Describedby', directiveName: 'DescribedbyGrid', appendGridId: true, method: 'attr', aria: true}],
    function(v) {

      var baseDirectiveName = 'uiGridOneBind';
      // If it is an aria tag then append the aria label seperately
      // This is done because the aria tags are formatted aria-* and the directive name can't have a '-' character in it.
      // If the diretiveName has to be overridden then it does so here. This is because the tag being modified and the directive sometimes don't
      // match up.
      var directiveName = (v.aria ? baseDirectiveName + 'Aria' : baseDirectiveName) + (v.directiveName ? v.directiveName : v.tag);
      oneBinders.directive(directiveName, ['gridUtil', function(gridUtil) {
        return {
          restrict: 'A',
          require: ['?uiGrid','?^uiGrid'],
          link: function(scope, iElement, iAttrs, controllers) {
            /* Appends the grid id to the beginning of the value. */
            var appendGridId = function(val) {
              var grid; // Get an instance of the grid if its available

              // If its available in the scope then we don't need to try to find it elsewhere
              if (scope.grid) {
                grid = scope.grid;
              }

              // Another possible location to try to find the grid
              else if (scope.col && scope.col.grid) {
                grid = scope.col.grid;
              }

              // Last ditch effort: Search through the provided controllers.
              else if (!controllers.some( // Go through the controllers till one has the element we need
                function(controller) {
                  if (controller && controller.grid) {
                    grid = controller.grid;
                    return true; // We've found the grid
                  }
              })) {
                // We tried our best to find it for you
                gridUtil.logError("["+directiveName+"] A valid grid could not be found to bind id. Are you using this directive " +
                                 "within the correct scope? Trying to generate id: [gridID]-" + val);
                throw new Error("No valid grid could be found");
              }

              if (grid) {
                var idRegex = new RegExp(grid.id.toString());

                // If the grid id hasn't been appended already in the template declaration
                if (!idRegex.test(val)) {
                  val = grid.id.toString() + '-' + val;
                }
              }
              return val;
            };

            // The watch returns a function to remove itself.
            var rmWatcher = scope.$watch(iAttrs[directiveName], function(newV) {
              if (newV) {
                // If we are trying to add an id element then we also apply the grid id if it isn't already there
                if (v.appendGridId) {
                  var newIdString = null;

                  // Append the id to all of the new ids.
                  angular.forEach( newV.split(' '), function(s) {
                    newIdString = (newIdString ? (newIdString + ' ') : '') +  appendGridId(s);
                  });
                  newV = newIdString;
                }

                // Append this newValue to the dom element.
                switch (v.method) {
                  case 'attr': // The attr method takes two paraams the tag and the value
                    if (v.aria) {
                      // If it is an aria element then append the aria prefix
                      iElement[v.method]('aria-' + v.tag.toLowerCase(),newV);
                    } else {
                      iElement[v.method](v.tag.toLowerCase(),newV);
                    }
                    break;
                  case 'addClass':
                    // Pulled from https://github.com/Pasvaz/bindonce/blob/master/bindonce.js
                    if (angular.isObject(newV) && !angular.isArray(newV)) {
                      var results = [],
                        nonNullFound = false; // We don't want to remove the binding unless the key is actually defined

                      angular.forEach(newV, function (value, index) {
                        if (value !== null && typeof(value) !== "undefined") {
                          nonNullFound = true; // A non null value for a key was found so the object must have been initialized
                          if (value) {results.push(index);}
                        }
                      });
                      // A non null value for a key wasn't found so assume that the scope values haven't been fully initialized
                      if (!nonNullFound) {
                        return; // If not initialized then the watcher should not be removed yet.
                      }
                      newV = results;
                    }

                    if (newV) {
                      iElement.addClass(angular.isArray(newV) ? newV.join(' ') : newV);
                    } else {
                      return;
                    }
                    break;
                  default:
                    iElement[v.method](newV);
                    break;
                }

                // Removes the watcher on itself after the bind
                rmWatcher();
              }
            // True ensures that equality is determined using angular.equals instead of ===
            }, true); // End rm watchers
          } // End compile function
        }; // End directive return
      } // End directive function
    ]); // End directive
  }); // End angular foreach
})();
