# UI Grid : An Angular data grid

# Welcome

Thanks for considering contributions to the ui-grid project. This doc will give you a jump start on the development standards we use.

# Running Dev Server
Grunt task dev will run jshint, compile less, run fontella, run unit tests, run protractor tests, and start a local
webserver on port 9003.  A watch is started to rerun all the tasks if any source file changes.

<br>
```
grunt dev
```
<br>
http://localhost:9003/docs/#/tutorial to browse each tutorial. 

<br/>options
<br/> no-e2e - eliminate protractor tests
<br/> angular=n.n.n - specify a specify angular version to run unit tests against
<br/> core - run only the tests for the core code, skip features
<br/> fast - alias for --no-e2e --core --angular=1.7.0

```
grunt dev --no-e2e --angular=1.7.0
```

# Code Structure
The development goal of ui-grid (ng-grid 3.0) is a fast, testable, and extensible grid component.

The core angular module (ui.grid) provides the basics
 - Virtualization
 - Row Selection

Everything else should be added as new angular modules unless the grid team agrees that it's a core feature. All new feature
modules should be developed as plugins, and be hosted in their own repositories. There is a great [blog post](http://brianhann.com/write-your-own-ui-grid-plugin/)
about developing a plugin for ui-grid. Your plugin should use the available publicApi, if you need something in the publicApi that isn't
currently exposed, we welcome pull requests.

The grid team has limited time to spend on this project, and as the list of features grows, so does the effort required to support
 those features. In a future release we will be working to move some of the existing features out of the core repository. The basic
 rule of thumb for any new features is: "If it is possible to implement it as a plugin, it should be a plugin".

## Feature module design
* We prefer no 3rd party dependencies other than angular.
* jQuery is only used in Unit Tests
* unit test your code! not that hard. see test/unit for examples. Features will be rejected if the test coverage isn't adequate.
* use ngDoc to document how to use your feature.  see examples in existing code.
* no global variables
* public methods and events are registered in grid.api (more on that later)
* design and code the angular way. What do we mean by that? Dependency injection, small directives, emphasis the model, not the DOM, tests!
* feature.js contains an enclosure:

```javascript
(function () {
  'use strict';
  var module = angular.module('ui.grid.feature', ['ui.grid']);
})();

```
* Constants should be added to module.constants.  Anytime a value is used in more than one place, consider a constant.

### Folder layout
This folder layout is required to work with build tools
<br/>src/featureName
<br/>      /js
<br/>      /less
<br/>      /test

### File patterns
All test files must be name.spec.js to get picked up by our grunt tasks


## Feature module pattern
This pattern has been used in several features and seems to work well.

### Constants
Any magic strings, etc.

```javascript
  module.constant('uiGridFeatureConstants', {
    FEATURE_CONSTANT1: 'abc',
    featureGroupConstant: {
      GROUP_ONE: 'somevalue',
      GROUP_TWO: 'a'
    },
    //available public events; listed here for convenience and IDE's use it for smart completion
    publicEvents: {
      featureName : {
        event1 : function(scope, newRowCol, oldRowCol){},
        event2 : function(scope){}
      }
    }
  });
```
### Service
Anything suited to an angular service. So much easier to unit test logic here than logic in a directive or controller.
```javascript
  module.service('uiGridFeatureService', ['uiGridFeatureConstants'
    function (uiGridFeatureConstants) {
      var service = {
        somethingUseful: function () {}
     }
     return service;
   }]);
```
### Feature Directive
The main entry point for your feature.
```javascript
  module.directive('uiGridFeature', ['uiGridFeatureService', 'uiGridFeatureConstants',
   function (uiGridEditService, uiGridFeatureConstants) {
    return {
      restrict: 'A',
      replace: true,
      priority: 0, // this could be tweaked to fire your directive before/after other features
      require: 'uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl, uiGridFeatureService) {
            //register your feature cols and row processors with uiGridCtrl.grid
            //do anything else you can safely do here
            //!! of course, don't stomp on core grid logic or data
            //namespace any properties you need on grid
            //a good pattern is to have a service initializeGrid function
            uiGridFeatureService.initializeGrid(uiGridCtrl.grid);
          }
        };
      }
    };
  }]);
```


### State
Any state that your feature needs should be added to the appropriate model and namespaced with your feature name.
An InitializeGrid function on your feature service makes a nice pattern to add state to grid
```
  //grid level state
  grid.featureName = {};
  grid.featureName.someProperty = 'xyz';
  
  //column level state
  grid.columns[0].featureName = {};
  grid.columns[0].featureName.someProperty = 123;
  
  //row level state
  grid.rows[0].featureName = {};
  grid.rows[0].featureName.someProperty = 123;
    
  
```

### Directives stacked on core directives
Extend a core directive
```javascript
module.directive('uiGridCell', ['uiGridFeatureService',
  function (uiGridCellNavService) {
    return {
      priority: -500, // run after default uiGridCell directive
      restrict: 'A',
      require: '^uiGrid',
      scope: false,
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        //add whatever dom binding, manipulation,etc that is safe to do and performs well
      }
    };
  }]);
```
### Directives unique to your feature
If necessary...
```javascript
module.directive('uiGridFeatureDirective', ['uiGridFeatureService',
  function (uiGridFeatureService) {
    return {
      link: function ($scope, $elm, $attrs) {
      }
    };
  }]);
```

## Grid Feature directive
Each feature should implement a directive that enables the feature for the ui-grid element. This is the main entry point
of your feature and allows a developer to use multiple grids on a page and include your feature on some grids and not on
others.
<br>
```
<div ui-grid='options' ui-grid-your-feature></div>
```
<br/>

Require the uiGrid controller. In the preLink function, register your
column and row builders (see below).  See ui.grid.edit unit tests on how to easily test your directive

```javascript
  module.directive('uiGridFeature', ['uiGridFeatureService', 'uiGridFeatureConstants',
   function (uiGridEditService, uiGridFeatureConstants) {
    return {
      replace: true,
      priority: 0, // this could be tweaked to fire your directive before/after other features
      require: 'uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            uiGridCtrl.grid.api.registerEventsFromObject(uiGridFeatureConstants.publicEvents);
            uiGridCtrl.grid.registerColumnBuilder(uiGridFeatureService.featureColumnBuilder);
            uiGridCtrl.grid.registerRowBuilder(uiGridFeatureService.featureRowBuilder);
            uiGridCtrl.grid.registerRowsProcessor(uiGridFeatureService.featureRowsProcessor);
            //do anything else you can safely do here
            //!! of course, don't stomp on core grid logic or data
          }
        };
      }
    };
  }]);
```


## i18n
Any translated strings for you feature should be populated in the language files in src/js/i18n.  Namespace the strings
by your feature name. en.js should always be populated.
```
     ...
     avg: 'avg: ',
          min: 'min: ',
          max: 'max: '
        },
      //pinning feature translations
      pinning: {
         pinLeft: 'Pin Left',
          pinRight: 'Pin Right',
          unpin: 'Unpin'
        }
      ...
```

The grid calls different processors for rows and cols that you can implement for your feature.
## ColumnBuilder
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

   //from feature directive pre-link
   uiGridCtrl.grid.registerColumnBuilder(uiGridFeatureService.featureColumnBuilder);
```

## RowBuilder
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
        //from feature directive pre-link
        uiGridCtrl.grid.registerRowBuilder(uiGridFeatureService.featureRowBuilder);
```

## RowsProcessor
RowsProcessor allows your feature to affect the entire rows collections.  Gives you the ability to sort, group, etc. the row.
```javascript
        ....
       function featureRowsProcessor(renderableRows) {
           return rowSorter.sort(this, renderableRows, this.columns);
        ....

        //from feature directive pre-link
        uiGridCtrl.grid.registerRowsProcessor(uiGridFeatureService.featureRowsProcessor);
```

## Public Methods and Events
The grid provides public api via the GridApi object.  This object allows you to register your feature's public
api methods and events.  It guarantees that your events are specific to a grid instance.  Internally, angular
scope $broadcast and $on are used.
```javascript
       //preferred method is to use a map so ide's can pick up on the signatures
       var publicEvents = {
             featureName : {
               event1 : function(scope, function(newRowCol, oldRowCol)){},
               event2 : function(scope, function(){}){}
             }
           }
         });

       //from feature directive pre-link
       uiGridCtrl.grid.api.registerEventsFromObject(publicEvents);

       //more stringy registration
       uiGridCtrl.grid.api.registerEvents('featureName', 'eventName');

       //raise event
       uiGridCtrl.grid.api.featureName.raise.event1(newRowCol, oldRowCol);

       //subscribe to event. You must provide a scope object so the listener will be destroyed when scope is destroyed
       //function's this variable will be grid.api
       uiGridCtrl.grid.api.featureName.on.event1($scope, function(newRowCol, oldRowCol){});

       //register methods
       var methods = {
          featureName : {
            methodName1 : function(yourVar1, yourVar2){
                //whatever you method needs to do
            },
            methodName2 : function(var2){
                //do something else
            }
          }
       }

       uiGridCtrl.grid.api.registerMethodsFromObject(uiGridFeatureConstants.publicEvents);

       //way of the string
       uiGridCtrl.grid.api.registerMethod('featureName', 'methodName', function(yourVar){//do something});

       //external use
        $scope.gridOptions.onRegisterApi = function(gridApi){

          //subscribe to event
          gridApi.feature.on.event1($scope,function(scope, function(newRowCol, oldRowCol)){
             var self = this; //grid.api
             var msg = 'row selected ' + row.isSelected;
             $log.log(msg);
           });

           //call method
           gridApi.featureName.methodName1('abc','123');
        };

```

## Directive Stacking
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

## Documentation
At the very least, document your main feature directive using jsDoc comment so it's visible in the api docs.
Specify all options available to the feature.
See other features for jsdocs examples.

## Tutorials
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

# CSS

1. Use snake-case for class names, not camelCase.

# Tests

## Jasmine and Protractor
All tests are writtten using Jasmine for assertions and Protractor for the e2e test driver.

### Running Single or Groups of tests
You can select specific tests to run using Jasmine's 'focused testing'. In the version of Jasmine that this build system is running you can change `describe('...` to `ddescribe('...` or `it('...` to `iit('...` and only thoes tests will be run.
In the most recent version of Jasmine this has changed to `fdescribe('...` and `fit('...` however at the moment this is not the version we are running.

## Safari

* **Note:** Safari 5 does not allow creating dates from strings where the delimiter is a dash, i.e. `new Date('2015-5-23')` will fail. This will cause your tests to work on all browsers but bomb on Safari 5 and you will have a hard time discovering why. Instead, use slashes like so: `new Date('2015/5/23')`.

# Performing a release

Run these grunt tasks. Look at the grunt-bump module for how to specify a major/minor/patch/pre-release version. This series will bump the version in package.json, update the changelog for that version, then commit the changes and add a new git tag for the version.

Make sure not to include a preceding 'v' in the version name. It will be done automatically by the `bump` task.
    
    # Optionally set the version manually: grunt bump-only --setversion=3.0.1-rc.1
    grunt bump-only
    grunt changelog
    grunt bump-commit

Then push the changes to origin/master and Travis will take care of the rest!

    git push origin master --tags

**NOTE:** Nuget must be pushed to manually
