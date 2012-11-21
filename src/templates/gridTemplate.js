/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.defaultGridTemplate = function () {
    var b = new ng.utils.StringBuilder();
    b.append('<div ng-class="{\'ui-widget\': jqueryUITheme}">');
    b.append('	 <div class="ngTopPanel" ng-class="{\'ui-widget-header\':jqueryUITheme, \'ui-corner-top\': jqueryUITheme}" ng-style="topPanelStyle()">');
    b.append('	 	<div class="ngGroupPanel" ng-show="showGroupPanel()" ng-style="headerStyle()">');
	b.append('	 		<div class="ngGroupPanelDescription" ng-show="configGroups.length == 0">Drag a column header here and drop it to group by that column</div>');
	b.append('	 		<ul ng-show="configGroups.length > 0" class="ngGroupList">');
	b.append('	 			<li class="ngGroupItem" ng-repeat="group in configGroups"><span class="ngGroupElement"><span class="ngGroupName">{{group.displayName}}<span ng-click="removeGroup($index)" class="ngRemoveGroup">x</span></span><span ng-hide="$last" class="ngGroupArrow"></span></span></li>');
	b.append('	 		</ul>');
	b.append('	 	</div>');
	b.append('      <div class="ngHeaderContainer" ng-style="headerStyle()">');
	b.append('         <div class="ngHeaderScroller" ng-style="headerScrollerStyle()" ng-header-row></div>');
	b.append('    	</div>');
	b.append('      <div class="ngHeaderButton" ng-show="showColumnMenu" ng-click="toggleShowMenu()"><div class="ngHeaderButtonArrow" ng-click=""></div></div>');
	b.append('      <div ng-show="showMenu" class="ngColMenu"><div><input ng-show="showFilter" placeholder="Seach Field:Value" type="text" ng-model="filterText"/></div><span class="ngMenuText">Choose Columns:</span><ul class="ngColList"><li class="ngColListItem" ng-repeat="col in columns | ngColumns"><label><input type="checkbox" class="ngColListCheckbox" ng-model="col.visible"/> {{col.displayName}}</label></li></ul></div>');
	b.append('	 </div>');
	b.append('	 <div class="ngViewport" ng-class="{\'ui-widget-content\': jqueryUITheme}" ng-style="viewportStyle()">');
    b.append('    	 <div class="ngCanvas" ng-style="canvasStyle()">');
    b.append('           <div ng-style="rowStyle(row)" ng-repeat="row in renderedRows" ng-click="row.toggleSelected($event)" class="ngRow" ng-class="{\'selected\': row.selected}" ng-class-odd="row.alternatingRowClass()" ng-class-even="row.alternatingRowClass()" ng-row></div>');
    b.append('       </div>');
    b.append('	 </div>');
    b.append('	 <div class="ngFooterPanel" ng-class="{\'ui-widget-content\': jqueryUITheme, \'ui-corner-bottom\': jqueryUITheme}" ng-style="footerStyle()">');
    b.append('       <div class="ngTotalSelectContainer" ng-show="footerVisible">');
    b.append('           <div class="ngFooterTotalItems" ng-class="{\'ngNoMultiSelect\': !multiSelect}" >');
    b.append('          		 <span class="ngLabel">Total Items: {{totalItemsLength()}}</span><span ng-show="filterText.length > 0" class="ngLabel">(Showing Items: {{totalFilteredItemsLength()}})</span>');
    b.append('       	 </div>');
    b.append('       	 <div class="ngFooterSelectedItems" ng-show="multiSelect">');
    b.append('       	    <span class="ngLabel">Selected Items: {{selectedItems.length}}</span>');
    b.append('       	 </div>');
    b.append('       </div>');
    b.append('       <div class="ngPagerContainer" style="float: right; margin-top: 10px;" ng-show="footerVisible && enablePaging" ng-class="{\'ngNoMultiSelect\': !multiSelect}">');
    b.append('          <div style="float:left; margin-right: 10px;" class="ngRowCountPicker">');
    b.append('             <span style="float: left; margin-top: 3px;" class="ngLabel">Page Size:</span>');
    b.append('             <select style="float: left;height: 27px; width: 100px" ng-model="pagingOptions.pageSize" >');
    b.append('                <option ng-repeat="size in pagingOptions.pageSizes">{{size}}</option>');
    b.append('             </select>');
    b.append('          </div>');
    b.append('          <div style="float:left; margin-right: 10px; line-height:25px;" class="ngPagerControl" style="float: left; min-width: 135px;">');
    b.append('             <button class="ngPagerButton" ng-click="pageToFirst()" ng-disabled="cantPageBackward()" title="First Page"><div class="ngPagerFirstTriangle"><div class="ngPagerFirstBar"></div></div></button>');
    b.append('             <button class="ngPagerButton" ng-click="pageBackward()" ng-disabled="cantPageBackward()" title="Previous Page"><div class="ngPagerFirstTriangle ngPagerPrevTriangle"></div></button>');
    b.append('             <input class="ngPagerCurrent" type="text" style="width:50px; height: 24px; margin-top: 1px; padding: 0px 4px;" ng-model="pagingOptions.currentPage"/>');
    b.append('             <button class="ngPagerButton" ng-click="pageForward()" ng-disabled="cantPageForward()" title="Next Page"><div class="ngPagerLastTriangle ngPagerNextTriangle"></div></button>');
    b.append('             <button class="ngPagerButton" ng-click="pageToLast()" ng-disabled="cantPageForward()" title="Last Page"><div class="ngPagerLastTriangle"><div class="ngPagerLastBar"></div></div></button>');
    b.append('          </div>');
    b.append('       </div>');
    b.append('   </div>');
    b.append('</div>');
    return b.toString();
};