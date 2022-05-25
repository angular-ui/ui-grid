# UI-Grid Infinite Scroll

The infinite-scroll plugin for [UI-Grid](https://www.npmjs.com/package/@ui-grid/core) allows the user to lazy load their data to gridOptions.data.

## Getting Started

You can install `@ui-grid/infinite-scroll` via:

```shell
npm i --save @ui-grid/infinite-scroll
```

Once you install you need to load the respective JS and CSS files as seen bellow:

```html
<script src="/node_modules/@ui-grid/core/js/ui-grid.core.min.js">
<script src="/node_modules/@ui-grid/infinite-scroll/js/ui-grid.infinite-scroll.min.js">
```

Alternatively, if you are using Webpack or RequireJS to load your dependencies, you can do the following at the top of the file that needs it:

```javascript
require('@ui-grid/core');
require('@ui-grid/infinite-scroll');
```

Once you load the file, you need to include **'ui.grid.infiniteScroll'** module in your angularJS app's dependencies, and add the **ui-grid-infinite-scroll** directive to your grid element.

```javascript
angular.module('myApp', [
    'ui.grid',
    'ui.grid.infinite-scroll'
]);
```

```html
<div ui-grid="$ctrl.gridOptions" ui-grid-infinite-scroll>
```

Once you reach the top (or bottom) of your real data set, you can notify that no more pages exist up (or down), and infinite scroll will stop triggering events in that direction. You can also optionally tell us up-front that there are no more pages up through *infiniteScrollUp = true* or down through *infiniteScrollDown = true*, and we will never trigger pages in that direction. By default we assume you have pages down but not up.

You can specify the number of rows from the end of the dataset at which the infinite scroll will trigger a request for more data *infiniteScrollRowsFromEnd = 20*. By default we trigger when you are 20 rows away from the end of the grid (in either direction).

We will raise a *needMoreData* or *needMoreDataTop* event, which you must listen to and respond to if you have told us that you have more data available. Once you have retrieved the data and added it to your data array (at the top if the event was *needMoreDataTop*), you need to call dataLoaded to tell us that you have loaded your data. Optionally, you can tell us that there is no more data, and we won't trigger further requests for more data in that direction.

When you have loaded your data we will attempt to adjust the grid scroll to give the appearance of continuous scrolling. We basically assume that your user will have reached the end of the scroll (upwards or downwards) by the time the data comes back, and scroll the user to the beginning of the newly added data to reflect that. In some circumstances this can give "jumpy" scrolling, particularly if you have set your *rowsFromEnd* to quite a high value so that you're prefetching the data - if the user is scrolling slowly they might be 50 rows from the end, and when we process the dataLoaded we suddenly move them to what used to be the end. To avoid this, you can explicitly save the scroll position before you add data to your data array, through calling *saveScrollPercentage*, and the dataLoaded call will then take that position into account, and attempt to adjust the scroll so that the same rows are showing once the grid has ingested the data you have added.

We suppress the normal grid behaviour of propagating the scroll to the parent container when you reach the end if infinite scroll is enabled and if there is still data in that direction - so if there are pages upwards then scrolling to the top will get those pages rather than hitting the top and then scrolling your whole page upwards.

If you are using external sorting or external filtering you may reload your data whenever scroll or filter events occur. In this situation you'll want to call resetScroll to tell the grid not to try to preserve the previous scroll position. You may also use this call when you've otherwise reset the data in the grid. You must also tell us whether you allow *scrollUp* or *scrollDown* from this position as part of the call.

You may sometimes remove data, for example if you're keeping 10 pages of data in memory, and you start discarding data from the top as you add data to the bottom. You can use the *dataRemovedTop* and *dataRemovedBottom* to tell us that you've discarded data, and we'll aim to set the scroll back to where it was before you removed that data.

### Example

You can find an example of this plugin in action on our [website](http://ui-grid.info/docs/#!/tutorial/Tutorial:%20212%20Infinite%20scroll)

## API Documentation

Documentation for this plugin is provided in the [api documentation](http://ui-grid.info/docs/#!/api/), but we recommend that you pay special attention to the following:

* [gridOptions](http://ui-grid.info/docs/#!/api/ui.grid.infiniteScroll.api:GridOptions)
* [publicApi](http://ui-grid.info/docs/#!/api/ui.grid.infiniteScroll.api:PublicApi)

## Issues

You can find issues that are specific to this UI-Grid plugin by looking for the label [grid-infinite-scroll](https://github.com/angular-ui/ui-grid/labels/grid-infinite-scroll) in the [ui-grid github issues](https://github.com/angular-ui/ui-grid/issues) page.

## License

[MIT](https://github.com/angular-ui/ui-grid/blob/master/LICENSE.md)