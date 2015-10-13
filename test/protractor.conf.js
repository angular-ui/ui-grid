// Protractor config file for local test running
exports.config = {
  // The address of a running selenium server.

  //seleniumAddress: 'http://localhost:4444/wd/hub',
  seleniumServerJar: '../node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
  seleniumPort: 4444,

  specs: ['../.tmp/doc-scenarios/**/*.spec.js', 'e2e/**/*.spec.js'],

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    browserName: 'chrome'
  },

  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  // baseUrl: 'http://localhost:9999',

  // Spec patterns are relative to the location of the spec file. They may
  // include glob patterns.
  // specs: ['./e2e/**/*.spec.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true, // Use colors in the command line report.

    // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 60000,

    // Don't show the stack trace, it's mostly useless
    includeStackTrace: false
  },

  plugins: [{
    chromeA11YDevTools: {
      // Since the site has some serious element contrast issues this is needed.
      treatWarningsAsFailures: false
    },
    path: '../node_modules/protractor/plugins/accessibility'
  }]
};
