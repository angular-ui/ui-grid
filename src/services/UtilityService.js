angular.module('ngGrid.services').factory('$utilityService', ['$parse', function ($parse) {
    var funcNameRegex = /function (.{1,})\(/;
    var utils = {
        visualLength: function(node) {
            var elem = document.getElementById('testDataLength');
            if (!elem) {
                elem = document.createElement('SPAN');
                elem.id = "testDataLength";
                elem.style.visibility = "hidden";
                document.body.appendChild(elem);
            }
            var $node = $(node);
            $(elem).css({'font': $node.css('font'),
                        'font-size': $node.css('font-size'),
                        'font-family': $node.css('font-family')});
            elem.innerHTML = $node.text();
            var width = elem.offsetWidth;
            document.body.removeChild(elem);
            return width;
        },
        forIn: function(obj, action) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    action(obj[prop], prop);
                }
            }
        },
        endsWith: function(str, suffix) {
            if (!str || !suffix || typeof str !== "string") {
                return false;
            }
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        },
        isNullOrUndefined: function(obj) {
            if (obj === undefined || obj === null) {
                return true;
            }
            return false;
        },
        getElementsByClassName: function(cl) {
            if (document.getElementsByClassName) {
                return document.getElementsByClassName(cl);
            }
            else {
                var retnode = [];
                var myclass = new RegExp('\\b' + cl + '\\b');
                var elem = document.getElementsByTagName('*');
                for (var i = 0; i < elem.length; i++) {
                    var classes = elem[i].className;
                    if (myclass.test(classes)) {
                        retnode.push(elem[i]);
                    }
                }
                return retnode;    
            }
        },
        newId: (function() {
            var seedId = new Date().getTime();
            return function() {
                return seedId += 1;
            };
        })(),
        seti18n: function($scope, language) {
            var $langPack = window.ngGrid.i18n[language];
            for (var label in $langPack) {
                $scope.i18n[label] = $langPack[label];
            }
        },
        getInstanceType: function (o) {
            var results = (funcNameRegex).exec(o.constructor.toString());
            if (results && results.length > 1) {
                var instanceType = results[1].replace(/^\s+|\s+$/g, ""); // Trim surrounding whitespace; IE appears to add a space at the end
                return instanceType;
            }
            else {
                return "";
            }
        },
        init: function () {
            function preEval(path) {
                var m = BRACKET_REGEXP.exec(path);
                if (m) {
                    return (m[1] ? preEval(m[1]) : m[1]) + m[2] + (m[3] ? preEval(m[3]) : m[3]);
                } else {
                    path = path.replace(APOS_REGEXP, '\\\'');
                    var parts = path.split(DOT_REGEXP);
                    var preparsed = [parts.shift()];    // first item must be var notation, thus skip
                    angular.forEach(parts, function (part) {
                        preparsed.push(part.replace(FUNC_REGEXP, '\']$1'));
                    });
                    return preparsed.join('[\'');
                }
            }

            this.preEval = preEval;
            this.evalProperty = function (entity, path) {
                return $parse(preEval('entity.' + path))({ entity: entity });
            };
            delete this.init;
            return this;
        }
    }.init();

    return utils;
}]);
