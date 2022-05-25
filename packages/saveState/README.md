# UI-Grid Save State

The save state plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) allows you to save the current look of the grid and restore it upon returning to the grid.

For example, you may have an application where your user can reorder the columns, adjust column widths, apply sorts and filters, and select a specific cell. The user might adjust their grid to look as they wish, and then navigate to another page. When the user returns to the page with the grid, they might expect it to look like it did when they left. The save state plugin permits this.

There are two core methods:

* **save**, which packages the current grid state into an object which the calling application then stores somewhere (a cookie, session state, a database)
* **restore**, which takes a grid state object, and returns the grid to the state that is stored in that object

Note that the saveState functionality deliberately sets out to store the transient state - the information that isn't held in gridOptions nor columnDefs. The calling application is responsible for storing gridOptions and columnDefs (and must have had them in order to render the grid the first time).

This plugin also provides some options that control what is saved. All options are true by default:

* saveWidths
* saveOrder
* saveScroll
* saveFocus
* saveVisible
* saveSort
* saveFilter
* savePagination
* savePinning
* saveGrouping
* saveGroupingExpandedStates
* saveTreeView
* saveSelection

## Getting Started

You can install `@ui-grid/saveState` via:

```shell
npm i --save @ui-grid/saveState
```

Once you install you need to load the required JS file:

```html
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/cellnav/js/ui-grid.cellnav.min.js">
<script src="/node_modules/@ui-grid/selection/js/ui-grid.selection.min.js">
<script src="/node_modules/@ui-grid/resize-columns/js/ui-grid.resize-columns.min.js">
<script src="/node_modules/@ui-grid/move-columns/js/ui-grid.move-columns.min.js">
<script src="/node_modules/@ui-grid/pinning/js/ui-grid.pinning.min.js">
<script src="/node_modules/@ui-grid/tree-base/js/ui-grid.tree-base.min.js">
<script src="/node_modules/@ui-grid/tree-view/js/ui-grid.tree-view.min.js">
<script src="/node_modules/@ui-grid/grouping/js/ui-grid.grouping.min.js">
<script src="/node_modules/@ui-grid/saveState/js/ui-grid.saveState.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/cellnav');
require('@ui-grid/selection');
require('@ui-grid/resize-columns');
require('@ui-grid/move-columns');
require('@ui-grid/pinning');
require('@ui-grid/tree-base');
require('@ui-grid/tree-view');
require('@ui-grid/grouping');
require('@ui-grid/saveState');
```

Once you load the files, you need to include **'ui.grid.saveState'** module in your angularJS app's dependencies, and add the **ui-grid-save-state** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.saveState'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-save-state>
```

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20208%20Save%20and%20restore%20state)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.saveState.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.saveState.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-savestate](https://github.com/angular-ui/ui-grid/labels/grid-savestate) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)