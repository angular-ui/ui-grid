var fs = require('fs');
var path = require('path');
var util = require('./utils.js');

module.exports = function(grunt) {

  /*
   * 
   * Create tasks
   *
   */

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
    var options = grunt.config('serialsauce');

    var done = this.async();

    var tasks = {}; options.map(function(t) { tasks[t] = 0 });

    console.log('options', this.options());

    // grunt.task.run(options);

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

  grunt.registerTask('angulars', 'List available angular versions', function() {
    grunt.log.subhead("AngularJS versions available");
    grunt.log.writeln();
    util.angulars().forEach(function (a) {
      grunt.log.writeln(a);
    });
  });
};