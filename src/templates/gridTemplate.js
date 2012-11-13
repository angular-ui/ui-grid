/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.defaultGridTemplate = function () {
    var b = new ng.utils.StringBuilder();
    b.append('<div class="ui-widget">');
    b.append('	 <div class="ngTopPanel ui-widget-header ui-corner-top" ng-style="topPanelSize()">');
	b.append('	 	<div class="ngGroupPanel" ng-show="showGroupPanel()" ng-style="headerSize()">');
	b.append('	 		<div class="ngGroupPanelDescription" ng-show="configGroups.length == 0">Drag a column header here and drop it to group by that column</div>');
	b.append('	 		<ul ng-show="configGroups.length > 0" class="ngGroupList">');
	b.append('	 			<li class="ngGroupItem" ng-repeat="group in configGroups"><span class="ngGroupElement"><span class="ngGroupName">{{group.displayName}}<span ng-click="removeGroup($index)" class="ngRemoveGroup">x</span></span><span ng-hide="$last" class="ngGroupArrow"></span></span></li>');
	b.append('	 		</ul>');
	b.append('	 	</div>');
    b.append('      <div class="ngHeaderContainer" ng-style="headerSize()">');
    b.append('         <div class="ngHeaderScroller" ng-style="headerScrollerSize()" ng-header-row></div>');
    b.append('    	</div>');
    b.append('	 </div>');
    b.append('	 <div class="ngViewport ui-widget-content" ng-style="viewportSize()">');
    b.append('    	 <div class="ngCanvas" ng-style="canvasHeight()">');
    b.append('           <div ng-style="rowStyle(row)" ng-repeat="row in renderedRows" ng-click="row.toggleSelected($event)" class="ngRow" ng-class="{\'selected\': row.selected}" ng-class-odd="row.alternatingRowClass()" ng-class-even="row.alternatingRowClass()" ng-row></div>');
    b.append('       </div>');
    b.append('	 </div>');
    b.append('	 <div class="ngFooterPanel ui-widget-content ui-corner-bottom" ng-style="footerSize()">');
    b.append('   	 <div class="ngTotalSelectContainer" ng-show="footerVisible">');
    b.append('           <div class="ngFooterTotalItems" ng-class="{\'ngNoMultiSelect\': !multiSelect}" >');
    b.append('          		 <span class="ngLabel">Total Items: {{totalItemsLength()}}</span>');
    b.append('       	 </div>');
    b.append('       	 <div class="ngFooterSelectedItems" ng-show="multiSelect">');
    b.append('       	    <span class="ngLabel">Selected Items: {{selectedItems.length}}</span>');
    b.append('       	 </div>');
    b.append('       </div>');
    b.append('   </div>');
    b.append('</div>');
    return b.toString();
};