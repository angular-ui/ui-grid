module.exports = {
  dist: {
    // paths: ['/bower_components/bootstrap'],
    options: {
      banner: '<%= banner %>'
    },
    files: {
      'dist/release/<%= pkg.name %>.css': ['src/less/main.less', 'src/features/*/less/**/*.less', '.tmp/ui-grid-codes.css']
    }
  },
  min: {
    options: {
      banner: '<%= banner %>',
      compress: true
    },
    files: {
      'dist/release/<%= pkg.name %>.min.css': ['src/less/main.less', 'src/features/*/less/**/*.less', '.tmp/ui-grid-codes.css']
    }
  }
};
