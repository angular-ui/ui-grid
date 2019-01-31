# UI-Grid Selection

The selection plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides the ability to select rows in the grid.

## Getting Started

You can install `@ui-grid/selection` via:

```shell
npm i --save @ui-grid/selection
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/selection/css/ui-grid.selection.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/selection/js/ui-grid.selection.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/selection');
```

Once you load the file, you need to include **'ui.grid.selection'** module in your angularJS app's dependencies, and add the **ui-grid-selection** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.selection'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-selection>
```

After getting it setup, you can use the *gridOptions.onRegisterApi* callback to register the *rowSelectionChanged* event and log when the row is selected. By default the selection plugin will divide selection changes into batch events and single events, there are two different events provided in the api. By setting *enableSelectionBatchEvent: false* you can cause it to instead just call the single event in a loop - which may be useful if you're doing client rather than server side processing of the changes.

By default the module will provide a row header with checkboxes that allow selection of individual rows. If you set the *enableRowHeaderSelection* gridOption to *false*, then the row header is hidden and a click on the row will result in selection of that row.

If you want to allow both clicking on the row, and also clicking on the rowHeader, you can set *enableFullRowSelection* to *true*.

Setting the *multiSelect* gridOption to *true* will allow selecting multiple rows, setting to *false* will allow selection of only one row at a time.

If you have *multiSelect: false*, then an additional option *noUnselect* will mean that a row is always selected. You can select a different row (which will unselect the current row), but you cannot manually unselect the current row by clicking on it. This means that *at least one row is always selected*, other than when you first open the grid. If necessary you could programatically select the first row upon page open.

If *multiSelect: true*, another option *modifierKeysToMultiSelect* may be used. If set to *true* this will allow selecting multiple rows only if the *Ctrl-Key, Cmd-Key (Mac) or the Shift-Key* is used when selecting, if set to *false* then it allows selecting multiple rows by individually clicking them.

By default a *selectAll* box is shown at the top of the *rowHeader*. If *multiSelect: true* is set then this will allow you to select all visible rows. Note that the *selectAll* does not watch for new data, so if you are using the *selectAll* function and you add data to the grid, you need to check *grid.api.selection.getSelectAllState*, and if it is currently ticked, then manually call *grid.api.selection.selectAllVisibleRows* after your data has been added.

The *selectAll* box can be disabled by setting *enableSelectAll* to *false*.

You can set the selection row header column width by setting *'selectionRowHeaderWidth'* option.

You can use an *isRowSelectable* function to determine which rows are selectable. If you set this function in the options after grid initialization you need to call *gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS)* to enable the option.

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20210%20Selection)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.selection.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.selection.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-selection](https://github.com/angular-ui/ui-grid/labels/grid-selection) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)