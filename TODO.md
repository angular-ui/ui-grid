# TODO

# CURRENT

# Pinning

1. [TODO] - Add tests for new getBorderSize() and closestElm() methods in gridUtil
1. [BUG] - With multiple columns left-pinned, they are wrapping as it appears the render container is 1px too small
1. [BUG] - Column menu not in right place when grid is horizontally scrolled
1. [BUG/MINOR] - If you pin one column and then use the scrollbar to scroll quickly scroll down, the body container will scroll correctly but the pinned container will be missing some rows, visibly.
   - Also it seems like the scroll amount can get out of sync by a few pixels.
1. Right-pinned container needs to have a vertical-scrollbar, if visible then the body should hide its own scrollbar, however we determine to handle that.


# Render containers

*** [NOTE] *** - I turned off test running (karmangular, etc) for render container development

1. [TODO] - headerHeight when vertical scrollbar renders doesn't include the border width.
   - Somehow need a way to re-run buildStyles after any header height updates...
1. [TODO] - Render container header viewport (and maybe main viewport) are too wide. Also the vertical scrollbar is too high. If the header is present the scrollbar needs   
   to size down...

1. [NOTE] - refreshCanvas() needs to QUEUE a refresh. It cannot directly call one. We need to debounce it somehow. Otherwise every render container refresh call will 
   make the grid refresh itself WAY too much. Can we just use $timeout() and $timeout.cancel() with no delay?
   - Maybe make a `queueRefresh` method that GridRenderContainer can call...

1. [NOTE] - On grid init we need to redrawInPlace all containers, or rather update the scrollTop and scrollLeft of all registered container to '0' pixels.
1. [BUG] - The pinning menu actions ARE putting the columns into the renderContainer caches, but it's not immediately updating (re-rendering) the grid. If I then scroll I
   see the column is gone, but it's also still accounts for the column's width when setting the canvas width (so two separate bugs).
   - NOTE - The viewport width adjustment needs to subtract the pinned viewports' dimensions from the main viewport
   - NOTE - Is the canvasWidth updating running in uiGridHeader BEFORE the visible/renderContainer updates which columns are in the body container?
   - NOTE - The main viewport and main header will need their left/right dimensions updated as well as their width/height. The header isn't being updated at all!
   - NOTE - We'd need to subtract the cumulative horizontal-pinned containers width from the top-panel and offset the header's left position based on the left container

1. [TODO] - Horizontal-pinned container will need their OWN header... sigh.
   - Their repeater will need to be based on their render container

1. [IDEA] - Should grid have an `addRenderContainer` method? Rather than just popping them in to the renderContainers properties with no validation?
1. [NOTE] - We can add headerHeight back into the left/right-pinned containers if we don't want a scrollbar at the bottom (we probably don't).
1. [NOTE] - We probably need getAdjustedViewportWidth/Height() methods, the idea being that the normal methods return the full width/height and the others return the adjusted value.
   The pinned containers will need the FULL value so they can fill out the body's width or height based on which side they're pinned to, and then the viewport will use the adjusted
   value to render smaller to make room for the other one.
1. [TODO] - Main viewport will need top/left CSS positioning values to adjust for the left/top-pinned containers (right?)
1. [TODO] - Make viewports generic, so they can be sized to their contents no matter what they are, so they can listen for scroll events. Also need to give the a
   viewports controller that child elements (rows, columns) can communicate with to handle column resizing, etc.
   - Render containers need to have max and min width/height values, and they need to be able to take percentages (i.e. make the left pinned container 30% of the total grid 
     width).
   - Need to somehow keep pinned viewports from listening to scroll events that they should ignore, like left/right-pinned containers shouldn't scroll left/right when the
     body scrolls, but it DOES need to listen to vertical scroll events.
     - I guess we can just add attributes like `bind-scroll-vertical` + `bind-scroll-horizontal` to make them both fire those events and listen for them... That ought to be
       the RIGHT thing (yay).
   - Create a registry of functions that alter the grid viewport's dimensions. For instance, a left-pinned render container will need to substract its own width from the width
     of the main (body) viewport. Basically the body's viewport has to resize around any other viewport inside the main render area, the scrollbar-box or whatever you want to call it.
     - Almost done, just need to split the functionality out so there are "normal" methods and "adjusted" methods.
   - Need to flesh out update() method in ui-grid-render-container to update the renderContainer canvas/viewport styles.
     - i.e. canvas width = sum of columnCache widths, canvas height = sum of rowCache heights

  ** uiGridRenderContainer **
  - Needs to register to the specific renderContainer to get its rows and columns
  - Needs to find its canvas, and its viewport. Or maybe the render container IS a viewport. That's probably easier
  - Needs to get its canvas height

