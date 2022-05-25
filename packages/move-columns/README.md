# UI-Grid Move Columns

The move columns plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides the ability to move columns to a different position in the grid.

## Getting Started

You can install `@ui-grid/move-columns` via:

```shell
npm i --save @ui-grid/move-columns
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/move-columns/css/ui-grid.move-columns.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/move-columns/js/ui-grid.move-columns.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/move-columns');
```

Once you load the file, you need to include **'ui.grid.moveColumns'** module in your angularJS app's dependencies, and add the **ui-grid-move-columns** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.moveColumns'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-move-columns>
```

By default column moving will be enabled for all the columns of the grid. To disable it for all columns of grid property *enableColumnMoving* of grid options can be used. To specifically enable or disable column moving for a specific column property *enableColumnMoving* of column definitions can be used.

Columns can be repositioned by either dragging and dropping them to specific position. Alternatively, *gridApi* method *gridApi.colMovable.moveColumn(oldPosition, newPosition)* can also be used to move columns. The column position ranging from 0 (in the leftmost) up to number of visible columns in the grid (in the rightmost).

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20217%20Column%20Moving)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [columnDef](http://ui-grid.info/docs/#!/api/ui.grid.moveColumns.api:ColumnDef)
* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.moveColumns.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.moveColumns.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-move-columns](https://github.com/angular-ui/ui-grid/labels/grid-move-columns) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)