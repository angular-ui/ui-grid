# UI-Grid Core

UI-Grid (formerly ng-grid), is a 100% angularJS grid written with no dependencies other than AngularJS. It is designed around a core grid module and plugins are layered on as angular modules and directives. This keeps the core small and focused while executing very complex features only when you need them.

In the core module, you get:

* Virtualized rows and columns - only the rows and columns visible in the viewport (+ some extra margin) are actually rendered
* Bind cells to complex properties and functions
* Column sorting with three states: Asc, Desc, None
* Column filtering
* Ability to change header and cell contents with custom templates
* i18nService that allows label translations, with the english translations already loaded.

## Getting Started

You can install `@ui-grid/core` via:

```shell
npm i --save @ui-grid/core
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
```

Once you load the file, you need to include **'ui.grid'** module in your angularJS app's dependencies, and add the **ui-grid** directive to your page.

```javascript
angular.module('myApp', [
    'ui.grid'
]);
```

```html
<div ui-grid="$ctrl.gridOptions">
```

And don't forget to load your data:

```javascript
this.gridOptions = {
    data: [
        {name: 'Hobie Brown', company: 'Parker Industries', position: 'Head of Security'},
        {name: 'Jacob Fury', company: 'Stark Industries', position: 'Research Scientist'},
        {name: 'Max Dillon', company: 'Oscorp', position: 'Elitrical Engineer'}
    ]
};
```

### Example

You can find an example of this component in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20101%20Intro%20to%20UI-Grid)

## API Documentation

Documentation for the grid is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [columnDef](http://ui-grid.info/docs/#!/api/ui.grid.class:GridColumn)
* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.class:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.api:PublicApi)

## Issues

You can find issues that are specific to the core UI-Grid by looking for the label [grid-core](https://github.com/angular-ui/ui-grid/labels/grid-core) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)