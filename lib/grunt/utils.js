var fs = require('fs');
var path = require('path');
var grunt = require('grunt');
var semver = require('semver');
var shell = require('shelljs');

// Get the list of angular files (angular.js, angular-mocks.js, etc)
var cachedAngularFiles = grunt.file.readJSON('lib/test/angular/files.json');

var util = module.exports = {

  testDependencies: {
    unit: ['bower_components/jquery/jquery.min.js', 'lib/test/jquery.simulate.js','lib/test/classList.polyFill.js', 'dist/release/ui-grid.css', 'bower_components/lodash/dist/lodash.min.js', 'bower_components/csv-js/csv.js']
  },

  testFiles: {
    unit: ['src/js/core/bootstrap.js', 'src/js/**/*.js', 'test/unit/**/*.spec.js', 'src/features/*/js/**/*.js', 'src/features/*/test/**/*.spec.js', '.tmp/template.js'],
    core_unit: ['src/js/core/bootstrap.js', 'src/js/**/*.js', 'test/unit/**/*.spec.js', 'src/features/*/js/**/*.js', '.tmp/template.js'],
  },
  testFilesFeature: function(featureName){
    var featurePattern = 'src/features/' + featureName +'/test/**/*.spec.js';

    return {
      unit: ['src/js/core/bootstrap.js', 'src/js/**/*.js', 'test/unit/**/*.spec.js', 'src/features/*/js/**/*.js', featurePattern, '.tmp/template.js'],
      core_unit: util.testDependencies.unit.core_unit
    };
  },

  // Return a list of angular files for a specific version
  angularFiles: function (version) {
    if (version === 'latest') {
      version = util.latestAngular();
    }

    // Start with our test files
    var retFiles = []; //grunt.template.process('<%= karma.options.files %>').split(",");

    cachedAngularFiles.forEach(function(f) {
      var filePath = path.join('lib', 'test', 'angular', version, f);

      if (! fs.existsSync(filePath)) {
        grunt.fatal("Angular file " + filePath + " doesn't exist");
      }

      retFiles.push(filePath);
    });

    return retFiles;
  },

  startKarma: function(config, singleRun, done){
    var browsers = grunt.option('browsers');
    var reporters = grunt.option('reporters');
    var noColor = grunt.option('no-colors');
    var port = grunt.option('port');
    var p = spawn('node', ['node_modules/karma/bin/karma', 'start', config,
      singleRun ? '--single-run=true' : '',
      reporters ? '--reporters=' + reporters : '',
      browsers ? '--browsers=' + browsers : '',
      noColor ? '--no-colors' : '',
      port ? '--port=' + port : ''
    ]);
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
    p.on('exit', function(code){
      if(code !== 0) grunt.fail.warn("Karma test(s) failed. Exit code: " + code);
      done();
    });
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
      'SL_Safari_8': {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'Mac 10.10',
        version: '8'
      },
      'SL_Safari_9': {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'Mac 10.11',
        version: '9'
      },
      'SL_Safari_10': {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'Mac 10.12',
        version: '10'
      },
      'SL_Safari_11': {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'Mac 10.12',
        version: '11'
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
      'SL_MicrosoftEdge': {
        base: 'SauceLabs',
        browserName: 'MicrosoftEdge',
        platform: 'Windows 10'
      },

      // NOTE (mportuga): Currently android keeps failing. It might be a change to Sauce Labs to use Appium instead of selenium
      // 'SL_Android_4.4': {
      //   base: 'SauceLabs',
      //   browserName: 'android',
      //   platform: 'Linux',
      //   version: '4.4'
      // },
      // 'SL_Android_5.0': {
      //   base: 'SauceLabs',
      //   browserName: 'android',
      //   platform: 'Linux',
      //   version: '5.0'
      // },

      // NOTE (c0bra): Currently both iOS 6 and 7 will run (w/ a 45 second activity timeout) and the tests pass, but after that the session just hangs indefinitely -- 20140320
      // 'SL_iOS_6': {
      //   base: 'SauceLabs',
      //   browserName: 'iphone',
      //   platform: 'OS X 10.8',
      //   version: '6.0'
      // },
      // 'SL_iOS_7': {
      //   base: 'SauceLabs',
      //   browserName: 'iphone',
      //   platform: 'OS X 10.9',
      //   version: '7.0'
      // }
    };
  },

  //
  browsers: function() {

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

      if (! semver.valid(file)) return;

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
    var versions;
    
    if (grunt.option('fast')){
      versions = [util.latestAngular()];
    } else {
      // For each file found, make sure it's a directory...
      versions = grunt.option('angular') ? grunt.option('angular').split(/,/) : null || util.angulars();
    }

    if (grunt.option('angular')) {
      if (grunt.option('angular') === 'latest') {
        versions = [util.latestAngular()];
      }

      grunt.log.writeln("Using angular " + grunt.util.pluralize(versions, "version/versions") + ": " + versions.join(', '));
    }

    versions.forEach(function (version) {
      // .. then create a karma config for it!
      var karmaConfigName = 'angular-' + grunt.config.escape(version);

      if (grunt.option('core') || grunt.option('fast')){
        grunt.config('karma.' + karmaConfigName, {
          options: {
            files: util.testDependencies.unit
              .concat(util.angularFiles(version)
              .concat(util.testFiles.core_unit))
          }
        });
      } else if ( grunt.option('feature') ){
        grunt.config('karma.' + karmaConfigName, {
          options: {
            files: util.testDependencies.unit
              .concat(util.angularFiles(version)
              .concat(util.testFilesFeature(grunt.option('feature')).unit))
          }
        });
      } else {
        grunt.config('karma.' + karmaConfigName, {
          options: {
            files: util.testDependencies.unit
              .concat(util.angularFiles(version)
                .concat(util.testFiles.unit))
          }
        });
      }
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
        // reporters: ['saucelabs', 'coverage'],
        reporters: ['dots', 'saucelabs'],
        browsers: c
        // preprocessors: {
        //   'src/**/!(*.spec)+(.js)': ['coverage']
        // },
        // coverageReporter: {
        //   type: 'lcov',
        //   dir:  'coverage',
        //   subdir: '.'
        // }
      });
    });

    // console.log('tasks', chunks.map(function(c, i) { return 'karma:sauce-' + i }));

    grunt.config('serialsauce', chunks.map(function(c, i) { return 'karma:sauce-' + i }));
  },

  updateConfig: function() {
    grunt.config('customLaunchers', util.customLaunchers());
    util.createKarmangularConfig()
    util.createSauceConfig();

    if (process.env.TRAVIS) {
      // Update the config for the gh-pages task for it pushes changes as the user: Grud
      grunt.config('gh-pages.ui-grid-site.options.user', {
        name: 'grud',
        email: 'nggridteam@gmail.com'
      });

      grunt.config('gh-pages.ui-grid-site.options.repo', 'https://' + process.env.GITHUB_NAME + ':' + process.env.GITHUB_PASS + '@github.com/angular-ui/ui-grid.info.git');

      grunt.config('gh-pages.bower.options.user', {
        name: 'grud',
        email: 'nggridteam@gmail.com'
      });

      grunt.config('gh-pages.bower.options.repo', 'https://' + process.env.GITHUB_NAME + ':' + process.env.GITHUB_PASS + '@github.com/angular-ui/bower-ui-grid.git');
    }
  },

  // Return the tag for the current commit at HEAD if there is one, null if there isn't
  getCurrentTag: function() {
    var out = shell.exec('git tag -l --points-at HEAD', {silent:true});

    return out.stdout.trim();
  },

  // Get the current release version
  getVersion: function() {
    // Try to get a tag for the current version
    var out = shell.exec('git tag -l --points-at HEAD', {silent:true});

    var version, tag;

    // If there's a tag on this commit, use it as the version
    if (out.code === 0 && out.stdout && out.stdout.trim() !== '' && out.stdout.trim() !== null) {
      version = out.stdout.trim();
      tag = version;
    }
    // ...otherwise, get the most recent stable tag
    else {
      var hash;

      // If there isn't one then just get the most recent tag, whatever it is
      version = shell.exec('git rev-list --tags --max-count=1 | xargs git describe', {silent:true}).stdout.trim();

      // Get the short commit hash from the current commit to append to the most recent tag
      hash = shell.exec('git rev-parse --short HEAD', {silent:true}).stdout.trim();

      version = version + '-' + hash;

      tag = version;
    }

    tag = semver.clean(tag);

    return tag;
  },

  getStableVersion: function() {
    var cmd = 'git log --date-order --graph --tags --simplify-by-decoration --pretty=format:\"%ai %h %d\"';
    // grunt.log.writeln(cmd);
    var out = shell.exec(cmd, {silent:true}).stdout;

    // grunt.log.writeln(lines);

    var lines = out.split('\n');
    for (var i in lines) {
      var l = lines[i];

      var match = l.match(/\(.*?tag: (.+?)(\)|,)/);
      if (! match || match.length < 2 || !match[1]) { continue; }
      var tag = match[1];

      var v = semver.clean(tag);

      if (v && !v.match(/-.+?$/)) {
        return v;
      }
    }
  },

  travisFoldStart: function (msg) {
    if (!msg) { return; }
    grunt.log.writeln('travis_fold:start:' + msg);
  },

  travisFoldEnd: function (msg) {
    if (!msg) { return; }
    grunt.log.writeln('travis_fold:end:' + msg);
  }
};
