module.exports = {
  // selenium no longer used
  selenium: {
    command: './selenium/start',
    options: {
      async: true
    }
  },
  'protractor-install': {
    command: 'node ./node_modules/protractor/bin/webdriver-manager update'
  },
  'protractor-start': {
    command: 'node ./node_modules/protractor/bin/webdriver-manager start',
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
    command: 'node ./node_modules/bower/bin/bower install'
  }
};
