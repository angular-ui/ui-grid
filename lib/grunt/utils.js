var fs = require('fs');
var path = require('path');
var grunt = require('grunt');
var semver = require('semver');

module.exports = {

  testFiles: {
    unit: ['src/js/**/*.js', 'test/unit/**/*.spec.js', '.tmp/template.js']
  },

  // Return a list of angular files for a specific version
  angularFiles: function (version) {
    // Get the list of angulary files (angular.js, angular-mocks.js, etc)
    var files = grunt.file.readJSON('lib/test/angular/files.json');

    // Start with our test files
    var retFiles = []; //grunt.template.process('<%= karma.options.files %>').split(",");

    files.forEach(function(f) {
      var filePath = path.join('lib', 'test', 'angular', version, f);

      if (! fs.existsSync(filePath)) {
        grunt.fatal("Angular file " + filePath + " doesn't exist");
      }

      retFiles.push(filePath);
    });

    return retFiles;
  },

  latestAngular: function() {
    var angularLib = path.join('lib', 'test', 'angular');

    // Loop over all the files in the angular testlib directory
    var files = fs.readdirSync(angularLib);

    function sortFn(a,b) {
      return semver.gt(b, a);
    };

    // For each file found, make sure it's a directory...
    var versions = [];
    files.forEach(function(file) {
      var dir = path.join(angularLib, file);
      if (! fs.lstatSync(dir).isDirectory()) return;

      versions.push(file);
    });

    return versions.sort(sortFn)[0];
  },

  // Take the SauceLabs browsers from the karma config file and split them into groups of 3
  createSauceTasks: function() {
    var launchers = grunt.config('customLaunchers');

    var chunkNames = Object.keys(launchers);
    var chunks = 

    console.log('chunks', chunks);

    process.exit();
  }

};