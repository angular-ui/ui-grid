/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.Aggregate = function (aggEntity, rowFactory) {
    var self = this;
    self.index = 0;
    self.offsetTop = 0;
    self.offsetleft = aggEntity.gDepth * 25;
    self.label = aggEntity.gLabel;
    self.field = aggEntity.gField;
    self.depth = aggEntity.gDepth;
    self.children = aggEntity.children;
    self.collapsed = false;
    self.isAggRow = true;
    self.toggleExpand = function () {
        self.collapsed = self.collapsed ? false : true;
        angular.forEach(self.children, function (child) {
            child.hidden = self.collapsed;
        });
        rowFactory.rowCache = [];
        var foundMyself = false;
        angular.forEach(rowFactory.aggCache, function (agg, i) {
            if (foundMyself) {
                var offset = (30 * self.children.length);
                agg.offsetTop = self.collapsed ? agg.offsetTop - offset : agg.offsetTop + offset;
            } else {
                if (i == self.label) {
                    foundMyself = true;
                }
            }
        });
        rowFactory.parsedData.needsUpdate = true;
        rowFactory.renderedChange();
    };
    self.aggClass = function() {
        return self.collapsed ? "ngAggregateOpen" : "ngAggregateClosed";
    };
}; 