1. [TODO] - uiGridRow needs to take render container so it knows which column cache to look in
1. [TODO] - Within column resizer we need to only account for columns within OUR render container, which means we need to be able to access the contain details from its    
   controller, which will be above us.


1. [TODO] - remove gridBorderWidth on column menu top-left, top-right
1. [TODO] - Move row filtering to feature module.

1. [IDEA] - Look at using Istanbul for code coverage reporting.

1. [TODO] - Make 'No Rows' message i18n
1. [BUG] - i18n causes an exception if a given value is not present.
  1. I think we need a function that will look for a translation in the current or given language and then return the value for the default language if not present
  1. It could also take a flag and return null if not present
  1. Need to add a test for this...

1. [TODO] - Does rowSearcher need to allow for custom equality comparators in colDef?
1. [IDEA] - Should RegExps be allowed as search terms? We could test for whether the filter value starts and ends with '/'

1. [TODO] - Document the autoHide feature for uiGridMenu. Probably need to rename it to hideOnResize

1. [TODO] - Does rowsProcessors make sense for external sorting??? It would be downstream from the rows being added/modified, and would ITSELF be modifying the rows...
  1. Would probably be an infinite loop. External sorting needs to be able to hook in further upstream.
  1. Sorting a column prompts a call to refreshRows(). Could we have a hook in there to run BEFORE rowsProcessors?

1. [TODO] - Do rows processors need to be able to modify the count of of rows? As it is the documentation says the count needs to stay the same... but searching would affect that

1. [IDEA] - Hook the column menu button into the menu it activates so it can show/hide depending on the number of items it will show. Can we do that?
  1. If sorting is enabled or the user / extension has supplied extra menu items, show the menu button. Otherwise don't show it.
  1. We'll need a way to separate extension menu items from user menu items so the user doesn't override them.
1. [IDEA] - Add an showColumnMenu option? Maybe you don't want it on mobile?
1. [TODO] - Make HOME and END keys scroll to top/bottom if grid has focus...
1. [IDEA] - Can we deselect any selected text when the grid is scrolled?
1. [TODO] - Make row builders async with $q
1. [TODO] - Make plnkr/jsfiddle ngdocs buttons work
1. [TODO] - Remove IE11 cell selected weird green color...
1. [IDEA] - Add gridOptions.options for all opts, and deep watch it then rebuild
1. [IDEA] - Add version number to uiGrid module.

1. [IDEA] - Might need to make dragging and reordering columns watch for a minimum pixel delta before starting drag, so it doesn't always cancel long-clicks
1. [BUG] - Grid not redrawing properly when switching between tutorials. It still has the grid body height from the previous tutorial.
   1. This is due to a combination of grunt-ngdocs and ngAnimate. ngAnimate is leaving two "page" (or whatever) elements on the page at the
      same time. Both have a main.css which include styles for the grid. Having the old one on there at the same time as the new one makes
      it use the height from the old one when calculating the grid height... *** Can we switch to Dgeni? ***
1. [BUG] - Menu icon overlays menu text when column name is too long...
   1. [IDEA] - Can we shrink the size of the header-cell-contents div and make it text-overflow: ellipsis?
1. [TOFIX] - Menu icon vertical alignment off in IE11 (how does it look in FF?)
1. [NOTE] - Use "-webkit-text-stroke: 0.3px" on icon font to fix jaggies in Chrome on Windows
1. [TODO] - Add a failing test for the IE9-11 column sorting hack (columnSorter.js, line 229)

