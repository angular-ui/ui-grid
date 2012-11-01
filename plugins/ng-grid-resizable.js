ngGridResizable = function () {
    var self = this;
    self.$scope = null;
    self.$gridScope = null;
    self.myGrid = null;
    self.init = function(scope, grid) {
        self.$scope = scope;
        self.$gridScope = scope.$parent;
        self.myGrid = grid;
    };
};
