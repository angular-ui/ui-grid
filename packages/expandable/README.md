# UI-Grid Expandable

The expandable plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides the ability to have a subgrid in your grid.

## Getting Started

You can install `@ui-grid/expandable` via:

```shell
npm i --save @ui-grid/expandable
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/expandable/css/ui-grid.expandable.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/expandable/js/ui-grid.expandable.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/expandable');
```

Once you load the file, you need to include **'ui.grid.expandable'** module in your angularJS app's dependencies, and add the **ui-grid-expandable** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.expandable'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-expandable>
```

To show the subgrid you need to provide following grid options:

```javascript
vm.gridOptions = {
  // the template that will be used to render subgrid.
  expandableRowTemplate: 'expandableRowTemplate.html',
  // the height of the subgrid
  expandableRowHeight: 140,
  // the scope of the expanded subgrid
  expandableRowScope: expandableScope
};
```

expandableRowTemplate will be the template for subgrid and expandableRowHeight will be the height of the subgrid. expandableRowScope can be used to add variables to the scope of expanded grid. These variables can then be accessed from expandableRowTemplate. The grid api provides the following events and methods for subGrids:

```javascript
// rowExpandedStateChanged is fired for each row as its expanded:
gridApi.expandable.on.rowExpandedStateChanged($scope, function(row) {
    // your logic here
});
// These can be used to expand/collapse all rows of the grid:
gridApi.expandable.expandAllRows();
gridApi.expandable.collapseAllRows();
```

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20216%20Expandable%20grid)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.expandable.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.expandable.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-expandable](https://github.com/angular-ui/ui-grid/labels/grid-expandable) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)