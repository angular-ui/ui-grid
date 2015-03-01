module.exports = {
  options: {
    keepAlive: true,
    configFile: './test/protractor.conf.js',
    args: {
      baseUrl: 'http://127.0.0.1:9999'
    }
  },
  singlerun: {
    options: {
      keepAlive: false
    }
  },
  ci: {
    options: {
      keepAlive: false,
      configFile: './test/protractor.ci.conf.js',
      args: {
        // sauceUser: process.env.SAUCE_USERNAME,
        // sauceKey: process.env.SAUCE_ACCESS_KEY
      }
    }
  },
  auto: {
    options: {
      // Just use base config
    }
  }
};
