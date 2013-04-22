basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,

  // 3rd-party code
  'lib/jquery-1.9.1.js',
  'lib/angular.js',
  // 'test/lib/angular/angular-mocks.js',

  // App code
  'build/ng-grid.debug.js',

  // Test-specific code
  'test/lib/angular/ngMidwayTester.js',

  //Test-Specs
  './test/midway/**/*.js'
];

autoWatch = false;

browsers = ['PhantomJS'];

junitReporter = {
  outputFile: 'test_out/midway.xml',
  suite: 'unit'
};