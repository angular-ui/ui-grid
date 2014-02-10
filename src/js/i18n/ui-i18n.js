/**
 * ui.i18n Created by Tim Sweet on 2/1/14.
 * https://github.com/timothyswt
 * MIT License
 */
(function () {
  var DIRECTIVE_ALIASES = ['uiT', 'uiTranslate'];
  var FILTER_ALIASES = ['t', 'uiTranslate'];

  var module = angular.module('ui.grid.i18n');

  module.constant('i18nConstants', {
    MISSING: '[MISSING]: ',
    UPDATE_EVENT: '$uiI18n',

    LOCALE_DIRECTIVE_ALIAS: 'uiI18n',
    // default to english
    DEFAULT_LANG: 'en'
  });


//    module.config(['$provide', function($provide) {
//        $provide.decorator('i18nService', ['$delegate', function($delegate) {}])}]);

  module.service('i18nService', ['$log', 'i18nConstants', '$rootScope',
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
          cache[lower] = angular.copy(strings);
        },
        setCurrent: function (lang) {
          this.current = lang.toLowerCase();
        },
        getCurrentLang: function () {
          return this.current;
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

        get: function (lang) {
          var language = lang ? lang : service.getCurrentLang();
          return langCache.get(language);
        },

        setCurrentLang: function (lang) {
          if (lang) {
            langCache.setCurrent(lang);
            $rootScope.$broadcast(i18nConstants.UPDATE_EVENT);
          }
        },

        getCurrentLang: function () {
          var lang = langCache.getCurrentLang();
          if(!lang){
            lang = i18nConstants.DEFAULT_LANG;
            langCache.setCurrent(lang);
          }
          return lang;
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
            i18nService.setCurrentLang(lang || i18nConstants.DEFAULT_LANG);
          }
        };
      }
    };
  };

  module.directive('uiI18n', ['i18nService', 'i18nConstants', localeDirective]);

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
                  $elm.html($parse(result)(i18nService.getCurrentLang()) || missing);
                }
              });
            }
            var getter = $parse(token);
            var listener = $scope.$on(i18nConstants.UPDATE_EVENT, function (evt) {
              if (observer) {
                observer($attrs[alias1] || $attrs[alias2]);
              } else {
                // set text based on i18n current language
                $elm.html(getter(i18nService.get()) || missing);
              }
            });
            $scope.$on('$destroy', listener);

            $elm.html(getter(i18nService.get()) || missing);
          }
        };
      }
    };
  };

  DIRECTIVE_ALIASES.forEach(function (alias) {
    module.directive(alias, ['$parse', 'i18nService', 'i18nConstants', uitDirective]);
  });

  // optional filter syntax
  var uitFilter = function ($parse, i18nService, i18nConstants) {
    return function (data) {
      var getter = $parse(data);
      // set text based on i18n current language
      return getter(i18nService.get()) || i18nConstants.MISSING + data;
    };
  };



  FILTER_ALIASES.forEach(function (alias) {
    module.filter(alias, ['$parse', 'i18nService', 'i18nConstants', uitFilter]);
  });

})();