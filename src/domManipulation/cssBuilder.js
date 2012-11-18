/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>
/// <reference path="../classes/range.js"/>

ng.CssBuilder = function ($scope, grid) {
    var self = this;
    self.buildStyles = function() {
        var rowHeight = (grid.config.rowHeight - grid.elementDims.rowHdiff),
            headerRowHeight = grid.config.headerRowHeight,
            $style = grid.$styleSheet,
            gridId = grid.gridId,
            css = new ng.utils.StringBuilder(),
            cols = $scope.visibleColumns(),
            sumWidth = 0;
        
        if (!$style) $style = $("<style type='text/css' rel='stylesheet' />").appendTo($('html'));
        $style.empty();
        if ($scope.totalRowWidth() > $scope.width)
            css.append(".{0} .ngCanvas { width: {1}px; }", gridId, $scope.totalRowWidth());
        css.append(".{0} .ngCell { height: {1}px; }", gridId, rowHeight);
        css.append(".{0} .ngHeaderCell { top: 0; bottom: 0; }", gridId, headerRowHeight);
        css.append(".{0} .ngHeaderScroller { line-height: {1}px; }", gridId, headerRowHeight);
        var trw = $scope.totalRowWidth();
        angular.forEach(cols, function(col, i) {
            css.append(".{0} .col{1} { width: {2}px; left: {3}px; right: {4}px; height: {5}px }", gridId, i, col.width, sumWidth, (trw - sumWidth - col.width), rowHeight);
            sumWidth += col.width;
        });
        if (ng.utils.isIe) { // IE
            $style[0].styleSheet.cssText = css.toString(" ");
        } else {
            $style[0].appendChild(document.createTextNode(css.toString(" ")));
        }
        grid.$styleSheet = $style;
        if (!$scope.$$phase) {
            $scope.$digest();
        }
    };
};