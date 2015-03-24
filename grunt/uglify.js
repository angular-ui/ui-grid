module.exports = {
  options: {
    banner: '<%= banner %>'
  },
  concat: {
    src: '<%= concat.dist.dest %>',
    dest: '<%= dist %>/release/<%= pkg.name %>.min.js'
  }
};
