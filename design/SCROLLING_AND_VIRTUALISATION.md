# Scrolling and Virtualisation Design

This document is a first cut at documenting how scrolling and virtualisation works, and 
providing a path to refactoring or otherwise tidying up the scrolling logic.

## Overview

We have various scrollable renderContainers: left, body and right.  The body 
render container is always present, the left and right render containers depend
on RTL settings and pinning settings.  In a left to right (default) setup with 
grouping or selection enabled you'll have a left render container that holds the 
row header (the select buttons or the grouping expand buttons).

Within each render container we have a header, a viewport and a footer.

The viewport within the render containers scrolls vertically, with the scroll bar displayed
in the rightmost render container.  Irrespective of which render container receives the
scroll event we scroll all containers that are present vertically (scroll synchronisation).

The body render container scrolls horizontally, with the header, viewport and footer all scrolling.
At the current time the scrollbar is shown at the bottom of the body viewport, consideration should
be given as to whether it should instead be shown at the bottom of the footer render container.  Irrespective
of whether the header, viewport or footer receive the scroll event, all three are synchronised (again, 
scroll synchronisation).

Virtualisation is implemented to reduce the number of DOM elements rendered.  If a grid has 10,000 visible 
rows we provide the illusion that we have rendered all of them, but we actually only create DOM elements
for those rows that are currently visible, and a reasonable buffer either side.  Similarly for horizontal 
scrolling we only render the columns that are actually visible plus a buffer either side.  We then apply 
padding to the viewports to provide the illusion that there are more DOM elements rendered than there are.

Virtualisation applies to the body renderContainer (header, viewport, footer) for horizontal scrolling, and 
to the left, right and body viewports for vertical scrolling.


## Design Concept

### Separation

We separate scrolling from virtualisation.
- Scrolling is the process of moving the visible area of a canvas
- Virtualisation is the process of deciding whether to change the DOM elements that are rendered, and 
  associated padding


### Scrolling

Scrolling should try to behave like native browser scrolling as far as possible - when a user triggers a 
scroll using a scrollbar, trackpad or touch event the only additional processing we should add is to 
synchronise the relevant containers, based on the scroll directions.

Scrolling should provide events to virtualisation so that we know that scrolling occurred, but the act of 
scrolling should not be blocked by virtualisation - this should reduce any janking or speed issues.  Ideally
scrolling on it's own does not trigger a digest cycle - digests should only be triggered by virtualisation, if
at all.

### Virtualisation

Virtualisation is the act of deciding which DOM elements should be currently rendered, and applying padding 
to make the scrollbars look as if there's the right amount of scroll distance.  We render the visible rows 
plus `excessRows` additional rows to the top and bottom.  We render the visible columns plus `excessColumns` 
additional columns to the left and right.  When virtualisation is notified of a scroll event we take a look 
to see whether we have at least `minExcessRows` of buffer in the scroll direction, and at least `minExcessCols`
of buffer in the scroll direction.  

If either minExcess is breached, then we adjust the DOM such that we have `excessRows` and `excessColumns` again,
and adjust the scroll padding appropriately.

In order to avoid browser blocking and general thrashing, we implement a throttle.  Once one scroll event finishes
we always wait at least `minScrollWait` ms before we respond to another scroll event.  At the point we do respond,
we respond based on the current scroll position, not based on any intermediate positions.


### Variable Row and Column Size

In implementing this design concept we'll also explicitly allow for variable height rows and columns.  We'll build
logic that iterates the visible column array and the visible row array, and adds to each row and column a `scrollToHere`
value that tells us the pixel count to the leftmost edge of the column, or the topmost edge of the row.

The height/width attributed to a row/column will be based on a height/width that is stored directly on the row/column, 
if that is not present then it will base off the rowHeight set in the gridOptions.

The `scrollToHere` value will need to be recalculated based on triggers.  The notifyDataChange architecture
will be used to manage these triggers.  Triggers will be:
 - column resize
 - row height change
 - rerun of rowsProcessors or columnsProcessors (i.e. potentially change in ordering, visible rows/cols etc)
 - change of data (perhaps picked up in the above)
 - change of columnDefs (perhaps picked up in the above)


### Watchers

We have watchers on the row and column / on the cell that look for a change in the row/col that this particular
DOM element is attached to.  

Column changes are automatically handled through use of `track by uid`, which means that any time the uid of a 
column changes new DOM elements will be rendered.  Having said this, it isn't currently clear that this means
we can avoid the watchers, but essentially this should mean that we never reuse DOM elements for columns - any 
new uid will result in new DOM elements.  For rows, the trigger for reuse is virtualisation.  This means that 
we can replace the current watchers with a notification architecture instead, and we can specifically notify 
when we change the row/DOM alignment.  (If it turns out we also want watchers for columns, we could similarly
notify of changes to the col).

We would do this using the notifyDataChange architecture.  This would remove a number of watchers.


### Events

What events do we have, and what are they used for?  Need to ask @swalters or read the code.


### Benefits

The result should be that slow scrolling is very smooth - most scroll ticks will result in the canvas
moving but no DOM re-rendering and no digest cycle.  When a user scrolls faster we may result in every scroll tick 
meeting the criteria for re-rendering the DOM, but we'll only do the actual re-render at a maximum rate per second, 
so we're not driving into digest hell and thrashing our browser (particularly on lower powered devices such as 
mobile devices).


### Things to Watch Out For

The virtualisation / scrolling cycle currently calls one of the variants of grid refresh (perhaps refreshCanvas, 
can't recall off the top of my head).  It's also likely that one of the grid refresh variants will need to recalculate
virtualisation, as this would be the trigger for some things like data having changed.  We need to take care that we
don't create an endless loop.

Scrolling is a bit untidy in the movement between grid triggered and native browser scrolls.  I seem to recall that 
we get native scroll events triggering when we internally scroll, we need to be careful to not end up in a loop, 
and we can perhaps manage CPU use by not processing both. Perhaps we can have a way to detect that they originate 
with the same user event?

