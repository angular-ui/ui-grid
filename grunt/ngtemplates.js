module.exports = {
  'uigrid': {
    // Look for templates in src and in feature template directories
    src: ['packages/*/src/templates/**/*.html'],
    dest: '.tmp/template.js',
    options: {
      module: 'ui.grid',
      htmlmin:  { collapseWhitespace: true, collapseBooleanAttributes: true },
      // Strip .html extension
      url: function(url) {
        // Remove the packages/feature/src/templates/ prefix
        url = url.replace(/^packages\/[^\/]+?\/src\/templates\/ui-grid/, 'ui-grid');

        // Replace feature prefix with just 'ui-grid'
        url = url.replace(/^packages\/[^\/]+?\/src\/templates/, 'ui-grid');

        // Remove the .html extension
        return url.replace('.html', '');
      }
    }
  }
};
