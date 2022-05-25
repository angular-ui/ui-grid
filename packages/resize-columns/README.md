# UI-Grid Resize Columns

The resize columns plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides the ability for each column to be resized.

## Getting Started

You can install `@ui-grid/resize-columns` via:

```shell
npm i --save @ui-grid/resize-columns
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/resize-columns/css/ui-grid.resize-columns.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/resize-columns/js/ui-grid.resize-columns.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/resize-columns');
```

Once you load the file, you need to include **'ui.grid.resizeColumns'** module in your angularJS app's dependencies, and add the **ui-grid-resize-columns** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.resizeColumns'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-resize-columns>
```

You can set individual columns to not be resizeable, if you do this it is recommended that those columns have a fixed pixel width - otherwise they may get automatically resized to fill the remaining space if other columns are reduced in size, and there will be no way to reduce their width again.

When you resize a column any other columns with fixed widths, or that have already been resized, retain their width. All other columns resize to take up the remaining space. As long as there is at least one variable column left your columns won't reduce below the full grid width - but once you've resized all the columns then you can end up with the total column width less than the grid width.

If, for some reason, you want to use the ui-grid-resize-columns directive, but not allow column resizing, you can explicitly set the option to false. This prevents resizing for the entire grid, regardless of individual colDef options.

```javascript
$ctrl.gridOptions = {
  enableColumnResizing: false
};
```

You can also disable it on a column by setting the enableColumnResizing property to false in its column definition.

```javascript
$ctrl.gridOptions = {
  enableColumnResizing: true,
  columnDefs: [
    { field: 'name' },
    { field: 'gender', enableColumnResizing: false },
    { field: 'company' }
  ]
};
```

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20204%20Column%20Resizing)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [columnDef](http://ui-grid.info/docs/#!/api/ui.grid.resizeColumns.api:ColumnDef)
* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.resizeColumns.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.resizeColumns.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-resize-columns](https://github.com/angular-ui/ui-grid/labels/grid-resize-columns) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)