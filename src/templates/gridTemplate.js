/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.templates.defaultGridInnerTemplate = function () {
    var b = new ng.utils.StringBuilder();
    b.append('<div>');
    b.append(   '<div class="kgTopPanel" ng-size="headerDim">');
    b.append(       '<div class="kgHeaderContainer" ng-size="headerDim">');
    b.append(           '<div class="kgHeaderScroller" ng-header-row="data" ng-size="headerScrollerDim">');
    b.append(           '</div>');
    b.append(       '</div>');
    b.append(   '</div>');
    b.append(   '<div class="kgViewport" ng-size="viewportDim">');
    b.append(       '<div class="kgCanvas" ng-rows="rows" ng-style="{ height: canvasHeight, position: \'relative\' }">');
    b.append(       '</div>');
    b.append(   '</div>');
    b.append(   '<div class="kgFooterPanel" ng-size="footerDim">');
    b.append(       '<div class="kgTotalSelectContainer" ng-show="footerVisible">');
    b.append(           '<div class="kgFooterTotalItems" ng-class="{\'ngNoMultiSelect\': !isMultiSelect}" >');
    b.append(               '<span class="ngLabel">Total Items: {{maxRows}}</span>');
    b.append(           '</div>');
    b.append(           '<div class="ngFooterSelectedItems" ng-show="isMultiSelect">');
    b.append(           '<span class="ngLabel">Selected Items: {{selectedItemCount}}</span>');
    b.append(           '</div>');
    b.append(       '</div>');
    b.append(       '<div class="kgPagerContainer" ng-show="pagerVisible && footerVisible" ng-class="{\'ngNoMultiSelect\': !isMultiSelect}">');
    b.append(           '<div style="float: right;">');
    b.append(               '<div class="kgRowCountPicker">');
    b.append(                   '<span class="kgLabel">Rows:</span>');
    b.append(                   '<select ng-model="selectedPageSize">');
    b.append(                       '<option ng-repeat="size in pageSizes">{{size}}</option>');
    b.append(                   '</select>');
    b.append(               '</div>');
    b.append(               '<div class="kgPagerControl" style="float: left; min-width: 135px;">');
    b.append(                   '<input class="kgPagerFirst" type="button" ng-click="pageToFirst" ng-disable="!canPageBackward" title="First Page"/>');
    b.append(                   '<input class="kgPagerPrev" type="button"  ng-click="pageBackward" ng-disable="!canPageBackward" title="Previous Page"/>');
    b.append(                   '<input class="kgPagerCurrent" type="text" ng-model="protectedCurrentPage" ng-disable="{ maxPages() < 1 }" />');
    b.append(                   '<input class="kgPagerNext" type="button"  ng-click="pageForward" ng-disable="!canPageForward" title="Next Page"/>');
    b.append(                   '<input class="kgPagerLast" type="button"  ng-click="pageToLast" ng-disable="!canPageForward" title="Last Page"/>');
    b.append(               '</div>');
    b.append(           '</div>');
    b.append(       '</div>');
    b.append(   '</div>');
    b.append('</div>');
    return b.toString();
};