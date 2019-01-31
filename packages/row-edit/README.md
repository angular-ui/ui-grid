# UI-Grid Row Edit

The row edit plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) extends the [edit plugin](https://www.npmjs.com/package/@ui-grid/edit) to support callbacks for server saving of the data, with that data saved "row at a time." This plugin attempts to give a user an experience similar to a spreadsheet - in that they can edit whichever fields they wish, and the feature will seek to save the data "row at a time". To the extent that the data doesn't generate errors, from a user perspective the saving is almost invisible - rows occassionally go grey (saving) and can't be edited while grey, but otherwise the user edits as if the data were local.

This plugin also relies on the [cellnav plugin](https://www.npmjs.com/package/@ui-grid/cellnav) for it to work correctly.

## Getting Started

You can install `@ui-grid/row-edit` via:

```shell
npm i --save @ui-grid/row-edit
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/cellnav/css/ui-grid.cellnav.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/edit/css/ui-grid.edit.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/row-edit/css/ui-grid.row-edit.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/cellnav/js/ui-grid.cellnav.min.js">
<script src="/node_modules/@ui-grid/edit/js/ui-grid.edit.min.js">
<script src="/node_modules/@ui-grid/row-edit/js/ui-grid.row-edit.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/cellnav');
require('@ui-grid/edit');
require('@ui-grid/row-edit');
```

Once you load the file, you need to include the **'ui.grid.cellNav'**, **'ui.grid.edit'**, and **'ui.grid.rowEdit'** modules in your angularJS app's dependencies, and add the **ui-grid-cellnav**, **ui-grid-edit**, and **ui-grid-row-edit** directives to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.cellNav',
    'ui.grid.edit',
    'ui.grid.rowEdit'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-cellnav ui-grid-edit ui-grid-row-edit>
```

Once enabled, each row will be in one of four states at any point in time:

* **clean**: No edits have been made (or no edits since the last save)
* **isDirty**: Edits have been made, but the data has not yet been saved, either because the user is still editing the row or because the timer hasn't triggered as yet
* **isSaving**: The callback to save the row has been called and has not yet returned. The row is not editable during this time, and is shown as greyed out, so as to avoid the user causing locking exceptions by editing the row again
* **isError**: The save callback returned an error. The row still has the updated data displayed, but will be shown in red

The basic method of operation is that whenever a cell is edited (identified using the **edit.afterCellEdit** event) an **isDirty** flag is set on the row, and a **saveTimer** is set. If another cell in the same row commences editing within 2 seconds (or other configurable time), then the timer will be destroyed again. Otherwise upon the timer completing the row will be set to a status of **isSaving** and greyed out, and the saveRow event will be called. The function called by this event must call **rowEdit.setSavePromise**, and the rowedit plugin will wait on that promise.

If the cellNav plugin is also enabled, then a **setFocus** on a cell within the row is sufficient to delay the timer (this more easily deals with situations where only some columns are editable, and a user tabs or clicks to a non-editable field on the same row).

If the promise is successfully resolved then the row is set back to clean. If the promise is rejected then the row is set to a status of **isError**.

Optionally, the calling application can request **flushDirtyRows**, which will trigger the save event for all currently dirty rows. If the **rowEditWaitInterval** grid option is set to -1, then saves will never be triggered by timer, and only be triggered when manually called.

Methods and properties are provided to operate with this regime:

* **getDirtyRows()**: returns an array of gridRows of all currently dirty rows
* **getErrorRows()**: returns an array of gridRows of all currently errored rows
* **flushDirtyRows()**: flushes all currently dirty rows to the server, might be used on a page navigation request or pressing of a save button
* **saveRow(rowEntity)**: event called when a row is ready for saving
* **rowEditWaitInterval**: grid option that controls how long a wait will be before a save is triggered (in ms)

### Importing Data With Row Edit

The [importer plugin](https://www.npmjs.com/package/@ui-grid/importer) can work together with the rowEdit plugin to automatically save the imported rows to your server, and show validation errors for any rows that were not accepted by the server.

If you want to allow the user to look at the data before the saves kick off, consider setting the **rowEditWaitInterval** to -1, which will suppress the auto-save, and require you to manually call **flushDirtyRows()** once the user has made a save request.

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20205%20Row%20Edit%20Feature)

And you can go [here](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20311%20Importing%20Data%20With%20Row%20Edit) to see it working alongside the importer plugin.

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.rowEdit.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.rowEdit.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-row-edit](https://github.com/angular-ui/ui-grid/labels/grid-row-edit) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)