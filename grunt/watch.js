var util = require('../lib/grunt/utils.js');

module.exports = function( grunt, options ){
  var config = {
    // list of files to watch, and tasks to run if those files change

    gruntfile: {
      files: ['packages/*/src/**/*.js', 'packages/*/test/**/*.spec.js', 'test/**/*.spec.js', 'grunt/*.js'],
      tasks: ['shell:lint', 'uidocs-generator']
    },

    ngtemplates: {
      // files: ['packages/*/src/templates/**/*.html'],
      files: '<%= ngtemplates.uigrid.src %>',
      tasks: ['ngtemplates']
    },

    rebuild: {
      files: util.testFiles.unit,
      tasks: ['shell:lint', 'karmangular:run', 'concat', 'uglify', 'uidocs-generator'],
    },

    protractor: {
      files: ['.tmp/doc-scenarios/**/*.spec.js', 'test/e2e/**/*.spec.js'],
      tasks: ['protractor:auto']
    },

    less: {
      files: 'src/**/*.less',
      tasks: ['less', 'uidocs-generator', 'concat:customizer_less']
    },

    docs: {
      files: ['misc/tutorial/**/*.ngdoc', 'misc/api/**/*.ngdoc', 'misc/doc/**'],
      tasks: 'uidocs-generator'
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
