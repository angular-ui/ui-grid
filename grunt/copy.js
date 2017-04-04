var util = require('../lib/grunt/utils.js');
var semver = require('semver');
var currentTag = semver.clean( util.getCurrentTag() );
module.exports = function ( grunt ) {
  return {
    site: {
      options: {
        processContent: function (content, srcpath) {
          return grunt.template.process(content);
        }
      },
      files: [
        {
          expand: true,
          cwd: 'misc/site/',
          src: '**',
          dest: '<%= dist %>'
        }
      ]
    },
    font_dist: {
      files: [
        {
          expand: true,
          cwd: 'src/font',
          src: '**/*.eot',
          dest: '<%= dist %>/release/'
        },
        {
          expand: true,
          cwd: 'src/font',
          src: '**/*.svg',
          dest: '<%= dist %>/release/'
        },
        {
          expand: true,
          cwd: 'src/font',
          src: '**/*.ttf',
          dest: '<%= dist %>/release/'
        },
        {
          expand: true,
          cwd: 'src/font',
          src: '**/*.woff',
          dest: '<%= dist %>/release/'
        }
      ]
    },
    less_customizer: {
      files: [
        {
          expand: true,
          cwd: 'src/less',
          src: '**/*.less',
          dest: '<%= dist %>/less'
        },
        {
          expand: true,
          cwd: 'src/features',
          src: '**/*.less',
          dest: '<%= dist %>/less'
        },
        {
          expand: true,
          cwd: 'node_modules/bootstrap',
          src: '**/*.less',
          dest: '<%= dist %>/bootstrap'
        }
      ]
    },
    less_dist: {
      files: [
        {
          expand: true,
          cwd: 'src/less',
          src: '**/*.less',
          dest: '<%= dist %>/release/less'
        },
        {
          expand: true,
          cwd: 'src/features',
          src: '**/*.less',
          dest: '<%= dist %>/release/less'
        }
      ]
    },
    less_cut_release: {
      files: [
        {
          expand: true,
          cwd: '<%= dist %>/release/less',
          src: '**/*.less',
          dest: '<%= dist %>/release/' + currentTag + '/less'
        }
      ]
    }
  };
};
