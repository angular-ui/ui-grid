# UI-Grid Pagination

The pagination plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) provides the ability to display the data in pages that can be browsed using the built in pagination selector.

If you wanted server based pagination, you could look at the [external pagination tutorial](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20314%20External%20Pagination) or consider using the [infinite scroll plugin](https://www.npmjs.com/package/@ui-grid/infinite-scroll), which also retrieves data in pages from the server.

## Getting Started

You can install `@ui-grid/pagination` via:

```shell
npm i --save @ui-grid/pagination
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<link rel="stylesheet" href="/node_modules/@ui-grid/core/css/ui-grid.min.css" type="text/css">
<link rel="stylesheet" href="/node_modules/@ui-grid/pagination/css/ui-grid.pagination.min.css" type="text/css">
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/pagination/js/ui-grid.pagination.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/pagination');
```

Once you load the file, you need to include **'ui.grid.pagination'** module in your angularJS app's dependencies, and add the **ui-grid-pagination** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.pagination'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-pagination>
```

### External Pagination

For external pagination, implement the *gridApi.pagination.on.paginationChanged* callback function. The callback may contain code to update any pagination state variables your application may utilize, e.g. variables containing the *pageNumber* and *pageSize*. The REST call used to fetch the data from the server should be called from within this callback. The URL of the call should contain query parameters that will allow the server-side code to have sufficient information to be able to retrieve the specific subset of data that the client requires from the entire set.

It should also update the *$ctrl.gridOptions.totalItems* variable with the total count of rows that exist (but were not all fetched in the REST call mentioned above since they exist in other pages of data).

This will allow ui-grid to calculate the correct number of pages on the client-side.

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20214%20Pagination)

We also have an example of it using external pagination [here](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20314%20External%20Pagination).

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [columnDef](http://ui-grid.info/docs/#!/api/ui.grid.pagination.api:ColumnDef)
* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.pagination.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.pagination.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-pagination](https://github.com/angular-ui/ui-grid/labels/grid-pagination) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)