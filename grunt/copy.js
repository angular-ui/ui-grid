const fs = require('fs');
const path = require('path');
const util = require('../lib/grunt/utils.js');
const semver = require('semver');
const currentTag = semver.clean(util.getCurrentTag());

const getDirectories = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());

module.exports = function ( grunt ) {
  function getPackagesFiles() {
    const packages = getDirectories('packages/');

    const npmIgnoreFiles = packages.map(function(feat) {
      return {
        flatten: true,
        src: 'misc/publish/.npmignore',
        dest: `packages/${feat}/.npmignore`
      }
    });

    const licenseFiles = packages.map(function(feat) {
      return {
        flatten: true,
        src: 'LICENSE.md',
        dest: `packages/${feat}/LICENSE.md`
      }
    });

    return npmIgnoreFiles.concat(licenseFiles);
  }
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
          cwd: 'packages/core/font',
          src: '**/*.eot',
          dest: '<%= dist %>/release/fonts'
        },
        {
          expand: true,
          cwd: 'packages/core/font',
          src: '**/*.svg',
          dest: '<%= dist %>/release/fonts'
        },
        {
          expand: true,
          cwd: 'packages/core/font',
          src: '**/*.ttf',
          dest: '<%= dist %>/release/fonts'
        },
        {
          expand: true,
          cwd: 'packages/core/font',
          src: '**/*.woff',
          dest: '<%= dist %>/release/fonts'
        }
      ]
    },
    fonts_cut_release: {
      files: [
        {
          expand: true,
          cwd: '<%= dist %>/release/fonts',
          src: '**/*',
          dest: '<%= dist %>/release/' + currentTag + '/fonts'
        }
      ]
    },
    js_dist: {
      files: [
        {
          expand: true,
          flatten: true,
          cwd: 'packages',
          src: '*/*.js',
          dest: '<%= dist %>/release',
          filter: function(filepath) {
            return !filepath.includes('packages/i18n')
          }
        },
        {
          expand: true,
          flatten: true,
          cwd: 'packages',
          src: '*/*.js',
          dest: '<%= dist %>/release/i18n',
          filter: 'isFile'
        }
      ]
    },
    i18n_cut_release: {
      files: [
        {
          expand: true,
          cwd: '<%= dist %>/release/i18n',
          src: '**/*.js',
          dest: '<%= dist %>/release/' + currentTag + '/i18n'
        }
      ]
    },
    less_customizer: {
      files: [
        {
          expand: true,
          cwd: 'packages/core/less',
          src: '**/*.less',
          dest: '<%= dist %>/less'
        },
        {
          expand: true,
          flatten: true,
          cwd: 'packages',
          src: '**/*.less',
          dest: '<%= dist %>/less',
          filter: function(filepath) {
            return !filepath.includes('packages/core/less');
          }
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
          cwd: 'packages/core/less',
          src: '**/*.less',
          dest: '<%= dist %>/release/less'
        },
        {
          expand: true,
          flatten: true,
          cwd: 'packages',
          src: '**/*.less',
          dest: '<%= dist %>/release/less',
          filter: function(filepath) {
            return !filepath.includes('packages/core/less');
          }
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
    },
    packages_publish: {
      files: getPackagesFiles()
    }
  };
};
