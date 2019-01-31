# UI-Grid Empty Base Layer

The empty base layer plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides the ability to have the background of the grid be empty rows, this would be displayed in the case were the grid height is greater then the amount of rows displayed.

## Getting Started

You can install `@ui-grid/empty-base-layer` via:

```shell
npm i --save @ui-grid/empty-base-layer
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/empty-base-layer/css/ui-grid.empty-base-layer.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/empty-base-layer/js/ui-grid.empty-base-layer.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/empty-base-layer');
```

Once you load the file, you need to include **'ui.grid.emptyBaseLayer'** module in your angularJS app's dependencies, and add the **ui-grid-empty-base-layer** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.emptyBaseLayer'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-empty-base-layer>
```

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20218%20Empty%20Grid%20Base%20Layer)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.emptyBaseLayer.api:GridOptions)
* [directive](http://ui-grid.info/docs/#!/api/ui.grid.emptyBaseLayer.directive:uiGridEmptyBaseLayer)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-empty-base-layer](https://github.com/angular-ui/ui-grid/labels/grid-empty-base-layer) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)