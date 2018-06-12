module.exports = {
  dev: {
    options: {
      port: process.env.DEV_PORT || 9004,
      base: '.',
      livereload: true
    }
  },
  docs: {
    options: {
      hostname: '*',
      port: process.env.DOCS_PORT || 9003,
      base: '<%= dist %>',
      livereload: true
    }
  },
  testserver: {
    options: {
      port: process.env.TEST_PORT || 9999,
      base: '<%= dist %>'
    }
  }
};
