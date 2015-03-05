module.exports = function ( grunt ) {
  return {
    site: {
      options: {
        processContent: function (content, srcpath) {
          return grunt.template.process(content);
        }
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
  };
};
