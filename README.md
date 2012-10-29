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

ng-grid is in pre-alpha release currently. We are going to be adding more features here in the very near future...

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
	$scope.myOptions = { data: myData };
};

```

##Want More?##
Check out the [Getting Started](https://github.com/Crash8308/ng-grid/wiki/Getting-Started) and other [Docs](https://github.com/Crash8308/ng-grid/wiki)

##Examples##
Coming soon...

##Change Log##