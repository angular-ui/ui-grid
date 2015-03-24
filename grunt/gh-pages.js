var util = require('../lib/grunt/utils.js');
var semver = require('semver');

// Get the tag on this commit, if there is one
var currentTag = semver.clean( util.getCurrentTag() );

module.exports = {
  'ui-grid-site': {
    options: {
      base: '<%= dist %>',
      tag: (currentTag) ? 'v' + currentTag : null,
      repo: 'https://github.com/angular-ui/ui-grid.info.git',
      message: 'gh-pages v<%= version %>',
      add: true
    },
    src: ['**/*']
  },
  'bower': {
    options: {
      base: '<%= dist %>/release/' + currentTag,
      tag: (currentTag) ? 'v' + currentTag : null,
      repo: 'https://github.com/angular-ui/bower-ui-grid.git',
      message: 'v' + currentTag,
      branch: 'master',
      add: true
    },
    src: ['**/*']
  }
};
