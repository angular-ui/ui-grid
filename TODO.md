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

# Done!

1. [DONE] Figure out how to run e2e tests on docs (look at angularjs source / protractor?)
1. [DONE] Add --browsers option for testing on saucelabs with specific browser(s)
1. [DONE] Make karmangular run in `watch` mode and in singlerun too.
1. [DONE] Make sure failing saucelabs tests don't cause the build to fail. Only if the normal test run fails
1. [DONE] Add grunt task that will use ngdoc to build test specs from docs into .tmp/e2e/doc.spec.js
   - It will need to run after ngdocs does. Maybe make a `gendocs` task that runs both serially.
1. [DONE] Docs ref for ui-grid.js is pointing to localhost:9999 on travis.