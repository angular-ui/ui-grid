#ng-grid : An Angular DataGrid#

__Contributors:__

ng-grid Team:
* [Tim Sweet](http://ornerydevelopment.blogspot.com/)
* [Jonathon Ricaurte](https://github.com/jonricaurte)
 
License: [MIT](http://www.opensource.org/licenses/mit-license.php)

Dependencies: jQuery & angular.js. (JqueryUi draggable for non-HTML5 compliant browsers to use awesome Drag-N-Drop aggregate feature. However, you can still groupby without draggability)
***
##About##
__ng-grid__ Originally built on knockout we wanted to port it to angular.

version 2.0.2

[nuGet](https://nuget.org/packages/ng-grid)


Questions, Comments, Complaints? feel free to email us at nggridteam@gmail.com

***
##Roadmap##

We are going to be adding more features here as we head to a 3.0 release, including:

* Anything else the rest of the community wants to contribute that isn't a terrible idea. :)

***
_The bare bones_:

```html
<script type="text/javascript" src="angular.js"></script>
<script type="text/javascript" src="ng-grid.js"></script>
<script>
    angular.module('myApp',['ngGrid', ... {other includes}]);
</script>
<link rel="stylesheet" type="text/css" href="../ng-grid.css" /> 
<body ng-app="myApp">
    <div ng-grid="myOptions"></div>
<body>
```
```javascript
// Define your own controller somewhere..
function MyCtrl($scope) {
	$scope.myData = [{name: "Moroni", age: 50},
                     {name: "Teancum", age: 43},
                     {name: "Jacob", age: 27},
                     {name: "Nephi", age: 29},
                     {name: "Enos", age: 34}];
	$scope.myOptions = { data: 'myData' };
	// you can also specify data as: $scope.myOptions = { data: $scope.myData }. 
	// However, updates to the underlying data will not be reflected in the grid
};

```

##Want More?##
Check out the [Getting Started](https://github.com/angular-ui/ng-grid/wiki/Getting-started) and other [Docs](https://github.com/angular-ui/ng-grid/wiki)

##Examples##
[Examples](http://angular-ui.github.com/ng-grid/)

##Change Log##
* __2013-03-08__ - Version 2.0.2 - minor bugfixes, updating some plugins.
* __2013-03-05__ - Version 2.0.1 - Moved to grunt build system. No more international version; all languages are included by default. Fixed minor grouping display issue. Using $templateCache for templates instead of global namespace.
* __2013-03-05__ - Version 2.0.0 - Breaking Changes: see documentation (showSelectionBox, enableRowSelection, showFooter). Column Virtualization added. Row virtualization performance improved. Excel-like editing instead of enableFocusedCellEdit.
* __2013-02-18__ - Version 1.9.0 - Aggregates now display correctly. Added more option methods to select and group data (see wiki), Added column pinning.
* __2013-02-11__ - Version 1.8.0.hotfix - Fixes for multi-level grouping and adding the gridId to both the grid options and as argument to the "ngGridEventData" so you can identify what grid it came from.
* __2013-02-07__ - Version 1.8.0 - Major architectural changes which greatly improves performance. virtualizationThreshold now controlls when virtualization is force-enabled and is user-specified in options.
* __2013-02-06__ - Version 1.7.1 - Fixed bug with selections and multiple grids. New emit message for notifying when hitting bottom of viewport. Can disable virtualization. ng-grid virtualization is on by default, but can be disabled if there are less than 50 rows in the grid. Anything > 50 rows virtualization is forced on for performance considerations.
* __2013-02-05__ - Version 1.7.0 - BREAKING CHANGES: Will add examples. Adding cell selection, navigation, and edit on focus. Added programmatic selections. Improved scrolling. ngGridEvents changed/added: see wiki.
* __2013-01-17__ - Version 1.6.3 - Can now highlight/copy text in grid. Fixed multiple issues when using multiselect along with shift key. Refactored key events so now they are all in the same directive for viewport. Hovering over highlightable text will change cursors in viewport. Fixed #93.
* __2013-01-09__ - Version 1.6.2 - Merged changes to have two-way data-binding work in templates, so if you're using a celltemplate, you can now use COL_FIELD instead of row.getProperty(col.field). row.getProperty is still in the row class for accessing other row values.
* __2013-01-08__ - Version 1.6.1 - Adding ability to preselect rows. Can deselect when multiSelect:false. Bug fixes/merging pull requests. Bower now works. Can now sync external search with ng-grid internal search. Check out other examples on examples page.
* __2012-12-27__ - Version 1.6.0 - Adding i18n support and support for different angularjs interpolation symbols (requires building from source).
* __2012-12-20__ - Version 1.5.0 - Modifying the way we watch for array changes. Added groupable column definition option. Bugfixes for #58, #59.
* __2012-12-18__ - Version 1.4.1 - jslint reformat, minor bugfixes, performance improvements while keydown navigating, adding "use strict" to script.
* __2012-12-12__ - Version 1.4.0 - Massive improvements to search thanks to [iNeedFat](https://github.com/ineedfat)!
* __2012-12-12__ - Version 1.3.9 - Refactored and removed unneeded code. Added scope events.
* __2012-12-12__ - Version 1.3.7 - Improving template compilation and fixing jquery theme support. Improving comments on grid options.
* __2012-12-06__ - Version 1.3.6 - sortInfo can now be set to default sort the grid. Improvements to the beforeSelectionChange callback mechanism when multi-selecting.
* __2012-12-06__ - Version 1.3.5 - Improved template rendering when using external template files. columnDefs can now be a $scope object which can be push/pop/spliced. Fixed box model for cells and header cells.
* __2012-12-04__ - Version 1.3.4 - Improved aggregate grouping, minor bugfixes. Auto-width works!
* __2012-11-27__ - Version 1.3.2 - Changed default width behavior to use *s and added option to maintain column ratios while resizing
* __2012-11-27__ - Version 1.3.1 - Added layout plugin. Support for uri templates. Performance improvements.
* __2012-11-23__ - Version 1.3.0 - Major code refactoring, can now group-by using column menu, changes to build
* __2012-11-21__ - Version 1.2.2 - Built-in filtering support, numerous perfomance enhancements and minor code refactoring
* __2012-11-20__ - Version 1.2.1 - Added ability to specify property "paths" as fields and for grid options.
* __2012-11-19__ - Version 1.2.0 - Added Server-Side Paging support and minor bug fixes.
* __2012-11-17__ - Version 1.1.0 - Added ability to hide/show columns and various bug fixes/performance enhancements.
* __2012-11-14__ - Version 1.0.0 Release
