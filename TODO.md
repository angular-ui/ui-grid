# TODO

# CURRENT

1. [TODO] - Add notes about browser version support and Angular version support to README.md


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

1. [DONE] - [BUG] - When column resizing and you've scrolled to the end of the grid, the scrollbar extends beyond the viewport...
1. [DONE] Figure out how to run e2e tests on docs (look at angularjs source / protractor?)
1. [DONE] Add --browsers option for testing on saucelabs with specific browser(s)
1. [DONE] Make karmangular run in `watch` mode and in singlerun too.
1. [DONE] Make sure failing saucelabs tests don't cause the build to fail. Only if the normal test run fails
1. [DONE] Add grunt task that will use ngdoc to build test specs from docs into .tmp/e2e/doc.spec.js
   - It will need to run after ngdocs does. Maybe make a `gendocs` task that runs both serially.
1. [DONE] Docs ref for ui-grid.js is pointing to localhost:9999 on travis.
1. [DONE] Sometimes scrollbar snaps back to the top???
  1. I think it's getting mousewheel events when the element doesn't have focus.
  1. To reproduce, use mousewheel to scroll to bottom of grid, then move outside grid and scroll page to top. Use window scrollbar to move back down to show grid, then click on scrollbar. It will snap to the top.
1. [DONE] elementHeight() (AND jQuery.height()) isn't working on the .ui-grid element. It's not accounting for the border when figuring out the canvas drawing space.
  1. [NOTE] - I just had to subtract "1" from the canvas height. Not sure why. After that, any borders of any size on the grid element are accounted for correctly.
   1 [NOTE] - It was because of the top-panel bottom border, which is 1px by default
1. [DONE] Looks like the canvas needs to be the height of all the elements (rowheight * data length) in order for the scroll to work right
1. [DONE] Add 'track by $index' to ng-repeats?
1. [DONE] Add virtual repeat functionality
1. [DONE] Scrollbar should only show up when there's elements to scroll.
  1. i.e. add ng-show based on canvasHeight > gridbody height
1. [DONE] Copy angular-animate, prettify.js and marked.js into the docs/js dir separately from grunt-ngdocs. It's causing them to show up in `<script>` tags in the Examples which isn't what we want  
1. [DONE] Mouse wheel should work in viewport (almost done)
1. [DONE] - [BUG] - Hidden grid doesn't calculate height of header correctly
1. [DONE] - [BUG] - Viewport is calcuating too small on customizer page on ui-grid.info ONLY.
   - Was including wrong ui-grid.css file
1. [DONE] - Make scrollbar look like chrome's?
1. [DONE] - Horizontal scrolling
   - [DONE] - [NOTE] - The header will need to be able to scroll as well. It will need to be able to overflow
   - [IDEA] - We'll need to iterate through the columnDefs in the style computation, and calculate the minimum number of rows to render.
      - Basically find the set of smallest columns, according to their width, that still cover the viewport, and figure out how many are in the set, then set minCols to that
      - Starting with the first column, add up the column widths until they are greater than the viewport width, then save that number of columns as the minimum. Continue going through the
        column widths, subtracting the previous column's width and adding the next column's width. If at any point the total width is less than the viewport, increment the minimum number of columns.
   - [IDEA] - Might need to dynamically set 'excessColumns'. With a 'scrollThreshold' of 4 and 'excessColumns' of 4, it was not rendering enough columns to the left of the viewport
   - [TODO] - Figure out how to calculate the margin-left property on the columns when the columns have variable sizes. Might need to calc the widths of the rendered columns in order to get the offset adjustments
 1. [DONE] - [IDEA] - Break out GridColumn into its own factory 
 1. [DONE] - [TODO] - Obey minWidth and maxWidth in colDef, in resizer [TODO] AND in the header width builder