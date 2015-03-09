
module.exports = function (grunt, options) {
  var baseTasks = {
    'install': ['shell:bower-install', 'shell:protractor-install'],
    
    // register before and after test tasks so we don't have to change cli
    // options on the CI server
    'before-test': ['clean', 'newer:jshint', 'newer:jscs', 'ngtemplates', 'less'], // Have to run less so CSS files are present
    'after-test': ['build'],
    'default': ['before-test', 'test:single', 'after-test'],
    
    // Build with no testing
    'build': ['ngtemplates', 'concat', 'uglify', 'fontello', 'less', 'ngdocs', 'copy'],

    // Auto-test tasks for development
    'autotest:unit': ['karmangular:start'],
    'autotest:e2e': ['shell:protractor-start'],
    
    // Testing tasks
    'test': ['before-test', 'test:single'],
    'test:ci': ['before-test', 'serialsauce'], // NOTE(c0bra): Removed this task for now, as Selenium is timing out while connecting to the Chromium browser... : 'test:ci-e2e'
    'test:docs': ['connect:testserver', 'protractor:docs'],
    'test:e2e': ['connect:testserver', 'protractor:singlerun'],
    'test:ci-e2e': ['clean', 'build', 'connect:testserver', 'protractor:ci']
  };
  
  if (grunt.option('e2e') === false || grunt.option('fast') ){
    grunt.log.writeln("Skipping e2e testing...");
    baseTasks['dev'] = ['before-test', 'after-test', 'connect', 'autotest:unit', 'watch'];
  } else {
    baseTasks['dev'] = ['before-test', 'after-test', 'connect', 'autotest:unit', 'autotest:e2e', 'watch'];
  }
  
  if (process.env.TRAVIS){
    baseTasks['test:single'] = ['karma:travis'];
  } else {
    baseTasks['test:single'] = ['karmangular'];
  }
  
  var util = require('../lib/grunt/utils.js');
  var semver = require('semver');
  var currentTag = semver.clean( util.getCurrentTag() );

  if (currentTag){
    baseTasks['release'] = ['clean', 'ngtemplates', 'build', 'cut-release', 'gh-pages:ui-grid-site', 'update-bower-json', 'gh-pages:bower'];
  } else {
    baseTasks['release'] = ['clean', 'ngtemplates', 'build', 'cut-release', 'gh-pages:ui-grid-site'];
  }
  
  return baseTasks;
};