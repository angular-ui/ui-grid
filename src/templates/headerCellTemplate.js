/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.defaultHeaderCellTemplate = function () {
    var b = new ng.utils.StringBuilder();
    b.append('<div ng-click="col.sort()" class="ngHeaderSortColumn" ng-class="{ \'ngSorted\': !noSortVisible }">');
    b.append('   <div ng-style="headerTextStyle($index)"class="ngHeaderText">{{col.displayName}}</div>');
    b.append('   <div class="ngSortButtonDown" ng-show="col.showSortButtonDown()"></div>');
    b.append('   <div class="ngSortButtonUp" ng-show="col.showSortButtonUp()"></div>');
    b.append('</div>');
    b.append('<div ng-show="col.allowResize" class="ngHeaderGrip" ng-click="col.gripClick($event)" ng-mousedown="col.gripOnMouseDown($event)"></div>');
    return b.toString();
};