# UI-Grid Cell Navigation

The cell navigation plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) allows you to navigate around the grid using the arrow keys, pg-down and pg-up, enter (moves down), shift-enter (moves up), tab (moves right) and shift-tab (moves left). When combined with the editable feature, the left-right arrow keys will be subsumed when in "deep edit" mode, allowing you to move around within the text you're editing. The tab key and shift-tab keys continue to function.

## Getting Started

You can install `@ui-grid/cellnav` via:

```shell
npm i --save @ui-grid/cellnav
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/cellnav/css/ui-grid.cellnav.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/cellnav/js/ui-grid.cellnav.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/cellnav');
```

Once you load the file, you need to include **'ui.grid.cellNav'** module in your angularJS app's dependencies, and add the **ui-grid-cellNav** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.cellNav'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-cellNav>
```

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20202%20Cell%20Navigation)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [columnDef](http://ui-grid.info/docs/#!/api/ui.grid.cellNav.api:ColumnDef)
* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.cellNav.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.cellNav.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-cellNav](https://github.com/angular-ui/ui-grid/labels/grid-cellNav) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)