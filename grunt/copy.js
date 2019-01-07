const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const package = require('../package.json');
const util = require('../lib/grunt/utils.js');
const semver = require('semver');
const currentTag = semver.clean(util.getCurrentTag());

const getDirectories = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());

module.exports = function ( grunt ) {
  function getPackagesFiles() {
    const packages = getDirectories('packages/');

    let npmIgnoreFiles = [],
      licenseFiles = [];

    packages.forEach(function(feat) {
      let featModuleName = '.' + _.camelCase(feat);
      let featMainPath = `./js/${package.name}.${feat}`;

      switch(feat) {
        case 'cellnav':
          featModuleName = '.cellNav';
          break;
        case 'core':
          featModuleName = '';
          break;
        case 'i18n':
          featMainPath = `./js/${package.name}.language.all`;
          featModuleName = '';
          break;
      }
      fs.writeFileSync(
        `packages/${feat}/index.js`,
        `require('${featMainPath}')\nmodule.exports = 'ui.grid${featModuleName}';`
      );
      npmIgnoreFiles.push({
        flatten: true,
        src: 'misc/publish/.npmignore',
        dest: `packages/${feat}/.npmignore`
      });
      licenseFiles.push({
        flatten: true,
        src: 'LICENSE.md',
        dest: `packages/${feat}/LICENSE.md`
      });
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
    css_cut_release: {
      files: [
        {
          expand: true,
          cwd: '<%= dist %>/release/css',
          src: '**/*',
          dest: `<%= dist %>/release/${currentTag}/css`
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
    packages_dist: {
      files: [
        {
          expand: true,
          flatten: true,
          cwd: 'packages',
          src: '*/js/*.js',
          dest: '<%= dist %>/release',
          filter: function(filepath) {
            return !filepath.includes('packages/i18n')
          }
        },
        {
          expand: true,
          flatten: true,
          cwd: 'packages',
          src: '*/js/*.js',
          dest: '<%= dist %>/release/i18n',
          filter: 'isFile'
        },
        {
          expand: true,
          flatten: true,
          cwd: 'packages',
          src: '*/css/*.css',
          dest: '<%= dist %>/release/css',
          filter: 'isFile'
        }
      ]
    },
    packages_publish: {
      files: getPackagesFiles()
    }
  };
};
