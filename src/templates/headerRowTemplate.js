/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.defaultHeaderRowTemplate = function () {
    return '<div ng-repeat="col in columns" class="ngHeaderCell {{columnClass($index)}}" ng-style="headerCellSize(col)" ng-header-cell><div>';
};