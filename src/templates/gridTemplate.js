/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.templates.defaultGridInnerTemplate = function () {
    var b = new ng.utils.StringBuilder();
    b.append('<div class="ngTopPanel" ng-size="headerDim">');
    b.append(    '<div class="ngHeaderContainer" ng-size="headerDim">');
    b.append(        '<div class="ngHeaderScroller" ng-header-row="config" ng-size="headerScrollerDim">');
    b.append(        '</div>');
    b.append(    '</div>');
    b.append('</div>');
    b.append('<div class="ngViewport" ng-size="viewportDim">');
    b.append(    '<div class="ngCanvas" ng-rows="config" ng-style="{ height: canvasHeight, position: \'relative\' }">');
    b.append(    '</div>');
    b.append('</div>');
    b.append('<div class="ngFooterPanel" ng-size="footerDim">');
    b.append(   '<div class="ngTotalSelectContainer" ng-show="footerVisible">');
    b.append(       '<div class="ngFooterTotalItems" ng-class="{\'ngNoMultiSelect\': !isMultiSelect}" >');
    b.append(           '<span class="ngLabel">Total Items: {{maxRows}}</span>');
    b.append(       '</div>');
    b.append(       '<div class="ngFooterSelectedItems" ng-show="isMultiSelect">');
    b.append(       '<span class="ngLabel">Selected Items: {{selectedItemCount}}</span>');
    b.append(       '</div>');
    b.append(   '</div>');
    b.append(   '<div class="ngPagerContainer" ng-show="pagerVisible && footerVisible" ng-class="{\'ngNoMultiSelect\': !isMultiSelect}">');
    b.append(       '<div style="float: right;">');
    b.append(           '<div class="ngRowCountPicker">');
    b.append(               '<span class="ngLabel">Rows:</span>');
    b.append(               '<select ng-model="selectedPageSize">');
    b.append(                   '<option ng-repeat="size in pageSizes">{{size}}</option>');
    b.append(               '</select>');
    b.append(           '</div>');
    b.append(           '<div class="ngPagerControl" style="float: left; min-width: 135px;">');
    b.append(               '<input class="ngPagerFirst" type="button" ng-click="pageToFirst" ng-disable="!canPageBackward" title="First Page"/>');
    b.append(               '<input class="ngPagerPrev" type="button"  ng-click="pageBackward" ng-disable="!canPageBackward" title="Previous Page"/>');
    b.append(               '<input class="ngPagerCurrent" type="text" ng-model="protectedCurrentPage" ng-disable="{ maxPages() < 1 }" />');
    b.append(               '<input class="ngPagerNext" type="button"  ng-click="pageForward" ng-disable="!canPageForward" title="Next Page"/>');
    b.append(               '<input class="ngPagerLast" type="button"  ng-click="pageToLast" ng-disable="!canPageForward" title="Last Page"/>');
    b.append(           '</div>');
    b.append(       '</div>');
    b.append(   '</div>');
    b.append('</div>');
    return b.toString();
};