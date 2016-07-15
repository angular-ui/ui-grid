module.exports = {
  options: {
    sass: false
  },
  dist: {
    options: {
      config  : 'src/font/config.json',
      fonts   : 'dist/release/fonts',
      styles  : '.tmp/fonts',
      scss    : false
      // force   : true
    }
  }
};
