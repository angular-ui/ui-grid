/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

ng.CssBuilder = function ($scope, grid) {
    var self = this;
    self.buildStyles = function(apply) {
        var rowHeight = (grid.config.rowHeight - grid.elementDims.rowHdiff),
            headerRowHeight = grid.config.headerRowHeight,
            $style = grid.$styleSheet,
            gridId = grid.gridId,
            css,
            cols = $scope.visibleColumns(),
            sumWidth = 0;
        
        if (!$style) $style = $("<style type='text/css' rel='stylesheet' />").appendTo($('html'));
        $style.empty();
        var trw = $scope.totalRowWidth();
        css = "." + gridId + " .ngCanvas { width: " + trw + "px; }"+
              "." + gridId + " .ngRow { width: " + trw + "px; }" +
              "." + gridId + " .ngCell { height: " + rowHeight + "px; }"+
              "." + gridId + " .ngCanvas { width: " + trw + "px; }" +
              "." + gridId + " .ngHeaderCell { top: 0; bottom: 0; }" + 
              "." + gridId + " .ngHeaderScroller { line-height: " + headerRowHeight + "px; width: " + (trw + ng.domUtility.scrollH + 2) + "px}";
        angular.forEach(cols, function(col, i) {
            css += "." + gridId + " .col" + i + " { width: " + col.width + "px; left: " + sumWidth + "px; right: " + (trw - sumWidth - col.width) + "px; height: " + rowHeight + "px }" +
                   "." + gridId + " .colt" + i + " { width: " + col.width + "px; }";
            sumWidth += col.width;
        });
        if (ng.utils.isIe) { // IE
            $style[0].styleSheet.cssText = css;
        } else {
            $style[0].appendChild(document.createTextNode(css));
        }
        grid.$styleSheet = $style;
        if (apply) self.apply();
    };
    self.apply = function() {
        if (!$scope.$$phase) {
            $scope.$digest();
        }
    };
};