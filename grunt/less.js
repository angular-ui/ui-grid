module.exports = {
  dist: {
    // paths: ['/bower_components/bootstrap'],
    options: {
      banner: '<%= banner %>'
    },
    files: [
      {
        src: ['packages/core/src/less/main.less', 'packages/*/src/less/**/*.less', '.tmp/font/ui-grid-codes.css'],
        dest: 'dist/release/<%= pkg.name %>.css',
        filter: function(filepath) {
          return filepath === 'packages/core/src/less/main.less' || !filepath.includes('packages/core/src/less/');
        }
      }
    ]
  },
  min: {
    options: {
      banner: '<%= banner %>',
      compress: true
    },
    files: [
      {
        src: ['packages/core/src/less/main.less', 'packages/*/src/less/**/*.less', '.tmp/font/ui-grid-codes.css'],
        dest: 'dist/release/<%= pkg.name %>.min.css',
        filter: function(filepath) {
          return filepath === 'packages/core/src/less/main.less' || !filepath.includes('packages/core/src/less/');
        }
      }
    ]
  }
};
