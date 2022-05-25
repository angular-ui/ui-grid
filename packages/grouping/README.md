# UI-Grid Grouping

The grouping plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides the ability to group rows together based on similar values in specific columns, providing an effect similar in some ways to an Excel pivot table. Columns that aren't grouped by can be aggregated, providing for example a running count of the number of rows in each group. This plugin is also built on top of [UI-Grid Tree Base](https://www.npmjs.com/package/@ui-grid/tree-base) and as such, it depends on it and some of its methods and events in order to work.

Grouping can be set programmatically by using the columnDef option grouping: *{ groupPriority: 0 }*, or for aggregations on a column by setting *treeAggregation: {type: uiGridGroupingConstants.aggregation.COUNT}*.

Optionally (and by default) grouped columns are moved to the front of the grid, which provides a more visually pleasing effect. In order to avoid creating a dependency on pinning, this is done by moving the columns themselves as part of the grouping plugin, not through use of the pinning plugin.

Grouping leverages the sort functionality, allowing a user to change the sort order or use external sort functionality and have the resulting list grouped. A column(s) that is marked as being grouped is always moved to the high order of the sort priority, as the data must be sorted to permit grouping.

Any grouped column has *suppressRemoveSort* set, when a column is ungrouped then *suppressRemoveSort* is returned to the value in the columnDef.

Grouping and aggregation should work cleanly with filtering - it should group and aggregate only the filtered rows.

Group header rows cannot be edited, and if using the selection plugin, cannot be selected. They can, however, be exported.

The group rowHeader by default is always visible. If you'd like the *groupRowHeader* only present when at least one column is grouped then set the *treeRowHeaderAlwaysVisible: false* gridOption.

For more information, feel free to check out the grouping tutorial on the [ui-grid website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20209%20Grouping).

## Getting Started

You can install `@ui-grid/grouping` via:

```shell
npm i --save @ui-grid/grouping
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/tree-base/css/ui-grid.tree-base.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/grouping/css/ui-grid.grouping.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/tree-base/js/ui-grid.tree-base.min.js">
<script src="/node_modules/@ui-grid/grouping/js/ui-grid.grouping.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/tree-base');
require('@ui-grid/grouping');
```

Once you load the file, you need to include **'ui.grid.grouping'** module in your angularJS app's dependencies, and add the **ui-grid-grouping** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.treeBase',
    'ui.grid.grouping'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-grouping>
```

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20209%20Grouping)

## API Documentation

Documentation for the expandable plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [grouping columnDef](http://ui-grid.info/docs/#!/api/ui.grid.grouping.api:ColumnDef)
* [treeBase columnDef](http://ui-grid.info/docs/#!/api/ui.grid.treeBase.api:ColumnDef)
* [grouping gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.grouping.api:GridOptions)
* [treeBase gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.treeBase.api:GridOptions)
* [grouping publicApi](http://ui-grid.info/docs/#!/api/ui.grid.grouping.api:PublicApi)
* [treeBase publicApi](http://ui-grid.info/docs/#!/api/ui.grid.treeBase.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-grouping](https://github.com/angular-ui/ui-grid/labels/grid-grouping) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)