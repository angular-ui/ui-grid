#ngGrid : An Angular DataGrid#

__Contributors:__

ng-grid Team:
* [Tim Sweet](http://ornerydevelopment.blogspot.com/)
* [Jonathon Ricaurte](https://github.com/xcrico)

Based originally on koGrid:
* [Eric M. Barnard](https://github.com/ericmbarnard/KoGrid)
 
License: [MIT](http://www.opensource.org/licenses/mit-license.php)

Dependencies: jQuery & angular.js. (JqueryUi draggable for non-HTML5 compliant browsers to use awesome Drag-N-Drop aggregate feature. However, you can still groupby without draggability)
***
##About##
__ng-grid__ Originally built on knockout we wanted to port it to angular.

version 1.3.2

***
##Roadmap##

ng-grid is version 1.3.2 release.

We are going to be adding more features here as we head to a 1.4 release, including:

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
Check out the [Getting Started](https://github.com/timothyswt/ng-grid/wiki/Getting-started) and other [Docs](https://github.com/timothyswt/ng-grid/wiki)

##Examples##
[Hideous Examples](http://timothyswt.github.com/ng-grid/examples)

##Change Log##
* __2012-11-27__ - Version 1.3.2 - Changed default width behavior to use *s and added option to maintain column ratios while resizing
* __2012-11-27__ - Version 1.3.1 - Added layout plugin. Support for uri templates. Performance improvements.
* __2012-11-23__ - Version 1.3.0 - Major code refactoring, can now group-by using column menu, changes to build
* __2012-11-21__ - Version 1.2.2 - Built-in filtering support, numerous perfomance enhancements and minor code refactoring
* __2012-11-20__ - Version 1.2.1 - Added ability to specify property "paths" as fields and for grid options.
* __2012-11-19__ - Version 1.2.0 - Added Server-Side Paging support and minor bug fixes.
* __2012-11-17__ - Version 1.1.0 - Added ability to hide/show columns and various bug fixes/performance enhancements.
* __2012-11-14__ - Version 1.0.0 Release