(function () {

  angular.module('ui.grid')
    .factory('GridApi', ['$q', '$rootScope', 'gridUtil', 'uiGridConstants', 'GridRow', 'uiGridGridMenuService',
      function ($q, $rootScope, gridUtil, uiGridConstants, GridRow, uiGridGridMenuService) {
        /**
         * @ngdoc function
         * @name ui.grid.class:GridApi
         * @description GridApi provides the ability to register public methods events inside the grid and allow
         * for other components to use the api via featureName.raise.methodName and featureName.on.eventName(function(args){}.
         * <br/>
         * To listen to events, you must add a callback to gridOptions.onRegisterApi
         * <pre>
         *   $scope.gridOptions.onRegisterApi = function(gridApi){
         *      gridApi.cellNav.on.navigate($scope,function(newRowCol, oldRowCol){
         *          $log.log('navigation event');
         *      });
         *   };
         * </pre>
         * @param {object} grid grid that owns api
         */
        var GridApi = function GridApi(grid) {
          this.grid = grid;
          this.listeners = [];

          /**
           * @ngdoc function
           * @name renderingComplete
           * @methodOf  ui.grid.core.api:PublicApi
           * @description Rendering is complete, called at the same
           * time as `onRegisterApi`, but provides a way to obtain
           * that same event within features without stopping end
           * users from getting at the onRegisterApi method.
           *
           * Included in gridApi so that it's always there - otherwise
           * there is still a timing problem with when a feature can
           * call this.
           *
           * @param {GridApi} gridApi the grid api, as normally
           * returned in the onRegisterApi method
           *
           * @example
           * <pre>
           *      gridApi.core.on.renderingComplete( grid );
           * </pre>
           */
          this.registerEvent( 'core', 'renderingComplete' );

          /**
           * @ngdoc event
           * @name filterChanged
           * @eventOf  ui.grid.core.api:PublicApi
           * @description  is raised after the filter is changed.  The nature
           * of the watch expression doesn't allow notification of what changed,
           * so the receiver of this event will need to re-extract the filter
           * conditions from the columns.
           *
           */
          this.registerEvent( 'core', 'filterChanged' );

          /**
           * @ngdoc function
           * @name setRowInvisible
           * @methodOf  ui.grid.core.api:PublicApi
           * @description Sets an override on the row to make it always invisible,
           * which will override any filtering or other visibility calculations.
           * If the row is currently visible then sets it to invisible and calls
           * both grid refresh and emits the rowsVisibleChanged event
           * @param {GridRow} row the row we want to make invisible
           */
          this.registerMethod( 'core', 'setRowInvisible', GridRow.prototype.setRowInvisible );

          /**
           * @ngdoc function
           * @name clearRowInvisible
           * @methodOf  ui.grid.core.api:PublicApi
           * @description Clears any override on visibility for the row so that it returns to
           * using normal filtering and other visibility calculations.
           * If the row is currently invisible then sets it to visible and calls
           * both grid refresh and emits the rowsVisibleChanged event
           * TODO: if a filter is active then we can't just set it to visible?
           * @param {GridRow} row the row we want to make visible
           */
          this.registerMethod( 'core', 'clearRowInvisible', GridRow.prototype.clearRowInvisible );

          /**
           * @ngdoc function
           * @name getVisibleRows
           * @methodOf  ui.grid.core.api:PublicApi
           * @description Returns all visible rows
           * @param {Grid} grid the grid you want to get visible rows from
           * @returns {array} an array of gridRow
           */
          this.registerMethod( 'core', 'getVisibleRows', this.grid.getVisibleRows );

          /**
           * @ngdoc event
           * @name rowsVisibleChanged
           * @eventOf  ui.grid.core.api:PublicApi
           * @description  is raised after the rows that are visible
           * change.  The filtering is zero-based, so it isn't possible
           * to say which rows changed (unlike in the selection feature).
           * We can plausibly know which row was changed when setRowInvisible
           * is called, but in that situation the user already knows which row
           * they changed.  When a filter runs we don't know what changed,
           * and that is the one that would have been useful.
           *
           */
          this.registerEvent( 'core', 'rowsVisibleChanged' );

          /**
           * @ngdoc event
           * @name rowsRendered
           * @eventOf  ui.grid.core.api:PublicApi
           * @description  is raised after the cache of visible rows is changed.
           */
          this.registerEvent( 'core', 'rowsRendered' );


          /**
           * @ngdoc event
           * @name scrollBegin
           * @eventOf  ui.grid.core.api:PublicApi
           * @description  is raised when scroll begins.  Is throttled, so won't be raised too frequently
           */
          this.registerEvent( 'core', 'scrollBegin' );

          /**
           * @ngdoc event
           * @name scrollEnd
           * @eventOf  ui.grid.core.api:PublicApi
           * @description  is raised when scroll has finished.  Is throttled, so won't be raised too frequently
           */
          this.registerEvent( 'core', 'scrollEnd' );

          /**
           * @ngdoc event
           * @name canvasHeightChanged
           * @eventOf  ui.grid.core.api:PublicApi
           * @description  is raised when the canvas height has changed
           * <br/>
           * arguments: oldHeight, newHeight
           */
          this.registerEvent( 'core', 'canvasHeightChanged');

          /**
           * @ngdoc event
           * @name gridDimensionChanged
           * @eventOf  ui.grid.core.api:PublicApi
           * @description  is raised when the grid dimensions have changed (when autoResize is on)
           * <br/>
           * arguments: oldGridHeight, oldGridWidth, newGridHeight, newGridWidth
           */
          this.registerEvent( 'core', 'gridDimensionChanged');
        };

        /**
         * @ngdoc function
         * @name ui.grid.class:suppressEvents
         * @methodOf ui.grid.class:GridApi
         * @description Used to execute a function while disabling the specified event listeners.
         * Disables the listenerFunctions, executes the callbackFn, and then enables
         * the listenerFunctions again
         * @param {object} listenerFuncs listenerFunc or array of listenerFuncs to suppress. These must be the same
         * functions that were used in the .on.eventName method
         * @param {object} callBackFn function to execute
         * @example
         * <pre>
         *    var navigate = function (newRowCol, oldRowCol){
         *       //do something on navigate
         *    }
         *
         *    gridApi.cellNav.on.navigate(scope,navigate);
         *
         *
         *    //call the scrollTo event and suppress our navigate listener
         *    //scrollTo will still raise the event for other listeners
         *    gridApi.suppressEvents(navigate, function(){
         *       gridApi.cellNav.scrollTo(aRow, aCol);
         *    });
         *
         * </pre>
         */
        GridApi.prototype.suppressEvents = function (listenerFuncs, callBackFn) {
          var self = this;
          var listeners = angular.isArray(listenerFuncs) ? listenerFuncs : [listenerFuncs];

          //find all registered listeners
          var foundListeners = self.listeners.filter(function(listener) {
            return listeners.some(function(l) {
              return listener.handler === l;
            });
          });

          //deregister all the listeners
          foundListeners.forEach(function(l){
            l.dereg();
          });

          callBackFn();

          //reregister all the listeners
          foundListeners.forEach(function(l){
              l.dereg = registerEventWithAngular(l.eventId, l.handler, self.grid, l._this);
          });

        };

        /**
         * @ngdoc function
         * @name registerEvent
         * @methodOf ui.grid.class:GridApi
         * @description Registers a new event for the given feature.  The event will get a
         * .raise and .on prepended to it
         * <br>
         * .raise.eventName() - takes no arguments
         * <br/>
         * <br/>
         * .on.eventName(scope, callBackFn, _this)
         * <br/>
         * scope - a scope reference to add a deregister call to the scopes .$on('destroy').  Scope is optional and can be a null value,
         * but in this case you must deregister it yourself via the returned deregister function
         * <br/>
         * callBackFn - The function to call
         * <br/>
         * _this - optional this context variable for callbackFn. If omitted, grid.api will be used for the context
         * <br/>
         * .on.eventName returns a dereg funtion that will remove the listener.  It's not necessary to use it as the listener
         * will be removed when the scope is destroyed.
         * @param {string} featureName name of the feature that raises the event
         * @param {string} eventName  name of the event
         */
        GridApi.prototype.registerEvent = function (featureName, eventName) {
          var self = this;
          if (!self[featureName]) {
            self[featureName] = {};
          }

          var feature = self[featureName];
          if (!feature.on) {
            feature.on = {};
            feature.raise = {};
          }

          var eventId = self.grid.id + featureName + eventName;

          // gridUtil.logDebug('Creating raise event method ' + featureName + '.raise.' + eventName);
          feature.raise[eventName] = function () {
            $rootScope.$emit.apply($rootScope, [eventId].concat(Array.prototype.slice.call(arguments)));
          };

          // gridUtil.logDebug('Creating on event method ' + featureName + '.on.' + eventName);
          feature.on[eventName] = function (scope, handler, _this) {
            if ( scope !== null && typeof(scope.$on) === 'undefined' ){
              gridUtil.logError('asked to listen on ' + featureName + '.on.' + eventName + ' but scope wasn\'t passed in the input parameters.  It is legitimate to pass null, but you\'ve passed something else, so you probably forgot to provide scope rather than did it deliberately, not registering');
              return;
            }
            var deregAngularOn = registerEventWithAngular(eventId, handler, self.grid, _this);

            //track our listener so we can turn off and on
            var listener = {handler: handler, dereg: deregAngularOn, eventId: eventId, scope: scope, _this:_this};
            self.listeners.push(listener);

            var removeListener = function(){
              listener.dereg();
              var index = self.listeners.indexOf(listener);
              self.listeners.splice(index,1);
            };

            //destroy tracking when scope is destroyed
            if (scope) {
              scope.$on('$destroy', function() {
                removeListener();
              });
            }


            return removeListener;
          };
        };

        function registerEventWithAngular(eventId, handler, grid, _this) {
          return $rootScope.$on(eventId, function (event) {
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 1); //remove evt argument
            handler.apply(_this ? _this : grid.api, args);
          });
        }

        /**
         * @ngdoc function
         * @name registerEventsFromObject
         * @methodOf ui.grid.class:GridApi
         * @description Registers features and events from a simple objectMap.
         * eventObjectMap must be in this format (multiple features allowed)
         * <pre>
         * {featureName:
         *        {
         *          eventNameOne:function(args){},
         *          eventNameTwo:function(args){}
         *        }
         *  }
         * </pre>
         * @param {object} eventObjectMap map of feature/event names
         */
        GridApi.prototype.registerEventsFromObject = function (eventObjectMap) {
          var self = this;
          var features = [];
          angular.forEach(eventObjectMap, function (featProp, featPropName) {
            var feature = {name: featPropName, events: []};
            angular.forEach(featProp, function (prop, propName) {
              feature.events.push(propName);
            });
            features.push(feature);
          });

          features.forEach(function (feature) {
            feature.events.forEach(function (event) {
              self.registerEvent(feature.name, event);
            });
          });

        };

        /**
         * @ngdoc function
         * @name registerMethod
         * @methodOf ui.grid.class:GridApi
         * @description Registers a new event for the given feature
         * @param {string} featureName name of the feature
         * @param {string} methodName  name of the method
         * @param {object} callBackFn function to execute
         * @param {object} _this binds callBackFn 'this' to _this.  Defaults to gridApi.grid
         */
        GridApi.prototype.registerMethod = function (featureName, methodName, callBackFn, _this) {
          if (!this[featureName]) {
            this[featureName] = {};
          }

          var feature = this[featureName];

          feature[methodName] = gridUtil.createBoundedWrapper(_this || this.grid, callBackFn);
        };

        /**
         * @ngdoc function
         * @name registerMethodsFromObject
         * @methodOf ui.grid.class:GridApi
         * @description Registers features and methods from a simple objectMap.
         * eventObjectMap must be in this format (multiple features allowed)
         * <br>
         * {featureName:
         *        {
         *          methodNameOne:function(args){},
         *          methodNameTwo:function(args){}
         *        }
         * @param {object} eventObjectMap map of feature/event names
         * @param {object} _this binds this to _this for all functions.  Defaults to gridApi.grid
         */
        GridApi.prototype.registerMethodsFromObject = function (methodMap, _this) {
          var self = this;
          var features = [];
          angular.forEach(methodMap, function (featProp, featPropName) {
            var feature = {name: featPropName, methods: []};
            angular.forEach(featProp, function (prop, propName) {
              feature.methods.push({name: propName, fn: prop});
            });
            features.push(feature);
          });

          features.forEach(function (feature) {
            feature.methods.forEach(function (method) {
              self.registerMethod(feature.name, method.name, method.fn, _this);
            });
          });

        };

        return GridApi;

      }]);

})();
