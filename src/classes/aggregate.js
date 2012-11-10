/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.Aggregate = function (aggEntity, indx) {
    var self = this;
    self.aggIndex = indx;
    self.offsetTop = 0;
    self.ngLabel = undefined;
    self.ngField = undefined;
    self.values = [];
    self.expanded = true;
    self.toggleExpand = function() {
        self.expanded = !self.expanded;
    };
    self.aggClass = function() {
        return self.expanded ? "ngAggregateOpen" : "ngAggregateClosed";
    };
}; 