module.exports = {
  options: {
    banner: '<%= banner %>',
    stripBanners: true
  },
  dist: {
    src: ['src/js/core/bootstrap.js', 'src/js/**/*.js', 'src/features/*/js/**/*.js', '.tmp/template.js'],
    dest: '<%= dist %>/release/<%= pkg.name %>.js'
  },

  // Concat all the less files together for the customizer
  customizer_less: {
    options: {
      process: function(src, filepath) {
        // Strip import statements since we're concatting
        return src.replace(/\@import\s*.+?;/g, '');
      }
    },
    src: 'src/less/**/*.less',
    dest: '<%= dist %>/less/<%= pkg.name %>.less'
  }
};
