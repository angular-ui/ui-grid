module.exports = {
  options: {
    cleanup: true,
    keepUnstable: false
  },
  dist: {
    src: '<%= dist %>/release/*.{js,css,svg,woff,ttf,eot}',
    dest: '<%= dist %>/release/'
  }
};
