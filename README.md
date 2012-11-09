#ngGrid : An Angular DataGrid#

__Contributors:__

ng-grid Team:
* [Tim Sweet](http://ornerydevelopment.blogspot.com/)
* [Jonathon Ricaurte](https://github.com/xcrico)

Based on koGrid:
* [Eric M. Barnard](https://github.com/ericmbarnard/KoGrid)
 
License: [MIT](http://www.opensource.org/licenses/mit-license.php)

Dependencies: jQuery & angular.js
***
##About##
__ng-grid__ Originally built on knockout we wanted to port it to angular.


##Disclaimer##

ng-grid is in pre-beta release currently. We are going to be adding more features here as we head to a 1.0 release.

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
	// you can also specify data as: $scope.myOptions = { data: 'myData' }. 
	// However, updates to the underlying data will not be reflected in the grid
};

```

##Want More?##
Check out the [Getting Started](https://github.com/timothyswt/ng-grid/wiki/Getting-started) and other [Docs](https://github.com/timothyswt/ng-grid/wiki)

##Examples##
Coming soon...

##Change Log##