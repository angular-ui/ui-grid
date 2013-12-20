1. Copy angular-animate, prettify.js and marked.js into the docs/js dir separately from grunt-ngdocs. It's causing them to show up in `<script>` tags in the Examples which isn't what we want
1. Figure out how to run e2e tests on docs (look at angularjs source / protractor?)
1. `readableColumnNames` need to be overrideable by i18n.
1. Add banners to compiled .css files (grunt-banner?)
1. Add grunt-nuget task to autodeploy builds to nuget
1. Try to reomve `npm install` commands from travis before-script

1. [DONE] Add --browsers option for testing on saucelabs with specific browser(s)
1. [DONE] Make karmangular run in `watch` mode and in singlerun too.
1. [DONE] Make sure failing saucelabs tests don't cause the build to fail. Only if the normal test run fails