# UI Grid : An Angular data grid

[![Build Status](https://api.travis-ci.org/angular-ui/ng-grid.png?branch=3.0)](https://travis-ci.org/angular-ui/ng-grid) [![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/angular-ui/ng-grid/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

[![Selenium Test Status](https://saucelabs.com/browser-matrix/nggrid.svg)](https://saucelabs.com/u/nggrid)

# Help!

Head to http://ui-grid.info for documentation and tutorials.

# Building

Install dependencies
    
    # If you don't already have the grunt-cli installed:
    > npm install -g grunt-cli
    
    > npm install
    > grunt install

Default grunt task will test and build files into dist/

    > grunt

# Developing

Development "watch" task. This will automatically rebuild from source on changes, reload Grunfile.js if you change it, and rebuild the docs.
1. A server on localhost:9002 serving whichever directory you checked out, with livereload. Navigate to http://localhost:9002/misc/demo to see the [demo files](http://localhost:9002/misc/demo/grid-directive.html).
2. A server on localhost:9003 serving the ./docs directory. These are the docs built from source with a custom grunt-ngdocs that should work with Angular 1.2.4.

    > grunt dev

By default `grunt dev` will start several karma background watchers that will run the tests against multiple versions of angular. You may specify the version(s) you want to use with the `--angular` flag:

    > grunt dev --angular=1.2.1

    > grunt dev --angular=1.2.3,1.2.4

You can also use the `--browsers` specify what browsers to test with (PhantomJS is the default).

    > grunt dev --browsers=Chrome

    # Run a single test run against multiple browsers
    > grunt karma:single --browsers=Chrome,Firefox,IE

By default the `dev` tasks runs e2e tests with protractor. If you have problems with them running slow or hanging, you can disable them with the `--no-e2e` flag:

    > grunt dev --no-e2e

## Karmangular

The `karmangular` task runs tests serially against multiple browsers (it is used internally by the `dev` task).
  
    # Run tests against all available versions of Angular on Chrome
    > grunt karmangular --browsers=Chrome

    # Run tests with a couple versions of Angular against the default PhantomJS browser
    > grunt karmangular --angular=1.2.0,1.2.1

## SauceLabs

ui-grid is set up to run against SauceLabs. You must have the `SAUCE_ACCESS_KEY` environment variable set.

    # Execute tests for a couple versions of angular on IE8
    > grunt karmangular --angular=1.2.3,1.2.4 --browsers=SL_IE_8

    # Run the watch tasks against IE10
    > grunt dev --browsers=SL_IE10

The full list of SauceLabs browsers is in `lib/grunt/util.js` in the `customLaunchers` method. Usually it should suffice to let Travis do this testing automatically, unless you're trying to debug a browser-specific issue.

# Thanks

Thanks to [Sauce Labs](http://saucelabs.com) and [BrowserStack](http://www.browserstack.com) for providing their testing platforms to open source projects for free.
