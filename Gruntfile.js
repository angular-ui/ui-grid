// var eyes = require('eyes');
var path = require('path');
var util = require('./lib/grunt/utils.js');

/*global module:false*/
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    dist: 'dist',
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= pkg.license %> */\n',

    // Clean the temp directory
    clean: ['.tmp', '<%= dist %>', 'docs'],

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
        dest: '<%= dist %>/release/<%= pkg.name %>.js'
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
      },
      doc: {
        src: '<%= concat.dist.dest %>',
        dest: 'docs/js/<%= pkg.name %>.min.js'
      }
    },

    karma: {
      options: {
        configFile: 'test/karma.conf.js',
        files: util.angularFiles(util.latestAngular()).concat(util.testFiles.unit),
        background: true
      },
      // dev: {
      //   singleRun: false,
      //   background: true
      // },
      single: {
        background: false,
        singleRun: true,
        reporters: ['progress'],
      },

      travis: {
        background: false,
        singleRun: true,
        reporters: ['progress'],
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

          /* grunt */
          process: false,
          require: false,

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
        files: util.testFiles.unit,
        tasks: ['jshint:src_test', 'karmangular:run', 'concat', 'uglify', 'ngdocs'],
        options: {
          // livereload: true
        }
      },
      less: {
        files: 'src/**/*.less',
        tasks: ['less']
      },

      docs: {
        files: ['misc/tutorial/**/*.ngdoc', 'misc/doc/**/*'],
        tasks: 'ngdocs'
      },

      // karma: {
      //   files: ['src/**/*.js', 'test/unit/**/*.spec.js'],
      //   tasks: ['karma:dev:run'] //NOTE the :run flag
      // },

      livereload: {
        options: { livereload: true },
        files: ['dist/**/*', 'misc/demo/**/*.html', 'docs/**/*'],
      }
    },

    'gh-pages': {
      'gh-pages': {
        options: {
          base: '<%= dist %>',
          repo: 'https://github.com/angular-ui/ui-grid.info.git',
          message: 'gh-pages v<%= pkg.version %>',
          add: true
        },
        src: ['**/*']
      }
    },

    connect: {
      dev: {
        options: {
          port: process.env.DEV_PORT || 9002,
          base: '.',
          livereload: true
        }
      },
      docs: {
        options: {
          port: process.env.DOCS_PORT || 9003,
          base: '<%= dist %>/docs',
          livereload: true
        }
      }
    },

    ngdocs: {
      options: {
        dest: '<%= dist %>/docs',
        scripts: [
          '//ajax.googleapis.com/ajax/libs/angularjs/1.2.4/angular.js',
          'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.4/angular-animate.js',
          'bower_components/google-code-prettify/src/prettify.js',
          'node_modules/marked/lib/marked.js',
          '<%= concat.dist.dest %>'
        ],
        styles: [
          'misc/doc/css/prettify.css',
          'misc/doc/css/bootstrap-flatly.css',
          '<%= dist %>/ui-grid.css'
        ],
        title: 'UI Grid',
        html5Mode: false,
        analytics: {
          account: 'UA-46391685-1',
          domainName: 'ui-grid.info'
        }
      },
      api: {
        src: ['src/**/*.js'],
        title: 'API'
      },
      tutorial: {
        src: ['misc/tutorial/**/*.ngdoc'],
        title: 'Tutorial'
      }
    },

    changelog: {
      options: {
        dest: 'CHANGELOG.md',
        github: 'angular-ui/ng-grid'
      }
    }
  });
  util.updateConfig();

  grunt.loadTasks('lib/grunt');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-conventional-changelog');
  grunt.loadNpmTasks('grunt-gh-pages');

  // register before and after test tasks so we don't have to change cli
  // options on the CI server
  grunt.registerTask('before-test', ['clean', 'jshint', 'ngtemplates']);
  grunt.registerTask('after-test', ['build']);

  // Default task.
  // grunt.registerTask('default', ['clean', 'jshint', 'ngtemplates', 'karma:single', 'concat', 'uglify', 'less', 'ngdocs']);
  grunt.registerTask('default', ['before-test', 'test', 'after-test']);

  // Build with no testing
  grunt.registerTask('build', ['concat', 'uglify', 'less', 'ngdocs']);

  // Development watch task
  grunt.registerTask('dev', ['before-test', 'after-test', 'connect', 'karmangular:start', 'watch']);

  // Testing tasks
  // grunt.registerTask('test:ci', ['clean', 'jshint', 'ngtemplates', 'karma:sauce']);
  grunt.registerTask('test:ci', ['clean', 'jshint', 'ngtemplates', 'serialsauce']);

  // Test
  grunt.registerTask('test', 'Run tests on singleRun karma server', function() {
    // This task can be executed in 2 different environments: local, and Travis-CI
    if (process.env.TRAVIS) {
      grunt.task.run('karma:travis', 'serialsauce');
    } else {
      // grunt.task.run(this.args.length ? 'karma:single' : 'karma:continuous');
      grunt.task.run('karmangular');
    }
  });
  
};
