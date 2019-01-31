# UI-Grid Exporter

The exporter plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides the ability to export data from the grid in CSV, Excel, or PDF format. The exporter can export all data, visible data or selected data. It will add menu items to the grid menu, but to use the native UI you need to enable the grid menu using the gridOption *enableGridMenu*.

To use the exporter you need to include the ui-grid-exporter directive on your grid. If you want to export selected rows and view those menu options you must include the [ui-grid-selection](https://www.npmjs.com/package/@ui-grid/selection) directive on your grid. Also, due to the nature of this plugin, it requires some other extarnal dependencies besides angularJS itself, namely [csv-js](https://www.npmjs.com/package/csv-js), [excel-builder](https://www.npmjs.com/package/excel-builder), [jszip](https://www.npmjs.com/package/jszip), [lodash](https://www.npmjs.com/package/lodash), and [pdfmake](https://www.npmjs.com/package/pdfmake).

## Getting Started

You can install `@ui-grid/exporter` via:

```shell
npm i --save @ui-grid/exporter
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/exporter/css/ui-grid.exporter.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/exporter/js/ui-grid.exporter.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/exporter');
```

Once you load the file, you need to include **'ui.grid.exporter'** module in your angularJS app's dependencies, and add the **ui-grid-exporter** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.exporter'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-exporter>
```

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20206%20Exporting%20Data)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [columnDef](http://ui-grid.info/docs/#!/api/ui.grid.exporter.api:ColumnDef)
* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.exporter.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.exporter.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-exporter](https://github.com/angular-ui/ui-grid/labels/grid-exporter) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)