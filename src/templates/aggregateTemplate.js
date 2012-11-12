/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.aggregateTemplate = function () {
    return '<div ng-click="row.toggleExpand()" style="left: {{row.offsetleft}}px;" class="ngAggregate"><span class="ngAggregateText">{{row.label}}  ({{row.totalChildren()}} items)</span><div class="{{row.aggClass()}}"></div></div>';
};