1. [TODO] - Add notes about browser version support and Angular version support to README.md
1. [TODO] - Add handling for sorting null values with columnDef sortingAlgorithm (PR #940)
1. [TODO] - Currently uiGridColumnMenu uses i18n to create the menu item text on link. If the language is changed, they won't update because they're not bound...
1. [BUG] - Rows change odd/even class if we add data and the grid is scrolled down...
  -  This is because the range size is changing and the top-most row is disappearing/appearing, altering the odd/even-ness of the rows below it.
     The CSS is done by nth-child so there's no way around it with pure CSS unfortunately
1. [TODO] - Change the deleted row check to use for newInN() instead of forEach().

# Grid Menu

1. [TODO] - Add "master" grid menu that overlays the whole grid when open (should have a decent-size padding that leaves and overlay with high opacity).
1. [TODO] - Make a master grid menu button using the font-awesome menu icon (add to fontello conf) that lives... somewhere... that won't move when columns scroll...

# Cleanup

1. [TODO] - Rename tutorials so they're consistent
1. [TODO] - Re-order tutorials
1. [TODO] - Build a tutorial index page.
1. [TODO] - Remove commented-out dumps from gridUtil
1. [TODO] - Rename gridUtil to uiGridUtil
1. [TODO] - Rename GridUtil in uiGridBody to gridUtil or the above
1. [TODO] - Move uiGridCell to its own file

# Extras

<!-- 1. Add iit and ddescribe checks as commit hooks -->

# Native scrolling

1. [BUG] - Touch event deceleration goes backwards when scrolling up, but only with small amounts.
  1. [BUG] - Horizontal scrolling when emulating a touch device is weird too, scroll between grid canvas and header canvas is offset.
1. [TODO] - Take a look at Hamster.js for normalizing mouse wheel events, test on MacAir.

# Memory Issues
1. [LEAKS] - Make sure stylesheets are being removed on $destroy, and anywhere that we might be doing manual appendChild, or other appending.
1. [LEAKS] - Null out all references to DOM elements in $destroy handler

# MORE

1. `readableColumnNames` need to be overrideable by i18n.
1. Add banners to compiled .css files (grunt-banner?)
1. Add grunt-nuget task to autodeploy builds to nuget
1. Try to remove `npm install` commands from travis before-script
1. e2e tests failing on travis, unable to connect to SauceLabs, or timing out?
  1. Maybe try BrowserStack?
1. Refactor elementHeight() calls in scrollbar code, shouldn't need to get it on every scroll event.
1. [IDEA] - Plugin playground. Upload your own plugins and have live examples on a marketplace sort of thing.
1. Make mouse wheel scroll N number of rows, not a specific amount of pixels.
1. "Edit in Plunkr / JsFiddle" buttons don't work. They need to use the absolute url to the script file.
  1. Maybe we can just do another conditional on process.env.TRAVIS and add the <%= site %> on as a prefix.
1. [IDEA] add a test that, during a scroll event, spies on number of reads/writes to DOM properties that cause reflow
1. [IDEA] - For grid search, if the grid has focus and the user presses ctrl/cmd+F we can pop up the search box.
1. [BUG] - On uiGrid directive example in API docs, the scrollbar is showing up when there's nothing to scroll... then it disappears on scroll
1. [IDEA] - Handle dynamic row sizes
   - Once a row is rendered outside the viewport for the first time, calculate its height and store it
   - For each stored height, remove one default height (30px now) from the calculation and replace it with this dynamic value.
      - i.e. if there are 10 rows at 30px default a piece, that's 300px canvas height. Newly-rendered row is 50px, so subtract 30px from 300px (270px) and add 50px (320px)
   - This would need to prevent the scrollTop on the viewport and scrollbar from changing. The percentages would probably change as the canvas height changes, and we'd need them to not jerky back or forward.
   - So in the uiGridBody it knows the indexes of the rows being rendered. It can just tell each row to calculate its own height in an $evalAsync.
      - Or perhaps the row heights can be calculated all at once in the body so we are not running N number of $evalAsync functions.
   - Invalidate row heights on data changes
1. Add jade processing for misc/site directory
   - Don't `copy` .jade files with the copy task.
1. Naming inconsistencies - uiGridConstants vs gridUtil, etc.

1. Move column sizing stuff out of header directive.
1. [IDEA] - Bind to 'resize' event and refresh grid on that
1. Scrollbar not hiding on Mac OS?
1. Border of scrollbar on hover doesn't appear darker than background
1. Make a custom branch that adds requestAnimationFrame wrappers around anywhere we retrieve/modify reflow-triggering DOM values.
1. [IDEA] - From s3shs on irc: add bootstrap2/3 less/css shims that will style the grid the same was a bootstrap table (similar to selectize: http://brianreavis.github.io/selectize.js/)
1. [IDEA] - Use https://github.com/akoenig/imacss in a grunt task to turn the arrow svg to a data-uri and embed it in our css.


# Done!

