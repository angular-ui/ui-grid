module.exports = {
  dist: {
    // src: 'lib/nuget/ui-grid.nuspec',
    src: 'ui-grid.nuspec',
    // dest: '.tmp/',
    dest: '.',
    options: {
      // basePath: '.',
      version: '<%= version %>',
      verbose: true
    }
  }
};
