var ngDomAccessProvider = function (grid) {
    this.previousColumn = null;
    this.grid = grid;

};

var changeUserSelect = function (elm, value) {
    elm.css({
        '-webkit-touch-callout': value,
        '-webkit-user-select': value,
        '-khtml-user-select': value,
        '-moz-user-select': value === 'none' ? '-moz-none' : value,
        '-ms-user-select': value,
        'user-select': value
    });
};

ngDomAccessProvider.prototype.selectInputElement = function (elm) {
    var node = elm.nodeName.toLowerCase();
    if (node === 'input' || node === 'textarea') {
        elm.select();
    }
};
ngDomAccessProvider.prototype.focusCellElement = function ($scope, index) { 
    if ($scope.selectionProvider.lastClickedRow) {
        var columnIndex = index !== undefined ? index : previousColumn;
        var elm = $scope.selectionProvider.lastClickedRow.clone ? $scope.selectionProvider.lastClickedRow.clone.elm : $scope.selectionProvider.lastClickedRow.elm;
        if (columnIndex !== undefined && elm) {
            var columns = angular.element(elm[0].children).filter(function () { return this.nodeType !== 8; }); //Remove html comments for IE8
            var i = Math.max(Math.min($scope.renderedColumns.length - 1, columnIndex), 0);
            if (this.grid.config.showSelectionCheckbox && angular.element(columns[i]).scope() && angular.element(columns[i]).scope().col.index === 0) {
                i = 1; //don't want to focus on checkbox
            }
            if (columns[i]) {
                columns[i].children[0].focus();
            }
            previousColumn = columnIndex;
        }
    }
};
ngDomAccessProvider.prototype.selectionHandlers = function ($scope, elm) {
    var doingKeyDown = false;
    elm.bind('keydown', function (evt) {
        if (evt.keyCode === 16) { //shift key
            changeUserSelect(elm, 'none', evt);
            return true;
        } else if (!doingKeyDown) {
            doingKeyDown = true;
            var ret = ngMoveSelectionHandler($scope, elm, evt, this.grid);
            doingKeyDown = false;
            return ret;
        }
        return true;
    });
    elm.bind('keyup', function (evt) {
        if (evt.keyCode === 16) { //shift key
            changeUserSelect(elm, 'text', evt);
        }
        return true;
    });
};