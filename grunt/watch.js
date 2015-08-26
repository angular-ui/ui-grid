var util = require('../lib/grunt/utils.js');

module.exports = function( grunt, options ){
  var config = {
    // list of files to watch, and tasks to run if those files change

    gruntfile: {
      files: ['<%= jshint.gruntfile.src %>', 'grunt/*.js'],
      tasks: ['jshint:gruntfile', 'ngdocs']
    },

    ngtemplates: {
      // files: ['src/templates/**/*.html', 'src/features/*/templates/**/*.html'],
      files: '<%= ngtemplates.uigrid.src %>',
      tasks: ['ngtemplates']
    },

    rebuild: {
      files: util.testFiles.unit,
      tasks: ['jshint:src_test', 'jscs', 'karmangular:run', 'concat', 'uglify', 'ngdocs'],
    },

    protractor: {
      files: ['.tmp/doc-scenarios/**/*.spec.js', 'test/e2e/**/*.spec.js'],
      tasks: ['protractor:auto']
    },

    less: {
      files: 'src/**/*.less',
      tasks: ['less', 'ngdocs', 'concat:customizer_less']
    },

    fontello: {
      files: 'src/font/config.json',
      tasks: ['fontello', 'less']
    },

    docs: {
      files: ['misc/tutorial/**/*.ngdoc', 'misc/api/**/*.ngdoc', 'misc/doc/**'],
      tasks: 'ngdocs'
    },

    copy: {
      files: ['misc/site/**'],
      tasks: 'copy:site'
    },

    livereload: {
      options: { livereload: true },
      files: ['dist/**/*', 'misc/demo/**/*.html', 'docs/**/*'],
    }
  };

  if (grunt.option('fast') || grunt.option('e2e') === false){
    config.protractor.tasks = [];
  }

  return  config;
};
