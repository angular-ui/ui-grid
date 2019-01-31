# UI-Grid Auto Resize

The auto-resize plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) enables the grid to resize itself when its container changes size.

> **Note:** This plugin works by adding a checker on 250ms interval that sees if the grid element has changed in size. It could potentially affect the performance of your site or application negatively.

## Getting Started

You can install `@ui-grid/auto-resize` via:

```shell
npm i --save @ui-grid/auto-resize
```

Once you install you need to load our main file bellow your `@ui-grid/core` file as seen bellow:

```html
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/auto-resize/js/ui-grid.auto-resize.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/auto-resize');
```

Once you load the file, you need to include **'ui.grid.autoResize'** module in your angularJS app's dependencies, and add the **ui-grid-auto-resize** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.autoResize'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-auto-resize>
```

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20213%20Auto-Resizing)

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)