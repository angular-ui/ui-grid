# UI-Grid Edit

The edit plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) allows inline editing of grid data.

## Getting Started

You can install `@ui-grid/edit` via:

```shell
npm i --save @ui-grid/edit
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/edit/css/ui-grid.edit.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/edit/js/ui-grid.edit.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/edit');
```

Once you load the file, you need to include **'ui.grid.edit'** module in your angularJS app's dependencies, and add the **ui-grid-edit** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.edit'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-edit>
```

You can use the enableCellEdit options in your column definitions to allow a column to be editable.

Editing is invoked via double-click, f2, or start typing any non-navigable key. Cell editing ends on tab, enter or esc (cancel) on an input editor, and tab, left or right arrows, enter or esc for a dropdown.

By default an input element is provided, with numeric, date and checkbox editors for fields specified as 'number', 'date' and 'boolean' types, for all other fields a simple text editor is provided. (A point to note about date editors is that for date editors to be enabled the datatype of the variable should also be "Date").

A dropdown editor is also available, through setting the editableCellTemplate on the columnDef to 'ui-grid/dropdownEditor'. When using a dropdown editor you need to provide an options array through the editDropdownOptionsArray property on the columnDef. This array by default should be an array of {id: xxx, value: xxx}, although the field tags can be changed through using the editDropdownIdLabel and editDropdownValueLabel options.

A file chooser is available, through setting the 'editableCellTemplateon thecolumnDefto'ui-grid/fileChooserEditor'`. This file chooser will open the file chosen by the user and assign the value of that file to the model element. In the example below we use the file chooser to load a file, and we display the filename in the cell. The file is stored against the row in a hidden column, which we can save to our server or otherwise process.

Custom edit templates should be used for any editor other than the default editors, but be aware that you will likely also need to provide a custom directive similar to the uiGridEditor directive so as to provide BEGIN_CELL_EDIT, CANCEL_CELL_EDIT and END_CELL_EDIT events.

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20201%20Edit%20Feature)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [columnDef](http://ui-grid.info/docs/#!/api/ui.grid.edit.api:ColumnDef)
* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.edit.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.edit.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-edit](https://github.com/angular-ui/ui-grid/labels/grid-edit) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)