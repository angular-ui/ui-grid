module.exports = function() {
  var webdriverManagerPath = './node_modules/webdriver-manager/bin/webdriver-manager',
    bowerPath = './node_modules/bower/bin/bower';

  if (process.platform === 'win32') {
    webdriverManagerPath = '.\\node_modules\\webdriver-manager\\bin\\webdriver-manager';
    bowerPath = '.\\node_modules\\bower\\bin\\bower';
  }

  return {
    // selenium no longer used
    selenium: {
      command: './selenium/start',
      options: {
        async: true
      }
    },
    'protractor-install': {
      command: 'node ' + webdriverManagerPath + ' update'
    },
    'protractor-start': {
      command: 'node ' + webdriverManagerPath + ' start',
      options: {
        // apparently webdriver/selenium writes lots of trash on stderr, and the real output on stdout.  No idea why....
        stderr: false,
        async: true,
        execOptions: {
            maxBuffer: 400*1024 // or whatever other large value you want
        }
      }
    },
    'bower-install': {
      command: 'node ' + bowerPath + ' install'
    },
    'hooks-install': {
      command: 'npm run init'
    }
  };
};
