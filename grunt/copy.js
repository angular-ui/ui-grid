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
    },
    less_dist: {
      files: [
        {
          expand: true,
          cwd: 'src/less',
          src: '**/*.less',
          dest: '<%= dist %>/release/src/less'
        }
      ]
    }
  };
};
