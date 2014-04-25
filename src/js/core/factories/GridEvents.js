(function () {

  angular.module('ui.grid')
    .factory('GridEvents', ['$log', '$q', '$rootScope', 'gridUtil', 'uiGridConstants',
      function ($log, $q, $rootScope, gridUtil, uiGridConstants) {

        /**
         * @ngdoc function
         * @name ui.grid.class:GridEvents
         * @description GridEvents provides the ability to register public events inside the grid and allow
         * for other components to subscribe to these events via featureName.on.eventName(function(args){}
         * @param {object} grid grid that owns these events
         */
        var GridEvents = function GridEvents(grid) {
          this.grid = grid;
        };

        /**
         * @ngdoc function
         * @name registerEvent
         * @methodOf ui.grid.class:GridEvents
         * @description Registers a new event for the given feature
         * @param {string} featureName name of the feature that raises the event
         * @param {string} eventName  name of the event
         */
        GridEvents.prototype.registerEvent = function (featureName, eventName) {
          if (!this[featureName]) {
            this[featureName] = {};
          }

          var feature = this[featureName];
          if (!feature.on) {
            feature.on = {};
          }

          var eventId = this.grid.id + featureName + eventName;

          $log.log('Creating raise event method ' + featureName + '.' + eventName);
          feature[eventName] = function () {
            $rootScope.$broadcast.apply($rootScope, [eventId].concat(Array.prototype.slice.call(arguments)));
          };

          $log.log('Creating on event method ' + featureName + '.on.' + eventName);
          feature.on[eventName] = function (scope, handler) {
            scope.$on(eventId, function (event) {
              var args = Array.prototype.slice.call(arguments);
              args.splice(0, 1); //remove evt argument
              handler.apply(this.grid, args);
            });
          };
        };

        /**
         * @ngdoc function
         * @name registerEventsFromObject
         * @methodOf ui.grid.class:GridEvents
         * @description Registers features and events from a simple objectMap.
         * eventObjectMap must be in this format (multiple features allowed)
         * <br>
         * {featureName:
         *        {
         *          eventNameOne:function(args){},
         *          eventNameTwo:function(args){}
         *        }
         * @param {object} eventObjectMap map of feature/event names
         */
        GridEvents.prototype.registerEventsFromObject = function (eventObjectMap) {
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

        return GridEvents;

      }]);

})();