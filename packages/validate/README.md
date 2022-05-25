# UI-Grid Validate

The validate plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides the ability to validate cells after they are changed. It is meant to be used alongside the [edit plugin](https://www.npmjs.com/package/@ui-grid/edit).

## Getting Started

You can install `@ui-grid/validate` via:

```shell
npm i --save @ui-grid/validate
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/edit/css/ui-grid.edit.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/validate/css/ui-grid.validate.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/edit/js/ui-grid.edit.min.js">
<script src="/node_modules/@ui-grid/validate/js/ui-grid.validate.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/edit');
require('@ui-grid/validate');
```

Once you load the file, you need to include **'ui.grid.validate'** and **'ui.grid.edit'** modules in your angularJS app's dependencies, and add both the **ui-grid-validate** and **ui-grid-edit** directives to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.edit',
    'ui.grid.validate'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-edit ui-grid-validate>
```

### Validators

*Validation* is based on validation functions defined at service level (thus valid through all the application).

Some custom validators come with the plugin and are:

* *required*: to ensure that a field is not empty.
* *minLength*: to ensure that the value inserted is at least X characters long.
* *maxLength*: to ensure that the value inserted is at most X characters long.

To define a new validator you should use the [setValidator method](http://ui-grid.info/docs/#!/api/ui.grid.validate.service:uiGridValidateService#methods_setvalidator).

To add a validator to a column you just need to add a validators property to its *colDef* object, containing a property for each validator you want to add. The name of the property will set the validator and the value of the property will be treated as an argument by the validator function.

When a field does not pass validation it gets a invalid class so you can customize it via css.

The plugin adds 2 templates to ui-grid:

* *cellTitleValidator* which adds the error message to the title attribute of the cell.
* *cellTooltipValidator* which depends on ui-bootstrap to add a tooltip.

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20201%20validate%20Feature)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.validate.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-validate](https://github.com/angular-ui/ui-grid/labels/grid-validate) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)