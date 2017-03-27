module.exports = {
  options: {
    sass: false
  },
  dev: {
    options: {
      config  : 'grunt/font-config.json',
      fonts   : 'src/font',
      styles  : '.tmp/font',
      scss    : false
      // force   : true
    }
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
