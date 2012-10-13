/// <reference path="../../lib/jquery-1.7.js" />
/// <reference path="../../lib/knockout-2.0.0.debug.js" />
/// <reference path="../KoGrid.js" />

kg.cssBuilder = {

    buildStyles: function (grid) {
        var rowHeight = (grid.config.rowHeight - grid.elementDims.rowHdiff),
            headerRowHeight = grid.config.headerRowHeight,
            $style = grid.$styleSheet,
            gridId = grid.gridId,
            rules,
            i = 0,
            len = grid.columns.length,
            css = new kg.utils.StringBuilder(),
            col,
            sumWidth = 0,
            colWidth;

        if (!$style) {
            $style = $("<style type='text/css' rel='stylesheet' />").appendTo($('head'));
        }
        $style.empty();
        
        css.append(".{0} .kgCanvas { width: {1}px; }", gridId, grid.totalRowWidth);
        css.append(".{0} .kgCell { height: {1}px; }", gridId, rowHeight);
        css.append(".{0} .kgRow { position: absolute; left: 0; right: 0; height: {1}px; line-height: {1}px; display: inline; }", gridId, rowHeight);
        css.append(".{0} .kgHeaderCell { top: 0; bottom: 0; }", gridId, headerRowHeight);
        css.append(".{0} .kgHeaderScroller { line-height: {1}px; overflow: none; }", gridId, headerRowHeight);    
        
        for (; i < len; i++) {
            col = grid.columns()[i];
            colWidth = col.width() - grid.elementDims.cellWdiff;
            css.append(".{0} .col{1} { left: {2}px; right: {3}px; }", gridId, i, sumWidth, (grid.totalRowWidth - sumWidth - col.width));
            sumWidth += col.width();
        }



        if (kg.utils.isIe) { // IE
            $style[0].styleSheet.cssText = css.toString(" ");
        }
        else {
            $style[0].appendChild(document.createTextNode(css.toString(" ")));
        }

        grid.$styleSheet = $style;
    }
};