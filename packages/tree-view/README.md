# UI-Grid Tree View

The tree view plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides the ability to create a tree from your grid, specifying which of your data rows are nodes and which are leaves.

The tree structure itself is documented at [treeBase](http://ui-grid.info/docs/#!/api/ui.grid.treeBase.grid:treeBase).

## Getting Started

You can install `@ui-grid/tree-view` via:

```shell
npm i --save @ui-grid/tree-view
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/tree-base/css/ui-grid.tree-base.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/tree-view/css/ui-grid.tree-view.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/tree-base/js/ui-grid.tree-base.min.js">
<script src="/node_modules/@ui-grid/tree-view/js/ui-grid.tree-view.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/tree-base');
require('@ui-grid/tree-view');
```

Once you load the file, you need to include **'ui.grid.treeView'** module in your angularJS app's dependencies, and add the **ui-grid-tree-view** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.treeBase',
    'ui.grid.treeView'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-tree-view>
```

In your data you tell us the nodes by setting the property *$$treeLevel* on a given row. Levels start at 0 and increase as you move down the tree.

If you wish to load your tree incrementally, you can listen to the *rowExpanded* event, which will tell you whenever a row is expanded. You can then retrieve additional data from the server and splice it into the data array at the right point, the grid will automatically render the data when it arrives.

Tree View allows sorting, and implements it as a recursive tree sort - it sorts the children of each of the nodes of the tree.

Tree View allows filtering, it filters all the rows (nodes and leaves) and then makes sure that all parents of any visible row are also visible. Note that filtering doesn't change expand/collapse states, your users will still need to expand the nodes to get to the filtered rows.

Tree View includes aggregation logic, which is implemented by setting the aggregation property on the *columnDef*. The aggregation property is documented at [columnDef](http://ui-grid.info/docs/#!/api/ui.grid.treeBase.api:ColumnDef). Refer to [complex trees](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20319%20Complex%20Trees) for more detail.

Tree View is still beta, and under development, however it is included in the distribution files to allow people to start using it. Notable outstandings are:

* it would be nice to display an hourglass or icon whilst additional data was loading, the current arrangement means the grid doesn't know whether or not you're adding additional data

Options to watch out for include:

* *treeIndent*: the expand buttons are indented by a number of pixels (default 10) as the tree level gets deeper. Larger values look nicer
* *treeRowHeaderBaseWidth*: the base width of the tree row header (default 30)
* *showTreeExpandNoChildren*: defaults to true. Shows the + even if there are no children, allows you to dynamically load children. If set to false there'll be no + if there are no children

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20215%20Tree%20View)

We also have a more complex example [here](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20319%20Complex%20Trees).

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), both under treeView itself, and shared functions in the treeBase documentation. In particular:

* [treeBase columnDef](http://ui-grid.info/docs/#!/api/ui.grid.treeBase.api:ColumnDef)
* [treeView gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.treeView.api:GridOptions) and [treeBase gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.treeBase.api:GridOptions)
* [treeView publicApi](http://ui-grid.info/docs/#!/api/ui.grid.treeView.api:PublicApi) and [treeBase publicApi](http://ui-grid.info/docs/#!/api/ui.grid.treeBase.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-tree-view](https://github.com/angular-ui/ui-grid/labels/grid-tree-view) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)