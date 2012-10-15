/// <reference path="../lib/jquery-1.8.2.min" />
/// <reference path="../lib/angular.js" />
/// <reference path="../src/constants.js"/>
/// <reference path="../src/namespace.js" />
/// <reference path="../src/navigation.js"/>

ng.utils = {
    arrayForEach: function (array, action) {
        for (var i = 0, j = array.length; i < j; i++)
        action(array[i]);
    },

    arrayIndexOf: function (array, item) {
        if (typeof Array.prototype.indexOf == "function")
            return Array.prototype.indexOf.call(array, item);
        for (var i = 0, j = array.length; i < j; i++)
            if (array[i] === item)
                return i;
        return -1;
    },
    
    arrayFilter: function (array, predicate) {
        array = array || [];
        var result = [];
        for (var i = 0, j = array.length; i < j; i++)
        if (predicate(array[i]))
        result.push(array[i]);
        return result;
    },

    forIn: function (obj, action) {
        var prop;

        for (prop in obj) {
            if(obj.hasOwnProperty(prop)){
                action(obj[prop], prop);
            }
        }
    },
        
    endsWith: function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },
    isNullOrUndefined: function (obj){
        if (obj == null || obj == undefined) return true;
        return false;
    },
    StringBuilder: function () {
        var strArr = [];
        
        this.append = function (str, data) {
            var len = arguments.length,
                intMatch = 0,
                strMatch = '{0}',
                i = 1;

            if (len > 1) { // they provided data
                while (i < len) {

                    //apparently string.replace only works on one match at a time
                    //so, loop through the string and hit all matches
                    while (str.indexOf(strMatch) !== -1) {
                        str = str.replace(strMatch, arguments[i]);
                    }
                    i++;
                    intMatch = i - 1;
                    strMatch = "{" + intMatch.toString() + "}";
                }
            }
            strArr.push(str);
        };

        this.toString = function () {
            var separator = arguments[0];
            if (separator !== null && separator !== undefined) {
                return strArr.join(separator);
            } else {
                return strArr.join("");
            }
        };
    },
    
    getElementsByClassName: function(cl) {
        var retnode = [];
        var myclass = new RegExp('\\b'+cl+'\\b');
        var elem = document.getElementsByTagName('*');
        for (var i = 0; i < elem.length; i++) {
            var classes = elem[i].className;
            if (myclass.test(classes)) retnode.push(elem[i]);
        }
        return retnode;
    },
    
    getPropertyPath: function(path, entity){
        var propPath = path.split('.');
        var tempProp = entity[propPath[0]];

        for (var j = 1; j < propPath.length; j++){
            tempProp = tempProp[propPath[j]];
        }
        return tempProp;
    },
    
    newId: (function () {
        var seedId = new Date().getTime();

        return function () {
            return seedId += 1;
        };
    })(),
    
    // we copy KO's ie detection here bc it isn't exported in the min versions of KO
    // Detect IE versions for workarounds (uses IE conditionals, not UA string, for robustness) 
    ieVersion: (function () {
        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
        while (
            div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
            iElems[0]
        );
        return version > 4 ? version : undefined;
    })(),
};

$.extend(ng.utils, {
    isIe6: (function(){ 
        return ng.utils.ieVersion === 6;
    })(),
    isIe7: (function(){ 
        return ng.utils.ieVersion === 7;
    }    )(),
    isIe: (function () { 
        return ng.utils.ieVersion !== undefined; 
    })()
}); 