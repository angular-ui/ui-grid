#ngGrid : An Angular DataGrid#

__Contributors:__

ng-grid Team:
* [Tim Sweet](http://ornerydevelopment.blogspot.com/)
* [Jonathon Ricaurte](https://github.com/xcrico)

Based on koGrid:
* [Eric M. Barnard](https://github.com/ericmbarnard/KoGrid)
 
License: [MIT](http://www.opensource.org/licenses/mit-license.php)

Dependencies: jQuery & angular.js. (JqueryUi draggable for non-HTML5 compliant browsers to use awesome aggregate feature)
***
##About##
__ng-grid__ Originally built on knockout we wanted to port it to angular.

version 1.0

***
##Roadmap##

ng-grid is version 1.0 release.

We are going to be adding more features here as we head to a 1.1 release, including:

* Ability to hide-show columns on the fly
* Builtin filtering support
* Virtualized column scrolling
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
Examples are found [here](http://timothyswt.github.com/ng-grid/examples) 
##Examples##
Coming soon...

##Change Log##\
* __2012-11-14__ - Version 1.0.0 Release