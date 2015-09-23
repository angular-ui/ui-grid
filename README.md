# UI-Grid : An AngularJS data grid

[![Build Status](https://api.travis-ci.org/angular-ui/ui-grid.png?branch=3.0)](https://travis-ci.org/angular-ui/ui-grid) [![Coverage Status](https://coveralls.io/repos/angular-ui/ui-grid/badge.png?branch=master)](https://coveralls.io/r/angular-ui/ui-grid?branch=master)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/angular-ui/ui-grid?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

[![Selenium Test Status](https://saucelabs.com/browser-matrix/nggrid.svg)](https://saucelabs.com/u/nggrid)

# Help!

Head to http://ui-grid.info for documentation and tutorials. Join https://gitter.im/angular-ui/ui-grid to discuss development and ask for specific help.

We're always looking for new contributors, for pro-level contribution guidelines look at [Contributor.md](CONTRIBUTING.md), if you're more of a first-timer with open source (or just need a refresher), look at [First Time Open Source Contributor.md](FIRST_TIMER.md), also look at [Developer.md](DEVELOPER.md)

Need Some Inspiration? Have a look at our open [PRs Plz!](https://github.com/angular-ui/ui-grid/issues?q=is%3Aopen+is%3Aissue+label%3A%22PRs+plz%21%22) issues.

# Installing

## Bower

```bash
    bower install angular-ui-grid
```

```html
    <link rel="stylesheet" type="text/css" href="bower_components/angular-ui-grid/ui-grid.min.css">
    <script src="bower_components/angular-ui-grid/ui-grid.min.js">
```

## NPM

```bash
    npm install angular-ui-grid
```

```html
    <link rel="stylesheet" type="text/css" href="node_modules/angular-ui-grid/ui.grid.min.css">
    <script src="node_modules/angular-ui-grid/ui.grid.min.js">
```

## CDN

You can use [rawgit.com](https://rawgit.com/)'s cdn url to access the files in the Bower repository. These files are hosted by [MaxCDN](https://www.maxcdn.com/). Just alter the version as you need.

* https://cdn.rawgit.com/angular-ui/bower-ui-grid/master/ui-grid.min.js
* https://cdn.rawgit.com/angular-ui/bower-ui-grid/master/ui-grid.min.css

# Angular Compatibility

UI-Grid is currently compatible with Angular versions ranging from 1.2.x to 1.4.x.

# Feature Stability

UI-Grid comes bundled with several features. Not all of them are currently stable.  See the list below for the stability of each:

Feature           | Release state
-------------------        | --------- |
[auto-resize-grid](http://ui-grid.info/docs/#/tutorial/213_auto_resizing) ([API](http://ui-grid.info/docs/#/api/ui.grid.autoResize))  | beta
[cellnav](http://ui-grid.info/docs/#/tutorial/202_cellnav) ([API](http://ui-grid.info/docs/#/api/ui.grid.cellNav)) | stable
[edit](http://ui-grid.info/docs/#/tutorial/201_editable) ([API](http://ui-grid.info/docs/#/api/ui.grid.edit)) | stable
[expandable](http://ui-grid.info/docs/#/tutorial/216_expandable_grid) ([API](http://ui-grid.info/docs/#/api/ui.grid.expandable))    | alpha
[exporter](http://ui-grid.info/docs/#/tutorial/206_exporting_data) ([API](http://ui-grid.info/docs/#/api/ui.grid.exporter))      | stable
[grouping](http://ui-grid.info/docs/#/tutorial/209_grouping) ([API](http://ui-grid.info/docs/#/api/ui.grid.grouping))      | beta
[importer](http://ui-grid.info/docs/#/tutorial/207_importing_data) ([API](http://ui-grid.info/docs/#/api/ui.grid.importer))      | stable
[infinite-scroll](http://ui-grid.info/docs/#/tutorial/212_infinite_scroll) ([API](http://ui-grid.info/docs/#/api/ui.grid.infiniteScroll))           | beta
[move-columns](http://ui-grid.info/docs/#/tutorial/217_column_moving) ([API](http://ui-grid.info/docs/#/api/ui.grid.moveColumns))    | alpha
[pagination](http://ui-grid.info/docs/#/tutorial/214_pagination) ([API](http://ui-grid.info/docs/#/api/ui.grid.pagination))    | alpha
[pinning](http://ui-grid.info/docs/#/tutorial/203_pinning) ([API](http://ui-grid.info/docs/#/api/ui.grid.pinning))       | stable
[resize-columns](http://ui-grid.info/docs/#/tutorial/204_column_resizing) ([API](http://ui-grid.info/docs/#/api/ui.grid.resizeColumns))  | stable
[row-edit](http://ui-grid.info/docs/#/tutorial/205_row_editable) ([API](http://ui-grid.info/docs/#/api/ui.grid.rowEdit))      | stable
[saveState](http://ui-grid.info/docs/#/tutorial/208_save_state) ([API](http://ui-grid.info/docs/#/api/ui.grid.saveState))     | stable
[selection](http://ui-grid.info/docs/#/tutorial/210_selection) ([API](http://ui-grid.info/docs/#/api/ui.grid.selection))       | stable
[tree-base](http://ui-grid.info/docs/#/tutorial/215_treeView) ([API](http://ui-grid.info/docs/#/api/ui.grid.treeBase))     | beta
[tree-view](http://ui-grid.info/docs/#/tutorial/215_treeView) ([API](http://ui-grid.info/docs/#/api/ui.grid.treeView))       | beta

For more details on the features check the [Tutorials](http://ui-grid.info/docs/#/tutorial).

# Building

Install dependencies

    git must be on your path.  If you can't do 'git' from your terminal, then install git first and make sure you have access from the path.
    Bower installs are dependent on git.

    If you are a git noob, the easiest way to install is by installing the github client.

    # If you don't already have the grunt-cli installed:
    > npm install -g grunt-cli

    > npm install
    > grunt install

Default grunt task will test and build files into dist/

    > grunt

# Developing

Development "watch" task. This will automatically rebuild from source on changes, reload Gruntfile.js if you change it, and rebuild the docs.

1. A server on localhost:9002 serving whichever directory you checked out, with livereload. Navigate to http://localhost:9002/misc/demo to see the [demo files](http://localhost:9002/misc/demo/grid-directive.html).
2. A server on localhost:9003 serving the ./docs directory. These are the docs built from source with a custom grunt-ngdocs that should work with Angular 1.2.x.



> grunt dev

By default `grunt dev` will start several karma background watchers that will run the tests against multiple versions of angular. You may specify the version(s) you want to use with the `--angular` flag:

    > grunt dev --angular=1.2.21

    > grunt dev --angular=1.2.20,1.2.21

You can also use the `--browsers` specify what browsers to test with (PhantomJS is the default).

    > grunt dev --browsers=Chrome

    # Run a single test run against multiple browsers
    > grunt karma:single --browsers=Chrome,Firefox,IE

By default the `dev` tasks runs e2e tests with protractor. If you have problems with them running slow or hanging, you can disable them with the `--no-e2e` flag:

    > grunt dev --no-e2e

The grunt task is getting slower as the body of tests gets larger.  If you're only working on the core functionality you can disable the unit tests on the features with the `--core` flag:

    > grunt dev --core

As a shortcut for options that the developers frequently use, there is also a `--fast` flag, which equates to `--core --no-e2e --angular=<latest>`:

    > grunt dev --fast

## Karmangular

The `karmangular` task runs tests serially against multiple browsers (it is used internally by the `dev` task).

    # Run tests against all available versions of Angular on Chrome
    > grunt karmangular --browsers=Chrome

    # Run tests with a couple versions of Angular against the default PhantomJS browser
    > grunt karmangular --angular=1.2.20,1.2.21

## SauceLabs

ui-grid is set up to run against SauceLabs. You must have the `SAUCE_ACCESS_KEY` environment variable set.

    # Execute tests for a couple versions of angular on IE8
    > grunt karmangular --angular=1.2.20,1.2.21 --browsers=SL_IE_8

    # Run the watch tasks against IE10
    > grunt dev --browsers=SL_IE10

The full list of SauceLabs browsers can be seen by running `grunt saucebrowsers`. Usually it should suffice to let Travis do this testing automatically, unless you're trying to debug a browser-specific issue.

# What Happened to 2.x?

As of the 3.0 release, 2.x is officially deprecated. There will be no further releases. If for some reason you need to find the 2.x source please see the [2.x branch](https://github.com/angular-ui/ui-grid/tree/2.x).

The 2.x docs are here: [http://angular-ui.github.io/ui-grid/](http://angular-ui.github.io/ui-grid/).

# Repository Rename

With the 3.0 release, the repository has been renamed from "ng-grid" to "ui-grid".

All network traffic to GitHub should redirect automatically but they say you should update your git remote url:

  git remote set-url origin https://github.com/angular-ui/ui-grid.git

# Thanks

Thanks to [Sauce Labs](http://saucelabs.com) and [BrowserStack](http://www.browserstack.com) for providing their testing platforms to open source projects for free.
