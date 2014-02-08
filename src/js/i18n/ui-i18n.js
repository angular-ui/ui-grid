/**
 * ui-i18n Created by Tim Sweet on 2/1/14.
 * https://github.com/timothyswt
 * MIT License
 */
(function () {
  var DIRECTIVE_ALIASES = ['uiT', 'uiTranslate'];
  var FILTER_ALIASES = ['t', 'translate'];

  var module = angular.module('ui.i18n');

  module.constant('ui-i18nConstants', {
    MISSING: '[MISSING]: ',
    UPDATE_EVENT: '$uiI18n',

    LOCALE_DIRECTIVE_ALIAS: 'uiI18n',
    // default to english
    DEFAULT_LANG: 'en-US'
  });


  module.service('ui-i18nService', ['$log', 'ui-i18nConstants', '$rootScope',
    function ($log, i18nConstants, $rootScope) {

      var langCache = {
        _langs: {},
        current: null,
        get: function (lang) {
          return this._langs[lang.toLowerCase()];
        },
        add: function (lang, strings) {
          var lower = lang.toLowerCase();
          var cache = this._langs;
          cache[lower] = angular.copy(cache[lower] || {}, strings);
        },
        setCurrent: function (lang) {
          this.current = lang.toLowerCase();
        },
        getCurrent: function () {
          return this.get(this.current);
        }
      };

//      function deepCopy(destination, source) {
//        'use strict';
//        // adding deep copy method until angularjs supports deep copy like everyone else.
//        // https://github.com/angular/angular.js/pull/5059
//        for (var property in source) {
//          if (source[property] && source[property].constructor &&
//            source[property].constructor === Object) {
//            destination[property] = destination[property] || {};
//            arguments.callee(destination[property], source[property]);
//          } else {
//            destination[property] = source[property];
//          }
//        }
//
//        return destination;
//      }

      var service = {
        add: function (langs, strings) {
          if (typeof(langs) === 'object') {
            angular.forEach(langs, function (lang) {
              if (lang) {
                langCache.add(lang, strings);
              }
            });
          } else {
            langCache.add(langs, strings);
          }
        },

        set: function (lang) {
          if (lang) {
            langCache.setCurrent(lang);
            $rootScope.$broadcast(i18nConstants.UPDATE_EVENT, lang);
          }
        },

        getCurrent: function () {
          return langCache.getCurrent();
        }

      };

      return service;

    }]);

  var localeDirective = function (i18nService, i18nConstants) {
    return {
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs) {
            var alias = i18nConstants.LOCALE_DIRECTIVE_ALIAS;
            // check for watchable property
            var lang = $scope.$eval($attrs[alias]);
            if (lang) {
              $scope.$watch($attrs[alias], i18nService.set);
            } else if ($attrs.$$observers) {
              $scope.$on('$destroy', $attrs.$observe(alias, i18nService.set));
            } else {
              // fall back to the string value
              lang = $attrs[alias];
            }
            i18nService.set(lang || i18nConstants.DEFAULT_LANG);
          }
        };
      }
    };
  };

  module.directive('ui-i18n', ['ui-i18nService', 'ui-i18nConstants', localeDirective]);

  // directive syntax
  var uitDirective = function ($parse, i18nService, i18nConstants) {
    return {
      restrict: 'EA',
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs) {
            var alias1 = DIRECTIVE_ALIASES[0],
              alias2 = DIRECTIVE_ALIASES[1];
            var token = $attrs[alias1] || $attrs[alias2] || $elm.html();
            var missing = i18nConstants.MISSING + token;
            var observer;
            if ($attrs.$$observers) {
              var prop = $attrs[alias1] ? alias1 : alias2;
              observer = $attrs.$observe(prop, function (result) {
                if (result) {
                  $elm.html($parse(result)(i18nService.getCurrent()) || missing);
                }
              });
            }
            var getter = $parse(token);
            var listener = $scope.$on(i18nConstants.UPDATE_EVENT, function (evt, lang) {
              if (observer) {
                observer($attrs[alias1] || $attrs[alias2]);
              } else {
                // set text based on i18n current language
                $elm.html(getter(i18nService.get(lang)) || missing);
              }
            });
            $scope.$on('$destroy', listener);
          }
        };
      }
    };
  };

  // optional filter syntax
  var uitFilter = function ($parse, i18nService, i18nConstants) {
    return function (data) {
      var getter = $parse(data);
      // set text based on i18n current language
      return getter(i18nService.getCurrent()) || i18nConstants.MISSING + data;
    };
  };

  DIRECTIVE_ALIASES.forEach(function (alias) {
    module.directive(alias, ['$parse', 'ui-i18nService', 'ui-i18nConstants', uitDirective]);
  });

  FILTER_ALIASES.forEach(function (alias) {
    module.filter(alias, ['$parse', 'ui-i18nService', 'ui-i18nConstants', uitFilter]);
  });

})();