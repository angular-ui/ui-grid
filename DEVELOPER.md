# UI Grid : An Angular data grid

# Welcome

Thanks for considering contributions to the ui-grid project. This doc will give you a jump start on the development standards we use.

# Code Structure
The development goal of ui-grid (ng-grid 3.0) is a fast, testable, and extensible grid component.

The core angular module (ui.grid) provides the basics
 - Virtualization
 - Row Selection

Everything else should be added as new angular modules unless the grid team agrees that it's a core feature.

## Feature module design
* We prefer no 3rd party dependencies other than angular. Contact grid team if you have a 3rd party need that can't be avoided.
* jQuery is only used in Unit Tests
* unit test your code! not that hard. see test/unit for examples. Features will be rejected if the test coverage isn't adequate.
* use ngDoc to document how to use your feature.  see examples in existing code.
* New module should be named ui.grid.feature
* feature folder is added below src/js
* One js file per feature
* no global variables
* design and code the angular way. What do we main by that? Dependency injection, small directives, emphasis the model, not the DOM, tests!
* feature.js contains an enclosure:

```javascript
(function () {
  'use strict';
  var module = angular.module('ui.grid.feature', ['ui.grid']);
})();

```

* Constants should be added to module.constants.  Anytime a value is used in more than one place, consider a constant.

```javascript
  module.constant('uiGridFeatureConstants', {
    FEATURE_CONSTANT1: 'abc',
    featureGroupConstant: {
      GROUP_ONE: 'somevalue',
      GROUP_TWO: 'a'
    }
  });
```

* To add functionality to the core, there are several extension points

#####During Grid controller initialization
Here you can do the following:
######columnBuilder 
ColumnBuilder functions allow you to add your own properties / functions to each GridCol object. for
testing ease, it's best to create a service that returns the function.  See ui.grid.edit unit tests on how to easily test your function

```javascript
  module.service('uiGridFeatureService', ['$log', '$q', '$templateCache',
    function ($log, $q, $templateCache) {
      var service = {
        featureColumnBuilder: function (colDef, col, gridOptions) {
          //add any promises to an array
          var promises = [];
          //do something with col
          col.featureProp = colDef.featureProp || 'default';

          //return all promises (works even if the array is empty)
          return $q.all(promises);
        }
     }
     return service;
   }]);
```

######rowBuilder 
RowBuilder functions allow you to add your own properties / functions to each GridRow object. Again, it's
 best to implement function in a service.  See ui.grid.edit unit tests on how to easily test your function

```javascript
        ....
        featureRowBuilder: function (row, gridOptions) {
          //add any promises to an array
          var promises = [];
          //do something with col
          row.featureProp = gridOptions.featureProp || 'default';

          //return all promises (works even if the array is empty)
          return $q.all(promises);
        }
        ....
```

###### Create a directive that will be added to the same element as ui-grid
<div ui-grid ui-grid-feature></div>

Require the uiGrid controller from a parent directive. in the preLink function, register your
column and row builders.  See ui.grid.edit unit tests on how to easily test your directive

```javascript
  module.directive('uiGridFeature', ['uiGridFeatureService', function (uiGridEditService) {
    return {
      replace: true,
      priority: 0, // this could be tweaked to fire your directive before/after other features
      require: '^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            uiGridCtrl.grid.registerColumnBuilder(uiGridFeatureService.featureColumnBuilder);
            uiGridCtrl.grid.registerRowBuilder(uiGridFeatureService.featureRowBuilder);
            //do anything else you can safely do here
            //!! of course, don't stomp on core grid logic or data
          }
        };
      }
    };
  }]);
```

#####Directive Stacking
The next extension point requires some knowledge of the core grid directives. Thanks to a little known feature in angular,
you can stack your feature directives before or after one of the core grid directives.  Simply use the same directive name
and change the priority to a negative number (to execute after) or a positive number (to execute before)

Here's an example of augmenting the uiGridCell directive to add some element to a grid cell
```javascript
module.directive('uiGridCell', ['uiGridFeatureService',
  function (uiGridCellNavService) {
    return {
      priority: -500, // run after default uiGridCell directive
      restrict: 'A',
      require: '^uiGrid',
      scope: false,
      link: function ($scope, $elm, $attrs, uiGridCtrl) {

        if ($scope.col.featureProp === 'somevalue' && $scope.row.featureProp === 'somevalue') {
          $elm.find('div').attr("someattrib", 0);
        }

        //add whatever dom binding, manipulation,etc that is safe to do and performs well
      }
    };
  }]);
```

##### Tutorials
Add a tutorial showing how to use your feature. Copy one of the existing misc/tutorial files, change the name at the top and configure it for your feature.  'grunt dev' and your tutorial is available on http://localhost:9003/docs/#/tutorial.
Deployment to http://ui-grid.info/ is done automatically when pushed to ui-grid github.

# Coding style

1. No tabs
2. Indentions are 2 spaces
3. Spaces are preferred between args, keywords, blocks
   function (uiGridCellNavService, $log){
   instead of
   function(uiGridCellNavService,$log){
4. jshint rules are enforced.  run 'grunt dev --no-e2e' to see if your code passes (the --no-e2e switch turns off end-to-end testing, which can making development slow. You should still run e2e tests before you push commits!)
5. Module names should follow Angular's camelcase format, e.g. "resizeColumns", not "resize-columns".

