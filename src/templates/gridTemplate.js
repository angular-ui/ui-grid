kg.templates.defaultGridInnerTemplate = function (options) {
    var b = new kg.utils.StringBuilder();
    b.append('<div class="kgTopPanel" data-bind="kgSize: $data.headerDim">');
    b.append(    '<div class="kgHeaderContainer" data-bind="kgSize: $data.headerDim">');
    b.append(        '<div class="kgHeaderScroller" data-bind="kgHeaderRow: $data, kgSize: $data.headerScrollerDim">');
    b.append(        '</div>');
    b.append(    '</div>');
    b.append('</div>');
    b.append('<div class="kgViewport {0}" data-bind="{0}kgSize: $data.viewportDim">', options.disableTextSelection ? "kgNoSelect": "");
    b.append(    '<div class="kgCanvas" data-bind="kgRows: $data.rows, style: { height: $data.canvasHeight }" style="position: relative">');
    b.append(    '</div>');
    b.append('</div>');
    b.append('<div class="kgFooterPanel" data-bind="kgFooter: $data, kgSize: $data.footerDim">');
    b.append('</div>');
    return b.toString();
};