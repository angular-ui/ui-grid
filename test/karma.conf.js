files = [
    JASMINE,
    JASMINE_ADAPTER,

    // 3rd-party code
    '../lib/jquery-1.9.1.js',
    '../lib/angular.js',
    'lib/angular/angular-mocks.js',

    // App code
    '../build/ng-grid.debug.js',

    // Test specs
    'unit/*Spec.js',
    'e2e/scenarios.js'
];

// // level of logging
// // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;

// // enable / disable colors in the output (reporters and logs)
colors = true;

// // Start these browsers, currently available:
// // - Chrome
// // - ChromeCanary
// // - Firefox
// // - Opera
// // - Safari
// // - PhantomJS
browsers = ['PhantomJS'];

// // Continuous Integration mode
// // if true, it capture browsers, run tests and exit
singleRun = true;