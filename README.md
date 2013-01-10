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

version 1.6.2

[nuGet](https://nuget.org/packages/ng-grid)


Questions, Comments, Complaints? feel free to email us at nggridteam@gmail.com

***
##Roadmap##

We are going to be adding more features here as we head to a 2.0 release, including:

* Virtualized column scrolling
* "Fixed" column option (columns not affected by horizontal scrolling)
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
                     {name: "Tiancum", age: 43},
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
[Examples](http://angular-ui.github.com/ng-grid/#/examples)

##Change Log##
* __2012-01-09__ - Version 1.6.2 - Merged changes to have two-way data-binding work in templates, so if you're using a celltemplate, you can now use COL_FIELD instead of row.getProperty(col.field). row.getProperty is still in the row class for accessing other row values.
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
