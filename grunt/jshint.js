module.exports = {
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
      
      /* Protractor */
      browser: false,

      /* Lodash */
      _: false,

      /* jquery (testing only) */
      $: false,
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
      console: false,
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
};
