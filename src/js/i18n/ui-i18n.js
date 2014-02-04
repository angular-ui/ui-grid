/**
 * ui-i18n Created by Tim Sweet on 2/1/14.
 * https://github.com/timothyswt
 * MIT License
 */
(function(deepExtend){
    'use strict';
    var MISSING = '[MISSING]: ',
        UPDATE_EVENT = '$uiI18n',
        FILTER_ALIASES = ['t', 'translate'],
        DIRECTIVE_ALIASES = ['uiT', 'uiTranslate'],
        LOCALE_DIRECTIVE_ALIAS = 'uiI18n',
    // default to english
        DEFAULT_LANG = 'en-US',
        langCache = {
            _langs: {},
            current: null
        },
        uiI18n = angular.module('ui.i18n', []);

    langCache.get = function(lang){
        return langCache._langs[lang.toLowerCase()];
    };
    langCache.add = function(lang, strings){
        var lower = lang.toLowerCase();
        var cache = langCache._langs;
        cache[lower] = deepExtend(cache[lower] || {}, strings);
    };
    langCache.setCurrent = function(lang){
        langCache.current = lang.toLowerCase();
    };
    langCache.getCurrent = function(){
        return langCache.get(langCache.current);
    };

    uiI18n._cache = langCache;
    uiI18n.$broadcast = function(lang){
        if (lang && this.$root){
            uiI18n.$root.$broadcast(UPDATE_EVENT, lang);
        }
    };
    uiI18n.add =  function(langs, strings){
        if (typeof(langs) === 'object'){
            angular.forEach(langs, function(lang){
                if (lang){
                    langCache.add(lang, strings);
                }
            });
        } else {
            langCache.add(langs, strings);
        }
    };
    uiI18n.set = function(lang){
        if (lang){
            langCache.setCurrent(lang);
            uiI18n.$broadcast(lang);
        }
    };

    var localeDirective = function() {
        return {
            compile: function(){
                return {
                    pre: function($scope, $elm, $attrs) {
                        var alias = LOCALE_DIRECTIVE_ALIAS;
                        if (!uiI18n.$root) { uiI18n.$root = $scope.$root; }
                        // check for watchable property
                        var lang = $scope.$eval($attrs[alias]);
                        if (lang){
                            $scope.$watch($attrs[alias], uiI18n.set);
                        } else if ($attrs.$$observers){
                            $scope.$on('$destroy', $attrs.$observe(alias, uiI18n.set));
                        } else {
                            // fall back to the string value
                            lang = $attrs[alias];
                        }
                        uiI18n.set(lang || DEFAULT_LANG);
                    }
                };
            }
        };
    };
    uiI18n.directive(LOCALE_DIRECTIVE_ALIAS, localeDirective);

    // directive syntax
    var uitDirective = function($parse) {
        return {
            restrict: 'EA',
            compile: function(){
                return {
                    pre: function($scope, $elm, $attrs) {
                        if (!uiI18n.$root) { uiI18n.$root = $scope.$root; }
                        var alias1 = DIRECTIVE_ALIASES[0],
                            alias2 = DIRECTIVE_ALIASES[1];
                        var token = $attrs[alias1] || $attrs[alias2] || $elm.html();
                        var missing = MISSING + token;
                        var observer;
                        if ($attrs.$$observers){
                            var prop = $attrs[alias1] ? alias1 : alias2;
                            observer = $attrs.$observe(prop, function(result){
                                if (result){
                                    $elm.html($parse(result)(langCache.getCurrent()) || missing);
                                }
                            });
                        }
                        var getter = $parse(token);
                        var listener = $scope.$on(UPDATE_EVENT, function(evt, lang){
                            if (observer){
                                observer($attrs[alias1] || $attrs[alias2]);
                            } else {
                                // set text based on i18n current language
                                $elm.html(getter(langCache.get(lang)) || missing);
                            }
                        });
                        $scope.$on('$destroy', listener);
                    }
                };
            }
        };
    };

    // optional filter syntax
    var uitFilter = function($parse) {
        return function(data) {
            var getter = $parse(data);
            // set text based on i18n current language
            return getter(langCache.getCurrent()) || MISSING + data;
        };
    };

    angular.forEach(DIRECTIVE_ALIASES, function(alias){
        uiI18n.directive(alias,['$parse', uitDirective]);
    });
    angular.forEach(FILTER_ALIASES, function(alias){
        uiI18n.filter(alias,['$parse', uitFilter]);
    });
})(function(destination, source) {
    'use strict';
    // adding deep copy method until angularjs supports deep copy like everyone else.
    // https://github.com/angular/angular.js/pull/5059
    // for (var property in source) {
    //     if (source[property] && source[property].constructor &&
    //         source[property].constructor === Object) {
    //         destination[property] = destination[property] || {};
    //         arguments.callee(destination[property], source[property]);
    //     } else {
    //         destination[property] = source[property];
    //     }
    // }

    // return destination;

    return angular.copy(source, destination);
});