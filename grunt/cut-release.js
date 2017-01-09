module.exports = {
  options: {
    cleanup: true,
    keepUnstable: false,
    stableTasks: [
      'copy:less_cut_release'
    ]
  },
  dist: {
    files: [
      { src: '<%= dist %>/release/*.{js,css,svg,woff,ttf,eot}', dest: '<%= dist %>/release/' },
    ]
  }
};
