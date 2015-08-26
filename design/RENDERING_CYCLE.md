# Grid Rendering Cycle

The core grid rendering cycle is executed whenever the grid needs re-rendering.  There are a number of core methods,
with some of those methods able to be called individually.

### Current
The key method is `grid.refresh`.  This method updates the rows and columns in the grid, then redraws and resizes the grid.

  - grid.refresh
    - rowsProcessors
    - setVisibleRows
    - columnsProcessors
    - setVisibleColumns
    - redrawInPlace
    - refreshCanvas

By preference grid.refresh is called through a debounce function - grid.queueGridRefresh.  If you use this method you are
telling the grid that you want a refresh, but you're allowing the grid to consolidate all refreshes from the current digest cycle
and process just once.

A similar method, `grid.refreshRows` also exists, this is the same as grid.refresh except that it doesn't run `columnsProcessors` 
or `setVisibleColumns`.

The rows and columns processors are focused on ordering and determining the visibility of columns and rows.  They include functions
such as sorting and filtering (impacting order and visibility of rows), grouping rows (which adds extra rows, and changes the ordering
and widths of columns), and pinning, which changes which render container particular columns are in.

`redrawInPlace` determines the correct scroll percentage in the grid, and therefore which of the rows and columns should currently
be visible in the viewport.

`refreshCanvas` is a complicated method that determines the sizing of each of the grid elements.  In some cases it is currently iterative,
for example it determines header height by rendering each of the column headers, and determining the maximum rendered height.  This largely
appears to be to accomodate filters.

  - refreshCanvas
    - buildStyles
    - $timeout - calcHeaders  (this is inline - should it be a style computation? It isn't a promise, and doesn't wait on the buildStyles 
    promise, but it does run in a timeout.  Conversely, it creates a promise that it resolves - but it doesn't wait for the header calc to
    complete before resolving the promise)
      - may call buildStyles again if it decides headerHeight has changed

The style builders include:

- `GridRenderContainer.updateColumnWidths`, which calculates column widths based on the defined settings, including resolving * and ** etc.  No rendering 
  is involved - all based on the availableWidth.  This may be the source of some of the iteration - because availableWidth must in some way be
  based on columnWidth - the canvas doesn't really have an available width.  I also have question on why we calculate widths on the grid
  and not on the renderContainer, that may be another source of iteration.  Having said that, things like % and * probably apply to the
  full grid width, not to just a container, and we wouldn't expect a column to change width when it changed container (e.g. when we pinned it)
- `uiGridRenderContainer.update()`, which is called for each renderContainer.  It determines the
width of each column in the render container, and the width of the overall render container.
- `Grid.prototype.getFooterStyles()`, sets the columnFooterHeight and the gridFooterHeight based on fixed values declared in the options
- when there are multiple renderContainers (e.g. a left container), the non-body render containers appear to execute first
- `ui-pinned-container.updateContainerDimensions()`: sets the width of a pinned container.  How does this interact with render container width?

### Vision
The vision is to make the style calculations more deterministic, and remove any iteration or other dependencies.  A single pass through
refreshCanvas should return a correctly sized grid.

To achieve this, we really need to:

- calculate all sizing in code, without reference to the sizing of rendered grid elements.  We already do most of this for rows
  and columns, the main gap seems to be grid header
- we could reference rendered size to determine the grid's available size (if we want to), which could allow the grid to be more 
  responsive.  Probably we already do this.
- calculate the column widths and element heights
- layout all the columns - what render container they're in etc, then size the render containers
- calculate the overall grid sizing based on all the elements (headerHeight, footerHeight, container widths etc)
- render

Thinking only at this stage!!
