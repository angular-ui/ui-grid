var util = require('../lib/grunt/utils.js');

module.exports = {
  // list of files to watch, and tasks to run if those files change
  
  gruntfile: {
    files: '<%= jshint.gruntfile.src %>',
    tasks: ['jshint:gruntfile']
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
    tasks: ['ngdocs', 'protractor-watch:auto']
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
    tasks: 'copy'
  },

  livereload: {
    options: { livereload: true },
    files: ['dist/**/*', 'misc/demo/**/*.html', 'docs/**/*'],
  }
};
