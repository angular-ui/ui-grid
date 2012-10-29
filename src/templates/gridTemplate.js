/// <reference path="../../lib/jquery-1.8.2.min" />
/// <reference path="../../lib/angular.js" />
/// <reference path="../constants.js"/>
/// <reference path="../namespace.js" />
/// <reference path="../navigation.js"/>
/// <reference path="../utils.js"/>

ng.defaultGridTemplate = function (options) {
    var b = new ng.utils.StringBuilder();
    b.append('<div class="ngGrid">');
    b.append('	 <div class="ngTopPanel" ng-size="headerDim">');
    b.append(    	'<div class="ngHeaderContainer" ng-size="headerDim">');
    b.append(        	'<div class="ngHeaderScroller" ng-size="headerScrollerDim">');
    b.append(             	'<div unselectable="on" ng-repeat="col in columns" class="ngHeaderCell {{columnClass($index)}}" ng-style="headerCellSize(col)">');
    b.append(                 	'<div ng-click="col.sort()" ng-class="{ \'ngSorted\': !noSortVisible }">');
    b.append(                   	 '<span class="ngHeaderText">{{col.displayName}}</span>');
    b.append(                   	 '<div class="ngSortButtonDown" ng-show="col.showSortButtonDown()"></div>');
    b.append(                   	 '<div class="ngSortButtonUp" ng-show="col.showSortButtonUp()"></div>');
    b.append(                	 '</div>');
    b.append(                	 '<div class="ngHeaderGrip" ng-show="allowResize" ng-mouseDown="gripOnMouseDown()"></div>');
    b.append(                 	 '<div ng-show="_filterVisible">');
    b.append(                     	'<input type="text" ng-model="col.filter" style="width: 80%" tabindex="1" />');
    b.append(                 	 '</div>');
    b.append(             	 '</div>');
    b.append(        	 '</div>');
    b.append(    	 '</div>');
    b.append(	 '</div>');
    b.append(	 '<div class="ngViewport" ng-size="viewportDim">');
    b.append(    	 '<div class="ngCanvas" style="height: {{canvasHeight()}};">'); 
    b.append(            '<div style="height: 30px; top: {{row.offsetTop}}px; width: {{totalRowWidth()}}" ng-repeat="row in renderedRows" ng-click="row.toggleSelected(row,$event)" ng-class="{\'selected\': row.selected}" class="ngRow" ng-class-odd="row.class()" ng-class-even="row.class()">');
    b.append(        	    '<div ng-repeat="col in columns" style="width: {{col.width}}px" class="ngCell {{columnClass($index)}} {{col.cellClass}}">{{row.entity[col.field]}}</div>');
    b.append(        	 '</div>');
    b.append(   	 '</div>');
    b.append(	 '</div>');
    b.append(	 '<div class="ngFooterPanel" ng-size="footerDim">');
    b.append(   	 '<div class="ngTotalSelectContainer" ng-show="footerVisible">');
    b.append(       	 '<div class="ngFooterTotalItems" ng-class="{\'ngNoMultiSelect\': !multiSelect}" >');
    b.append(          		 '<span class="ngLabel">Total Items: {{totalItemsLength()}}</span>');
    b.append(       	 '</div>');
    b.append(       	 '<div class="ngFooterSelectedItems" ng-show="multiSelect">');
    b.append(       	 '<span class="ngLabel">Selected Items: {{selectedItems.length}}</span>');
    b.append(       	 '</div>');
    b.append(   	 '</div>');
    b.append(	 '</div>');
    b.append('</div>');
    return b.toString();
};