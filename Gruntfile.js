// var eyes = require('eyes');

/*global module:false*/
module.exports = function(grunt) {

  // Include ui-grid.js first as it instantiates the module
  var testFiles = {
    unit: ['src/js/**/*.js', 'test/unit/**/*.spec.js', '.tmp/template.js']
  };

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= pkg.license %> */\n',

    // Clean the temp directory
    clean: ['.tmp', 'dist'],

    // Templates
    ngtemplates: {
      'ui-grid': {
        cwd: 'src/templates',
        src: ['**/*.html'],
        dest: '.tmp/template.js',
        options: {
          module: 'ui.grid',
          htmlmin:  { collapseWhitespace: true, collapseBooleanAttributes: true },
          // Strip .html extension
          url: function(url) { return url.replace('.html', ''); }
        }
      }
    },

    // ngtemplates: {
    //   'ui-grid': {
    //     cwd: 'src/templates',
    //     src: '_partials/**/*.html',
    //     dest: '.tmp/template.js',
    //     options: {
    //       htmlmin:  { collapseWhitespace: true, collapseBooleanAttributes: true }
    //     }
    //   }
    // },

    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['src/js/**/*.js', '.tmp/template.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    less: {
      dist: {
        // paths: ['/bower_components/bootstrap'],
        files: {
          'dist/<%= pkg.name %>.css': 'src/less/main.less',
        }
      },
      min: {
        files: {
          'dist/<%= pkg.name %>.min.css': 'src/less/main.less',
        },
        options: {
          compress: true
        }
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      concat: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },

    karma: {
      options: {
        configFile: 'test/karma.conf.js',
        files: angularFiles('1.2.3').concat(testFiles.unit),
        background: true
      },
      // dev: {
      //   singleRun: false,
      //   background: true
      // },
      single: {
        background: false,
        singleRun: true,
        reporters: ['dots'],
      },

      // CI tasks are broken apart as the free Sauce Labs account only lets us have 3 concurrent browsers

      // sauce: {
      //   background: false,
      //   singleRun: true,
      //   reporters: ['saucelabs'],
      //   // browsers: [ 'SL_Chrome', 'SL_Safari', 'SL_Firefox', 'SL_IE_8_XP', 'SL_IE_9', 'SL_IE_10', 'SL_IE_11', 'SL_Android_4', 'SL_iOS_6' ]
      //   browsers: [ 'SL_Chrome' ]
      // },

      'sauce1': {
        background: false,
        singleRun: true,
        reporters: ['saucelabs'],
        browsers: [ 'SL_Chrome', 'SL_Safari', 'SL_Firefox'  ]
      },
      'sauce2': {
        background: false,
        singleRun: true,
        reporters: ['saucelabs'],
        browsers: [ 'SL_IE_8_XP', 'SL_IE_8', 'SL_IE_9' ]
      },
      'sauce3': {
        background: false,
        singleRun: true,
        reporters: ['saucelabs'],
        browsers: [ 'SL_IE_10', 'SL_IE_11' ]
      },
      'sauce4': {
        background: false,
        singleRun: true,
        reporters: ['saucelabs'],
        browsers: [ 'SL_Android_4', 'SL_iOS_6' ]
      },

      'angular-1.2.0': {
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
      }
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: false,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: false,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          angular: false,
          console: false,

          /* Jasmine */
          after: false,
          afterEach: false,
          before: false,
          beforeEach: false,
          dump: false, 
          describe: false,
          ddescribe: false,
          expect: false,
          inject: false,
          it: false,
          iit: false,
          module: false
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src_test: {
        src: ['src/**/*.js', 'test/**/*.spec.js']
      }
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },

      ngtemplates: {
        files: 'src/templates/**/*.html',
        tasks: ['ngtemplates']
      },

      // src_test: {
      //   files: '<%= jshint.src_test.src %>',
      //   tasks: ['jshint:src_test', 'jasmine']
      // },
      rebuild: {
        files: testFiles.unit,
        tasks: ['jshint:src_test', 'karmangular:run', 'concat', 'uglify'],
        options: {
          // livereload: true
        }
      },
      less: {
        files: 'src/**/*.less',
        tasks: ['less']
      },

      // karma: {
      //   files: ['src/**/*.js', 'test/unit/**/*.spec.js'],
      //   tasks: ['karma:dev:run'] //NOTE the :run flag
      // },

      livereload: {
        options: { livereload: true },
        files: ['dist/**/*', 'misc/demo/**/*.html'],
      }
    },

    connect: {
      server: {
        options: {
          port: 9002,
          base: '.',
          livereload: true
        }
      }
    }
  });
  
  // These plugins provide necessary tasks.
  for (var key in grunt.file.readJSON("package.json").devDependencies) {
    if (key !== "grunt" && key.indexOf("grunt") === 0) {
      grunt.loadNpmTasks(key);
    }
  }

  // Default task.
  grunt.registerTask('default', ['clean', 'jshint', 'ngtemplates', 'karma:single', 'concat', 'uglify', 'less']);

  // Build with no testing
  grunt.registerTask('build', ['clean', 'ngtemplates', 'concat', 'uglify', 'less']);

  // Development watch task
  grunt.registerTask('dev', ['connect', 'karmangular:start', 'watch']);

  // Testing tasks
  // grunt.registerTask('test:ci', ['clean', 'jshint', 'ngtemplates', 'karma:sauce']);
  grunt.registerTask('test:ci', ['clean', 'jshint', 'ngtemplates', 'serialsauce']);

  grunt.registerTask('karmangular', 'Run tests against multiple versions of angular', function() {
    // Start karma servers
    if (this.args.length > 0) {
      var karmaOpts = grunt.config('karma');

      var angularTasks = [];
      for (var o in karmaOpts) {
        if (/^angular-/.test(o)) {
          angularTasks.push(o);
        }
      }

      if (this.args[0] === 'start') {
        angularTasks.forEach(function(t) {
          grunt.task.run('karma:' + t + ':start');
        });
      }
      else if (this.args[0] === 'run') {
        angularTasks.forEach(function(t) {
          grunt.task.run('karma:' + t + ':run');
        });
      }
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

  // Return a list of angular files for a specific version
  function angularFiles(version) {
    // Get the list of angulary files (angular.js, angular-mocks.js, etc)
    var files = grunt.file.readJSON('misc/test_lib/angular/files.json');

    // Start with our test files
    var retFiles = []; //grunt.template.process('<%= karma.options.files %>').split(",");

    files.forEach(function(f) {
      var path = ['misc', 'test_lib', 'angular', version, f].join('/');
      retFiles.push(path);
    });

    return retFiles;
  }
};
