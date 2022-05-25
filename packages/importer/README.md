# UI-Grid Importer

The importer plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides the ability to import data into the grid from the grid in CSV or JSON format. The importer can use the native grid menu, or can accept a file from a custom file picker implemented by the user.

## Getting Started

You can install `@ui-grid/importer` via:

```shell
npm i --save @ui-grid/importer
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/importer/css/ui-grid.importer.min.css" type="text/css">
<script src="/node_modules/csv-js/csv.js">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/importer/js/ui-grid.importer.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('csv-js');
require('@ui-grid/core');
require('@ui-grid/importer');
```

You also need to have installed the csv-js library. You can configure the csv-js library through use of globals, for example CSV.DETECT_TYPES = false;, refer to the [csv-js documentation](https://github.com/gkindel/CSV-JS) for more information.

Once you load the files, you need to include **'ui.grid.importer'** module in your angularJS app's dependencies, add the **ui-grid-importer** directive to your grid element, and you must provide a *gridOptions.importerDataAddCallback* function that adds the created objects into your data array. 

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.importer'
]).controller('MainCtrl', function() {
    var vm = this;

    vm.gridOptions = {
        enableGridMenu: true,
        data: [],
        importerDataAddCallback: function(grid, newObjects) {
            vm.gridOptions.data = vm.gridOptions.data.concat(newObjects);
        }
    };
});
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-importer>
```

For json format files the received elements are assumed to match the *column.field* attributes in your *columnDefs*, and are loaded into the provided entity.

For csv files the data is mapped to the columnDefs, with columns in the heading row in the csv needing to match either the column.name or column.displayName. Optionally you can provide a custom function that maps headings to column.name, and this will be used instead, you could use this to implement a custom "column picker" type routine. If you are using internationalisation on the headers (say, via adding a *cellHeaderFilter*), then you can also optionally pass a filter function into the *importerHeaderFilterCallback* routine. This routine will be called on the *displayName* to try to match the translated text, if you provide this routine it must return an immediate translation, not a promise - so if using angular-translate you need to use *$translate.instant*.

Optionally you can provide a custom function that maps the data within each entity as it is imported, refer the documentation for *importerObjectCallback*.

The importer adds menu items to the grid menu, to use the native UI you need to enable the grid menu using the gridOption *enableGridMenu*. You can turn the menu items off by setting *importerShowMenu: false*.

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20207%20Importing%20Data)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.importer.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.importer.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-importer](https://github.com/angular-ui/ui-grid/labels/grid-importer) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)