/**
 * Created by Tim on 2/1/14.
 */
(function(){
    'use strict';
    var MISSING = "[MISSING]: ";
    var uiI18n = angular.module('ui.i18n', []);
    uiI18n.value('uiI18n.packs', {
        i18n: {},
        lang: null
    });
    var getPack = function(){
        return angular.injector(['ng','ui.i18n']).get('uiI18n.packs');
    };
    uiI18n.i18n = {
        add: function(langs, strings){
            var packs = getPack();
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
        },
        set: function(lang){
            if (lang){
                var pack = getPack();
                pack.lang = lang;
                uiI18n.value('uiI18n.packs', pack);
            }
        }
    };

    uiI18n.directive('uiI18n',['uiI18n.packs', function(packs) {
        return {
            link: function($scope, $elm, $attrs) {
                // check for watchable property
                var lang = $scope.$eval($attrs.uiI18n);
                if (lang){
                    $scope.$watch($attrs.uiI18n, function(newLang){
                        uiI18n.i18n.set(newLang);
                        $scope.$broadcast("$uiI18n", newLang);
                    });
                } else {
                    // fall back to the string value
                    lang = $attrs.uiI18n;
                }
                uiI18n.i18n.set(lang);
            }
        };
    }]);

    var uitDirective = function($parse, packs) {
        return {
            restrict: 'EA',
            compile: function(){
                return function($scope, $elm, $attrs) {
                    var token = $attrs.uiT || $attrs.uiTranslate || $elm.html();
                    var getter = $parse(token);
                    var missing = MISSING + token;

                    var listener = $scope.$on("$uiI18n", function(evt, lang){
                        // set text based on i18n current language
                        $elm.html(getter(packs.i18n[lang]) || missing);
                    });
                    $scope.$on('$destroy', listener);
                };
            }
        };
    };
    // directive syntax
    uiI18n.directive('uiT',['$parse', 'uiI18n.packs', uitDirective]);
    uiI18n.directive('uiTranslate',['$parse', 'uiI18n.packs', uitDirective]);

    var uitFilter = function($parse, packs) {
        return function(data) {
            var getter = $parse(data);
            // set text based on i18n current language
            return getter(packs.i18n[packs.lang]) || MISSING + data;
        };
    };
    // optional syntax
    uiI18n.filter('t', ['$parse', 'uiI18n.packs', uitFilter]);
    uiI18n.filter('translate', ['$parse', 'uiI18n.packs', uitFilter]);
})();