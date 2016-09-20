module.exports = {
  options: {
    banner: '<%= banner %>',
    stripBanners: true
  },
  dist: {
    src: ['src/js/core/bootstrap.js', 'src/js/**/*.js', 'src/features/*/js/**/*.js', '.tmp/template.js'],
    dest: '<%= dist %>/release/<%= pkg.name %>.js'
  },
};
