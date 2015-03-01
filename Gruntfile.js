// var eyes = require('eyes');
var path = require('path');
var util = require('./lib/grunt/utils.js');

// PaulL: gruntfile updated following advice from http://www.html5rocks.com/en/tutorials/tooling/supercharging-your-gruntfile/
// Major change is that individual task config lives in grunt/*.js, rather than in here.  Also
// introduced parallelism and grunt-newer

/*global module:false*/
module.exports = function(grunt) {
  require('time-grunt')(grunt);
  
  // use load-grunt-config to load config settings for each individual task from grunt/
  require('load-grunt-config')(grunt, {
    // use jitGrunt to automatically load the grunt tasks that we have defined in our package.json
    // we have to define static mappings for any tasks that don't follow the naming standard
    jitGrunt: {
      staticMappings: {
        'bump-only': 'grunt-bump',
        'bump-commit': 'grunt-bump',
        nugetpack: 'grunt-nuget',
        nugetpush: 'grunt-nuget',
        ngtemplates: 'grunt-angular-templates',
        changelog: 'grunt-conventional-changelog',
        shell: 'grunt-shell-spawn',
        jscs: 'grunt-jscs',
        protractor: 'grunt-protractor-runner',
        'stable-version': './lib/grunt/plugins.js',
        'current-version': './lib/grunt/plugins.js',
        'update-bower-json': './lib/grunt/plugins.js'
      }
    },

    // configuration variables that can be used within the individual config files
    data: {
      pkg: grunt.file.readJSON('package.json'),
      version: util.getVersion(),
      stable_version: util.getStableVersion(),
      dist: 'dist',
      site: process.env.TRAVIS ? 'ui-grid.info' : '127.0.0.1:<%= connect.docs.options.port %>',
      banner: '/*!\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' License: <%= pkg.license %> \n */\n\n'
    }

  });
  
  util.updateConfig();

  grunt.loadTasks('lib/grunt');

  // Tasks are now registered in the grunt/aliases.js file
};
