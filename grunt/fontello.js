module.exports = {
  options: {
    sass: false
  },
  dist: {
    options: {
      config  : 'grunt/font-config.json',
      fonts   : 'dist/release',
      styles  : '.tmp/font',
      scss    : false
      // force   : true
    }
  }
};
