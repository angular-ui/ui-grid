# UI-Grid Tree Base

The tree base plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides base tree handling functions that are shared by other plugins, notably [grouping](https://www.npmjs.com/package/@ui-grid/grouping) and [tree-view](https://www.npmjs.com/package/@ui-grid/tree-view). It provides a tree view of the data, with nodes in that tree and leaves.

This plugin is unique in the sense that it is rarely, if ever, used by itself. It is more of a building stone.

## Getting Started

You can install `@ui-grid/tree-base` via:

```shell
npm i --save @ui-grid/tree-base
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/tree-base/css/ui-grid.tree-base.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/tree-base/js/ui-grid.tree-base.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/tree-base');
```

Once you load the file, you need to include **'ui.grid.treeBase'** module in your angularJS app's dependencies.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.treeBase'
]);
```

### Example

This plugin is being used in both [grouping](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20209%20Grouping) and [tree-view](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20215%20Tree%20View), so you should visit those pages for examples of it in action.

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/ui.grid.treeBase).

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-tree-base](https://github.com/angular-ui/ui-grid/labels/grid-tree-base) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)