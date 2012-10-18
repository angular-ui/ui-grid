/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.templates.generateHeaderTemplate = function ($scope) {
    var b = new ng.utils.StringBuilder();
    b.append('<div>');
    angular.forEach($scope.columns, function (col, i) {
        if (col.field === SELECTED_PROP) {
            b.append('<div class="kgSelectionCell kgHeaderCell col{0} kgNoSort">', col.index);
            b.append('  <input type="checkbox" ng-checked="toggleSelectAll()"/>');
            b.append('</div>');
        } else if (col.field === 'rowIndex' && $scope.showFilter) {
            b.append('<div class="kgHeaderCell col{0} kgNoSort">', col.index);
            b.append('      <div title="Filter Results" class="kgFilterBtn openBtn" ng-hide="filterVisible" ng-click="showFilter_Click()"></div>');
            b.append('      <div title="Close" class="kgFilterBtn closeBtn" ng-show="filterVisible" ng-click="showFilter_Click()"></div>');
            b.append('      <div title="Clear Filters" class="kgFilterBtn clearBtn" ng-show="filterVisible" ng-click="clearFilter_Click()"></div>');
            b.append('</div>');
        } else {
            b.append('<div class="kgHeaderCell col{0}" ng-style="{ width: colWidth }" ng-class="{ \'kgNoSort\': {1} }">{{field}}</div>', col.index, !col.allowSort);
        }
    });
    b.append('</div>');
    return b.toString();
};