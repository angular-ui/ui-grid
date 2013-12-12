var fs = require('fs');
var path = require('path');
var util = require('./utils.js');

module.exports = function(grunt) {

  /*'angular-1.2.0': {
    options: {
      files: angularFiles('1.2.0').concat(testFiles.unit)
    }
  },
  'angular-1.2.1': {
    options: {
      files: angularFiles('1.2.1').concat(testFiles.unit)
    }
  },
  'angular-1.2.3': {
    options: {
      files: angularFiles('1.2.3').concat(testFiles.unit)
    }
  }*/


  /* Read in whatever angular versions are in lib/test/angular and register karma configs for them all! */
  // Angular testlib directory
  var angularLib = path.join('lib', 'test', 'angular');

  // Loop over all the files in the angular testlib directory
  fs.readdir(angularLib, function(err, files) {
    if (err) {
      grunt.fatal('Could not read angular test-lib directory (' + angularLib + '): ' + err);
    }

    // For each file found, make sure it's a directory...
    files.forEach(function(file) {
      var dir = path.join(angularLib, file);
      if (! fs.lstatSync(dir).isDirectory()) return;

      // .. then create a karma config for it!
      var karmaConfigName = 'angular-' + grunt.config.escape(file);

      grunt.config('karma.' + karmaConfigName, {
        options: {
          files: util.angularFiles(file).concat(util.testFiles.unit)
        }
      });
    });
  });

  grunt.config('customLaunchers', {
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
  });

  util.createSauceTasks();

  /*
   * 
   * Create tasks
   *
   */

  // Run tests on multiple versions of angular
  grunt.registerTask('karmangular', 'Run tests against multiple versions of angular', function() {
    // Start karma servers
    var karmaOpts = grunt.config('karma');

    var angularTasks = [];
    for (var o in karmaOpts) {
      if (/^angular-/.test(o)) {
        angularTasks.push(o);
      }
    }

    // If there's a start/run argument, run that argument on each angular task
    if (this.args.length > 0) {
      if (this.args[0] === 'start') {
        angularTasks.forEach(function(t) {
          // Set this karma config to background running
          grunt.config('karma.' + grunt.config.escape(t) + '.background', true);
          grunt.config('karma.' + grunt.config.escape(t) + '.singleRun', false);
          grunt.task.run('karma:' + t + ':start');
        });
      }
      else if (this.args[0] === 'run') {
        angularTasks.forEach(function(t) {
          // Set this karma config to background running
          grunt.config('karma.' + grunt.config.escape(t) + '.background', true);
          grunt.config('karma.' + grunt.config.escape(t) + '.singleRun', false);
          grunt.task.run('karma:' + t + ':run');
        });
      }
    }
    else {
      angularTasks.forEach(function(t) {
        // Set this task to single running
        grunt.config('karma.' + grunt.config.escape(t) + '.background', false);
        grunt.config('karma.' + grunt.config.escape(t) + '.singleRun', true);
        grunt.task.run('karma:' + t);
      });
    }
  });

  // Run multiple tests serially, but continue if one of them fails.
  // Adapted from http://stackoverflow.com/questions/16487681/gruntfile-getting-error-codes-from-programs-serially
  grunt.registerTask('serialsauce', function() {
    var done = this.async();

    var tasks = {'karma:sauce1': 0, 'karma:sauce2': 0, 'karma:sauce3': 0, 'karma:sauce4': 0};

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
        done(success);
    });
  });
};