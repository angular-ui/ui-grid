# UI Grid : An Angular data grid

[![Build Status](https://api.travis-ci.org/angular-ui/ng-grid.png?branch=3.0)](https://travis-ci.org/angular-ui/ng-grid)

[![Selenium Test Status](https://saucelabs.com/browser-matrix/nggrid.svg)](https://saucelabs.com/u/nggrid)

# Building

Install dependencies

    > npm install -g grunt-cli
    > npm install

Default grunt task will test and build files into dist/

    > grunt

Development "watch" task. This will automatically rebuild from source on changes, reload Grunfile.js if you change it, and rebuild the docs.
1. A server on localhost:9002 serving whichever directory you checked out, with livereload. Nagivate to http://localhost:9002/misc/demo to see the demo files.
2. A server on localhost:9003 serving the ./docs directory. These are the docs built from source with a custom grunt-ngdocs that should work with Angular 1.2.4.

    > grunt dev

By default `grunt dev` will start several karma background watchers that will run the tests against multiple versions of angular. You may specify the version(s) you want to use with the `--angular` flag:

    > grunt dev --angular=1.2.1

    > grunt dev --angular=1.2.3,1.2.4

# Thanks

Thanks to [Sauce Labs](http://saucelabs.com) and [BrowserStack](http://www.browserstack.com) for providing their testing platforms to open source projects for free.