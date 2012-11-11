/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.aggregateTemplate = function () {
    return '<div ng-click="row.toggleExpand()" class="{{row.aggClass()}}"><span style="position: absolute; left: {{row.offsetleft}}px;">{{row.label}}   ({{row.children.length}} items)</span></div>';
};