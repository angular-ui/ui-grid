# UI Grid : An Angular data grid

[![Build Status](https://api.travis-ci.org/angular-ui/ng-grid.png?branch=3.0)](https://travis-ci.org/angular-ui/ng-grid) [![Coverage Status](https://coveralls.io/repos/angular-ui/ng-grid/badge.png?branch=master)](https://coveralls.io/r/angular-ui/ng-grid?branch=master)

[![Selenium Test Status](https://saucelabs.com/browser-matrix/nggrid.svg)](https://saucelabs.com/u/nggrid)

# Help!

Head to http://ui-grid.info for documentation and tutorials. Join https://gitter.im/angular-ui/ng-grid to discuss development of the 3.x codebase.  We're always looking for new contributors, for pro-level contribution guidelines look at [Contributor](CONTRIBUTING.md), if you're more of a first-timer with open source (or just need a refresher), look at [First Time Open Source Contributor](FIRST_TIMER.md), also look at [Developer](DEVELOPER.md) 

# What Happened to Version 2.x?

We are aggressively trying to move to 3.x, which has been in the works for over a year, and part of that is moving past the 2.x codebase and working to get 3.x update to snuff. The old 2.x versions are still available, which you can currently install as normal with bower/nuget.

To submit fixes to 2.x please point your pull requests at the [2.x](https://github.com/angular-ui/ng-grid/tree/2.x) branch.

**Note:** 3.0 is NOT ready for production. It is still in a pre-beta state.

# How Can I Test 3.0?

With 3.0 we are no longer storing release files in the repository; only source files will be here. 3.0 release files are available on http://ui-grid.info, which is built from this repository: ui-grid.info/release/ui-grid-unstable.js, and the beta is available from bower as `bower install angular-ui-grid --save-dev`

Here is a file list for the 3.0 unstable releases:

File Name            | Url
---------------------|----------------
ui-grid-unstable.js  | [http://ui-grid.info/release/ui-grid-unstable.js](http://ui-grid.info/release/ui-grid-unstable.js)
ui-grid-unstable.css | [http://ui-grid.info/release/ui-grid-unstable.css](http://ui-grid.info/release/ui-grid-unstable.css)
ui-grid.eot          | [http://ui-grid.info/release/ui-grid.eot](http://ui-grid.info/release/ui-grid.eot)
ui-grid.svg          | [http://ui-grid.info/release/ui-grid.svg](http://ui-grid.info/release/ui-grid.svg)
ui-grid.ttf          | [http://ui-grid.info/release/ui-grid.ttf](http://ui-grid.info/release/ui-grid.ttf)
ui-grid.woff         | [http://ui-grid.info/release/ui-grid.woff](http://ui-grid.info/release/ui-grid.woff)

There are minified files that can be used as well:

File Name                | Url
-------------------------|----------------
ui-grid-unstable.min.js      | [http://ui-grid.info/release/ui-grid-unstable.min.js](http://ui-grid.info/release/ui-grid-unstable.min.js)
ui-grid-unstable.min.css | [http://ui-grid.info/release/ui-grid-unstable.min.css](http://ui-grid.info/release/ui-grid-unstable.min.css)

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

# Thanks

Thanks to [Sauce Labs](http://saucelabs.com) and [BrowserStack](http://www.browserstack.com) for providing their testing platforms to open source projects for free.
