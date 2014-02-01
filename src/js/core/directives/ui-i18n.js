/**
 * Created by Tim on 2/1/14.
 */

(function(){
    'use strict';
    var uiI18n = angular.module('ui.i18n', []);
    uiI18n.value('uiI18n.packs', {
        i18n: {},
        lang: null
    });
    uiI18n.i18n = {
        add: function(langs, strings){
            var packs = angular.injector(['ng','ui.i18n']).get('uiI18n.packs');
            if (typeof(langs) === "object"){
                angular.forEach(langs, function(lang){
                    if (lang){
                        var lower = lang.toLowerCase();
                        var combined = angular.extend(packs.i18n[lang] || {}, strings);
                        packs.i18n[lower] = combined;
                    }
                });
            } else {
                var lower = langs.toLowerCase();
                var combined = angular.extend(packs.i18n[langs] || {}, strings);
                packs.i18n[lower] = combined;
            }
            uiI18n.value('uiI18n.packs', packs);
        }
    };
    uiI18n.directive('uiI18n',['uiI18n.packs', function(packs) {
        return {
            link: function($scope, $elm, $attrs) {
                // check for watchable property
                var lang = $scope.$eval($attrs.uiI18n);
                if (lang){
                    $scope.$watch($attrs.uiI18n, function(newLang){
                        if (newLang){
                            packs.lang = newLang.toLowerCase();
                        }
                    });
                } else {
                    // fall back to the string value
                    lang = $attrs.uiI18n;
                }
                packs.lang = lang;
            }
        };
    }]);

    // directive syntax
    uiI18n.directive('uiT',['$parse', 'uiI18n.packs', function($parse, packs) {
        return {
            require: '?^uiI18n',
            link: function($scope, $elm, $attrs) {
                var getter = $parse($attrs.uiT);

                $scope.$watch(function(){
                    return packs.lang;
                }, function(){
                    // set text based on i18n current language
                    $elm.html(getter(packs.i18n[packs.lang]) || "Missing translation: " + $attrs.uiT);
                });
            }
        };
    }]);

    // optional syntax
    uiI18n.filter('t', ['$parse', 'uiI18n.packs', function($parse, packs) {
        return function(data) {
            var getter = $parse(data);
            // set text based on i18n current language
            return getter(packs.i18n[packs.lang]) || "Missing translation: " + data;
        };
    }]);
})();