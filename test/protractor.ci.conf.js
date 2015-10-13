// Protractor config file for Travis CI
exports.config = {
  // The address of a running selenium server.

  //seleniumAddress: 'http://localhost:4444/wd/hub',
  seleniumServerJar: '../node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
  // seleniumPort: 4444,

  specs: ['../.tmp/doc-scenarios/**/*.spec.js', 'e2e/**/*.spec.js'],

  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    browserName: 'chrome',
    build: process.env.TRAVIS_BUILD_NUMBER,
    // 'tunnel-identifier': process.env.TRAVIS_BUILD_NUMBER,
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
  },

  // Wait 5m (30 seconds) for page synchronization
  allScriptsTimeout: 300000, // 30000
  includeStackTrace: true,

  // A base URL for your application under test. Calls to protractor.get()
  // with relative paths will be prepended with this.
  // baseUrl: 'http://localhost:9999',

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true, // Use colors in the command line report.

    // Default time to wait in ms before a test fails.
    defaultTimeoutInterval: 12000, // 60000

    // Don't show the stack trace, it's mostly useless
    includeStackTrace: false,

    realtimeFailure: true
  },
  
  plugins: [{
    chromeA11YDevTools: {
      // Since the site has some serious element contrast issues this is needed.
      treatWarningsAsFailures: false
    },
    path: '../node_modules/protractor/plugins/accessibility'
  }]
};
