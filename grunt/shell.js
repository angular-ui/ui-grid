module.exports = {
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
      stdout: false,
      async: true
    }
  },
  'bower-install': {
    command: 'node ./node_modules/bower/bin/bower install'
  }
};
