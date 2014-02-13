basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,

  // 3rd-party code
  'lib/jquery-1.9.1.js',
  'lib/angular.js',
  'test/lib/angular/angular-mocks.js',
  'test/lib/angular/browserTrigger.js',

  // App code
  'build/ng-grid.debug.js',
    
  // Plugins
  'plugins/*.js',

  // Test specs
  'test/unit/**/*.js'
];

autoWatch = true;

browsers = ['Chrome'];

// reporters = ['progress'];

junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};
