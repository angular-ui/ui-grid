/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.defaultHeaderCellTemplate = function () {
    var b = new ng.utils.StringBuilder();
    b.append('<div>');
    b.append('  <div ng-click="col.sort()" ng-class="{ \'ngSorted\': !noSortVisible }">');
    b.append('      <span class="ngHeaderText">{{col.displayName}}</span>');
    b.append('      <div class="ngSortButtonDown" ng-show="col.showSortButtonDown()"></div>');
    b.append('      <div class="ngSortButtonUp" ng-show="col.showSortButtonUp()"></div>');
    b.append('  </div>');
    b.append('  <div class="ngHeaderGrip" ng-show="allowResize" ng-mouseDown="gripOnMouseDown()"></div>');
    b.append('  <div ng-show="_filterVisible">');
    b.append('      <input type="text" ng-model="col.filter" style="width: 80%" tabindex="1" />');
    b.append('  </div>');
    b.append('</div>');
    return b.toString();
};