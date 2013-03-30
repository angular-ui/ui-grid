var ngAggregate = function (aggEntity, rowFactory, rowHeight) {
    var self = this;
    self.rowIndex = 0;
    self.offsetTop = self.rowIndex * rowHeight;
    self.entity = aggEntity;
    self.label = aggEntity.gLabel;
    self.field = aggEntity.gField;
    self.depth = aggEntity.gDepth;
    self.parent = aggEntity.parent;
    self.children = aggEntity.children;
    self.aggChildren = aggEntity.aggChildren;
    self.aggIndex = aggEntity.aggIndex;
    self.collapsed = true;
    self.isAggRow = true;
    self.offsetleft = aggEntity.gDepth * 25;
    self.aggLabelFilter = aggEntity.aggLabelFilter;
    self.toggleExpand = function() {
        self.collapsed = self.collapsed ? false : true;
        if (self.orig) {
            self.orig.collapsed = self.collapsed;
        }
        self.notifyChildren();
    };
    self.setExpand = function(state) {
        self.collapsed = state;
        self.notifyChildren();
    };
    self.notifyChildren = function () {
        var longest = Math.max(rowFactory.aggCache.length, self.children.length);
        for (var i = 0; i < longest; i++) {
            if (self.aggChildren[i]) {
                self.aggChildren[i].entity[NG_HIDDEN] = self.collapsed;
                if (self.collapsed) {
                    self.aggChildren[i].setExpand(self.collapsed);
                }
            }
            if (self.children[i]) {
                self.children[i][NG_HIDDEN] = self.collapsed;
            }
            if (i > self.aggIndex && rowFactory.aggCache[i]) {
                var agg = rowFactory.aggCache[i];
                var offset = (30 * self.children.length);
                agg.offsetTop = self.collapsed ? agg.offsetTop - offset : agg.offsetTop + offset;
            }
        };
        rowFactory.renderedChange();
    };
    self.aggClass = function() {
        return self.collapsed ? "ngAggArrowCollapsed" : "ngAggArrowExpanded";
    };
    self.totalChildren = function() {
        if (self.aggChildren.length > 0) {
            var i = 0;
            var recurse = function(cur) {
                if (cur.aggChildren.length > 0) {
                    angular.forEach(cur.aggChildren, function(a) {
                        recurse(a);
                    });
                } else {
                    i += cur.children.length;
                }
            };
            recurse(self);
            return i;
        } else {
            return self.children.length;
        }
    };
    self.copy = function () {
        var ret = new ngAggregate(self.entity, rowFactory, rowHeight);
        ret.orig = self;
        return ret;
    };
};