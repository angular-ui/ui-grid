# TODO

1. Copy angular-animate, prettify.js and marked.js into the docs/js dir separately from grunt-ngdocs. It's causing them to show up in `<script>` tags in the Examples which isn't what we want
1. `readableColumnNames` need to be overrideable by i18n.
1. Add banners to compiled .css files (grunt-banner?)
1. Add grunt-nuget task to autodeploy builds to nuget
1. Try to reomve `npm install` commands from travis before-script
1. e2e tests failing on travis, unable to connect to SauceLabs, or timing out?
  1. Maybe try BrowserStack?
1. Add util methods that will perform the same as jquery's .height() and .width() on elements.
  1. Still need to test this with hidden elements
1. Add 'track by $index' to ng-repeats?
1. Add virtual repeat functionality
1. Need to make the docs pages allow the user to choose the unstable or stable release (or version) in a drop-down (like Angular does).
1. Scrollbar should only show up when there's elements to scroll.
1. Mouse wheel should work in viewport (almost done)
1. Refactor elementHeight() calls in scrollbar code, shouldn't need to get it on every scroll event.
1. elementHeight() (AND jQuery.height()) isn't working on the .ui-grid element. It's not accounting for the border when figuring out the canvas drawing space.

# Done!

1. [DONE] Figure out how to run e2e tests on docs (look at angularjs source / protractor?)
1. [DONE] Add --browsers option for testing on saucelabs with specific browser(s)
1. [DONE] Make karmangular run in `watch` mode and in singlerun too.
1. [DONE] Make sure failing saucelabs tests don't cause the build to fail. Only if the normal test run fails
1. [DONE] Add grunt task that will use ngdoc to build test specs from docs into .tmp/e2e/doc.spec.js
   - It will need to run after ngdocs does. Maybe make a `gendocs` task that runs both serially.
1. [DONE] Docs ref for ui-grid.js is pointing to localhost:9999 on travis.