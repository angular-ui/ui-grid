const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const getDirectories = p => fs.readdirSync(p)
.filter(f => fs.statSync(path.join(p, f)).isDirectory() && fs.existsSync(path.join(p, f, 'src/templates')));

const htmlmin = {collapseWhitespace: true, collapseBooleanAttributes: true};

// Strip .html extension
function getUrl(url) {
  // Remove the packages/feature/src/templates/ prefix
    url = url.replace(/^packages\/[^\/]+?\/src\/templates\/ui-grid/, 'ui-grid');

    // Replace feature prefix with just 'ui-grid'
    url = url.replace(/^packages\/[^\/]+?\/src\/templates/, 'ui-grid');

    // Remove the .html extension
    return url.replace('.html', '');
}

function getTemplatesConfig() {
  let templatesConfig = {
    uigrid: {
      // Look for templates in packages directories
      src: ['packages/*/src/templates/**/*.html'],
      dest: '.tmp/template.js',
      options: {
        module: 'ui.grid',
        htmlmin,
        url: getUrl
      }
    }
  };

  const packages = getDirectories('packages/');

  packages.forEach((feat) => {
    templatesConfig[`uigrid-${feat}`] = {
      src: [`packages/${feat}/src/templates/**/*.html`],
      dest: `.tmp/template-${feat}.js`,
      options: {
        module: feat === 'core' ? 'ui.grid' : `ui.grid.${_.camelCase(feat)}`,
        htmlmin,
        url: getUrl
      }
    };
  });

  return templatesConfig;
}

module.exports = getTemplatesConfig();
