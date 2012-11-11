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
    self.aggChildren = aggEntity.aggChildren;
    self.hidden = false;
    self.collapsed = false;
    self.isAggRow = true;
    self.toggleExpand = function() {
        self.collapsed = self.collapsed ? false : true;
        self.notifyChildren();
    };
    self.setExpand = function (state) {
        self.collapsed = state;
        self.notifyChildren();
    };
    self.notifyChildren = function() {
        angular.forEach(self.aggChildren, function(child) {
            child.hidden = self.collapsed;
            if (self.collapsed) {
                child.setExpand(self.collapsed);
            }
        });
        angular.forEach(self.children, function(child) {
            child[NG_HIDDEN] = self.collapsed;
        });
        rowFactory.rowCache = [];
        var foundMyself = false;
        angular.forEach(rowFactory.aggCache, function(agg, i) {
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
    self.totalChildren = function() {
        if (self.aggChildren.length > 0) {
            var i = 0;
            var recurse = function(cur) {
                angular.forEach(cur, function (a) {
                    if (a.aggChildren.length > 0) {
                        recurse(a.aggChildren);
                    } else {
                        i += a.children.length;
                    }
                });
            };
            recurse(self.aggChildren);
            return i;
        } else {
            return self.children.length;
        }
    };
}; 