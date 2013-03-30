ngGridServices.factory('$utilityService', ['$parse', function ($parse) {
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
            $(elem).css('font', $(node).css('font'));
            elem.innerHTML = $(node).text();
            return elem.offsetWidth;
        },
        forIn: function(obj, action) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    action(obj[prop], prop);
                }
            }
        },
        evalProperty: function (entity, path) {
            return $parse(path)(entity);
        },
        endsWith: function(str, suffix) {
            if (!str || !suffix || typeof str != "string") {
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
            return (results && results.length > 1) ? results[1] : "";
        },
        // we copy KO's ie detection here bc it isn't exported in the min versions of KO
        // Detect IE versions for workarounds (uses IE conditionals, not UA string, for robustness) 
        ieVersion: (function() {
            var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');
            // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
            while (div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
            iElems[0]) ;
            return version > 4 ? version : undefined;
        })()
    };

    $.extend(utils, {
        isIe: (function() {
            return utils.ieVersion !== undefined;
        })()
    });
    return utils;
}]);