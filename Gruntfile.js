// var eyes = require('eyes');
var path = require('path');
var util = require('./lib/grunt/utils.js');

/*global module:false*/
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    version: util.getVersion(),
    stable_version: util.getStableVersion(),
    dist: 'dist',
    site: process.env.TRAVIS ? 'ui-grid.info' : '127.0.0.1:<%= connect.docs.options.port %>',
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' License: <%= pkg.license %> */\n',

    shell: {
      options: {
        stdout: true
      },
      selenium: {
        command: './selenium/start',
        options: {
          stdout: false,
          async: true
        }
      },
      'protractor-install': {
        command: 'node ./node_modules/protractor/bin/webdriver-manager update'
      },
      'protractor-start': {
        command: 'node ./node_modules/protractor/bin/webdriver-manager start',
        options: {
          stdout: true,
          async: true
        }
      },
      'bower-install': {
        command: 'bower install'
      }
    },

    // Clean the temp directory
    clean: ['.tmp', '<%= dist %>', 'docs', 'coverage'],

    // Templates
    ngtemplates: {
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
        src: ['src/js/core/bootstrap.js', 'src/js/**/*.js', 'src/features/*/js/**/*.js', '.tmp/template.js'],
        dest: '<%= dist %>/release/<%= pkg.name %>.js'
      },

      // Concat all the less files together for the customizer
      customizer_less: {
        options: {
          process: function(src, filepath) {
            // Strip import statements since we're concatting
            return src.replace(/\@import\s*.+?;/g, '');
          }
        },
        src: 'src/less/**/*.less',
        dest: '<%= dist %>/less/<%= pkg.name %>.less'
      }
    },

    less: {
      dist: {
        // paths: ['/bower_components/bootstrap'],
        files: {
          // 'dist/release/<%= pkg.name %>.css': ['src/less/main.less', 'src/features/*/less/**/*.less', '.tmp/icon/icons.data.svg.css'],
          'dist/release/<%= pkg.name %>.css': ['src/less/main.less', 'src/features/*/less/**/*.less', '.tmp/font/ui-grid-codes.css']
        }
      },
      min: {
        files: {
          // 'dist/release/<%= pkg.name %>.min.css': ['src/less/main.less', 'src/features/*/less/**/*.less', '.tmp/icon/icons.data.svg.css']
          'dist/release/<%= pkg.name %>.min.css': ['src/less/main.less', 'src/features/*/less/**/*.less', '.tmp/font/ui-grid-codes.css']
        },
        options: {
          compress: true
        }
      }
    },

    // grunticon: {
    //   icons: {
    //     files: [{
    //       expand: true,
    //       cwd: 'src/img',
    //       src: ['*.svg'],
    //       dest: '.tmp/icon'
    //     }],
    //     options: {
    //       cssprefix: '.ui-grid-icon-',
    //       colors: {
    //         'default': '#2c3e50'
    //       }
    //     }
    //   }
    // },

    fontello: {
      options: {
        sass: false
      },
      dist: {
        options: {
          config  : 'src/font/config.json',
          fonts   : 'dist/release',
          styles  : '.tmp/font',
          scss    : false
          // force   : true
        }
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      concat: {
        src: '<%= concat.dist.dest %>',
        dest: '<%= dist %>/release/<%= pkg.name %>.min.js'
      }
    },

    karma: {
      options: {
        configFile: 'test/karma.conf.js',
        files:  util.testDependencies.unit
                .concat(util.angularFiles(util.latestAngular()))
                .concat(util.testFiles.unit),
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
        reporters: ['dots'],
      }
    },

    protractor: {
      options: {
        keepAlive: true,
        configFile: "./test/protractor.conf.js"
      },
      singlerun: {
        options: {
          keepAlive: false,
          args: {
            seleniumPort: 4444,
            baseUrl: 'http://127.0.0.1:9999',
            specs: ['.tmp/doc-scenarios/**/*.spec.js', 'test/e2e/**/*.spec.js']
          }
        }
      },
      ci: {
        options: {
          keepAlive: false,
          args: {
            // seleniumAddress: 'http://localhost:4445',
            // seleniumPort: 4445,
            baseUrl: 'http://127.0.0.1:9999',
            specs: ['.tmp/doc-scenarios/**/*.spec.js', 'test/e2e/**/*.spec.js'],
            sauceUser: process.env.SAUCE_USERNAME,
            sauceKey: process.env.SAUCE_ACCESS_KEY
          }
        }
      },
      auto: {
        options: {
          keepAlive: true,
          args: {
            seleniumPort: 4444,
            baseUrl: 'http://127.0.0.1:9999',
            specs: ['.tmp/doc-scenarios/**/*.spec.js', 'test/e2e/**/*.spec.js']
          }
        }
      }
      // docs: {
      //   options: {
      //     args: {
      //       seleniumPort: 4444,
            
      //     }
      //   }
      // }
    },

    jshint: {
      options: {
        reporter: require('jshint-stylish'),

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
        debug: true, // debugger statements allowed
        globals: {
          angular: false,
          console: false,

          /* jquery (testing only) */
          $:false,
          jQuery: false,

          /* grunt */
          process: false,
          require: false,

          /* Jasmine */
          jasmine: false,
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
          module: false,
          debugger: false,
          DocumentTouch: false,
          runs: false,
          waits: false,
          waitsFor: false,
          xit: false,
          xdescribe: false,
          spyOn: false
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src_test: {
        src: ['src/**/*.js', 'src/features/*/js/**/*.js', 'src/features/*/test/**/*.spec.js', 'test/**/*.spec.js']
      }
    },

    jscs: {
      src: ['src/**/*.js', 'src/features/*/js/**/*.js', 'src/features/*/test/**/*.spec.js', 'test/**/*.spec.js'],
      options: {
        config: '.jscs.json'
      }
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },

      ngtemplates: {
        // files: ['src/templates/**/*.html', 'src/features/*/templates/**/*.html'],
        files: '<%= ngtemplates.uigrid.src %>',
        tasks: ['ngtemplates']
      },

      // src_test: {
      //   files: '<%= jshint.src_test.src %>',
      //   tasks: ['jshint:src_test', 'jasmine']
      // },
      rebuild: {
        files: util.testFiles.unit,
        // NOTE(c0bra): turn back on after render containers works
        // tasks: ['jshint:src_test', 'jscs', 'karmangular:run', 'concat', 'uglify', 'ngdocs'],
        tasks: ['jshint:src_test', 'jscs', 'concat', 'uglify', 'ngdocs'],
      },
      protractor: {
        files: ['.tmp/doc-scenarios/**/*.spec.js', 'test/e2e/**/*.spec.js'],
        tasks: ['protractor-watch:auto']
      },

      less: {
        files: 'src/**/*.less',
        tasks: ['less', 'ngdocs', 'concat:customizer_less']
      },

      // grunticon: {
      //   files: 'src/img/**/*.svg',
      //   tasks: ['grunticon', 'less']
      // },
      fontello: {
        files: 'src/font/config.json',
        tasks: ['fontello', 'less']
      },

      docs: {
        files: ['misc/tutorial/**/*.ngdoc', 'misc/api/**/*.ngdoc', 'misc/doc/**'],
        tasks: 'ngdocs'
      },

      copy: {
        files: ['misc/site/**'],
        tasks: 'copy'
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
          message: 'gh-pages v<%= version %>',
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
          hostname: '*',
          port: process.env.DOCS_PORT || 9003,
          base: '<%= dist %>',
          livereload: true
        }
      },
      testserver: {
        options: {
          port: process.env.TEST_PORT || 9999,
          base: '<%= dist %>'
        }
      }
    },

    ngdocs: {
      options: {
        dest: '<%= dist %>/docs',
        testingUrlPrefix: '<%= protractor.auto.options.args.baseUrl %>/docs/#/',
        versionedFiles: {
          default: process.env.TRAVIS ? 'unstable' : 'stable',
          waitEval: "(function() { var ret = true; try { angular.module('ui.grid'); } catch (e) { ret = false; } return ret; })()",
          versions: {
            stable: [
              { src: '/release/<%= pkg.name %>.js', type: 'script' },
              { src: '/release/<%= pkg.name %>.css', type: 'css' }
            ],
            unstable: [
              { src: '/release/<%= pkg.name %>-unstable.js', type: 'script' },
              { src: '/release/<%= pkg.name %>-unstable.css', type: 'css' }
            ]
          }
        },
        scripts: [
          '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js', // TODO(c0bra): REMOVE!
          '//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular.js',
          '//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular-touch.js',
          '//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular-animate.js',
        ],
        hiddenScripts: [
          '//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular-animate.js',
          'bower_components/google-code-prettify/src/prettify.js',
          'node_modules/marked/lib/marked.js'
        ],
        httpScripts: [
          // process.env.TRAVIS ? '/release/<%= pkg.name %>.unstable.js' : '/release/<%= pkg.name %>.js'
          // '/release/<%= pkg.name %>.js'
        ],
        styles: [
          'misc/doc/css/prettify.css',
          'misc/doc/css/bootstrap-flatly.css',
          // process.env.TRAVIS ? '<%= dist %>/release/<%= pkg.name %>.unstable.css' : '<%= dist %>/release/<%= pkg.name %>.css'
          // '<%= dist %>/release/<%= pkg.name %>.css'
        ],
        title: 'UI Grid',
        titleLink: 'http://<%= site %>',
        html5Mode: false,
        analytics: {
          account: 'UA-46391685-1',
          domainName: 'ui-grid.info'
        },
        navTemplate: 'misc/doc/templates/nav.html'
      },
      api: {
        src: ['src/**/*.js', 'misc/api/**/*.ngdoc'],
        title: 'API'
      },
      tutorial: {
        src: ['misc/tutorial/**/*.ngdoc'],
        title: 'Tutorial'
      }
    },

    copy: {
      site: {
        options: {
          processContent: grunt.template.process
        },
        files: [
          {
            expand: true,
            cwd: 'misc/site/',
            src: '**',
            dest: '<%= dist %>'
          }
        ]
      }
    },

    changelog: {
      options: {
        dest: 'CHANGELOG.md',
        github: 'angular-ui/ng-grid'
      }
    },

    'cut-release': {
      options: {
        cleanup: true,
        keepUnstable: false
      },
      dist: {
        src: '<%= dist %>/release/*.{js,css}',
        dest: '<%= dist %>/release/'
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
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-ngdocs');
  grunt.loadNpmTasks('grunt-conventional-changelog');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-shell-spawn');
  // grunt.loadNpmTasks('grunt-grunticon');
  grunt.loadNpmTasks('grunt-fontello');
  grunt.loadNpmTasks('grunt-jscs-checker');

  // grunt.renameTask('protractor', 'protractor-old');
  grunt.registerTask('protractor-watch', function () {
    var e2e = grunt.option('e2e');

    if (e2e !== false) {
      var args = '';
      if (this.args) {
        args = ':' + this.args.join(':');
      }

      grunt.task.run('protractor' + args);
    }
    else {
      grunt.log.writeln("Skipping e2e testing...");
    }
  });

  grunt.registerTask('install', ['shell:bower-install', 'shell:protractor-install']);

  // register before and after test tasks so we don't have to change cli
  // options on the CI server
  grunt.registerTask('before-test', ['clean', 'jshint', 'jscs', 'ngtemplates']); // Have to run less so CSS files are present
  grunt.registerTask('after-test', ['build']);

  // Default task.
  // grunt.registerTask('default', ['clean', 'jshint', 'ngtemplates', 'karma:single', 'concat', 'uglify', 'less', 'ngdocs']);
  grunt.registerTask('default', ['before-test', 'test', 'after-test']);

  // Build with no testing
  grunt.registerTask('build', ['ngtemplates', 'concat', 'uglify', 'fontello', 'less', 'ngdocs', 'copy']);

  // Auto-test tasks for development
  grunt.registerTask('autotest:unit', ['karmangular:start']);
  grunt.registerTask('autotest:e2e', ['shell:protractor-start']);

  // Development watch task
  grunt.registerTask('dev', function() {
    var e2e = grunt.option('e2e');

    var tasks = ['before-test', 'after-test', 'connect', 'autotest:unit', 'autotest:e2e', 'watch'];
    if (e2e === false) {
      // NOTE(c0bra): turn back on after render containers works
      // tasks = ['before-test', 'after-test', 'connect', 'autotest:unit', 'watch'];
      tasks = ['before-test', 'after-test', 'connect', 'watch'];
    }

    grunt.task.run(tasks);
  });

  // Testing tasks
  // grunt.registerTask('test:ci', ['clean', 'jshint', 'ngtemplates', 'karma:sauce']);
  grunt.registerTask('test:ci', ['clean', 'jshint', 'jscs', 'ngtemplates', 'serialsauce']);
  grunt.registerTask('test:docs', ['connect:testserver', 'protractor:docs']);
  grunt.registerTask('test:e2e', ['connect:testserver', 'protractor:singlerun']);
  grunt.registerTask('test:e2e:ci', ['clean', 'build', 'connect:testserver', 'protractor:ci']);

  // Test
  grunt.registerTask('test', 'Run tests on singleRun karma server', function() {
    // This task can be executed in 2 different environments: local, and Travis-CI
    if (process.env.TRAVIS) {
      grunt.task.run('karma:travis');
    }
    else {
      // grunt.task.run(this.args.length ? 'karma:single' : 'karma:continuous');
      grunt.task.run('karmangular');
    }
  });
  
  grunt.registerTask('release', ['clean', 'ngtemplates', 'build', 'cut-release', 'gh-pages']);
};
