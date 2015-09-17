module.exports = {
  'uigrid': {
    // Look for templates in src and in feature template directories
    src: ['src/templates/**/*.html', 'src/features/*/templates/**/*.html'],
    dest: '.tmp/template.js',
    options: {
      module: 'ui.grid',
      htmlmin:  { collapseWhitespace: true, collapseBooleanAttributes: true },
      // Strip .html extension
      url: function(url) {
        // Remove the src/templates/ prefix
        url = url.replace(/^src\/templates\//, '');

        // Replace feature prefix with just 'ui-grid'
        url = url.replace(/^src\/features\/[^\/]+?\/templates/, 'ui-grid');

        // Remove the .html extension
        return url.replace('.html', '');
      }
    }
  }
};
