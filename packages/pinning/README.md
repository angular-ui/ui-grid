# UI-Grid Pinning

The pinning plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides the ability to pin a a column to left or right. It is also possible to disable pinning on column level.

## Getting Started

You can install `@ui-grid/pinning` via:

```shell
npm i --save @ui-grid/pinning
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/pinning/css/ui-grid.pinning.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/pinning/js/ui-grid.pinning.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/pinning');
```

Once you load the file, you need to include **'ui.grid.pinning'** module in your angularJS app's dependencies, and add the **ui-grid-pinning** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.pinning'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-pinning>
```

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20203%20Pinning)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [columnDef](http://ui-grid.info/docs/#!/api/ui.grid.pinning.api:ColumnDef)
* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.pinning.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.pinning.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-pinning](https://github.com/angular-ui/ui-grid/labels/grid-pinning) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)