var fs = require('fs');
var path = require('path');
var grunt = require('grunt');
var semver = require('semver');

var util = module.exports = {

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

  customLaunchers: function() {
    return {
      'SL_Chrome': {
        base: 'SauceLabs',
        browserName: 'chrome'
      },
      'SL_Firefox': {
        base: 'SauceLabs',
        browserName: 'firefox'
      },
      'SL_Safari': {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'Mac 10.8',
        version: '6'
      },
      'SL_IE_8_XP': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows XP',
        version: '8'
      },
      'SL_IE_8': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '8'
      },
      'SL_IE_9': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '9'
      },
      'SL_IE_10': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '10'
      },
      'SL_IE_11': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 8.1',
        version: '11'
      },
      'SL_Android_4': {
        base: 'SauceLabs',
        browserName: 'android',
        platform: 'Linux',
        version: '4.0'
      },
      'SL_iOS_6': {
        base: 'SauceLabs',
        browserName: 'iphone',
        platform: 'OS X 10.8',
        version: '6.0'
      }
    };
  },

  angulars: function() {
    var angularLib = path.join('lib', 'test', 'angular');

    // Loop over all the files in the angular testlib directory
    var files = fs.readdirSync(angularLib);

    // For each file found, make sure it's a directory...
    var versions = [];
    files.forEach(function(file) {
      var dir = path.join(angularLib, file);
      if (! fs.lstatSync(dir).isDirectory()) return;

      versions.push(file);
    });

    return versions;
  },

  latestAngular: function() {
    function sortFn(a,b) {
      return semver.gt(b, a);
    };

    // For each file found, make sure it's a directory...
    var versions = util.angulars();

    return versions.sort(sortFn)[0];
  },

  /* Read in whatever angular versions are in lib/test/angular and register karma configs for them all! */
  createKarmangularConfig: function() {
    // For each file found, make sure it's a directory...
    var versions = grunt.option('angular').split(/,/) || util.angulars();

    if (grunt.option('angular')) {
      grunt.log.writeln("Using angular " + grunt.util.pluralize(versions, "version/versions") + ": " + versions.join(', '));
    }

    versions.forEach(function (version) {
      // .. then create a karma config for it!
      var karmaConfigName = 'angular-' + grunt.config.escape(version);

      grunt.config('karma.' + karmaConfigName, {
        options: {
          files: util.angularFiles(version).concat(util.testFiles.unit)
        }
      });
    });
  },

  // Take the SauceLabs browsers from the karma config file and split them into groups of 3
  createSauceConfig: function() {
    var launchers = util.customLaunchers();

    var chunkNames = Object.keys(launchers);
    var chunks = [].concat.apply([], chunkNames.map(function (c, i) {
      return i % 3 ? [] : [ chunkNames.slice(i, i + 3) ];
    }));

    // console.log(chunks);
    chunks.forEach(function (c, i) {
      grunt.config('karma.sauce-' + i, {
        background: false,
        singleRun: true,
        reporters: ['saucelabs'],
        browsers: c
      });
    });

    // console.log('tasks', chunks.map(function(c, i) { return 'karma:sauce-' + i }));

    grunt.config('serialsauce', chunks.map(function(c, i) { return 'karma:sauce-' + i }));
  },

  updateConfig: function() {
    grunt.config('customLaunchers', util.customLaunchers());
    util.createKarmangularConfig()
    util.createSauceConfig();
  }

};