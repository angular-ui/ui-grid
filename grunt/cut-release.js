module.exports = {
  options: {
    cleanup: true,
    keepUnstable: false,
    stableTasks: [
      'copy:css_cut_release',
      'copy:fonts_cut_release',
      'copy:i18n_cut_release',
      'copy:less_cut_release'
    ]
  },
  dist: {
    files: [
      { src: '<%= dist %>/release/*.{js,css,svg,woff,ttf,eot}', dest: '<%= dist %>/release/' },
    ]
  }
};
