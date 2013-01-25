/*Build file using http://gruntjs.com */

module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        lint: {
            files: [
                '../src/namespace.js',
                '../src/constants.js',
                '../src/navigation.js',
                '../src/utils.js',
                
                //filters
                '../src/filters/ngColumns.js',
                '../src/filters/checkmark.js',
                
                //services
                '../src/services/SortService.js',
                '../src/services/DomUtilityService.js',
                
                //classes
                '../src/classes/aggregate.js',
                '../src/classes/eventProvider.js',
                '../src/classes/column.js',
                '../src/classes/dimension.js',
                '../src/classes/footer.js',
                '../src/classes/rowFactory.js',
                '../src/classes/grid.js',
                '../src/classes/range.js',
                '../src/classes/row.js',
                '../src/classes/searchProvider.js',
                '../src/classes/selectionService.js',
                '../src/classes/styleProvider.js',
                
                //directives
                '../src/directives/ng-grid.js',
                '../src/directives/ng-row.js',
                '../src/directives/ng-cell.js',
                '../src/directives/ng-header-row.js',
                '../src/directives/ng-header-cell.js',
                '../src/directives/ng-viewport.js',
                '../src/directives/ng-cell-text.js',
                
                //others
                '../src/init.js'
            ],
            plugins: [
                '../plugins/ng-grid-csv-export.js',
                '../plugins/ng-grid-flexible-height.js',
                '../plugins/ng-grid-layout.js',
                '../plugins/ng-grid-reorderable.js',
                '../plugins/ng-grid-wysiwyg-export.js'
            ],
            templates: [
                '../src/templates/gridTemplate.html',
                '../src/templates/rowTemplate.html',
                '../src/templates/cellTemplate.html',
                '../src/templates/aggregateTemplate.html',
                '../src/templates/headerRowTemplate.html',
                '../src/templates/headerCellTemplate.html'
            ]
        },
        concat: {
            full: {
                src: ['<config:lint.files>'],
                dest: '../<%= pkg.name %>-<%= pkg.version %>.debug.js'
            },
            //fullWithPlugins: {
            //    src: ['<config:lint.files>', '../<%= pkg.name %>-<%= pkg.version %>.template.debug.js', '<config:lint.plugins>'],
            //    dest: '../<%= pkg.name %>-<%= pkg.version %>.plus_plugins.debug.js'
            //},
            //minWithTemplatePlugin: {
            //    src: ['../<%= pkg.name %>-<%= pkg.version %>.plus_plugins.min.js', '../<%= pkg.name %>-<%= pkg.version %>.template.debug.js'],
            //    dest: '../<%= pkg.name %>-<%= pkg.version %>.plus_plugins.min.js'
            //}
            
        },
        min: {
            fullMin: {
                src: ['<config:lint.files>'],
                dest: '../<%= pkg.name %>-<%= pkg.version %>.min.js'
            },
            //fullMinWithPlugins: {
            //    src: ['<config:lint.files>', '<config:lint.plugins>'],
            //    dest: '../<%= pkg.name %>-<%= pkg.version %>.plus_plugins.min.js'
            //},
        },
        templateBuildTask: {
            full: {
                toFile: false,
                src: ['<config:lint.templates>'],
                dest: '../<%= pkg.name %>-<%= pkg.version %>.template.debug.js',
                
            },
        },
        wrap: {
            data: {
                banner: '/***********************************************\n' +
                    '* ng-grid JavaScript Library\n' +
                    '* Authors: https://github.com/angular-ui/ng-grid/blob/master/README.md\n' +
                    '* License: MIT (http://www.opensource.org/licenses/mit-license.php)\n' +
                    '* Compiled At: <%= grunt.template.today("mm/dd/yyyy HH:MM") %>\n' +
                    '***********************************************/',
                header: '(function(window) {\n' +
                    '\'use strict\';',
                footer: '\n}(window));',
                dest: '..',
                src: [
                    '../<%= pkg.name %>-<%= pkg.version %>.debug.js',
                    //'../<%= pkg.name %>-<%= pkg.version %>.plus_plugins.min.js',
                    '../<%= pkg.name %>-<%= pkg.version %>.min.js'
                    
                ]
            }
        }
    });
    grunt.registerMultiTask('wrap', 'wrap file with header and footer', function () {
        var data = this.data,
            path = require('path'),
            banner = data.banner ? grunt.template.process(data.banner) : '',
            header = data.header || '',
            footer = data.footer || '',
            files = grunt.file.expandFiles(this.file.src),
            dest = grunt.template.process(data.dest),
            sep = grunt.utils.linefeed;

        files.forEach(function(f) {
            var p = dest + '/' + path.basename(f),
                contents = grunt.file.read(f);

            grunt.file.write(p, banner + sep + header + sep + contents + sep + footer);
            grunt.log.writeln('File "' + p + '" created.');
        });
    });

    grunt.registerMultiTask('templateBuildTask', 'Return a function that return a template representing string.', function () {
        var files = grunt.file.expandFiles(this.file.src),
            src = grunt.helper('concatTemplate', files, { separator: this.data.separator }),
            wrapTaskSettings = grunt.config('wrap');
        
        wrapTaskSettings.data.footer = src + wrapTaskSettings.data.footer || '';
        
        if (this.data.toFile) {
            grunt.file.write(this.file.dest, src);
            //notify file creation
            grunt.log.writeln('File "' + this.file.dest + '" created.');
        }
    });
    
    grunt.registerHelper('concatTemplate', function (files, options) {
        options = grunt.utils._.defaults(options || {}, {
            separator: grunt.utils.linefeed
        });
        return files ? files.map(function (filepath) {
            return grunt.task.directive(filepath, grunt.file.read)
                .replace(/(\r|\t|\n|\v|\f|\s{2,})*/gi, '') //remove newline, carriage return, tab, vertical tab, form feed, and any two consecutive whitespaces
                .replace(/'/g, '\\\'') //escape single quotes
                .replace(/<!--(.*)-->(.*)/im, '$1 = function() { return \'$2\';};') //convert comments into function name.
                .replace(/(\>)\s+(\<)/gi, '$1$2'); //remove whitespaces between element tags.
        }).join(grunt.utils.normalizelf(options.separator)) : '';
    });

    grunt.registerTask('default', 'templateBuildTask min concat wrap');

};
