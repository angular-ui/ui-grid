/*
 * grunt-fontello
 * https://github.com/jubal/grunt-fontello
 *
 * Copyright (c) 2013 Jubal Mabaquiao
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    fontello: {
      test: {
        options: {
          config: 'test/config.json',
          fonts: 'test/output/fonts',
          styles: 'test/output/css',
          // scss: true
          // zip: 'test/output',
          force: true
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    },

    watch: {
      dist: {
        files: ['test/**/*.js', 'tasks/**/*.js', 'Gruntfile.js'],
        tasks: ['test']
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.

  // grunt.registerTask('test', ['clean','fontello', 'nodeunit']);
  grunt.registerTask('test', ['fontello']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test', 'watch']);

};
