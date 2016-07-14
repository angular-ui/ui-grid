var fontello = require('../lib/grunt-fontello/tasks/fontello.js');

module.exports = {
  options: {
    sass: false
  },
  dist: {
    options: {
      proxy: 'http://172.16.0.250:4343',
      config  : 'src/font/config.json',
      fonts   : 'dist/release',
      styles  : '.tmp/font',
      scss    : false
      // force   : true
    }
  }
};
