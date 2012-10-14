kg.templates.defaultGridInnerTemplate = function (options) {
    var b = new kg.utils.StringBuilder();
    b.append('<div class="kgTopPanel" ng-size="{ dim: headerDim }">');
    b.append(    '<div class="kgHeaderContainer" ng-size="{ dim: headerDim }">');
    b.append(        '<div class="kgHeaderScroller" ng-header-row="data" ng-size="{ dim: headerScrollerDim }">');
    b.append(        '</div>');
    b.append(    '</div>');
    b.append('</div>');
    b.append('<div class="kgViewport {0}" ng-size="{ dim: viewportDim }">', options.disableTextSelection ? "kgNoSelect": "");
    b.append(    '<div class="kgCanvas" ng-rows="rows" ng-style="{ height: canvasHeight, position: \'relative\' }">');
    b.append(    '</div>');
    b.append('</div>');
    b.append('<div class="kgFooterPanel" ng-footer="data" ng-size="{ dim: footerDim }">'); //not sure what goes in ng-footer.
    b.append('</div>');
    return b.toString();
};