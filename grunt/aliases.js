
module.exports = function (grunt, options) {
  var baseTasks = {
    'install': ['shell:bower-install', 'shell:protractor-install', 'shell:hooks-install'],

    // register before and after test tasks so we don't have to change cli
    // options on the CI server
    'before-test': ['clean', 'newer:jshint', 'newer:jscs', 'ngtemplates', 'less', 'copy:font_dist'], // Have to run less so CSS files are present
    'after-test': ['build'],
    'default': ['before-test', 'test:single', 'after-test'],

    // Build with no testing
    'build': ['ngtemplates', 'concat', 'uglify', 'less', 'ngdocs', 'copy:font_dist', 'copy:site', 'copy:less_customizer',],

    // Auto-test tasks for development
    'autotest:unit': ['karmangular:start'],
    'autotest:e2e': ['shell:protractor-start'],

    // Testing tasks
    'test': ['before-test', 'test:single'],
    'test:ci': ['before-test', 'serialsauce'],
    'test:docs': ['connect:testserver', 'protractor:docs'],
    'test:e2e': ['connect:testserver', 'protractor:singlerun'],
    'test:ci-e2e': ['clean', 'build', 'connect:testserver', 'protractor:ci']
  };

  baseTasks['dev'] = ['before-test', 'after-test', 'connect', 'autotest:unit', 'autotest:e2e', 'watch'];

  if (grunt.option('e2e') === false || grunt.option('fast')) {
    grunt.log.writeln("Skipping e2e testing...");
    baseTasks['dev'].splice(baseTasks['dev'].indexOf('autotest:e2e'), 1);
  }

  if (grunt.option('unit') === false) {
    grunt.log.writeln("Skipping unit testing...");
    baseTasks['dev'].splice(baseTasks['dev'].indexOf('autotest:unit'), 1);
  }

  if (process.env.TRAVIS){
    baseTasks['test:single'] = ['karma:travis'];
  }
  else {
    baseTasks['test:single'] = ['karmangular'];
  }

  var util = require('../lib/grunt/utils.js');
  var semver = require('semver');
  var currentTag = semver.clean( util.getCurrentTag() );

  if (currentTag) {
    baseTasks['release'] = ['clean', 'ngtemplates', 'build', 'copy:less_dist', 'cut-release', 'gh-pages:ui-grid-site', 'update-bower-json', 'gh-pages:bower', 'npm-publish'];
  }
  else {
    baseTasks['release'] = ['clean', 'ngtemplates', 'build', 'copy:less_dist', 'cut-release'];
  }

  return baseTasks;
};
