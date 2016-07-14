# grunt-fontello

> donwload font icons from fontello.com

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-fontello --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-fontello');
```

## The "fontello" task

### Overview
In your project's Gruntfile, add a section named `fontello` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  fontello: {
    dist: {
      options: {
          config  : 'config.json',
          fonts   : 'output/fonts',
          styles  : 'output/css',
          scss    : true,
          force   : true
      }
    }
  },
})
```

### Options

#### options.config
Type: `String`
Default value: `config.json`

Path to your config.json file. Generate custom font icons [here](http://www.fontello.com);

#### options.zip
Type: `String`
Default value: `.`

Folder to extract the full archive.

#### options.fonts
Type: `String`
Default value: `fonts`

Path to extract font files (*.eot, *.woff, *.svg, *.ttf)

#### options.styles
Type: `String`
Default value: `css`

Path to extract css or sass files. See [options.sass](#options_sass)

#### <a id="options_scss"></a>options.scss
Type: `Boolean`
Default value: `false`

Setting this option to `true` will extract _.scss_ files instead of plain css.

#### options.force
Type: `Boolean`
Default value: `false`

By default, if the folder specified in _options.fonts_, _options.zip_ and _options.styles_ do not exist, the task will throw an error. Setting this option to `true` will create the directory structure specified.

### Example

#### Multiple Targets
```js
grunt.initConfig({
  fontello: {
    options: {
      sass: true,
      force: true
    },
    dist: {
      options: {
          fonts   : 'output/fonts',
          styles  : 'output/css',
      }
    },
    dev: {
      options: {
          config  : 'test/config.json',
          fonts   : 'test/output/fonts',
          styles  : 'test/output/css',
      }
    }
  },
})

grunt.loadNpmTasks('grunt-fontello');
grunt.registerTask('default', ['fontello:dist']);
```
## Contributing
_Shameless Confession:_ This is my very first [node](http://nodejs.org) and [grunt](http://gruntjs.com) project! contributing to this project contributes to my knowledge so please do! 

- [jubal.mabaquiao@gmail.com](jubal.mabaquiao@gmail.com)

## Release History
_(Nothing yet)_
