var fs = require('fs');
var path = require('canonical-path');
var util = require('./utils.js');
var semver = require('semver');
var shell = require('shelljs');

var ngdoc = require('../../node_modules/grunt-ngdocs/src/ngdoc.js');
var reader = require('../../node_modules/grunt-ngdocs/src/reader.js');

var projectPath = path.resolve(__dirname, '../..');
var pkg = require(path.resolve(projectPath, 'package.json'));
var bwr = require(path.resolve(projectPath, 'bower.json'));

module.exports = function(grunt) {

  /*
   *
   * Create tasks
   *
   */

  grunt.registerMultiTask('tests', '**Use `grunt test` instead**', function(){
    util.startKarma.call(util, this.data, true, this.async());
  });

  // Run tests on multiple versions of angular
  grunt.registerTask('karmangular', 'Run tests against multiple versions of angular', function() {
    // Start karma servers
    var karmaOpts = grunt.config('karma');

    if (grunt.option('browsers')) {
      grunt.config('karma.options.browsers', grunt.option('browsers').split(/,/).map(function(b) { return b.trim(); }));
    }

    var angularTasks = [];
    for (var o in karmaOpts) {
      if (/^angular-/.test(o)) {
        angularTasks.push(o);
      }
    }


    // If there's a start/run argument, run that argument on each angular task
    if (this.args.length > 0) {
      // Run a test on the most recent angular
      if (this.args[0] === 'latest') {
        var latest = 'angular-' + util.latestAngular();
        var configNamespace = 'karma.' + grunt.config.escape(latest);
        grunt.config(configNamespace + '.background', false);
        grunt.config(configNamespace + '.singleRun', true);
        grunt.task.run('karma:' + latest);
      }

      if (this.args[0] === 'start') {
        angularTasks.forEach(function(t) {
          // Set this karma config to background running
          var configNamespace = 'karma.' + grunt.config.escape(t);
          grunt.config(configNamespace + '.background', true);
          grunt.config(configNamespace + '.singleRun', false);
          grunt.task.run('karma:' + t + ':start');
        });
      }
      else if (this.args[0] === 'run') {
        angularTasks.forEach(function(t) {
          // Set this karma config to background running
          var configNamespace = 'karma.' + grunt.config.escape(t);
          grunt.config(configNamespace + '.background', true);
          grunt.config(configNamespace + '.singleRun', false);
          grunt.task.run('karma:' + t + ':run');
        });
      }
    }
    else {
      angularTasks.forEach(function(t) {
        // Set this task to single running
        var configNamespace = 'karma.' + grunt.config.escape(t);
        grunt.config(configNamespace + '.background', false);
        grunt.config(configNamespace + '.singleRun', true);

        grunt.task.run('karma:' + t);
      });
    }
  });

  // Run multiple tests serially, but continue if one of them fails.
  // Adapted from http://stackoverflow.com/questions/16487681/gruntfile-getting-error-codes-from-programs-serially
  grunt.registerTask('serialsauce', function(){
    // util.travisFoldStart('serialsauce');

    var options = grunt.config('serialsauce');

    var done = this.async();

    var tasks = {}; options.map(function(t) { tasks[t] = 0 });

    var success = true;
    grunt.util.async.forEachSeries(Object.keys(tasks),
      function(task, next) {
        grunt.util.spawn({
          grunt: true,  // use grunt to spawn
          args: [task], // spawn this task
          opts: { stdio: 'inherit' } // print to the same stdout
        }, function(err, result, code) {
          tasks[task] = code;
          if (code !== 0) {
            success = false;
          }
          next();
        });
      },
      function() {
        // util.travisFoldEnd('serialsauce');
        done(success);
    });
  });

  grunt.registerTask('coverage', function () {
    var latest = 'angular-' + util.latestAngular();
    var configNamespace = 'karma.' + grunt.config.escape(latest);
    grunt.config(configNamespace + '.background', false);
    grunt.config(configNamespace + '.singleRun', true);
    grunt.config(configNamespace + '.reporters', ['coverage']);
    grunt.config(configNamespace + '.preprocessors', {
      'src/**/!(*.spec)+(.js)': ['coverage']
    });
    grunt.config(configNamespace + '.coverageReporter', {
      type: 'lcov',
      dir:  'coverage',
      subdir: '.'
    });

    grunt.task.run('karma:' + latest);
  });

  grunt.registerTask('angulars', 'List available angular versions', function() {
    grunt.log.subhead("AngularJS versions available");
    grunt.log.writeln();
    util.angulars().forEach(function (a) {
      grunt.log.writeln(a);
    });
  });

  grunt.registerTask('saucebrowsers', 'List available saucelabs browsers', function() {
    grunt.log.subhead('SauceLabs Browsers Configured');
    grunt.log.writeln();

    var browsers = util.customLaunchers();
    for (var name in browsers) {
      var b = browsers[name];

      var outs = [];
      ['browserName', 'version', 'platform'].map(function (o) {
        if (b[o]) { outs.push(b[o]); }
      });

      grunt.log.write(grunt.log.wordlist([name], { color: 'yellow' }));

      grunt.log.writeln(grunt.log.wordlist([
        ' [',
        outs.join(' | '),
        ']'
      ], { color: 'green', separator: '' }));
    };
  });

  // Utility functions for showing the version
  grunt.registerTask('current-version', function () {
    grunt.log.writeln(util.getVersion());
  });
  grunt.registerTask('stable-version', function () {
    grunt.log.writeln(util.getStableVersion());
  });

  grunt.registerMultiTask('cut-release', 'Release the built code', function() {
    // Require the build and ngdocs tassk to be run first
    grunt.task.requires(['build']);

    var options = this.options({
      stableSuffix: '',
      unstableSuffix: '-unstable',
      cleanup: false
    });

    var done = this.async(),
        self = this;

    var tag = util.getVersion();

    var currentTag = util.getCurrentTag();

    grunt.log.writeln("Version: " + tag);

    if (!tag) {
      grunt.fatal("Couldn't get git version");
    }

    // Figure out if the tag is stable or not (if it has a hyphen in it it's unstable)
    var stable = !/-.+$/.test(tag);
    grunt.log.writeln('stable', stable);

    // Log release type
    grunt.log.writeln(
     'Preparing '
     + grunt.log.wordlist([stable ? 'stable' : 'unstable'], { color: stable ? 'green' : 'yellow'})
     + ' release version '
     + tag
    );

    // If this is a stable release, create a directory for it in the releases dir
    var extension = stable ? options.stableSuffix : options.unstableSuffix;

    self.files.forEach(function (file) {
      var releaseDir;

      // If we're on a stable release or we want to keep unstable releases, create a directory for this release and copy the built files there
      if (currentTag || options.keepUnstable) {
        grunt.log.writeln("DEST: " + file.dest);
        grunt.log.writeln("TAG: " + tag);
        releaseDir = path.join(file.dest, tag);
      }

      file.src.forEach(function (f) {
        var oldFileName = path.basename(f);
        var ext = path.extname(f);
        var basename = path.basename(f, ext);

        if (basename.match(/.min/)) {
          ext = '.min' + ext;
          basename = path.basename(f, ext);
        }

        // Skip file if it was already released
        var exp;
        if (options.stableSuffix !== ''){
          exp = '(' + options.stableSuffix + '|' + options.unstableSuffix + ')';
        } else {
          exp = '(' + options.unstableSuffix + ')';
        }
        var re = new RegExp(exp);
        if (basename.match(re)) {
          grunt.log.writeln("Skipping file: " + f);
          return;
        }

        // Insert -unstable or -stable into the filename for .css and .js files
        var newFileName;
        if (/(css|js)/.test(ext)) {
          newFileName = basename + extension + ext;
        }
        else {
          newFileName = basename + ext;
        }

        // If this is a stable release
        if (releaseDir) {
          // Create the stable directory if it doesn't exist
          if (!fs.existsSync(releaseDir)) {
            fs.mkdirSync(releaseDir);
          }

          var releasePath = path.join(releaseDir, oldFileName);

          if (path.normalize(f) !== path.normalize(releasePath)) {
            grunt.log.writeln('Copying ' + f + ' to ' + releasePath);
            // fs.createReadStream(f).pipe(fs.createWriteStream(stablePath));
            shell.cp('-f', f, releasePath);
          }
        }

        var newPath = path.join(file.dest, newFileName);

        if (path.normalize(f) !== path.normalize(newPath)) {
          grunt.log.writeln('Copying ' + f + ' to ' + newPath);
          // fs.createReadStream(f).pipe(fs.createWriteStream(newPath));
          shell.cp('-f', f, newPath);
        }

        if (options.cleanup && path.normalize(f) !== path.normalize(newPath)) {
          grunt.log.writeln('Unlinking ' + f, newPath);
          shell.rm(f);
        }
      });

      //Run tasks for a stable release
      if (currentTag && options.stableTasks) {
        grunt.task.run(options.stableTasks);
      }
    });

    done();
  });

  // Copies a file into the release directory
  function copyIntoRelease(taggedReleaseDir, filePath) {
    var file = path.resolve(projectPath, filePath);

    shell.cp('-f', file, taggedReleaseDir);
  }

  // Create the bower.json file
  grunt.registerTask('update-bower-json', function () {
    var currentTag = semver.clean( util.getVersion() );

    var taggedReleaseDir = path.join(path.resolve(process.cwd()), 'dist', 'release', currentTag);

    // Get the list of files from the release directory
    var releaseFiles = fs.readdirSync(taggedReleaseDir)
      // Filter out the bower.json and package.json file, if it's there already
      .filter(function (f) {
      	return !/^bower\.json$/.test(f)
          && !/^package\.json$/.test(f);
			});

    // Copy a README file
    copyIntoRelease(taggedReleaseDir, 'misc/publish/README.md');

    // Copy a CHANGELOG file
    copyIntoRelease(taggedReleaseDir, 'CHANGELOG.md');

    // Copy a index.js file
    copyIntoRelease(taggedReleaseDir, 'misc/publish/index.js');

    var bowerJsonFile = path.join(taggedReleaseDir, 'bower.json');
    var pkgJsonFile = path.join(taggedReleaseDir, 'package.json');

    var json = {
      'name': 'angular-ui-grid',
      'description': pkg.description,
      'main': bwr.main,
      'ignore': [],
      'dependencies': {
        'angular': '>=1.4.0 1.5.x'
      },
      'repository': pkg.repository,
      'homepage': 'http://ui-grid.info',
      'bugs': { url : 'https://github.com/angular-ui/ui-grid/issues' },
      'keywords': pkg.keywords,
      'license': pkg.license
    };

    fs.writeFileSync(bowerJsonFile, JSON.stringify(json, null, 2));

    // For package.json
    json.version = currentTag;
    json.main = pkg.main;
    json.files = releaseFiles;

    fs.writeFileSync(pkgJsonFile, JSON.stringify(json, null, 2));
  });

  // Publish release to NPM
  grunt.registerTask('npm-publish', function (done) {
    var done = this.async();

    var currentTag = semver.clean( util.getCurrentTag() );

    var taggedReleaseDir = path.join(path.resolve(process.cwd()), 'dist', 'release', currentTag);

    process.chdir(taggedReleaseDir);

    shell.exec('npm publish', function (code, output) {
      done();
    });
  });

  grunt.registerTask('blah', function () {
    reader.docs = []
    grunt.file.recurse(path.resolve(process.cwd(), 'src'), function (abspath, rootdir, subdir, filename) {
      if (!/style\.js$/.test(filename)) { return; }

      var contents = fs.readFileSync(abspath, 'utf8');

      // var d = new ngdoc.Doc(contents);
      // d.parse();
      // console.log(d);

      reader.process(contents, abspath);
    });

    console.log(reader.docs[0].convertUrlToAbsolute());
  });
};
