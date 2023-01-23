module.exports = {
    less_dist: {
        options: {
            patterns: [
                {
                    match: /..\/..\/core\/less\//g,
                    replace: './'
                }
            ]
        },
        files: [
            {
                expand: true,
                src: '<%= dist %>/release/less/*.less',
                dest: './'
            }
        ]
    }
};